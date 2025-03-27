"use client";
import React, { useEffect, useState } from "react";
import { Card, Spin } from "antd";
import axios from "axios";
import { PieChart, Pie, Tooltip, Legend, Cell, ResponsiveContainer } from "recharts";
import styles from "./styles.module.css";

const COLORS = ["#6ce5e8", "#41b8d5", "#2d8bba", "#2f5f98", "#31356e"];

const MostSpentCategoriesChart: React.FC = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMostSpentCategories = async () => {
      const token = localStorage.getItem("authToken");

      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/reports/most-spent-categories/current`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const categories = res.data.data.topCategories.map((item: any) => ({
            name: item.category.name,
            value: Math.abs(Number(item.totalAmount.d[0])) * 1000,
          }));          

        setData(categories);
      } catch (error) {
        console.error("Error fetching most spent categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMostSpentCategories();
  }, []);

  return (
    <Card className={styles.card}>
      <h2 className={styles.title}>Các danh mục chi tiêu nhiều nhất trong tháng vừa rồi</h2>
      {loading ? (
        <Spin />
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" outerRadius={120}>
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

export default MostSpentCategoriesChart;
