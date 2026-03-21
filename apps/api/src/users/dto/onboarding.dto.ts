import {
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  IsIn,
  Min,
  Max,
  MaxLength,
  ArrayMaxSize,
} from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { SUPPORTED_CURRENCIES } from '@bills/types'

export const INCOME_SOURCES = [
  'salary',
  'freelance',
  'business',
  'investment',
  'rental',
  'pension',
  'scholarship',
  'remittance',
  'online_sales',
  'bonus',
  'crypto',
  'other',
] as const

export const FINANCIAL_GOALS = [
  'emergency_fund',
  'pay_debt',
  'invest',
  'save_travel',
  'buy_home',
  'buy_car',
  'retirement',
  'education',
  'start_business',
  'track_only',
] as const

export class OnboardingAccountDto {
  @ApiProperty()
  @IsString()
  @MaxLength(100)
  name: string

  @ApiProperty()
  @IsString()
  type: string

  @ApiProperty()
  @IsString()
  currency: string

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  balance?: number
}

export class CompleteOnboardingDto {
  @ApiProperty()
  @IsString()
  @MaxLength(100)
  name: string

  @ApiProperty({ example: 'USD', enum: SUPPORTED_CURRENCIES })
  @IsString()
  @IsIn(SUPPORTED_CURRENCIES)
  baseCurrency: string

  @ApiProperty({ description: 'Monthly income amount' })
  @IsNumber()
  @Min(0)
  monthlyIncome: number

  @ApiProperty({ enum: INCOME_SOURCES })
  @IsString()
  @IsIn(INCOME_SOURCES)
  incomeSource: string

  @ApiProperty()
  @IsNumber()
  @Min(0)
  housingCost: number

  @ApiProperty()
  @IsNumber()
  @Min(0)
  foodBudget: number

  @ApiProperty()
  @IsNumber()
  @Min(0)
  transportBudget: number

  @ApiProperty()
  @IsNumber()
  @Min(0)
  healthBudget: number

  @ApiProperty()
  @IsNumber()
  @Min(0)
  entertainmentBudget: number

  @ApiProperty()
  @IsNumber()
  @Min(0)
  utilitiesBudget: number

  @ApiProperty()
  @IsNumber()
  @Min(0)
  subscriptionsBudget: number

  @ApiProperty()
  @IsNumber()
  @Min(0)
  otherExpenses: number

  @ApiProperty({ type: [String], enum: FINANCIAL_GOALS, isArray: true })
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(7)
  goals: string[]

  @ApiProperty({ type: [OnboardingAccountDto] })
  @IsArray()
  @ArrayMaxSize(10)
  accounts: OnboardingAccountDto[]

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(500)
  notes?: string
}
