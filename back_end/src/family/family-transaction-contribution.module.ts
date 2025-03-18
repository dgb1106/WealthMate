import { Module } from '@nestjs/common';
import { FamilyTransactionContributionService } from './services/family-transaction-contribution.service';
import { FamilyTransactionContributionController } from './controllers/family-transaction-contribution.controller';
import { PrismaFamilyTransactionContributionRepository } from './repositories/prisma-family-transaction-contribution.repository';
import { PrismaFamilyMemberRepository } from './repositories/prisma-family-member.repository';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FamilyTransactionContributionController],
  providers: [
    FamilyTransactionContributionService,
    {
      provide: 'FamilyTransactionContributionRepository',
      useClass: PrismaFamilyTransactionContributionRepository,
    },
    PrismaFamilyMemberRepository,
  ],
  exports: [FamilyTransactionContributionService],
})
export class FamilyTransactionContributionModule {}
