import React from 'react';
import { Form, Input, Button, Radio } from 'antd';
import { FormInstance } from 'antd/lib/form';
import styles from './styles.module.css';

interface InvestmentFormProps {
  form: FormInstance;
  onFinish: (values: any) => void;
  onFinishFailed: (errorInfo: any) => void;
  isEdit: boolean;
}

const InvestmentForm: React.FC<InvestmentFormProps> = ({
  form,
  onFinish,
  onFinishFailed,
  isEdit,
}) => {
  const [transactionType, setTransactionType] = React.useState<'expense' | 'income'>('expense');

  const handleTypeChange = (e: any) => {
    setTransactionType(e.target.value);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={(values) => {
        const amount = transactionType === 'expense' 
          ? -Math.abs(parseFloat(values.amount)) / 1000 
          : Math.abs(parseFloat(values.amount)) / 1000;
        
        onFinish({
          ...values,
          amount: amount.toString(),
        });
      }}
      onFinishFailed={onFinishFailed}
      className={styles.form}
    >
      <Form.Item
        name="description"
        label="Mô tả"
        rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
      >
        <Input placeholder="Nhập mô tả khoản đầu tư" />
      </Form.Item>

      <Form.Item label="Loại giao dịch">
        <Radio.Group 
          defaultValue="expense" 
          onChange={handleTypeChange}
          value={transactionType}
        >
          <Radio value="expense">Chi tiền</Radio>
          <Radio value="income">Thu tiền</Radio>
        </Radio.Group>
      </Form.Item>

      <Form.Item
        name="amount"
        label="Số tiền (VNĐ)"
        rules={[
          { required: true, message: 'Vui lòng nhập số tiền!' },
          { pattern: /^[0-9]+$/, message: 'Vui lòng chỉ nhập số!' }
        ]}
      >
        <Input placeholder="Nhập số tiền" suffix="₫" />
      </Form.Item>

      <Form.Item className={styles.formButtons}>
        <Button type="primary" htmlType="submit" className={styles.submitButton}>
          {isEdit ? 'Cập nhật' : 'Thêm mới'}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default InvestmentForm;