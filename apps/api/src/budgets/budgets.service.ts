import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateBudgetDto, UpdateBudgetDto } from './dto/budget.dto'
import { BudgetPeriod } from '@prisma/client'

@Injectable()
export class BudgetsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.budget.findMany({
      where: { userId, isActive: true },
      include: {
        category: { select: { id: true, name: true, icon: true, color: true } },
      },
      orderBy: { createdAt: 'asc' },
    })
  }

  async create(userId: string, dto: CreateBudgetDto) {
    return this.prisma.budget.create({
      data: {
        userId,
        categoryId: dto.categoryId,
        amount: dto.amount,
        period: dto.period,
        startDate: new Date(dto.startDate),
        alertAt: dto.alertAt ?? 80,
      },
    })
  }

  async update(userId: string, id: string, dto: UpdateBudgetDto) {
    await this.assertOwnership(userId, id)
    return this.prisma.budget.update({ where: { id }, data: dto })
  }

  async remove(userId: string, id: string) {
    await this.assertOwnership(userId, id)
    await this.prisma.budget.update({ where: { id }, data: { isActive: false } })
  }

  async getStatus(userId: string) {
    const now = new Date()
    const budgets = await this.prisma.budget.findMany({
      where: { userId, isActive: true },
      include: {
        category: { select: { id: true, name: true, icon: true, color: true } },
      },
    })

    const statuses = await Promise.all(
      budgets.map(async (budget) => {
        const { periodStart, periodEnd } = this.getPeriodBounds(budget.period, budget.startDate, now)

        const aggregate = await this.prisma.transaction.aggregate({
          where: {
            userId,
            categoryId: budget.categoryId,
            type: 'EXPENSE',
            date: { gte: periodStart, lte: periodEnd },
          },
          _sum: { amountInBaseCurrency: true },
        })

        const spent = Number(aggregate._sum.amountInBaseCurrency ?? 0)
        const amount = Number(budget.amount)
        const percentage = amount > 0 ? Math.round((spent / amount) * 100) : 0

        return {
          budgetId: budget.id,
          categoryId: budget.categoryId,
          categoryName: budget.category.name,
          categoryIcon: budget.category.icon,
          categoryColor: budget.category.color,
          amount,
          spent,
          remaining: Math.max(0, amount - spent),
          percentage,
          alertAt: budget.alertAt,
          period: budget.period,
          isOverBudget: spent > amount,
          isAlertTriggered: percentage >= budget.alertAt,
        }
      }),
    )

    return statuses
  }

  private getPeriodBounds(
    period: BudgetPeriod,
    startDate: Date,
    now: Date,
  ): { periodStart: Date; periodEnd: Date } {
    const s = new Date(startDate)

    if (period === 'MONTHLY') {
      return {
        periodStart: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)),
        periodEnd: new Date(
          Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999),
        ),
      }
    }

    if (period === 'WEEKLY') {
      const dayOfWeek = now.getUTCDay()
      const start = new Date(now)
      start.setUTCDate(now.getUTCDate() - dayOfWeek)
      start.setUTCHours(0, 0, 0, 0)
      const end = new Date(start)
      end.setUTCDate(start.getUTCDate() + 6)
      end.setUTCHours(23, 59, 59, 999)
      return { periodStart: start, periodEnd: end }
    }

    // YEARLY
    return {
      periodStart: new Date(Date.UTC(now.getUTCFullYear(), 0, 1)),
      periodEnd: new Date(Date.UTC(now.getUTCFullYear(), 11, 31, 23, 59, 59, 999)),
    }
  }

  private async assertOwnership(userId: string, id: string) {
    const budget = await this.prisma.budget.findUnique({ where: { id } })
    if (!budget) throw new NotFoundException('Budget not found')
    if (budget.userId !== userId) throw new ForbiddenException()
    return budget
  }
}
