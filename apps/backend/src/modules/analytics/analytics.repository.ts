import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * 分析看板数据访问层
 */
@Injectable()
export class AnalyticsRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 获取调用趋势数据
   *
   * @param userId - 用户 ID
   * @param days - 天数（7/30/90）
   */
  async getCallTrend(userId: string, days: number) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const logs = await this.prisma.$queryRaw<
      Array<{
        date: string;
        requests: bigint;
        tokens: bigint;
        cost: bigint;
      }>
    >`
      SELECT
        DATE(created_at) as date,
        COUNT(*) as requests,
        SUM(total_tokens) as tokens,
        SUM(cost) as cost
      FROM request_logs
      WHERE user_id = ${userId}
        AND created_at >= ${startDate}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    return logs.map((log) => ({
      date: log.date,
      requests: Number(log.requests),
      tokens: Number(log.tokens),
      cost: Number(log.cost),
    }));
  }

  /**
   * 获取模型排行
   *
   * @param userId - 用户 ID
   * @param days - 天数
   * @param limit - 返回数量
   */
  async getModelRanking(userId: string, days: number, limit: number = 10) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const ranking = await this.prisma.$queryRaw<
      Array<{
        model_id: string | null;
        requests: bigint;
        tokens: bigint;
        cost: bigint;
      }>
    >`
      SELECT
        model_id,
        COUNT(*) as requests,
        SUM(total_tokens) as tokens,
        SUM(cost) as cost
      FROM request_logs
      WHERE user_id = ${userId}
        AND created_at >= ${startDate}
      GROUP BY model_id
      ORDER BY cost DESC
      LIMIT ${limit}
    `;

    return ranking.map((item) => ({
      model: item.model_id ?? "Unknown",
      requests: Number(item.requests),
      tokens: Number(item.tokens),
      cost: Number(item.cost),
    }));
  }

  /**
   * 获取统计概览
   */
  async getOverview(userId: string, days: number) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const result = await this.prisma.$queryRaw<
      Array<{
        total_requests: bigint;
        total_tokens: bigint;
        total_cost: bigint;
        avg_tokens_per_request: number;
      }>
    >`
      SELECT
        COUNT(*) as total_requests,
        SUM(total_tokens) as total_tokens,
        SUM(cost) as total_cost,
        AVG(total_tokens) as avg_tokens_per_request
      FROM request_logs
      WHERE user_id = ${userId}
        AND created_at >= ${startDate}
    `;

    if (result.length === 0) {
      return {
        total_requests: 0,
        total_tokens: 0,
        total_cost: 0,
        avg_tokens_per_request: 0,
      };
    }

    return {
      total_requests: Number(result[0]!.total_requests),
      total_tokens: Number(result[0]!.total_tokens),
      total_cost: Number(result[0]!.total_cost),
      avg_tokens_per_request: Math.round(result[0]!.avg_tokens_per_request || 0),
    };
  }

  /**
   * 获取成功率统计
   */
  async getSuccessRate(userId: string, days: number) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const result = await this.prisma.$queryRaw<
      Array<{
        total: bigint;
        success: bigint;
      }>
    >`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status_code = 200 THEN 1 ELSE 0 END) as success
      FROM request_logs
      WHERE user_id = ${userId}
        AND created_at >= ${startDate}
    `;

    if (result.length === 0 || Number(result[0]!.total) === 0) {
      return 0;
    }

    return (Number(result[0]!.success) / Number(result[0]!.total)) * 100;
  }
}
