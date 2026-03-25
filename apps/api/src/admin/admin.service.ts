import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  // ── System stats ────────────────────────────────────────────────────────────
  async getStats() {
    const [users, transactions, accounts, categories, budgets, recurringRules] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.transaction.count(),
        this.prisma.account.count(),
        this.prisma.category.count(),
        this.prisma.budget.count(),
        this.prisma.recurringRule.count(),
      ])

    const [incomeSum, expenseSum] = await Promise.all([
      this.prisma.transaction.aggregate({
        where: { type: 'INCOME' },
        _sum: { amount: true },
      }),
      this.prisma.transaction.aggregate({
        where: { type: 'EXPENSE' },
        _sum: { amount: true },
      }),
    ])

    const recentUsers = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, email: true, name: true, createdAt: true, onboardingCompleted: true },
    })

    return {
      counts: { users, transactions, accounts, categories, budgets, recurringRules },
      totals: {
        income: Number(incomeSum._sum.amount ?? 0),
        expense: Number(expenseSum._sum.amount ?? 0),
      },
      recentUsers,
    }
  }

  // ── Users ────────────────────────────────────────────────────────────────────
  async getUsers(page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit
    const where = search
      ? { OR: [{ email: { contains: search, mode: 'insensitive' as const } }, { name: { contains: search, mode: 'insensitive' as const } }] }
      : {}

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          baseCurrency: true,
          onboardingCompleted: true,
          createdAt: true,
          updatedAt: true,
          _count: { select: { accounts: true, transactions: true, budgets: true } },
        },
      }),
      this.prisma.user.count({ where }),
    ])

    return { data, total, page, limit, pages: Math.ceil(total / limit) }
  }

  async getUser(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        phone: true,
        bio: true,
        baseCurrency: true,
        onboardingCompleted: true,
        createdAt: true,
        updatedAt: true,
        accounts: {
          select: { id: true, name: true, type: true, balance: true, currency: true },
        },
        transactions: {
          take: 10,
          orderBy: { date: 'desc' },
          select: { id: true, description: true, amount: true, type: true, date: true },
        },
        budgets: {
          select: { id: true, amount: true, period: true },
        },
        _count: { select: { accounts: true, transactions: true, budgets: true, recurringRules: true } },
      },
    })
    if (!user) throw new NotFoundException('User not found')
    return user
  }

  async deleteUser(id: string) {
    await this.getUser(id) // throws 404 if not found
    // Cascade delete handled by Prisma schema relations
    await this.prisma.user.delete({ where: { id } })
    return { message: 'User deleted' }
  }

  // ── Transactions ─────────────────────────────────────────────────────────────
  async getTransactions(page = 1, limit = 25) {
    const skip = (page - 1) * limit
    const [data, total] = await Promise.all([
      this.prisma.transaction.findMany({
        skip,
        take: limit,
        orderBy: { date: 'desc' },
        include: {
          user: { select: { id: true, email: true, name: true } },
          account: { select: { name: true, currency: true } },
          category: { select: { name: true, icon: true } },
        },
      }),
      this.prisma.transaction.count(),
    ])
    return { data, total, page, limit, pages: Math.ceil(total / limit) }
  }

  // ── Raw DB tables ─────────────────────────────────────────────────────────────
  async getTableData(table: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit
    const allowedTables = [
      'user', 'account', 'transaction', 'category',
      'budget', 'recurringRule', 'exchangeRate', 'financialPlan',
    ] as const
    type AllowedTable = (typeof allowedTables)[number]

    if (!allowedTables.includes(table as AllowedTable)) {
      throw new NotFoundException(`Table '${table}' not found or not accessible`)
    }

    const model = (this.prisma as any)[table as AllowedTable]
    const [data, total] = await Promise.all([
      model.findMany({ skip, take: limit }),
      model.count(),
    ])
    return { data, total, table, page, limit, pages: Math.ceil(total / limit) }
  }
}
