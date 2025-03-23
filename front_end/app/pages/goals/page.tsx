'use client';

import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Input, message, Select, Card } from 'antd';
import MainLayout from '@/layouts/MainLayout/index';
import styles from './styles.module.css';
import dayjs from 'dayjs';
import GoalCard from '@/components/goals/goalCard';

interface Goal {
  id: string;
  name: string;
  target_amount: number;
  saved_amount: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVER_DUE';
  due_date: Date;
  created_at: Date;
}

const deadlineOptions = [
  { value: 'all', label: 'All Goals' },
  { value: '7', label: '7 ngày' },
  { value: '15', label: '15 ngày' },
  { value: '30', label: '30 ngày' },
];

const GoalsPage: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentGoal, setCurrentGoal] = useState<Goal | null>(null);
  const [goalView, setGoalView] = useState<'OVER_DUE'| 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'>('IN_PROGRESS');
  const [selectedDeadline, setSelectedDeadline] = useState<string>('all');
  const [form] = Form.useForm();
  const [addFundsModalVisible, setAddFundsModalVisible] = useState(false);
  const [withdrawModalVisible, setWithdrawModalVisible] = useState(false);
  const [withdrawForm] = Form.useForm();
  const [addFundsForm] = Form.useForm();

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      let endpoint = '/goals';

      if (goalView === 'IN_PROGRESS') {
        endpoint = '/goals/active';
      } else if (goalView === 'COMPLETED') {
        endpoint = '/goals/completed';
      } else if (goalView === 'OVER_DUE') {
        endpoint = '/goals/overdue';
      } 

      // Add deadline days parameter if selected
      if (selectedDeadline !== 'all' && goalView === 'IN_PROGRESS') {
        endpoint = `/goals/nearing-deadline?days=${selectedDeadline}`;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Lấy thông tin thất bại');
      }

      const data = await response.json();
      setGoals(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch goals:', error);
      message.error('Lấy thông tin thất bại');
      setGoals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [goalView, selectedDeadline]);

  const handleAddGoal = async (values: any) => {
    try {
      const token = localStorage.getItem('authToken');
      const payload = {
        name: values.name,
        target_amount: values.target_amount / 1000,
        saved_amount: values.saved_amount ? values.saved_amount / 1000 : 0,
        due_date: values.due_date,
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/goals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Tạo Mục tiêu thất bại');
      }
      message.success('Tạo Mục tiêu thành công');
      setModalVisible(false);
      form.resetFields();
      fetchGoals();
    } catch (error) {
      console.error('Failed to create goal:', error);
      message.error('Tạo Mục tiêu thất bại');
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

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/goals/${currentGoal?.id}`, {
        method: 'PATCH',
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
      fetchGoals();
    } catch (error) {
      console.error('Failed to update goal:', error);
      message.error('Chỉnh sửa Mục tiêu thất bại');
    }
  };

  const handleDeleteGoal = async (id: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/goals/${id}`, {
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
      fetchGoals();
    } catch (error) {
      console.error('Failed to delete goal:', error);
      message.error('Xoá Mục tiêu thất bại');
    }
  };

  const handleAddFunds = async (id: string, amount: number) => {
    try {
      const token = localStorage.getItem('authToken');
      const amountInUnits = Number(amount) / 1000; // Ensure it's a valid number
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/goals/${id}/add-funds?amount=${amountInUnits}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Thêm Tiết kiệm thất bại');
      }

      message.success('Thêm Tiết kiệm thành công');
      setAddFundsModalVisible(false);
      addFundsForm.resetFields();
      fetchGoals();
    } catch (error) {
      console.error('Failed to add funds:', error);
      message.error('Thêm Tiết kiệm thất bại');
    }
  };

  const handleWithdraw = async (id: string, amount: number) => {
    try {
      const token = localStorage.getItem('authToken');
      const amountInUnits = Number(amount) / 1000; // Ensure it's a valid number

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/goals/${id}/withdraw?amount=${amountInUnits}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Rút Tiết kiệm thất bại');
      }

      message.success('Rút Tiết kiệm thành công');
      setWithdrawModalVisible(false);
      withdrawForm.resetFields();
      fetchGoals();
    } catch (error) {
      console.error('Failed to withdraw funds:', error);
      message.error('Rút Tiết kiệm thất bại');
    }
  };

  const handleAddButton = () => {
    setCurrentGoal(null);
    setModalVisible(true);
    setTimeout(() => {
      form.resetFields();
    }, 0);
  };

  const handleEditButton = (goal: Goal) => {
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

  const handleAddFundsButton = () => {
    setAddFundsModalVisible(true);
    setTimeout(() => {
      addFundsForm.resetFields();
    }, 0);
  };

  const handleWithdrawButton = () => {
    setWithdrawModalVisible(true);
    setTimeout(() => {
      withdrawForm.resetFields();
    }, 0);
  };

  return (
    <MainLayout>
      <div className={styles.pageHeader}>
        <h1>Mục tiêu</h1>
        <div className={styles.headerButtons}>
          <Button type="primary" onClick={handleAddButton}>
            Tạo Mục tiêu
          </Button>
          <Button type="primary" onClick={handleAddFundsButton}>
            Thêm Tiết kiệm
          </Button>
          <Button type="primary" onClick={handleWithdrawButton}>
            Rút Tiết kiệm
          </Button>
        </div>
      </div>

      <div className={styles.filterContainer}>
        <div className={styles.filters}>
          <Select
            value={goalView}
            onChange={(value) => setGoalView(value)}
            options={[
              { value: 'IN_PROGRESS', label: 'Hiện tại' },
              { value: 'COMPLETED', label: 'Hoàn thành' },
              { value: 'OVER_DUE', label: 'Quá hạn' },
            ]}
            className={styles.filterSelect}
            style={{ width: 150 }}
          />
          <Select
            value={selectedDeadline}
            onChange={(value) => setSelectedDeadline(value)}
            options={deadlineOptions}
            className={styles.filterSelect}
            style={{ width: 120 }}
          />
        </div>
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
                  .sort((a, b) => dayjs(a.due_date).diff(dayjs(b.due_date))) // Sort by closest deadline
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

          <Form.Item className={styles.modalFooter}>
            {currentGoal && (
              <Button danger onClick={() => handleDeleteButton(currentGoal.id)}>
                Xoá Mục tiêu
                </Button>
            )}
            <Button type="primary" htmlType="submit">
              {currentGoal ? 'Chỉnh sửa' : 'Tạo'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Thêm Tiết kiệm"
        open={addFundsModalVisible}
        onCancel={() => setAddFundsModalVisible(false)}
        footer={null}
      >
        <Form
          form={addFundsForm}
          layout="vertical"
          onFinish={(values) => {
            const amount = Number(values.amount);
            if (isNaN(amount) || amount <= 0) {
              message.error('Vui lòng nhập số hợp lệ');
              return;
            }
            handleAddFunds(values.id, amount);
          }}
        >
          <Form.Item
            name="id"
            label="Chọn Mục tiêu"
            rules={[{ required: true, message: 'Vui lòng chọn Mục tiêu' }]}
          >
            <Select>
              {goals.map(goal => (
                <Select.Option key={goal.id} value={goal.id}>
                  {goal.name} - {(goal.saved_amount * 1000).toLocaleString()} / {(goal.target_amount * 1000).toLocaleString()} VNĐ
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="amount"
            label="Lượng (VNĐ)"
            rules={[{ required: true, message: 'Vui lòng nhập lượng Tiết kiệm' }]}
          >
            <Input type="number" min="0" />
          </Form.Item>

          <Form.Item className={styles.modalFooter}>
            <Button type="default" onClick={() => setAddFundsModalVisible(false)}>
              Huỷ
            </Button>
            <Button type="primary" htmlType="submit">
              Thêm Tiết kiệm
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Rút Tiết kiệm"
        open={withdrawModalVisible}
        onCancel={() => setWithdrawModalVisible(false)}
        footer={null}
      >
        <Form
          form={withdrawForm}
          layout="vertical"
          onFinish={(values) => {
            const amount = Number(values.amount);
            if (isNaN(amount) || amount <= 0) {
              message.error('Vui lòng nhập số hợp lệ');
              return;
            }
            handleWithdraw(values.id, amount);
          }}
        >
          <Form.Item
            name="id"
            label="Chọn Mục tiêu"
            rules={[{ required: true, message: 'Vui lòng chọn Mục tiêu' }]}
          >
            <Select>
              {goals.map(goal => (
                <Select.Option key={goal.id} value={goal.id}>
                  {goal.name} - {(goal.saved_amount * 1000).toLocaleString()} / {(goal.target_amount * 1000).toLocaleString()} VNĐ
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="amount"
            label="Lượng (VNĐ)"
            rules={[{ required: true, message: 'Vui lòng nhập lượng Tiết kiệm' }]}
          >
            <Input type="number" min="0" />
          </Form.Item>

          <Form.Item className={styles.modalFooter}>
            <Button type="default" onClick={() => setWithdrawModalVisible(false)}>
              Huỷ
            </Button>
            <Button type="primary" htmlType="submit">
              Rút Tiết kiệm
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </MainLayout>
  );
};

export default GoalsPage;