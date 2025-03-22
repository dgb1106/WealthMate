"use client";
import React, { useEffect, useState } from "react";
import { Card, Spin } from "antd";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface ChartData {
  month: string;
  income: number;
  expense: number;
}

const IncomeExpenseComparisonChart: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<ChartData[]>([]);

  useEffect(() => {
    const fetchComparisonData = async () => {
      const token = localStorage.getItem("authToken");

      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/reports/income-expense-monthly/ytd`,
          {
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
          }
        );

        const allMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

        const formattedData = allMonths.map((month) => {
          const foundMonth = res.data.data.find((item: any) => item.monthName === month);
          return {
            month,
            income: foundMonth ? foundMonth.totalIncome * 1000 : 0,
            expense: foundMonth ? Math.abs(foundMonth.totalExpense * 1000) : 0,
          };
        });

        setChartData(formattedData);
      } catch (error) {
        console.error("Error fetching income-expense data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchComparisonData();
  }, []);

  const formatter = (value: number) => new Intl.NumberFormat().format(value);

  return (
    <Card title="So sánh giữa Thu nhập và Chi phí">
      {loading ? (
        <Spin />
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <XAxis dataKey="month" />
            <YAxis tickFormatter={formatter} />
            <Tooltip formatter={formatter} />
            <Legend />
            <Bar dataKey="income" name="Thu nhập" fill="#82ca9d" />
            <Bar dataKey="expense" name="Chi phí" fill="#ff4d4f" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
};

export default IncomeExpenseComparisonChart;
