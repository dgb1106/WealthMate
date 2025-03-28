import { FamilyGoal } from '../entities/family-goal.entity';
import { CreateFamilyGoalDto } from '../dto/create-family-goal.dto';
import { UpdateFamilyGoalDto } from '../dto/update-family-goal.dto';

export interface FamilyGoalRepository {
  create(groupId: string, userId: string, createGoalDto: CreateFamilyGoalDto): Promise<FamilyGoal>;
  findAll(groupId: string, options?: { page?: number, limit?: number, includeDetails?: boolean }): Promise<{ data: FamilyGoal[], total: number }>;
  findOne(id: string): Promise<FamilyGoal | null>;
  update(id: string, userId: string, updateGoalDto: UpdateFamilyGoalDto): Promise<FamilyGoal>;
  remove(id: string, userId: string): Promise<void>;
  findActiveByGroup(groupId: string): Promise<FamilyGoal[]>;
  incrementSavedAmount(id: string, amount: number): Promise<FamilyGoal>;
  getGoalSummary(id: string): Promise<any>;
  getGroupGoalsSummary(groupId: string): Promise<any>;
  addFundsToGoal(id: string, userId: string, amount: number, transactionId?: string): Promise<FamilyGoal>;
  withdrawFundsFromGoal(id: string, userId: string, amount: number, transactionId?: string): Promise<FamilyGoal>;
}
