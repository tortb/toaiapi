import { IsString, IsInt, IsEnum, IsOptional, Min, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 支付方式枚举
 */
export enum PaymentMethodDto {
  EPAY_ALIPAY = 'EPAY_ALIPAY',
  EPAY_WECHAT = 'EPAY_WECHAT',
  EPAY_QQ = 'EPAY_QQ',
  ALIPAY = 'ALIPAY',
  WECHAT_PAY = 'WECHAT_PAY',
}

/**
 * 创建订单 DTO
 */
export class CreateOrderDto {
  @ApiProperty({ description: '充值金额（分）', example: 1000 })
  @IsInt()
  @Min(100, { message: '充值金额最少1元' })
  amount!: number;

  @ApiProperty({
    description: '支付方式',
    enum: PaymentMethodDto,
    example: PaymentMethodDto.EPAY_ALIPAY,
  })
  @IsEnum(PaymentMethodDto, { message: '无效的支付方式' })
  paymentMethod!: PaymentMethodDto;

  @ApiProperty({ description: '商品名称', example: 'ToAIAPI 余额充值', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  productName?: string;
}

/**
 * 订单响应 DTO
 */
export class OrderResponseDto {
  @ApiProperty({ description: '订单号' })
  orderNo!: string;

  @ApiProperty({ description: '金额（分）' })
  amount!: number;

  @ApiProperty({ description: '支付方式' })
  paymentMethod!: string;

  @ApiProperty({ description: '订单状态' })
  status!: string;

  @ApiProperty({ description: '支付链接或表单HTML' })
  payUrl!: string;

  @ApiProperty({ description: '创建时间' })
  createdAt!: Date;
}

/**
 * 订单详情响应 DTO
 */
export class OrderDetailDto {
  @ApiProperty({ description: '订单ID' })
  id!: string;

  @ApiProperty({ description: '订单号' })
  orderNo!: string;

  @ApiProperty({ description: '金额（分）' })
  amount!: number;

  @ApiProperty({ description: '实付金额（分）' })
  paidAmount!: number | null;

  @ApiProperty({ description: '支付方式' })
  paymentMethod!: string | null;

  @ApiProperty({ description: '订单状态' })
  status!: string;

  @ApiProperty({ description: '商品类型' })
  productType!: string;

  @ApiProperty({ description: '商品名称' })
  productName!: string;

  @ApiProperty({ description: '支付时间' })
  paidAt!: Date | null;

  @ApiProperty({ description: '创建时间' })
  createdAt!: Date;
}
