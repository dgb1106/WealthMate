import { FamilyMember } from '../entities/family-member.entity';
import { FamilyMemberRole } from '../../common/enums/enum';

export interface FamilyMemberRepository {
  findAll(groupId: string, options?: { includeDetails?: boolean }): Promise<FamilyMember[]>;
  findOne(id: string): Promise<FamilyMember | null>;
  findByUserAndGroup(userId: string, groupId: string): Promise<FamilyMember | null>;
  addMember(groupId: string, userId: string, role: FamilyMemberRole): Promise<FamilyMember>;
  updateRole(id: string, role: FamilyMemberRole): Promise<FamilyMember>;
  remove(id: string): Promise<void>;
  transferOwnership(groupId: string, currentOwnerId: string, newOwnerId: string): Promise<void>;
  isGroupMember(userId: string, groupId: string): Promise<boolean>;
  countMembersByRole(groupId: string): Promise<{ role: string; count: number }[]>;
}
