import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { TransactionsModule } from './transactions/transactions.module';
import { BudgetsModule } from './budgets/budgets.module';
import { ReportsModule } from './reports/reports.module';
import { GoalsModule } from './goals/goals.module';
import { RecurringTransactionsModule } from './recurring-transactions/recurring-transactions.module';
import { CategoriesModule } from './categories/categories.module';
import { JarsModule } from './jars/jars.module';
import { LoansModule } from './loans/loans.module';
import { LoansController } from './loans/loans.controller';
import { LoansService } from './loans/loans.service';
import { AiRecommendationsModule } from './ai-recommendations/ai-recommendations.module';


@Module({
  imports: [
    UsersModule, 
    AuthModule,
    PrismaModule,
    TransactionsModule,
    BudgetsModule,
    ReportsModule,
    GoalsModule,
    RecurringTransactionsModule,
    CategoriesModule,
    JarsModule,
    LoansModule,
    AiRecommendationsModule
  ],
  controllers: [AppController, LoansController],
  providers: [AppService, LoansService],
})
export class AppModule {}