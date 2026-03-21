import { IsString, IsEnum, IsOptional, MaxLength, Matches } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { CategoryType } from '@prisma/client'

export class CreateCategoryDto {
  @ApiProperty()
  @IsString()
  @MaxLength(100)
  name: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(50)
  icon?: string

  @ApiPropertyOptional({ example: '#6366f1' })
  @IsString()
  @IsOptional()
  @Matches(/^#[0-9A-Fa-f]{6}$/)
  color?: string

  @ApiProperty({ enum: CategoryType })
  @IsEnum(CategoryType)
  type: CategoryType

  @ApiPropertyOptional({ description: 'Parent category ID for sub-categories' })
  @IsString()
  @IsOptional()
  parentId?: string
}

export class UpdateCategoryDto {
  @ApiPropertyOptional()
  @IsString()
  @MaxLength(100)
  @IsOptional()
  name?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(50)
  icon?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @Matches(/^#[0-9A-Fa-f]{6}$/)
  color?: string
}
