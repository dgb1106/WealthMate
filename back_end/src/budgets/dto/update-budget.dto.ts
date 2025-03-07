import { IsNumber, IsString, IsDateString, IsPositive, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateBudgetDto {
  @ApiProperty({
    description: 'The ID of the category for this budget',
    example: '123',
    required: false
  })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiProperty({
    description: 'The limit amount for this budget',
    example: 500.00,
    minimum: 0,
    required: false
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Type(() => Number)
  limit_amount?: number;

  @ApiProperty({
    description: 'The start date of the budget period (YYYY-MM-DD)',
    example: '2025-01-01',
    required: false
  })
  @IsOptional()
  @IsDateString()
  start_date?: string;

  @ApiProperty({
    description: 'The end date of the budget period (YYYY-MM-DD)',
    example: '2025-01-31',
    required: false
  })
  @IsOptional()
  @IsDateString()
  end_date?: string;

  @ApiProperty({
    description: 'The amount spent so far in this budget',
    example: 125.50,
    minimum: 0,
    required: false
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Type(() => Number)
  spent_amount?: number;
}
