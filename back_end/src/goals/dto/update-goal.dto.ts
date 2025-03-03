import { IsOptional, IsString, IsNumber, IsDateString, IsPositive, IsEnum, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { GoalStatus } from "../../common/enums/enum";

export class UpdateGoalDto {
  @ApiProperty({
    description: 'Name of the financial goal',
    example: 'Vacation to Japan',
    maxLength: 255,
    required: false
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiProperty({
    description: 'Target amount to save for this goal',
    example: 5000.00,
    minimum: 0,
    required: false
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Type(() => Number)
  target_amount?: number;

  @ApiProperty({
    description: 'Current amount saved toward this goal',
    example: 1500.00,
    minimum: 0,
    required: false
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Type(() => Number)
  saved_amount?: number;

  @ApiProperty({
    description: 'Status of the goal',
    enum: GoalStatus,
    example: 'PENDING',
    required: false
  })
  @IsOptional()
  @IsEnum(GoalStatus)
  status?: GoalStatus;

  @ApiProperty({
    description: 'Due date for achieving the goal (YYYY-MM-DD)',
    example: '2025-12-31',
    required: false
  })
  @IsOptional()
  @IsDateString()
  due_date?: string;
}