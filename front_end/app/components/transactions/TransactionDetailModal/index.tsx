'use client'
import React from 'react';
import { Modal, Button } from 'antd';
import dayjs from 'dayjs';
import styles from './styles.module.css';

// Define the props interface
interface TransactionDetailModalProps {
  visible: boolean;
  transaction: {
    id: string;
    description: string;
    amount: number;
    created_at: string;
    category: {
      id: string;
      name: string;
    };
  } | null; // Allow transaction to be null
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({ visible, transaction, onClose, onEdit, onDelete }) => {
  return (
    <Modal
      title="Chi tiết Giao dịch"
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="delete" danger onClick={onDelete}>
          Delete
        </Button>,
        <Button key="edit" type="primary" onClick={onEdit}>
          Edit
        </Button>,
        <Button key="close" onClick={onClose}>
          Close
        </Button>
      ]}
    >
      {transaction && (
        <div className={styles.transactionDetails}>
          <p><strong>Thời gian:</strong> {dayjs(transaction.created_at).format('MMMM D, YYYY')}</p>
          <p><strong>Lượng:</strong> <span className={transaction.amount < 0 ? styles.negativeAmount : styles.positiveAmount}>
            {transaction.amount < 0 ? '-' : '+'}{new Intl.NumberFormat('en-US').format(Math.abs(transaction.amount * 1000))}
          </span></p>
          <p><strong>Mô tả:</strong> {transaction.description}</p>
          <p><strong>Danh mục:</strong> {transaction.category.name}</p>
          <p><strong>Loại:</strong> {transaction.amount < 0 ? 'Chi phí' : 'Thu nhập'}</p>
          <p><strong>ID Giao dịch:</strong> {transaction.id}</p>
        </div>
      )}
    </Modal>
  );
};

export default TransactionDetailModal;