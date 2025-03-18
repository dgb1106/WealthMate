import { IsString } from 'class-validator';

export class TransferOwnershipDto {
  @IsString()
  newOwnerId: string;
}
