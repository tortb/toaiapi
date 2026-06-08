import { Injectable, Logger } from '@nestjs/common';
import { LeaderboardRepository } from './leaderboard.repository';
import { RedisService } from '../../redis/redis.service';

/**
 * 排行榜服务
 *
 * 核心职责：
 * 1. 热门模型排行
 * 2. 提供商份额统计
 * 3. 趋势分析
 * 4. 缓存管理（5 分钟 TTL）
 */
@Injectable()
export class LeaderboardService {
  private readonly logger = new Logger(LeaderboardService.name);
  private readonly CACHE_TTL = 300; // 5 分钟

  constructor(
    private readonly leaderboardRepo: LeaderboardRepository,
    private readonly redis: RedisService,
  ) {}

  /**
   * 获取排行榜数据
   *
   * @param period - 周期（TODAY/WEEK/MONTH/YEAR/ALL）
   */
  async getLeaderboard(period: string = 'WEEK') {
    const cacheKey = `leaderboard:${period}`;
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (error) {
        this.logger.warn(`Failed to parse cached leaderboard: ${error}`);
      }
    }

    const { startDate } = this.getPeriodDates(period);

    const [hotModels, vendorShare] = await Promise.all([
      this.leaderboardRepo.getHotModels(startDate, 10),
      this.leaderboardRepo.getVendorShare(startDate),
    ]);

    const result = {
      period,
      hot_models: hotModels,
      vendor_share: vendorShare,
    };

    await this.redis.set(cacheKey, JSON.stringify(result), this.CACHE_TTL);

    return result;
  }

  /**
   * 获取热门模型
   */
  async getHotModels(period: string = 'WEEK', limit: number = 10) {
    const cacheKey = `leaderboard:models:${period}:${limit}`;
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (error) {
        this.logger.warn(`Failed to parse cached hot models: ${error}`);
      }
    }

    const { startDate } = this.getPeriodDates(period);
    const result = await this.leaderboardRepo.getHotModels(startDate, limit);

    await this.redis.set(cacheKey, JSON.stringify(result), this.CACHE_TTL);

    return result;
  }

  /**
   * 获取提供商份额
   */
  async getVendorShare(period: string = 'WEEK') {
    const cacheKey = `leaderboard:vendors:${period}`;
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (error) {
        this.logger.warn(`Failed to parse cached vendor share: ${error}`);
      }
    }

    const { startDate } = this.getPeriodDates(period);
    const result = await this.leaderboardRepo.getVendorShare(startDate);

    await this.redis.set(cacheKey, JSON.stringify(result), this.CACHE_TTL);

    return result;
  }

  /**
   * 获取趋势分析
   */
  async getTrending(period: string = 'WEEK', limit: number = 10) {
    const cacheKey = `leaderboard:trending:${period}:${limit}`;
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (error) {
        this.logger.warn(`Failed to parse cached trending: ${error}`);
      }
    }

    const { currentStart, previousStart, currentEnd } = this.getTrendingDates(period);
    const result = await this.leaderboardRepo.getTrending(
      currentStart,
      previousStart,
      currentEnd,
      limit,
    );

    await this.redis.set(cacheKey, JSON.stringify(result), this.CACHE_TTL);

    return result;
  }

  /**
   * 获取周期对应的起始日期
   */
  private getPeriodDates(period: string): { startDate: Date } {
    const now = new Date();
    const startDate = new Date();

    switch (period.toUpperCase()) {
      case 'TODAY':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'WEEK':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'MONTH':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'YEAR':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'ALL':
        startDate.setFullYear(2020, 0, 1); // 从 2020 年开始
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    return { startDate };
  }

  /**
   * 获取趋势分析的日期范围
   */
  private getTrendingDates(period: string): {
    currentStart: Date;
    previousStart: Date;
    currentEnd: Date;
  } {
    const now = new Date();
    const currentEnd = now;
    const currentStart = new Date();
    const previousStart = new Date();

    switch (period.toUpperCase()) {
      case 'TODAY':
        currentStart.setHours(0, 0, 0, 0);
        previousStart.setDate(currentStart.getDate() - 1);
        previousStart.setHours(0, 0, 0, 0);
        break;
      case 'WEEK':
        currentStart.setDate(now.getDate() - 7);
        previousStart.setDate(now.getDate() - 14);
        break;
      case 'MONTH':
        currentStart.setMonth(now.getMonth() - 1);
        previousStart.setMonth(now.getMonth() - 2);
        break;
      default:
        currentStart.setDate(now.getDate() - 7);
        previousStart.setDate(now.getDate() - 14);
    }

    return { currentStart, previousStart, currentEnd };
  }
}
