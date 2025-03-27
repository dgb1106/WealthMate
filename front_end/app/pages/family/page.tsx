'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, Card, Button, Modal, Form, Input, message, Select } from 'antd';
import MainLayout from '@/layouts/MainLayout/index';
import styles from './styles.module.css';

interface FamilyGroup {
  id: string;
  name: string;
  description: string;
  //status: 'OWNER' | 'ADMIN' | 'MEMBER';
  members: FamilyMember[];
}

interface FamilyMember {
  id: string;
  userId: string;
  userEmail: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  joinedAt: Date;
}

interface Invitation {
  id: string;
  groupId: string;
  groupName?: string;
  inviterId: string;
  inviterName?: string;
  inviteeEmail: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  created_at: Date;
  expires_at: Date;
  group?: FamilyGroup;
  inviter?: any;
  message?: string;
  isValid?: boolean;
  isExpired?: boolean;
}

const FamilyPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('1');
  const router = useRouter();
  const [familyGroups, setFamilyGroups] = useState<FamilyGroup[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [groupMemberCounts, setGroupMemberCounts] = useState<Record<string, number>>({});
  const [membersLoading, setMembersLoading] = useState<Record<string, boolean>>({});
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [inviteForm] = Form.useForm();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editForm] = Form.useForm();
  const [selectedGroup, setSelectedGroup] = useState<FamilyGroup | null>(null);

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

  const fetchGroupMembers = async () => {
    if (!familyGroups.length) return;
    
    const token = localStorage.getItem('authToken');
    const newMemberCounts: Record<string, number> = {};
    const newLoadingState: Record<string, boolean> = {};
    
    // Mark all groups as loading
    familyGroups.forEach(group => {
      newLoadingState[group.id] = true;
    });
    setMembersLoading(newLoadingState);
    
    // Fetch members for each group
    for (const group of familyGroups) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/family-groups/${group.id}/members`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.success && Array.isArray(result.data)) {
            newMemberCounts[group.id] = result.data.length;
            console.log(`Group ${group.name} has ${result.data.length} members`);
          }
        }
      } catch (error) {
        console.error(`Error fetching members for group ${group.id}:`, error);
      } finally {
        // Mark this group as loaded
        newLoadingState[group.id] = false;
      }
    }
    
    setGroupMemberCounts(newMemberCounts);
    setMembersLoading(newLoadingState);
  };

  const fetchInvitations = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const userId = localStorage.getItem('userId');
      const userEmail = localStorage.getItem('userEmail');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invitations/my`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch invitations');
      }

      const result = await response.json();
      console.log('Invitations API response:', result);
      console.log('Current user ID:', userId);
      console.log('Current user email:', userEmail);

      if (!result.success) {
        throw new Error('Invalid response format from server');
      }

      // Log each invitation for debugging
      if (result.data && result.data.length > 0) {
        console.log('Found invitations:', result.data.map((inv: any) => ({
          id: inv.id,
          inviteeEmail: inv.inviteeEmail,
          status: inv.status
        })));
      } else {
        console.log('No invitations found in response');
      }

      setInvitations(result.data || []);
    } catch (error: any) {
      console.error('Error fetching invitations:', error);
      message.error(error.message || 'Lấy dữ liệu thất bại');
      setInvitations([]);
    }
  };
  
  // Add this effect to fetch members when groups are loaded
  useEffect(() => {
    if (familyGroups.length > 0) {
      fetchGroupMembers();
    }
  }, [familyGroups]);

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

  const handleEditGroup = async (values: any) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/family-groups/${selectedGroup?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: values.name,
          description: values.description
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update family group');
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'Failed to update family group');
      }

      message.success('Cập nhật nhóm thành công');
      setEditModalVisible(false);
      editForm.resetFields();
      setSelectedGroup(null);
      fetchFamilyGroups();
    } catch (error: any) {
      console.error('Edit error:', error);
      message.error(error.message || 'Cập nhật nhóm thất bại');
    }
  };

  const handleDeleteGroup = async () => {
    if (!selectedGroup) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/family-groups/${selectedGroup.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete family group');
      }

      message.success('Xóa nhóm thành công');
      setEditModalVisible(false);
      editForm.resetFields();
      setSelectedGroup(null);
      fetchFamilyGroups();
    } catch (error) {
      console.error(error);
      message.error('Xóa nhóm thất bại');
    }
  };

  useEffect(() => {
    fetchFamilyGroups();
  }, []);

  useEffect(() => {
    fetchInvitations();
  }, []);

  const handleInvite = async (values: any) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/family-groups/${values.groupId}/invitations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          inviteeEmail: values.inviteEmail,
          message: values.message,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to invite member');
      }

      message.success('Gửi lời mời thành công');
      setInviteModalVisible(false);
      inviteForm.resetFields();
      fetchInvitations(); // Refresh the invitations list
    } catch (error: any) {
      console.error('Invite error:', error);
      message.error(error.message || 'Gửi lời mời thất bại');
    }
  };

  const handleAcceptInvitation = async (invitationId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invitations/${invitationId}/accept`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to accept invitation');
      }

      message.success('Đã chấp nhận lời mời');
      fetchInvitations();
      fetchFamilyGroups(); // Refresh the groups list
    } catch (error) {
      console.error(error);
      message.error('Chấp nhận lời mời thất bại');
    }
  };

  const handleRejectInvitation = async (invitationId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invitations/${invitationId}/reject`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to reject invitation');
      }

      message.success('Đã từ chối lời mời');
      fetchInvitations();
    } catch (error) {
      console.error(error);
      message.error('Từ chối lời mời thất bại');
    }
  };

  const handleCreateButton = () => {
    setCreateModalVisible(true);
    setTimeout(() => {
      form.resetFields();
    }, 0);
  };

  const handleInviteButton = () => {
    setInviteModalVisible(true);
    setTimeout(() => {
      inviteForm.resetFields();
    }, 0);
  };

  const handleEditButton = () => {
    setEditModalVisible(true);
    setTimeout(() => {
      editForm.resetFields();
    }, 0);
  };

  const handleGroupSelect = (groupId: string) => {
    const group = familyGroups.find(g => g.id === groupId);
    if (group) {
      setSelectedGroup(group);
      editForm.setFieldsValue({
        name: group.name,
        description: group.description
      });
    }
  };

  return (
    <MainLayout>
      <div className={styles.pageHeader}>
        <h1>Nhóm</h1>
        <div className={styles.headerButtons}>
          <Button type="primary" onClick={handleCreateButton}>
            Tạo Nhóm
          </Button>
          <Button type="primary" onClick={handleInviteButton}>
            Mời thành viên
          </Button>
          <Button type="primary" onClick={handleEditButton}>
            Chỉnh sửa Nhóm
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
                      <span>
                        {membersLoading[group.id] ? 'Đang tải...' : `${groupMemberCounts[group.id] || 0} thành viên`}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            ),
          },
          {
            key: '2',
            label: 'Lời mời của bạn',
            children: (
              <div className={styles.invitationsList}>
                {invitations.filter(invitation => invitation.status === 'PENDING').length === 0 ? (
                  <div className={styles.emptyState}>
                    <p>Bạn chưa có lời mời nào đang chờ phản hồi</p>
                  </div>
                ) : (
                  invitations
                    .filter(invitation => invitation.status === 'PENDING')
                    .map(invitation => (
                      <Card key={invitation.id} className={styles.invitationCard}>
                        <div className={styles.invitationContent}>
                          <div className={styles.invitationInfo}>
                            <h3>Lời mời tham gia nhóm: {invitation.groupName || invitation.group?.name || 'Không xác định'}</h3>
                            <p>Người mời: {invitation.inviterName || invitation.inviter?.username || 'Không xác định'}</p>
                            {invitation.message && (
                              <p className={styles.invitationMessage}>{invitation.message}</p>
                            )}
                            <p className={styles.invitationDate}>
                              Ngày mời: {new Date(invitation.created_at).toLocaleDateString('vi-VN')}
                            </p>
                          </div>
                          <div className={styles.invitationActions}>
                            <Button 
                              type="primary" 
                              onClick={() => handleAcceptInvitation(invitation.id)}
                            >
                              Chấp nhận
                            </Button>
                            <Button 
                              danger 
                              onClick={() => handleRejectInvitation(invitation.id)}
                            >
                              Từ chối
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))
                )}
              </div>
            ),
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

          <Form.Item>
            <div className={styles.modalFooter}>
              <Button onClick={() => setCreateModalVisible(false)}>Huỷ</Button>
              <Button type="primary" htmlType="submit">Tạo</Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Mời thành viên mới"
        open={inviteModalVisible}
        onCancel={() => setInviteModalVisible(false)}
        footer={null}
      >
        <Form
          form={inviteForm}
          layout="vertical"
          onFinish={handleInvite}
        >
          <Form.Item
            name="inviteEmail"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' }
            ]}
          >
            <Input placeholder="Nhập email người dùng" />
          </Form.Item>

          <Form.Item
            name="groupId"
            label="Nhóm"
            rules={[{ required: true, message: 'Vui lòng chọn nhóm' }]}
          >
            <Select options={familyGroups.map(group => ({ label: group.name, value: group.id }))} />
          </Form.Item>

          <Form.Item
            name="message"
            label="Lời nhắn (tùy chọn)"
          >
            <Input.TextArea placeholder="Nhập lời nhắn cho người được mời" />
          </Form.Item>
          <Form.Item className={styles.modalFooter}>
            <Button onClick={() => setInviteModalVisible(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit">Gửi lời mời</Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Chỉnh sửa nhóm"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setSelectedGroup(null);
        }}
        footer={null}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEditGroup}
        >
          <Form.Item
            name="groupId"
            label="Chọn nhóm"
            rules={[{ required: true, message: 'Vui lòng chọn nhóm' }]}
          >
            <Select 
              placeholder="Chọn nhóm cần chỉnh sửa"
              onChange={handleGroupSelect}
              options={familyGroups.map(group => ({ 
                label: group.name, 
                value: group.id 
              }))}
            />
          </Form.Item>

          <Form.Item
            name="name"
            label="Tên nhóm"
            rules={[{ required: true, message: 'Vui lòng nhập tên nhóm' }]}
          >
            <Input disabled={!selectedGroup} />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
          >
            <Input.TextArea disabled={!selectedGroup} />
          </Form.Item>

          <Form.Item className={styles.modalFooter}>
            {selectedGroup && (
              <Button danger onClick={handleDeleteGroup}>
                Xóa nhóm
              </Button>
            )}
            <Button type="primary" htmlType="submit" disabled={!selectedGroup}>
              Lưu chỉnh sửa
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </MainLayout>
  );
};

export default FamilyPage;