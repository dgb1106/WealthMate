import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  familyMembers: any;
  familyBudgets: any;
  familyGroups: any;
  familyGoals: any;
  familyInvitations: any;
  async onModuleInit() {
    await this.$connect();
  }
}
