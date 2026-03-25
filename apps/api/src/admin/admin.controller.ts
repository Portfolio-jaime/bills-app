import {
  Controller,
  Get,
  Delete,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { AdminService } from './admin.service'

@Controller('admin')
@UseGuards(AuthGuard('jwt'))
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('stats')
  getStats() {
    return this.admin.getStats()
  }

  @Get('users')
  getUsers(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('search') search?: string,
  ) {
    return this.admin.getUsers(page, limit, search)
  }

  @Get('users/:id')
  getUser(@Param('id') id: string) {
    return this.admin.getUser(id)
  }

  @Delete('users/:id')
  deleteUser(@Param('id') id: string) {
    return this.admin.deleteUser(id)
  }

  @Get('transactions')
  getTransactions(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(25), ParseIntPipe) limit: number,
  ) {
    return this.admin.getTransactions(page, limit)
  }

  @Get('db/:table')
  getTableData(
    @Param('table') table: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.admin.getTableData(table, page, limit)
  }
}
