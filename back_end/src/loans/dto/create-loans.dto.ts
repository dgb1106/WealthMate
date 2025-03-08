import { IsNotEmpty, IsNumber, IsString, IsOptional, IsDateString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLoanDto {
  @ApiProperty({
    description: 'Tên khoản nợ',
    example: 'Vay mua nhà',
  })
  @IsNotEmpty({ message: 'Tên khoản nợ không được để trống' })
  @IsString({ message: 'Tên khoản nợ phải là chuỗi' })
  name: string;

  @ApiProperty({
    description: 'Ngày đến hạn của khoản nợ',
    example: '2025-12-31',
  })
  @IsNotEmpty({ message: 'Ngày đến hạn không được để trống' })
  @IsDateString({}, { message: 'Ngày đến hạn phải đúng định dạng ngày' })
  due_date: string;

  @ApiProperty({
    description: 'Tổng số tiền của khoản nợ',
    example: 500000000,
  })
  @IsNotEmpty({ message: 'Tổng số tiền không được để trống' })
  @IsNumber({}, { message: 'Tổng số tiền phải là số' })
  @Min(0, { message: 'Tổng số tiền phải lớn hơn hoặc bằng 0' })
  total_amount: number;

  @ApiProperty({
    description: 'Lãi suất hàng năm (%)',
    example: 7.5,
  })
  @IsNotEmpty({ message: 'Lãi suất không được để trống' })
  @IsNumber({}, { message: 'Lãi suất phải là số' })
  @Min(0, { message: 'Lãi suất phải lớn hơn hoặc bằng 0' })
  interest_rate: number;

  @ApiProperty({
    description: 'Số tiền thanh toán hàng tháng',
    example: 10000000,
  })
  @IsNotEmpty({ message: 'Số tiền thanh toán hàng tháng không được để trống' })
  @IsNumber({}, { message: 'Số tiền thanh toán hàng tháng phải là số' })
  @Min(0, { message: 'Số tiền thanh toán hàng tháng phải lớn hơn hoặc bằng 0' })
  monthly_payment: number;

  @ApiProperty({
    description: 'Mô tả khoản nợ',
    example: 'Khoản vay mua nhà tại ngân hàng ABC',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Mô tả phải là chuỗi' })
  description?: string;
} 