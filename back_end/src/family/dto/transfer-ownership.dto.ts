import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class TransferOwnershipDto {
  @ApiProperty({
    description: 'The ID of the member who will become the new owner',
    example: 'abc123',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  newOwnerId: string;

  @ApiProperty({
    description: 'Confirmation message to verify intentional transfer',
    example: 'I confirm I want to transfer ownership',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  confirmationMessage: string;
}
