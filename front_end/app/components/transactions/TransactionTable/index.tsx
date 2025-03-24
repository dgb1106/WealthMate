'use client'
import React from 'react';
import { Table } from 'antd';
import styles from './styles.module.css';
import dayjs from 'dayjs';
import { Transaction } from '@/hooks/useTransactions';

interface TransactionTableProps {
  transactions: Transaction[];
  loading: boolean;
  onRowClick: (transaction: Transaction) => void;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
}

const TransactionTable: React.FC<TransactionTableProps> = ({ 
  transactions, 
  loading, 
  onRowClick,
  pagination
}) => {
  const columns = [
    {
      title: 'Ngày',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text: string) => dayjs(text).format('DD MMM'),
    },
    {
      title: 'Lượng tiền',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => {
        const adjustedAmount = amount * 1000;
        const formattedAmount = new Intl.NumberFormat('en-US').format(Math.abs(adjustedAmount));
        return <span className={adjustedAmount < 0 ? styles.negativeAmount : styles.positiveAmount}>
          {adjustedAmount < 0 ? '-' : '+'}{formattedAmount}
        </span>;
      },
    },
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
  ];

  return (
    <Table 
      dataSource={transactions} 
      columns={columns} 
      rowKey="id" 
      loading={loading}
      pagination={pagination}
      className={styles.tableContainer}
      onRow={(record) => ({
        onClick: () => onRowClick(record),
        style: { cursor: 'pointer' }
      })}
    />
  );
};

export default TransactionTable;