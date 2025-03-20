import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { FamilyTransactionContribution } from '../entities/family-transaction-contribution.entity';
import { CreateFamilyTransactionContributionDto } from '../dto/create-family-transaction-contribution.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { PrismaFamilyMemberRepository } from '../repositories/prisma-family-member.repository';
import { PrismaFamilyTransactionContributionRepository } from '../repositories/prisma-family-transaction-contribution.repository';

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
      throw new BadRequestException('You do not have permission to add contributions to this group');
    }

    return this.familyTransactionContributionRepository.create(userId, createContributionDto);
  }

  async findAll(groupId: string, paginationDto?: PaginationDto): Promise<{ 
    data: FamilyTransactionContribution[], 
    total: number,
    page: number,
    limit: number,
    totalPages: number
  }> {
    const { data, total } = await this.familyTransactionContributionRepository.findAll(
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

  async findByTransaction(transactionId: string, userId: string): Promise<FamilyTransactionContribution[]> {
    return this.familyTransactionContributionRepository.findByTransaction(transactionId, userId);
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
    const contribution = await this.familyTransactionContributionRepository.findOne(id);
    
    if (!contribution) {
      throw new NotFoundException(`Contribution with ID ${id} not found`);
    }

    // Check if user is a member of this group with admin rights or the creator of the contribution
    const member = await this.familyMemberRepository.findByUserAndGroup(userId, contribution.groupId);
    
    if (!member || (!member.isAdmin() && contribution.transaction?.userId !== userId)) {
      throw new BadRequestException('You do not have permission to delete this contribution');
    }
    
    return this.familyTransactionContributionRepository.remove(id);
  }

  async getGroupContributionStats(groupId: string, userId: string): Promise<any> {
    // Check if user is a member of this group
    const isMember = await this.familyMemberRepository.isGroupMember(userId, groupId);
    if (!isMember) {
      throw new BadRequestException('You do not have permission to view stats for this group');
    }
    
    return this.familyTransactionContributionRepository.getGroupContributionStats(groupId);
  }
}
