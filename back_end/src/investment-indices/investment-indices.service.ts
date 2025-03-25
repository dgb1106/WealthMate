import { HttpException, Injectable } from "@nestjs/common";
import yahooFinance from 'yahoo-finance2';

@Injectable()
export class InvestmentIndicesService {
  constructor() {
    const yahooFinance = require('yahoo-finance2').default;
  }

  async getStockPrice(code: string) {
    try {
        const result = await yahooFinance.quote(code);
        return result.regularMarketPrice;
    } catch (error) {
        throw new HttpException(`Failed to get stock price: ${error.message}`, 500);
    }
  }

  async getMultipleStockPrices(codes: string[]) {
    try {
        const result = await yahooFinance.quote(codes);
        return result.map((stock) => stock.regularMarketPrice);
    } catch (error) {
        throw new HttpException(`Failed to get multiple stock prices: ${error.message}`, 500);
    }
  }

  async getGoldPrice() {
    try {
        const goldprice = await yahooFinance.quote('GC=F');
        return goldprice.regularMarketPrice;
    } catch (error) {
        throw new HttpException(`Failed to get gold price: ${error.message}`, 500);
    }
  }

  async getMarketIndices(markets: string[]) {
    try {
        const result = await yahooFinance.quote(markets);
        return result.map((market) => market.regularMarketPrice);
    } catch (error) {
        throw new HttpException(`Failed to get VN-Index: ${error.message}`, 500);
    }
  }

  async getCryptoPrice(crypto: string) {
    try {
        const result = await yahooFinance.quote(crypto);
        return result.regularMarketPrice;
    } catch (error) {
        throw new HttpException(`Failed to get crypto price: ${error.message}`, 500);
    }
  }

  async getMultipleCryptoPrices(cryptos: string[]) {
    try {
        const result = await yahooFinance.quote(cryptos);
        return result.map((crypto) => crypto.regularMarketPrice);
    } catch (error) {
        throw new HttpException(`Failed to get multiple crypto prices: ${error.message}`, 500);
    }
  }

  async getExchangeRate(from: string, to: string) {
    try {
        const result = await yahooFinance.quote(`${from}${to}=X`);
        return result.regularMarketPrice;
    } catch (error) {
        throw new HttpException(`Failed to get exchange rate: ${error.message}`, 500);
    }
  }
}