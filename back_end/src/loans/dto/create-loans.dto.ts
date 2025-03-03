import { IsEnum, IsNotEmpty, IsNumber, IsString, MaxLength, IsDateString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { LoanStatus } from '../../common/enums/enum';

export class CreateLoanDto {
  @ApiProperty({
    description: 'Name of the loan',
    example: 'Home Mortgage',
    maxLength: 255
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'Due date for the loan (YYYY-MM-DD)',
    example: '2035-06-15'
  })
  @IsNotEmpty()
  @IsDateString()
  due_date: string;

  @ApiProperty({
    description: 'Total loan amount',
    example: 250000.00,
    minimum: 0
  })
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  total_amount: number;

  @ApiProperty({
    description: 'Remaining amount to be paid',
    example: 240000.00,
    minimum: 0
  })
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  remaining_amount: number;

  @ApiProperty({
    description: 'Status of the loan',
    enum: LoanStatus,
    example: 'ACTIVE'
  })
  @IsNotEmpty()
  @IsEnum(LoanStatus)
  status: LoanStatus;

  @ApiProperty({
    description: 'Annual interest rate percentage',
    example: 3.25,
    minimum: 0
  })
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  interest_rate: number;

  @ApiProperty({
    description: 'Monthly payment amount',
    example: 1250.00,
    minimum: 0
  })
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  monthly_payment: number;

  @ApiProperty({
    description: 'Description of the loan',
    example: 'Primary residence mortgage with First National Bank',
    maxLength: 255
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  description: string;
}