import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

function IsStringArrayOrJsonString(validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'isStringArrayOrJsonString',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          if (value === undefined || value === null || value === '') return true;
          if (Array.isArray(value)) return value.every((item) => typeof item === 'string');
          if (typeof value !== 'string') return false;

          try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) && parsed.every((item) => typeof item === 'string');
          } catch {
            return false;
          }
        },
        defaultMessage(args: ValidationArguments) {
          return args.property + ' must be a string array or a JSON string array';
        },
      },
    });
  };
}

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
    description: '批量创建数量',
    example: 1,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  readonly count?: number;

  @ApiPropertyOptional({
    description: '过期时间（ISO 8601）',
    example: '2025-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  readonly expiresAt?: string | null;

  @ApiPropertyOptional({
    description: '过期时间（snake_case，兼容旧前端）',
    example: '2025-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  readonly expires_at?: string | null;

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
  readonly rateLimit?: number | null;

  @ApiPropertyOptional({
    description: '速率限制（snake_case，兼容旧前端）',
    example: 60,
    minimum: 0,
    maximum: 10000,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10000)
  readonly rate_limit?: number | null;

  @ApiPropertyOptional({
    description: 'RPM 限制',
    example: 60,
    minimum: 0,
    maximum: 10000,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10000)
  readonly rpmLimit?: number | null;

  @ApiPropertyOptional({
    description: 'RPM 限制（snake_case，兼容旧前端）',
    example: 60,
    minimum: 0,
    maximum: 10000,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10000)
  readonly rpm_limit?: number | null;

  @ApiPropertyOptional({
    description: 'Token 限制（token/分钟）',
    example: 100000,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  readonly tokenLimit?: number | null;

  @ApiPropertyOptional({
    description: 'Token 限制（snake_case，兼容旧前端）',
    example: 100000,
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  readonly token_limit?: number | null;

  @ApiPropertyOptional({
    description: 'TPM 限制',
    example: 100000,
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  readonly tpmLimit?: number | null;

  @ApiPropertyOptional({
    description: 'TPM 限制（snake_case，兼容旧前端）',
    example: 100000,
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  readonly tpm_limit?: number | null;

  @ApiPropertyOptional({
    description: '无限配额开关',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  readonly unlimitedQuota?: boolean;

  @ApiPropertyOptional({
    description: '无限配额开关（snake_case，兼容旧前端）',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  readonly unlimited_quota?: boolean;

  @ApiPropertyOptional({
    description: '用户分组 ID 或名称',
    example: 'default',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  readonly groupId?: string | null;

  @ApiPropertyOptional({
    description: '用户分组 ID 或名称（snake_case，兼容旧前端）',
    example: 'default',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  readonly group_id?: string | null;

  @ApiPropertyOptional({
    description: '允许的模型列表',
    example: ['gpt-4o', 'claude-sonnet-4'],
    type: [String],
  })
  @IsOptional()
  @IsStringArrayOrJsonString()
  readonly modelLimit?: string[] | string;

  @ApiPropertyOptional({
    description: '允许的模型列表（snake_case，兼容旧前端）',
    example: '["gpt-4o", "claude-sonnet-4"]',
  })
  @IsOptional()
  @IsStringArrayOrJsonString()
  readonly model_limit?: string[] | string;

  @ApiPropertyOptional({
    description: 'IP 白名单',
    example: ['192.168.1.1', '10.0.0.0/24'],
    type: [String],
  })
  @IsOptional()
  @IsStringArrayOrJsonString()
  readonly ipWhitelist?: string[] | string;

  @ApiPropertyOptional({
    description: 'IP 白名单（snake_case，兼容旧前端）',
    example: '["192.168.1.1", "10.0.0.0/24"]',
  })
  @IsOptional()
  @IsStringArrayOrJsonString()
  readonly ip_whitelist?: string[] | string;
}

/**
 * 更新 API Key 请求 DTO
 */
export class UpdateApiKeyDto extends CreateApiKeyDto {}
