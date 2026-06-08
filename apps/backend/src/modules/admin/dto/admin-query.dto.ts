import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { UserRole, UserStatus } from '@prisma/client';
import { PaginationDto } from '../../../common/dto/pagination.dto';

function toOptionalBoolean(value: unknown): boolean | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  if (value === true || value === 'true' || value === '1' || value === 1) return true;
  if (value === false || value === 'false' || value === '0' || value === 0) return false;
  return value as boolean;
}

export class SearchPaginationDto extends PaginationDto {
  @IsOptional()
  @IsString()
  readonly search?: string;
}

export class ActivePaginationDto extends PaginationDto {
  @IsOptional()
  @Transform(({ value }) => toOptionalBoolean(value))
  @IsBoolean()
  readonly isActive?: boolean;
}

export class UserGroupQueryDto extends SearchPaginationDto {
  @IsOptional()
  @Transform(({ value }) => toOptionalBoolean(value))
  @IsBoolean()
  readonly isActive?: boolean;
}

export class AdminApiKeyQueryDto extends SearchPaginationDto {
  @IsOptional()
  @Transform(({ value }) => toOptionalBoolean(value))
  @IsBoolean()
  readonly isActive?: boolean;

  @IsOptional()
  @IsString()
  readonly userId?: string;
}

export class AdminOrderQueryDto extends SearchPaginationDto {
  @IsOptional()
  @IsString()
  readonly status?: string;

  @IsOptional()
  @IsString()
  readonly userId?: string;
}

export class AdminBillQueryDto extends SearchPaginationDto {
  @IsOptional()
  @IsString()
  readonly type?: string;

  @IsOptional()
  @IsString()
  readonly userId?: string;
}

export class AdminChannelQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  readonly providerId?: string;
}

export class AdminUserQueryDto extends SearchPaginationDto {
  @IsOptional()
  @IsEnum(UserRole)
  readonly role?: UserRole;

  @IsOptional()
  @IsEnum(UserStatus)
  readonly status?: UserStatus;
}

export class AdminInvoiceQueryDto extends SearchPaginationDto {
  @IsOptional()
  @IsString()
  readonly status?: string;
}
