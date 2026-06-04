import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigEncryptionService } from './config-encryption.service';
import { SmtpConfig } from '@prisma/client';

/**
 * SMTP配置服务
 *
 * 管理SMTP邮件服务器配置，密码自动加解密。
 */
@Injectable()
export class SmtpConfigService {
  private readonly logger = new Logger(SmtpConfigService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly encryption: ConfigEncryptionService,
  ) {}

  /**
   * 获取SMTP配置（脱敏）
   */
  async getConfig(): Promise<SmtpConfig | null> {
    const config = await this.prisma.smtpConfig.findUnique({
      where: { name: 'default' },
    });

    if (!config) {
      return null;
    }

    return this.maskSensitiveFields(config);
  }

  /**
   * 获取SMTP配置（含解密，内部使用）
   */
  async getDecryptedConfig(): Promise<SmtpConfig | null> {
    const config = await this.prisma.smtpConfig.findUnique({
      where: { name: 'default' },
    });

    if (!config) {
      return null;
    }

    return this.decryptFields(config);
  }

  /**
   * 获取已启用的SMTP配置（含解密，内部使用）
   */
  async getEnabledConfig(): Promise<SmtpConfig | null> {
    const config = await this.prisma.smtpConfig.findUnique({
      where: { name: 'default', is_enabled: true },
    });

    if (!config) {
      return null;
    }

    return this.decryptFields(config);
  }

  /**
   * 更新SMTP配置
   */
  async update(data: {
    is_enabled?: boolean;
    host?: string;
    port?: number;
    secure?: boolean;
    username?: string;
    password?: string;
    from_name?: string;
    from_address?: string;
  }): Promise<SmtpConfig> {
    // 加密密码
    const updateData: any = { ...data };

    if (data.password !== undefined) {
      updateData.password = this.encryption.encrypt(data.password);
    }

    // 使用 upsert 确保配置存在
    const updated = await this.prisma.smtpConfig.upsert({
      where: { name: 'default' },
      update: updateData,
      create: {
        name: 'default',
        ...updateData,
        port: data.port || 587,
        secure: data.secure || false,
      },
    });

    this.logger.log('SMTP config updated');
    return this.maskSensitiveFields(updated);
  }

  /**
   * 切换启用状态
   */
  async toggle(): Promise<SmtpConfig> {
    const config = await this.prisma.smtpConfig.findUnique({
      where: { name: 'default' },
    });

    if (!config) {
      throw new NotFoundException('SMTP config not found');
    }

    const updated = await this.prisma.smtpConfig.update({
      where: { name: 'default' },
      data: { is_enabled: !config.is_enabled },
    });

    this.logger.log(`SMTP config ${updated.is_enabled ? 'enabled' : 'disabled'}`);
    return this.maskSensitiveFields(updated);
  }

  /**
   * 脱敏敏感字段
   */
  private maskSensitiveFields(config: SmtpConfig): SmtpConfig {
    return {
      ...config,
      password: config.password ? this.encryption.mask(config.password) : null,
    };
  }

  /**
   * 解密敏感字段
   */
  private decryptFields(config: SmtpConfig): SmtpConfig {
    return {
      ...config,
      password: config.password ? this.encryption.decrypt(config.password) : null,
    };
  }
}
