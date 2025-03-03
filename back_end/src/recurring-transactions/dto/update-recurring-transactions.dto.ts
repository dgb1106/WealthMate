import { IsEnum, IsOptional, IsNumber, IsString, MaxLength, IsDateString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Frequency } from '../../common/enums/enum';

export class UpdateRecurringTransactionDto {
  @ApiProperty({
    description: 'The ID of the category for this recurring transaction',
    example: '123',
    required: false
  })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiProperty({
    description: 'Amount of the recurring transaction',
    example: 250.00,
    minimum: 0.01,
    required: false
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Type(() => Number)
  amount?: number;

  @ApiProperty({
    description: 'Frequency of the recurring transaction',
    enum: Frequency,
    example: 'MONTHLY',
    required: false
  })
  @IsOptional()
  @IsEnum(Frequency)
  frequency?: Frequency;

  @ApiProperty({
    description: 'Next occurrence date of this transaction (YYYY-MM-DD)',
    example: '2025-04-01',
    required: false
  })
  @IsOptional()
  @IsDateString()
  next_occurence?: string;

  @ApiProperty({
    description: 'Description of the recurring transaction',
    example: 'Monthly Rent Payment',
    maxLength: 255,
    required: false
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}