import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { TransactionsModule } from '../transactions/transactions.module';
import { CategoriesModule } from '../categories/categories.module';
import { BudgetsModule } from '../budgets/budgets.module';
import { UsersModule } from '../users/users.module';
import { DateUtilsService } from '../common/services/date-utils.service';
import { LoansModule } from 'src/loans/loans.module';
import { GoalsModule } from 'src/goals/goals.module';
@Module({
  imports: [
    TransactionsModule,
    CategoriesModule,
    BudgetsModule,
    LoansModule,
    GoalsModule,
    UsersModule,
  ],
  controllers: [ReportsController],
  providers: [ReportsService, DateUtilsService],
  exports: [ReportsService]
})
export class ReportsModule {}
