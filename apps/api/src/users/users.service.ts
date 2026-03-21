import { Injectable, ConflictException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { UpdateProfileDto } from './dto/update-profile.dto'
import { CompleteOnboardingDto } from './dto/onboarding.dto'
import { AccountType } from '@prisma/client'

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly profileSelect = {
    id: true,
    email: true,
    name: true,
    avatar: true,
    phone: true,
    bio: true,
    baseCurrency: true,
    onboardingCompleted: true,
    createdAt: true,
  }

  async getProfile(userId: string) {
    return this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        ...this.profileSelect,
        financialPlan: {
          select: {
            monthlyIncome: true,
            incomeSource: true,
            savingsGoal: true,
            goals: true,
          },
        },
      },
    })
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: dto,
      select: this.profileSelect,
    })
  }

  async completeOnboarding(userId: string, dto: CompleteOnboardingDto) {
    const existing = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { onboardingCompleted: true },
    })
    if (existing?.onboardingCompleted) {
      throw new ConflictException('Onboarding already completed')
    }

    const totalExpenses =
      dto.housingCost +
      dto.foodBudget +
      dto.transportBudget +
      dto.healthBudget +
      dto.utilitiesBudget +
      dto.subscriptionsBudget +
      dto.entertainmentBudget +
      dto.otherExpenses

    const savingsGoal = Math.max(0, dto.monthlyIncome - totalExpenses)

    return this.prisma.$transaction(async (tx) => {
      // 1. Update user profile
      await tx.user.update({
        where: { id: userId },
        data: {
          name: dto.name,
          baseCurrency: dto.baseCurrency,
          onboardingCompleted: true,
        },
      })

      // 2. Save financial plan
      await tx.financialPlan.upsert({
        where: { userId },
        create: {
          userId,
          monthlyIncome: dto.monthlyIncome,
          incomeSource: dto.incomeSource,
          housingCost: dto.housingCost,
          foodBudget: dto.foodBudget,
          transportBudget: dto.transportBudget,
          healthBudget: dto.healthBudget,
          utilitiesBudget: dto.utilitiesBudget,
          subscriptionsBudget: dto.subscriptionsBudget,
          entertainmentBudget: dto.entertainmentBudget,
          otherExpenses: dto.otherExpenses,
          savingsGoal,
          goals: dto.goals,
          notes: dto.notes,
        },
        update: {
          monthlyIncome: dto.monthlyIncome,
          incomeSource: dto.incomeSource,
          housingCost: dto.housingCost,
          foodBudget: dto.foodBudget,
          transportBudget: dto.transportBudget,
          healthBudget: dto.healthBudget,
          utilitiesBudget: dto.utilitiesBudget,
          subscriptionsBudget: dto.subscriptionsBudget,
          entertainmentBudget: dto.entertainmentBudget,
          otherExpenses: dto.otherExpenses,
          savingsGoal,
          goals: dto.goals,
          notes: dto.notes,
        },
      })

      // 3. Create accounts
      if (dto.accounts.length > 0) {
        await tx.account.createMany({
          data: dto.accounts.map((a) => ({
            userId,
            name: a.name,
            type: (a.type as AccountType) ?? AccountType.BANK,
            currency: a.currency || dto.baseCurrency,
            balance: a.balance ?? 0,
          })),
          skipDuplicates: true,
        })
      }

      // 4. Create expense budgets from the plan
      const budgetMap: Array<{ categoryName: string; amount: number }> = [
        { categoryName: 'Housing', amount: dto.housingCost },
        { categoryName: 'Food & Groceries', amount: dto.foodBudget },
        { categoryName: 'Transport', amount: dto.transportBudget },
        { categoryName: 'Health', amount: dto.healthBudget },
        { categoryName: 'Utilities', amount: dto.utilitiesBudget },
        { categoryName: 'Subscriptions', amount: dto.subscriptionsBudget },
        { categoryName: 'Entertainment', amount: dto.entertainmentBudget },
        { categoryName: 'Other', amount: dto.otherExpenses },
      ]

      for (const entry of budgetMap) {
        if (entry.amount <= 0) continue

        const category = await tx.category.findFirst({
          where: { userId, name: entry.categoryName },
        })

        if (category) {
          const startOfMonth = new Date()
          startOfMonth.setDate(1)
          startOfMonth.setHours(0, 0, 0, 0)

          await tx.budget.upsert({
            where: { categoryId_startDate: { categoryId: category.id, startDate: startOfMonth } },
            create: {
              userId,
              categoryId: category.id,
              amount: entry.amount,
              period: 'MONTHLY',
              startDate: startOfMonth,
              alertAt: 80,
            },
            update: { amount: entry.amount },
          })
        }
      }

      return {
        message: 'Onboarding completed',
        savingsGoal,
        totalExpenses,
        surplusMonthly: savingsGoal,
      }
    })
  }
}

