import { IsNotEmpty, IsString, IsNumber, IsEnum, IsDateString, MinLength, MaxLength, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Frequency } from '../../common/enums/enum';

export class CreateRecurringTransactionDto {
  @ApiProperty({
    description: 'ID of the category for this recurring transaction',
    example: '1'
  })
  @IsNotEmpty()
  @IsString()
  categoryId: string;

  @ApiProperty({
    description: 'Amount of the recurring transaction',
    example: 100
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  amount: number;

  @ApiProperty({
    description: 'Frequency of the recurring transaction',
    enum: Frequency,
    example: 'MONTHLY'
  })
  @IsNotEmpty()
  @IsEnum(Frequency)
  frequency: Frequency;

  @ApiProperty({
    description: 'Date of the first occurrence (YYYY-MM-DD)',
    example: '2023-07-01'
  })
  @IsNotEmpty()
  @IsDateString()
  next_occurence: string;

  @ApiProperty({
    description: 'Description of the recurring transaction',
    example: 'Netflix Subscription',
    maxLength: 255
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  description: string;
}
