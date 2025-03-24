'use client'

import React from 'react';
import { Table, Tag } from 'antd';
import { RecurringTransaction, Frequency } from '@/hooks/useTransactions';

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

  const columns = [
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Danh mục',
      dataIndex: ['category', 'name'],
      key: 'category',
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => {
        const isNegative = amount < 0;
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
      render: (frequency: Frequency) => (
        <Tag color={frequencyColors[frequency]}>
          {frequencyLabels[frequency]}
        </Tag>
      ),
    },
    {
      title: 'Lần tiếp theo',
      dataIndex: 'next_occurrence',
      key: 'next_occurrence',
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={transactions}
      rowKey="id"
      loading={loading}
      pagination={pagination}
      onRow={(record) => ({
        onClick: () => onRowClick(record),
      })}
    />
  );
};

export default RecurringTransactionTable;