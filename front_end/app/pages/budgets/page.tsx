'use client';

import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Input, Select, message, Tabs } from 'antd';
import { PlusOutlined, BulbOutlined } from '@ant-design/icons';
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

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleSuggestBudget = async () => {
    const hide = message.loading('Đang tạo ngân sách gợi ý...', 0);
    
    try {
      // Verify authentication
      const token = localStorage.getItem('authToken');
      if (!token) {
        message.error('Vui lòng đăng nhập để sử dụng tính năng này');
        return;
      }
      
      // Get the current month's start and end dates
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      const startDate = formatDate(firstDay);
      const endDate = formatDate(lastDay);
      
      // Get income value (you might want to fetch this from user profile or input)
      let income = 1200000; // Default value, replace with actual user income if available
      
      try {
        const incomeResponse = await fetch('https://wealthmate.onrender.com/transactions/income/current-month', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (incomeResponse.ok) {
          const incomeData = await incomeResponse.json();
          // Make sure to handle the actual response structure
          if (incomeData && typeof incomeData === 'number' && incomeData > 0) {
            income = incomeData * 1000; // Convert from thousands to actual value
          } else if (incomeData && typeof incomeData.income === 'number' && incomeData.income > 0) {
            income = incomeData.income * 1000; // Alternative structure
          }
          console.log(`Đã lấy thu nhập tháng này: ${income.toLocaleString('vi-VN')} VNĐ`);
        } else {
          console.warn('Không thể lấy thông tin thu nhập, sử dụng giá trị mặc định');
        }
      } catch (incomeError) {
        console.error('Lỗi khi lấy thu nhập:', incomeError);
        // Continue with default income value
      }

      // Fetch budget suggestions
      const response = await fetch(`https://wealthmate.onrender.com/ai-utils/budget-suggestion?income=${income}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Lỗi API (${response.status}): Không thể lấy gợi ý ngân sách`);
      }
      
      const suggestions = await response.json();
      
      // Check if suggestions are empty
      if (!suggestions || Object.keys(suggestions).length === 0) {
        message.info('Không tìm thấy gợi ý ngân sách nào.');
        return;
      }
      
      // Create budgets from suggestions
      let createdCount = 0;
      let failedCount = 0;
      
      for (const [categoryName, amount] of Object.entries(suggestions)) {
        try {
          // Find category ID by name
          const normalizedCategoryName = categoryName.replace("Hóa", "Hoá");

          const category = predefinedCategories.find(c => c.name === normalizedCategoryName);
          if (!category) {
            console.warn(`Không tìm thấy danh mục "${categoryName}" trong hệ thống`);
            failedCount++;
            continue;
          }
          
          // Create budget with the suggested amount
          const amountValue = parseFloat(amount as string) / 1000; // Convert to the format expected by the API
          
          const budgetPayload = {
            categoryId: category.id,
            limit_amount: amountValue,
            start_date: startDate,
            end_date: endDate,
            spent_amount: 0
          };
          
          const createResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/budgets`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(budgetPayload)
          });
          
          if (createResponse.ok) {
            createdCount++;
          } else {
            console.error(`Không thể tạo ngân sách cho ${categoryName}:`, await createResponse.text());
            failedCount++;
          }
        } catch (error) {
          console.error(`Lỗi khi tạo ngân sách cho ${categoryName}:`, error);
          failedCount++;
        }
      }
      
      // Show results
      if (createdCount > 0) {
        message.success(`Đã tạo ${createdCount} ngân sách gợi ý thành công`);
        fetchBudgets(); // Refresh the budget list
      }
      
      if (failedCount > 0) {
        message.warning(`Không thể tạo ${failedCount} ngân sách`);
      }
      
    } catch (error) {
      console.error('Lỗi khi tạo ngân sách gợi ý:', error);
      message.error('Không thể tạo ngân sách gợi ý: ' + 
        (error instanceof Error ? error.message : 'Lỗi không xác định'));
    } finally {
      hide();
    }
  };

  return (
    <MainLayout>
      <div className={styles.pageHeader}>
        <h1>Ngân Sách</h1>
        <div className={styles.headerButtons}>
        <Button
          type="primary" 
          onClick={handleSuggestBudget}
        >
          Gợi ý Ngân sách
        </Button>
        <Button
          type="primary"
          shape="circle"
          icon={<PlusOutlined />}
          size="large"
          onClick={handleAddButton}
          className={styles.addButton}
        />
      </div>
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
