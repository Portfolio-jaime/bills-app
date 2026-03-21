import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto'

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.category.findMany({
      where: { userId, parentId: null }, // top-level only
      include: { children: true },
      orderBy: { name: 'asc' },
    })
  }

  async create(userId: string, dto: CreateCategoryDto) {
    return this.prisma.category.create({
      data: { userId, ...dto },
    })
  }

  async update(userId: string, id: string, dto: UpdateCategoryDto) {
    await this.assertOwnership(userId, id)
    return this.prisma.category.update({ where: { id }, data: dto })
  }

  async remove(userId: string, id: string) {
    await this.assertOwnership(userId, id)
    await this.prisma.category.delete({ where: { id } })
  }

  private async assertOwnership(userId: string, id: string) {
    const cat = await this.prisma.category.findUnique({ where: { id } })
    if (!cat) throw new NotFoundException('Category not found')
    if (cat.userId !== userId) throw new ForbiddenException()
    return cat
  }
}
