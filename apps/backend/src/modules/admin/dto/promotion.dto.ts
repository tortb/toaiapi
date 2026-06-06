import { IsString, IsInt, IsBoolean, IsOptional, IsEnum, IsDateString, Min, Max, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BonusType } from '@prisma/client';

export class CreatePromotionDto {
  @ApiProperty({ description: '活动名称', example: '充100送10' })
  @IsString()
  @MaxLength(100)
  name!: string;

  @ApiPropertyOptional({ description: '活动描述' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ description: '最低充值金额（分）', example: 10000 })
  @IsInt()
  @Min(1)
  min_amount!: number;

  @ApiProperty({ description: '赠送类型', enum: BonusType })
  @IsEnum(BonusType)
  bonus_type!: BonusType;

  @ApiProperty({ description: '赠送值（分或百分比×100）', example: 1000 })
  @IsInt()
  @Min(1)
  bonus_value!: number;

  @ApiPropertyOptional({ description: '百分比模式上限（分）' })
  @IsInt()
  @IsOptional()
  @Min(1)
  max_bonus?: number;

  @ApiProperty({ description: '生效时间' })
  @IsDateString()
  start_at!: string;

  @ApiPropertyOptional({ description: '结束时间' })
  @IsDateString()
  @IsOptional()
  end_at?: string;

  @ApiPropertyOptional({ description: '是否启用', default: true })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}

export class UpdatePromotionDto {
  @ApiPropertyOptional({ description: '活动名称' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ description: '活动描述' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ description: '最低充值金额（分）' })
  @IsInt()
  @IsOptional()
  @Min(1)
  min_amount?: number;

  @ApiPropertyOptional({ description: '赠送类型', enum: BonusType })
  @IsEnum(BonusType)
  @IsOptional()
  bonus_type?: BonusType;

  @ApiPropertyOptional({ description: '赠送值（分或百分比×100）' })
  @IsInt()
  @IsOptional()
  @Min(1)
  bonus_value?: number;

  @ApiPropertyOptional({ description: '百分比模式上限（分）' })
  @IsInt()
  @IsOptional()
  @Min(1)
  max_bonus?: number;

  @ApiPropertyOptional({ description: '生效时间' })
  @IsDateString()
  @IsOptional()
  start_at?: string;

  @ApiPropertyOptional({ description: '结束时间' })
  @IsDateString()
  @IsOptional()
  end_at?: string;

  @ApiPropertyOptional({ description: '是否启用' })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
