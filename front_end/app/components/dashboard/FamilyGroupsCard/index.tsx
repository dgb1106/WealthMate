"use client";
import React, { useEffect, useState } from "react";
import { Card, List, Typography, Spin, Avatar } from "antd";
import axios from "axios";
import { UserOutlined, TeamOutlined } from "@ant-design/icons";
import styles from "./styles.module.css";

const { Title, Text } = Typography;

interface FamilyGroup {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  avatar_url: string | null;
  member_count: number;
  budget_count: number;
  goal_count: number;
}

const FamilyGroupsCard: React.FC = () => {
  const [groups, setGroups] = useState<FamilyGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFamilyGroups = async () => {
      const token = localStorage.getItem("authToken");

      try {
        setLoading(true);
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/family-groups`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setGroups(res.data.data);
      } catch (error) {
        console.error("Error fetching family groups:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFamilyGroups();
  }, []);

  return (
    <Card className={styles.card} size="small">
      <Title level={5} className={styles.title}>
        Nhóm bạn tham gia
      </Title>
      {loading ? (
        <div className={styles.loadingContainer}>
          <Spin size="small" />
        </div>
      ) : (
        <List
          itemLayout="horizontal"
          dataSource={groups}
          renderItem={(group) => (
            <List.Item className={styles.listItem}>
              <div className={styles.groupInfo}>
                <div className={styles.groupHeader}>
                  <Text strong className={styles.groupName}>{group.name}</Text>
                  <Text className={styles.memberCount}>
                    <TeamOutlined /> {group.member_count}
                  </Text>
                </div>
                <Text className={styles.groupDescription} type="secondary">
                  {group.description}
                </Text>
              </div>
            </List.Item>
          )}
          locale={{ emptyText: "Bạn chưa tham gia nhóm nào" }}
        />
      )}
    </Card>
  );
};

export default FamilyGroupsCard;