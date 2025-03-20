import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { FamilyMemberRole } from '../../common/enums/enum';

export class UpdateFamilyMemberRoleDto {
  @ApiProperty({
    description: 'The new role to assign to the family member',
    enum: FamilyMemberRole,
    example: FamilyMemberRole.ADMIN,
    required: true,
  })
  @IsEnum(FamilyMemberRole)
  @IsNotEmpty()
  role: FamilyMemberRole;
}
