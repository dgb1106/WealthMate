import { useState, useEffect, useCallback } from 'react';

interface MarketDataItem {
  code: string;
  day_change: number;
  day_change_pct: number;
  name: string;
  price: number;
}

const useMarketData = () => {
  const [indices, setIndices] = useState<MarketDataItem[]>([]);
  const [commodities, setCommodities] = useState<MarketDataItem[]>([]);
  const [cryptos, setCryptos] = useState<MarketDataItem[]>([]);
  const [loading, setLoading] = useState({
    indices: true,
    commodities: true,
    cryptos: true,
  });

  const fetchIndices = useCallback(async () => {
    try {
      console.log('Starting to fetch indices from:', process.env.NEXT_PUBLIC_SECONDARY_API_URL);
      setLoading(prev => ({ ...prev, indices: true }));
      const response = await fetch(`${process.env.NEXT_PUBLIC_SECONDARY_API_URL}/indices`);
      console.log('Indices response status:', response.status);
      if (!response.ok) throw new Error('Failed to fetch indices');
      const data = await response.json();
      console.log('Indices data received:', data);
      setIndices(data);
    } catch (error) {
      console.error('Error fetching indices:', error);
    } finally {
      setLoading(prev => ({ ...prev, indices: false }));
    }
  }, []);

  const fetchCommodities = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, commodities: true }));
      const response = await fetch(`${process.env.NEXT_PUBLIC_SECONDARY_API_URL}/commodities`);
      if (!response.ok) throw new Error('Failed to fetch commodities');
      const data = await response.json();
      setCommodities(data);
    } catch (error) {
      console.error('Error fetching commodities:', error);
    } finally {
      setLoading(prev => ({ ...prev, commodities: false }));
    }
  }, []);

  const fetchCryptos = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, cryptos: true }));
      const response = await fetch(`${process.env.NEXT_PUBLIC_SECONDARY_API_URL}/cryptos`);
      if (!response.ok) throw new Error('Failed to fetch cryptos');
      const data = await response.json();
      setCryptos(data);
    } catch (error) {
      console.error('Error fetching cryptos:', error);
    } finally {
      setLoading(prev => ({ ...prev, cryptos: false }));
    }
  }, []);

  const fetchAllMarketData = useCallback(() => {
    fetchIndices();
    fetchCommodities();
    fetchCryptos();
  }, [fetchIndices, fetchCommodities, fetchCryptos]);
  useEffect(() => {
    console.log('useMarketData hook initialized, fetching data...');
    fetchAllMarketData();
  }, [fetchAllMarketData]);

  return {
    indices,
    commodities,
    cryptos,
    loading,
    fetchAllMarketData,
    fetchIndices,
    fetchCommodities,
    fetchCryptos,
  };
};

export default useMarketData;