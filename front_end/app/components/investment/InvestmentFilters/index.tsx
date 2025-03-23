import React from 'react';
import { Select, Row, Col, Card } from 'antd';
import styles from './styles.module.css';

const { Option } = Select;

interface FilterOption {
  value: string;
  label: string;
}

interface InvestmentFiltersProps {
  selectedMonth: string;
  selectedYear: string;
  monthOptions: FilterOption[];
  yearOptions: FilterOption[];
  onMonthChange: (value: string) => void;
  onYearChange: (value: string) => void;
}

const InvestmentFilters: React.FC<InvestmentFiltersProps> = ({
  selectedMonth,
  selectedYear,
  monthOptions,
  yearOptions,
  onMonthChange,
  onYearChange,
}) => {
  return (
    <Card className={styles.filtersCard}>
      <Row gutter={16} className={styles.filtersRow}>
        <Col span={12}>
          <div className={styles.filterItem}>
            <label>Tháng:</label>
            <Select
              style={{ width: '100%' }}
              value={selectedMonth}
              onChange={onMonthChange}
              placeholder="Chọn tháng"
            >
              <Option value="all">Tất cả các tháng</Option>
              {monthOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </div>
        </Col>
        <Col span={12}>
          <div className={styles.filterItem}>
            <label>Năm:</label>
            <Select
              style={{ width: '100%' }}
              value={selectedYear}
              onChange={onYearChange}
              placeholder="Chọn năm"
            >
              {yearOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </div>
        </Col>
      </Row>
    </Card>
  );
};

export default InvestmentFilters;