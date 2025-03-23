"use client";
import React, { useState, useEffect } from 'react';
import { Card, Spin, Typography } from "antd";
import axios from 'axios';
import styles from './styles.module.css';

const { Title, Paragraph } = Typography;

interface ExpenseForecast {
  forecastAmount: number;
  message: string;
  confidence: number;
}

const AIAssistantButton = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [forecast, setForecast] = useState<ExpenseForecast | null>(null);

  useEffect(() => {
    const fetchForecast = async () => {
      const token = localStorage.getItem("authToken");
      
      try {
        setLoading(true);
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/ai-utils/expense-forecast`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        setForecast(res.data);
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
      {forecast && (
        <div>
          <div className={styles.amountContainer}>
            <Title level={2} className={styles.forecastAmount}>
              {new Intl.NumberFormat('vi-VN', { 
                style: 'currency', 
                currency: 'VND' 
              }).format(forecast.forecastAmount)}
            </Title>
          </div>
          <Paragraph className={styles.forecastMessage}>
            {forecast.message}
          </Paragraph>
          <div className={styles.confidenceContainer}>
            <span className={styles.confidenceLabel}>Độ tin cậy:</span>
            <span className={styles.confidenceValue}>{forecast.confidence}%</span>
          </div>
        </div>
      )}
    </Card>
  );
};

export default AIAssistantButton;