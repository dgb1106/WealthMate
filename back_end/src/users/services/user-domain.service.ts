import { Injectable, BadRequestException } from '@nestjs/common';
import { User } from '../entities/users.entity';
import { UpdateUserDto } from '../dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserDomainService {
  /**
   * Validates user email format
   * @param email Email to validate
   * @returns True if email is valid
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validates phone number format
   * @param phone Phone to validate
   * @returns True if phone is valid
   */
  validatePhone(phone: string): boolean {
    // Simple validation for example purposes - adjust as needed
    return phone.length >= 10 && /^\+?[0-9]+$/.test(phone);
  }

  /**
   * Validates the update fields for a user
   * @param updateData The update data to validate
   * @throws BadRequestException if validation fails
   */
  validateUserUpdate(updateData: UpdateUserDto): void {
    if (updateData.email && !this.validateEmail(updateData.email)) {
      throw new BadRequestException('Invalid email format');
    }
    
    if (updateData.phone && !this.validatePhone(updateData.phone)) {
      throw new BadRequestException('Invalid phone number format');
    }
  }

  /**
   * Calculates the total amount by category for user's financial summary
   * @param transactions List of transactions
   * @param type Type of transaction (income or expense)
   * @returns Total amount and breakdown by category
   */
  calculateFinancialByCategory(transactions: any[], type: 'income' | 'expense'): any {
    // Use Map for better performance with large transaction lists
    const categoryMap = new Map<string, { categoryId: string; categoryName: string; amount: number }>();
    let total = 0;
    
    // Filter transactions by type and calculate totals
    transactions.forEach(tx => {
      const amount = Number(tx.amount);
      const isRelevantType = type === 'income' ? amount > 0 : amount < 0;
      
      if (isRelevantType) {
        const absAmount = Math.abs(amount);
        const categoryId = String(tx.categoryId);
        const categoryName = tx.category?.name || 'Unknown';
        
        // Using Map for O(1) lookup instead of checking object property
        if (!categoryMap.has(categoryId)) {
          categoryMap.set(categoryId, {
            categoryId,
            categoryName,
            amount: 0
          });
        }
        
        // Update category amount
        const category = categoryMap.get(categoryId)!;
        category.amount += absAmount;
        total += absAmount;
      }
    });
    
    // Convert Map to sorted array for response
    return {
      total,
      byCategory: Array.from(categoryMap.values()).sort((a, b) => b.amount - a.amount)
    };
  }
  
  /**
   * Calculates budget health status based on spending vs limits
   * @param budgets List of budgets
   * @returns Budget health status
   */
  calculateBudgetHealth(budgets: any[]): string {
    if (!budgets || budgets.length === 0) return 'NO_BUDGET';
    
    const totalSpent = budgets.reduce((sum, b) => sum + Number(b.spent_amount), 0);
    const totalLimit = budgets.reduce((sum, b) => sum + Number(b.limit_amount), 0);
    
    if (totalLimit === 0) return 'NO_BUDGET';
    
    const ratio = totalSpent / totalLimit;
    if (ratio < 0.5) return 'EXCELLENT';
    if (ratio < 0.75) return 'GOOD';
    if (ratio < 1) return 'FAIR';
    return 'OVER_BUDGET';
  }
  
  /**
   * Enriches user profile data with computed fields
   * @param user User entity
   * @returns Enhanced user profile
   */
  enrichUserProfile(user: User): any {
    const profile = user.toResponseFormat();
    
    // Add additional computed fields
    profile.fullAddress = user.getFullAddress();
    
    return profile;
  }

  async hashPassword(password: string): Promise<string> {
    // Hash password using a secure method
    const hashedPassword = await bcrypt.hash(password, 10);
    return hashedPassword;
  }
}


