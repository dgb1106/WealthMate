import type { Budget, BudgetFormData } from '@/types/budget';

export const budgetService = {
  getAll: async (): Promise<Budget[]> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/budgets`, {
      credentials: 'include'
    });
    if (!response.ok) {
      throw new Error('Failed to fetch budgets');
    }
    return response.json();
  },

  create: async (data: BudgetFormData): Promise<Budget> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/budgets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include'
    });
    if (!response.ok) {
      throw new Error('Failed to create budget');
    }
    return response.json();
  },

  update: async (id: string, data: BudgetFormData): Promise<Budget> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/budgets/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include'
    });
    if (!response.ok) {
      throw new Error('Failed to update budget');
    }
    return response.json();
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/budgets/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    if (!response.ok) {
      throw new Error('Failed to delete budget');
    }
  },
};