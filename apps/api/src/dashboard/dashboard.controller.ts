import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { DashboardService } from './dashboard.service'

@ApiTags('dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Total balance, monthly income/expenses, account breakdown' })
  getSummary(@Req() req: { user: { id: string } }) {
    return this.dashboardService.getSummary(req.user.id)
  }

  @Get('chart/monthly')
  @ApiOperation({ summary: '12-month income vs expenses bar chart data' })
  getMonthlyChart(@Req() req: { user: { id: string } }) {
    return this.dashboardService.getMonthlyChart(req.user.id)
  }

  @Get('chart/by-category')
  @ApiOperation({ summary: 'Category breakdown donut chart for current month' })
  @ApiQuery({ name: 'type', enum: ['INCOME', 'EXPENSE'], required: false })
  getCategoryChart(
    @Req() req: { user: { id: string } },
    @Query('type') type?: 'INCOME' | 'EXPENSE',
  ) {
    return this.dashboardService.getCategoryChart(req.user.id, type ?? 'EXPENSE')
  }

  @Get('top-expenses')
  @ApiOperation({ summary: 'Top 5 expense categories for the current month' })
  getTopExpenses(@Req() req: { user: { id: string } }) {
    return this.dashboardService.getTopExpenses(req.user.id)
  }

  @Get('reports')
  @ApiOperation({ summary: 'Monthly report: summary, daily spending, category breakdown, prev month delta' })
  @ApiQuery({ name: 'year', required: false, type: Number })
  @ApiQuery({ name: 'month', required: false, type: Number })
  getMonthlyReport(
    @Req() req: { user: { id: string } },
    @Query('year') year?: string,
    @Query('month') month?: string,
  ) {
    const now = new Date()
    const y = year ? parseInt(year, 10) : now.getUTCFullYear()
    const m = month ? parseInt(month, 10) : now.getUTCMonth() + 1
    return this.dashboardService.getMonthlyReport(req.user.id, y, m)
  }
}
