'use client'
import React from 'react';
import { Card, Table } from 'antd';
import styles from './styles.module.css';

interface PaymentPriority {
  id: string;
  name: string;
  interest_rate: number;
  monthly_interest: number;
}

interface Props {
  loans: PaymentPriority[];
  loading?: boolean;
}

const PaymentPriorityTable: React.FC<Props> = ({ loans, loading }) => {
  const columns = [
    {
      title: 'Tên khoản vay',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Lãi suất (%)',
      dataIndex: 'interest_rate',
      key: 'interest_rate',
      render: (rate: number) => `${rate.toFixed(2)}%`,
    },
    {
      title: 'Lãi hàng tháng',
      dataIndex: 'monthly_interest',
      key: 'monthly_interest',
      render: (amount: number) => new Intl.NumberFormat('vi-VN').format(amount) + ' VND',
    },
  ];

  return (
    <Card className={styles.card}>
      <div className={styles.header}>
        <p>Ưu tiên thanh toán</p>
      </div>
      <div className={styles.body}>
        <Table
          dataSource={loans}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={false}
          size="small"
          className={styles.tableContainer}
          scroll={{ y: 200 }}
        />
      </div>
    </Card>
  );
};

export default PaymentPriorityTable;