export interface Budget {
    id: string;
    userId: string;
    category: string;
    amount: number;
    spent: number;
    period: 'monthly' | 'yearly';
    startDate: string;
    endDate: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface BudgetFormData {
    category: string;
    amount: number;
    period: 'monthly' | 'yearly';
    startDate: string;
    endDate: string;
  }
  
  export type BudgetAction =
    | { type: 'SET_BUDGETS'; payload: Budget[] }
    | { type: 'ADD_BUDGET'; payload: Budget }
    | { type: 'UPDATE_BUDGET'; payload: Budget }
    | { type: 'DELETE_BUDGET'; payload: string }
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_ERROR'; payload: string | null };