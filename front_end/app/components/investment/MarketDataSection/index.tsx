import React, { useEffect } from 'react';
import { Table, Card, Typography, Spin, Tag, Button } from 'antd';
import { UpOutlined, DownOutlined, ReloadOutlined } from '@ant-design/icons';
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

interface ExchangeRateItem {
  currency_code: string;
  currency_name: string;
  buy_price_cash: string;
  buy_price_online: string;
  sell_price: string;
}

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
          scroll={{ y: 150 }}
        />
      </Spin>
    </Card>
  );
};

export const ExchangeRatesTable: React.FC<{ data: ExchangeRateItem[]; loading: boolean }> = ({ data, loading }) => {
  const columns = [
    {
      title: 'Tên ngoại tệ',
      dataIndex: 'currency_name',
      key: 'currency_name',
      width: '40%',
      render: (text: string, record: ExchangeRateItem) => (
        <div>
          <div>{text}</div>
          <small style={{ color: '#888' }}>{record.currency_code}</small>
        </div>
      ),
    },
    {
      title: 'Mua tiền mặt',
      dataIndex: 'buy_price_cash',
      key: 'buy_price_cash',
      width: '20%',
      render: (text: string) => text === '-' ? '-' : text,
    },
    {
      title: 'Mua chuyển khoản',
      dataIndex: 'buy_price_online',
      key: 'buy_price_online',
      width: '20%',
    },
    {
      title: 'Bán',
      dataIndex: 'sell_price',
      key: 'sell_price',
      width: '20%',
    },
  ];

  return (
    <Card className={styles.dataCard}>
      <Title level={4}>Tỷ giá ngoại tệ</Title>
      <Spin spinning={loading}>
        <Table 
          dataSource={data} 
          columns={columns} 
          pagination={false} 
          rowKey="currency_code"
          className={styles.dataTable}
          size="small"
          scroll={{ y: 150 }}
        />
      </Spin>
    </Card>
  );
};

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

const MarketDataSection: React.FC = () => {
  const { 
    indices, 
    commodities, 
    cryptos, 
    exchangeRates,
    loading, 
    fetchAllMarketData 
  } = useMarketData();

  useEffect(() => {
    fetchAllMarketData();
    const refreshInterval = setInterval(() => {
      fetchAllMarketData();
    }, 5 * 60 * 1000);

    return () => clearInterval(refreshInterval);
  }, [fetchAllMarketData]);

  return (
    <div className={styles.marketDataContainer}>
      <Title level={3}>
        Thông tin thị trường
        <Button 
          icon={<ReloadOutlined />} 
          onClick={fetchAllMarketData}
          type="text"
          size="small"
          style={{ marginLeft: 8 }}
        />
      </Title>
      <div className={styles.tablesContainer}>
        {/* First row with indices and exchange rates side by side */}
        <div className={styles.topTablesRow}>
          <div className={styles.halfWidthTable}>
            <MarketIndicesTable data={indices} loading={loading.indices} />
          </div>
          <div className={styles.halfWidthTable}>
            <ExchangeRatesTable data={exchangeRates} loading={loading.exchangeRates} />
          </div>
        </div>
        {/* Second row with commodities and cryptos */}
        <div className={styles.smallTablesRow}>
          <CommoditiesTable data={commodities} loading={loading.commodities} />
          <CryptosTable data={cryptos} loading={loading.cryptos} />
        </div>
      </div>
    </div>
  );
};

export default MarketDataSection;