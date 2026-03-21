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
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RecurringRulesService } from './recurring-rules.service'
import { CreateRecurringRuleDto, UpdateRecurringRuleDto } from './dto/recurring-rule.dto'

@ApiTags('Recurring Rules')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('recurring-rules')
export class RecurringRulesController {
  constructor(private readonly service: RecurringRulesService) {}

  @Get()
  @ApiOperation({ summary: 'List all recurring rules for the authenticated user' })
  findAll(@Req() req: { user: { id: string } }) {
    return this.service.findAll(req.user.id)
  }

  @Get('due')
  @ApiOperation({ summary: 'List rules that are due today or overdue' })
  getDue(@Req() req: { user: { id: string } }) {
    return this.service.getDueRules(req.user.id)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single recurring rule' })
  findOne(@Param('id') id: string, @Req() req: { user: { id: string } }) {
    return this.service.findOne(id, req.user.id)
  }

  @Post()
  @ApiOperation({ summary: 'Create a recurring rule' })
  create(@Req() req: { user: { id: string } }, @Body() dto: CreateRecurringRuleDto) {
    return this.service.create(req.user.id, dto)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a recurring rule' })
  update(
    @Param('id') id: string,
    @Req() req: { user: { id: string } },
    @Body() dto: UpdateRecurringRuleDto,
  ) {
    return this.service.update(id, req.user.id, dto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a recurring rule' })
  remove(@Param('id') id: string, @Req() req: { user: { id: string } }) {
    return this.service.remove(id, req.user.id)
  }
}
