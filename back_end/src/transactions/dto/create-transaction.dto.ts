import { IsNotEmpty, IsNumber, IsString, IsPositive, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateTransactionDto {
  @ApiProperty({
    description: 'The ID of the category for this transaction',
    example: '123'
  })
  @IsNotEmpty({ message: 'Category is required' })
  @IsString()
  categoryId: string;

  @ApiProperty({
    description: 'Amount of the transaction, must be positive',
    example: 45.50
  })
  @IsNotEmpty({ message: 'Amount is required' })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Amount must be a number with at most 2 decimal places' })
  @IsPositive({ message: 'Amount must be a positive number' })
  @Type(() => Number)
  amount: number;

  @ApiProperty({
    description: 'Description of the transaction',
    example: 'Grocery shopping at Mega Market',
    maxLength: 255
  })
  @IsNotEmpty({ message: 'Description is required' })
  @IsString()
  @MaxLength(255, { message: 'Description cannot exceed 255 characters' })
  description: string;
}