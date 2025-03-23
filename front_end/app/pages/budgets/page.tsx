'use client';

import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Input, Select, message, Tabs } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import MainLayout from '@/layouts/MainLayout';
import BudgetCard from '@/components/budgets/budgetCard';
import dayjs from 'dayjs';
import styles from './styles.module.css';
import CategoryChart from '@/components/budgets/chart';

// Định nghĩa interface dựa trên cấu trúc backend
interface Budget {
  id: string;
  categoryId: string;
  category: {
    id: string;
    name: string;
    type: string;
  };
  limit_amount: number;   // Số tiền đang lưu dưới dạng "nghìn VNĐ"
  spent_amount: number;   // Tương tự, tùy backend
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

const BudgetsPage: React.FC = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentBudgetId, setCurrentBudgetId] = useState<string | null>(null);
  const [budgetView, setBudgetView] = useState<'Tất cả' | 'Hiện tại' | 'Theo tháng'>('Hiện tại');
  const [form] = Form.useForm();

  // Lấy danh sách budget theo view
  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      let endpoint = '/budgets';

      if (budgetView === 'Hiện tại') {
        endpoint = '/budgets/current';
      } else if (budgetView === 'Theo tháng') {
        endpoint = '/budgets/current-month';
      } // 'all' => '/budgets'

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
      setBudgets(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch budgets:', error);
      message.error('Lấy thông tin thất bại');
      setBudgets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [budgetView]);

  const getCategoryTotals = () => {
    const categoryTotals: { [key: string]: number } = {};

    budgets.forEach((budget) => {
      if (!categoryTotals[budget.category.name]) {
        categoryTotals[budget.category.name] = 0;
      }
      categoryTotals[budget.category.name] += budget.spent_amount * 1000;
    });

    return Object.entries(categoryTotals)
      .map(([name, spent_amount]) => ({ name, spent_amount }))
      .filter((cat) => cat.spent_amount >= 0)
      .sort((a, b) => b.spent_amount - a.spent_amount);
  };

  const handleAddBudget = async (values: any) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        message.error('Lỗi xác thực: Không tìm thấy token');
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        message.error('Lỗi cấu hình: Không định nghĩa được API URL');
        return;
      }
      const payload = {
        categoryId: values.categoryId,
        limit_amount: parseFloat(values.limit_amount) / 1000,
        start_date: values.start_date,
        end_date: values.end_date,
        spent_amount: 0
      };

      const baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
      const response = await fetch(`${baseUrl}/budgets`, {
        method: 'POST',
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

      message.success('Thêm Ngân sách thành công');
      setModalVisible(false);
      form.resetFields();
      fetchBudgets();
    } catch (error) {
      console.error('Failed to save budget:', error);
      message.error(
        'Thêm Ngân sách thất bại: ' + (error instanceof Error ? error.message : 'Lỗi không rõ')
      );
    }
  };

  // Xử lý cập nhật budget
  const handleEditBudget = async (values: any) => {
    if (!currentBudgetId) return;

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        message.error('Lỗi xác thực: Không tìm thấy token');
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        message.error('Lỗi cấu hình: Không định nghĩa được API URL');
        return;
      }

      const baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;

      // Tương tự chia 1000 để gửi
      const payload = {
        limit_amount: parseFloat(values.limit_amount) / 1000,
        categoryId: values.categoryId,
        start_date: values.start_date,
        end_date: values.end_date,
      };

      const response = await fetch(`${baseUrl}/budgets/${currentBudgetId}`, {
        method: 'PATCH',
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
      setCurrentBudgetId(null);
      fetchBudgets();
    } catch (error) {
      console.error('Failed to update budget:', error);
      message.error(
        'Chỉnh sửa Ngân sách thất bại: ' + (error instanceof Error ? error.message : 'Lỗi không rõ')
      );
    }
  };

  // Xoá budget
  const handleDeleteBudget = async (id: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/budgets/${id}`, {
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
    setCurrentBudgetId(null);
    setModalVisible(true);
    setTimeout(() => {
      form.resetFields();
    }, 0);
  };

  const handleEditButton = (budget: Budget) => {
    setCurrentBudgetId(budget.id);
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

  // Xác nhận xoá
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
    <MainLayout>
      <div className={styles.pageHeader}>
        <h1>Ngân Sách</h1>
        <Button
          type="primary"
          shape="circle"
          icon={<PlusOutlined />}
          size="large"
          onClick={handleAddButton}
          className={styles.addButton}
        />
      </div>

      <Tabs
        activeKey={budgetView}
        onChange={(key) => setBudgetView(key as 'Tất cả' | 'Hiện tại' | 'Theo tháng')}
        items={[
          { key: 'Hiện tại', label: 'Hiện tại' },
          { key: 'Theo tháng', label: 'Tháng này' },
          { key: 'Tất cả', label: 'Tất cả' },
        ]}
      />

      <div className={styles.budgetsContainer}>
        <div className={styles.budgetsCardsSection}>
          {budgets.map((budget) => (
            <BudgetCard key={budget.id} budget={budget} onEdit={handleEditButton} />
          ))}
        </div>

        <div className={styles.rightColumn}>
          <CategoryChart categories={getCategoryTotals()} />
        </div>
      </div>

      <Modal
        title={currentBudgetId ? 'Chỉnh sửa Ngân sách' : 'Thêm Ngân sách'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={currentBudgetId ? handleEditBudget : handleAddBudget}
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
              {currentBudgetId && (
                <Button danger onClick={() => handleDeleteButton(currentBudgetId)}>
                  Xoá Ngân sách
                </Button>
              )}
              <Button type="primary" htmlType="submit">
                {currentBudgetId ? 'Chỉnh sửa' : 'Tạo'}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </MainLayout>
  );
};

export default BudgetsPage;
