import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { FamilyGroupController } from '../controllers/family-group.controller';
import { FamilyMemberController } from '../controllers/family-member.controller';
import { FamilyGroupService } from '../services/family-group.service';
import { FamilyMemberService } from '../services/family-member.service';
import { PrismaFamilyGroupRepository } from '../repositories/prisma-family-group.repository';
import { PrismaFamilyMemberRepository } from '../repositories/prisma-family-member.repository';

@Module({
  imports: [PrismaModule],
  controllers: [FamilyGroupController, FamilyMemberController],
  providers: [
    FamilyGroupService,
    FamilyMemberService,
    PrismaFamilyGroupRepository,
    PrismaFamilyMemberRepository
  ],
  exports: [FamilyGroupService, FamilyMemberService, PrismaFamilyMemberRepository]
})
export class FamilyGroupModule {}
