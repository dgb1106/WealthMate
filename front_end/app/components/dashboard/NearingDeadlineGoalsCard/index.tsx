'use client';

import React, { useState, useEffect } from 'react';
import { Card, Table, Typography, Spin } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import styles from './styles.module.css';

interface Goal {
  id: string;
  name: string;
  remainingAmount: number;
  daysRemaining: number;
}

const NearingDeadlineGoalsCard: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNearingDeadlineGoals = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/goals/nearing-deadline`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch nearing deadline goals');
        }

        const data = await response.json();
        setGoals(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch nearing deadline goals:', error);
        setGoals([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNearingDeadlineGoals();
  }, []);

  return (
    <Card 
      title={
        <div className={styles.cardTitle}>
          <ClockCircleOutlined className={styles.titleIcon} />
          <Typography.Text strong>Mục tiêu sắp đến hạn</Typography.Text>
        </div>
      }
      className={styles.card}
    >
      {loading ? (
        <div className={styles.loadingContainer}>
          <Spin tip="Đang tải..." />
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <Table 
            dataSource={goals}
            columns={[
              {
                title: 'Tên mục tiêu',
                dataIndex: 'name',
                key: 'name',
                ellipsis: true,
              },
              {
                title: 'Số tiền còn thiếu',
                dataIndex: 'remainingAmount',
                key: 'remainingAmount',
                render: (amount) => new Intl.NumberFormat('vi-VN', { 
                  style: 'currency', 
                  currency: 'VND',
                  maximumFractionDigits: 0
                }).format(amount * 1000),
              },
              {
                title: 'Thời gian còn lại',
                dataIndex: 'daysRemaining',
                key: 'daysRemaining',
                render: (days) => `${days} ngày`,
                sorter: (a, b) => a.daysRemaining - b.daysRemaining,
                defaultSortOrder: 'ascend',
              },
            ]}
            pagination={false}
            rowKey="id"
            size="small"
          />
        </div>
      )}
    </Card>
  );
};

export default NearingDeadlineGoalsCard;