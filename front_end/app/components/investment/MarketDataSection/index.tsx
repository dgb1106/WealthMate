import React, { useEffect } from 'react';
import { Table, Card, Typography, Spin, Tag } from 'antd';
import { UpOutlined, DownOutlined } from '@ant-design/icons';
import useMarketData from '@/hooks/useMarketData';
import styles from './styles.module.css';

const { Title } = Typography;

interface MarketDataItem {
  code: string;
  day_change: number;
  day_change_pct: number;
  name: string;
  price: number;
}

// Helper component for displaying price change
const PriceChange: React.FC<{ value: number; percent: number }> = ({ value, percent }) => {
  const isPositive = value >= 0;
  return (
    <Tag color={isPositive ? 'green' : 'red'} className={styles.changeTag}>
      {isPositive ? <UpOutlined /> : <DownOutlined />}
      {' '}
      {Math.abs(value).toFixed(2)} ({Math.abs(percent).toFixed(2)}%)
    </Tag>
  );
};

// Market Indices Table
export const MarketIndicesTable: React.FC<{ data: MarketDataItem[]; loading: boolean }> = ({ data, loading }) => {
  const columns = [
    {
      title: 'Mã',
      dataIndex: 'code',
      key: 'code',
      width: '15%',
    },
    {
      title: 'Tên',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: MarketDataItem) => {
        if (text === 'N/A') {
          // Map specific Vietnamese indices to appropriate names
          const vnIndicesMap: {[key: string]: string} = {
            'VN30': 'Chỉ số VN30',
            'HNXUpcomIndex': 'Chỉ số Upcom',
            'VNIndex': 'Chỉ số VN-Index',
            'HNXIndex': 'Chỉ số HNX'
          };
          return vnIndicesMap[record.code] || 'Chỉ số Việt Nam';
        }
        return text;
      },
      width: '35%',
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => price.toLocaleString('vi-VN'),
      width: '20%',
    },
    {
      title: 'Thay đổi',
      key: 'change',
      render: (text: string, record: MarketDataItem) => (
        <PriceChange value={record.day_change} percent={record.day_change_pct} />
      ),
      width: '30%',
    },
  ];

  return (
    <Card className={styles.dataCard}>
      <Title level={4}>Chỉ số thị trường</Title>
      <Spin spinning={loading}>
        <Table 
          dataSource={data} 
          columns={columns} 
          pagination={false} 
          rowKey="code"
          className={styles.dataTable}
          size="small"
        />
      </Spin>
    </Card>
  );
};

// Commodities Table
export const CommoditiesTable: React.FC<{ data: MarketDataItem[]; loading: boolean }> = ({ data, loading }) => {
  const columns = [
    {
      title: 'Mã',
      dataIndex: 'code',
      key: 'code',
      width: '15%',
    },
    {
      title: 'Tên',
      dataIndex: 'name',
      key: 'name',
      width: '35%',
    },
    {
      title: 'Giá (USD)',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => price.toLocaleString('vi-VN'),
      width: '20%',
    },
    {
      title: 'Thay đổi',
      key: 'change',
      render: (text: string, record: MarketDataItem) => (
        <PriceChange value={record.day_change} percent={record.day_change_pct} />
      ),
      width: '30%',
    },
  ];

  return (
    <Card className={styles.dataCard}>
      <Title level={4}>Kim loại quý</Title>
      <Spin spinning={loading}>
        <Table 
          dataSource={data} 
          columns={columns} 
          pagination={false} 
          rowKey="code"
          className={styles.dataTable}
          size="small"
        />
      </Spin>
    </Card>
  );
};

// Cryptos Table
export const CryptosTable: React.FC<{ data: MarketDataItem[]; loading: boolean }> = ({ data, loading }) => {
  const columns = [
    {
      title: 'Mã',
      dataIndex: 'code',
      key: 'code',
      width: '15%',
    },
    {
      title: 'Tên',
      dataIndex: 'name',
      key: 'name',
      width: '35%',
    },
    {
      title: 'Giá (USD)',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => price.toLocaleString('vi-VN'),
      width: '20%',
    },
    {
      title: 'Thay đổi',
      key: 'change',
      render: (text: string, record: MarketDataItem) => (
        <PriceChange value={record.day_change} percent={record.day_change_pct} />
      ),
      width: '30%',
    },
  ];

  return (
    <Card className={styles.dataCard}>
      <Title level={4}>Tiền điện tử</Title>
      <Spin spinning={loading}>
        <Table 
          dataSource={data} 
          columns={columns} 
          pagination={false} 
          rowKey="code"
          className={styles.dataTable}
          size="small"
        />
      </Spin>
    </Card>
  );
};

// The main container component for all market data
const MarketDataSection: React.FC = () => {
  const { 
    indices, 
    commodities, 
    cryptos, 
    loading, 
    fetchAllMarketData 
  } = useMarketData();

  useEffect(() => {
    fetchAllMarketData();
    // Set up a refresh interval every 5 minutes
    const refreshInterval = setInterval(() => {
      fetchAllMarketData();
    }, 5 * 60 * 1000);

    return () => clearInterval(refreshInterval);
  }, [fetchAllMarketData]);

  return (
    <div className={styles.marketDataContainer}>
      <Title level={3}>Thông tin thị trường</Title>
      <div className={styles.tablesContainer}>
        <MarketIndicesTable data={indices} loading={loading.indices} />
        <div className={styles.smallTablesRow}>
          <CommoditiesTable data={commodities} loading={loading.commodities} />
          <CryptosTable data={cryptos} loading={loading.cryptos} />
        </div>
      </div>
    </div>
  );
};

export default MarketDataSection;