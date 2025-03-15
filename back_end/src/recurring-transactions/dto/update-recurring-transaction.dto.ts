import { IsOptional, IsString, IsNumber, IsEnum, IsDateString, MinLength, MaxLength, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Frequency } from '../../common/enums/enum';

export class UpdateRecurringTransactionDto {
  @ApiProperty({
    description: 'ID of the category for this recurring transaction',
    example: '1',
    required: false
  })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiProperty({
    description: 'Amount of the recurring transaction',
    example: 100,
    required: false
  })
  @IsOptional()
  @IsNumber()
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
    description: 'Date of the next occurrence (YYYY-MM-DD)',
    example: '2023-07-01',
    required: false
  })
  @IsOptional()
  @IsDateString()
  next_occurence?: string;

  @ApiProperty({
    description: 'Description of the recurring transaction',
    example: 'Netflix Subscription',
    maxLength: 255,
    required: false
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  description?: string;
}
