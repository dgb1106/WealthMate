'use client'
import React from 'react';
import { Card, Table } from 'antd';
import styles from './styles.module.css';

interface HighInterestLoan {
  id: string;
  name: string;
  interest_rate: number;
}

interface Props {
  loans: HighInterestLoan[];
  loading?: boolean;
}

const HighInterestLoanTable: React.FC<Props> = ({ loans, loading }) => {
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
  ];

  return (
    <Card className={styles.card}>
      <div className={styles.header}>
        <p>Khoản vay lãi suất cao</p>
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

export default HighInterestLoanTable;