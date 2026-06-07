import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * 通知配置数据访问层
 */
@Injectable()
export class NotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 获取用户通知配置
   */
  async findByUserId(userId: string) {
    return this.prisma.notificationConfig.findUnique({
      where: { user_id: userId },
    });
  }

  /**
   * 创建或更新通知配置
   */
  async upsert(userId: string, config: any) {
    // 解析现有 channels JSON
    const existing = await this.findByUserId(userId);
    const currentChannels = existing?.channels ? JSON.parse(existing.channels as string) : {};

    // 合并更新
    const updatedChannels = {
      ...currentChannels,
      email: {
        enabled: config.email_enabled ?? currentChannels.email?.enabled ?? false,
      },
      webhook: {
        enabled: config.webhook_enabled ?? currentChannels.webhook?.enabled ?? false,
        url: config.webhook_url ?? currentChannels.webhook?.url ?? null,
      },
      wxpusher: {
        enabled: config.wxpusher_enabled ?? currentChannels.wxpusher?.enabled ?? false,
        uid: config.wxpusher_uid ?? currentChannels.wxpusher?.uid ?? null,
      },
    };

    return this.prisma.notificationConfig.upsert({
      where: { user_id: userId },
      update: {
        channels: JSON.stringify(updatedChannels),
        low_balance_threshold: config.low_balance_threshold ?? undefined,
        updated_at: new Date(),
      },
      create: {
        user_id: userId,
        channels: JSON.stringify(updatedChannels),
        low_balance_threshold: config.low_balance_threshold ?? 1000,
      },
    });
  }

  /**
   * 记录通知历史
   */
  async createLog(userId: string, type: string, channel: string, success: boolean, content?: string, error?: string) {
    // NotificationLog 表不存在，暂时跳过日志记录
    // 未来可以通过 notification_configs 的 JSON 字段或创建新表来存储日志
    return null;
  }

  /**
   * 获取最近一次通知时间
   */
  async getLastNotificationTime(userId: string, type: string): Promise<Date | null> {
    // NotificationLog 表不存在，暂时返回 null（不进行防刷限制）
    return null;
  }
}
