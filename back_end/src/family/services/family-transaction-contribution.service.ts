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
      throw new BadRequestException('You do not have permission to add contributions to this group');
    }

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
