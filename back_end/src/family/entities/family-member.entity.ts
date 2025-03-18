import { Type } from 'class-transformer';
import { User } from '../../users/entities/users.entity';
import { FamilyGroup } from './family-group.entity';
import { FamilyMemberRole } from '../../common/enums/enum';

export class FamilyMember {
  id: string;
  groupId: string;
  userId: string;
  role: FamilyMemberRole;
  joined_at: Date;
  
  @Type(() => FamilyGroup)
  group?: FamilyGroup;
  
  @Type(() => User)
  user?: User;
  
  constructor(partial: Partial<FamilyMember>) {
    Object.assign(this, partial);
  }
  
  /**
   * Check if member is the owner of the group
   */
  isOwner(): boolean {
    return this.role === FamilyMemberRole.OWNER;
  }
  
  /**
   * Check if member is an admin of the group
   */
  isAdmin(): boolean {
    return this.role === FamilyMemberRole.ADMIN || this.role === FamilyMemberRole.OWNER;
  }
  
  /**
   * Check if member can manage (modify/delete) the group
   */
  canManageGroup(): boolean {
    return this.isOwner();
  }
  
  /**
   * Check if member can manage group members
   */
  canManageMembers(): boolean {
    return this.isAdmin();
  }
  
  /**
   * Check if member can manage budgets and goals
   */
  canManageBudgetsAndGoals(): boolean {
    return this.isAdmin();
  }
  
  /**
   * Convert a Prisma family member to a FamilyMember entity
   */
  static fromPrisma(prismaFamilyMember: any): FamilyMember {
    return new FamilyMember({
      id: String(prismaFamilyMember.id),
      groupId: String(prismaFamilyMember.groupId),
      userId: prismaFamilyMember.userId,
      role: prismaFamilyMember.role,
      joined_at: new Date(prismaFamilyMember.joined_at),
      group: prismaFamilyMember.group 
        ? FamilyGroup.fromPrisma(prismaFamilyMember.group)
        : undefined,
      user: prismaFamilyMember.user
        ? new User(prismaFamilyMember.user)
        : undefined
    });
  }
  
  /**
   * Convert multiple Prisma family members to entities
   */
  static fromPrismaArray(prismaFamilyMembers: any[]): FamilyMember[] {
    return prismaFamilyMembers.map(member => FamilyMember.fromPrisma(member));
  }
  
  /**
   * Format the family member for API responses
   */
  toResponseFormat(): any {
    return {
      id: this.id,
      groupId: this.groupId,
      userId: this.userId,
      role: this.role,
      joined_at: this.joined_at.toISOString(),
      user: this.user ? {
        id: this.user.id,
        name: this.user.name,
        email: this.user.email,
      } : undefined,
    };
  }
}
