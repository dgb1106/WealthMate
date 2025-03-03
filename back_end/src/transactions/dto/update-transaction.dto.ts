import { IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateTransactionDto {
  @ApiProperty({
    description: 'The ID of the category for this transaction',
    example: '123',
    required: false
  })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiProperty({
    description: 'Amount of the transaction (positive for income, negative for expenses)',
    example: -45.50,
    required: false
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Amount must be a number with at most 2 decimal places' })
  @Type(() => Number)
  amount?: number;

  @ApiProperty({
    description: 'Description of the transaction',
    example: 'Grocery shopping at Mega Market',
    maxLength: 255,
    required: false
  })
  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'Description cannot exceed 255 characters' })
  description?: string;
}