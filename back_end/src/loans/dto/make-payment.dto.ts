import { IsNotEmpty, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MakePaymentDto {
  @ApiProperty({
    description: 'Số tiền thanh toán',
    example: 5000000,
  })
  @IsNotEmpty({ message: 'Số tiền thanh toán không được để trống' })
  @IsNumber({}, { message: 'Số tiền thanh toán phải là số' })
  @Min(0, { message: 'Số tiền thanh toán phải lớn hơn hoặc bằng 0' })
  amount: number;
} 