import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TransactionType } from '../../common/enums/enum';

export class UpdateCategoryDto {
  @ApiProperty({
    description: 'The ID of the jar this category belongs to',
    example: '1',
    required: false
  })
  @IsOptional()
  @IsString()
  jarId?: string;

  @ApiProperty({
    description: 'Name of the category',
    example: 'Groceries',
    maxLength: 255,
    required: false
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiProperty({
    description: 'Type of transactions this category is used for',
    enum: TransactionType,
    example: 'EXPENSE',
    required: false
  })
  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;
}