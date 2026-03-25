import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ThrottlerModule } from '@nestjs/throttler'
import { ScheduleModule } from '@nestjs/schedule'
import { PrismaModule } from './prisma/prisma.module'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { AccountsModule } from './accounts/accounts.module'
import { TransactionsModule } from './transactions/transactions.module'
import { CategoriesModule } from './categories/categories.module'
import { BudgetsModule } from './budgets/budgets.module'
import { ExchangeRatesModule } from './exchange-rates/exchange-rates.module'
import { DashboardModule } from './dashboard/dashboard.module'
import { RecurringRulesModule } from './recurring-rules/recurring-rules.module'
import { AdminModule } from './admin/admin.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    UsersModule,
    AccountsModule,
    TransactionsModule,
    CategoriesModule,
    BudgetsModule,
    ExchangeRatesModule,
    DashboardModule,
    RecurringRulesModule,
    AdminModule,
  ],
})
export class AppModule {}
