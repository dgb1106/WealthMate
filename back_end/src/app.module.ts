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
import { AiUtilsModule } from './ai-utils/ai-utils.module';
import { CacheModule } from '@nestjs/cache-manager';
import { ScheduleModule } from '@nestjs/schedule';
import { SchedulesModule } from './schedules/schedules.module';
import { FamilyModule } from './family/family.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
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
    AiUtilsModule,
    CacheModule.register({
      isGlobal: true,
      ttl: 300,
      max: 100,
    }),
    ScheduleModule.forRoot(),
    SchedulesModule,
    FamilyModule,
    ThrottlerModule.forRoot([{
      ttl: 60,          // Khoảng thời gian 60 giây
      limit: 20,        // Tối đa 20 request trong 60 giây cho mỗi IP
    }]),
  ],
  controllers: [AppController],
  providers: [AppService, {
    provide: APP_GUARD,
    useClass: ThrottlerGuard,
  }],
})
export class AppModule {}