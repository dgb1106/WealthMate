import { FamilyTransactionContribution } from '../entities/family-transaction-contribution.entity';
import { CreateFamilyTransactionContributionDto } from '../dto/create-family-transaction-contribution.dto';

export interface FamilyTransactionContributionRepository {
  create(userId: string, createContributionDto: CreateFamilyTransactionContributionDto): Promise<FamilyTransactionContribution>;
  findAll(groupId: string): Promise<FamilyTransactionContribution[]>;
  findByTransaction(transactionId: string): Promise<FamilyTransactionContribution[]>;
  findByTarget(targetId: string, contributionType: string): Promise<FamilyTransactionContribution[]>;
  findByUser(userId: string, groupId: string): Promise<FamilyTransactionContribution[]>;
  remove(id: string, userId: string): Promise<void>;
  getGroupContributionStats(groupId: string): Promise<any>;
}
