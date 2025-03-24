'use client'

import { useState, useEffect } from 'react';
import { message } from 'antd';

export enum Frequency {
  DAILY = "DAILY",
  WEEKLY = "WEEKLY",
  MONTHLY = "MONTHLY",
  BIWEEKLY = "BIWEEKLY",
  QUARTERLY = "QUARTERLY",
  YEARLY = "YEARLY"
}

export interface Transaction {
  id: string;
  created_at: string;
  amount: number;
  description: string;
  category: {
    id: string;
    name: string;
  };
}

export interface RecurringTransaction {
  id: string;
  description: string;
  amount: number;
  category: {
    id: string;
    name: string;
  };
  frequency: Frequency;
  start_date: string;
  end_date?: string;
  next_occurrence: string;
}

interface TransactionValues {
  categoryId: string;
  amount: string; 
  description: string;
}

const predefinedCategories = [
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
  { id: "19", name: "Gửi tiết kiệm", type: "Chi phí"},
  { id: "20", name: "Quỹ dự phòng", type: "Chi phí"},
  { id: "21", name: "Lương", type: "Thu nhập" },
  { id: "22", name: "Thu nhập khác", type: "Thu nhập" },
];

const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [recurringLoading, setRecurringLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [recurringTotal, setRecurringTotal] = useState(0);

  const fetchTransactions = async (
    selectedMonth: string, 
    selectedYear: string, 
    selectedType: string, 
    selectedCategory: string,
    page: number = 1,
    pageSize: number = 10
  ) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      let endpoint = `${process.env.NEXT_PUBLIC_API_URL}/transactions`;
      const adjustedMonth = selectedMonth !== 'all' ? parseInt(selectedMonth) - 1 : null;

      if (selectedCategory !== 'all') {
        if (selectedMonth !== 'all' && selectedYear) {
          endpoint = `${process.env.NEXT_PUBLIC_API_URL}/transactions/category/${selectedCategory}/month?month=${adjustedMonth}&year=${selectedYear}`;
        } else {
          endpoint = `${process.env.NEXT_PUBLIC_API_URL}/transactions/category/${selectedCategory}`;
        }
      } else if (selectedMonth !== 'all' && selectedYear) {
        if (selectedType === 'income') {
          endpoint = `${process.env.NEXT_PUBLIC_API_URL}/transactions/income/month?month=${adjustedMonth}&year=${selectedYear}`;
        } else if (selectedType === 'expenses') {
          endpoint = `${process.env.NEXT_PUBLIC_API_URL}/transactions/expenses/month?month=${adjustedMonth}&year=${selectedYear}`;
        } else {
          endpoint = `${process.env.NEXT_PUBLIC_API_URL}/transactions/month?month=${adjustedMonth}&year=${selectedYear}`;
        }
      } else if (selectedType === 'income') {
        endpoint = `${process.env.NEXT_PUBLIC_API_URL}/transactions/income`;
      } else if (selectedType === 'expenses') {
        endpoint = `${process.env.NEXT_PUBLIC_API_URL}/transactions/expenses`;
      }

      // Add pagination parameters
      if (!endpoint.includes('?')) {
        endpoint += `?page=${page}&limit=${pageSize}`;
      } else {
        endpoint += `&page=${page}&limit=${pageSize}`;
      }

      const response = await fetch(endpoint, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      if (!response.ok) {
        throw new Error('Lấy thông tin thất bại');
      }
      const data = await response.json();
      
      // Handle pagination response (assuming API returns { data: [...], total: number })
      if (data.data && typeof data.total === 'number') {
        setTransactions(data.data);
        setTotal(data.total);
      } else {
        setTransactions(Array.isArray(data) ? data : []);
        setTotal(Array.isArray(data) ? data.length : 0);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      message.error('Lấy thông tin thất bại');
      setTransactions([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecurringTransactions = async (
    selectedCategory: string = 'all',
    selectedFrequency: Frequency | 'all' = 'all',
    page: number = 1,
    pageSize: number = 10
  ) => {
    setRecurringLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      let endpoint = `${process.env.NEXT_PUBLIC_API_URL}/recurring-transactions`;
      
      // Add parameters
      if (selectedCategory !== 'all') {
        endpoint = `${process.env.NEXT_PUBLIC_API_URL}/recurring-transactions/category/${selectedCategory}`;
      }
      
      if (selectedFrequency !== 'all') {
        endpoint = `${process.env.NEXT_PUBLIC_API_URL}/recurring-transactions/frequency/${selectedFrequency}`;
      }
      
      // Add pagination
      if (!endpoint.includes('?')) {
        endpoint += `?page=${page}&limit=${pageSize}`;
      } else {
        endpoint += `&page=${page}&limit=${pageSize}`;
      }

      const response = await fetch(endpoint, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      
      if (!response.ok) {
        throw new Error('Lấy thông tin giao dịch định kỳ thất bại');
      }
      
      const data = await response.json();
      
      // Handle pagination response
      if (data.data && typeof data.total === 'number') {
        setRecurringTransactions(data.data);
        setRecurringTotal(data.total);
      } else {
        setRecurringTransactions(Array.isArray(data) ? data : []);
        setRecurringTotal(Array.isArray(data) ? data.length : 0);
      }
    } catch (error) {
      console.error('Failed to fetch recurring transactions:', error);
      message.error('Lấy thông tin giao dịch định kỳ thất bại');
      setRecurringTransactions([]);
      setRecurringTotal(0);
    } finally {
      setRecurringLoading(false);
    }
  };

  const addTransaction = async (values: TransactionValues) => {
    try {
      const category = predefinedCategories.find(c => c.id === values.categoryId);
      const amount = parseInt(values.amount, 10);
      const signedAmount = category?.type === "Chi phí" ? -Math.abs(amount) / 1000 : Math.abs(amount) / 1000;
      const requestData = {
        categoryId: values.categoryId,
        amount: signedAmount,
        description: values.description
      };

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
        throw new Error('Thêm Giao dịch thất bại');
      }

      message.success('Thêm Giao dịch thành công');
      fetchTransactions('all', 'all', 'all', 'all');
    } catch (error) {
      console.error('Failed to add transaction:', error);
      message.error('Thêm Giao dịch thất bại');
    }
  };

  const updateTransaction = async (id: string, values: TransactionValues) => {
    try {
      const category = predefinedCategories.find(c => c.id === values.categoryId);
      const amount = parseInt(values.amount, 10);
      const signedAmount = category?.type === "Chi phí" ? -Math.abs(amount) / 1000 : Math.abs(amount) / 1000;

      const requestData = {
        categoryId: values.categoryId,
        amount: signedAmount,
        description: values.description
      };

      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/transactions/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error('Chỉnh sửa Giao dịch thất bại');
      }

      message.success('Chỉnh sửa Giao dịch thành công');
      fetchTransactions('all', 'all', 'all', 'all');
    } catch (error) {
      console.error('Failed to update transaction:', error);
      message.error('Chỉnh sửa Giao dịch thất bại');
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/transactions/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        throw new Error('Xoá Giao dịch thất bại');
      }

      message.success('Xoá Giao dịch thành công');
      fetchTransactions('all', 'all', 'all', 'all');
    } catch (error) {
      console.error('Failed to delete transaction:', error);
      message.error('Xoá Giao dịch thất bại');
    }
  };

  const addRecurringTransaction = async (values: any) => {
    try {
      const category = predefinedCategories.find(c => c.id === values.categoryId);
      const amount = parseInt(values.amount, 10);
      const signedAmount = category?.type === "Chi phí" ? -Math.abs(amount) / 1000 : Math.abs(amount) / 1000;
      
      const requestData = {
        categoryId: values.categoryId,
        amount: signedAmount,
        description: values.description,
        frequency: values.frequency,
        startDate: values.startDate,
        endDate: values.endDate || null
      };

      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/recurring-transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Đã xảy ra lỗi khi tạo giao dịch định kỳ');
      }

      message.success('Tạo giao dịch định kỳ thành công');
      fetchRecurringTransactions();
    } catch (error: any) {
      console.error('Error adding recurring transaction:', error);
      message.error(error.message || 'Đã xảy ra lỗi khi tạo giao dịch định kỳ');
    }
  };

  const updateRecurringTransaction = async (id: string, values: any) => {
    try {
      const category = predefinedCategories.find(c => c.id === values.categoryId);
      const amount = parseInt(values.amount, 10);
      const signedAmount = category?.type === "Chi phí" ? -Math.abs(amount) / 1000 : Math.abs(amount) / 1000;

      const requestData = {
        categoryId: values.categoryId,
        amount: signedAmount,
        description: values.description,
        frequency: values.frequency,
        startDate: values.startDate,
        endDate: values.endDate || null
      };

      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/recurring-transactions/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error('Chỉnh sửa giao dịch định kỳ thất bại');
      }

      message.success('Chỉnh sửa giao dịch định kỳ thành công');
      fetchRecurringTransactions();
    } catch (error) {
      console.error('Failed to update recurring transaction:', error);
      message.error('Chỉnh sửa giao dịch định kỳ thất bại');
    }
  };

  const deleteRecurringTransaction = async (id: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/recurring-transactions/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        throw new Error('Xoá giao dịch định kỳ thất bại');
      }

      message.success('Xoá giao dịch định kỳ thành công');
      fetchRecurringTransactions();
    } catch (error) {
      console.error('Failed to delete recurring transaction:', error);
      message.error('Xoá giao dịch định kỳ thất bại');
    }
  };

  return {
    transactions,
    recurringTransactions,
    loading,
    recurringLoading,
    total,
    recurringTotal,
    fetchTransactions,
    fetchRecurringTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addRecurringTransaction,
    updateRecurringTransaction,
    deleteRecurringTransaction,
  };
};

export default useTransactions;