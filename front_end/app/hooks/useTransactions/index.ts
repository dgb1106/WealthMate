'use client'

import { useState, useEffect } from 'react';
import type { Transaction } from '../../types/transaction';
import { transactionService } from '../../services/transactionService';

interface UseTransactionsReturn {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
}

export const useTransactions = (): UseTransactionsReturn => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async (): Promise<void> => {
      try {
        const data = await transactionService.getAll();
        setTransactions(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  return { transactions, loading, error, setTransactions };
};