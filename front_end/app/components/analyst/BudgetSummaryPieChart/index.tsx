"use client";
import React, { useEffect, useState } from "react";
import { Card, Spin } from "antd";
import axios from "axios";
import { PieChart, Pie, Tooltip, Legend, Cell, ResponsiveContainer } from "recharts";
import styles from "./styles.module.css";

const COLORS = ["#FF4D4F", "#82ca9d", "#82ca9d"];

interface BudgetData {
    name: string;
    value: number;
  }

const BudgetSummaryPieChart: React.FC = () => {
  const [data, setData] = useState<BudgetData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBudgetSummary = async () => {
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

        const summaryData = res.data.data.summary;

        setData([
          { name: "Đã chi", value: summaryData.totalSpent * 1000 },
          { name: "Còn lại", value: summaryData.totalRemaining * 1000 },
        ]);
      } catch (error) {
        console.error("Error fetching budget summary:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBudgetSummary();
  }, []);

  return (
    <Card title="Tổng quan ngân sách tháng này" className={styles.card}>
      {loading ? (
        <Spin />
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" outerRadius={80}>
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => new Intl.NumberFormat().format(Number(value))} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
};

export default BudgetSummaryPieChart;
