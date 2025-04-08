'use client'

import React, { useState, useEffect} from 'react';
import { Card, Button, Modal, Form, Input, DatePicker, Select, message } from 'antd';
import styles from './styles.module.css';
import BudgetCard from '@/components/budgets/budgetCard';
import dayjs from 'dayjs';

interface FamilyBudget {
  id: string;
  categoryId: string;
  category: {
    id: string;
    name: string;
    type: string;
  };
  limit_amount: number;  
  spent_amount: number; 
  start_date: string;
  end_date: string;
}
  
  // Ví dụ categories (thay bằng API thật nếu cần)
const predefinedCategories = [
  { id: '1', name: 'Ăn uống', type: 'EXPENSE' },
  { id: '2', name: 'Nhà ở', type: 'EXPENSE' },
  { id: '3', name: 'Di chuyển', type: 'EXPENSE' },
  { id: '4', name: 'Giáo dục', type: 'EXPENSE' },
  { id: '5', name: 'Quà tặng', type: 'EXPENSE' },
  { id: '6', name: 'Hoá đơn & Tiện ích', type: 'EXPENSE' },
  { id: '7', name: 'Mua sắm', type: 'EXPENSE' },
  { id: '8', name: 'Làm đẹp', type: 'EXPENSE' },
  { id: '9', name: 'Gia đình', type: 'EXPENSE' },
  { id: '10', name: 'Vật nuôi', type: 'EXPENSE' },
  { id: '11', name: 'Sức khoẻ', type: 'EXPENSE' },
  { id: '12', name: 'Giải trí', type: 'EXPENSE' },
  { id: '13', name: 'Công việc', type: 'EXPENSE' },
  { id: '14', name: 'Bảo hiểm', type: 'EXPENSE' },
  { id: '15', name: 'Các chi phí khác', type: 'EXPENSE' },
  { id: '16', name: 'Trả nợ', type: 'EXPENSE' },
  { id: '17', name: 'Thể thao', type: 'EXPENSE' },
  { id: '18', name: 'Đầu tư', type: 'EXPENSE' },
];

interface FamilyBudgetProps {
  groupId: string;
}

const FamilyBudgets: React.FC<FamilyBudgetProps> = ({ groupId }) => {
  const [form] = Form.useForm();
  const [budgets, setBudgets] = useState<FamilyBudget[]>([]);
  const [currentBudget, setCurrentBudget] = useState<FamilyBudget | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBudgets();
  }, [groupId]);

  const fetchBudgets = async () => {
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/family-groups/${groupId}/budgets`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch budgets');
        }

        const result = await response.json();
        console.log('Fetched budgets:', result); // Debug log

        // Map the response data to include category information
        const mappedBudgets = result.data.map((budget: any) => {
            const category = predefinedCategories.find(cat => cat.id === budget.categoryId);
            return {
                ...budget,
                category: category ? {
                    id: category.id,
                    name: category.name
                } : {
                    id: budget.categoryId,
                    name: 'Unknown Category'
                }
            };
        });

        console.log('Mapped budgets:', mappedBudgets); // Debug log
        setBudgets(mappedBudgets);
    } catch (error) {
        console.error('Error fetching budgets:', error);
        message.error('Lấy dữ liệu thất bại');
        setBudgets([]);
    } finally {
        setLoading(false);
    }
  };

  const handleAddBudget = async (values: any) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        message.error('Lỗi xác thực: Không tìm thấy token');
        return;
      }

      const payload = {
        categoryId: values.categoryId,
        limit_amount: parseFloat(values.limit_amount) / 1000,
        start_date: values.start_date,
        end_date: values.end_date,
        spent_amount: 0
      };

      console.log('Sending payload:', payload); // Debug log

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/family-groups/${groupId}/budgets`, {
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
        const errorData = await response.text();
        throw new Error(`Failed: ${response.status} ${errorData}`);
      }

      message.success('Thêm Ngân sách thành công');
      setModalVisible(false);
      form.resetFields();
      fetchBudgets(); // Refresh the list
    } catch (error) {
      console.error('Failed to save budget:', error);
      message.error(
        'Thêm Ngân sách thất bại: ' + (error instanceof Error ? error.message : 'Lỗi không rõ')
      );
    }
  };

  const handleEditBudget = async (values: any) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        message.error('Lỗi xác thực: Không tìm thấy token');
        return;
      }

      const payload = {
        limit_amount: parseFloat(values.limit_amount) / 1000,
        categoryId: values.categoryId,
        start_date: values.start_date,
        end_date: values.end_date,
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/family-groups/${groupId}/budgets/${currentBudget?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed: ${response.status} ${errorData}`);
      }

      message.success('Chỉnh sửa Ngân sách thành công');
      setModalVisible(false);
      form.resetFields();
      setCurrentBudget(null);
      fetchBudgets();
    } catch (error) {
      console.error('Failed to update budget:', error);
      message.error(
        'Chỉnh sửa Ngân sách thất bại: ' + (error instanceof Error ? error.message : 'Lỗi không rõ')
      );
    }
  };

  const handleDeleteBudget = async (id: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/family-groups/${groupId}/budgets/${currentBudget?.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Xoá Ngân sách thất bại');
      }

      message.success('Xoá Ngân sách thành công');
      setModalVisible(false);
      fetchBudgets();
    } catch (error) {
      console.error('Failed to delete budget:', error);
      message.error('Xoá Ngân sách thất bại');
    }
  };

  const handleAddButton = () => {
    setCurrentBudget(null);
    setModalVisible(true);
    setTimeout(() => {
      form.resetFields();
    }, 0);
  };

  const handleEditButton = (budget: FamilyBudget) => {
    setCurrentBudget(budget);
    setModalVisible(true);
    setTimeout(() => {
      form.setFieldsValue({
        limit_amount: budget.limit_amount * 1000,
        categoryId: budget.categoryId,
        start_date: dayjs(budget.start_date).format('YYYY-MM-DD'),
        end_date: dayjs(budget.end_date).format('YYYY-MM-DD'),
      });
    }, 0);
  };

  const handleDeleteButton = (id: string) => {
    Modal.confirm({
      title: 'Xoá Ngân sách',
      content: 'Bạn chắc chắn muốn xoá Ngân sách này không?',
      okText: 'Xoá',
      okType: 'danger',
      cancelText: 'Huỷ',
      onOk: () => handleDeleteBudget(id),
    });
  };

  return (
    <div>
        <div className={styles.container}>
            <div className={styles.headerButtons}>
                <Button type='primary' onClick={handleAddButton}>
                    Tạo Ngân sách
                </Button>
            </div>

            <div className={styles.budgetsContainer}>
                {loading ? (
                    <div className={styles.loading}>Đang tải...</div>
                ) : budgets.length === 0 ? (
                    <div className={styles.noData}>Không tìm thấy Ngân sách</div>
                ) : (
                    <div className={styles.contentWrapper}>
                        <div className={styles.budgetsCardsSection}>
                            {budgets.map((budget) => (
                                <BudgetCard key={budget.id} budget={budget} onEdit={handleEditButton} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>

        <Modal
        title={currentBudget ? 'Chỉnh sửa Ngân sách' : 'Thêm Ngân sách'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={currentBudget ? handleEditBudget : handleAddBudget}
        >
          <Form.Item
            name="categoryId"
            label="Danh mục"
            rules={[{ required: true, message: 'Vui lòng chọn một danh mục' }]}
          >
            <Select placeholder="Chọn một danh mục">
              {predefinedCategories.map((category) => (
                <Select.Option key={category.id} value={category.id}>
                  {category.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="limit_amount"
            label="Lượng Ngân sách (VNĐ)"
            rules={[
              { required: true, message: 'Vui lòng nhập số tiền hợp lệ' },
              {
                pattern: /^\d+$/,
                message: 'Số tiền phải là một số nguyên (không dấu chấm, dấu phẩy)',
              },
            ]}
          >
            <Input type="number" placeholder="Ví dụ: 500000" />
          </Form.Item>

          <Form.Item
            name="start_date"
            label="Ngày bắt đầu"
            rules={[{ required: true, message: 'Vui lòng chọn một ngày bắt đầu' }]}
          >
            <Input type="date" />
          </Form.Item>

          <Form.Item
            name="end_date"
            label="Ngày kết thúc"
            rules={[{ required: true, message: 'Vui lòng chọn một ngày kết thúc' }]}
          >
            <Input type="date" />
          </Form.Item>

          <Form.Item>
            <div className={styles.modalFooter}>
              {currentBudget && (
                <Button danger onClick={() => handleDeleteButton(currentBudget.id)}>
                  Xoá Ngân sách
                </Button>
              )}
              <Button type="primary" htmlType="submit">
                {currentBudget ? 'Chỉnh sửa' : 'Tạo'}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );   
};

export default FamilyBudgets; 
  
