"use client";

import React, { useState, useEffect } from 'react';
import MainLayout from '@/layouts/MainLayout/index';
import TransactionTable from '@/components/transactions/TransactionTable';
import TransactionForm from '@/components/transactions/TransactionForm';
import TransactionDetailModal from '@/components/transactions/TransactionDetailModal';
import TransactionFilters from '@/components/transactions/TransactionFilters';
import useTransactions from '@/hooks/useTransactions';
import { Button, Form, Modal, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
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
  type: "Chi phí" | "Thu nhập";
}

const predefinedCategories: Category[] = [
  { id: "1", name: "Ăn uống", type: "Chi phí" },
  { id: "2", name: "Nhà ở", type: "Chi phí" },
  { id: "3", name: "Di chuyển", type: "Chi phí" },
  { id: "4", name: "Giáo dục", type: "Chi phí" },
  { id: "5", name: "Quà tặng", type: "Chi phí" },
  { id: "6", name: "Hoá đơn & Tiện ích", type: "Chi phí" },
  { id: "7", name: "Mua sắm", type: "Chi phí" },
  { id: "8", name: "Làm đẹp", type: "Chi phí" },
  { id: "9", name: "Gia đình", type: "Chi phí" },
  { id: "10", name: "Vật nuôi", type: "Chi phí" },
  { id: "11", name: "Sức khoẻ", type: "Chi phí" },
  { id: "12", name: "Giải trí", type: "Chi phí" },
  { id: "13", name: "Công việc", type: "Chi phí" },
  { id: "14", name: "Bảo hiểm", type: "Chi phí" },
  { id: "15", name: "Các chi phí khác", type: "Chi phí" },
  { id: "16", name: "Trả nợ", type: "Chi phí" },
  { id: "17", name: "Thể thao", type: "Chi phí" },
  { id: "18", name: "Đầu tư", type: "Chi phí" },
  { id: "19", name: "Gửi tiết kiệm", type: "Chi phí" },
  { id: "20", name: "Quỹ dự phòng", type: "Chi phí" },
  { id: "21", name: "Lương", type: "Thu nhập" },
  { id: "22", name: "Thu nhập khác", type: "Thu nhập" },
];

const TransactionsPage: React.FC = () => {
  const {
    transactions,
    loading,
    fetchTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  } = useTransactions();

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

  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    label: `Tháng ${i+1}`,
    value: (i+1).toString()
  }));

  const yearOptions = Array.from({ length: 5 }, (_, i) => ({
    value: (new Date().getFullYear() - i).toString(),
    label: (new Date().getFullYear() - i).toString()
  }));

  const typeOptions = [
    { value: 'all', label: 'Tất cả' },
    { value: 'income', label: 'Thu nhập' },
    { value: 'expenses', label: 'Chi phí' },
  ];

  const categoryOptions = predefinedCategories.map(category => ({
    value: category.id,
    label: category.name,
  }));

  useEffect(() => {
    fetchTransactions(selectedMonth, selectedYear, selectedType, selectedCategory);
  }, [selectedMonth, selectedYear, selectedType, selectedCategory]);

  const handleAddTransaction = async (values: { categoryId: string; amount: string; description: string; }) => {
    await addTransaction(values);
    setModalVisible(false);
    form.resetFields();
  };

  const handleUpdateTransaction = async (values: { categoryId: string; amount: string; description: string; }) => {
    if (selectedTransaction) {
      await updateTransaction(selectedTransaction.id, values);
      setEditModalVisible(false);
    }
  };

  const handleDeleteTransaction = async () => {
    if (selectedTransaction) {
      await deleteTransaction(selectedTransaction.id);
      setDetailModalVisible(false);
    }
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
    message.error('Có lỗi xảy ra khi gửi biểu mẫu.');
  };

  return (
    <MainLayout>
      <div className={styles.header}>
        <h1>Giao Dịch</h1>
        <Button 
          type="primary" 
          shape="circle" 
          icon={<PlusOutlined />} 
          size="large"
          onClick={() => setModalVisible(true)}
          className={styles.addButton}
        />
      </div>

      <TransactionFilters 
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        selectedType={selectedType}
        selectedCategory={selectedCategory}
        monthOptions={monthOptions}
        yearOptions={yearOptions}
        typeOptions={typeOptions}
        categoryOptions={categoryOptions}
        onMonthChange={setSelectedMonth}
        onYearChange={setSelectedYear}
        onTypeChange={setSelectedType}
        onCategoryChange={setSelectedCategory}
      />

      <TransactionTable 
        transactions={transactions} 
        loading={loading} 
        onRowClick={(transaction) => {
          setSelectedTransaction(transaction);
          setDetailModalVisible(true);
        }} 
      />

      <TransactionDetailModal 
        visible={detailModalVisible} 
        transaction={selectedTransaction} 
        onClose={() => setDetailModalVisible(false)} 
        onEdit={() => {
          if (selectedTransaction) {
            editForm.setFieldsValue({
              description: selectedTransaction.description,
              amount: Math.abs(selectedTransaction.amount * 1000).toString(),
              categoryId: selectedTransaction.category.id
            });
            setDetailModalVisible(false);
            setEditModalVisible(true);
          }
        }} 
        onDelete={handleDeleteTransaction} 
      />

      {/* Modal thêm giao dịch */}
      <Modal
        visible={modalVisible}
        title="Thêm giao dịch mới"
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <TransactionForm 
          form={form}
          onFinish={handleAddTransaction}
          onFinishFailed={onFinishFailed}
          isEdit={false}
        />
      </Modal>

      {/* Modal chỉnh sửa giao dịch */}
      <Modal
        visible={editModalVisible}
        title="Chỉnh sửa giao dịch"
        onCancel={() => setEditModalVisible(false)}
        footer={null}
      >
        <TransactionForm 
          form={editForm} 
          onFinish={handleUpdateTransaction} 
          onFinishFailed={onFinishFailed}
          isEdit={true} 
        />
      </Modal>
    </MainLayout>
  );
};

export default TransactionsPage;
