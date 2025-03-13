"use client";

import React, { useState, useEffect } from 'react';
import MainLayout from '@/layouts/MainLayout/index';
import { 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  DatePicker, 
  Select,
  message 
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: {
    id: string;
    name: string;
  };
}

interface Category {
  id: string;
  name: string;
  type: "EXPENSE" | "INCOME";
}

const predefinedCategories: Category[] = [
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
  { id: "19", name: "Lương", type: "INCOME" },
  { id: "20", name: "Thu nhập khác", type: "INCOME" },
];

const TransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/transactions`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }
      const data = await response.json();
      setTransactions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      message.error('Failed to load transactions');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleAddTransaction = async (values: any) => {
    console.log('Form values received:', values); // Debug logging
    
    try {
      const category = predefinedCategories.find(c => c.id === values.categoryId);
      const amount = parseInt(values.amount, 10);
      const signedAmount = category?.type === "EXPENSE" ? Math.abs(amount) : Math.abs(amount);
      const requestData = {
        categoryId: values.categoryId,
        amount: signedAmount,
        description: values.description
      };
      
      console.log('Sending request data:', requestData);
      
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error:', errorText);
        throw new Error('Failed to add transaction');
      }
      
      message.success('Transaction added successfully');
      setModalVisible(false);
      form.resetFields();
      fetchTransactions();
    } catch (error) {
      console.error('Failed to add transaction:', error);
      message.error('Failed to add transaction');
    }
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Form validation failed:', errorInfo);
  };
  

  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (text: string) => dayjs(text).format('DD MMM'),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => {
        const color = amount < 0 ? 'red' : 'green';
        const formattedAmount = new Intl.NumberFormat('en-US').format(Math.abs(amount));
        return <span style={{ color }}>{amount < 0 ? '-' : '+'}{formattedAmount}</span>;
      },
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Category',
      dataIndex: ['category', 'name'],
      key: 'category',
    },
  ];

  return (
    <MainLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1>Transactions</h1>
        <Button 
          type="primary" 
          shape="circle" 
          icon={<PlusOutlined />} 
          size="large"
          onClick={() => setModalVisible(true)}
          style={{ backgroundColor: '#1a1a47' }}
        />
      </div>

      <div style={{ backgroundColor: '#f5f7ff', padding: '16px', borderRadius: '8px' }}>
        <div style={{ marginBottom: '16px', display: 'flex', gap: '8px' }}>
          <Button type="default" style={{ borderRadius: '20px' }}>All</Button>
          <Button type="default" style={{ borderRadius: '20px' }}>2025</Button>
        </div>

        <Table 
          dataSource={transactions} 
          columns={columns} 
          rowKey="id" 
          loading={loading}
          pagination={false}
          style={{ 
            backgroundColor: 'white', 
            borderRadius: '8px',
            overflow: 'hidden'
          }}
        />
      </div>

      <Modal
        title="Adding a New Transaction"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddTransaction}
          onFinishFailed={onFinishFailed}
        >
          <Form.Item
            name="description"
            label="Description"
            rules={[
              { required: true, message: 'Description is required' },
              { max: 255, message: 'Description cannot exceed 255 characters' }
            ]}
          >
            <Input placeholder="Transaction description" />
          </Form.Item>

          <Form.Item
            name="amount"
            label="Amount"
            rules={[
              { required: true, message: 'Amount is required' },
              { 
                validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  
                  try {
                    const numValue = parseInt(value, 10);
                    
                    if (isNaN(numValue)) {
                      return Promise.reject('Amount must be a valid number');
                    }  
                    if (numValue <= 0) {
                      return Promise.reject('Amount must be a positive integer');
                    }
                    if (numValue.toString() !== value.toString()) {
                      return Promise.reject('Amount must be a whole number');
                    }
                    
                    return Promise.resolve();
                  } catch (err) {
                    return Promise.reject('Invalid amount format');
                  }
                }
              }
            ]}
            help="Enter a positive integer amount"
          >
            <Input type="number" min="1" step="1" placeholder="Amount" />
          </Form.Item>

          <Form.Item
            name="categoryId"
            label="Category"
            rules={[{ required: true, message: 'Category is required' }]}
          >
            <Select 
              placeholder="Select category"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) => 
                (option?.label as string).toLowerCase().includes(input.toLowerCase())
              }
              options={predefinedCategories.map(category => ({
                value: category.id,
                label: `${category.name} (${category.type === "INCOME" ? "Thu nhập" : "Chi phí"})`
              }))}
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Add Transaction
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </MainLayout>
  );
};

export default TransactionsPage;