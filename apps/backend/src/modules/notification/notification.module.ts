import { Module, forwardRef } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { NotificationRepository } from './notification.repository';
import { NotificationDispatcherService } from './notification-dispatcher.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { EmailModule } from '../../common/services/email.module';

/**
 * 通知模块
 *
 * 提供通知配置与分发功能：
 * - 邮件通知
 * - Webhook 通知
 * - WxPusher 通知
 * - 余额不足告警
 */
@Module({
  imports: [PrismaModule, EmailModule],
  controllers: [NotificationController],
  providers: [NotificationService, NotificationRepository, NotificationDispatcherService],
  exports: [NotificationService],
})
export class NotificationModule {}
