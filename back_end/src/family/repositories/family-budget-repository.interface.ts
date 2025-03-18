import { FamilyBudget } from '../entities/family-budget.entity';
import { CreateFamilyBudgetDto } from '../dto/create-family-budget.dto';
import { UpdateFamilyBudgetDto } from '../dto/update-family-budget.dto';

export interface FamilyBudgetRepository {
  create(groupId: string, userId: string, createBudgetDto: CreateFamilyBudgetDto): Promise<FamilyBudget>;
  findAll(groupId: string): Promise<FamilyBudget[]>;
  findOne(id: string): Promise<FamilyBudget | null>;
  update(id: string, userId: string, updateBudgetDto: UpdateFamilyBudgetDto): Promise<FamilyBudget>;
  remove(id: string, userId: string): Promise<void>;
  findActiveByGroup(groupId: string): Promise<FamilyBudget[]>;
  findByCategory(groupId: string, categoryId: string): Promise<FamilyBudget[]>;
  incrementSpentAmount(id: string, amount: number): Promise<FamilyBudget>;
  getGroupBudgetSummary(groupId: string): Promise<any>;
}
