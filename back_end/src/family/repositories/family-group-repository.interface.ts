import { FamilyGroup } from '../entities/family-group.entity';
import { CreateFamilyGroupDto } from '../dto/create-family-group.dto';
import { UpdateFamilyGroupDto } from '../dto/update-family-group.dto';

export interface FamilyGroupRepository {
  create(userId: string, createFamilyGroupDto: CreateFamilyGroupDto): Promise<FamilyGroup>;
  findAll(userId: string): Promise<FamilyGroup[]>;
  findOne(id: string): Promise<FamilyGroup | null>;
  update(id: string, userId: string, updateFamilyGroupDto: UpdateFamilyGroupDto): Promise<FamilyGroup>;
  remove(id: string, userId: string): Promise<void>;
  findUserGroups(userId: string): Promise<FamilyGroup[]>;
  findGroupsWithUserMembership(userId: string): Promise<FamilyGroup[]>;
  searchGroups(searchTerm: string): Promise<FamilyGroup[]>;
  getGroupMembers(groupId: string): Promise<any[]>;
  getGroupSummary(groupId: string): Promise<any>;
}
