import React from 'react';
import { Modal, Button, Descriptions, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import styles from './styles.module.css';

interface Investment {
  id: string;
  description: string;
  amount: number;
  created_at: string;
  category: {
    id?: string;
    name: string;
  };
}

interface InvestmentDetailModalProps {
  visible: boolean;
  investment: Investment | null;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const InvestmentDetailModal: React.FC<InvestmentDetailModalProps> = ({
  visible,
  investment,
  onClose,
  onEdit,
  onDelete,
}) => {
  if (!investment) return null;

  return (
    <Modal
      visible={visible}
      title="Chi tiết khoản đầu tư"
      onCancel={onClose}
      footer={[
        <Button key="back" onClick={onClose}>
          Đóng
        </Button>,
        <Button key="edit" type="primary" icon={<EditOutlined />} onClick={onEdit}>
          Chỉnh sửa
        </Button>,
        <Popconfirm
          key="delete"
          title="Bạn có chắc chắn muốn xóa khoản đầu tư này?"
          onConfirm={onDelete}
          okText="Xóa"
          cancelText="Hủy"
        >
          <Button type="primary" danger icon={<DeleteOutlined />}>
            Xóa
          </Button>
        </Popconfirm>,
      ]}
    >
      <Descriptions bordered column={1} className={styles.descriptions}>
        <Descriptions.Item label="Mô tả">{investment.description}</Descriptions.Item>
        <Descriptions.Item label="Danh mục">{investment.category.name}</Descriptions.Item>
        <Descriptions.Item label="Ngày">
          {dayjs(investment.created_at).format('DD/MM/YYYY')}
        </Descriptions.Item>
        <Descriptions.Item label="Số tiền">
          <span style={{ color: investment.amount < 0 ? '#f5222d' : '#52c41a', fontWeight: 'bold' }}>
            {Math.abs(investment.amount * 1000).toLocaleString('vi-VN')} ₫
          </span>
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};

export default InvestmentDetailModal;