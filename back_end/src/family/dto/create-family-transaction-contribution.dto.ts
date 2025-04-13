import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { ContributionType } from '../../common/enums/enum';

export class CreateFamilyTransactionContributionDto {
  @ApiProperty({
    description: 'The ID of the transaction to contribute',
    example: 'abc123',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  transactionId: string;

  @ApiProperty({
    description: 'The ID of category to contribute to',
    example: '1',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  categoryId: string;
  
  @ApiProperty({
    description: 'The ID of the family group',
    example: 'xyz789',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  groupId: string;

  @ApiProperty({
    description: 'The amount to contribute from the transaction',
    example: 50.25,
    minimum: 0,
    required: true,
  })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({
    description: 'Type of contribution (BUDGET or GOAL)',
    enum: ContributionType,
    example: ContributionType.BUDGET,
    required: true,
  })
  @IsEnum(ContributionType)
  contributionType: ContributionType;
}
