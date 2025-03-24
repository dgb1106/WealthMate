"use client";
import React, { useState, useEffect } from 'react';
import { Card, Spin, Typography } from "antd";
import axios from 'axios';
import styles from './styles.module.css';

const { Title, Paragraph } = Typography;

const AIAssistantButton = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [forecastAmount, setForecastAmount] = useState<number | null>(null);

  useEffect(() => {
    const fetchForecast = async () => {
      const token = localStorage.getItem("authToken");
      
      try {
        setLoading(true);
        const incomeResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/reports/income-expense-monthly/ytd`,
          {
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
          }
        );
        const monthlyData = incomeResponse.data.data;
        const latestMonth = monthlyData[monthlyData.length - 1];
        const income = latestMonth.totalIncome || 0;

        console.log("Income value before API call:", income);
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/ai-utils/expense-forecast?income=${income * 1000}&interestRate=4&inflationRate=3.2&holidays=0`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            transformResponse: [(data) => {
              // Parse raw response (assuming it's a plain number)
              return parseFloat(data);
            }]
          }
        );
        
        // If the response is just a number
        setForecastAmount(res.data);
        console.log("Forecast amount:", res.data);
      } catch (err) {
        console.error('Error fetching expense forecast:', err);
        setError('Failed to load expense forecast');
      } finally {
        setLoading(false);
      }
    };

    fetchForecast();
  }, []);

  if (loading) {
    return (
      <Card className={styles.forecastCard}>
        <div className={styles.loadingContainer}>
          <Spin tip="Đang phân tích dữ liệu..." />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={styles.forecastCard}>
        <div className={styles.errorContainer}>
          <Title level={4}>Dự báo chi tiêu</Title>
          <Paragraph className={styles.errorMessage}>{error}</Paragraph>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      title="Dự báo chi tiêu" 
      className={styles.forecastCard}
    >
      <div>
        <div className={styles.amountContainer}>
          <Paragraph className={styles.forecastLabel}>
            Dự báo chi tiêu tháng tới:
          </Paragraph>
          <Title level={2} className={styles.forecastAmount}>
            {forecastAmount !== null && !isNaN(forecastAmount) ? 
              new Intl.NumberFormat('vi-VN', { 
                style: 'currency', 
                currency: 'VND' 
              }).format(forecastAmount) : 
              "Không có dữ liệu"
            }
          </Title>
        </div>
      </div>
    </Card>
  );
};

export default AIAssistantButton;