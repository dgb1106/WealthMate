import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaFamilyTransactionContributionRepository } from '../repositories/prisma-family-transaction-contribution.repository';
import { PrismaFamilyMemberRepository } from '../repositories/prisma-family-member.repository';
import { FamilyTransactionContribution } from '../entities/family-transaction-contribution.entity';
import { CreateFamilyTransactionContributionDto } from '../dto/create-family-transaction-contribution.dto';

@Injectable()
export class FamilyTransactionContributionService {
  constructor(
    private readonly familyTransactionContributionRepository: PrismaFamilyTransactionContributionRepository,
    private readonly familyMemberRepository: PrismaFamilyMemberRepository,
  ) {}

  async create(
    userId: string,
    createContributionDto: CreateFamilyTransactionContributionDto,
  ): Promise<FamilyTransactionContribution> {
    // Check if user is a member of this group
    const isMember = await this.familyMemberRepository.isGroupMember(
      userId, 
      createContributionDto.groupId
    );
    
    if (!isMember) {
      throw new BadRequestException('You are not a member of this group');
    }
    
    // The repository method already handles transaction validation and updating targets
    return this.familyTransactionContributionRepository.create(userId, createContributionDto);
  }

  async findAll(groupId: string, userId: string): Promise<FamilyTransactionContribution[]> {
    // Check if user is a member of this group
    const isMember = await this.familyMemberRepository.isGroupMember(userId, groupId);
    if (!isMember) {
      throw new BadRequestException('You do not have permission to view contributions for this group');
    }
    
    return this.familyTransactionContributionRepository.findAll(groupId);
  }

  async findByTransaction(transactionId: string, userId: string): Promise<FamilyTransactionContribution[]> {
    // The user should only be able to see contributions for transactions they own
    // or for groups they are a member of
    const contributions = await this.familyTransactionContributionRepository.findByTransaction(transactionId);
    
    if (contributions.length === 0) {
      return [];
    }

    // If the transaction belongs to the user, they can see contributions
    if (contributions[0].transaction?.userId === userId) {
      return contributions;
    }

    // Otherwise, check if they're a member of the group
    const isMember = await this.familyMemberRepository.isGroupMember(
      userId, 
      contributions[0].groupId
    );
    
    if (!isMember) {
      throw new BadRequestException('You do not have permission to view these contributions');
    }

    return contributions;
  }

  async findByUser(userId: string, groupId: string): Promise<FamilyTransactionContribution[]> {
    // Check if user is a member of this group
    const isMember = await this.familyMemberRepository.isGroupMember(userId, groupId);
    if (!isMember) {
      throw new BadRequestException('You do not have permission to view contributions for this group');
    }
    
    return this.familyTransactionContributionRepository.findByUser(userId, groupId);
  }

  async remove(id: string, userId: string): Promise<void> {
    // The repository method already handles permission checks
    return this.familyTransactionContributionRepository.remove(id, userId);
  }

  async getGroupContributionStats(groupId: string, userId: string): Promise<any> {
    // Check if user is a member of this group
    const isMember = await this.familyMemberRepository.isGroupMember(userId, groupId);
    if (!isMember) {
      throw new BadRequestException('You do not have permission to view contribution stats for this group');
    }
    
    return this.familyTransactionContributionRepository.getGroupContributionStats(groupId);
  }
}
