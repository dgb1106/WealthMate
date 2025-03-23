"use client";

import React, { useState, useEffect } from 'react';
import MainLayout from '@/layouts/MainLayout/index';
import InvestmentTable from '@/components/investment/InvestmentTable';
import InvestmentForm from '@/components/investment/InvestmentForm';
import InvestmentDetailModal from '@/components/investment/InvestmentDetailModal';
import InvestmentFilters from '@/components/investment/InvestmentFilters';
import useInvestments from '@/hooks/useInvestments';
import { Button, Form, Modal, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import styles from './styles.module.css';
import type { Investment as InvestmentType } from '@/components/investment/InvestmentTable';

const InvestmentPage: React.FC = () => {
  const {
    investments,
    loading,
    fetchInvestments,
    addInvestment,
    updateInvestment,
    deleteInvestment,
  } = useInvestments();

  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState<InvestmentType | null>(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());

  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    label: `Tháng ${i+1}`,
    value: (i+1).toString()
  }));

  const yearOptions = Array.from({ length: 5 }, (_, i) => ({
    value: (new Date().getFullYear() - i).toString(),
    label: (new Date().getFullYear() - i).toString()
  }));

  useEffect(() => {
    fetchInvestments(selectedMonth, selectedYear);
  }, [selectedMonth, selectedYear]);

  const handleAddInvestment = async (values: { amount: string; description: string; }) => {
    await addInvestment(values);
    setModalVisible(false);
    form.resetFields();
  };

  const handleUpdateInvestment = async (values: { amount: string; description: string; }) => {
    if (selectedInvestment) {
      await updateInvestment(selectedInvestment.id, values);
      setEditModalVisible(false);
    }
  };

  const handleDeleteInvestment = async () => {
    if (selectedInvestment) {
      await deleteInvestment(selectedInvestment.id);
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
        <h1>Đầu Tư</h1>
        <Button 
          type="primary" 
          shape="circle" 
          icon={<PlusOutlined />} 
          size="large"
          className={styles.addButton}
          onClick={() => setModalVisible(true)}
        />
      </div>

      <InvestmentFilters 
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        monthOptions={monthOptions}
        yearOptions={yearOptions}
        onMonthChange={setSelectedMonth}
        onYearChange={setSelectedYear}
      />

      <InvestmentTable 
        investments={investments as any} 
        loading={loading} 
        onRowClick={(investment) => {
          setSelectedInvestment(investment);
          setDetailModalVisible(true);
        }}
        onReinvest={(investment) => {
          message.info(`Tái đầu tư khoản ${investment.description} sẽ được triển khai sau.`);
        }}
      />

      <InvestmentDetailModal 
        visible={detailModalVisible} 
        investment={selectedInvestment} 
        onClose={() => setDetailModalVisible(false)} 
        onEdit={() => {
          if (selectedInvestment) {
            editForm.setFieldsValue({
              description: selectedInvestment.description,
              amount: Math.abs(selectedInvestment.amount * 1000).toString(),
            });
            setDetailModalVisible(false);
            setEditModalVisible(true);
          }
        }} 
        onDelete={handleDeleteInvestment} 
      />

      {/* Modal thêm đầu tư */}
      <Modal
        visible={modalVisible}
        title="Thêm khoản đầu tư mới"
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <InvestmentForm 
          form={form}
          onFinish={handleAddInvestment}
          onFinishFailed={onFinishFailed}
          isEdit={false}
        />
      </Modal>

      {/* Modal chỉnh sửa đầu tư */}
      <Modal
        visible={editModalVisible}
        title="Chỉnh sửa khoản đầu tư"
        onCancel={() => setEditModalVisible(false)}
        footer={null}
      >
        <InvestmentForm 
          form={editForm} 
          onFinish={handleUpdateInvestment} 
          onFinishFailed={onFinishFailed}
          isEdit={true} 
        />
      </Modal>
    </MainLayout>
  );
};

export default InvestmentPage;