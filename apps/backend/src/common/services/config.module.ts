import { Module, Global } from '@nestjs/common';
import { ConfigEncryptionService } from './config-encryption.service';
import { PaymentConfigService } from './payment-config.service';
import { SmtpConfigService } from './smtp-config.service';
import { SmsConfigService } from './sms-config.service';
import { SmsService } from './sms.service';
import { SystemSettingService } from './system-setting.service';

/**
 * 配置服务模块（全局）
 *
 * 提供配置加密、支付配置、SMTP配置、短信配置、系统参数服务。
 * 注册为全局模块，任何模块注入即可使用。
 */
@Global()
@Module({
  providers: [
    ConfigEncryptionService,
    PaymentConfigService,
    SmtpConfigService,
    SmsConfigService,
    SmsService,
    SystemSettingService,
  ],
  exports: [
    ConfigEncryptionService,
    PaymentConfigService,
    SmtpConfigService,
    SmsConfigService,
    SmsService,
    SystemSettingService,
  ],
})
export class ConfigModule {}
