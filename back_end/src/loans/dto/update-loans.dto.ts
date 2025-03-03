import { IsEnum, IsOptional, IsNumber, IsString, MaxLength, IsDateString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { LoanStatus } from '../../common/enums/enum';

export class UpdateLoanDto {
  @ApiProperty({
    description: 'Name of the loan',
    example: 'Home Mortgage Refinance',
    maxLength: 255,
    required: false
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiProperty({
    description: 'Due date for the loan (YYYY-MM-DD)',
    example: '2035-06-15',
    required: false
  })
  @IsOptional()
  @IsDateString()
  due_date?: string;

  @ApiProperty({
    description: 'Remaining amount to be paid',
    example: 235000.00,
    minimum: 0,
    required: false
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  remaining_amount?: number;

  @ApiProperty({
    description: 'Status of the loan',
    enum: LoanStatus,
    example: 'ACTIVE',
    required: false
  })
  @IsOptional()
  @IsEnum(LoanStatus)
  status?: LoanStatus;

  @ApiProperty({
    description: 'Annual interest rate percentage',
    example: 3.00,
    minimum: 0,
    required: false
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  interest_rate?: number;

  @ApiProperty({
    description: 'Monthly payment amount',
    example: 1200.00,
    minimum: 0,
    required: false
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  monthly_payment?: number;

  @ApiProperty({
    description: 'Description of the loan',
    example: 'Refinanced mortgage with Second National Bank',
    maxLength: 255,
    required: false
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}