import { API_URL } from '@/utils/constants';
import type { Transaction, TransactionFormData } from '@/types/transaction';

export const transactionService = {
  getAll: async (): Promise<Transaction[]> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/transactions`, {
      credentials: 'include'
    });
    if (!response.ok) {
      throw new Error('Failed to fetch transactions');
    }
    return response.json();
  },

  create: async (data: TransactionFormData): Promise<Transaction> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include'
    });
    if (!response.ok) {
      throw new Error('Failed to create transaction');
    }
    return response.json();
  },

  update: async (id: string, data: TransactionFormData): Promise<Transaction> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/transactions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include'
    });
    if (!response.ok) {
      throw new Error('Failed to update transaction');
    }
    return response.json();
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/transactions/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    if (!response.ok) {
      throw new Error('Failed to delete transaction');
    }
  },
};