'use client';

import React, { useEffect, useState } from 'react';
import { Tooltip } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import styles from './styles.module.css';

interface RecurringTransaction {
  id: string;
  userId: string;
  categoryId: string;
  categoryName: string;
  categoryType: string;
  amount: number;
  formattedAmount: number;
  frequency: string;
  frequencyDescription: string;
  created_at: string;
  next_occurence: string;
  description: string;
  daysUntilNextOccurrence: number;
  annualAmount: number;
  type: 'EXPENSE' | 'INCOME';
  upcoming_occurrences: string[];
}

const PaymentScheduleCard = () => {
  const [recurringTxs, setRecurringTxs] = useState<RecurringTransaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string>('');

  // Mapping tần suất sang tiếng Việt
  const frequencyMap: Record<string, string> = {
    'DAILY': 'Hàng ngày',
    'WEEKLY': 'Hàng tuần',
    'BIWEEKLY': 'Hai tuần một lần',
    'MONTHLY': 'Hàng tháng',
    'QUARTERLY': 'Hàng quý',
    'YEARLY': 'Hàng năm'
  };

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

  // Format ngày tháng sang định dạng tiếng Việt
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className={styles.cardWide}>
        <p>Đang tải các giao dịch định kì...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.cardWide}>
        <p>Lỗi: {error}</p>
      </div>
    );
  }

  return (
    <div className={styles.cardWide}>
      <h2 className={styles.title}>Các giao dịch định kì</h2>
      {recurringTxs.length === 0 ? (
        <p>Không có giao dịch định kì nào.</p>
      ) : (
        <div className={styles.scrollableContent}>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Mô tả</th>
                  <th>Danh mục</th>
                  <th>Số tiền</th>
                  <th>Tần suất</th>
                  <th>Lần gia hạn tiếp theo</th>
                  <th>Còn</th>
                </tr>
              </thead>
              <tbody>
                {recurringTxs.map((tx) => (
                  <tr key={tx.id} className={styles.tableRow}>
                    <td className={styles.txDescription}>{tx.description}</td>
                    <td className={styles.txCategory}>{tx.categoryName}</td>
                    <td className={`${styles.txAmount} ${tx.type === 'INCOME' ? styles.income : styles.expense}`}>
                      {tx.amount.toLocaleString('vi-VN')} VND
                    </td>
                    <td className={styles.txFrequency}>
                      {frequencyMap[tx.frequency] || tx.frequency}
                    </td>
                    <td className={styles.txNextOccurrence}>
                      <Tooltip title={
                        <div>
                          <div>Các lần sắp tới:</div>
                          <ul className={styles.upcomingList}>
                            {tx.upcoming_occurrences.map((date, index) => (
                              <li key={index}>{formatDate(date)}</li>
                            ))}
                          </ul>
                        </div>
                      }>
                        <span className={styles.dateWithIcon}>
                          {formatDate(tx.next_occurence)} <CalendarOutlined />
                        </span>
                      </Tooltip>
                    </td>
                    <td className={styles.txDaysLeft}>
                      {tx.daysUntilNextOccurrence} ngày
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentScheduleCard;
