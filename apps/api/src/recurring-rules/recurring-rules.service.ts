import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateRecurringRuleDto, UpdateRecurringRuleDto } from './dto/recurring-rule.dto'
import { Frequency } from '@prisma/client'

function computeNextDueDate(startDate: Date, frequency: Frequency): Date {
  const next = new Date(startDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Advance until next due date >= today
  while (next < today) {
    switch (frequency) {
      case Frequency.DAILY:
        next.setDate(next.getDate() + 1)
        break
      case Frequency.WEEKLY:
        next.setDate(next.getDate() + 7)
        break
      case Frequency.BIWEEKLY:
        next.setDate(next.getDate() + 14)
        break
      case Frequency.MONTHLY:
        next.setMonth(next.getMonth() + 1)
        break
      case Frequency.QUARTERLY:
        next.setMonth(next.getMonth() + 3)
        break
      case Frequency.YEARLY:
        next.setFullYear(next.getFullYear() + 1)
        break
    }
  }
  return next
}

@Injectable()
export class RecurringRulesService {
  constructor(private readonly prisma: PrismaService) {}

  private assertOwner(rule: { userId: string }, userId: string) {
    if (rule.userId !== userId) throw new ForbiddenException()
  }

  private include = {
    account: { select: { id: true, name: true, currency: true } },
    category: { select: { id: true, name: true, icon: true, color: true } },
  }

  async findAll(userId: string) {
    return this.prisma.recurringRule.findMany({
      where: { userId },
      include: this.include,
      orderBy: { nextDueDate: 'asc' },
    })
  }

  async findOne(id: string, userId: string) {
    const rule = await this.prisma.recurringRule.findUnique({ where: { id }, include: this.include })
    if (!rule) throw new NotFoundException('Recurring rule not found')
    this.assertOwner(rule, userId)
    return rule
  }

  async create(userId: string, dto: CreateRecurringRuleDto) {
    const startDate = new Date(dto.startDate)
    const nextDueDate = computeNextDueDate(startDate, dto.frequency)

    return this.prisma.recurringRule.create({
      data: {
        userId,
        name: dto.name,
        description: dto.description,
        amount: dto.amount,
        currency: dto.currency,
        type: dto.type,
        accountId: dto.accountId,
        categoryId: dto.categoryId ?? null,
        frequency: dto.frequency,
        startDate,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        nextDueDate,
        notes: dto.notes,
        autoCreate: dto.autoCreate ?? false,
      },
      include: this.include,
    })
  }

  async update(id: string, userId: string, dto: UpdateRecurringRuleDto) {
    const rule = await this.prisma.recurringRule.findUnique({ where: { id } })
    if (!rule) throw new NotFoundException('Recurring rule not found')
    this.assertOwner(rule, userId)

    // Recompute nextDueDate if frequency changed
    let nextDueDate: Date | undefined
    if (dto.frequency && dto.frequency !== rule.frequency) {
      nextDueDate = computeNextDueDate(rule.startDate, dto.frequency)
    }

    return this.prisma.recurringRule.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.amount !== undefined && { amount: dto.amount }),
        ...(dto.currency !== undefined && { currency: dto.currency }),
        ...(dto.frequency !== undefined && { frequency: dto.frequency }),
        ...(dto.endDate !== undefined && { endDate: dto.endDate ? new Date(dto.endDate) : null }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        ...(dto.autoCreate !== undefined && { autoCreate: dto.autoCreate }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
        ...(nextDueDate && { nextDueDate }),
      },
      include: this.include,
    })
  }

  async remove(id: string, userId: string) {
    const rule = await this.prisma.recurringRule.findUnique({ where: { id } })
    if (!rule) throw new NotFoundException('Recurring rule not found')
    this.assertOwner(rule, userId)
    await this.prisma.recurringRule.delete({ where: { id } })
    return { deleted: true }
  }

  /** Returns rules due today or overdue (for dashboard widget or cron job) */
  async getDueRules(userId: string) {
    const today = new Date()
    today.setHours(23, 59, 59, 999)
    return this.prisma.recurringRule.findMany({
      where: { userId, isActive: true, nextDueDate: { lte: today } },
      include: this.include,
      orderBy: { nextDueDate: 'asc' },
    })
  }
}
