import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { FamilyGroupService } from '../services/family-group.service';
import { PrismaFamilyGroupRepository } from '../repositories/prisma-family-group.repository';
import { PrismaFamilyMemberRepository } from '../repositories/prisma-family-member.repository';
import { FamilyGroupController } from '../controllers/family-group.controller';

@Module({
  imports: [PrismaModule],
  controllers: [FamilyGroupController],
  providers: [
    FamilyGroupService,
    {
      provide: 'FamilyGroupRepository',
      useClass: PrismaFamilyGroupRepository,
    },
    PrismaFamilyGroupRepository,
    PrismaFamilyMemberRepository
  ],
  exports: [FamilyGroupService, PrismaFamilyGroupRepository],
})
export class FamilyGroupModule {}
