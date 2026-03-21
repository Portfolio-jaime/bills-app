import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { UpdateProfileDto } from './dto/update-profile.dto'

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
    createdAt: true,
  }

  async getProfile(userId: string) {
    return this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: this.profileSelect,
    })
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: dto,
      select: this.profileSelect,
    })
  }
}
