import { FamilyMemberRole } from '../../common/enums/enum';

// Simplified interfaces for nested objects
interface SimpleUser {
  id: string;
  name: string;
  email: string;
}

interface SimpleGroup {
  id: string;
  name: string;
}

export class FamilyMember {
  id: string;
  groupId: string;
  userId: string;
  role: FamilyMemberRole;
  joined_at: Date;
  
  user?: SimpleUser;
  group?: SimpleGroup;
  
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
    const member = new FamilyMember({
      id: String(prismaFamilyMember.id),
      groupId: String(prismaFamilyMember.groupId),
      userId: prismaFamilyMember.userId,
      role: prismaFamilyMember.role,
      joined_at: new Date(prismaFamilyMember.joined_at),
    });
    
    if (prismaFamilyMember.user) {
      member.user = {
        id: prismaFamilyMember.user.id,
        name: prismaFamilyMember.user.name,
        email: prismaFamilyMember.user.email
      };
    }
    
    if (prismaFamilyMember.group) {
      member.group = {
        id: String(prismaFamilyMember.group.id),
        name: prismaFamilyMember.group.name
      };
    }
    
    return member;
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
