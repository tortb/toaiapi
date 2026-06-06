import { IsString, IsInt, IsOptional, IsEnum, IsEmail, MaxLength, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InvoiceType, InvoiceStatus } from '@prisma/client';

export class CreateInvoiceDto {
  @ApiProperty({ description: '发票类型', enum: InvoiceType })
  @IsEnum(InvoiceType)
  type!: InvoiceType;

  @ApiPropertyOptional({ description: '公司名称' })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  company_name?: string;

  @ApiPropertyOptional({ description: '税号' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  tax_id?: string;

  @ApiPropertyOptional({ description: '公司地址' })
  @IsString()
  @IsOptional()
  @MaxLength(300)
  company_address?: string;

  @ApiPropertyOptional({ description: '公司电话' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  company_phone?: string;

  @ApiPropertyOptional({ description: '开户银行' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  bank_name?: string;

  @ApiPropertyOptional({ description: '银行账号' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  bank_account?: string;

  @ApiProperty({ description: '发票金额（分）', example: 10000 })
  @IsInt()
  @Min(1)
  amount!: number;

  @ApiPropertyOptional({ description: '发票内容', default: '技术服务费' })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  content?: string;

  @ApiProperty({ description: '申请人邮箱' })
  @IsEmail()
  applicant_email!: string;

  @ApiPropertyOptional({ description: '申请人电话' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  applicant_phone?: string;

  @ApiPropertyOptional({ description: '邮寄地址' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  mailing_address?: string;
}

export class ReviewInvoiceDto {
  @ApiProperty({ description: '审核结果', enum: ['APPROVED', 'REJECTED'] })
  @IsEnum(InvoiceStatus)
  status!: InvoiceStatus;

  @ApiPropertyOptional({ description: '审核备注' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  review_remark?: string;
}

export class IssueInvoiceDto {
  @ApiPropertyOptional({ description: '发票文件 URL' })
  @IsString()
  @IsOptional()
  file_url?: string;
}
