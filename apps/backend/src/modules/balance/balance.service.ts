import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BillingService } from '../billing/billing.service';
import { RequestLogService } from '../request-log/request-log.service';

type StatsPeriod = '24h' | '7d' | '30d' | '90d';
type StatsGranularity = 'hour' | 'day';

type RequestLogStatsRow = {
  id: string;
  model_id: string;
  channel_id: string;
  prompt_tokens: number;
  completion_tokens: number;
  cached_tokens: number;
  reasoning_tokens: number;
  total_tokens: number;
  cost: number;
  latency_ms: number;
  status_code: number;
  created_at: Date;
};

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
    await this.billingService.recharge(userId, amount, remark);
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
  async getStats(
    userId: string,
    period: StatsPeriod = '7d',
    granularity: StatsGranularity = 'day',
  ) {
    const { startDate, endDate } = this.calculateDateRange(period);
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [balance, apiKeyStats, todayUsage, cumulativeUsage, performance, logs, recentLogs, monthlySpend, monthlyRecharge, monthlyTokenStats] = await Promise.all([
      this.billingService.getBalance(userId),
      this.getApiKeyStats(userId),
      this.getUsageAggregate(userId, todayStart, endDate),
      this.getUsageAggregate(userId),
      this.getPerformanceMetrics(userId),
      this.findLogsForStats(userId, startDate, endDate),
      this.findRecentUsage(userId, 5),
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

    const channelPlatformMap = await this.getChannelPlatformMap(logs.map((log) => log.channel_id));
    const platformBreakdown = this.buildPlatformBreakdown(logs, channelPlatformMap);
    const modelDistribution = this.buildModelDistribution(logs);
    const tokenTrend = this.buildTokenTrend(logs, startDate, endDate, granularity);

    return {
      balance: {
        amount: balance.amount,
        frozen: balance.frozen,
        available: balance.available,
      },
      apiKeys: apiKeyStats,
      today: {
        requests: todayUsage.requests,
        costActual: this.fenToYuan(todayUsage.cost),
        costStandard: this.fenToYuan(this.estimateStandardCost(todayUsage.cost)),
        tokensInput: todayUsage.promptTokens,
        tokensOutput: todayUsage.completionTokens,
        tokensTotal: todayUsage.totalTokens,
      },
      cumulative: {
        tokensInput: cumulativeUsage.promptTokens,
        tokensOutput: cumulativeUsage.completionTokens,
        tokensTotal: cumulativeUsage.totalTokens,
      },
      performance,
      platformBreakdown,
      modelDistribution,
      tokenTrend,
      recentUsage: recentLogs.map((log) => ({
        id: log.id,
        model: log.model_id,
        timestamp: log.created_at.toISOString(),
        costActual: this.fenToYuan(log.cost),
        costStandard: this.fenToYuan(this.estimateStandardCost(log.cost)),
        tokens: log.total_tokens,
      })),

      // Legacy fields used by older pages/components.
      monthlySpend: Math.abs(monthlySpend._sum.amount || 0) / 100,
      monthlyRecharge: (monthlyRecharge._sum.amount || 0) / 100,
      monthlyRequests: monthlyTokenStats._count,
      monthlyPromptTokens: monthlyTokenStats._sum.prompt_tokens || 0,
      monthlyCompletionTokens: monthlyTokenStats._sum.completion_tokens || 0,
      monthlyTotalTokens: monthlyTokenStats._sum.total_tokens || 0,
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

  private calculateDateRange(period: StatsPeriod): { startDate: Date; endDate: Date } {
    const endDate = new Date();
    const startDate = new Date(endDate);
    switch (period) {
      case '24h':
        startDate.setHours(startDate.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 6);
        startDate.setHours(0, 0, 0, 0);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 29);
        startDate.setHours(0, 0, 0, 0);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 89);
        startDate.setHours(0, 0, 0, 0);
        break;
      default:
        throw new BadRequestException('Invalid stats period');
    }
    return { startDate, endDate };
  }

  private async getApiKeyStats(userId: string): Promise<{ total: number; enabled: number }> {
    const [total, enabled] = await Promise.all([
      this.prisma.apiKey.count({ where: { user_id: userId } }),
      this.prisma.apiKey.count({ where: { user_id: userId, is_active: true } }),
    ]);
    return { total, enabled };
  }

  private async getUsageAggregate(userId: string, startDate?: Date, endDate?: Date) {
    const where: { user_id: string; created_at?: { gte?: Date; lte?: Date } } = { user_id: userId };
    if (startDate || endDate) {
      where.created_at = {};
      if (startDate) where.created_at.gte = startDate;
      if (endDate) where.created_at.lte = endDate;
    }

    const aggregate = await this.prisma.requestLog.aggregate({
      where,
      _sum: {
        prompt_tokens: true,
        completion_tokens: true,
        cached_tokens: true,
        reasoning_tokens: true,
        total_tokens: true,
        cost: true,
      },
      _count: true,
    });

    return {
      requests: aggregate._count,
      promptTokens: aggregate._sum.prompt_tokens || 0,
      completionTokens: aggregate._sum.completion_tokens || 0,
      cachedTokens: aggregate._sum.cached_tokens || 0,
      reasoningTokens: aggregate._sum.reasoning_tokens || 0,
      totalTokens: aggregate._sum.total_tokens || 0,
      cost: aggregate._sum.cost || 0,
    };
  }

  private async getPerformanceMetrics(userId: string): Promise<{ rpm: number; tpm: number; avgLatencyMs: number }> {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const logs = await this.prisma.requestLog.findMany({
      where: { user_id: userId, created_at: { gte: since } },
      select: { total_tokens: true, latency_ms: true },
    });

    if (logs.length === 0) {
      return { rpm: 0, tpm: 0, avgLatencyMs: 0 };
    }

    const totalTokens = logs.reduce((sum, log) => sum + log.total_tokens, 0);
    const totalLatency = logs.reduce((sum, log) => sum + log.latency_ms, 0);
    const minutes = 24 * 60;
    return {
      rpm: Math.round((logs.length / minutes) * 10) / 10,
      tpm: Math.round(totalTokens / minutes),
      avgLatencyMs: Math.round(totalLatency / logs.length),
    };
  }

  private async findLogsForStats(userId: string, startDate: Date, endDate: Date): Promise<RequestLogStatsRow[]> {
    return this.prisma.requestLog.findMany({
      where: { user_id: userId, created_at: { gte: startDate, lte: endDate } },
      select: {
        id: true,
        model_id: true,
        channel_id: true,
        prompt_tokens: true,
        completion_tokens: true,
        cached_tokens: true,
        reasoning_tokens: true,
        total_tokens: true,
        cost: true,
        latency_ms: true,
        status_code: true,
        created_at: true,
      },
      orderBy: { created_at: 'asc' },
    });
  }

  private async findRecentUsage(userId: string, take: number): Promise<RequestLogStatsRow[]> {
    return this.prisma.requestLog.findMany({
      where: { user_id: userId },
      select: {
        id: true,
        model_id: true,
        channel_id: true,
        prompt_tokens: true,
        completion_tokens: true,
        cached_tokens: true,
        reasoning_tokens: true,
        total_tokens: true,
        cost: true,
        latency_ms: true,
        status_code: true,
        created_at: true,
      },
      orderBy: { created_at: 'desc' },
      take,
    });
  }

  private async getChannelPlatformMap(channelIds: string[]): Promise<Map<string, string>> {
    const uniqueIds = [...new Set(channelIds.filter(Boolean))];
    if (uniqueIds.length === 0) return new Map();

    const channels = await this.prisma.channel.findMany({
      where: { id: { in: uniqueIds } },
      select: {
        id: true,
        name: true,
        provider: {
          select: { display_name: true, name: true },
        },
      },
    });

    return new Map(
      channels.map((channel) => [
        channel.id,
        channel.provider?.display_name || channel.provider?.name || channel.name || channel.id,
      ]),
    );
  }

  private buildPlatformBreakdown(logs: RequestLogStatsRow[], channelPlatformMap: Map<string, string>) {
    const map = new Map<string, { platform: string; cost: number; requests: number; tokens: number }>();
    for (const log of logs) {
      const platform = channelPlatformMap.get(log.channel_id) || log.channel_id || 'Unknown';
      const item = map.get(platform) || { platform, cost: 0, requests: 0, tokens: 0 };
      item.cost += log.cost;
      item.requests += 1;
      item.tokens += log.total_tokens;
      map.set(platform, item);
    }
    return [...map.values()]
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 10)
      .map((item) => ({ ...item, cost: this.fenToYuan(item.cost) }));
  }

  private buildModelDistribution(logs: RequestLogStatsRow[]) {
    const map = new Map<string, { model: string; requests: number; tokens: number; costActual: number }>();
    for (const log of logs) {
      const model = log.model_id || 'Unknown';
      const item = map.get(model) || { model, requests: 0, tokens: 0, costActual: 0 };
      item.requests += 1;
      item.tokens += log.total_tokens;
      item.costActual += log.cost;
      map.set(model, item);
    }
    return [...map.values()]
      .sort((a, b) => b.costActual - a.costActual)
      .map((item) => ({
        model: item.model,
        requests: item.requests,
        tokens: item.tokens,
        costActual: this.fenToYuan(item.costActual),
        costStandard: this.fenToYuan(this.estimateStandardCost(item.costActual)),
      }));
  }

  private buildTokenTrend(
    logs: RequestLogStatsRow[],
    startDate: Date,
    endDate: Date,
    granularity: StatsGranularity,
  ): Array<{ date: string; tokens: number; cost: number }> {
    const map = new Map<string, { date: string; tokens: number; cost: number }>();
    for (const log of logs) {
      const key = this.formatTrendKey(log.created_at, granularity);
      const item = map.get(key) || { date: key, tokens: 0, cost: 0 };
      item.tokens += log.total_tokens;
      item.cost += log.cost;
      map.set(key, item);
    }

    const result: Array<{ date: string; tokens: number; cost: number }> = [];
    const cursor = new Date(startDate);
    if (granularity === 'day') cursor.setHours(0, 0, 0, 0);
    else cursor.setMinutes(0, 0, 0);

    while (cursor <= endDate) {
      const key = this.formatTrendKey(cursor, granularity);
      const item = map.get(key) || { date: key, tokens: 0, cost: 0 };
      result.push({ date: item.date, tokens: item.tokens, cost: this.fenToYuan(item.cost) });
      if (granularity === 'hour') cursor.setHours(cursor.getHours() + 1);
      else cursor.setDate(cursor.getDate() + 1);
    }

    return result;
  }

  private formatTrendKey(date: Date, granularity: StatsGranularity): string {
    if (granularity === 'hour') {
      return date.toISOString().slice(0, 13) + ':00:00.000Z';
    }
    return date.toISOString().slice(0, 10);
  }

  private estimateStandardCost(actualFen: number): number {
    return actualFen > 0 ? actualFen * 2 : 0;
  }

  private fenToYuan(fen: number): number {
    return Math.round((fen / 100) * 10000) / 10000;
  }
}
