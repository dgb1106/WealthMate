import { useState, useEffect } from 'react';
import { message } from 'antd';

interface Investment {
  id: string;
  created_at: string;
  amount: number;
  description: string;
  category: {
    name: string;
  };
}

interface InvestmentValues {
  amount: string; 
  description: string;
}

const useInvestments = () => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(false);
  const INVESTMENT_CATEGORY_ID = "18";

  const fetchInvestments = async (selectedMonth: string = 'all', selectedYear: string = new Date().getFullYear().toString()) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      let endpoint = `${process.env.NEXT_PUBLIC_API_URL}/transactions/category/${INVESTMENT_CATEGORY_ID}`;
      const adjustedMonth = selectedMonth !== 'all' ? parseInt(selectedMonth) - 1 : null;
      if (selectedMonth !== 'all' && selectedYear) {
        endpoint = `${process.env.NEXT_PUBLIC_API_URL}/transactions/category/${INVESTMENT_CATEGORY_ID}/month?month=${adjustedMonth}&year=${selectedYear}`;
      }

      const response = await fetch(endpoint, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      
      if (!response.ok) {
        throw new Error('Lấy thông tin đầu tư thất bại');
      }
      
      const data = await response.json();
      setInvestments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch investments:', error);
      message.error('Lấy thông tin đầu tư thất bại');
      setInvestments([]);
    } finally {
      setLoading(false);
    }
  };

  const addInvestment = async (values: InvestmentValues) => {
    try {
      const amount = parseInt(values.amount, 10);
      const signedAmount = -Math.abs(amount) / 1000;
      
      const requestData = {
        categoryId: INVESTMENT_CATEGORY_ID,
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
        throw new Error('Thêm khoản đầu tư thất bại');
      }

      message.success('Thêm khoản đầu tư thành công');
      await fetchInvestments();
    } catch (error) {
      console.error('Failed to add investment:', error);
      message.error('Thêm khoản đầu tư thất bại');
    }
  };

  const updateInvestment = async (id: string, values: InvestmentValues) => {
    try {
      const amount = parseInt(values.amount, 10);
      const signedAmount = -Math.abs(amount) / 1000;

      const requestData = {
        categoryId: INVESTMENT_CATEGORY_ID,
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
        throw new Error('Chỉnh sửa khoản đầu tư thất bại');
      }

      message.success('Chỉnh sửa khoản đầu tư thành công');
      await fetchInvestments();
    } catch (error) {
      console.error('Failed to update investment:', error);
      message.error('Chỉnh sửa khoản đầu tư thất bại');
    }
  };

  const deleteInvestment = async (id: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/transactions/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        throw new Error('Xóa khoản đầu tư thất bại');
      }

      message.success('Xóa khoản đầu tư thành công');
      await fetchInvestments();
    } catch (error) {
      console.error('Failed to delete investment:', error);
      message.error('Xóa khoản đầu tư thất bại');
    }
  };

  return {
    investments,
    loading,
    fetchInvestments,
    addInvestment,
    updateInvestment,
    deleteInvestment,
  };
};

export default useInvestments;