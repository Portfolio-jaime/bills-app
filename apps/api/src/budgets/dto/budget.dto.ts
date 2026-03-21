import {
  IsString,
  IsEnum,
  IsNumber,
  IsPositive,
  IsOptional,
  IsISO8601,
  IsInt,
  Min,
  Max,
} from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { BudgetPeriod } from '@prisma/client'

export class CreateBudgetDto {
  @ApiProperty()
  @IsString()
  categoryId: string

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  amount: number

  @ApiProperty({ enum: BudgetPeriod })
  @IsEnum(BudgetPeriod)
  period: BudgetPeriod

  @ApiProperty({ description: 'Start date of the budget period (ISO 8601)' })
  @IsISO8601()
  startDate: string

  @ApiPropertyOptional({ default: 80, description: 'Alert threshold percentage' })
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  alertAt?: number
}

export class UpdateBudgetDto {
  @ApiPropertyOptional()
  @IsNumber()
  @IsPositive()
  @IsOptional()
  amount?: number

  @ApiPropertyOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  alertAt?: number

  @ApiPropertyOptional()
  @IsOptional()
  isActive?: boolean
}
