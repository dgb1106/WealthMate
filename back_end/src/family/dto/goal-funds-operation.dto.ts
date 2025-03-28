import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional, Min } from 'class-validator';

export class GoalFundsOperationDto {
  @ApiProperty({
    description: 'Amount to add/withdraw',
    example: 100,
    minimum: 0.01,
    required: true,
  })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({
    description: 'Description of the transaction',
    example: 'Monthly contribution to family vacation goal',
    required: false,
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  description?: string;
}
