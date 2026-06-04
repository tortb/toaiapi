import { Module, Global } from '@nestjs/common';
import { ConfigEncryptionService } from './config-encryption.service';
import { PaymentConfigService } from './payment-config.service';
import { SmtpConfigService } from './smtp-config.service';

/**
 * 配置服务模块（全局）
 *
 * 提供配置加密、支付配置、SMTP配置服务。
 * 注册为全局模块，任何模块注入即可使用。
 */
@Global()
@Module({
  providers: [ConfigEncryptionService, PaymentConfigService, SmtpConfigService],
  exports: [ConfigEncryptionService, PaymentConfigService, SmtpConfigService],
})
export class ConfigModule {}
