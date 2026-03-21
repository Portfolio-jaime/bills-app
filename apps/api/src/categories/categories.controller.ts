import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CategoriesService } from './categories.service'
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto'

@ApiTags('categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'List all categories (hierarchical)' })
  findAll(@Req() req: { user: { id: string } }) {
    return this.categoriesService.findAll(req.user.id)
  }

  @Post()
  @ApiOperation({ summary: 'Create a new category' })
  create(@Req() req: { user: { id: string } }, @Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(req.user.id, dto)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a category' })
  update(
    @Req() req: { user: { id: string } },
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(req.user.id, id, dto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a category' })
  remove(@Req() req: { user: { id: string } }, @Param('id') id: string) {
    return this.categoriesService.remove(req.user.id, id)
  }
}
