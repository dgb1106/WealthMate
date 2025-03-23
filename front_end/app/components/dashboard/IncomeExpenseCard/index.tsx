'use client';

import React, { useEffect, useState } from 'react';
import styles from './styles.module.css';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface Transaction {
  id: string;
  amount: number;
  created_at: string;
}

const IncomeExpenseCard: React.FC = () => {
  const [incomeData, setIncomeData] = useState<number[]>(Array(7).fill(0));
  const [expenseData, setExpenseData] = useState<number[]>(Array(7).fill(0));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setError('Không tìm thấy token');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
        const [incRes, expRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/transactions/income/current-month`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/transactions/expenses/current-month`, { headers }),
        ]);

        if (!incRes.ok || !expRes.ok) throw new Error('Không thể tải dữ liệu');

        const [incJson, expJson] = await Promise.all([incRes.json(), expRes.json()]) as [Transaction[], Transaction[]];

        const groupByDay = (txs: Transaction[]) => {
          const result = Array(7).fill(0);
          txs.forEach(tx => {
            const date = new Date(tx.created_at);
            let day = date.getDay();
            day = day === 0 ? 6 : day - 1;
            result[day] += Math.abs(tx.amount) * 1000;
          });
          return result;
        };

        setIncomeData(groupByDay(incJson));
        setExpenseData(groupByDay(expJson));
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className={styles.card}>Đang tải dữ liệu...</div>;
  if (error) return <div className={styles.card}>Lỗi: {error}</div>;

  const labels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  const maxVal = Math.max(...incomeData, ...expenseData);

  const data = {
    labels,
    datasets: [
      { label: 'Thu nhập', data: incomeData, backgroundColor: 'rgba(75,192,192,0.6)' },
      { label: 'Chi phí', data: expenseData, backgroundColor: 'rgba(49, 53, 110, 1)' },
    ],
  };

  const options = {
    responsive: true,
    scales: {
      y: { beginAtZero: true, suggestedMax: maxVal * 1.1 },
      x: { grid: { display: false } },
    },
    plugins: { legend: { position: 'top' as const } },
    maintainAspectRatio: false,
  };

  return (
    <div className={styles.card}>
      <h2 className={styles.title}>Chi phí và Thu nhập của tháng</h2>
      <div className={styles.chartContainer}>
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default IncomeExpenseCard;
