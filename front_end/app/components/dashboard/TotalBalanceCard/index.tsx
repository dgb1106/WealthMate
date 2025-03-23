'use client';

import React, { useEffect, useState } from 'react';
import styles from './styles.module.css';

const TotalBalanceCard = () => {
  const [balance, setBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string>('');

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) setAuthToken(token);
  }, []);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!authToken) return;
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/users/profile`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            },
          }
        );
        if (!res.ok) {
          throw new Error('Failed to fetch user profile');
        }
        const data = await res.json();
        setBalance(data.currentBalance * 1000 || 0);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBalance();
  }, [authToken]);

  if (isLoading) {
    return (
      <div className={styles.card}>
        <p>Đang tải...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.card}>
        <p>Có lỗi xảy ra: {error}</p>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <h2 className={styles.title}>Tổng số dư</h2>
      <p className={styles.balance}>
        {balance.toLocaleString('vi-VN')} VND
      </p>
    </div>
  );
};

export default TotalBalanceCard;
