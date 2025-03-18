import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { FamilyBudgetController } from '../controllers/family-budget.controller';
import { FamilyBudgetService } from '../services/family-budget.service';
import { PrismaFamilyBudgetRepository } from '../repositories/prisma-family-budget.repository';
import { FamilyGroupModule } from './family-group.module';

@Module({
  imports: [PrismaModule, FamilyGroupModule],
  controllers: [FamilyBudgetController],
  providers: [
    FamilyBudgetService,
    PrismaFamilyBudgetRepository
  ],
  exports: [FamilyBudgetService, PrismaFamilyBudgetRepository]
})
export class FamilyBudgetModule {}
