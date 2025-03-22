"use client";
import React, { useEffect, useState } from "react";
import { Card, Spin } from "antd";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import styles from "./styles.module.css";

const BudgetOverviewChart: React.FC = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBudgetOverview = async () => {
      const token = localStorage.getItem("authToken");

      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/reports/budget-report`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const budgetsData = res.data.data.budgets.map((item: any) => ({
          name: item.categoryName,
          "Ngân sách": item.limitAmount * 1000,
          "Đã chi": item.spentAmount * 1000,
          "Còn lại": item.remainingAmount * 1000,
        }));

        setData(budgetsData);
      } catch (error) {
        console.error("Error fetching budget overview:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBudgetOverview();
  }, []);

  const formatter = (value: number) => new Intl.NumberFormat().format(value);

  return (
    <Card title="Tổng quan Ngân sách" className={styles.card}>
      {loading ? (
        <Spin />
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data}>
            <XAxis dataKey="name" />
            <YAxis tickFormatter={formatter} />
            <Tooltip formatter={formatter} />
            <Legend />
            <Bar dataKey="Ngân sách" fill="#8884D8" />
            <Bar dataKey="Đã chi" fill="#FF4D4F" />
            <Bar dataKey="Còn lại" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
};

export default BudgetOverviewChart;
