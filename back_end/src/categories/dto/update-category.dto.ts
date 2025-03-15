import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TransactionType } from '../../common/enums/enum';

export class UpdateCategoryDto {
  @ApiProperty({
    description: 'Tên danh mục',
    example: 'Tiền ăn',
    required: false
  })
  @IsOptional()
  @IsString({ message: 'Tên danh mục phải là chuỗi' })
  name?: string;

  @ApiProperty({
    description: 'Loại danh mục (Thu nhập/Chi tiêu)',
    enum: TransactionType,
    example: TransactionType.EXPENSE,
    required: false
  })
  @IsOptional()
  @IsEnum(TransactionType, { message: 'Loại danh mục phải là INCOME hoặc EXPENSE' })
  type?: TransactionType;
}
