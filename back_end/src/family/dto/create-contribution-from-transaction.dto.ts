import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateContributionFromTransactionDto {
  @ApiProperty({
    description: 'The ID of the transaction to contribute',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  transactionId: string;

  @ApiProperty({
    description: 'The ID of the family group to contribute to',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  groupId: string;

  @ApiProperty({
    description: 'Optional note for the contribution',
    required: false
  })
  @IsString()
  @IsOptional()
  note?: string;
}
