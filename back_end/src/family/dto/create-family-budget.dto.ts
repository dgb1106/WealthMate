import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsDate, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateFamilyBudgetDto {
  @ApiProperty({
    description: 'The category ID for this budget',
    example: '1',
    required: true,
  })
  @IsString()
  categoryId: string;

  @ApiProperty({
    description: 'The maximum amount allocated for this budget',
    example: 1000,
    minimum: 0,
    required: true,
  })
  @IsNumber()
  @Min(0)
  limit_amount: number;

  @ApiProperty({
    description: 'The amount already spent in this budget',
    example: 250,
    minimum: 0,
    required: false,
    default: 0,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  spent_amount?: number;

  @ApiProperty({
    description: 'The start date of the budget period',
    example: '2023-01-01T00:00:00.000Z',
    type: Date,
    required: true,
  })
  @IsDate()
  @Type(() => Date)
  start_date: Date;

  @ApiProperty({
    description: 'The end date of the budget period',
    example: '2023-01-31T23:59:59.999Z',
    type: Date,
    required: true,
  })
  @IsDate()
  @Type(() => Date)
  end_date: Date;
}
