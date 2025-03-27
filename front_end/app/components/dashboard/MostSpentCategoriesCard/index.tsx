"use client";
import React, { useEffect, useState } from "react";
import { Card, Spin, List, Typography } from "antd";
import axios from "axios";
import styles from "./styles.module.css";

const { Title, Text } = Typography;

interface CategorySpending {
  name: string;
  value: number;
}

const MostSpentCategoriesCard: React.FC = () => {
  const [data, setData] = useState<CategorySpending[]>([]);
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

        const sortedCategories: CategorySpending[] = categories.sort((a: CategorySpending, b: CategorySpending) => b.value - a.value);
        const top3Categories = sortedCategories.slice(0, 3);

        setData(top3Categories);
      } catch (error) {
        console.error("Error fetching most spent categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMostSpentCategories();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Card className={styles.card} size="small">
      <Title level={5} className={styles.title}>
        Top chi tiêu tháng này
      </Title>
      {loading ? (
        <div className={styles.loadingContainer}>
          <Spin size="small" />
        </div>
      ) : (
        <List
          itemLayout="horizontal"
          dataSource={data}
          renderItem={(item, index) => (
            <List.Item className={styles.listItem}>
              <div className={styles.categoryRank}>#{index + 1}</div>
              <div className={styles.categoryInfo}>
                <div className={styles.categoryRow}>
                  <Text strong className={styles.categoryName}>{item.name}</Text>
                  <Text className={styles.categoryAmount}>
                    {formatCurrency(item.value)}
                  </Text>
                </div>
              </div>
            </List.Item>
          )}
          locale={{ emptyText: "Không có dữ liệu" }}
        />
      )}
    </Card>
  );
};

export default MostSpentCategoriesCard;