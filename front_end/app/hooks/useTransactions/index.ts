<<<<<<< HEAD
'use client'

import { useState, useEffect } from 'react';
import type { Transaction } from '../../types/transaction';
import { transactionService } from '../../services/transactionService';
=======
import { useState, useEffect } from 'react';
import { transactionService } from '../../services/transactionService';
import type { Transaction } from '../../types/transaction';
>>>>>>> 4265faa45cf72565b374b1d9019bc50bc0376657

interface UseTransactionsReturn {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
<<<<<<< HEAD
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
=======
>>>>>>> 4265faa45cf72565b374b1d9019bc50bc0376657
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

<<<<<<< HEAD
  return { transactions, loading, error, setTransactions };
};
=======
  return { transactions, loading, error };
}; 
>>>>>>> 4265faa45cf72565b374b1d9019bc50bc0376657
