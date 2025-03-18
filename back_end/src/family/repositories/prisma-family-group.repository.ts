import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FamilyGroupRepository } from './family-group-repository.interface';
import { FamilyGroup } from '../entities/family-group.entity';
import { CreateFamilyGroupDto } from '../dto/create-family-group.dto';
import { UpdateFamilyGroupDto } from '../dto/update-family-group.dto';
import { FamilyMemberRole } from '../../common/enums/enum';

@Injectable()
export class PrismaFamilyGroupRepository implements FamilyGroupRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, createFamilyGroupDto: CreateFamilyGroupDto): Promise<FamilyGroup> {
    if (!userId) {
      throw new BadRequestException('User ID is required to create a family group');
    }
  
    return this.prisma.$transaction(async (prisma) => {
      // Create the family group
      const group = await prisma.familyGroups.create({
        data: {
          name: createFamilyGroupDto.name,
          description: createFamilyGroupDto.description,
          created_at: new Date(),
          updated_at: new Date(),
          avatar_url: createFamilyGroupDto.avatar_url
        }
      });
  
      // Add the creator as the owner of the group using relation syntax
      await prisma.familyMembers.create({
        data: {
          group: {
            connect: { id: group.id }
          },
          user: {
            connect: { id: userId }
          },
          role: FamilyMemberRole.OWNER,
          joined_at: new Date()
        }
      });
  
      // Fetch the created group with members
      const createdGroup = await prisma.familyGroups.findUnique({
        where: { id: group.id },
        include: {
          members: {
            include: {
              user: true
            }
          }
        }
      });
  
      return FamilyGroup.fromPrisma(createdGroup);
    });
  }

  async findAll(userId: string): Promise<FamilyGroup[]> {
    const groups = await this.prisma.familyGroups.findMany({
      include: {
        members: {
          include: {
            user: true
          }
        },
        budgets: true,
        goals: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    return FamilyGroup.fromPrismaArray(groups);
  }

  async findOne(id: string): Promise<FamilyGroup | null> {
    const groupId = BigInt(id);
    
    const group = await this.prisma.familyGroups.findUnique({
      where: { id: groupId },
      include: {
        members: {
          include: {
            user: true
          }
        },
        budgets: {
          include: {
            category: true,
            creator: true
          }
        },
        goals: {
          include: {
            creator: true
          }
        }
      }
    });

    if (!group) {
      return null;
    }

    return FamilyGroup.fromPrisma(group);
  }

  async update(id: string, userId: string, updateFamilyGroupDto: UpdateFamilyGroupDto): Promise<FamilyGroup> {
    // Verify that the user is an owner or admin of the group
    const member = await this.prisma.familyMembers.findFirst({
      where: {
        groupId: BigInt(id),
        userId,
        role: {
          in: [FamilyMemberRole.OWNER, FamilyMemberRole.ADMIN]
        }
      }
    });

    if (!member) {
      throw new BadRequestException('You do not have permission to update this group');
    }

    const updatedGroup = await this.prisma.familyGroups.update({
      where: { id: BigInt(id) },
      data: {
        name: updateFamilyGroupDto.name,
        description: updateFamilyGroupDto.description,
        updated_at: new Date(),
        avatar_url: updateFamilyGroupDto.avatar_url
      },
      include: {
        members: {
          include: {
            user: true
          }
        },
        budgets: true,
        goals: true
      }
    });

    return FamilyGroup.fromPrisma(updatedGroup);
  }

  async remove(id: string, userId: string): Promise<void> {
    // Verify that the user is the owner of the group
    const member = await this.prisma.familyMembers.findFirst({
      where: {
        groupId: BigInt(id),
        userId,
        role: FamilyMemberRole.OWNER
      }
    });

    if (!member) {
      throw new BadRequestException('Only the group owner can delete the group');
    }

    await this.prisma.familyGroups.delete({
      where: { id: BigInt(id) }
    });
  }

  async findUserGroups(userId: string): Promise<FamilyGroup[]> {
    const groups = await this.prisma.familyGroups.findMany({
      where: {
        members: {
          some: {
            userId
          }
        }
      },
      include: {
        members: {
          include: {
            user: true
          }
        },
        budgets: true,
        goals: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    return FamilyGroup.fromPrismaArray(groups);
  }

  async findGroupsWithUserMembership(userId: string): Promise<FamilyGroup[]> {
    const groups = await this.prisma.familyGroups.findMany({
      where: {
        members: {
          some: {
            userId
          }
        }
      },
      include: {
        members: {
          include: {
            user: true
          }
        },
        budgets: {
          include: {
            category: true
          }
        },
        goals: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    return FamilyGroup.fromPrismaArray(groups);
  }

  async searchGroups(searchTerm: string): Promise<FamilyGroup[]> {
    const groups = await this.prisma.familyGroups.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } }
        ]
      },
      include: {
        members: {
          include: {
            user: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    return FamilyGroup.fromPrismaArray(groups);
  }

  async getGroupMembers(groupId: string): Promise<any[]> {
    const members = await this.prisma.familyMembers.findMany({
      where: { groupId: BigInt(groupId) },
      include: {
        user: true
      },
      orderBy: {
        joined_at: 'asc'
      }
    });

    return members.map(member => ({
      id: String(member.id),
      userId: member.userId,
      role: member.role,
      joined_at: member.joined_at,
      user: {
        id: member.user.id,
        name: member.user.name,
        email: member.user.email
      }
    }));
  }

  async getGroupSummary(groupId: string): Promise<any> {
    const group = await this.prisma.familyGroups.findUnique({
      where: { id: BigInt(groupId) },
      include: {
        members: true,
        budgets: true,
        goals: true
      }
    });

    if (!group) {
      throw new NotFoundException(`Group with ID ${groupId} not found`);
    }

    // Get statistics
    const totalMembers = group.members.length;
    const totalBudgets = group.budgets.length;
    const totalGoals = group.goals.length;
    
    // Calculate active budgets
    const today = new Date();
    const activeBudgets = group.budgets.filter(
      budget => new Date(budget.start_date) <= today && new Date(budget.end_date) >= today
    );

    // Calculate completed goals
    const completedGoals = group.goals.filter(goal => goal.status === 'COMPLETED');

    return {
      id: String(group.id),
      name: group.name,
      description: group.description,
      created_at: group.created_at,
      updated_at: group.updated_at,
      statistics: {
        totalMembers,
        totalBudgets,
        totalGoals,
        activeBudgets: activeBudgets.length,
        completedGoals: completedGoals.length
      }
    };
  }
}
