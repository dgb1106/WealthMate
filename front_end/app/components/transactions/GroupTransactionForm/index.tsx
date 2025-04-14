import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Button, InputNumber } from 'antd';
import styles from './styles.module.css';

const { Option } = Select;

interface GroupTransactionFormProps {
  form: any;
  onFinish: (values: any) => void;
  onFinishFailed: (errorInfo: any) => void;
  isEdit?: boolean;
}

interface Group {
  id: string;
  name: string;
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
];

const GroupTransactionForm: React.FC<GroupTransactionFormProps> = ({
  form,
  onFinish,
  onFinishFailed,
  isEdit = false
}) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchGroups = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/family-groups`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch groups');
        }

        const data = await response.json();
        if (data.success) {
          const groupsData = data.data.map((group: any) => ({
            id: group.id,
            name: group.name
          }));
          setGroups(groupsData);
        }
      } catch (error) {
        console.error('Failed to fetch groups:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  const handleFormSubmit = (values: any) => {
    const formattedValues = {
      ...values,
      amount: parseFloat(values.amount) / 1000,
      contributionType: "BUDGET"
    };
    onFinish(formattedValues);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFormSubmit}
      onFinishFailed={onFinishFailed}
      className={styles.form}
    >
      <Form.Item
        name="groupId"
        label="Nhóm"
        rules={[{ required: true, message: 'Vui lòng chọn nhóm!' }]}
      >
        <Select 
          placeholder="Chọn nhóm" 
          loading={loading}
          disabled={isEdit}
        >
          {groups.map(group => (
            <Option key={group.id} value={group.id}>{group.name}</Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="categoryId"
        label="Danh mục"
        rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
      >
        <Select placeholder="Chọn danh mục">
          {predefinedCategories.map(category => (
            <Option key={category.id} value={category.id}>{category.name}</Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="amount"
        label="Số tiền (nghìn đồng)"
        rules={[{ required: true, message: 'Vui lòng nhập số tiền!' }]}
      >
        <InputNumber 
          style={{ width: '100%' }} 
          formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={value => value!.replace(/\$\s?|(,*)/g, '')}
          placeholder="Nhập số tiền"
        />
      </Form.Item>

      <Form.Item
        name="description"
        label="Mô tả"
        rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
      >
        <Input placeholder="Nhập mô tả giao dịch" />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" block>
          {isEdit ? 'Cập nhật' : 'Thêm mới'}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default GroupTransactionForm;