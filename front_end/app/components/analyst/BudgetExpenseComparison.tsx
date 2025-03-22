"use client";
import React, { useEffect, useState } from "react";
import { Card, Spin } from "antd";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const BudgetExpenseComparison: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchComparison = async () => {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/reports/budget-report`,
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        }
      );

      setData(res.data);
      setLoading(false);
    };

    fetchComparison();
  }, []);

  return (
    <Card title="Comparison of Budget and Expense">
      {loading ? (
        <Spin />
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="budget" fill="#8884D8" />
            <Bar dataKey="expense" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
};

export default BudgetExpenseComparison;
