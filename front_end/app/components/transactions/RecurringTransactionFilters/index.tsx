'use client'

import React from 'react';
import { Select } from 'antd';
import { Frequency } from '@/hooks/useTransactions';
import styles from './styles.module.css';

const { Option } = Select;

interface CategoryOption {
  value: string;
  label: string;
}

interface RecurringTransactionFiltersProps {
  selectedCategory: string;
  selectedFrequency: string;
  categoryOptions: CategoryOption[];
  onCategoryChange: (category: string) => void;
  onFrequencyChange: (frequency: string) => void;
}

const RecurringTransactionFilters: React.FC<RecurringTransactionFiltersProps> = ({
  selectedCategory,
  selectedFrequency,
  categoryOptions,
  onCategoryChange,
  onFrequencyChange,
}) => {
  const frequencyOptions = [
    { value: 'all', label: 'Tất cả' },
    { value: Frequency.DAILY, label: 'Hằng ngày' },
    { value: Frequency.WEEKLY, label: 'Hằng tuần' },
    { value: Frequency.BIWEEKLY, label: 'Hai tuần/lần' },
    { value: Frequency.MONTHLY, label: 'Hằng tháng' },
    { value: Frequency.QUARTERLY, label: 'Hằng quý' },
    { value: Frequency.YEARLY, label: 'Hằng năm' },
  ];

  return (
    <div className={styles.filterButtonsContainer} style={{ marginBottom: '10px' }}>
      <Select
        value={selectedCategory}
        onChange={onCategoryChange}
        className={styles.filterSelect}
        style={{ width: 180 }}
        placeholder="Danh mục"
        showSearch
        optionFilterProp="label"
      >
        <Option value="all">Tất cả danh mục</Option>
        {categoryOptions.map(category => (
          <Option key={category.value} value={category.value}>
            {category.label}
          </Option>
        ))}
      </Select>
      
      <Select
        value={selectedFrequency}
        onChange={onFrequencyChange}
        className={styles.filterSelect}
        style={{ width: 120 }}
        placeholder="Tần suất"
      >
        {frequencyOptions.map(option => (
          <Option key={option.value} value={option.value}>
            {option.label}
          </Option>
        ))}
      </Select>
    </div>
  );
};

export default RecurringTransactionFilters;