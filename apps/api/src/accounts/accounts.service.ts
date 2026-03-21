import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateAccountDto, UpdateAccountDto } from './dto/account.dto'

@Injectable()
export class AccountsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.account.findMany({
      where: { userId, isArchived: false },
      orderBy: { createdAt: 'asc' },
    })
  }

  async findOne(userId: string, id: string) {
    const account = await this.prisma.account.findUnique({ where: { id } })
    if (!account) throw new NotFoundException('Account not found')
    if (account.userId !== userId) throw new ForbiddenException()
    return account
  }

  async create(userId: string, dto: CreateAccountDto) {
    return this.prisma.account.create({
      data: {
        userId,
        name: dto.name,
        type: dto.type,
        currency: dto.currency,
        balance: dto.balance ?? 0,
        color: dto.color,
        icon: dto.icon,
      },
    })
  }

  async update(userId: string, id: string, dto: UpdateAccountDto) {
    await this.findOne(userId, id)
    return this.prisma.account.update({ where: { id }, data: dto })
  }

  async archive(userId: string, id: string) {
    await this.findOne(userId, id)
    return this.prisma.account.update({ where: { id }, data: { isArchived: true } })
  }
}
