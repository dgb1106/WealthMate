import { User } from "../../users/entities/user.entity";
import { Category } from "../../categories/entities/categories.entity";
import { Exclude, Type } from 'class-transformer';

export class Budget {
  id: string;
  
  userId: string;
  
  @Type(() => User)
  user?: User;
  
  categoryId: String;
  
  @Type(() => Category)
  category?: Category;
  
  limit_amount: number;
  spent_amount: number;
  start_date: Date;
  end_date: Date;
  
  constructor(partial: Partial<Budget>) {
    Object.assign(this, partial);
  }
}