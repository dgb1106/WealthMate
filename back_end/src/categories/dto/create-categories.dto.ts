import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TransactionType } from '../../common/enums/enum';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'The ID of the jar this category belongs to',
    example: '1'
  })
  @IsNotEmpty()
  @IsString()
  jarId: string;

  @ApiProperty({
    description: 'Name of the category',
    example: 'Groceries',
    maxLength: 255
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'Type of transactions this category is used for',
    enum: TransactionType,
    example: 'EXPENSE'
  })
  @IsNotEmpty()
  @IsEnum(TransactionType)
  type: TransactionType;
}