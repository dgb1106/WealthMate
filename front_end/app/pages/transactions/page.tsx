"use client";

import React, { useState, useEffect } from 'react';
import MainLayout from '@/layouts/MainLayout/index';
import TransactionTable from '@/components/transactions/TransactionTable';
import RecurringTransactionTable from '@/components/transactions/RecurringTransactionTable';
import TransactionForm from '@/components/transactions/TransactionForm';
import TransactionDetailModal from '@/components/transactions/TransactionDetailModal';
import RecurringTransactionDetailModal from '@/components/transactions/RecurringTransactionDetailModal';
import TransactionFilters from '@/components/transactions/TransactionFilters';
import RecurringTransactionFilters from '@/components/transactions/RecurringTransactionFilters';
import useTransactions, { Transaction, RecurringTransaction, Frequency } from '@/hooks/useTransactions';
import { Button, Form, Modal, message, Dropdown, Menu, Divider, Typography } from 'antd';
import { PlusOutlined, DownOutlined } from '@ant-design/icons';
import styles from './styles.module.css';
import RecurringTransactionForm from '@/components/transactions/RecurringTransactionForm';
import GroupTransactionForm from '@/components/transactions/GroupTransactionForm';

const { Title } = Typography;

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
    recurringTransactions,
    loading,
    recurringLoading,
    fetchTransactions,
    fetchRecurringTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addRecurringTransaction,
    updateRecurringTransaction,
    deleteRecurringTransaction,
    addGroupTransaction,
  } = useTransactions();

  // Regular transaction states
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
  
  // Recurring transaction states
  const [recurringModalVisible, setRecurringModalVisible] = useState(false);
  const [recurringForm] = Form.useForm();
  const [recurringEditForm] = Form.useForm();
  const [recurringDetailModalVisible, setRecurringDetailModalVisible] = useState(false);
  const [recurringEditModalVisible, setRecurringEditModalVisible] = useState(false);
  const [selectedRecurringTransaction, setSelectedRecurringTransaction] = useState<RecurringTransaction | null>(null);
  const [selectedRecurringCategory, setSelectedRecurringCategory] = useState<string>("all");
  const [selectedFrequency, setSelectedFrequency] = useState<string>("all");

  // Group transaction states
  const [groupModalVisible, setGroupModalVisible] = useState(false);
  const [groupForm] = Form.useForm();

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  
  const [recurringCurrentPage, setRecurringCurrentPage] = useState(1);
  const [recurringPageSize, setRecurringPageSize] = useState(10);
  const [recurringTotal, setRecurringTotal] = useState(0);

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
    fetchTransactions(selectedMonth, selectedYear, selectedType, selectedCategory, currentPage, pageSize);
  }, [selectedMonth, selectedYear, selectedType, selectedCategory, currentPage, pageSize]);

  useEffect(() => {
    fetchRecurringTransactions(selectedRecurringCategory, selectedFrequency as Frequency | 'all', recurringCurrentPage, recurringPageSize);
  }, [selectedRecurringCategory, selectedFrequency, recurringCurrentPage, recurringPageSize]);

  const handleAddTransaction = async (values: { categoryId: string; amount: string; description: string; }) => {
    const positiveAmount = Math.abs(parseFloat(values.amount)).toString();
    const submissionValues = {
      ...values,
      amount: positiveAmount
    };
    await addTransaction(submissionValues);
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

  const handleAddRecurringTransaction = async (values: any) => {
    await addRecurringTransaction(values);
    setRecurringModalVisible(false);
    recurringForm.resetFields();
  };

  const handleUpdateRecurringTransaction = async (values: any) => {
    if (selectedRecurringTransaction) {
      await updateRecurringTransaction(selectedRecurringTransaction.id, values);
      setRecurringEditModalVisible(false);
    }
  };

  const handleDeleteRecurringTransaction = async () => {
    if (selectedRecurringTransaction) {
      await deleteRecurringTransaction(selectedRecurringTransaction.id);
      setRecurringDetailModalVisible(false);
    }
  };

  const handleAddGroupTransaction = async (values: any) => {
    await addGroupTransaction(values);
    setGroupModalVisible(false);
    groupForm.resetFields();
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
    message.error('Có lỗi xảy ra khi gửi biểu mẫu.');
  };

  const handlePaginationChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  const handleRecurringPaginationChange = (page: number, size: number) => {
    setRecurringCurrentPage(page);
    setRecurringPageSize(size);
  };

  const addButtonMenu = (
    <Menu
      items={[
        {
          key: '1',
          label: 'Tạo giao dịch thường mới',
          onClick: () => setModalVisible(true),
        },
        {
          key: '2',
          label: 'Tạo giao dịch định kì mới',
          onClick: () => setRecurringModalVisible(true),
        },
        {
          key: '3',
          label: 'Tạo giao dịch nhóm',
          onClick: () => setGroupModalVisible(true),
        },
      ]}
    />
  );

  return (
    <MainLayout>
      <div className={styles.header}>
        <h1>Giao Dịch</h1>
        <Dropdown overlay={addButtonMenu} trigger={['click']} placement="bottomRight">
          <Button 
            type="primary" 
            shape="circle" 
            icon={<PlusOutlined />} 
            size="large"
            className={styles.addButton}
          />
        </Dropdown>
      </div>

      {/* Regular Transactions Section */}
      <section className={styles.section}>
        <Title level={3}>Giao dịch thường</Title>
        
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
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            onChange: handlePaginationChange
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
      </section>

      <Divider />

      {/* Recurring Transactions Section */}
      <section className={styles.section}>
        <Title level={3}>Giao dịch định kỳ</Title>
        
        <RecurringTransactionFilters
          selectedCategory={selectedRecurringCategory}
          selectedFrequency={selectedFrequency}
          categoryOptions={categoryOptions}
          onCategoryChange={setSelectedRecurringCategory}
          onFrequencyChange={setSelectedFrequency}
        />

        <RecurringTransactionTable
          transactions={recurringTransactions}
          loading={recurringLoading}
          onRowClick={(transaction) => {
            setSelectedRecurringTransaction(transaction as RecurringTransaction);
            setRecurringDetailModalVisible(true);
          }}
          pagination={{
            current: recurringCurrentPage,
            pageSize: recurringPageSize,
            total: recurringTotal,
            onChange: handleRecurringPaginationChange
          }}
        />

        <RecurringTransactionDetailModal
          visible={recurringDetailModalVisible}
          transaction={selectedRecurringTransaction}
          onClose={() => setRecurringDetailModalVisible(false)}
          onEdit={() => {
            if (selectedRecurringTransaction) {
              recurringEditForm.setFieldsValue({
                description: selectedRecurringTransaction.description,
                amount: Math.abs(selectedRecurringTransaction.amount * 1000).toString(),
                categoryId: selectedRecurringTransaction.category.id,
                frequency: selectedRecurringTransaction.frequency,
                startDate: selectedRecurringTransaction.start_date,
                endDate: selectedRecurringTransaction.end_date
              });
              setRecurringDetailModalVisible(false);
              setRecurringEditModalVisible(true);
            }
          }}
          onDelete={handleDeleteRecurringTransaction}
        />
      </section>

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

      {/* Modal thêm giao dịch định kỳ */}
      <Modal
        visible={recurringModalVisible}
        title="Thêm giao dịch định kỳ mới"
        onCancel={() => {
          setRecurringModalVisible(false);
          recurringForm.resetFields();
        }}
        footer={null}
      >
        <RecurringTransactionForm 
          form={recurringForm}
          onFinish={handleAddRecurringTransaction}
          onFinishFailed={onFinishFailed}
          isEdit={false}
        />
      </Modal>

      {/* Modal thêm giao dịch nhóm */}
      <Modal
        visible={groupModalVisible}
        title="Thêm giao dịch nhóm mới"
        onCancel={() => {
          setGroupModalVisible(false);
          groupForm.resetFields();
        }}
        footer={null}
      >
        <GroupTransactionForm 
          form={groupForm}
          onFinish={handleAddGroupTransaction}
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

      {/* Modal chỉnh sửa giao dịch định kỳ */}
      <Modal
        visible={recurringEditModalVisible}
        title="Chỉnh sửa giao dịch định kỳ"
        onCancel={() => setRecurringEditModalVisible(false)}
        footer={null}
      >
        <RecurringTransactionForm 
          form={recurringEditForm} 
          onFinish={handleUpdateRecurringTransaction} 
          onFinishFailed={onFinishFailed}
          isEdit={true} 
        />
      </Modal>
    </MainLayout>
  );
};

export default TransactionsPage;