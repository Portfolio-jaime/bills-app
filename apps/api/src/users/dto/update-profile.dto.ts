import { IsString, IsOptional, MaxLength, IsUrl, IsIn } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { SUPPORTED_CURRENCIES } from '@bills/types'

export class UpdateProfileDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string

  @ApiPropertyOptional({ enum: SUPPORTED_CURRENCIES })
  @IsString()
  @IsOptional()
  @IsIn(SUPPORTED_CURRENCIES)
  baseCurrency?: string

  @ApiPropertyOptional()
  @IsUrl()
  @IsOptional()
  avatar?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(30)
  phone?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(500)
  bio?: string
}
