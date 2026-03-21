import {
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsISO8601,
  IsBoolean,
  IsArray,
  MaxLength,
  ArrayMaxSize,
  Min,
  Max,
  IsInt,
} from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { TransactionType } from '@prisma/client'

export class CreateTransactionDto {
  @ApiProperty({ enum: TransactionType })
  @IsEnum(TransactionType)
  type: TransactionType

  @ApiProperty({ example: 150000 })
  @IsNumber()
  @IsPositive()
  amount: number

  @ApiProperty({ example: 'COP' })
  @IsString()
  currency: string

  @ApiProperty()
  @IsString()
  accountId: string

  @ApiPropertyOptional({ description: 'Required when type=TRANSFER' })
  @IsString()
  @IsOptional()
  toAccountId?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  categoryId?: string

  @ApiProperty({ example: '2026-03-16T00:00:00.000Z' })
  @IsISO8601()
  date: string

  @ApiProperty()
  @IsString()
  @MaxLength(255)
  description: string

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(1000)
  @IsOptional()
  notes?: string

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(10)
  @IsOptional()
  tags?: string[]

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  isRecurring?: boolean

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(100)
  @IsOptional()
  recurringRule?: string
}

export class UpdateTransactionDto {
  @ApiPropertyOptional()
  @IsNumber()
  @IsPositive()
  @IsOptional()
  amount?: number

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  currency?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  categoryId?: string

  @ApiPropertyOptional()
  @IsISO8601()
  @IsOptional()
  date?: string

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(255)
  @IsOptional()
  description?: string

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(1000)
  @IsOptional()
  notes?: string

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(10)
  @IsOptional()
  tags?: string[]
}

export class TransactionQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1

  @ApiPropertyOptional({ default: 20 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 20

  @ApiPropertyOptional()
  @IsISO8601()
  @IsOptional()
  from?: string

  @ApiPropertyOptional()
  @IsISO8601()
  @IsOptional()
  to?: string

  @ApiPropertyOptional({ enum: TransactionType })
  @IsEnum(TransactionType)
  @IsOptional()
  type?: TransactionType

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  categoryId?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  accountId?: string

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(100)
  @IsOptional()
  search?: string
}
