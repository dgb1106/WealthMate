import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsDate, IsOptional, IsEnum, Min, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export enum GoalPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export class CreateFamilyGoalDto {
  @ApiProperty({
    description: 'The name of the family goal',
    example: 'Summer Vacation',
    required: true,
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Description of the family goal',
    example: 'Saving for our summer vacation to Hawaii',
    required: false,
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    description: 'The target amount to save for this goal',
    example: 5000,
    minimum: 0,
    required: true,
  })
  @IsNumber()
  @Min(0)
  target_amount: number;

  @ApiProperty({
    description: 'The amount already saved for this goal',
    example: 1200,
    minimum: 0,
    required: false,
    default: 0,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  saved_amount?: number;

  @ApiProperty({
    description: 'The target date to achieve this goal',
    example: '2023-08-01T00:00:00.000Z',
    type: Date,
    required: true,
  })
  @IsDate()
  @Type(() => Date)
  target_date: Date;

  @ApiProperty({
    description: 'Priority level of the goal',
    enum: GoalPriority,
    example: GoalPriority.MEDIUM,
    required: false,
    default: GoalPriority.MEDIUM,
  })
  @IsEnum(GoalPriority)
  @IsOptional()
  priority?: GoalPriority;
  due_date: string | number | Date;
}
