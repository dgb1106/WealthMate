'use client';

import React, { useState, useEffect } from 'react';
import { Card, Modal, Typography, Button, message, Form, Select } from 'antd';
import styles from './styles.module.css';
import dayjs from 'dayjs';
import { useParams } from 'next/navigation';

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

const FamilyOverview: React.FC = () => {
  const params = useParams();
  const groupId = params?.groupId as string;

  const [groupDetails, setGroupDetails] = React.useState<FamilyGroupDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState<'OWNER' | 'ADMIN' | 'MEMBER' | null>(null);
  const [roleChangeModalVisible, setRoleChangeModalVisible] = useState(false);
  const [removeForm] = Form.useForm();
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [roleForm] = Form.useForm();

  const fetchGroupDetails = async () => {
    try {
      const token = localStorage.getItem('authToken');
      console.log('Making API call for group:', groupId);

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
      console.log('API response:', result); // Add this to see the full response
      setGroupDetails(result.data);

      const userId = localStorage.getItem('userId');
      if (userId && result.data.members) {
        const userMember = result.data.members.find(
          (member: FamilyMember) => member.userId === userId
        );
        setCurrentUserRole(userMember?.role || null);
      }
    } catch (error) {
      console.error(error);
      message.error('Lấy dữ liệu thất bại');
    } finally { 
      setLoading(false); 
    }
  };

  const fetchGroupMembers = async () => {
    try {
      setMembersLoading(true);
      const token = localStorage.getItem('authToken');
      
      console.log('Fetching members for group:', groupId);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/family-groups/${groupId}/members`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      console.log('Members API response status:', response.status);
      
      if (!response.ok) {
        throw new Error('Failed to fetch family group members');
      }
      
      const result = await response.json();
      console.log('Members API response:', result);
      
      if (result.success && Array.isArray(result.data)) {
        console.log('Number of members found:', result.data.length);
        setMembers(result.data);
        
        // Set current user role
        const userId = localStorage.getItem('userId');
        if (userId) {
          const userMember = result.data.find(
            (member: FamilyMember) => member.userId === userId
          );
          console.log('Current user member:', userMember);
          
          console.log('Current user id:', userId);
          setCurrentUserRole(userMember?.role || null);
          console.log('Current user role:', userMember?.role);
        }
      }
    } catch (error) {
      console.error('Error fetching members:', error);
      message.error('Lấy dữ liệu thành viên thất bại');
    } finally {
      setMembersLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupDetails();
    fetchGroupMembers();
  }, [groupId]);

  if (loading) {
    return <div>Loading...</div>;
  }
  if (!groupDetails) {
    return <div>Family group not found</div>;
  }

  const handleRoleChange = async (memberId: string, newRole: 'ADMIN' | 'MEMBER') => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch (`${process.env.NEXT_PUBLIC_API_URL}/family-groups/${groupId}/members/${memberId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole}),
      });

      if (!response.ok) {
        throw new Error('Failed to update member role');
      }

      message.success('Cập nhật vai trò thành công');
      setRoleChangeModalVisible(false);
      fetchGroupDetails();
      fetchGroupMembers();
    } catch (error) {
      console.error(error);
      message.error('Cập nhật vai trò thất bại');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/family-groups/${groupId}/members/${memberId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to remove member');
      }

      message.success('Xoá thành viên thành công');
      setSelectedMember(null);
      fetchGroupDetails();
      fetchGroupMembers();
    } catch (error) {
      console.error(error);
      message.error('Xoá thành viên thất bại');
    }
  };

  const handleRoleChangeButton = (member: FamilyMember) => {
    setSelectedMember(member);
    setRoleChangeModalVisible(true);
    setTimeout(() => {
      roleForm.setFieldsValue({
        username: member.user?.name,
        role: member.role,
      });
    }, 0);
  };

  const handleRemoveButton = (member: FamilyMember) => {
    Modal.confirm({
      title: 'Xác nhận xóa thành viên',
      content: `Bạn có chắc chắn muốn xóa ${member.user?.name} khỏi nhóm gia đình này?`,
      okText: 'Đồng ý',
      cancelText: 'Hủy',
      okType: 'danger',
      onOk: () => {
        handleRemoveMember(member.id);
      }
    });
  };

  return (
    <div className={styles.wrapper}>
        <div className={styles.container}>
            <div className={styles.leftColumn}>
                <Card title="Hoạt động nhóm" className={styles.contentCard}>
                    <p>Nội dung chính của nhóm sẽ hiển thị ở đây.</p>
                    <p>Đây có thể là lịch sử giao dịch, mục tiêu, hay các hoạt động khác.</p>
                </Card>
            </div>
        
            <div className={styles.rightColumn}>
                <Card 
                    title="Thành viên" 
                    className={styles.memberCard}
                    loading={membersLoading}
                    extra={
              <div>
                {members.length > 0 && <span>{members.length} thành viên</span>}
              </div>
            }
          >
            {members.length > 0 ? (
              members.map((member) => (
                <div key={member.id} className={styles.memberItem}>
                  <div className={styles.memberInfo}>
                    <span className={styles.memberName}>
                      {member.user?.name || 'Unknown user'}
                    </span>
                    <span className={styles.memberRole}>{member.role}</span>
                  </div>
                  
                  {(currentUserRole === 'OWNER' || currentUserRole === 'ADMIN') && 
                    (
                    <div className={styles.memberActions}>
                      {((currentUserRole === 'OWNER') || 
                        (currentUserRole === 'ADMIN')) && (
                        <Button 
                          size="small" 
                          type="primary"
                          onClick={() => handleRoleChangeButton(member)}
                        >
                          Thay đổi vai trò
                        </Button>
                      )}
                      
                      <Button 
                        size="small" 
                        danger 
                        onClick={() => handleRemoveButton(member)}
                      >
                        Xóa
                      </Button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p>Không tìm thấy thành viên nào trong nhóm này.</p>
            )}
          </Card>
        </div>
      </div>

      <Modal
        title="Change Member Role"
        open={roleChangeModalVisible}
        onCancel={() => setRoleChangeModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setRoleChangeModalVisible(false)}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={() => handleRoleChange(selectedMember?.id || '', roleForm.getFieldValue('role'))}>
            Save Changes
          </Button>,
        ]}
      >
        <Form
          form={roleForm}
          layout="vertical"
        >
          <Form.Item
            name="username"
            label="Username"
          >
            <input disabled  />
          </Form.Item>
          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: 'Please select a role' }]}
          >
            <Select>
              {currentUserRole === 'OWNER' && (
                <Select.Option value="ADMIN">Admin</Select.Option>
              )}
              <Select.Option value="MEMBER">Member</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default FamilyOverview;
