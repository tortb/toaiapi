import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 订单响应 DTO
 */
export class OrderAdminResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  orderNo!: string;

  @ApiProperty()
  userId!: string;

  @ApiProperty()
  userEmail!: string;

  @ApiProperty()
  userName!: string | null;

  @ApiProperty()
  amount!: number;

  @ApiProperty()
  paidAmount!: number | null;

  @ApiProperty()
  paymentMethod!: string | null;

  @ApiProperty()
  status!: string;

  @ApiProperty()
  productType!: string;

  @ApiProperty()
  productName!: string;

  @ApiProperty()
  paidAt!: string | null;

  @ApiProperty()
  remark!: string | null;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}
