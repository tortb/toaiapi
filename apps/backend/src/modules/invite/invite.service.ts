import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InviteRepository } from './invite.repository';
import { BalanceService } from '../balance/balance.service';

/**
 * 邀请奖励业务服务
 *
 * 核心职责：
 * 1. 邀请码生成与管理
 * 2. 邀请关系绑定
 * 3. 邀请奖励计算与发放
 * 4. 邀请统计查询
 */
@Injectable()
export class InviteService {
  private readonly logger = new Logger(InviteService.name);

  /** 新用户注册奖励（分） */
  private readonly NEW_USER_REWARD = 5000; // 50元

  /** 邀请人首次邀请奖励（分） */
  private readonly INVITER_FIRST_REWARD = 10000; // 100元

  /** 被邀请人充值返现比例 */
  private readonly RECHARGE_REWARD_RATE = 0.1; // 10%

  constructor(
    private readonly inviteRepo: InviteRepository,
    private readonly balanceService: BalanceService,
  ) {}

  /**
   * 获取或生成用户的邀请码
   *
   * @param userId - 用户 ID
   * @returns 邀请码和邀请链接
   */
  async getInviteCode(userId: string) {
    // 检查用户是否已有邀请码
    const user = await this.inviteRepo.findUserByInviteCode('');

    let inviteCode: string;
    const hasCode = await this.inviteRepo.hasInviteCode(userId);

    if (hasCode) {
      const userData = await this.inviteRepo.findUserByInviteCode('');
      // 需要实际查询用户的邀请码
      const userRecord = await this.inviteRepo['prisma'].user.findUnique({
        where: { id: userId },
        select: { invite_code: true },
      });
      inviteCode = userRecord?.invite_code || '';
    } else {
      // 生成新的邀请码
      inviteCode = await this.generateUniqueInviteCode(userId);
    }

    // 构建邀请链接
    const inviteLink = `${process.env['FRONTEND_URL'] || 'http://localhost:3000'}/register?invite=${inviteCode}`;

    return {
      inviteCode,
      inviteLink,
    };
  }

  /**
   * 绑定邀请关系（用户注册时调用）
   *
   * @param inviteeId - 被邀请人 ID
   * @param inviteCode - 邀请码
   */
  async bindInviteRelation(inviteeId: string, inviteCode: string) {
    if (!inviteCode) {
      return; // 没有邀请码，不建立关系
    }

    // 查找邀请人
    const inviter = await this.inviteRepo.findUserByInviteCode(inviteCode);
    if (!inviter) {
      throw new BadRequestException('邀请码无效');
    }

    // 不能自己邀请自己
    if (inviter.id === inviteeId) {
      throw new BadRequestException('不能使用自己的邀请码');
    }

    // 检查是否已有邀请记录
    const existingRecord = await this.inviteRepo.findByInviteeId(inviteeId);
    if (existingRecord) {
      throw new BadRequestException('该用户已被邀请');
    }

    try {
      // 创建邀请记录
      await this.inviteRepo.createInviteRecord(inviter.id, inviteeId);

      // 给新用户发放注册奖励
      await this.balanceService.addBalance(
        inviteeId,
        this.NEW_USER_REWARD,
        `新用户注册奖励`,
      );

      // 给邀请人发放首次邀请奖励
      await this.balanceService.addBalance(
        inviter.id,
        this.INVITER_FIRST_REWARD,
        `邀请新用户奖励`,
      );

      this.logger.log(
        `Invite relation created: inviter=${inviter.id}, invitee=${inviteeId}`,
      );
    } catch (error) {
      this.logger.error(`Failed to bind invite relation: ${error}`);
      throw new BadRequestException('绑定邀请关系失败');
    }
  }

  /**
   * 处理被邀请人充值返现
   *
   * @param inviteeId - 被邀请人 ID
   * @param rechargeAmount - 充值金额（分）
   */
  async handleRechargeReward(inviteeId: string, rechargeAmount: number) {
    // 查找邀请记录
    const record = await this.inviteRepo.findByInviteeId(inviteeId);
    if (!record) {
      return; // 没有邀请关系，无需处理
    }

    // 计算返现金额（10%）
    const rewardAmount = Math.floor(rechargeAmount * this.RECHARGE_REWARD_RATE);

    try {
      // 更新邀请记录
      await this.inviteRepo.updateReward(record.id, {
        reward: rewardAmount,
        recharge_count: 1,
      });

      // 给邀请人发放奖励
      await this.balanceService.addBalance(
        record.inviter_id,
        rewardAmount,
        `邀请返现：${record.invitee.email || '用户'} 充值`,
      );

      this.logger.log(
        `Recharge reward: inviter=${record.inviter_id}, amount=${rewardAmount / 100}元`,
      );
    } catch (error) {
      this.logger.error(`Failed to handle recharge reward: ${error}`);
    }
  }

  /**
   * 获取用户的邀请记录
   */
  async getInviteRecords(userId: string) {
    return this.inviteRepo.findByInviterId(userId);
  }

  /**
   * 获取用户的邀请统计
   */
  async getInviteStats(userId: string) {
    return this.inviteRepo.getInviteStats(userId);
  }

  /**
   * 生成唯一的邀请码
   */
  private async generateUniqueInviteCode(userId: string): Promise<string> {
    let inviteCode: string;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      inviteCode = this.generateRandomCode();
      attempts++;

      if (attempts > maxAttempts) {
        throw new BadRequestException('生成邀请码失败，请稍后再试');
      }
    } while (await this.inviteRepo.inviteCodeExists(inviteCode));

    // 保存邀请码到用户表
    await this.inviteRepo.setInviteCode(userId, inviteCode);

    return inviteCode;
  }

  /**
   * 生成随机邀请码
   * 格式：6位大写字母+数字
   */
  private generateRandomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
}
