import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EPayService } from './epay.service';
import { AlipayService } from './alipay.service';
import { WechatPayService } from './wechatpay.service';
import { PaymentConfigService } from '../../common/services/payment-config.service';
import { CreateOrderDto, PaymentMethodDto } from './dto/create-order.dto';
import { nanoid } from 'nanoid';
import { OrderStatus, PaymentMethod, Prisma } from '@prisma/client';

/**
 * 统一支付服务
 *
 * 整合易支付、支付宝、微信支付，提供统一的订单创建和支付处理接口。
 *
 * SECURITY:
 * - 订单号唯一约束防止重复
 * - 状态只能通过回调修改
 * - 金额校验必须与订单一致
 */
@Injectable()
export class PaymentService implements OnModuleInit {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly epayService: EPayService,
    private readonly alipayService: AlipayService,
    private readonly wechatPayService: WechatPayService,
    private readonly paymentConfigService: PaymentConfigService,
  ) {}

  onModuleInit() {
    // 每 5 分钟清理超时订单（30 分钟未支付）
    setInterval(() => {
      this.cancelStaleOrders(30).catch((err) => {
        this.logger.error(`Stale order cleanup failed: ${err}`);
      });
    }, 5 * 60 * 1000);
  }

  /**
   * 生成订单号
   *
   * 格式: TOAI + 时间戳(36进制) + 随机ID(8位)
   */
  private generateOrderNo(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = nanoid(8).toUpperCase();
    return `TOAI${timestamp}${random}`;
  }

  /**
   * 创建订单
   *
   * @param userId - 用户ID
   * @param dto - 创建订单参数
   * @returns 订单信息和支付链接
   */
  async createOrder(
    userId: string,
    dto: CreateOrderDto,
  ): Promise<{
    orderNo: string;
    amount: number;
    paymentMethod: string;
    status: string;
    payUrl: string;
    createdAt: Date;
  }> {
    // 生成订单号
    const orderNo = this.generateOrderNo();

    // 映射支付方式
    const paymentMethod = this.mapPaymentMethod(dto.paymentMethod);

    // 创建订单
    const order = await this.prisma.order.create({
      data: {
        order_no: orderNo,
        user_id: userId,
        amount: dto.amount,
        payment_method: paymentMethod,
        status: 'PENDING',
        product_type: 'recharge',
        product_name: dto.productName || 'ToAIAPI 余额充值',
      },
    });

    this.logger.log(`Order created: ${orderNo} for user: ${userId}`);

    // 生成支付链接
    let payUrl = '';
    try {
      payUrl = await this.generatePayUrl(dto.paymentMethod, order);
    } catch (error) {
      this.logger.error(`Failed to generate pay URL: ${error}`);
      // 支付链接生成失败不影响订单创建
    }

    return {
      orderNo: order.order_no,
      amount: order.amount,
      paymentMethod: order.payment_method || '',
      status: order.status,
      payUrl,
      createdAt: order.created_at,
    };
  }

  /**
   * 生成支付链接
   */
  private async generatePayUrl(
    method: PaymentMethodDto,
    order: {
      order_no: string;
      amount: number;
      product_name: string;
    },
  ): Promise<string> {
    switch (method) {
      case PaymentMethodDto.EPAY_ALIPAY:
        return this.epayService.createPayUrl({
          outTradeNo: order.order_no,
          type: 'alipay',
          name: order.product_name,
          money: this.epayService.fenToYuan(order.amount),
        });

      case PaymentMethodDto.EPAY_WECHAT:
        return this.epayService.createPayUrl({
          outTradeNo: order.order_no,
          type: 'wxpay',
          name: order.product_name,
          money: this.epayService.fenToYuan(order.amount),
        });

      case PaymentMethodDto.EPAY_QQ:
        return this.epayService.createPayUrl({
          outTradeNo: order.order_no,
          type: 'qqpay',
          name: order.product_name,
          money: this.epayService.fenToYuan(order.amount),
        });

      case PaymentMethodDto.ALIPAY:
        return this.alipayService.createPagePayForm({
          outTradeNo: order.order_no,
          totalAmount: this.alipayService.fenToYuan(order.amount),
          subject: order.product_name,
        });

      case PaymentMethodDto.WECHAT_PAY:
        const result = await this.wechatPayService.createNativePay({
          outTradeNo: order.order_no,
          total: order.amount,
          description: order.product_name,
        });
        return result.codeUrl;

      default:
        throw new BadRequestException('不支持的支付方式');
    }
  }

  /**
   * 映射支付方式
   */
  private mapPaymentMethod(method: PaymentMethodDto): PaymentMethod {
    const mapping: Record<PaymentMethodDto, PaymentMethod> = {
      [PaymentMethodDto.EPAY_ALIPAY]: 'EPAY_ALIPAY',
      [PaymentMethodDto.EPAY_WECHAT]: 'EPAY_WECHAT',
      [PaymentMethodDto.EPAY_QQ]: 'EPAY_QQ',
      [PaymentMethodDto.ALIPAY]: 'ALIPAY',
      [PaymentMethodDto.WECHAT_PAY]: 'WECHAT_PAY',
    };
    return mapping[method];
  }

  /**
   * 查询订单
   *
   * @param orderNo - 订单号
   * @param userId - 用户ID（用于权限验证）
   * @returns 订单详情
   */
  async getOrder(orderNo: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { order_no: orderNo },
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    // 验证订单归属
    if (order.user_id !== userId) {
      throw new NotFoundException('订单不存在');
    }

    return order;
  }

  /**
   * 获取用户订单列表
   *
   * @param userId - 用户ID
   * @param page - 页码
   * @param pageSize - 每页数量
   * @returns 订单列表
   */
  async getUserOrders(userId: string, page: number = 1, pageSize: number = 20) {
    const skip = (page - 1) * pageSize;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { user_id: userId },
        orderBy: { created_at: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.order.count({ where: { user_id: userId } }),
    ]);

    return {
      data: orders,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * 取消订单
   *
   * @param orderNo - 订单号
   * @param userId - 用户ID
   */
  async cancelOrder(orderNo: string, userId: string) {
    const order = await this.getOrder(orderNo, userId);

    if (order.status !== 'PENDING') {
      throw new BadRequestException('只能取消待支付的订单');
    }

    await this.prisma.order.update({
      where: { id: order.id },
      data: { status: 'CANCELLED' },
    });

    this.logger.log(`Order cancelled: ${orderNo}`);
  }

  /**
   * 取消超时订单
   *
   * 将超过指定时间仍为 PENDING 状态的订单自动取消。
   * 建议通过定时任务调用（如每 5 分钟执行一次）。
   *
   * @param timeoutMinutes - 超时时间（分钟），默认 30
   * @returns 取消的订单数量
   */
  async cancelStaleOrders(timeoutMinutes: number = 30): Promise<number> {
    const cutoff = new Date(Date.now() - timeoutMinutes * 60 * 1000);

    const result = await this.prisma.order.updateMany({
      where: {
        status: 'PENDING',
        created_at: { lt: cutoff },
      },
      data: { status: 'CANCELLED' },
    });

    if (result.count > 0) {
      this.logger.log(`Cancelled ${result.count} stale orders (older than ${timeoutMinutes}min)`);
    }

    return result.count;
  }

  /**
   * 处理支付回调
   *
   * @param method - 支付方式
   * @param params - 回调参数
   */
  async handlePaymentNotify(
    method: string,
    params: Record<string, any>,
    headers?: Record<string, string>,
  ) {
    let result: {
      valid: boolean;
      orderNo?: string;
      tradeNo?: string;
      amount?: number;
      status?: string;
      buyerId?: string;
    };

    // 验证回调
    switch (method) {
      case 'epay':
        result = await this.epayService.verifyNotify(params);
        break;
      case 'alipay':
        result = await this.alipayService.verifyNotify(params);
        break;
      case 'wechatpay':
        if (!headers) {
          throw new BadRequestException('Missing headers for WeChatPay notify');
        }
        result = await this.wechatPayService.verifyNotify(headers, JSON.stringify(params));
        break;
      default:
        throw new BadRequestException('Unknown payment method');
    }

    if (!result.valid || !result.orderNo) {
      throw new BadRequestException('Invalid payment notification');
    }

    // 查找订单
    const order = await this.prisma.order.findUnique({
      where: { order_no: result.orderNo },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // 幂等检查：已处理的订单直接返回成功
    if (order.status !== 'PENDING') {
      this.logger.log(`Order ${result.orderNo} already processed, status: ${order.status}`);
      return { success: true };
    }

    // 验证金额
    if (result.amount !== undefined && result.amount !== null) {
      const expectedAmount = order.amount;
      const notifyAmount = typeof result.amount === 'string'
        ? this.parseAmount(result.amount, method)
        : result.amount;

      if (Math.abs(notifyAmount - expectedAmount) > 1) {
        this.logger.error(
          `Amount mismatch for order ${result.orderNo}: expected ${expectedAmount}, got ${notifyAmount}`,
        );
        throw new BadRequestException('Amount mismatch');
      }
    }

    // 判断支付状态
    const isPaid = this.isPaymentSuccess(result.status, method);

    if (isPaid) {
      // 使用事务处理支付成功
      await this.prisma.$transaction(async (tx) => {
        // 更新订单状态
        await tx.order.update({
          where: { id: order.id },
          data: {
            status: 'PAID',
            paid_amount: order.amount,
            paid_at: new Date(),
          },
        });

        // 创建支付记录
        await tx.payment.create({
          data: {
            order_id: order.id,
            method: order.payment_method || 'EPAY_ALIPAY',
            amount: order.amount,
            trade_no: result.tradeNo,
            buyer_id: result.buyerId,
            status: 'SUCCESS',
            paid_at: new Date(),
          },
        });

        // 增加用户余额
        await tx.userBalance.upsert({
          where: { user_id: order.user_id },
          update: { amount: { increment: order.amount } },
          create: { user_id: order.user_id, amount: order.amount },
        });

        // 记录交易流水
        const balance = await tx.userBalance.findUnique({
          where: { user_id: order.user_id },
        });

        await tx.userTransaction.create({
          data: {
            user_id: order.user_id,
            type: 'RECHARGE',
            amount: order.amount,
            balance_after: balance?.amount || 0,
            order_id: order.id,
            remark: `充值 - ${order.product_name}`,
          },
        });
      });

      this.logger.log(`Payment successful for order: ${result.orderNo}`);
    } else {
      // 更新订单状态为失败
      await this.prisma.order.update({
        where: { id: order.id },
        data: { status: 'FAILED' },
      });

      this.logger.log(`Payment failed for order: ${result.orderNo}`);
    }

    return { success: true };
  }

  /**
   * 判断支付是否成功
   */
  private isPaymentSuccess(status: string | undefined, method: string): boolean {
    if (!status) return false;

    switch (method) {
      case 'epay':
        return status === 'TRADE_SUCCESS' || status === 'TRADE_FINISHED';
      case 'alipay':
        return status === 'TRADE_SUCCESS' || status === 'TRADE_FINISHED';
      case 'wechatpay':
        return status === 'SUCCESS';
      default:
        return false;
    }
  }

  /**
   * 解析金额字符串为分
   */
  private parseAmount(amount: string, method: string): number {
    switch (method) {
      case 'epay':
      case 'alipay':
        return Math.round(parseFloat(amount) * 100);
      case 'wechatpay':
        return parseInt(amount, 10);
      default:
        return 0;
    }
  }

  /**
   * 获取可用支付方式
   */
  async getAvailableMethods() {
    const methods = await this.paymentConfigService.getEnabledMethods();

    return methods.map((m) => ({
      name: m.name,
      displayName: m.display_name,
    }));
  }
}
