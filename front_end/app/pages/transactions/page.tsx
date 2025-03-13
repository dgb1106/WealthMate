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
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...values,
          date: values.date.format('DD-MM-YYYY'),
          categoryId: values.categoryId,
          amount: parseFloat(values.amount),
        }),
      });
      
      if (!response.ok) {
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
        >
          <Form.Item
            name="description"
            label="Description"
            rules={[
              { required: true, message: 'Please enter transaction description' },
              { max: 255, message: 'Description cannot exceed 255 characters' }
            ]}
          >
            <Input placeholder="Transaction description" />
          </Form.Item>

          <Form.Item
            name="amount"
            label="Amount"
            rules={[
              { required: true, message: 'Please enter amount' },
              { type: 'number', message: 'Amount must be a number' },
              { validator: (_, value) => 
                  value && value.toString().split('.')[1]?.length > 2 
                  ? Promise.reject('Amount must have at most 2 decimal places') 
                  : Promise.resolve()
              }
            ]}
            help="Use negative value for expenses, positive for income"
          >
            <Input type="number" placeholder="Amount" />
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