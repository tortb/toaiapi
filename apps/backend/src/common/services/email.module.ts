import { Module, Global } from '@nestjs/common';
import { EmailService } from './email.service';
import { ConfigModule } from './config.module';

/**
 * 邮件模块（全局）
 *
 * 注册为全局模块，任何模块注入 EmailService 即可使用。
 * SmtpConfigService 由 ConfigModule 提供，避免重复注册。
 */
@Global()
@Module({
  imports: [ConfigModule],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
