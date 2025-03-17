import { IsEnum } from 'class-validator';
import { FamilyMemberRole } from '../../common/enums/enum';

export class UpdateFamilyMemberRoleDto {
  @IsEnum(FamilyMemberRole)
  role: FamilyMemberRole;
}
