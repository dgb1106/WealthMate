'use client'

import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, DatePicker, message, Modal } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import styles from './styles.module.css';
import dayjs from 'dayjs';
import GoalCard from '@/components/goals/goalCard';

interface FamilyGoal {
    id: string;
    name: string;
    target_amount: number;
    saved_amount: number;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVER_DUE';
    due_date: Date;
    created_at: Date;
}

interface FamilyGoalProps {
    groupId: string;
}

const FamilyGoals: React.FC<FamilyGoalProps> = ({ groupId }) => {
    const [goals, setGoals] = useState<FamilyGoal[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [currentGoal, setCurrentGoal] = useState<FamilyGoal | null>(null);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchFamilyGoals();
    }, [groupId]);

    const fetchFamilyGoals = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/family-groups/${groupId}/goals`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch goals');
            }

            const result = await response.json();
            setGoals(result.data || []);
        } catch (error) {
            console.error('Error fetching goals:', error);
            message.error('Lấy dữ liệu thất bại');
        } finally {
            setLoading(false);
        }
    };

    const handleAddGoal = async (values: any) => {
        try {
            const token = localStorage.getItem('authToken');
            const payload = {
              name: values.name,
              target_amount: values.target_amount / 1000,
              saved_amount: values.saved_amount ? values.saved_amount / 1000 : 0,
              due_date: values.due_date,
            };
      
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/family-groups/${groupId}/goals`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(payload),
            });
      
            const responseData = await response.json();
            console.log('Response status:', response.status); // Debug log
            console.log('Response data:', responseData); // Debug log

            if (!response.ok) {
                throw new Error(responseData.message || 'Tạo Mục tiêu thất bại');
            }

            message.success('Tạo Mục tiêu thành công');
            setModalVisible(false);
            form.resetFields();
            fetchFamilyGoals();
          } catch (error) {
            console.error('Failed to create goal:', error);
            message.error(error instanceof Error ? error.message : 'Tạo Mục tiêu thất bại');
        }
    };

    const handleEditGoal = async (values: any) => {
        try {
          const token = localStorage.getItem('authToken');
          const payload = {
            name: values.name,
            target_amount: values.target_amount / 1000,
            due_date: values.due_date,
          };
    
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/family-groups/${groupId}/goals/${groupId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          });
    
          if (!response.ok) {
            throw new Error('Chỉnh sửa Mục tiêu thất bại');
          }
          message.success('Chỉnh sửa Mục tiêu thành công');
          setModalVisible(false);
          form.resetFields();
          fetchFamilyGoals();
        } catch (error) {
          console.error('Failed to update goal:', error);
          message.error('Chỉnh sửa Mục tiêu thất bại');
        }
      };
    
    const handleDeleteGoal = async (id: string) => {
        try {
          const token = localStorage.getItem('authToken');
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/family-groups/${groupId}/goals/${id}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
    
          if (!response.ok) {
            throw new Error('Xoá Mục tiêu thất bại');
          }
          message.success('Xoá Mục tiêu thành công');
          setModalVisible(false);
          fetchFamilyGoals();
        } catch (error) {
          console.error('Failed to delete goal:', error);
          message.error('Xoá Mục tiêu thất bại');
        }
    };

    const handleAddButton = () => {
        setCurrentGoal(null);
        setModalVisible(true);
        setTimeout(() => {
          form.resetFields();
        }, 0);
      };
    
      const handleEditButton = (goal: FamilyGoal) => {
        setCurrentGoal(goal);
        setModalVisible(true);
        setTimeout(() => {
          form.setFieldsValue({
            name: goal.name,
            target_amount: goal.target_amount * 1000,
            due_date: dayjs(goal.due_date).format('YYYY-MM-DD'),
          });
        }, 0);
      };
      
      const handleDeleteButton = (id: string) => {
        Modal.confirm({
          title: 'Xoá Mục tiêu',
          content: 'Bạn chắc chắn muốn xoá Mục tiêu này không?',
          okText: 'Xoá',
          okType: 'danger',
          cancelText: 'Huỷ',
          onOk: () => handleDeleteGoal(id),
        });
      };

    return (
        <div>
            <div className={styles.container}>
                <div className={styles.headerButtons}>
                    <Button type='primary' onClick={handleAddButton}>
                        Tạo Mục tiêu
                    </Button>
                </div>

                <div className={styles.goalsContainer}>
                    {loading ? (
                        <div className={styles.loading}>Đang tải...</div>
                    ) : goals.length === 0 ? (
                        <div className={styles.noData}>Không tìm thấy Mục tiêu</div>
                    ) : (
                        <div className={styles.contentWrapper}>
                            <div className={styles.goalsCardsSection}>
                                {goals.map((goal) => (
                                    <GoalCard key={goal.id} goal={goal} onEdit={handleEditButton} />
                                ))}
                            </div>
                            <div className={styles.rightColumn}>
                                <Card title="Nhắc nhở" className={styles.deadlineCard}>
                                    {goals
                                        .filter(goal => {
                                        const daysUntilDue = dayjs(goal.due_date).diff(dayjs(), 'day');
                                        return (
                                            (goal.status === 'PENDING' || goal.status === 'IN_PROGRESS') &&
                                            daysUntilDue >= 0 && 
                                            daysUntilDue <= 30 && 
                                            goal.saved_amount < goal.target_amount
                                        );
                                    })
                                        .sort((a, b) => dayjs(a.due_date).diff(dayjs(b.due_date)))
                                        .map(goal => (
                                            <div key={goal.id} className={styles.deadlineItem}>
                                                <div className={styles.deadlineGoalName}>{goal.name}</div>
                                                <div className={styles.deadlineInfo}>
                                                    <div className={styles.deadlineDate}>
                                                        Còn {dayjs(goal.due_date).diff(dayjs(), 'day')} ngày
                                                    </div>
                                                    <div className={styles.deadlineAmount}>
                                                        Còn thiếu: {((goal.target_amount - goal.saved_amount) * 1000).toLocaleString()} VNĐ
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    {goals.filter(goal => {
                                        const daysUntilDue = dayjs(goal.due_date).diff(dayjs(), 'day');
                                        return ( 
                                            daysUntilDue >= 0 && 
                                            daysUntilDue <= 30 && 
                                            goal.saved_amount < goal.target_amount
                                        );
                                    }).length === 0 && (
                                        <div className={styles.noNotifications}>
                                            Không có mục tiêu nào cần chú ý
                                        </div>
                                    )}
                                </Card>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Modal
                title={currentGoal ? 'Chỉnh sửa Mục tiêu' : 'Tạo Mục tiêu'}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={null}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={currentGoal ? handleEditGoal : handleAddGoal}
                >
                    <Form.Item
                        name="name"
                        label="Tên Mục tiêu"
                        rules={[{ required: true, message: 'Vui lòng nhập tên Mục tiêu' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="target_amount"
                        label="Số tiền Mục tiêu (VNĐ)"
                        rules={[{ required: true, message: 'Vui lòng nhập số tiền Mục tiêu' }]}
                    >
                        <Input type="number" min="0" />
                    </Form.Item>

                    {!currentGoal && (
                        <Form.Item
                            name="saved_amount"
                            label="Số tiền đã tiết kiệm (VNĐ)"
                            rules={[{ required: false }]}
                        >
                            <Input type="number" min="0" />
                        </Form.Item>
                    )}

                    <Form.Item
                        name="due_date"
                        label="Hạn Mục tiêu"
                        rules={[{ required: true, message: 'Vui lòng chọn hạn Mục tiêu' }]}
                    >
                        <Input type="date" />
                    </Form.Item>

                    <Form.Item>
                        <div className={styles.modalFooter}>
                            {currentGoal && (
                                <Button danger onClick={() => handleDeleteButton(currentGoal.id)}>
                                    Xoá Mục tiêu
                                </Button>
                            )}
                            <Button type="primary" htmlType="submit">
                                {currentGoal ? 'Chỉnh sửa' : 'Tạo'}
                            </Button>
                        </div>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default FamilyGoals; 
        

