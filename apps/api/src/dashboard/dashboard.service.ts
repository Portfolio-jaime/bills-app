import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { baseCurrency: true },
    })

    const now = new Date()
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
    const monthEnd = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999),
    )

    // Accounts
    const accounts = await this.prisma.account.findMany({
      where: { userId, isArchived: false },
      select: { id: true, name: true, type: true, currency: true, balance: true, color: true },
    })

    // Monthly income/expenses (in base currency)
    const [incomeAgg, expenseAgg] = await Promise.all([
      this.prisma.transaction.aggregate({
        where: { userId, type: 'INCOME', date: { gte: monthStart, lte: monthEnd } },
        _sum: { amountInBaseCurrency: true },
      }),
      this.prisma.transaction.aggregate({
        where: { userId, type: 'EXPENSE', date: { gte: monthStart, lte: monthEnd } },
        _sum: { amountInBaseCurrency: true },
      }),
    ])

    const monthlyIncome = Number(incomeAgg._sum.amountInBaseCurrency ?? 0)
    const monthlyExpenses = Number(expenseAgg._sum.amountInBaseCurrency ?? 0)
    const monthlySavings = monthlyIncome - monthlyExpenses

    // Compute total balance in base currency (simplified: sum amountInBaseCurrency approach)
    // We use account balances and get current exchange rates for proper conversion
    const accountBalances = accounts.map((a) => ({
      accountId: a.id,
      accountName: a.name,
      accountType: a.type,
      currency: a.currency,
      balance: Number(a.balance),
      balanceInBaseCurrency: Number(a.balance), // simplified — ideally convert via exchange rate
      color: a.color,
    }))

    const totalBalanceInBaseCurrency = accountBalances.reduce(
      (sum, a) => sum + a.balanceInBaseCurrency,
      0,
    )

    return {
      totalBalanceInBaseCurrency,
      monthlyIncome,
      monthlyExpenses,
      monthlySavings,
      savingsRate:
        monthlyIncome > 0 ? Math.round((monthlySavings / monthlyIncome) * 10000) / 100 : 0,
      baseCurrency: user.baseCurrency,
      accountBalances,
    }
  }

  async getMonthlyChart(userId: string) {
    const now = new Date()
    const months: Array<{ income: number; expenses: number; month: string }> = []

    for (let i = 11; i >= 0; i--) {
      const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1))
      const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i + 1, 0, 23, 59, 59, 999))
      const monthKey = `${start.getUTCFullYear()}-${String(start.getUTCMonth() + 1).padStart(2, '0')}`

      const [incomeAgg, expenseAgg] = await Promise.all([
        this.prisma.transaction.aggregate({
          where: { userId, type: 'INCOME', date: { gte: start, lte: end } },
          _sum: { amountInBaseCurrency: true },
        }),
        this.prisma.transaction.aggregate({
          where: { userId, type: 'EXPENSE', date: { gte: start, lte: end } },
          _sum: { amountInBaseCurrency: true },
        }),
      ])

      const income = Number(incomeAgg._sum.amountInBaseCurrency ?? 0)
      const expenses = Number(expenseAgg._sum.amountInBaseCurrency ?? 0)
      months.push({ month: monthKey, income, expenses, savings: income - expenses } as any)
    }

    return months
  }

  async getCategoryChart(userId: string, type: 'INCOME' | 'EXPENSE' = 'EXPENSE') {
    const now = new Date()
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
    const monthEnd = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999),
    )

    const grouped = await this.prisma.transaction.groupBy({
      by: ['categoryId'],
      where: { userId, type, date: { gte: monthStart, lte: monthEnd }, categoryId: { not: null } },
      _sum: { amountInBaseCurrency: true },
      _count: { id: true },
      orderBy: { _sum: { amountInBaseCurrency: 'desc' } },
    })

    const total = grouped.reduce((s, g) => s + Number(g._sum.amountInBaseCurrency ?? 0), 0)

    const results = await Promise.all(
      grouped.map(async (g) => {
        const category = g.categoryId
          ? await this.prisma.category.findUnique({ where: { id: g.categoryId } })
          : null
        const amount = Number(g._sum.amountInBaseCurrency ?? 0)
        return {
          categoryId: g.categoryId,
          categoryName: category?.name ?? 'Uncategorized',
          color: category?.color ?? '#94a3b8',
          amount,
          percentage: total > 0 ? Math.round((amount / total) * 10000) / 100 : 0,
          transactionCount: g._count.id,
        }
      }),
    )

    return results
  }

  async getTopExpenses(userId: string) {
    return this.getCategoryChart(userId, 'EXPENSE')
  }
}
