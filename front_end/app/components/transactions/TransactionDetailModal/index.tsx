'use client'

import React from 'react';
import { Modal, Button, Descriptions } from 'antd';
import { Transaction } from '@/hooks/useTransactions';

interface TransactionDetailModalProps {
  visible: boolean;
  transaction: Transaction | null;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  visible,
  transaction,
  onClose,
  onEdit,
  onDelete,
}) => {
  // Hàm định dạng tiền tệ trực tiếp trong component
  const formatCurrencyDirectly = (value: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value).replace(/\s/g, '');
  };

  // Format ngày tháng sang định dạng tiếng Việt
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  if (!transaction) return null;

  return (
    <Modal
      visible={visible}
      title="Chi tiết giao dịch"
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Đóng
        </Button>,
        <Button key="edit" type="primary" onClick={onEdit}>
          Chỉnh sửa
        </Button>,
        <Button key="delete" type="primary" danger onClick={onDelete}>
          Xóa
        </Button>,
      ]}
    >
      <Descriptions bordered column={1}>
        <Descriptions.Item label="Mô tả">{transaction.description}</Descriptions.Item>
        <Descriptions.Item label="Số tiền">
          <span style={{ color: transaction.amount < 0 ? '#ff4d4f' : '#52c41a' }}>
            {formatCurrencyDirectly(Math.abs(transaction.amount * 1000))}
          </span>
        </Descriptions.Item>
        <Descriptions.Item label="Danh mục">{transaction.category.name}</Descriptions.Item>
        <Descriptions.Item label="Ngày tạo">
          {formatDate(transaction.created_at)}
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};

export default TransactionDetailModal;