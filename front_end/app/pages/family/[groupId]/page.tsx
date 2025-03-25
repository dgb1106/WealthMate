'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Tabs, message } from 'antd';
import MainLayout from '@/layouts/MainLayout';
import FamilyOverview from '@/components/family/FamilyOverview';
import FamilyBudgets from '@/components/family/FamilyBudgets';
import FamilyGoals from '@/components/family/FamilyGoals';
import styles from './styles.module.css';

interface FamilyGroupDetail {
  id: string;
  name: string;
  description: string;
  created_at: Date;
  updated_at: Date;
  avatar_url?: string;
  members: FamilyMember[];
}
  
interface FamilyMember {
  id: string;
  groupId: string;
  userId: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  joined_at: string; // Note: backend sends ISO string
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

const FamilyGroupPage: React.FC = () => {
  const params = useParams();
  const groupId = params?.groupId as string;
  const [groupDetails, setGroupDetails] = useState<FamilyGroupDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchGroupDetails = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/family-groups/${groupId}`, {
        headers: {
          method: 'GET',
          Authorization: `Bearer ${token}`,
        },
      });
        
      if (!response.ok) {
        throw new Error('Failed to fetch family group details');
      }
        
      const result = await response.json();
      setGroupDetails(result.data);
    } catch (error) {
      console.error(error);
      message.error('Lấy dữ liệu thất bại');
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => {
    fetchGroupDetails();
  }, [groupId]);

  if (loading) {
    return <MainLayout><div>Loading...</div></MainLayout>;
  }
  if (!groupDetails) {
    return <MainLayout><div>Family group not found</div></MainLayout>;
  }

  return (
    <MainLayout>
      <h1 className={styles.groupName}>{groupDetails.name}</h1>
      
      <Tabs
        defaultActiveKey="overview"
        items={[
          {
            key: 'overview',
            label: 'Tổng quan',
            children: <FamilyOverview />
          },
          {
            key: 'goals',
            label: 'Mục tiêu nhóm',
            children: <FamilyGoals groupId={groupId} />
          },
          {
            key: 'budgets',
            label: 'Chi tiêu nhóm',
            children: <FamilyBudgets groupId={groupId} />
          }
        ]}
      />
    </MainLayout>
  );
};

export default FamilyGroupPage;