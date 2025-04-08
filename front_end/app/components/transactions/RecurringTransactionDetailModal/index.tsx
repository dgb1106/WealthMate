'use client'

import React from 'react';
import { Modal, Button, Descriptions, Tag } from 'antd';
import { RecurringTransaction, Frequency } from '@/hooks/useTransactions';

interface RecurringTransactionDetailModalProps {
  visible: boolean;
  transaction: RecurringTransaction | null;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const frequencyLabels = {
  [Frequency.DAILY]: 'Hằng ngày',
  [Frequency.WEEKLY]: 'Hằng tuần',
  [Frequency.BIWEEKLY]: 'Hai tuần/lần',
  [Frequency.MONTHLY]: 'Hằng tháng',
  [Frequency.QUARTERLY]: 'Hằng quý',
  [Frequency.YEARLY]: 'Hằng năm',
};

const RecurringTransactionDetailModal: React.FC<RecurringTransactionDetailModalProps> = ({
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

  if (!transaction) return null;

  return (
    <Modal
      visible={visible}
      title="Chi tiết giao dịch định kỳ"
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
            {formatCurrencyDirectly(Math.abs(transaction.amount))}
          </span>
        </Descriptions.Item>
        <Descriptions.Item label="Danh mục">{transaction.category.name}</Descriptions.Item>
        <Descriptions.Item label="Tần suất">
          {frequencyLabels[transaction.frequency]}
        </Descriptions.Item>
        <Descriptions.Item label="Ngày bắt đầu">
          {new Date(transaction.start_date).toLocaleDateString('vi-VN')}
        </Descriptions.Item>
        {transaction.end_date && (
          <Descriptions.Item label="Ngày kết thúc">
            {new Date(transaction.end_date).toLocaleDateString('vi-VN')}
          </Descriptions.Item>
        )}
        <Descriptions.Item label="Lần tiếp theo">
          {new Date(transaction.next_occurrence).toLocaleDateString('vi-VN')}
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};

export default RecurringTransactionDetailModal;