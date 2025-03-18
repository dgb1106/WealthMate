import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { PrismaFamilyMemberRepository } from '../repositories/prisma-family-member.repository';
import { FamilyMemberService } from '../services/family-member.service';
import { FamilyMemberController } from '../controllers/family-member.controller';

@Module({
  imports: [PrismaModule],
  controllers: [FamilyMemberController],
  providers: [
    FamilyMemberService,
    {
      provide: 'FamilyMemberRepository',
      useClass: PrismaFamilyMemberRepository,
    },
    PrismaFamilyMemberRepository,
  ],
  exports: [FamilyMemberService, PrismaFamilyMemberRepository],
})
export class FamilyMemberModule {}
