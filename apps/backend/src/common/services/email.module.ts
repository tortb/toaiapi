import { Module, Global } from '@nestjs/common';
import { EmailService } from './email.service';
import { SmtpConfigService } from './smtp-config.service';

/**
 * 邮件模块（全局）
 *
 * 注册为全局模块，任何模块注入 EmailService 即可使用。
 */
@Global()
@Module({
  providers: [EmailService, SmtpConfigService],
  exports: [EmailService],
})
export class EmailModule {}
