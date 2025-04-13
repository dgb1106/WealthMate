import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaFamilyGoalRepository } from '../repositories/prisma-family-goal.repository';
import { PrismaFamilyMemberRepository } from '../repositories/prisma-family-member.repository';
import { FamilyGoal } from '../entities/family-goal.entity';
import { CreateFamilyGoalDto } from '../dto/create-family-goal.dto';
import { UpdateFamilyGoalDto } from '../dto/update-family-goal.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { GoalDomainService } from '../../goals/services/goal-domain.service';
import { ContributionType } from '../../common/enums/enum';
import { TransactionService } from '../../transactions/transactions.service';
@Injectable()
export class FamilyGoalService {
  constructor(
    private readonly familyGoalRepository: PrismaFamilyGoalRepository,
    private readonly familyMemberRepository: PrismaFamilyMemberRepository,
    private readonly prisma: PrismaService,
    private readonly goalDomainService: GoalDomainService,
    private readonly transactionService: TransactionService,
  ) {}

  async create(
    groupId: string,
    userId: string,
    createGoalDto: CreateFamilyGoalDto,
  ): Promise<FamilyGoal> {
    // Check if user is a member with appropriate permissions
    const member = await this.familyMemberRepository.findByUserAndGroup(userId, groupId);
    
    if (!member || !member.canManageBudgetsAndGoals()) {
      throw new BadRequestException('You do not have permission to create goals for this group');
    }
    
    return this.familyGoalRepository.create(groupId, userId, createGoalDto);
  }

  async findAll(groupId: string, userId: string, paginationDto?: PaginationDto): Promise<{ 
    data: FamilyGoal[], 
    total: number,
    page: number,
    limit: number,
    totalPages: number
  }> {
    // Check if user is a member of this group
    const isMember = await this.familyMemberRepository.isGroupMember(userId, groupId);
    if (!isMember) {
      throw new BadRequestException('You do not have permission to view goals for this group');
    }

    const { data, total } = await this.familyGoalRepository.findAll(
      groupId, 
      {
        page: paginationDto?.page,
        limit: paginationDto?.limit,
        includeDetails: paginationDto?.includeDetails 
      }
    );
    
    const page = paginationDto?.page || 1;
    const limit = paginationDto?.limit || 10;
    
    return {
      data,
      total,
      page,
      limit, 
      totalPages: Math.ceil(total / limit)
    };
  }

  async findOne(id: string, userId: string): Promise<FamilyGoal> {
    const goal = await this.familyGoalRepository.findOne(id);
    
    if (!goal) {
      throw new NotFoundException(`Goal with ID ${id} not found`);
    }

    // Check if user is a member of this group
    const isMember = await this.familyMemberRepository.isGroupMember(userId, goal.groupId);
    if (!isMember) {
      throw new BadRequestException('You do not have permission to view this goal');
    }

    return goal;
  }

  async update(
    id: string,
    userId: string,
    updateGoalDto: UpdateFamilyGoalDto,
  ): Promise<FamilyGoal> {
    const goal = await this.familyGoalRepository.findOne(id);
    
    if (!goal) {
      throw new NotFoundException(`Goal with ID ${id} not found`);
    }

    // The repository method already checks if the user has permission to update
    return this.familyGoalRepository.update(id, userId, updateGoalDto);
  }

  async remove(id: string, userId: string): Promise<void> {
    const goal = await this.familyGoalRepository.findOne(id);
    
    if (!goal) {
      throw new NotFoundException(`Goal with ID ${id} not found`);
    }

    // The repository method already checks if the user has permission to delete
    return this.familyGoalRepository.remove(id, userId);
  }

  async findActiveByGroup(groupId: string, userId: string): Promise<FamilyGoal[]> {
    // Check if user is a member of this group
    const isMember = await this.familyMemberRepository.isGroupMember(userId, groupId);
    if (!isMember) {
      throw new BadRequestException('You do not have permission to view goals for this group');
    }
    
    return this.familyGoalRepository.findActiveByGroup(groupId);
  }

  async getGroupGoalsSummary(groupId: string, userId: string): Promise<any> {
    // Check if user is a member of this group
    const isMember = await this.familyMemberRepository.isGroupMember(userId, groupId);
    if (!isMember) {
      throw new BadRequestException('You do not have permission to view goal summary for this group');
    }
    
    return this.familyGoalRepository.getGroupGoalsSummary(groupId);
  }

  async addFundsToGoal(
    groupId: string,
    id: string, 
    userId: string, 
    amount: number,
  ): Promise<FamilyGoal> {
    const goal = await this.familyGoalRepository.findOne(id);
      
    if (!goal) {
      throw new NotFoundException(`Goal with ID ${id} not found`);
    }

    if (goal.groupId !== groupId) {
      throw new BadRequestException(`Goal with ID ${id} does not belong to group with ID ${groupId}`);
    }
  
    // Check if user is a member of this group
    const isMember = await this.familyMemberRepository.isGroupMember(userId, goal.groupId);
    if (!isMember) {
      throw new BadRequestException('You do not have permission to add funds to this goal');
    }
  
    // Validate the funds addition
    this.goalDomainService.validateAddFunds(amount);
  
    // Create transaction and contribution in a single transaction
    return this.prisma.$transaction(async (prisma) => {
      // 1. Create a personal transaction (expense)
      const transaction = await this.transactionService.createTransaction(userId, {
        categoryId: '20', 
        amount: amount,
        description: `Thêm tiền vào mục tiêu của gia đình: ${goal.name}`,
      });
  
      // 2. Create the family contribution
      await prisma.familyTransactionContributions.create({
        data: {
          transactionId: BigInt(transaction.id),
          groupId: BigInt(goal.groupId),
          amount: amount,
          contributionType: ContributionType.GOAL,
          userId: userId,
          created_at: new Date()
        }
      });
      
      // 3. Update the goal's saved amount
      const updatedGoal = await this.familyGoalRepository.addFundsToGoal(
        id, 
        userId, 
        amount, 
      );
      
      return updatedGoal;
    });
  }

  async withdrawFundsFromGoal(
    groupId: string,
    id: string, 
    userId: string, 
    amount: number,
    description: string,
  ): Promise<FamilyGoal> {
    // First find the goal to validate
    const goal = await this.familyGoalRepository.findOne(id);
    
    if (!goal) {
      throw new NotFoundException(`Goal with ID ${id} not found`);
    }

    if (goal.groupId !== groupId) {
      throw new BadRequestException(`Goal with ID ${id} does not belong to group with ID ${groupId}`);
    }
    
    // Check permissions - admin/owner or goal creator
    const member = await this.familyMemberRepository.findByUserAndGroup(userId, goal.groupId);
    
    if (!member || (!member.isAdmin() && goal.created_by !== userId)) {
      throw new BadRequestException('You do not have permission to withdraw funds from this goal');
    }

    // Validate the withdrawal
    this.goalDomainService.validateWithdrawFunds(amount);

    // Create transaction and update goal in a single transaction
    return this.prisma.$transaction(async (prisma) => {
      // 1. Create a personal transaction (income)
      const transaction = await prisma.transactions.create({
        data: {
          userId: userId,
          categoryId: BigInt(21), // Assuming 1 is for Savings/Goal
          amount: amount, // Positive amount as it's an income
          created_at: new Date(),
          description: `Withdrawal from ${goal.name} + ${description}`,
        }
      });
      
      // 2. Create the family contribution (negative amount)
      await prisma.familyTransactionContributions.create({
        data: {
          transactionId: transaction.id,
          groupId: BigInt(goal.groupId),
          amount: amount,
          contributionType: ContributionType.GOAL,
          userId: userId,
          created_at: new Date()
        }
      });
      
      // 3. Update the goal's saved amount
      const updatedGoal = await this.familyGoalRepository.withdrawFundsFromGoal(
        id, 
        userId, 
        amount, 
      );
      
      return updatedGoal;
    });
  }
}
