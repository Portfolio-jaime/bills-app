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
import { BudgetsService } from './budgets.service'
import { CreateBudgetDto, UpdateBudgetDto } from './dto/budget.dto'

@ApiTags('budgets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('budgets')
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Get()
  @ApiOperation({ summary: 'List all active budgets' })
  findAll(@Req() req: { user: { id: string } }) {
    return this.budgetsService.findAll(req.user.id)
  }

  @Get('status')
  @ApiOperation({ summary: 'Get current period budget status (spent vs limit)' })
  getStatus(@Req() req: { user: { id: string } }) {
    return this.budgetsService.getStatus(req.user.id)
  }

  @Post()
  @ApiOperation({ summary: 'Create a new budget' })
  create(@Req() req: { user: { id: string } }, @Body() dto: CreateBudgetDto) {
    return this.budgetsService.create(req.user.id, dto)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a budget' })
  update(
    @Req() req: { user: { id: string } },
    @Param('id') id: string,
    @Body() dto: UpdateBudgetDto,
  ) {
    return this.budgetsService.update(req.user.id, id, dto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deactivate a budget' })
  remove(@Req() req: { user: { id: string } }, @Param('id') id: string) {
    return this.budgetsService.remove(req.user.id, id)
  }
}
