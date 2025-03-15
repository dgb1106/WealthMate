import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TransactionType } from '../../common/enums/enum';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Tên danh mục',
    example: 'Tiền ăn'
  })
  @IsNotEmpty({ message: 'Tên danh mục không được để trống' })
  @IsString({ message: 'Tên danh mục phải là chuỗi' })
  name: string;

  @ApiProperty({
    description: 'Loại danh mục (Thu nhập/Chi tiêu)',
    enum: TransactionType,
    example: TransactionType.EXPENSE
  })
  @IsNotEmpty({ message: 'Loại danh mục không được để trống' })
  @IsEnum(TransactionType, { message: 'Loại danh mục phải là INCOME hoặc EXPENSE' })
  type: TransactionType;
}
