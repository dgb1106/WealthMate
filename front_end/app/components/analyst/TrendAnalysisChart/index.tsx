"use client";
import React, { useState, useEffect } from 'react';
import { Card, Spin, Empty, Statistic, Row, Col, Typography } from 'antd';
import axios from 'axios';
import styles from './styles.module.css';

const { Title } = Typography;

interface TrendDataPoint {
  year: number;
  month: number;
  monthName: string;
  totalIncome: number;
  totalExpense: number;
  net: number;
}

interface TrendAnalysisReport {
  reportType: string;
  generatedAt: string;
  period: {
    months: number;
  };
  statistics: {
    averageIncome: number;
    averageExpense: number;
    averageNet: number;
  };
  data: TrendDataPoint[];
}

const TrendAnalysisChart: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [statistics, setStatistics] = useState<{
    averageIncome: number;
    averageExpense: number;
    averageNet: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrendData = async () => {
      const token = localStorage.getItem("authToken");
      
      try {
        setLoading(true);
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/reports/trend-analysis-report`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        const result: TrendAnalysisReport = res.data;
        setStatistics(result.statistics);
      } catch (err) {
        console.error('Error fetching trend analysis data:', err);
        setError('Failed to load financial trend data');
      } finally {
        setLoading(false);
      }
    };

    fetchTrendData();
  }, []);

  if (loading) {
    return (
      <Card title="Báo cáo xu hướng tài chính" className={styles.chartCard}>
        <Spin tip="Loading trend analysis data..." />
      </Card>
    );
  }

  if (error) {
    return (
      <Card title="Báo cáo xu hướng tài chính" className={styles.chartCard}>
        <div className={styles.errorMessage}>{error}</div>
      </Card>
    );
  }

  if (!statistics) {
    return (
      <Card title="Báo cáo xu hướng tài chính" className={styles.chartCard}>
        <Empty description="No statistics available" />
      </Card>
    );
  }

  return (
    <Card 
      title="Báo cáo xu hướng tài chính" 
      className={styles.chartCard}
    >
      <div className={styles.statisticsContainer}>
        <Title level={4} className={styles.statisticsTitle}>Trung bình hàng tháng (12 tháng gần nhất)</Title>
        
        <Row gutter={[24, 24]} className={styles.statisticsRow}>
          <Col xs={24} md={8}>
            <Card className={styles.statCard} bordered={false}>
              <Statistic 
                title="Trung bình thu nhập" 
                value={statistics.averageIncome * 1000} 
                precision={0}
                suffix="đ"
                valueStyle={{ color: '#3f8600', fontSize: '24px', fontWeight: 'bold' }}
                formatter={(value) => `${value.toLocaleString()}`}
              />
            </Card>
          </Col>
          
          <Col xs={24} md={8}>
            <Card className={styles.statCard} bordered={false}>
              <Statistic 
                title="Trung bình chi tiêu" 
                value={Math.abs(statistics.averageExpense) * 1000} 
                precision={0}
                suffix="đ"
                valueStyle={{ color: '#cf1322', fontSize: '24px', fontWeight: 'bold' }}
                formatter={(value) => `${value.toLocaleString()}`}
              />
            </Card>
          </Col>
          
          <Col xs={24} md={8}>
            <Card className={styles.statCard} bordered={false}>
              <Statistic 
                title="Trung bình tiền ròng" 
                value={statistics.averageNet * 1000} 
                precision={0}
                suffix="đ"
                valueStyle={{ color: '#1890ff', fontSize: '24px', fontWeight: 'bold' }}
                formatter={(value) => `${value.toLocaleString()}`}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </Card>
  );
};

export default TrendAnalysisChart;