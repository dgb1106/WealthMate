import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsNotEmpty, IsOptional, MaxLength, IsEnum } from 'class-validator';
import { FamilyMemberRole } from '../../common/enums/enum';

export class CreateFamilyInvitationDto {
  @ApiProperty({
    description: 'The user ID to invite to the group',
    example: 'abc123',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  inviteeId: string;

  @ApiProperty({
    description: 'The invitee email',
    example: 'invitee@example.com',
    required: true,
  })
  @IsEmail()
  inviteeEmail: string;

  @ApiProperty({
    description: 'Custom message to include with the invitation',
    example: 'Please join our family budget group!',
    required: false,
    maxLength: 200,
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  message?: string;

  @ApiProperty({
    description: 'The role to assign to the user upon acceptance',
    enum: FamilyMemberRole,
    example: FamilyMemberRole.MEMBER,
    required: false,
    default: FamilyMemberRole.MEMBER,
  })
  @IsEnum(FamilyMemberRole)
  @IsOptional()
  role?: FamilyMemberRole;
}
