import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { TransactionsService } from './transactions.service'
import {
  CreateTransactionDto,
  UpdateTransactionDto,
  TransactionQueryDto,
} from './dto/transaction.dto'

@ApiTags('transactions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  @ApiOperation({ summary: 'List transactions with filtering and pagination' })
  findAll(@Req() req: { user: { id: string } }, @Query() query: TransactionQueryDto) {
    return this.transactionsService.findAll(req.user.id, query)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single transaction' })
  findOne(@Req() req: { user: { id: string } }, @Param('id') id: string) {
    return this.transactionsService.findOne(req.user.id, id)
  }

  @Post()
  @ApiOperation({ summary: 'Create a new transaction' })
  create(@Req() req: { user: { id: string } }, @Body() dto: CreateTransactionDto) {
    return this.transactionsService.create(req.user.id, dto)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a transaction' })
  update(
    @Req() req: { user: { id: string } },
    @Param('id') id: string,
    @Body() dto: UpdateTransactionDto,
  ) {
    return this.transactionsService.update(req.user.id, id, dto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a transaction (hard delete)' })
  remove(@Req() req: { user: { id: string } }, @Param('id') id: string) {
    return this.transactionsService.remove(req.user.id, id)
  }
}
