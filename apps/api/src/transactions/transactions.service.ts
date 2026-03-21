import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  UnprocessableEntityException,
  BadRequestException,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { ExchangeRatesService } from '../exchange-rates/exchange-rates.service'
import { CreateTransactionDto, UpdateTransactionDto, TransactionQueryDto } from './dto/transaction.dto'
import { Prisma, TransactionType } from '@prisma/client'

@Injectable()
export class TransactionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly exchangeRates: ExchangeRatesService,
  ) {}

  async findAll(userId: string, query: TransactionQueryDto) {
    const { page = 1, limit = 20, from, to, type, categoryId, accountId, search } = query
    const skip = (page - 1) * limit

    const where: Prisma.TransactionWhereInput = {
      userId,
      ...(from || to
        ? {
            date: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to) } : {}),
            },
          }
        : {}),
      ...(type ? { type } : {}),
      ...(categoryId ? { categoryId } : {}),
      ...(accountId ? { OR: [{ accountId }, { toAccountId: accountId }] } : {}),
      ...(search
        ? {
            description: { contains: search, mode: Prisma.QueryMode.insensitive },
          }
        : {}),
    }

    const [data, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
        include: {
          category: { select: { id: true, name: true, icon: true, color: true } },
          account: { select: { id: true, name: true, currency: true, color: true } },
          toAccount: { select: { id: true, name: true, currency: true, color: true } },
        },
      }),
      this.prisma.transaction.count({ where }),
    ])

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  async findOne(userId: string, id: string) {
    const tx = await this.prisma.transaction.findUnique({
      where: { id },
      include: {
        category: true,
        account: true,
        toAccount: true,
      },
    })
    if (!tx) throw new NotFoundException('Transaction not found')
    if (tx.userId !== userId) throw new ForbiddenException()
    return tx
  }

  async create(userId: string, dto: CreateTransactionDto) {
    // Validate transfer
    if (dto.type === 'TRANSFER') {
      if (!dto.toAccountId) {
        throw new BadRequestException('toAccountId is required for TRANSFER transactions')
      }
      if (dto.toAccountId === dto.accountId) {
        throw new BadRequestException('Source and destination accounts must be different')
      }
    }

    // Verify accounts ownership
    const account = await this.prisma.account.findFirst({
      where: { id: dto.accountId, userId },
    })
    if (!account) throw new NotFoundException('Source account not found')

    let toAccount = null
    if (dto.toAccountId) {
      toAccount = await this.prisma.account.findFirst({
        where: { id: dto.toAccountId, userId },
      })
      if (!toAccount) throw new NotFoundException('Destination account not found')
    }

    // Get user base currency
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { baseCurrency: true },
    })

    // Get exchange rate
    const { rate, exchangeRate } = await this.resolveExchangeRate(dto.currency, user.baseCurrency)
    const amountInBaseCurrency = Number(dto.amount) * rate

    // Atomic transaction
    return this.prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          userId,
          accountId: dto.accountId,
          toAccountId: dto.toAccountId,
          categoryId: dto.categoryId,
          type: dto.type,
          amount: dto.amount,
          currency: dto.currency,
          amountInBaseCurrency,
          exchangeRate,
          date: new Date(dto.date),
          description: dto.description,
          notes: dto.notes,
          tags: dto.tags ?? [],
          isRecurring: dto.isRecurring ?? false,
          recurringRule: dto.recurringRule,
        },
      })

      // Adjust source account balance
      const balanceDelta = dto.type === 'INCOME' ? dto.amount : -dto.amount
      if (dto.type !== 'TRANSFER') {
        await tx.account.update({
          where: { id: dto.accountId },
          data: { balance: { increment: balanceDelta } },
        })
      } else {
        // For transfers, debit source and credit destination
        await tx.account.update({
          where: { id: dto.accountId },
          data: { balance: { decrement: dto.amount } },
        })
        await tx.account.update({
          where: { id: dto.toAccountId! },
          data: { balance: { increment: dto.amount } },
        })
      }

      return transaction
    })
  }

  async update(userId: string, id: string, dto: UpdateTransactionDto) {
    const existing = await this.findOne(userId, id)

    // Compute new exchange rate if amount or currency changed
    let amountInBaseCurrency = Number(existing.amountInBaseCurrency)
    let exchangeRate = Number(existing.exchangeRate)

    if (dto.amount !== undefined || dto.currency !== undefined) {
      const newAmount = dto.amount ?? Number(existing.amount)
      const newCurrency = dto.currency ?? existing.currency
      const user = await this.prisma.user.findUniqueOrThrow({
        where: { id: userId },
        select: { baseCurrency: true },
      })
      const resolved = await this.resolveExchangeRate(newCurrency, user.baseCurrency)
      exchangeRate = Number(resolved.exchangeRate)
      amountInBaseCurrency = newAmount * resolved.rate
    }

    return this.prisma.$transaction(async (tx) => {
      // Reverse old balance impact
      const oldDelta =
        existing.type === 'INCOME' ? -Number(existing.amount) : Number(existing.amount)
      if (existing.type !== 'TRANSFER') {
        await tx.account.update({
          where: { id: existing.accountId },
          data: { balance: { increment: oldDelta } },
        })
      }

      // Apply new balance impact
      const newAmount = dto.amount ?? Number(existing.amount)
      const newDelta = existing.type === 'INCOME' ? newAmount : -newAmount
      if (existing.type !== 'TRANSFER') {
        await tx.account.update({
          where: { id: existing.accountId },
          data: { balance: { increment: newDelta } },
        })
      }

      return tx.transaction.update({
        where: { id },
        data: {
          amount: dto.amount,
          currency: dto.currency,
          categoryId: dto.categoryId,
          date: dto.date ? new Date(dto.date) : undefined,
          description: dto.description,
          notes: dto.notes,
          tags: dto.tags,
          amountInBaseCurrency,
          exchangeRate,
        },
      })
    })
  }

  async remove(userId: string, id: string) {
    const existing = await this.findOne(userId, id)

    return this.prisma.$transaction(async (tx) => {
      // Reverse balance impact
      if (existing.type !== 'TRANSFER') {
        const reverseDelta =
          existing.type === 'INCOME' ? -Number(existing.amount) : Number(existing.amount)
        await tx.account.update({
          where: { id: existing.accountId },
          data: { balance: { increment: reverseDelta } },
        })
      } else {
        await tx.account.update({
          where: { id: existing.accountId },
          data: { balance: { increment: Number(existing.amount) } },
        })
        if (existing.toAccountId) {
          await tx.account.update({
            where: { id: existing.toAccountId },
            data: { balance: { decrement: Number(existing.amount) } },
          })
        }
      }

      await tx.transaction.delete({ where: { id } })
    })
  }

  private async resolveExchangeRate(
    fromCurrency: string,
    toCurrency: string,
  ): Promise<{ rate: number; exchangeRate: Prisma.Decimal }> {
    if (fromCurrency === toCurrency) {
      return { rate: 1, exchangeRate: new Prisma.Decimal(1) }
    }

    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)

    // Try today, then up to 3 days back
    for (let i = 0; i <= 3; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)

      const er = await this.prisma.exchangeRate.findUnique({
        where: { fromCurrency_toCurrency_date: { fromCurrency, toCurrency, date } },
      })
      if (er) {
        return { rate: Number(er.rate), exchangeRate: er.rate }
      }
    }

    throw new UnprocessableEntityException(
      `Exchange rate unavailable for ${fromCurrency}→${toCurrency}. Please try again later.`,
    )
  }
}
