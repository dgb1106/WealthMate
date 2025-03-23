'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, Card, Button, Modal, Form, Input, message } from 'antd';
import MainLayout from '@/layouts/MainLayout/index';
import styles from './styles.module.css';

interface FamilyGroup {
  id: string;
  name: string;
  description: string;
  status: 'OWNER' | 'ADMIN' | 'MEMBER';
  members: FamilyMember[]; //not showing the correct number of members
}

interface FamilyMember {
  id: string;
  userId: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  joinedAt: Date;
}

interface Invitation {
  id: string;
  groupId: string;
  inviterId: string;
  inviteeEmail: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  created_at: Date;
  expires_at: Date;
  group?: FamilyGroup;
  inviter?: any;
}

const FamilyPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('1');
  const router = useRouter();
  const [familyGroups, setFamilyGroups] = useState<FamilyGroup[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [form] = Form.useForm();

  const fetchFamilyGroups = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/family-groups`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch family groups');
      }

      const result = await response.json();
      setFamilyGroups(result.data || []);
    } catch (error) {
      console.error(error);
      message.error('Lấy dữ liệu thất bại');
      setFamilyGroups([]);
    }
  };

  const handleCreateGroup = async (values: any) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/family-groups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('Failed to create family group');
      }

      message.success('Tạo nhóm gia đình thành công');
      setCreateModalVisible(false);
      form.resetFields();
      fetchFamilyGroups();
    } catch (error) {
      console.error(error);
      message.error('Tạo nhóm gia đình thất bại');
    }
  };

  useEffect(() => {
    fetchFamilyGroups();
  }, []);

  const handleCreateButton = () => {
    setCreateModalVisible(true);
    setTimeout(() => {
      form.resetFields();
    }, 0);
  };

  return (
    <MainLayout>
      <div className={styles.pageHeader}>
        <h1>Nhóm</h1>
        <div className={styles.headerButtons}>
          <Button type="primary" onClick={handleCreateButton}>
              Tạo Nhóm
          </Button>
        </div>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key)}
        items={[
          {
            key: '1',
            label: 'Nhóm của bạn',
            children: (
              <div className={styles.groupsGrid}>
                {familyGroups.map(group => (
                  <Card
                    key={group.id}
                    className={styles.groupCard}
                    onClick={() => router.push(`/pages/family/${group.id}`)}
                  >
                    <h3 className={styles.groupName}>{group.name}</h3>
                    <p className={styles.groupDescription}>{group.description}</p>
                    <div className={styles.groupInfo}>
                      <span>{group.members?.length || 1} thành viên</span>
                      {group.status === 'OWNER' ? (
                        <span className={styles.ownerBadge}>Chủ sở hữu</span>
                      ) : group.status === 'ADMIN' ? (
                        <span className={styles.adminBadge}>Quản trị viên</span>
                      ) : null}
                    </div>
                  </Card>
                ))}
              </div>
            ),
          },
          {
            key: '2',
            label: 'Lời mời của bạn',
            children: 'Invitation content here',
          },
        ]}
      />

      <Modal
        title="Tạo nhóm gia đình"
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateGroup}
        >
          <Form.Item
            name="name"
            label="Tên nhóm"
            rules={[{ required: true, message: 'Vui lòng nhập tên nhóm' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
          >
            <Input.TextArea />
          </Form.Item>

          <Form.Item className={styles.modalFooter}>
            <Button onClick={() => setCreateModalVisible(false)}>Huỷ</Button>
            <Button type="primary" htmlType="submit">Tạo</Button>
          </Form.Item>
        </Form>
      </Modal>
    </MainLayout>
  );
};

export default FamilyPage;