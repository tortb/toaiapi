import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { NotificationRepository } from './notification.repository';
import { NotificationDispatcherService } from './notification-dispatcher.service';
import { UpdateNotificationConfigDto } from './dto/notification-config.dto';

/**
 * 通知服务
 *
 * 核心职责：
 * 1. 通知配置管理
 * 2. 通知触发与分发
 * 3. 防刷机制
 */
@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  /** 防刷间隔（毫秒）- 30 分钟 */
  private readonly THROTTLE_INTERVAL = 30 * 60 * 1000;

  constructor(
    private readonly notificationRepo: NotificationRepository,
    private readonly dispatcher: NotificationDispatcherService,
  ) {}

  /**
   * 获取用户通知配置
   */
  async getConfig(userId: string) {
    const config = await this.notificationRepo.findByUserId(userId);

    if (!config) {
      return {
        email_enabled: false,
        webhook_enabled: false,
        webhook_url: null,
        wxpusher_enabled: false,
        wxpusher_uid: null,
        low_balance_threshold: 1000, // 默认 10 元
      };
    }

    // 解析 channels JSON
    const channels = config.channels ? JSON.parse(config.channels as string) : {};

    return {
      email_enabled: channels.email?.enabled ?? false,
      webhook_enabled: channels.webhook?.enabled ?? false,
      webhook_url: channels.webhook?.url ?? null,
      wxpusher_enabled: channels.wxpusher?.enabled ?? false,
      wxpusher_uid: channels.wxpusher?.uid ?? null,
      low_balance_threshold: config.low_balance_threshold,
    };
  }

  /**
   * 更新通知配置
   */
  async updateConfig(userId: string, dto: UpdateNotificationConfigDto) {
    return this.notificationRepo.upsert(userId, dto);
  }

  /**
   * 发送余额不足通知
   *
   * @param userId - 用户 ID
   * @param userEmail - 用户邮箱
   * @param currentBalance - 当前余额（分）
   */
  async sendLowBalanceNotification(userId: string, userEmail: string, currentBalance: number) {
    // 检查防刷
    const lastNotificationTime = await this.notificationRepo.getLastNotificationTime(userId, 'low_balance');
    if (lastNotificationTime) {
      const elapsed = Date.now() - lastNotificationTime.getTime();
      if (elapsed < this.THROTTLE_INTERVAL) {
        this.logger.debug(`Throttling low balance notification for user ${userId}`);
        return;
      }
    }

    // 获取配置
    const config = await this.notificationRepo.findByUserId(userId);
    if (!config) {
      return; // 无配置，不发送
    }

    // 解析 channels JSON
    const channels = config.channels ? JSON.parse(config.channels as string) : {};

    const balanceYuan = (currentBalance / 100).toFixed(2);
    const title = '余额不足提醒';
    const content = `您的账户余额不足，当前余额为 ¥${balanceYuan}，请及时充值以避免服务中断。`;

    // 并行发送到所有启用的渠道
    const tasks: Promise<void>[] = [];

    if (channels.email?.enabled) {
      tasks.push(
        this.dispatcher.sendEmail(userEmail, title, content).then((success) => {
          this.notificationRepo.createLog(userId, 'low_balance', 'email', success, content);
        }),
      );
    }

    if (channels.webhook?.enabled && channels.webhook?.url) {
      tasks.push(
        this.dispatcher
          .sendWebhook(channels.webhook.url, {
            type: 'low_balance',
            user_id: userId,
            balance: currentBalance,
            message: content,
          })
          .then((success) => {
            this.notificationRepo.createLog(userId, 'low_balance', 'webhook', success, content);
          }),
      );
    }

    if (channels.wxpusher?.enabled && channels.wxpusher?.uid) {
      tasks.push(
        this.dispatcher.sendWxPusher(channels.wxpusher.uid, title, content).then((success) => {
          this.notificationRepo.createLog(userId, 'low_balance', 'wxpusher', success, content);
        }),
      );
    }

    await Promise.allSettled(tasks);
    this.logger.log(`Low balance notification sent to user ${userId}`);
  }

  /**
   * 发送测试通知
   */
  async sendTestNotification(userId: string, userEmail: string, channel: string) {
    const config = await this.notificationRepo.findByUserId(userId);
    const channels = config?.channels ? JSON.parse(config.channels as string) : {};

    const title = '测试通知';
    const content = '这是一条来自 ToAIAPI 的测试通知，如果您收到此消息，说明通知配置正确。';

    let success = false;

    switch (channel) {
      case 'email':
        if (!channels.email?.enabled) {
          throw new BadRequestException('邮件通知未启用');
        }
        success = await this.dispatcher.sendEmail(userEmail, title, content);
        break;

      case 'webhook':
        if (!channels.webhook?.enabled || !channels.webhook?.url) {
          throw new BadRequestException('Webhook 通知未启用或未配置 URL');
        }
        success = await this.dispatcher.sendWebhook(channels.webhook.url, {
          type: 'test',
          user_id: userId,
          message: content,
        });
        break;

      case 'wxpusher':
        if (!channels.wxpusher?.enabled || !channels.wxpusher?.uid) {
          throw new BadRequestException('WxPusher 通知未启用或未配置 UID');
        }
        success = await this.dispatcher.sendWxPusher(channels.wxpusher.uid, title, content);
        break;

      default:
        throw new BadRequestException('不支持的通知渠道');
    }

    await this.notificationRepo.createLog(userId, 'test', channel, success, content);

    return { success, message: success ? '测试通知发送成功' : '测试通知发送失败' };
  }
}
