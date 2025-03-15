import { IsNotEmpty, IsNumber, IsPositive, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PayLoanDto {
  @ApiProperty({ description: 'Số tiền thanh toán', example: 500 })
  @IsNotEmpty({ message: 'Số tiền thanh toán không được để trống' })
  @IsNumber({}, { message: 'Số tiền thanh toán phải là số' })
  @IsPositive({ message: 'Số tiền thanh toán phải lớn hơn 0' })
  amount: number;

  @ApiProperty({ description: 'Ghi chú thanh toán', required: false })
  @IsOptional()
  @IsString({ message: 'Ghi chú phải là chuỗi' })
  note?: string;
}
