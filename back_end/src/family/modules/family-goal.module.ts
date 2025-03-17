import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { FamilyGoalController } from '../controllers/family-goal.controller';
import { FamilyGoalService } from '../services/family-goal.service';
import { PrismaFamilyGoalRepository } from '../repositories/prisma-family-goal.repository';
import { FamilyGroupModule } from './family-group.module';

@Module({
  imports: [PrismaModule, FamilyGroupModule],
  controllers: [FamilyGoalController],
  providers: [
    FamilyGoalService,
    PrismaFamilyGoalRepository
  ],
  exports: [FamilyGoalService, PrismaFamilyGoalRepository]
})
export class FamilyGoalModule {}
