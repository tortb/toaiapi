import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { CheckinRepository } from './checkin.repository';
import { BalanceService } from '../balance/balance.service';

/**
 * 签到业务服务
 *
 * 核心职责：
 * 1. 签到逻辑处理
 * 2. 随机奖励生成
 * 3. 防重复签到
 * 4. 余额更新
 */
@Injectable()
export class CheckinService {
  private readonly logger = new Logger(CheckinService.name);

  constructor(
    private readonly checkinRepo: CheckinRepository,
    private readonly balanceService: BalanceService,
  ) {}

  /**
   * 用户签到
   *
   * 流程：
   * 1. 检查签到功能是否启用
   * 2. 检查今天是否已签到
   * 3. 生成随机奖励
   * 4. 创建签到记录
   * 5. 增加用户余额
   *
   * @param userId - 用户 ID
   * @returns 签到结果（奖励金额、连续签到天数）
   */
  async checkin(userId: string) {
    // 1. 获取签到配置
    const config = await this.checkinRepo.getConfig();

    if (!config.is_enabled) {
      throw new BadRequestException('签到功能已关闭');
    }

    // 2. 检查今天是否已签到
    const hasCheckedIn = await this.checkinRepo.hasCheckedInToday(userId);
    if (hasCheckedIn) {
      throw new BadRequestException('今天已经签到过了');
    }

    // 3. 生成随机奖励（分）
    const reward = this.generateRandomReward(
      config.min_reward,
      config.max_reward,
    );

    try {
      // 4. 创建签到记录
      await this.checkinRepo.createRecord(userId, reward);

      // 5. 增加用户余额
      await this.balanceService.addBalance(userId, reward, '签到奖励');

      // 6. 获取签到统计
      const stats = await this.checkinRepo.getUserStats(userId);

      this.logger.log(
        `User ${userId} checked in, reward: ${reward / 100}元, consecutive: ${stats.consecutiveDays}天`,
      );

      return {
        reward,
        consecutiveDays: stats.consecutiveDays,
        totalDays: stats.totalDays,
        totalReward: stats.totalReward,
      };
    } catch (error) {
      this.logger.error(`Checkin failed for user ${userId}: ${error}`);
      throw new BadRequestException('签到失败，请稍后再试');
    }
  }

  /**
   * 获取用户签到历史
   */
  async getHistory(userId: string, limit = 30) {
    return this.checkinRepo.getUserHistory(userId, limit);
  }

  /**
   * 获取用户签到统计
   */
  async getStats(userId: string) {
    return this.checkinRepo.getUserStats(userId);
  }

  /**
   * 获取签到配置（用户端）
   */
  async getConfig() {
    return this.checkinRepo.getConfig();
  }

  /**
   * 更新签到配置（管理员）
   */
  async updateConfig(data: {
    is_enabled?: boolean;
    min_reward?: number;
    max_reward?: number;
  }) {
    // 验证奖励范围
    if (data.min_reward !== undefined && data.min_reward < 0) {
      throw new BadRequestException('最小奖励不能为负数');
    }

    if (data.max_reward !== undefined && data.max_reward < 0) {
      throw new BadRequestException('最大奖励不能为负数');
    }

    if (
      data.min_reward !== undefined &&
      data.max_reward !== undefined &&
      data.min_reward > data.max_reward
    ) {
      throw new BadRequestException('最小奖励不能大于最大奖励');
    }

    return this.checkinRepo.updateConfig(data);
  }

  /**
   * 生成随机奖励
   *
   * @param min - 最小值（分）
   * @param max - 最大值（分）
   * @returns 随机奖励（分）
   */
  private generateRandomReward(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
