import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import * as bcrypt from 'bcryptjs'
import { PrismaService } from '../prisma/prisma.service'
import { RegisterDto, LoginDto } from './dto/auth.dto'

const BCRYPT_ROUNDS = 12
const ACCESS_TOKEN_TTL = '15m'
const REFRESH_TOKEN_TTL_DAYS = 7

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } })
    if (existing) throw new ConflictException('Email already registered')

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS)
    const user = await this.prisma.user.create({
      data: { email: dto.email, passwordHash, name: dto.name },
      select: { id: true, email: true, name: true, baseCurrency: true, createdAt: true },
    })

    // Seed default categories for the new user
    await this.seedDefaultCategories(user.id)

    const tokens = await this.generateTokens(user.id, user.email)
    return { user, ...tokens }
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } })
    if (!user) throw new UnauthorizedException('Invalid credentials')

    const valid = await bcrypt.compare(dto.password, user.passwordHash)
    if (!valid) throw new UnauthorizedException('Invalid credentials')

    const tokens = await this.generateTokens(user.id, user.email)
    const { passwordHash: _, ...safeUser } = user
    return { user: safeUser, ...tokens }
  }

  async refresh(rawRefreshToken: string) {
    const tokenHash = await bcrypt.hash(rawRefreshToken, 8)
    const stored = await this.prisma.refreshToken.findFirst({
      where: {
        tokenHash: { not: undefined },
        isRevoked: false,
        expiresAt: { gt: new Date() },
      },
    })

    // We need to compare the hash directly — find by scanning (small table in practice)
    const allTokens = await this.prisma.refreshToken.findMany({
      where: { isRevoked: false, expiresAt: { gt: new Date() } },
      take: 100,
    })

    let matched = null
    for (const t of allTokens) {
      if (await bcrypt.compare(rawRefreshToken, t.tokenHash)) {
        matched = t
        break
      }
    }

    if (!matched) throw new UnauthorizedException('Invalid refresh token')

    // Revoke old token (rotation)
    await this.prisma.refreshToken.update({
      where: { id: matched.id },
      data: { isRevoked: true },
    })

    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: matched.userId },
      select: { id: true, email: true },
    })

    return this.generateTokens(user.id, user.email)
  }

  async logout(userId: string) {
    // Revoke all refresh tokens for user
    await this.prisma.refreshToken.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true },
    })
  }

  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email }
    const accessToken = await this.jwt.signAsync(payload, { expiresIn: ACCESS_TOKEN_TTL })

    const rawRefreshToken = crypto.randomUUID() + '-' + crypto.randomUUID()
    const tokenHash = await bcrypt.hash(rawRefreshToken, 8)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_TTL_DAYS)

    await this.prisma.refreshToken.create({
      data: { userId, tokenHash, expiresAt },
    })

    return { accessToken, refreshToken: rawRefreshToken, expiresIn: 900 }
  }

  private async seedDefaultCategories(userId: string) {
    const defaults = [
      // Expense categories
      { name: 'Housing', icon: '🏠', color: '#6366f1', type: 'EXPENSE' as const },
      { name: 'Food & Dining', icon: '🍔', color: '#f59e0b', type: 'EXPENSE' as const },
      { name: 'Transport', icon: '🚗', color: '#3b82f6', type: 'EXPENSE' as const },
      { name: 'Health', icon: '❤️', color: '#ef4444', type: 'EXPENSE' as const },
      { name: 'Entertainment', icon: '🎬', color: '#8b5cf6', type: 'EXPENSE' as const },
      { name: 'Shopping', icon: '🛍️', color: '#ec4899', type: 'EXPENSE' as const },
      { name: 'Education', icon: '📚', color: '#10b981', type: 'EXPENSE' as const },
      { name: 'Utilities', icon: '💡', color: '#14b8a6', type: 'EXPENSE' as const },
      { name: 'Subscriptions', icon: '📱', color: '#64748b', type: 'EXPENSE' as const },
      // Income categories
      { name: 'Salary', icon: '💼', color: '#22c55e', type: 'INCOME' as const },
      { name: 'Freelance', icon: '💻', color: '#84cc16', type: 'INCOME' as const },
      { name: 'Investments', icon: '📈', color: '#06b6d4', type: 'INCOME' as const },
      { name: 'Other Income', icon: '💰', color: '#a3e635', type: 'INCOME' as const },
      // Both
      { name: 'Transfer', icon: '↔️', color: '#94a3b8', type: 'BOTH' as const },
    ]

    await this.prisma.category.createMany({
      data: defaults.map((c) => ({ ...c, userId })),
      skipDuplicates: true,
    })
  }
}
