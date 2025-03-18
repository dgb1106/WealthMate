import { FamilyTransactionContribution } from '../entities/family-transaction-contribution.entity';
import { CreateFamilyTransactionContributionDto } from '../dto/create-family-transaction-contribution.dto';

export interface FamilyTransactionContributionRepository {
  create(userId: string, createContributionDto: CreateFamilyTransactionContributionDto): Promise<FamilyTransactionContribution>;
  findAll(groupId: string): Promise<FamilyTransactionContribution[]>;
  findOne(id: string): Promise<FamilyTransactionContribution | null>;
  findByUser(userId: string, groupId: string): Promise<FamilyTransactionContribution[]>;
  findByTransaction(transactionId: string, userId: string): Promise<FamilyTransactionContribution[]>;
  remove(id: string): Promise<void>;
  getGroupContributionStats(groupId: string): Promise<any>;
}
