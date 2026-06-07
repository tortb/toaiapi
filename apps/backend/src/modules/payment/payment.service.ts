import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  OnModuleInit,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EPayService } from './epay.service';
import { AlipayService } from './alipay.service';
import { WechatPayService } from './wechatpay.service';
import { PaymentConfigService } from '../../common/services/payment-config.service';
import { ChannelService } from '../gateway/channel/channel.service';
import { CreateOrderDto, PaymentMethodDto } from './dto/create-order.dto';
import { nanoid } from 'nanoid';
import { OrderStatus, PaymentMethod, Prisma } from '@prisma/client';
import { InviteService } from '../invite/invite.service';

/**
 * 统一支付服务
 *
 * 整合易支付、支付宝、微信支付，提供统一的订单创建和支付处理接口。
 *
 * SECURITY:
 * - 订单号唯一约束防止重复
 * - 状态只能通过回调修改
 * - 金额校验必须与订单一致
 *
 * 单位说明：
 * - API层：元（CNY）
 * - 数据库：分（fen）
 * - 转换：1元 = 100分
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
    private readonly channelService: ChannelService,
    @Inject(forwardRef(() => InviteService))
    private readonly inviteService: InviteService,
  ) {}

  onModuleInit() {
    // 每 5 分钟：先验证 PENDING 订单状态，再清理超时订单
    setInterval(() => {
      this.verifyPendingOrders().catch((err) => {
        this.logger.error(`Pending order verification failed: ${err}`);
      });
      this.cancelStaleOrders(30).catch((err) => {
        this.logger.error(`Stale order cleanup failed: ${err}`);
      });
      this.channelService.recoverRateLimitedChannels(5).catch((err) => {
        this.logger.error(`Rate-limited channel recovery failed: ${err}`);
      });
    }, 5 * 60 * 1000);

    // 启动后 30 秒立即执行一次验证（给回调留时间）
    setTimeout(() => {
      this.verifyPendingOrders().catch((err) => {
        this.logger.error(`Initial pending order verification failed: ${err}`);
      });
    }, 30_000);
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
   * @param dto - 创建订单参数（金额单位：元）
   * @returns 订单信息和支付链接（金额单位：元）
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

    // 将元转换为分（数据库存储单位）
    const amountInFen = Math.round(dto.amount * 100);

    // 创建订单
    const order = await this.prisma.order.create({
      data: {
        order_no: orderNo,
        user_id: userId,
        amount: amountInFen,
        payment_method: paymentMethod,
        status: 'PENDING',
        product_type: 'recharge',
        product_name: dto.productName || 'ToAIAPI 余额充值',
      },
    });

    this.logger.log(`Order created: ${orderNo} for user: ${userId}`);

    // 生成支付链接。失败时取消订单并向调用方返回明确错误，避免产生无法支付的订单。
    let payUrl = '';
    try {
      payUrl = await this.generatePayUrl(dto.paymentMethod, order);
    } catch (error) {
      await this.prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'CANCELLED',
          remark: '支付链接生成失败',
        },
      });
      this.logger.error(`Failed to generate pay URL for order ${orderNo}: ${error instanceof Error ? error.message : error}`);
      throw new BadRequestException('支付链接生成失败，请稍后重试');
    }

    return {
      orderNo: order.order_no,
      amount: order.amount / 100, // 将分转换为元
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
   * @returns 订单详情（金额单位：元）
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

    return {
      ...order,
      amount: order.amount / 100, // 将分转换为元
      paid_amount: order.paid_amount ? order.paid_amount / 100 : null,
    };
  }

  /**
   * 获取用户订单列表
   *
   * @param userId - 用户ID
   * @param page - 页码
   * @param pageSize - 每页数量
   * @returns 订单列表（金额单位：元）
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
      data: orders.map((order) => ({
        ...order,
        amount: order.amount / 100, // 将分转换为元
        paid_amount: order.paid_amount ? order.paid_amount / 100 : null,
      })),
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
      await this.processSuccessfulPayment(order, result.tradeNo);
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
    const configs = await this.paymentConfigService.getEnabledMethods();
    const methods: Array<{ name: string; displayName: string }> = [];

    for (const config of configs) {
      switch (config.name) {
        case 'epay': {
          // 读取 extra_config 中的子支付方式开关
          const extra = config.extra_config as Record<string, any> | null;
          const enableAlipay = extra?.['enable_alipay'] !== false; // 默认启用
          const enableWxpay = extra?.['enable_wxpay'] !== false;
          if (enableAlipay) methods.push({ name: 'EPAY_ALIPAY', displayName: '易支付-支付宝' });
          if (enableWxpay) methods.push({ name: 'EPAY_WECHAT', displayName: '易支付-微信' });
          break;
        }
        case 'alipay':
          methods.push({ name: 'ALIPAY', displayName: '支付宝' });
          break;
        case 'wechatpay':
          methods.push({ name: 'WECHAT_PAY', displayName: '微信支付' });
          break;
      }
    }

    return methods;
  }

  /**
   * 验证易支付同步跳转
   */
  async verifyEpayReturn(params: Record<string, any>): Promise<{
    valid: boolean;
    orderNo?: string;
  }> {
    return this.epayService.verifyReturn(params);
  }

  /**
   * 获取当前有效的充值赠送活动
   *
   * @param amount - 充值金额（元），用于筛选满足条件的活动
   * @returns 活动列表（金额单位：元）
   */
  async getActivePromotions(amount: number) {
    const now = new Date();
    const where: Prisma.RechargePromotionWhereInput = {
      is_active: true,
      start_at: { lte: now },
      OR: [{ end_at: null }, { end_at: { gte: now } }],
    };
    if (amount > 0) {
      // 将元转换为分进行比较（数据库存储单位）
      where.min_amount = { lte: Math.round(amount * 100) };
    }

    const promos = await this.prisma.rechargePromotion.findMany({
      where,
      orderBy: { min_amount: 'desc' },
    });

    return promos.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      minAmount: p.min_amount / 100, // 将分转换为元
      bonusType: p.bonus_type,
      bonusValue: p.bonus_value,
      maxBonus: p.max_bonus ? p.max_bonus / 100 : null, // 将分转换为元
      startAt: p.start_at,
      endAt: p.end_at,
    }));
  }

  /**
   * 主动验证并恢复单个订单
   *
   * 向支付平台查询订单状态，如果已支付则补单（更新状态 + 充值余额）。
   * 用于：管理员手动补单、自动对账、回调失败后的恢复。
   *
   * @param orderNo - 商户订单号
   * @returns 处理结果
   */
  async verifyAndRecoverOrder(orderNo: string): Promise<{
    success: boolean;
    message: string;
    orderStatus?: string;
  }> {
    // 查找订单
    const order = await this.prisma.order.findUnique({
      where: { order_no: orderNo },
    });

    if (!order) {
      return { success: false, message: '订单不存在' };
    }

    if (order.status === 'PAID') {
      return { success: true, message: '订单已支付，无需处理', orderStatus: 'PAID' };
    }

    if (order.status !== 'PENDING') {
      return { success: false, message: `订单状态为 ${order.status}，无法验证`, orderStatus: order.status };
    }

    // 根据支付方式调用对应的查询 API
    let queryResult: { success: boolean; tradeNo?: string; status?: string; amount?: number; error?: string };

    if (order.payment_method === 'EPAY_ALIPAY' || order.payment_method === 'EPAY_WECHAT') {
      queryResult = await this.epayService.queryOrder(orderNo);
    } else {
      return { success: false, message: `不支持的支付方式: ${order.payment_method}` };
    }

    if (!queryResult.success) {
      return { success: false, message: `查询失败: ${queryResult.error}` };
    }

    // 判断是否支付成功
    const isPaid = queryResult.status === 'TRADE_SUCCESS' || queryResult.status === 'TRADE_FINISHED';

    if (!isPaid) {
      return {
        success: true,
        message: `订单在 EPay 状态为 ${queryResult.status}，尚未支付`,
        orderStatus: queryResult.status,
      };
    }

    // 支付成功 — 执行补单逻辑（与 handlePaymentNotify 相同）
    try {
      await this.processSuccessfulPayment(order, queryResult.tradeNo);
      this.logger.log(`Order ${orderNo} verified and recovered successfully via query API`);
      return { success: true, message: '补单成功！订单已更新为已支付，余额已充值', orderStatus: 'PAID' };
    } catch (error) {
      this.logger.error(`Order ${orderNo} recovery failed: ${error instanceof Error ? error.message : error}`);
      return { success: false, message: `补单失败: ${error instanceof Error ? error.message : error}` };
    }
  }

  /**
   * 批量验证所有 PENDING 订单
   *
   * 定时任务：查询 EPay 确认 PENDING 订单的真实状态，
   * 防止因回调失败导致掉单。
   */
  async verifyPendingOrders(): Promise<void> {
    // 只查询最近 2 小时内的 PENDING 订单（避免查询太旧的订单）
    const cutoff = new Date(Date.now() - 2 * 60 * 60 * 1000);

    const pendingOrders = await this.prisma.order.findMany({
      where: {
        status: 'PENDING',
        created_at: { gte: cutoff },
        payment_method: { in: ['EPAY_ALIPAY', 'EPAY_WECHAT'] },
      },
      select: { order_no: true },
    });

    if (pendingOrders.length === 0) return;

    this.logger.log(`Verifying ${pendingOrders.length} pending EPay orders...`);

    for (const order of pendingOrders) {
      try {
        const result = await this.verifyAndRecoverOrder(order.order_no);
        if (result.orderStatus === 'PAID') {
          this.logger.log(`Auto-recovered order: ${order.order_no}`);
        }
      } catch (err) {
        this.logger.error(`Failed to verify order ${order.order_no}: ${err}`);
      }
    }
  }

  /**
   * 处理支付成功逻辑（统一的补单/回调处理）
   *
   * @param order - 订单记录
   * @param tradeNo - 支付平台交易号
   */
  private async processSuccessfulPayment(order: { id: string; user_id: string; amount: number; payment_method: string | null; product_name: string }, tradeNo?: string) {
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
          method: (order.payment_method || 'EPAY_ALIPAY') as any,
          amount: order.amount,
          trade_no: tradeNo,
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

      // 记录充值交易流水
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

      // 查询匹配的赠送活动
      const now = new Date();
      const promos = await tx.rechargePromotion.findMany({
        where: {
          is_active: true,
          start_at: { lte: now },
          OR: [{ end_at: null }, { end_at: { gte: now } }],
          min_amount: { lte: order.amount },
        },
        orderBy: { min_amount: 'desc' },
        take: 1,
      });

      // 应用赠送活动
      if (promos.length > 0) {
        const promo = promos[0]!;
        const bonus = this.calculateBonus(promo, order.amount);
        if (bonus > 0) {
          await tx.userBalance.update({
            where: { user_id: order.user_id },
            data: { amount: { increment: bonus } },
          });

          const updatedBalance = await tx.userBalance.findUnique({
            where: { user_id: order.user_id },
          });

          await tx.userTransaction.create({
            data: {
              user_id: order.user_id,
              type: 'GIFT',
              amount: bonus,
              balance_after: updatedBalance?.amount || 0,
              order_id: order.id,
              remark: `充值赠送 - ${promo.name}`,
            },
          });

          this.logger.log(`Applied promotion "${promo.name}" bonus ${bonus} fen`);
        }
      }
    });

    // 处理邀请返现奖励（在事务外异步执行）
    try {
      await this.inviteService.handleRechargeReward(order.user_id, order.amount);
    } catch (error) {
      this.logger.error(`Failed to handle invite reward: ${error}`);
    }
  }

  /**
   * 计算赠送金额
   */
  private calculateBonus(promo: any, rechargeAmount: number): number {
    if (promo.bonus_type === 'FIXED') {
      return promo.bonus_value;
    }
    // PERCENTAGE: bonus_value 存的是百分比×100（如10%存1000）
    let bonus = Math.floor(rechargeAmount * promo.bonus_value / 10000);
    if (promo.max_bonus && bonus > promo.max_bonus) {
      bonus = promo.max_bonus;
    }
    return bonus;
  }
}
