'use client'
import React from 'react';
import { Select } from 'antd';
import styles from './styles.module.css';


interface TransactionFiltersProps {
  selectedMonth: string;
  selectedYear: string;
  selectedType: string;
  selectedCategory: string;
  monthOptions: { value: string; label: string }[];
  yearOptions: { value: string; label: string }[];
  typeOptions: { value: string; label: string }[];
  categoryOptions: { value: string; label: string }[];
  onMonthChange: (value: string) => void;
  onYearChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
}

const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  selectedMonth,
  selectedYear,
  selectedType,
  selectedCategory,
  monthOptions,
  yearOptions,
  typeOptions,
  categoryOptions,
  onMonthChange,
  onYearChange,
  onTypeChange,
  onCategoryChange,
}) => {
  return (
    <div className={styles.filterButtonsContainer}>
      <Select value={selectedMonth} onChange={onMonthChange} options={monthOptions} className={styles.filterSelect} style={{ width: 100 }} />
      <Select value={selectedYear} onChange={onYearChange} options={yearOptions} className={styles.filterSelect} style={{ width: 100 }} />
      <Select value={selectedType} onChange={onTypeChange} options={typeOptions} className={styles.filterSelect} style={{ width: 120 }} />
      <Select value={selectedCategory} onChange={onCategoryChange} options={categoryOptions} className={styles.filterSelect} style={{ width: 180 }} showSearch optionFilterProp="label" />
    </div>
  );
};

export default TransactionFilters;