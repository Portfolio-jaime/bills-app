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
import { AccountsService } from './accounts.service'
import { CreateAccountDto, UpdateAccountDto } from './dto/account.dto'

@ApiTags('accounts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  @ApiOperation({ summary: 'List all accounts for current user' })
  findAll(@Req() req: { user: { id: string } }) {
    return this.accountsService.findAll(req.user.id)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific account' })
  findOne(@Req() req: { user: { id: string } }, @Param('id') id: string) {
    return this.accountsService.findOne(req.user.id, id)
  }

  @Post()
  @ApiOperation({ summary: 'Create a new account' })
  create(@Req() req: { user: { id: string } }, @Body() dto: CreateAccountDto) {
    return this.accountsService.create(req.user.id, dto)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an account' })
  update(
    @Req() req: { user: { id: string } },
    @Param('id') id: string,
    @Body() dto: UpdateAccountDto,
  ) {
    return this.accountsService.update(req.user.id, id, dto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Archive an account (soft delete)' })
  archive(@Req() req: { user: { id: string } }, @Param('id') id: string) {
    return this.accountsService.archive(req.user.id, id)
  }
}
