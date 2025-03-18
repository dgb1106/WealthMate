import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { PrismaFamilyGoalRepository } from '../repositories/prisma-family-goal.repository';
import { FamilyGoalService } from '../services/family-goal.service';
import { FamilyGoalController } from '../controllers/family-goal.controller';
import { PrismaFamilyMemberRepository } from '../repositories/prisma-family-member.repository';

@Module({
  imports: [PrismaModule],
  controllers: [FamilyGoalController],
  providers: [
    FamilyGoalService,
    {
      provide: 'FamilyGoalRepository',
      useClass: PrismaFamilyGoalRepository,
    },
    PrismaFamilyGoalRepository,
    PrismaFamilyMemberRepository,
  ],
  exports: [FamilyGoalService],
})
export class FamilyGoalModule {}
