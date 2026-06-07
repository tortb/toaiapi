import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * 邀请数据仓库
 */
@Injectable()
export class InviteRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 根据邀请码查找用户
   */
  async findUserByInviteCode(inviteCode: string) {
    return this.prisma.user.findUnique({
      where: { invite_code: inviteCode },
      select: {
        id: true,
        email: true,
        display_name: true,
        invite_code: true,
      },
    });
  }

  /**
   * 创建邀请记录
   */
  async createInviteRecord(inviterId: string, inviteeId: string) {
    return this.prisma.inviteRecord.create({
      data: {
        inviter_id: inviterId,
        invitee_id: inviteeId,
        reward: 0,
        pending_reward: 0,
        recharge_count: 0,
      },
    });
  }

  /**
   * 查找邀请记录（通过被邀请人 ID）
   */
  async findByInviteeId(inviteeId: string) {
    return this.prisma.inviteRecord.findUnique({
      where: { invitee_id: inviteeId },
      include: {
        inviter: {
          select: { id: true, email: true, display_name: true },
        },
        invitee: {
          select: { id: true, email: true, display_name: true },
        },
      },
    });
  }

  /**
   * 获取用户的邀请记录列表（作为邀请人）
   */
  async findByInviterId(inviterId: string) {
    return this.prisma.inviteRecord.findMany({
      where: { inviter_id: inviterId },
      include: {
        invitee: {
          select: {
            id: true,
            email: true,
            display_name: true,
            created_at: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  /**
   * 更新邀请记录奖励
   */
  async updateReward(recordId: string, data: {
    reward?: number;
    pending_reward?: number;
    recharge_count?: number;
  }) {
    return this.prisma.inviteRecord.update({
      where: { id: recordId },
      data: {
        ...(data.reward !== undefined && { reward: { increment: data.reward } }),
        ...(data.pending_reward !== undefined && { pending_reward: data.pending_reward }),
        ...(data.recharge_count !== undefined && { recharge_count: { increment: 1 } }),
      },
    });
  }

  /**
   * 获取用户的邀请统计
   */
  async getInviteStats(userId: string) {
    const records = await this.prisma.inviteRecord.findMany({
      where: { inviter_id: userId },
    });

    const totalInvites = records.length;
    const totalReward = records.reduce((sum, r) => sum + r.reward, 0);
    const pendingReward = records.reduce((sum, r) => sum + r.pending_reward, 0);

    return {
      totalInvites,
      totalReward,
      pendingReward,
    };
  }

  /**
   * 检查用户是否已设置邀请码
   */
  async hasInviteCode(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { invite_code: true },
    });
    return !!user?.invite_code;
  }

  /**
   * 为用户生成并保存邀请码
   */
  async setInviteCode(userId: string, inviteCode: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { invite_code: inviteCode },
    });
  }

  /**
   * 检查邀请码是否已存在
   */
  async inviteCodeExists(inviteCode: string): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: { invite_code: inviteCode },
    });
    return count > 0;
  }
}
