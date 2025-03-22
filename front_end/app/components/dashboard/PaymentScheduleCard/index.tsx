'use client';

import React, { useEffect, useState } from 'react';
import styles from './styles.module.css';

interface RecurringTransaction {
  id: number;
  name: string;
  amount: number;
  schedule: string;
}

const PaymentScheduleCard = () => {
  const [recurringTxs, setRecurringTxs] = useState<RecurringTransaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string>('');

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) setAuthToken(token);
  }, []);

  useEffect(() => {
    const fetchRecurring = async () => {
      if (!authToken) return;
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/recurring-transactions`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
        if (!res.ok) {
          throw new Error('Failed to fetch recurring transactions');
        }
        const data = await res.json();
        setRecurringTxs(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecurring();
  }, [authToken]);

  if (isLoading) {
    return (
      <div className={styles.card}>
        <p>Đang tải các giao dịch định kì...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.card}>
        <p>Lỗi: {error}</p>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <h2 className={styles.title}>Các giao dịch định kì</h2>
      {recurringTxs.length === 0 ? (
        <p>Không có giao dịch định kì nào.</p>
      ) : (
        <ul className={styles.list}>
          {recurringTxs.map((tx) => (
            <li key={tx.id} className={styles.listItem}>
              <div className={styles.txName}>{tx.name}</div>
              <div className={styles.txAmount}>
                {tx.amount.toLocaleString('vi-VN')} VND
              </div>
              <div className={styles.txSchedule}>{tx.schedule}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PaymentScheduleCard;
