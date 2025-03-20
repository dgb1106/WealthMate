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
import styles from './styles.module.css';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  created_at: string;
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
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      let endpoint = `${process.env.NEXT_PUBLIC_API_URL}/transactions`;
      const adjustedMonth = selectedMonth !== 'all' ? parseInt(selectedMonth) - 1 : null;
      
      if (selectedCategory !== 'all') {
        if (selectedMonth !== 'all' && selectedYear) {
          endpoint = `${process.env.NEXT_PUBLIC_API_URL}/transactions/category/${selectedCategory}/month?month=${adjustedMonth}&year=${selectedYear}`;
        } 
        else {
          endpoint = `${process.env.NEXT_PUBLIC_API_URL}/transactions/category/${selectedCategory}`;
        }
      }
      else if (selectedMonth !== 'all' && selectedYear) {
        if (selectedType === 'income') {
          endpoint = `${process.env.NEXT_PUBLIC_API_URL}/transactions/income/month?month=${adjustedMonth}&year=${selectedYear}`;
        } else if (selectedType === 'expenses') {
          endpoint = `${process.env.NEXT_PUBLIC_API_URL}/transactions/expenses/month?month=${adjustedMonth}&year=${selectedYear}`;
        } else {
          endpoint = `${process.env.NEXT_PUBLIC_API_URL}/transactions/month?month=${adjustedMonth}&year=${selectedYear}`;
        }
      } 
      else if (selectedType === 'income') {
        endpoint = `${process.env.NEXT_PUBLIC_API_URL}/transactions/income`;
      } else if (selectedType === 'expenses') {
        endpoint = `${process.env.NEXT_PUBLIC_API_URL}/transactions/expenses`;
      }
      
      const response = await fetch(endpoint, {
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
  }, [selectedType, selectedMonth, selectedYear, selectedCategory]);

  const handleAddTransaction = async (values: any) => {
    console.log('Form values received:', values);
    
    try {
      const category = predefinedCategories.find(c => c.id === values.categoryId);
      const amount = parseInt(values.amount, 10);
      const signedAmount = category?.type === "EXPENSE" ? Math.abs(amount)/1000 : Math.abs(amount)/1000;
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
  
  const handleRowClick = (record: Transaction) => {
    setSelectedTransaction(record);
    setDetailModalVisible(true);
  };
  
  const columns = [
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text: string) => dayjs(text).format('DD MMM'),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => {
        const adjustedAmount = amount * 1000;
        const formattedAmount = new Intl.NumberFormat('en-US').format(Math.abs(adjustedAmount));
        return <span className={adjustedAmount < 0 ? styles.negativeAmount : styles.positiveAmount}>
          {adjustedAmount < 0 ? '-' : '+'}{formattedAmount}
        </span>;
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

  const monthOptions = [
    { value: 'all', label: 'All' },
    { value: '1', label: 'Jan' },
    { value: '2', label: 'Feb' },
    { value: '3', label: 'Mar' },
    { value: '4', label: 'Apr' },
    { value: '5', label: 'May' },
    { value: '6', label: 'Jun' },
    { value: '7', label: 'Jul' },
    { value: '8', label: 'Aug' },
    { value: '9', label: 'Sep' },
    { value: '10', label: 'Oct' },
    { value: '11', label: 'Nov' },
    { value: '12', label: 'Dec' },
  ];

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 6 }, (_, i) => ({
    value: (currentYear - i).toString(),
    label: (currentYear - i).toString(),
  }));

  const typeOptions = [
    { value: 'all', label: 'All' },
    { value: 'income', label: 'Income' },
    { value: 'expenses', label: 'Expenses' },
  ];

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    ...predefinedCategories.map(category => ({
      value: category.id,
      label: category.name
    }))
  ];

  const handleEditTransaction = () => {
    if (selectedTransaction) {
      const category = predefinedCategories.find(c => c.id === selectedTransaction.category.id);
      // Chuyển đổi từ giá trị lưu trữ (vd: 500) sang giá trị hiển thị (vd: 500000)
      const amount = Math.abs(selectedTransaction.amount * 1000);

      editForm.setFieldsValue({
        description: selectedTransaction.description,
        amount: amount,
        categoryId: selectedTransaction.category.id
      });

      setDetailModalVisible(false);
      setEditModalVisible(true);
    }
  };

  const handleUpdateTransaction = async (values: any) => {
    if (!selectedTransaction) return;
    
    try {
      const category = predefinedCategories.find(c => c.id === values.categoryId);
      // Số nguyên người dùng nhập vào (vd: 500000)
      const amount = parseInt(values.amount, 10);
      // Chuyển đổi sang giá trị lưu trữ (vd: 500) và xác định dấu dựa trên loại giao dịch
      const signedAmount = category?.type === "EXPENSE" ? Math.abs(amount) / 1000 : Math.abs(amount) / 1000;
      
      const requestData = {
        categoryId: values.categoryId,
        amount: signedAmount,
        description: values.description
      };
      
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/transactions/${selectedTransaction.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update transaction');
      }
      
      message.success('Transaction updated successfully');
      setEditModalVisible(false);
      fetchTransactions();
    } catch (error) {
      console.error('Failed to update transaction:', error);
      message.error('Failed to update transaction');
    }
  };

  const handleDeleteTransaction = async () => {
    if (!selectedTransaction) return;
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/transactions/${selectedTransaction.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete transaction');
      }
      
      message.success('Transaction deleted successfully');
      setDetailModalVisible(false);
      fetchTransactions();
    } catch (error) {
      console.error('Failed to delete transaction:', error);
      message.error('Failed to delete transaction');
    }
  };

  const confirmDelete = () => {
    Modal.confirm({
      title: 'Are you sure you want to delete this transaction?',
      content: 'This action cannot be undone.',
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: handleDeleteTransaction
    });
  };

  return (
    <MainLayout>
      <div className={styles.header}>
        <h1>Transactions</h1>
        <Button 
          type="primary" 
          shape="circle" 
          icon={<PlusOutlined />} 
          size="large"
          onClick={() => setModalVisible(true)}
          className={styles.addButton}
        />
      </div>

      <div className={styles.container}>
        <div className={styles.filterButtonsContainer}>
          <Select
            value={selectedMonth}
            onChange={(value) => setSelectedMonth(value)}
            options={monthOptions}
            className={styles.filterSelect}
            style={{ width: 100 }}
          />
          <Select
            value={selectedYear}
            onChange={(value) => setSelectedYear(value)}
            options={yearOptions}
            className={styles.filterSelect}
            style={{ width: 100 }}
          />
          <Select
            value={selectedType}
            onChange={(value) => setSelectedType(value)}
            options={typeOptions}
            className={styles.filterSelect}
            style={{ width: 120 }}
          />
          <Select
            value={selectedCategory}
            onChange={(value) => setSelectedCategory(value)}
            options={categoryOptions}
            className={styles.filterSelect}
            style={{ width: 180 }}
            showSearch
            optionFilterProp="label"
            filterOption={(input, option) => 
              (option?.label as string).toLowerCase().includes(input.toLowerCase())
            }
            placeholder="Select category"
          />
        </div>

        <Table 
          dataSource={transactions} 
          columns={columns} 
          rowKey="id" 
          loading={loading}
          pagination={false}
          className={styles.tableContainer}
          onRow={(record) => ({
            onClick: () => handleRowClick(record),
            style: { cursor: 'pointer' }
          })}
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

      <Modal
        title="Transaction Details"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="delete" danger onClick={confirmDelete}>
            Delete
          </Button>,
          <Button key="edit" type="primary" onClick={handleEditTransaction}>
            Edit
          </Button>,
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Close
          </Button>
        ]}
      >
        {selectedTransaction && (
          <div className={styles.transactionDetails}>
            <p>
              <strong>Date:</strong> {dayjs(selectedTransaction.created_at).format('MMMM D, YYYY')}
            </p>
            <p>
              <strong>Amount:</strong>{' '}
              <span className={selectedTransaction.amount < 0 ? styles.negativeAmount : styles.positiveAmount}>
                {selectedTransaction.amount < 0 ? '-' : '+'}
                {new Intl.NumberFormat('en-US').format(Math.abs(selectedTransaction.amount * 1000))}
              </span>
            </p>
            <p>
              <strong>Description:</strong> {selectedTransaction.description}
            </p>
            <p>
              <strong>Category:</strong> {selectedTransaction.category.name}
            </p>
            <p>
              <strong>Type:</strong>{' '}
              {selectedTransaction.amount < 0 ? 'Expense' : 'Income'}
            </p>
            <p>
              <strong>Transaction ID:</strong> {selectedTransaction.id}
            </p>
          </div>
        )}
      </Modal>

      <Modal
        title="Edit Transaction"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleUpdateTransaction}
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
              Update Transaction
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </MainLayout>
  );
};

export default TransactionsPage;