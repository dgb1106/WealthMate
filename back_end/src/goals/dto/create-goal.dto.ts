import { IsNotEmpty, IsString, IsNumber, IsDateString, IsPositive, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateGoalDto {
  @ApiProperty({
    description: 'Name of the financial goal',
    example: 'Vacation to Japan',
    maxLength: 255
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'Target amount to save for this goal',
    example: 5000.00,
    minimum: 0
  })
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Type(() => Number)
  target_amount: number;

  @ApiProperty({
    description: 'Initial amount already saved toward this goal',
    example: 1000.00,
    minimum: 0,
    required: false
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Type(() => Number)
  saved_amount?: number = 0;

  @ApiProperty({
    description: 'Due date for achieving the goal (YYYY-MM-DD)',
    example: '2025-12-31'
  })
  @IsNotEmpty()
  @IsDateString()
  due_date: string;
}