'use client'
import React from 'react';
import { Table } from 'antd';
import styles from './styles.module.css';
import dayjs from 'dayjs';

interface TransactionTableProps {
  transactions: {
    id: string;
    created_at: string;
    amount: number;
    description: string;
    category: {
      name: string;
    };
  }[];
  loading: boolean;
  onRowClick: (record: any) => void;
}

const TransactionTable: React.FC<TransactionTableProps> = ({ transactions, loading, onRowClick }) => {
  const columns = [
    {
      title: 'Ngày',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text: string) => dayjs(text).format('DD MMM'), // Specify type for text
    },
    {
      title: 'Lượng tiền',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => { // Specify type for amount
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
      pagination={false}
      className={styles.tableContainer}
      onRow={(record) => ({
        onClick: () => onRowClick(record),
        style: { cursor: 'pointer' }
      })}
    />
  );
};

export default TransactionTable;