'use client';
import React from 'react';
import { Form, Input, Button, Select } from 'antd';

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

interface TransactionFormProps {
  form: any;
  onFinish: (values: any) => void;
  onFinishFailed: (errorInfo: any) => void; 
  isEdit: boolean;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ form, onFinish, onFinishFailed, isEdit }) => {
  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
    >
      <Form.Item
        name="description"
        label="Mô tả"
        rules={[{ required: true, message: 'Mô tả là bắt buộc' }, { max: 255, message: 'Mô tả không thể vượt quá 255 kí tự' }]}
      >
        <Input placeholder="Mô tả Giao dịch" />
      </Form.Item>

      <Form.Item
        name="amount"
        label="Lượng"
        rules={[{ required: true, message: 'Lượng là bắt buộc' }, { validator: validateAmount }]}
        help="Vui lòng nhập một lượng là số nguyên dương"
      >
        <Input type="number" min="1" step="1" placeholder="Lượng" />
      </Form.Item>

      <Form.Item
        name="categoryId"
        label="Danh mục"
        rules={[{ required: true, message: 'Danh mục là bắt buộc' }]}
      >
        <Select 
          placeholder="Chọn danh mục"
          showSearch
          optionFilterProp="children"
          filterOption={(input, option) => 
            (option?.label as string).toLowerCase().includes(input.toLowerCase())
          }
          options={predefinedCategories.map(category => ({
            value: category.id,
            label: `${category.name} (${category.type === "Thu nhập" ? "Thu nhập" : "Chi phí"})`
          }))}
        />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" block>
          {isEdit ? 'Chỉnh sửa' : 'Tạo'}
        </Button>
      </Form.Item>
    </Form>
  );
};

const validateAmount = (_: any, value: any) => {
  if (!value) return Promise.resolve();
  const numValue = parseInt(value, 10);
  if (isNaN(numValue)) return Promise.reject('Lượng phải là một số hợp lệ');
  if (numValue <= 0) return Promise.reject('Lượng phải là một số nguyên dương');
  if (numValue.toString() !== value.toString()) return Promise.reject('Lượng phải là một số nguyên');
  return Promise.resolve();
};

export default TransactionForm;