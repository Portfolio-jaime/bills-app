import {
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  Min,
  MaxLength,
  Matches,
} from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { AccountType } from '@prisma/client'
import { SUPPORTED_CURRENCIES } from '@bills/types'

export class CreateAccountDto {
  @ApiProperty()
  @IsString()
  @MaxLength(100)
  name: string

  @ApiProperty({ enum: AccountType })
  @IsEnum(AccountType)
  type: AccountType

  @ApiProperty({ example: 'COP' })
  @IsString()
  currency: string

  @ApiPropertyOptional({ default: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  balance?: number

  @ApiPropertyOptional({ example: '#6366f1' })
  @IsString()
  @IsOptional()
  @Matches(/^#[0-9A-Fa-f]{6}$/)
  color?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(50)
  icon?: string
}

export class UpdateAccountDto {
  @ApiPropertyOptional()
  @IsString()
  @MaxLength(100)
  @IsOptional()
  name?: string

  @ApiPropertyOptional({ enum: AccountType })
  @IsEnum(AccountType)
  @IsOptional()
  type?: AccountType

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @Matches(/^#[0-9A-Fa-f]{6}$/)
  color?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(50)
  icon?: string
}
