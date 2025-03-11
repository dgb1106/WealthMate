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
import { useTransactions } from '@/hooks/useTransactions';

interface Transaction {
  id: string;
  name: string;
  amount: number;
  date: string;
  method: string;
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
  const { transactions, loading, error, setTransactions } = useTransactions();
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  const handleAddTransaction = async (values: any) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({
          ...values,
          date: values.date.format('DD-MM-YYYY'),
          categoryId: values.categoryId,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add transaction');
      }
      
      message.success('Transaction added successfully');
      setModalVisible(false);
      form.resetFields();
      setTransactions(prev => [...prev, { ...values, id: new Date().toISOString() }]);
    } catch (error) {
      console.error('Failed to add transaction:', error);
      message.error('Failed to add transaction');
    }
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
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Method',
      dataIndex: 'method',
      key: 'method',
    },
    {
      title: 'Category',
      dataIndex: ['category', 'name'],
      key: 'category',
    },
  ];

  const paymentMethods = ['Cash', 'Payment Transfer', 'Credit Card', 'Debit Card'];

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
        {error && <div style={{ color: 'red' }}>{error}</div>}
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
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please enter transaction name' }]}
          >
            <Input placeholder="Transaction name" />
          </Form.Item>

          <Form.Item
            name="date"
            label="Date"
            rules={[{ required: true, message: 'Please select date' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="amount"
            label="Amount"
            rules={[{ required: true, message: 'Please enter amount' }]}
            help="Use negative value for expenses, positive for income"
          >
            <Input type="number" placeholder="Amount" />
          </Form.Item>

          <Form.Item
            name="method"
            label="Method"
            rules={[{ required: true, message: 'Please select payment method' }]}
          >
            <Select placeholder="Select payment method">
              {paymentMethods.map(method => (
                <Select.Option key={method} value={method}>
                  {method}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="categoryId"
            label="Category"
            rules={[{ required: true, message: 'Please select category' }]}
          >
            <Select 
              placeholder="Select category"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) => 
                (option?.children as unknown as string)
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            >
              {predefinedCategories.map(category => (
                <Select.Option 
                  key={category.id} 
                  value={category.id}
                >
                  {category.name} ({category.type === "INCOME" ? "Thu nhập" : "Chi phí"})
                </Select.Option>
              ))}
            </Select>
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
