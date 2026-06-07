import { Injectable, Logger } from '@nestjs/common';
import { AnalyticsRepository } from './analytics.repository';

/**
 * 分析看板服务
 *
 * 核心职责：
 * 1. 调用趋势分析
 * 2. 模型使用排行
 * 3. 消费分析
 * 4. 成功率统计
 */
@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private readonly analyticsRepo: AnalyticsRepository) {}

  /**
   * 获取综合分析数据
   *
   * @param userId - 用户 ID
   * @param days - 时间范围（天数）
   */
  async getAnalytics(userId: string, days: number = 7) {
    const [overview, callTrend, modelRanking, successRate] = await Promise.all([
      this.analyticsRepo.getOverview(userId, days),
      this.analyticsRepo.getCallTrend(userId, days),
      this.analyticsRepo.getModelRanking(userId, days, 10),
      this.analyticsRepo.getSuccessRate(userId, days),
    ]);

    return {
      overview: {
        ...overview,
        success_rate: Math.round(successRate * 100) / 100,
      },
      call_trend: callTrend,
      model_ranking: modelRanking,
    };
  }

  /**
   * 获取调用趋势
   */
  async getCallTrend(userId: string, days: number = 7) {
    return this.analyticsRepo.getCallTrend(userId, days);
  }

  /**
   * 获取模型排行
   */
  async getModelRanking(userId: string, days: number = 7, limit: number = 10) {
    return this.analyticsRepo.getModelRanking(userId, days, limit);
  }

  /**
   * 获取统计概览
   */
  async getOverview(userId: string, days: number = 7) {
    const [overview, successRate] = await Promise.all([
      this.analyticsRepo.getOverview(userId, days),
      this.analyticsRepo.getSuccessRate(userId, days),
    ]);

    return {
      ...overview,
      success_rate: Math.round(successRate * 100) / 100,
    };
  }
}
