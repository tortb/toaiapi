import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BillingService } from '../billing/billing.service';
import { RequestLogService } from '../request-log/request-log.service';

/**
 * 余额业务服务
 *
 * 提供余额查询、充值、交易流水查询等功能。
 * 作为 BillingService 和 RequestLogService 的上层封装，提供用户友好的接口。
 *
 * 单位说明：
 * - API层：元（CNY）
 * - 数据库：分（fen）
 * - 转换：1元 = 100分
 */
@Injectable()
export class BalanceService {
  private readonly logger = new Logger(BalanceService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly billingService: BillingService,
    private readonly requestLogService: RequestLogService,
  ) {}

  /**
   * 获取用户余额
   *
   * @param userId - 用户 ID
   * @returns 余额信息（元）：amount, frozen, available
   */
  async getBalance(userId: string) {
    const balance = await this.billingService.getBalance(userId);
    // billingService.getBalance() 已返回元，不需要再次转换
    return {
      amount: balance.amount,
      frozen: balance.frozen,
      available: balance.available,
    };
  }

  /**
   * 充值余额（管理员操作）
   *
   * @param userId - 目标用户 ID
   * @param amount - 充值金额（元），必须为正数
   * @param remark - 备注
   * @returns 充值后的余额（元）
   */
  async recharge(userId: string, amount: number, remark?: string) {
    // 将元转换为分（数据库存储单位）
    const amountInFen = Math.round(amount * 100);
    await this.billingService.recharge(userId, amountInFen, remark);
    return this.getBalance(userId);
  }

  /**
   * 获取交易流水
   *
   * @param userId - 用户 ID
   * @param page - 页码（从 1 开始）
   * @param pageSize - 每页数量（1-100）
   * @param filters - 可选过滤条件
   */
  async getTransactions(
    userId: string,
    page: number,
    pageSize: number,
    filters?: {
      type?: string;
      startDate?: Date;
      endDate?: Date;
    },
  ) {
    return this.billingService.getTransactions(userId, page, pageSize, filters);
  }

  /**
   * 获取请求日志
   *
   * @param userId - 用户 ID
   * @param page - 页码（从 1 开始）
   * @param pageSize - 每页数量（1-100）
   */
  async getRequestLogs(userId: string, page: number, pageSize: number) {
    return this.requestLogService.getUserLogs(userId, page, pageSize);
  }

  /**
   * 获取余额和消费统计
   */
  async getStats(userId: string) {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [balance, monthlySpend, monthlyRecharge, tokenStats] = await Promise.all([
      this.billingService.getBalance(userId),
      this.prisma.userTransaction.aggregate({
        where: { user_id: userId, type: 'DEDUCT', created_at: { gte: monthStart } },
        _sum: { amount: true },
      }),
      this.prisma.userTransaction.aggregate({
        where: { user_id: userId, type: 'RECHARGE', created_at: { gte: monthStart } },
        _sum: { amount: true },
      }),
      this.prisma.requestLog.aggregate({
        where: { user_id: userId, created_at: { gte: monthStart } },
        _sum: { prompt_tokens: true, completion_tokens: true, total_tokens: true },
        _count: true,
      }),
    ]);

    return {
      // billingService.getBalance() 已返回元，不需要转换
      balance: {
        amount: balance.amount,
        frozen: balance.frozen,
        available: balance.available,
      },
      // _sum.amount 来自 Prisma 原生聚合（单位：分），需除以 100 转为元
      monthlySpend: Math.abs(monthlySpend._sum.amount || 0) / 100,
      monthlyRecharge: (monthlyRecharge._sum.amount || 0) / 100,
      monthlyRequests: tokenStats._count,
      monthlyPromptTokens: tokenStats._sum.prompt_tokens || 0,
      monthlyCompletionTokens: tokenStats._sum.completion_tokens || 0,
      monthlyTotalTokens: tokenStats._sum.total_tokens || 0,
    };
  }

  /**
   * 获取消费明细（账单）
   */
  async getBills(
    userId: string,
    page: number,
    pageSize: number,
    filters?: { startDate?: string; endDate?: string },
  ) {
    const skip = (page - 1) * pageSize;
    const where: any = { user_id: userId };
    if (filters?.startDate || filters?.endDate) {
      where.created_at = {};
      if (filters.startDate) where.created_at.gte = new Date(filters.startDate);
      if (filters.endDate) where.created_at.lte = new Date(filters.endDate);
    }

    const [items, total] = await Promise.all([
      this.prisma.requestLog.findMany({
        where,
        select: {
          id: true,
          created_at: true,
          request_path: true,
          prompt_tokens: true,
          completion_tokens: true,
          cached_tokens: true,
          reasoning_tokens: true,
          total_tokens: true,
          cost: true,
          status_code: true,
          latency_ms: true,
          model_id: true,
          channel_id: true,
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.requestLog.count({ where }),
    ]);

    return {
      items: items.map((r) => ({
        id: r.id,
        createdAt: r.created_at,
        endpoint: r.request_path,
        promptTokens: r.prompt_tokens,
        completionTokens: r.completion_tokens,
        cachedTokens: r.cached_tokens,
        reasoningTokens: r.reasoning_tokens,
        totalTokens: r.total_tokens,
        cost: r.cost / 100, // 将分转换为元
        statusCode: r.status_code,
        latencyMs: r.latency_ms,
        modelId: r.model_id,
        channelId: r.channel_id,
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * 获取按天聚合的消费统计
   */
  async getDailyBills(userId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const logs = await this.prisma.requestLog.findMany({
      where: {
        user_id: userId,
        created_at: { gte: startDate },
      },
      select: {
        created_at: true,
        cost: true,
        total_tokens: true,
      },
    });

    // 按天聚合
    const dailyMap = new Map<string, { cost: number; tokens: number; requests: number }>();
    for (const log of logs) {
      const dateStr = log.created_at.toISOString().slice(0, 10);
      const existing = dailyMap.get(dateStr) || { cost: 0, tokens: 0, requests: 0 };
      existing.cost += log.cost;
      existing.tokens += log.total_tokens;
      existing.requests += 1;
      dailyMap.set(dateStr, existing);
    }

    // 填充空日期
    const result: Array<{ date: string; cost: number; tokens: number; requests: number }> = [];
    const current = new Date(startDate);
    const today = new Date();
    while (current <= today) {
      const dateStr = current.toISOString().slice(0, 10);
      const data = dailyMap.get(dateStr) || { cost: 0, tokens: 0, requests: 0 };
      result.push({
        date: dateStr,
        cost: data.cost / 100, // 将分转换为元
        tokens: data.tokens,
        requests: data.requests,
      });
      current.setDate(current.getDate() + 1);
    }

    return result;
  }
}
