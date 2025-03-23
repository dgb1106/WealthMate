import { useState, useEffect } from 'react';
import { message } from 'antd';


interface Transaction {
  id: string;
  created_at: string;
  amount: number;
  description: string;
  category: {
    name: string;
  };
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
  const [loading, setLoading] = useState(false);

  const fetchTransactions = async (selectedMonth: string, selectedYear: string, selectedType: string, selectedCategory: string) => {
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
      setTransactions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      message.error('Lấy thông tin thất bại');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = async (values: TransactionValues) => {
    try {
      const category = predefinedCategories.find(c => c.id === values.categoryId);
      const amount = parseInt(values.amount, 10);
      const signedAmount = category?.type === "Chi phí" ? Math.abs(amount) / 1000 : Math.abs(amount) / 1000;
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
      const signedAmount = category?.type === "Chi phí" ? Math.abs(amount) / 1000 : Math.abs(amount) / 1000;

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

  const addRecurringTransaction = async (transactionData: any) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/recurring-transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(transactionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Đã xảy ra lỗi khi tạo giao dịch định kỳ');
      }

      message.success('Tạo giao dịch định kỳ thành công');
      fetchTransactions('all', 'all', 'all', 'all');
    } catch (error: any) {
      console.error('Error adding recurring transaction:', error);
      message.error(error.message || 'Đã xảy ra lỗi khi tạo giao dịch định kỳ');
    }
  };

  return {
    transactions,
    loading,
    fetchTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addRecurringTransaction,
  };
};

export default useTransactions;