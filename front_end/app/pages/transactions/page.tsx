"use client";

import React, { useState, useEffect } from 'react';
import MainLayout from '@/layouts/MainLayout/index';
import { 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select,
  message 
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import axios, { AxiosResponse } from 'axios';
import { useRouter } from 'next/navigation';

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
  // ... các category khác ...
  { id: "19", name: "Lương", type: "INCOME" },
  { id: "20", name: "Thu nhập khác", type: "INCOME" },
];

const TransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const router = useRouter();

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const fetchTransactions = async () => {
    if (!apiUrl) {
      message.error('API URL chưa được cấu hình');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${apiUrl}/transactions`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Gửi kèm cookie
      });

      if (response.status === 401) {
        message.error('Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn.');
        // Tuỳ ý: chuyển hướng về trang đăng nhập
        // router.push('/login');
        setLoading(false);
        return;
      }

      if (!response.ok) {
        const errText = await response.text();
        console.error('Lỗi khi fetch transactions:', response.status, errText);
        message.error(`Lỗi khi lấy danh sách: ${errText}`);
        setLoading(false);
        return;
      }

      const data = await response.json();
      setTransactions(Array.isArray(data) ? data : []);
      
      if (Array.isArray(data) && data.length === 0) {
        message.info('Hiện chưa có giao dịch nào');
      }
    } catch (error) {
      console.error('Fetch failed:', error);
      message.error('Đã xảy ra lỗi khi lấy dữ liệu giao dịch');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTransaction = async (values: any) => {
    if (!apiUrl) {
      message.error('API URL chưa được cấu hình');
      return;
    }

    try {
      const payload = {
        description: values.description,
        amount: parseFloat(values.amount),
        categoryId: values.categoryId
      };

      const response = await fetch(`${apiUrl}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Gửi kèm cookie
        body: JSON.stringify(payload),
      });

      if (response.status === 401) {
        message.error('Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn.');
        // Tuỳ ý: chuyển hướng về trang đăng nhập
        // router.push('/login');
        return;
      }

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Error response from server:', errorData);
        throw new Error(`Lỗi khi thêm giao dịch: ${errorData}`);
      }

      // Trường hợp response OK
      await response.json(); // hoặc có thể không cần nếu server trả về rỗng
      message.success('Thêm giao dịch thành công');
      setModalVisible(false);
      form.resetFields();
      fetchTransactions();
    } catch (error) {
      console.error('Failed to add transaction:', error);
      message.error('Thêm giao dịch thất bại: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

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
        return (
          <span style={{ color }}>
            {amount < 0 ? '-' : '+'}{formattedAmount}
          </span>
        );
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
          onFinishFailed={(errorInfo) => {
            console.log('Form validation failed:', errorInfo);
          }}
        >
          <Form.Item
            name="description"
            label="Description"
            rules={[
              { required: true, message: 'Hãy nhập mô tả giao dịch' },
              { max: 255, message: 'Mô tả không vượt quá 255 ký tự' }
            ]}
          >
            <Input placeholder="Mô tả giao dịch" />
          </Form.Item>

          <Form.Item
            name="amount"
            label="Amount"
            rules={[
              { required: true, message: 'Hãy nhập số tiền' },
              { type: 'number', message: 'Số tiền phải là dạng số' },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  const strValue = value.toString();
                  const decimalPart = strValue.split('.')[1];
                  return decimalPart && decimalPart.length > 2
                    ? Promise.reject('Số tiền chỉ được tối đa 2 chữ số thập phân')
                    : Promise.resolve();
                }
              }
            ]}
            help="Dùng giá trị âm cho chi phí, dương cho thu nhập"
          >
            <Input type="number" placeholder="Số tiền" />
          </Form.Item>

          <Form.Item
            name="categoryId"
            label="Category"
            rules={[{ required: true, message: 'Hãy chọn danh mục' }]}
          >
            <Select 
              placeholder="Chọn danh mục"
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
