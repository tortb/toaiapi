import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigEncryptionService } from './config-encryption.service';
import { SmsConfig } from '@prisma/client';

/**
 * 短信配置服务
 *
 * 管理阿里云短信服务配置，access_key_secret 自动加解密。
 * SECURITY: access_key_secret 使用 AES-256-GCM 加密存储。
 */
@Injectable()
export class SmsConfigService {
  private readonly logger = new Logger(SmsConfigService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly encryption: ConfigEncryptionService,
  ) {}

  /**
   * 获取短信配置（脱敏）
   */
  async getConfig(): Promise<SmsConfig | null> {
    const config = await this.prisma.smsConfig.findUnique({
      where: { name: 'default' },
    });

    if (!config) {
      return null;
    }

    return this.maskSensitiveFields(config);
  }

  /**
   * 获取短信配置（含解密，内部使用）
   */
  async getDecryptedConfig(): Promise<SmsConfig | null> {
    const config = await this.prisma.smsConfig.findUnique({
      where: { name: 'default' },
    });

    if (!config) {
      return null;
    }

    return this.decryptFields(config);
  }

  /**
   * 获取已启用的短信配置（含解密，内部使用）
   */
  async getEnabledConfig(): Promise<SmsConfig | null> {
    const config = await this.prisma.smsConfig.findUnique({
      where: { name: 'default', is_enabled: true },
    });

    if (!config) {
      return null;
    }

    return this.decryptFields(config);
  }

  /**
   * 更新短信配置
   */
  async update(data: {
    is_enabled?: boolean;
    display_name?: string;
    access_key_id?: string;
    access_key_secret?: string;
    sign_name?: string;
    template_code?: string;
  }): Promise<SmsConfig> {
    const updateData: Record<string, unknown> = { ...data };

    // 加密 access_key_secret
    if (data.access_key_secret !== undefined) {
      updateData['access_key_secret'] = this.encryption.encrypt(data.access_key_secret);
    }

    // 使用 upsert 确保配置存在
    const updated = await this.prisma.smsConfig.upsert({
      where: { name: 'default' },
      update: updateData,
      create: {
        name: 'default',
        display_name: data.display_name || '阿里云短信',
        ...updateData,
      },
    });

    this.logger.log('SMS config updated');
    return this.maskSensitiveFields(updated);
  }

  /**
   * 切换启用状态
   */
  async toggle(): Promise<SmsConfig> {
    const config = await this.prisma.smsConfig.findUnique({
      where: { name: 'default' },
    });

    if (!config) {
      throw new NotFoundException('SMS config not found');
    }

    const updated = await this.prisma.smsConfig.update({
      where: { name: 'default' },
      data: { is_enabled: !config.is_enabled },
    });

    this.logger.log(`SMS config ${updated.is_enabled ? 'enabled' : 'disabled'}`);
    return this.maskSensitiveFields(updated);
  }

  /**
   * 脱敏敏感字段
   */
  private maskSensitiveFields(config: SmsConfig): SmsConfig {
    return {
      ...config,
      access_key_secret: config.access_key_secret
        ? this.encryption.mask(config.access_key_secret)
        : null,
    };
  }

  /**
   * 解密敏感字段
   */
  private decryptFields(config: SmsConfig): SmsConfig {
    return {
      ...config,
      access_key_secret: config.access_key_secret
        ? this.encryption.decrypt(config.access_key_secret)
        : null,
    };
  }
}
