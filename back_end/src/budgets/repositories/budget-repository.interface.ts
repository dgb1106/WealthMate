import { Budget } from '../entities/budget.entity';
import { CreateBudgetDto } from '../dto/create-budget.dto';
import { UpdateBudgetDto } from '../dto/update-budget.dto';

export interface BudgetRepository {
  create(userId: string, createBudgetDto: CreateBudgetDto): Promise<Budget>;
  findAll(userId: string): Promise<Budget[]>;
  findOne(id: string, userId: string): Promise<Budget>;
  update(id: string, userId: string, updateBudgetDto: UpdateBudgetDto): Promise<Budget>;
  remove(id: string, userId: string): Promise<void>;
  findByCategory(userId: string, categoryId: string): Promise<Budget[]>;
  getCurrentBudgets(userId: string): Promise<Budget[]>;
  updateSpentAmount(id: string, userId: string, amount: number): Promise<Budget>;
  incrementSpentAmount(id: string, userId: string, amount: number): Promise<Budget>;
  getCurrentMonthBudgets(userId: string): Promise<Budget[]>;
}
