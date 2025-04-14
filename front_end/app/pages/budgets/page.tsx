'use client';

import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Input, Select, message, Tabs, Table } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import MainLayout from '@/layouts/MainLayout';
import BudgetCard from '@/components/budgets/budgetCard';
import LoanCard from '@/components/loans/loanCard';
import dayjs from 'dayjs';
import styles from './styles.module.css';
import CategoryChart from '@/components/budgets/chart';
import HighInterestLoanTable from '@/components/loans/HighInterestLoanTable';
import PaymentPriorityTable from '@/components/loans/PaymentPriorityTable';

interface Budget {
  id: string;
  categoryId: string;
  category: {
    id: string;
    name: string;
    type: string;
  };
  limit_amount: number;
  spent_amount: number; 
  start_date: string;
  end_date: string;
}

interface Loan {
  id: number;
  userId: string;
  name: string;
  total_amount: number;
  remaining_amount: number;
  interest_rate: number;
  monthly_payment: number;
  due_date: Date;
  created_at: Date;
  status: 'ACTIVE' | 'PAID' | 'DEFAULTED';
  description?: string;
}

interface RepaymentPlanItem {
  payment_date: string;
  payment_amount: number;
  principal_payment: number;
  interest_payment: number;
  remaining_principal: number;
}

interface HighInterestLoan {
  id: string;
  name: string;
  interest_rate: number;
}

interface PaymentPriorityLoan {
  id: string;
  name: string;
  interest_rate: number;
  monthly_interest: number;
}

interface PortfolioAnalysis {
  total_debt: number;
  monthly_payment: number;
  debt_to_payment_ratio: number | string;
  high_interest_loans: HighInterestLoan[];
  payment_priority: PaymentPriorityLoan[];
  recommendations: string[];
}


// Ví dụ categories (thay bằng API thật nếu cần)
const predefinedCategories = [
  { id: '1', name: 'Ăn uống', type: 'EXPENSE' },
  { id: '2', name: 'Nhà ở', type: 'EXPENSE' },
  { id: '3', name: 'Di chuyển', type: 'EXPENSE' },
  { id: '4', name: 'Giáo dục', type: 'EXPENSE' },
  { id: '5', name: 'Quà tặng', type: 'EXPENSE' },
  { id: '6', name: 'Hoá đơn & Tiện ích', type: 'EXPENSE' },
  { id: '7', name: 'Mua sắm', type: 'EXPENSE' },
  { id: '8', name: 'Làm đẹp', type: 'EXPENSE' },
  { id: '9', name: 'Gia đình', type: 'EXPENSE' },
  { id: '10', name: 'Vật nuôi', type: 'EXPENSE' },
  { id: '11', name: 'Sức khoẻ', type: 'EXPENSE' },
  { id: '12', name: 'Giải trí', type: 'EXPENSE' },
  { id: '13', name: 'Công việc', type: 'EXPENSE' },
  { id: '14', name: 'Bảo hiểm', type: 'EXPENSE' },
  { id: '15', name: 'Các chi phí khác', type: 'EXPENSE' },
  { id: '16', name: 'Trả nợ', type: 'EXPENSE' },
  { id: '17', name: 'Thể thao', type: 'EXPENSE' },
  { id: '18', name: 'Đầu tư', type: 'EXPENSE' },
];

const BudgetsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('1');
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(false);
  const [budgetModalVisible, setBudgetModalVisible] = useState(false);
  const [loanModalVisible, setLoanModalVisible] = useState(false);
  const [currentBudgetId, setCurrentBudgetId] = useState<string | null>(null);
  const [budgetView, setBudgetView] = useState<'Tất cả' | 'Hiện tại' | 'Theo tháng'>('Hiện tại');
  const [currentLoanId, setCurrentLoanId] = useState<number | null>(null);
  const [loanView, setLoanView] = useState<'ACTIVE'| 'PAID' | 'DEFAULTED'>('ACTIVE');
  const [form] = Form.useForm();
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [paymentForm] = Form.useForm();
  const [repaymentPlan, setRepaymentPlan] = useState<RepaymentPlanItem[]>([]);
  const [repaymentModalVisible, setRepaymentModalVisible] = useState(false);
  const [portfolioAnalysis, setPortfolioAnalysis] = useState<PortfolioAnalysis | null>(null);

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      let endpoint = '/budgets';

      if (budgetView === 'Hiện tại') {
        endpoint = '/budgets/current';
      } else if (budgetView === 'Theo tháng') {
        endpoint = '/budgets/current-month';
      } // 'all' => '/budgets'

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Lấy thông tin thất bại');
      }

      const data = await response.json();
      setBudgets(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch budgets:', error);
      message.error('Lấy thông tin thất bại');
      setBudgets([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchLoans = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      let endpoint = '/loans';

      if (loanView === 'ACTIVE') {
        endpoint = '/loans/active';
      } else if (loanView === 'DEFAULTED') {
        endpoint = '/loans/overdue';
      } else if (loanView === 'PAID') {
        //endpoint = '/loans/paid'; //chưa có
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Lấy thông tin thất bại');
      }

      const data = await response.json();
      setLoans(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch loans:', error);
      message.error('Lấy thông tin thất bại');
      setLoans([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
    fetchLoans();
    fetchPortfolioAnalysis();
  }, [budgetView, loanView]);

  const getCategoryTotals = () => {
    const categoryTotals: { [key: string]: number } = {};

    budgets.forEach((budget) => {
      if (!categoryTotals[budget.category.name]) {
        categoryTotals[budget.category.name] = 0;
      }
      categoryTotals[budget.category.name] += budget.spent_amount * 1000;
    });

    return Object.entries(categoryTotals)
      .map(([name, spent_amount]) => ({ name, spent_amount }))
      .filter((cat) => cat.spent_amount >= 0)
      .sort((a, b) => b.spent_amount - a.spent_amount);
  };

  const handleAddBudget = async (values: any) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        message.error('Lỗi xác thực: Không tìm thấy token');
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        message.error('Lỗi cấu hình: Không định nghĩa được API URL');
        return;
      }
      const payload = {
        categoryId: values.categoryId,
        limit_amount: parseFloat(values.limit_amount) / 1000,
        start_date: values.start_date,
        end_date: values.end_date,
        spent_amount: 0
      };

      const baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
      const response = await fetch(`${baseUrl}/budgets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed: ${response.status} ${errorData}`);
      }

      message.success('Thêm Ngân sách thành công');
      setBudgetModalVisible(false);
      form.resetFields();
      fetchBudgets();
    } catch (error) {
      console.error('Failed to save budget:', error);
      message.error(
        'Thêm Ngân sách thất bại: ' + (error instanceof Error ? error.message : 'Lỗi không rõ')
      );
    }
  };

  // Xử lý cập nhật budget
  const handleEditBudget = async (values: any) => {
    if (!currentBudgetId) return;

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        message.error('Lỗi xác thực: Không tìm thấy token');
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        message.error('Lỗi cấu hình: Không định nghĩa được API URL');
        return;
      }

      const baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;

      // Tương tự chia 1000 để gửi
      const payload = {
        limit_amount: parseFloat(values.limit_amount) / 1000,
        categoryId: values.categoryId,
        start_date: values.start_date,
        end_date: values.end_date,
      };

      const response = await fetch(`${baseUrl}/budgets/${currentBudgetId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed: ${response.status} ${errorData}`);
      }

      message.success('Chỉnh sửa Ngân sách thành công');
      setBudgetModalVisible(false);
      form.resetFields();
      setCurrentBudgetId(null);
      fetchBudgets();
    } catch (error) {
      console.error('Failed to update budget:', error);
      message.error(
        'Chỉnh sửa Ngân sách thất bại: ' + (error instanceof Error ? error.message : 'Lỗi không rõ')
      );
    }
  };

  // Xoá budget
  const handleDeleteBudget = async (id: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/budgets/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Xoá Ngân sách thất bại');
      }

      message.success('Xoá Ngân sách thành công');
      setBudgetModalVisible(false);
      fetchBudgets();
    } catch (error) {
      console.error('Failed to delete budget:', error);
      message.error('Xoá Ngân sách thất bại');
    }
  };

  const handleAddLoan = async (values: any) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        message.error('Lỗi xác thực: Không tìm thấy token');
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        message.error('Lỗi cấu hình: Không định nghĩa được API URL');
        return;
      }
      const payload = {
        name: values.name,
        due_date: values.due_date,
        total_amount: parseFloat(values.total_amount) / 1000,
        interest_rate: parseFloat(values.interest_rate),
        monthly_payment: parseFloat(values.monthly_payment) / 1000,
        description: values.description,
      };

      const baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
      const response = await fetch(`${baseUrl}/loans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed: ${response.status} ${errorData}`);
      }

      message.success('Thêm Khoản nợ thành công');
      setLoanModalVisible(false);
      form.resetFields();
      fetchLoans();
    } catch (error) {
      console.error('Failed to save khoản nợ:', error);
      message.error(
        'Thêm Khoản nợ thất bại: ' + (error instanceof Error ? error.message : 'Lỗi không rõ')
      );
    }
  };

  // Xử lý cập nhật budget
  const handleEditLoan = async (values: any) => {
    if (!currentLoanId) return;

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        message.error('Lỗi xác thực: Không tìm thấy token');
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        message.error('Lỗi cấu hình: Không định nghĩa được API URL');
        return;
      }

      const baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;

      // Tương tự chia 1000 để gửi
      const payload = {
        name: values.name,
        due_date: values.due_date,
        total_amount: parseFloat(values.total_amount) / 1000,
        interest_rate: parseFloat(values.interest_rate),
        monthly_payment: parseFloat(values.monthly_payment) / 1000,
        description: values.description,
      };

      const response = await fetch(`${baseUrl}/loans/${currentLoanId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed: ${response.status} ${errorData}`);
      }

      message.success('Chỉnh sửa Khoản nợ thành công');
      setLoanModalVisible(false);
      form.resetFields();
      setCurrentLoanId(null);
      fetchLoans();
    } catch (error) {
      console.error('Failed to update loan:', error);
      message.error(
        'Chỉnh sửa Khoản nợ thất bại: ' + (error instanceof Error ? error.message : 'Lỗi không rõ')
      );
    }
  };

  // Xoá loan
  const handleDeleteLoan = async (id: number) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/loans/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Xoá Khoản nợ thất bại');
      }

      message.success('Xoá Khoản nợ thành công');
      setLoanModalVisible(false);
      fetchLoans();
    } catch (error) {
      console.error('Failed to delete loan:', error);
      message.error('Xoá Khoản nợ thất bại');
    }
  };

  const handlePayment = async (id: number, amount: number) => {
    try {
      const token = localStorage.getItem('authToken');
      const amountInUnits = Number(amount) / 1000;
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/loans/${id}/payment?amount=${amountInUnits}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: amountInUnits }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Thêm Thanh toán thất bại');
      }

      message.success('Thêm Thanh toán thành công');
      setPaymentModalVisible(false);
      paymentForm.resetFields();
      fetchLoans();
    } catch (error) {
      console.error('Failed to make payment:', error);
      message.error('Thêm Thanh toán thất bại');
    }
  };

  const fetchRepaymentPlan = async (id: number) => {
    try {
      const token = localStorage.getItem('authToken');
  
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/loans/${id}/repayment-plan`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể lấy kế hoạch trả nợ');
      }
  
      const repaymentData = await response.json();

      
      setRepaymentPlan(Array.isArray(repaymentData) ? repaymentData : []);
      const updatedRepaymentPlan = repaymentData.map((item: any) => ({
        ...item,
        payment_amount: item.payment_amount * 1000,
        principal_payment: item.principal_payment * 1000,
        interest_payment: item.interest_payment * 1000,
        remaining_principal: item.remaining_principal * 1000,
      }));
  
      setRepaymentPlan(Array.isArray(updatedRepaymentPlan) ? updatedRepaymentPlan : []);
    } catch (error) {
      console.error('Failed to fetch repayment plan:', error);
      message.error('Lấy kế hoạch trả nợ thất bại');
    }
  };

  const fetchPortfolioAnalysis = async () => {
    try {
      const token = localStorage.getItem('authToken');
  
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/loans/analysis/portfolio`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể lấy phân tích danh mục khoản vay');
      }
  
      const analysisData: PortfolioAnalysis = await response.json();
  
      const formattedData: PortfolioAnalysis = {
        ...analysisData,
        total_debt: analysisData.total_debt * 1000,
        monthly_payment: analysisData.monthly_payment * 1000,
        payment_priority: analysisData.payment_priority.map((item) => ({
          ...item,
          monthly_interest: item.monthly_interest * 1000,
        })),
      };
  
      setPortfolioAnalysis(formattedData);
    } catch (error) {
      console.error('Failed to fetch loan portfolio analysis:', error);
      message.error('Lấy phân tích danh mục khoản vay thất bại');
    }
  };  

  const handleAddBudgetButton = () => {
    setCurrentBudgetId(null);
    setBudgetModalVisible(true);
    setTimeout(() => {
      form.resetFields();
    }, 0);
  };

  const handleEditBudgetButton = (budget: Budget) => {
    setCurrentBudgetId(budget.id);
    setBudgetModalVisible(true);
    setTimeout(() => {
      form.setFieldsValue({
        limit_amount: budget.limit_amount * 1000,
        categoryId: budget.categoryId,
        start_date: dayjs(budget.start_date).format('YYYY-MM-DD'),
        end_date: dayjs(budget.end_date).format('YYYY-MM-DD'),
      });
    }, 0);
  };

  // Xác nhận xoá
  const handleDeleteBudgetButton = (id: string) => {
    Modal.confirm({
      title: 'Xoá Ngân sách',
      content: 'Bạn chắc chắn muốn xoá Ngân sách này không?',
      okText: 'Xoá',
      okType: 'danger',
      cancelText: 'Huỷ',
      onOk: () => handleDeleteBudget(id),
    });
  };

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleSuggestBudget = async () => {
    const hide = message.loading('Đang tạo ngân sách gợi ý...', 0);
    
    try {
      // Verify authentication
      const token = localStorage.getItem('authToken');
      if (!token) {
        message.error('Vui lòng đăng nhập để sử dụng tính năng này');
        return;
      }
      
      // Get the current month's start and end dates
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      const startDate = formatDate(firstDay);
      const endDate = formatDate(lastDay);
      
      // Get income value (you might want to fetch this from user profile or input)
      let income = 1200000; // Default value, replace with actual user income if available
      
      try {
        const incomeResponse = await fetch('https://wealthmate.onrender.com/transactions/income/current-month', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (incomeResponse.ok) {
          const incomeData = await incomeResponse.json();
          // Make sure to handle the actual response structure
          if (incomeData && typeof incomeData === 'number' && incomeData > 0) {
            income = incomeData * 1000; // Convert from thousands to actual value
          } else if (incomeData && typeof incomeData.income === 'number' && incomeData.income > 0) {
            income = incomeData.income * 1000; // Alternative structure
          }
          console.log(`Đã lấy thu nhập tháng này: ${income.toLocaleString('vi-VN')} VNĐ`);
        } else {
          console.warn('Không thể lấy thông tin thu nhập, sử dụng giá trị mặc định');
        }
      } catch (incomeError) {
        console.error('Lỗi khi lấy thu nhập:', incomeError);
        // Continue with default income value
      }

  const handleAddLoanButton = () => {
    setCurrentLoanId(null);
    setLoanModalVisible(true);
    setTimeout(() => {
      form.resetFields();
    }, 0);
  };

  const handleEditLoanButton = (loan: Loan) => {
    setCurrentLoanId(loan.id);
    setLoanModalVisible(true);
    setTimeout(() => {
      form.setFieldsValue({
        name: loan.name,
        due_date: dayjs(loan.due_date).format('YYYY-MM-DD'),
        total_amount: loan.total_amount * 1000,
        interest_rate: loan.interest_rate,
        monthly_payment: loan.monthly_payment * 1000,
        description: loan.description,
      });
    }, 0);
  };

  const handlePaymentButton = () => {
    setPaymentModalVisible(true);
    setTimeout(() => {
      paymentForm.resetFields();
    }, 0);
  };

  const handleRepaymentPlanButton = async (loan: Loan) => {
    setCurrentLoanId(loan.id);
    setRepaymentModalVisible(true);
    await fetchRepaymentPlan(loan.id);
  };

  // Xác nhận xoá
  const handleDeleteLoanButton = (id: number) => {
    Modal.confirm({
      title: 'Xoá Khoản nợ',
      content: 'Bạn chắc chắn muốn xoá Khoản nợ này không?',
      okText: 'Xoá',
      okType: 'danger',
      cancelText: 'Huỷ',
      onOk: () => handleDeleteLoan(id),
    });
  };

  return (
    <MainLayout>
      <div className={styles.pageHeader}>
        <h1>Ngân Sách</h1>
        <div className={styles.headerButtons}>
          {activeTab === '1' ? (
            <Button type="primary" onClick={handleAddBudgetButton}>
              Tạo Ngân sách
            </Button>
          ) : (
            <>
              <Button type="primary" onClick={handleAddLoanButton}>
                Tạo Khoản nợ
              </Button>
              <Button type="primary" onClick={handlePaymentButton}>
                Thêm Thanh toán
              </Button>
            </>
          )}
        </div>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key)}
        items={[
          {
            key: '1',
            label: 'Ngân sách của bạn',
            children: (
              <>
                <div className={styles.filterContainer}>
                  <div className={styles.filters}>
                    <Select
                      value={budgetView}
                      onChange={(value) => setBudgetView(value)}
                      options={[
                        { value: 'Hiện tại', label: 'Hiện tại' },
                        { value: 'Theo tháng', label: 'Tháng này' },
                      ]}
                    className={styles.filterSelect}
                    style={{ width: 150 }}
                    />
                  </div>
                </div>

                <div className={styles.budgetsContainer}>
                  <div className={styles.budgetsCardsSection}>
                    {budgets.map((budget) => (
                      <BudgetCard key={budget.id} budget={budget} onEdit={handleEditBudgetButton} />
                    ))}
                  </div>

                  <div className={styles.rightColumn}>
                    <CategoryChart categories={getCategoryTotals()} />
                  </div>
                </div>
              </>
            ),
          },
          {
            key: '2',
            label: 'Khoản nợ của bạn',
            children: (
              <>
                <div className={styles.filterContainer}>
                  <div className={styles.filters}>
                    <Select
                      value={loanView}
                      onChange={(value) => setLoanView(value)}
                      options={[
                        { value: 'ACTIVE', label: 'Hiện tại' },
                        { value: 'PAID', label: 'Hoàn thành' },
                        { value: 'DEFAULTED', label: 'Quá hạn' },
                      ]}
                    className={styles.filterSelect}
                    style={{ width: 150 }}
                    />
                  </div>
                </div>
                <div className={styles.budgetsContainer}>
                  <div className={styles.budgetsCardsSection}>
                    {loans.map((loan) => (
                      <LoanCard key={loan.id} loan={loan} onEdit={handleEditLoanButton} onRepaymentPlan={handleRepaymentPlanButton} />
                    ))}
                  </div>
                  {portfolioAnalysis && (
                    <div className={styles.rightColumn}>
                      <HighInterestLoanTable loans={portfolioAnalysis.high_interest_loans} />
                      <PaymentPriorityTable loans={portfolioAnalysis.payment_priority} />
                    </div>
                  )}
                </div>
              </>
            ),
          },
        ]}
      />

      <Modal
        title={currentBudgetId ? 'Chỉnh sửa Ngân sách' : 'Thêm Ngân sách'}
        open={budgetModalVisible}
        onCancel={() => setBudgetModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={currentBudgetId ? handleEditBudget : handleAddBudget}
        >
          <Form.Item
            name="categoryId"
            label="Danh mục"
            rules={[{ required: true, message: 'Vui lòng chọn một danh mục' }]}
          >
            <Select placeholder="Chọn một danh mục">
              {predefinedCategories.map((category) => (
                <Select.Option key={category.id} value={category.id}>
                  {category.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="limit_amount"
            label="Lượng Ngân sách (VNĐ)"
            rules={[
              { required: true, message: 'Vui lòng nhập số tiền hợp lệ' },
              {
                pattern: /^\d+$/,
                message: 'Số tiền phải là một số nguyên (không dấu chấm, dấu phẩy)',
              },
            ]}
          >
            <Input type="number" placeholder="Ví dụ: 500000" />
          </Form.Item>

          <Form.Item
            name="start_date"
            label="Ngày bắt đầu"
            rules={[{ required: true, message: 'Vui lòng chọn một ngày bắt đầu' }]}
          >
            <Input type="date" />
          </Form.Item>

          <Form.Item
            name="end_date"
            label="Ngày kết thúc"
            rules={[{ required: true, message: 'Vui lòng chọn một ngày kết thúc' }]}
          >
            <Input type="date" />
          </Form.Item>

          <Form.Item>
            <div className={styles.modalFooter}>
              {currentBudgetId && (
                <Button danger onClick={() => handleDeleteBudgetButton(currentBudgetId)}>
                  Xoá Ngân sách
                </Button>
              )}
              <Button type="primary" htmlType="submit">
                {currentBudgetId ? 'Chỉnh sửa' : 'Tạo'}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={currentLoanId ? 'Chỉnh sửa Khoản nợ' : 'Thêm Khoản nợ'}
        open={loanModalVisible}
        onCancel={() => setLoanModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={currentLoanId ? handleEditLoan : handleAddLoan}
        >
          <Form.Item
            name="name"
            label="Tên Khoản nợ"
            rules={[{ required: true, message: 'Vui lòng nhập tên Khoản nợ' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="total_amount"
            label="Lượng Ngân sách (VNĐ)"
            rules={[
              { required: true, message: 'Vui lòng nhập số tiền hợp lệ' },
              {
                pattern: /^\d+$/,
                message: 'Số tiền phải là một số nguyên (không dấu chấm, dấu phẩy)',
              },
            ]}
          >
            <Input type="number" placeholder="Ví dụ: 500000" />
          </Form.Item>

          <Form.Item
            name="due_date"
            label="Ngày kết thúc"
            rules={[{ required: true, message: 'Vui lòng chọn một ngày kết thúc' }]}
          >
            <Input type="date" />
          </Form.Item>

          <Form.Item
            name="interest_rate"
            label="Lãi suất"
            rules={[
              { required: true, message: 'Vui lòng nhập lãi suất hợp lệ' },
              {
                pattern: /^\d+(\.\d+)?$/,
                message: 'Lãi suất phải là một số',
              },
            ]}
          >
            <Input type="number" step="0.1" placeholder="Ví dụ: 2.0" />
          </Form.Item>

          <Form.Item
            name="monthly_payment"
            label="Thanh toán hàng tháng (VNĐ)"
            rules={[
              { required: true, message: 'Vui lòng nhập số tiền hợp lệ' },
              {
                pattern: /^\d+$/,
                message: 'Số tiền phải là một số nguyên (không dấu chấm, dấu phẩy)',
              },
            ]}
          >
            <Input type="number" placeholder="Ví dụ: 500000" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
          >
            <Input.TextArea />
          </Form.Item>

          <Form.Item>
            <div className={styles.modalFooter}>
              {currentLoanId && (
                <Button danger onClick={() => handleDeleteLoanButton(currentLoanId)}>
                  Xoá Khoản nợ
                </Button>
              )}
              <Button type="primary" htmlType="submit">
                {currentLoanId ? 'Chỉnh sửa' : 'Tạo'}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Thêm Thanh toán"
        open={paymentModalVisible}
        onCancel={() => setPaymentModalVisible(false)}
        footer={null}
      >
        <Form
          form={paymentForm}
          layout="vertical"
          onFinish={(values) => {
            const amount = Number(values.amount);
            if (isNaN(amount) || amount <= 0) {
              message.error('Vui lòng nhập số hợp lệ');
              return;
            }
            handlePayment(values.id, amount);
          }}
        >
          <Form.Item
            name="id"
            label="Chọn Khoản nợ"
            rules={[{ required: true, message: 'Vui lòng chọn Khoản nợ' }]}
          >
            <Select>
              {loans.map(loan => (
                <Select.Option key={loan.id} value={loan.id}>
                  {loan.name} - {(loan.remaining_amount * 1000).toLocaleString()} / {(loan.total_amount * 1000).toLocaleString()} VNĐ
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="amount"
            label="Lượng (VNĐ)"
            rules={[{ required: true, message: 'Vui lòng nhập lượng Thanh toán' }]}
          >
            <Input type="number" min="0" />
          </Form.Item>

          <Form.Item>
            <div className={styles.modalFooter}>
              <Button type="default" onClick={() => setPaymentModalVisible(false)}>
                Huỷ
              </Button>
              <Button type="primary" htmlType="submit">
                Thêm Tiết kiệm
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Kế hoạch trả nợ"
        visible={repaymentModalVisible}
        onCancel={() => setRepaymentModalVisible(false)}
        footer={null}
        width={1000}
      >
        <Table className={styles.tableContainer} scroll={{ y: 400 }} dataSource={repaymentPlan} rowKey="payment_date">
          <Table.Column title="Ngày thanh toán" dataIndex="payment_date" />
          <Table.Column title="Số tiền thanh toán" dataIndex="payment_amount" />
          <Table.Column title="Gốc" dataIndex="principal_payment" />
          <Table.Column title="Lãi" dataIndex="interest_payment" />
          <Table.Column title="Số dư gốc" dataIndex="remaining_principal" />
        </Table>
      </Modal>
    </MainLayout>
  );
};

export default BudgetsPage;