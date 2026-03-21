import {
  IsString,
  IsOptional,
  IsNumber,
  IsPositive,
  IsEnum,
  IsBoolean,
  IsDateString,
  MaxLength,
  IsNotEmpty,
} from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { TransactionType } from '@prisma/client'
import { Frequency } from '@prisma/client'

export class CreateRecurringRuleDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  amount: number

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  currency: string

  @ApiProperty({ enum: TransactionType })
  @IsEnum(TransactionType)
  type: TransactionType

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  categoryId?: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  accountId: string

  @ApiProperty({ enum: Frequency })
  @IsEnum(Frequency)
  frequency: Frequency

  @ApiProperty({ example: '2026-01-01' })
  @IsDateString()
  startDate: string

  @ApiPropertyOptional({ example: '2027-01-01' })
  @IsDateString()
  @IsOptional()
  endDate?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(500)
  notes?: string

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  autoCreate?: boolean
}

export class UpdateRecurringRuleDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string

  @ApiPropertyOptional()
  @IsNumber()
  @IsPositive()
  @IsOptional()
  amount?: number

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  currency?: string

  @ApiPropertyOptional({ enum: Frequency })
  @IsEnum(Frequency)
  @IsOptional()
  frequency?: Frequency

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  endDate?: string

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  autoCreate?: boolean

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string
}
