'use client';

import React, { useEffect, useState } from 'react';
import styles from './styles.module.css';

const UserGreetingCard = () => {
  const [name, setName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string>('');

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) setAuthToken(token);
  }, []);

  useEffect(() => {
    const fetchUserName = async () => {
      if (!authToken) return;
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/profile`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          }
        });
        if (!res.ok) {
          throw new Error('Failed to fetch user profile');
        }
        const data = await res.json();
        setName(data.name || 'User');
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserName();
  }, [authToken]);

  if (isLoading) {
    return <div className={styles.card}>Đang tải...</div>;
  }
  if (error) {
    return <div className={styles.card}>Lỗi: {error}</div>;
  }

  return (
    <div className={styles.card}>
      <h2 className={styles.title}>Xin chào, {name}!</h2>
      <p className={styles.subtitle}>Chúc bạn một ngày tốt lành</p>
    </div>
  );
};

export default UserGreetingCard;
