'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Tabs, Card, Button, message, Avatar } from 'antd';
import MainLayout from '@/layouts/MainLayout';
import styles from '../styles.module.css';

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
  userId: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  username: string;
  avatar?: string;
  joinedAt: Date;
}

const FamilyGroupPage: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  console.log('Group ID:', groupId); // Debug log

  const [groupDetails, setGroupDetails] = React.useState<FamilyGroupDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState<'OWNER' | 'ADMIN' | 'MEMBER' | null>(null);
  
  const fetchGroupDetails = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/family-groups/${groupId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
        
      if (!response.ok) {
        throw new Error('Failed to fetch family group details');
      }
        
      const result = await response.json();
      setGroupDetails(result.data);

      const userId = localStorage.getItem('userId');
      const userMember = result.data.members.find((member: FamilyMember) => member.userId === userId);
      setCurrentUserRole(userMember?.role || null);
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
      <div className={styles.header}>Family Group {groupId}
        <h1 className={styles.title}>{groupDetails.name}</h1>
      </div>
    </MainLayout>
  );
};

export default FamilyGroupPage;