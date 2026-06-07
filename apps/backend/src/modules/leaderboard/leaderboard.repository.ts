import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * 排行榜数据访问层
 */
@Injectable()
export class LeaderboardRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 获取热门模型排行
   *
   * @param period - 时间周期
   * @param limit - 返回数量
   */
  async getHotModels(startDate: Date, limit: number = 10) {
    const ranking = await this.prisma.$queryRaw<
      Array<{
        model: string;
        requests: bigint;
        tokens: bigint;
      }>
    >`
      SELECT
        model,
        COUNT(*) as requests,
        SUM(total_tokens) as tokens
      FROM request_logs
      WHERE created_at >= ${startDate}
      GROUP BY model
      ORDER BY tokens DESC
      LIMIT ${limit}
    `;

    return ranking.map((item) => ({
      model: item.model,
      requests: Number(item.requests),
      tokens: Number(item.tokens),
    }));
  }

  /**
   * 获取用户排行（管理员功能）
   *
   * @param startDate - 开始时间
   * @param limit - 返回数量
   */
  async getUserRanking(startDate: Date, limit: number = 10) {
    const ranking = await this.prisma.$queryRaw<
      Array<{
        user_id: string;
        requests: bigint;
        tokens: bigint;
        cost: bigint;
      }>
    >`
      SELECT
        user_id,
        COUNT(*) as requests,
        SUM(total_tokens) as tokens,
        SUM(cost) as cost
      FROM request_logs
      WHERE created_at >= ${startDate}
      GROUP BY user_id
      ORDER BY cost DESC
      LIMIT ${limit}
    `;

    return ranking.map((item) => ({
      user_id: item.user_id,
      requests: Number(item.requests),
      tokens: Number(item.tokens),
      cost: Number(item.cost),
    }));
  }

  /**
   * 获取提供商份额统计
   */
  async getVendorShare(startDate: Date) {
    // 先获取所有模型的 provider_id
    const models = await this.prisma.model.findMany({
      select: {
        name: true,
        provider_id: true,
      },
    });

    const modelProviderMap = new Map<string, string>();
    models.forEach((m) => modelProviderMap.set(m.name, m.provider_id));

    // 获取各模型的调用量
    const modelStats = await this.prisma.$queryRaw<
      Array<{
        model: string;
        requests: bigint;
        tokens: bigint;
      }>
    >`
      SELECT
        model,
        COUNT(*) as requests,
        SUM(total_tokens) as tokens
      FROM request_logs
      WHERE created_at >= ${startDate}
      GROUP BY model
    `;

    // 按提供商聚合
    const vendorMap = new Map<string, { requests: number; tokens: number }>();
    modelStats.forEach((stat) => {
      const provider = modelProviderMap.get(stat.model) || 'unknown';
      const current = vendorMap.get(provider) || { requests: 0, tokens: 0 };
      vendorMap.set(provider, {
        requests: current.requests + Number(stat.requests),
        tokens: current.tokens + Number(stat.tokens),
      });
    });

    return Array.from(vendorMap.entries())
      .map(([vendor, stats]) => ({
        vendor,
        ...stats,
      }))
      .sort((a, b) => b.tokens - a.tokens);
  }

  /**
   * 获取趋势对比（对比上一周期）
   */
  async getTrending(currentStart: Date, previousStart: Date, currentEnd: Date, limit: number = 10) {
    const current = await this.prisma.$queryRaw<
      Array<{
        model: string;
        tokens: bigint;
      }>
    >`
      SELECT
        model,
        SUM(total_tokens) as tokens
      FROM request_logs
      WHERE created_at >= ${currentStart} AND created_at < ${currentEnd}
      GROUP BY model
      ORDER BY tokens DESC
      LIMIT ${limit}
    `;

    const previous = await this.prisma.$queryRaw<
      Array<{
        model: string;
        tokens: bigint;
      }>
    >`
      SELECT
        model,
        SUM(total_tokens) as tokens
      FROM request_logs
      WHERE created_at >= ${previousStart} AND created_at < ${currentStart}
      GROUP BY model
    `;

    // 构建上期排名映射
    const previousRankMap = new Map<string, number>();
    previous.forEach((item, index) => {
      previousRankMap.set(item.model, index + 1);
    });

    return current.map((item, index) => {
      const currentRank = index + 1;
      const previousRank = previousRankMap.get(item.model);
      let change: 'up' | 'down' | 'new' | 'stable' = 'stable';

      if (!previousRank) {
        change = 'new';
      } else if (previousRank > currentRank) {
        change = 'up';
      } else if (previousRank < currentRank) {
        change = 'down';
      }

      return {
        model: item.model,
        tokens: Number(item.tokens),
        rank: currentRank,
        previous_rank: previousRank || null,
        change,
      };
    });
  }
}
