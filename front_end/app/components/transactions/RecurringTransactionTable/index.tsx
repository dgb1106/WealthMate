'use client'

import React from 'react';
import { Table, Tag, Tooltip } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import { Frequency } from '@/hooks/useTransactions';
import styles from './styles.module.css';

// Cập nhật interface để khớp với dữ liệu API thực tế
interface RecurringTransaction {
  id: string;
  userId?: string;
  categoryId?: string;
  amount: number;
  description: string;
  frequency: Frequency;
  start_date: string;
  end_date?: string;
  next_occurrence?: string;
  next_occurence?: string; // Hỗ trợ cả hai cách viết (API trả về occurence)
  categoryName?: string;
  category?: {
    id: string;
    name: string;
  };
  categoryType?: string;
  frequencyDescription?: string;
  daysUntilNextOccurrence?: number;
  annualAmount?: number;
  type?: 'EXPENSE' | 'INCOME';
  upcoming_occurrences?: string[];
}

interface RecurringTransactionTableProps {
  transactions: RecurringTransaction[];
  loading: boolean;
  onRowClick: (transaction: RecurringTransaction) => void;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
}

const frequencyColors = {
  [Frequency.DAILY]: 'magenta',
  [Frequency.WEEKLY]: 'red',
  [Frequency.BIWEEKLY]: 'volcano',
  [Frequency.MONTHLY]: 'orange',
  [Frequency.QUARTERLY]: 'green',
  [Frequency.YEARLY]: 'blue',
};

const frequencyLabels = {
  [Frequency.DAILY]: 'Hằng ngày',
  [Frequency.WEEKLY]: 'Hằng tuần',
  [Frequency.BIWEEKLY]: 'Hai tuần/lần',
  [Frequency.MONTHLY]: 'Hằng tháng',
  [Frequency.QUARTERLY]: 'Hằng quý',
  [Frequency.YEARLY]: 'Hằng năm',
};

const RecurringTransactionTable: React.FC<RecurringTransactionTableProps> = ({
  transactions,
  loading,
  onRowClick,
  pagination,
}) => {
  // Hàm định dạng tiền tệ trực tiếp trong component
  const formatCurrencyDirectly = (value: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value).replace(/\s/g, '');
  };

  // Format ngày tháng sang định dạng tiếng Việt
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const columns = [
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Danh mục',
      key: 'category',
      render: (record: RecurringTransaction) => {
        return record.categoryName || (record.category && record.category.name) || '';
      },
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number, record: RecurringTransaction) => {
        const isNegative = amount < 0 || record.type === 'EXPENSE';
        return (
          <span style={{ color: isNegative ? '#ff4d4f' : '#52c41a' }}>
            {formatCurrencyDirectly(Math.abs(amount))}
          </span>
        );
      },
    },
    {
      title: 'Tần suất',
      dataIndex: 'frequency',
      key: 'frequency',
      render: (frequency: Frequency, record: RecurringTransaction) => (
        <Tag color={frequencyColors[frequency]}>
          {record.frequencyDescription || frequencyLabels[frequency] || frequency}
        </Tag>
      ),
    },
    {
      title: 'Lần gia hạn tiếp theo',
      key: 'next_occurrence',
      render: (record: RecurringTransaction) => {
        const nextDate = record.next_occurence || record.next_occurrence;
        
        // Hiển thị tooltip nếu có upcoming_occurrences
        if (record.upcoming_occurrences && record.upcoming_occurrences.length > 0) {
          return (
            <Tooltip title={
              <div>
                <div>Các lần sắp tới:</div>
                <ul className={styles.upcomingList}>
                  {record.upcoming_occurrences.map((date, index) => (
                    <li key={index}>{formatDate(date)}</li>
                  ))}
                </ul>
              </div>
            }>
              <span className={styles.dateWithIcon}>
                {formatDate(nextDate)} <CalendarOutlined />
              </span>
            </Tooltip>
          );
        }
        
        return formatDate(nextDate);
      },
    },
    {
      title: 'Còn',
      key: 'daysLeft',
      render: (record: RecurringTransaction) => {
        if (record.daysUntilNextOccurrence !== undefined) {
          return `${record.daysUntilNextOccurrence} ngày`;
        }
        return '';
      },
    },
  ];

  const handleRowClick = (record: RecurringTransaction) => {
    try {
      if (!record.id) {
        console.error("Transaction record is missing ID");
        return;
      }
      
      // Đảm bảo khả năng tương thích với cả hai cách viết next_occurrence/next_occurence
      const transaction = {
        ...record,
        next_occurrence: record.next_occurence || record.next_occurrence || new Date().toISOString(),
        start_date: record.start_date || new Date().toISOString(),
        category: record.category || { 
          id: record.categoryId || '', 
          name: record.categoryName || '' 
        }
      };
      
      onRowClick(transaction);
    } catch (error) {
      console.error("Error handling row click:", error);
    }
  };

  return (
    <Table
      columns={columns}
      dataSource={transactions}
      rowKey="id"
      loading={loading}
      pagination={pagination}
      className={styles.tableContainer}
      onRow={(record) => ({
        onClick: () => handleRowClick(record),
        style: { cursor: 'pointer' }
      })}
    />
  );
};

export default RecurringTransactionTable;