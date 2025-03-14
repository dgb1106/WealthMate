'use client';

import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Progress, Tabs } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import MainLayout from '@/layouts/MainLayout';
import BudgetCard from '@/components/budgets/budgetCard';
import dayjs from 'dayjs';

// Define the Budget interface based on your backend structure
interface Budget {
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
  name: string;
}

// This would be replaced with your actual categories from your API
const predefinedCategories = [
  { id: "1", name: "Ăn uống", type: "EXPENSE" },
  { id: "2", name: "Nhà ở", type: "EXPENSE" },
  { id: "3", name: "Di chuyển", type: "EXPENSE" },
  { id: "4", name: "Giáo dục", type: "EXPENSE" },
  { id: "5", name: "Quà tặng", type: "EXPENSE" },
  { id: "6", name: "Hoá đơn & Tiện ích", type: "EXPENSE" },
  { id: "7", name: "Mua sắm", type: "EXPENSE" },
  { id: "8", name: "Làm đẹp", type: "EXPENSE" },
  { id: "9", name: "Gia đình", type: "EXPENSE" },
  { id: "10", name: "Vật nuôi", type: "EXPENSE" },
  { id: "11", name: "Sức khoẻ", type: "EXPENSE" },
  { id: "12", name: "Giải trí", type: "EXPENSE" },
  { id: "13", name: "Công việc", type: "EXPENSE" },
  { id: "14", name: "Bảo hiểm", type: "EXPENSE" },
  { id: "15", name: "Các chi phí khác", type: "EXPENSE" },
  { id: "16", name: "Trả nợ", type: "EXPENSE" },
  { id: "17", name: "Thể thao", type: "EXPENSE" },
  { id: "18", name: "Đầu tư", type: "EXPENSE" },
];

const BudgetsPage: React.FC = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentBudgetId, setCurrentBudgetId] = useState<string | null>(null);
  const [budgetView, setBudgetView] = useState<'all' | 'current' | 'month'>('current');
  const [form] = Form.useForm();

  // Fetch budgets based on the selected view
  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      let endpoint = '/budgets';
      
      if (budgetView === 'current') {
        endpoint = '/budgets/current';
      } else if (budgetView === 'month') {
        endpoint = '/budgets/current-month';
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch budgets');
      }
      
      const data = await response.json();
      setBudgets(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch budgets:', error);
      message.error('Failed to load budgets');
      setBudgets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [budgetView]);

  const handleAddBudget = async (values: any) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        message.error('Authentication error: No token found');
        return;
      }
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        message.error('Configuration error: API URL is not defined');
        return;
      }

      const baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
      
      const payload = {
        name: values.name,
        limit_amount: parseFloat(values.limit_amount),
        categoryId: values.categoryId,
        start_date: values.start_date,
        end_date: values.end_date
      };
      
      const response = await fetch(`${baseUrl}/budgets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed: ${response.status} ${errorData}`);
      }
      
      message.success('Budget added successfully');
      setModalVisible(false);
      form.resetFields();
      fetchBudgets();
    } catch (error) {
      console.error('Failed to save budget:', error);
      message.error('Failed to save budget: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleEditBudget = async (budget: Budget) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        message.error('Authentication error: No token found');
        return;
      }
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        message.error('Configuration error: API URL is not defined');
        return;
      }

      const payload = {
        name: budget.name,
        limit_amount: budget.limit_amount,
        categoryId: budget.categoryId,
        start_date: budget.start_date,
        end_date: budget.end_date
      };

      const baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;

      const response = await fetch(`${baseUrl}/budgets/${currentBudgetId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed: ${response.status} ${errorData}`);
      }
      
      message.success('Budget updated successfully');
      setModalVisible(false);
      form.resetFields();
      setCurrentBudgetId(null);
      fetchBudgets();
    } catch (error) {
      console.error('Failed to update budget:', error);
      message.error('Failed to update budget: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleDeleteBudget = async (id: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/budgets/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete budget');
      }
      
      message.success('Budget deleted successfully');
      fetchBudgets();
    } catch (error) {
      console.error('Failed to delete budget:', error);
      message.error('Failed to delete budget');
    }
  };

  const handleAddButton = () => {
    setCurrentBudgetId(null);
    setModalVisible(true);
    setTimeout(() => {
      form.resetFields();
    }, 0);
  };

  return (
    <MainLayout>
      <h1>Budgets</h1>
      <Tabs
        activeKey={budgetView}
        onChange={(key) => setBudgetView(key as 'all' | 'current' | 'month')}
        items={[
          { key: 'current', label: 'Active Budgets' },
          { key: 'month', label: 'This Month' },
          { key: 'all', label: 'All Budgets' }
        ]}
      />
      <div className="grid grid-cols-3 gap-6 p-6">
        {/* Budget Cards Section - Takes 2/3 of the width */}
        <div className="col-span-2 grid grid-cols-2 gap-4">
          {budgets.map((budget) => (
            <BudgetCard key={budget.id} budget={budget} onEdit={() => setCurrentBudgetId(budget.id)} />
          ))}
        </div>

        {/* Right Column */}
        <div className="col-span-1">
          <Button
            type="primary"
            shape="circle"
            icon={<PlusOutlined />}
            size="large"
            onClick={handleAddButton}
            style={{
              position: 'fixed',
              bottom: '24px',
              right: '24px',
              width: '56px',
              height: '56px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
              zIndex: 1000
            }}
          />
        </div>
      </div>

      <Modal
        title={currentBudgetId ? "Edit Budget" : "Add Budget"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        destroyOnClose={true}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={currentBudgetId ? handleEditBudget : handleAddBudget}
        >
          <Form.Item
            name="name"
            label="Budget Name"
            rules={[{ required: true, message: "Please enter a budget name" }]}
          >
            <Input placeholder="e.g. Monthly Groceries" />
          </Form.Item>

          <Form.Item
            name="limit_amount"
            label="Budget Amount"
            rules={[{ required: true, message: "Please enter a budget amount" }]}
          >
            <Input type="number" placeholder="0.00" />
          </Form.Item>

          <Form.Item
            name="categoryId"
            label="Category"
            rules={[{ required: true, message: "Please select a category" }]}
          >
            <Select placeholder="Select a category">
              {predefinedCategories.map(category => (
                <Select.Option key={category.id} value={category.id}>
                  {category.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="start_date"
            label="Start Date"
            rules={[{ required: true, message: "Please select a start date" }]}
          >
            <Input type="date" />
          </Form.Item>

          <Form.Item
            name="end_date"
            label="End Date"
            rules={[{ required: true, message: "Please select an end date" }]}
          >
            <Input type="date" />
          </Form.Item>

          <Form.Item>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <Button onClick={() => setModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                {currentBudgetId ? "Save Changes" : "Add Budget"}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </MainLayout>
  );
};

export default BudgetsPage;