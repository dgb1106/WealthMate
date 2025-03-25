import { Controller, Get, Post, Body, UseInterceptors, UploadedFile, Request, Query, UseGuards } from '@nestjs/common';
import { InvestmentIndicesService } from "./investment-indices.service";
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@ApiTags('investment-indices')
@Controller('investment-indices')
@UseGuards(JwtAuthGuard)
export class InvestmentIndicesController {
  constructor(private readonly investmentIndicesService: InvestmentIndicesService) {}

  @Get('stock-prices')
  @ApiOperation({ summary: 'Lấy giá cổ phiếu' })
  @ApiResponse({ status: 200, description: 'Giá cổ phiếu.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ.' })
  @ApiResponse({ status: 500, description: 'Lỗi server.' })
  async getStockPrice(
    @Query('stockCodes') stockCodes: string
  ) {
    return this.investmentIndicesService.getMultipleStockPrices(stockCodes.split(','));
  }

  @Get('gold-price')
  @ApiOperation({ summary: 'Lấy giá vàng' })
  @ApiResponse({ status: 200, description: 'Giá vàng.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ.' })
  @ApiResponse({ status: 500, description: 'Lỗi server.' })
  async getGoldPrice() {
    return this.investmentIndicesService.getGoldPrice();
  }

  @Get('market-indices')
  @ApiOperation({ summary: 'Lấy chỉ số thị trường' })
  @ApiResponse({ status: 200, description: 'Chỉ số thị trường.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ.' })
  @ApiResponse({ status: 500, description: 'Lỗi server.' })
  async getMarketIndices(
    @Query('markets') markets: string
  ) {
    return this.investmentIndicesService.getMarketIndices(markets.split(','));
  }

  @Get('crypto-price')
  @ApiOperation({ summary: 'Lấy giá tiền điện tử' })
  @ApiResponse({ status: 200, description: 'Giá tiền điện tử.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ.' })
  @ApiResponse({ status: 500, description: 'Lỗi server.' })
  async getCryptoPrice(
    @Query('cryptos') cryptos: string
  ) {
    return this.investmentIndicesService.getMultipleCryptoPrices(cryptos.split(','));
  }

  @Get('exchange-rate')
  @ApiOperation({ summary: 'Lấy tỷ giá ngoại tệ' })
  @ApiResponse({ status: 200, description: 'Tỷ giá ngoại tệ.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ.' })
  @ApiResponse({ status: 500, description: 'Lỗi server.' })
  async getExchangeRate(
    @Query('currencies') currencies: string
  ) {
    let exchange = currencies.split(',');
    return this.investmentIndicesService.getExchangeRate(exchange[0], exchange[1]);
  }
}