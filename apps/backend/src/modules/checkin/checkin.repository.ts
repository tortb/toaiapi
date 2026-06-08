import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * 签到数据仓库
 *
 * 封装签到相关的数据库操作
 */
@Injectable()
export class CheckinRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 获取签到配置
   */
  async getConfig() {
    // 获取第一条配置，如果不存在则创建默认配置
    let config = await this.prisma.checkInConfig.findFirst();

    if (!config) {
      config = await this.prisma.checkInConfig.create({
        data: {
          is_enabled: true,
          min_reward: 1000,  // 10元
          max_reward: 5000,  // 50元
        },
      });
    }

    return config;
  }

  /**
   * 更新签到配置
   */
  async updateConfig(data: {
    is_enabled?: boolean;
    min_reward?: number;
    max_reward?: number;
  }) {
    const config = await this.getConfig();

    return this.prisma.checkInConfig.update({
      where: { id: config.id },
      data,
    });
  }

  /**
   * 检查用户今天是否已签到
   */
  async hasCheckedInToday(userId: string): Promise<boolean> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const count = await this.prisma.checkInRecord.count({
      where: {
        user_id: userId,
        check_date: {
          gte: today,
        },
      },
    });

    return count > 0;
  }

  /**
   * 创建签到记录
   */
  async createRecord(userId: string, reward: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.prisma.checkInRecord.create({
      data: {
        user_id: userId,
        check_date: today,
        reward,
      },
    });
  }

  /**
   * 获取用户签到历史
   */
  async getUserHistory(userId: string, limit = 30) {
    return this.prisma.checkInRecord.findMany({
      where: { user_id: userId },
      orderBy: { check_date: 'desc' },
      take: limit,
    });
  }

  /**
   * 获取用户签到统计
   */
  async getUserStats(userId: string) {
    const records = await this.prisma.checkInRecord.findMany({
      where: { user_id: userId },
      orderBy: { check_date: 'desc' },
    });

    const totalDays = records.length;
    const totalReward = records.reduce((sum, r) => sum + r.reward, 0);

    // 计算连续签到天数
    let consecutiveDays = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const record of records) {
      const recordDate = new Date(record.check_date);
      recordDate.setHours(0, 0, 0, 0);

      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - consecutiveDays);
      expectedDate.setHours(0, 0, 0, 0);

      if (recordDate.getTime() === expectedDate.getTime()) {
        consecutiveDays++;
      } else {
        break;
      }
    }

    return {
      totalDays,
      totalReward,
      consecutiveDays,
    };
  }
}
