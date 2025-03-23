"use client";
import React, { useState, useEffect } from 'react';
import { Card, Spin } from 'antd';
import { Line } from '@ant-design/charts';
import axios from 'axios';
import styles from './styles.module.css';

interface CashFlowData {
  year: number;
  month: number;
  monthName: string;
  totalIncome: number;
  totalExpense: number;
  net: number;
}

interface CashFlowReport {
  reportType: string;
  generatedAt: string;
  period: {
    months: number;
  };
  data: CashFlowData[];
}

const CashFlowTrendChart: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<CashFlowData[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCashFlowData = async () => {
      const token = localStorage.getItem("authToken");
      
      try {
        setLoading(true);
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/reports/cash-flow-report`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        const result: CashFlowReport = res.data;
        
        // Generate full 12 months of data
        const fullYearData: CashFlowData[] = generateFullYearData(result.data);
        
        setData(fullYearData);
      } catch (err) {
        console.error('Error fetching cash flow data:', err);
        setError('Failed to load cash flow data');
      } finally {
        setLoading(false);
      }
    };

    fetchCashFlowData();
  }, []);

  const generateFullYearData = (apiData: CashFlowData[]): CashFlowData[] => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    
    // Create a map of existing data
    const dataMap = new Map<string, CashFlowData>();
    apiData.forEach(item => {
      dataMap.set(`${item.year}-${item.month}`, item);
    });
    
    // Generate full year data
    const result: CashFlowData[] = [];
    
    for (let month = 0; month < 12; month++) {
      const key = `${currentYear}-${month}`;
      if (dataMap.has(key)) {
        // Use existing data if available
        result.push(dataMap.get(key)!);
      } else {
        // Create empty data for future months or months with no data
        result.push({
          year: currentYear,
          month,
          monthName: monthNames[month],
          totalIncome: 0,
          totalExpense: 0,
          net: 0
        });
      }
    }
    
    return result;
  };

  // Prepare data for the chart
  const prepareChartData = () => {
    if (!data || data.length === 0) return [];
    
    const chartData: any[] = [];
    
    // Add income data points
    data.forEach(item => {
      chartData.push({
        month: item.monthName,
        value: item.totalIncome , // Convert to thousands for better display
        category: 'Thu nhập'
      });
    });
    
    // Add expense data points (as positive values for better visualization)
    data.forEach(item => {
      chartData.push({
        month: item.monthName,
        value: Math.abs(item.totalExpense) , // Convert to positive thousands
        category: 'Chi phí'
      });
    });
    
    // Add net data points
    data.forEach(item => {
      chartData.push({
        month: item.monthName,
        value: item.net, // Convert to thousands
        category: 'Dòng tiền ròng'
      });
    });
    
    return chartData;
  };

  const config = {
    data: prepareChartData(),
    xField: 'month',
    yField: 'value',
    seriesField: 'category',
    yAxis: {
      title: {
        text: 'Amount (thousands)',
      },
    },
    legend: {
      position: 'top',
    },
    smooth: true,
    animation: {
      appear: {
        animation: 'path-in',
        duration: 1000,
      },
    },
    color: ['#41b8d5', '#454692', '#6ce5e8'],
  };

  if (loading) {
    return (
      <Card title="Phân tích dòng tiền vào-ra theo thời gian" className={styles.chartCard}>
        <Spin tip="Loading cash flow data..." />
      </Card>
    );
  }

  if (error) {
    return (
      <Card title="Phân tích dòng tiền vào-ra theo thời gian" className={styles.chartCard}>
        <div className={styles.errorMessage}>{error}</div>
      </Card>
    );
  }

  return (
    <Card 
      title="Phân tích dòng tiền vào-ra theo thời gian" 
      className={styles.chartCard}
    >
      <Line {...config} />
    </Card>
  );
};

export default CashFlowTrendChart;