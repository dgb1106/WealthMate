import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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
import { LoansModule } from './loans/loans.module';
import { AiRecommendationsModule } from './ai-recommendations/ai-recommendations.module';
import { CacheModule } from '@nestjs/cache-manager';
import { ScheduleModule } from '@nestjs/schedule';
import { SchedulesModule } from './schedules/schedules.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    UsersModule, 
    AuthModule,
    PrismaModule,
    TransactionsModule,
    BudgetsModule,
    ReportsModule,
    GoalsModule,
    RecurringTransactionsModule,
    CategoriesModule,
    LoansModule,
    AiRecommendationsModule,
    CacheModule.register({
      isGlobal: true,
      ttl: 300,
      max: 100,
    }),
    ScheduleModule.forRoot(),
    SchedulesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}