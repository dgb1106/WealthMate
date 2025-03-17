import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { FamilyTransactionContributionController } from '../controllers/family-transaction-contribution.controller';
import { FamilyTransactionContributionService } from '../services/family-transaction-contribution.service';
import { PrismaFamilyTransactionContributionRepository } from '../repositories/prisma-family-transaction-contribution.repository';
import { FamilyGroupModule } from './family-group.module';

@Module({
  imports: [PrismaModule, FamilyGroupModule],
  controllers: [FamilyTransactionContributionController],
  providers: [
    FamilyTransactionContributionService,
    PrismaFamilyTransactionContributionRepository
  ],
  exports: [FamilyTransactionContributionService, PrismaFamilyTransactionContributionRepository]
})
export class FamilyTransactionContributionModule {}
