import { IsString, IsEmail } from 'class-validator';

export class CreateFamilyInvitationDto {
  @IsEmail()
  inviteeEmail: string;
}
