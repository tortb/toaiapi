import {
  IsString,
  IsOptional,
  IsInt,
  IsArray,
  Min,
  Max,
  MaxLength,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 创建 API Key 请求 DTO
 */
export class CreateApiKeyDto {
  @ApiPropertyOptional({ description: 'API Key 名称', example: 'My App Key' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  readonly name?: string;

  @ApiPropertyOptional({
    description: '过期时间（ISO 8601）',
    example: '2025-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  readonly expiresAt?: string;

  @ApiPropertyOptional({
    description: '速率限制（请求/分钟）',
    example: 60,
    minimum: 1,
    maximum: 10000,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10000)
  readonly rateLimit?: number;

  @ApiPropertyOptional({
    description: 'Token 限制（token/分钟）',
    example: 100000,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  readonly tokenLimit?: number;

  @ApiPropertyOptional({
    description: '允许的模型列表',
    example: ['gpt-4o', 'claude-sonnet-4'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  readonly modelLimit?: string[];

  @ApiPropertyOptional({
    description: 'IP 白名单',
    example: ['192.168.1.1', '10.0.0.0/24'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  readonly ipWhitelist?: string[];
}
