import React from 'react';
import { Table, Button } from 'antd';
import dayjs from 'dayjs';
import { RedoOutlined } from '@ant-design/icons';
import styles from './styles.module.css';

interface Investment {
  id: string;
  description: string;
  amount: number;
  created_at: string;
  category: {
    id: string;
    name: string;
  };
}

interface InvestmentTableProps {
  investments: Investment[];
  loading: boolean;
  onRowClick: (investment: Investment) => void;
  onReinvest: (investment: Investment) => void;
}

const InvestmentTable: React.FC<InvestmentTableProps> = ({
  investments,
  loading,
  onRowClick,
  onReinvest
}) => {
  const columns = [
    {
      title: 'Ngày',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text: string) => dayjs(text).format('DD/MM/YYYY'),
      sorter: (a: Investment, b: Investment) => 
        dayjs(a.created_at).unix() - dayjs(b.created_at).unix(),
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
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right' as const,
      render: (amount: number) => {
        const formattedAmount = Math.abs(amount * 1000).toLocaleString('vi-VN');
        return (
          <span style={{ color: amount < 0 ? '#f5222d' : '#52c41a' }}>
            {formattedAmount} ₫
          </span>
        );
      },
      sorter: (a: Investment, b: Investment) => a.amount - b.amount,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: Investment) => (
        <Button
          type="primary"
          icon={<RedoOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            onReinvest(record);
          }}
        >
          Tái đầu tư
        </Button>
      ),
    },
  ];

  return (
    <div className={styles.tableContainer}>
      <Table
        columns={columns}
        dataSource={investments}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
        className={styles.table}
        onRow={(record) => ({
          onClick: () => onRowClick(record),
        })}
      />
    </div>
  );
};

export default InvestmentTable;