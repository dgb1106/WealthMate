import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { TransactionsModule } from '../transactions/transactions.module';
import { CategoriesModule } from '../categories/categories.module';
import { BudgetsModule } from '../budgets/budgets.module';
import { UsersModule } from '../users/users.module';
import { DateUtilsService } from '../common/services/date-utils.service';
@Module({
  imports: [
    TransactionsModule,
    CategoriesModule,
    BudgetsModule,
    UsersModule,
  ],
  controllers: [ReportsController],
  providers: [ReportsService, DateUtilsService],
  exports: [ReportsService]
})
export class ReportsModule {}
