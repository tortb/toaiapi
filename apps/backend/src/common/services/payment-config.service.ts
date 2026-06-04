import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigEncryptionService } from './config-encryption.service';
import { PaymentConfig } from '@prisma/client';

/**
 * 支付配置服务
 *
 * 管理支付渠道配置，敏感字段自动加解密。
 */
@Injectable()
export class PaymentConfigService {
  private readonly logger = new Logger(PaymentConfigService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly encryption: ConfigEncryptionService,
  ) {}

  /**
   * 获取所有支付配置（脱敏）
   */
  async findAll(): Promise<PaymentConfig[]> {
    const configs = await this.prisma.paymentConfig.findMany({
      orderBy: { name: 'asc' },
    });

    return configs.map((config) => this.maskSensitiveFields(config));
  }

  /**
   * 获取单个支付配置（脱敏）
   */
  async findByName(name: string): Promise<PaymentConfig> {
    const config = await this.prisma.paymentConfig.findUnique({
      where: { name },
    });

    if (!config) {
      throw new NotFoundException(`Payment config "${name}" not found`);
    }

    return this.maskSensitiveFields(config);
  }

  /**
   * 获取支付配置（含解密，内部使用）
   */
  async findDecryptedByName(name: string): Promise<PaymentConfig> {
    const config = await this.prisma.paymentConfig.findUnique({
      where: { name },
    });

    if (!config) {
      throw new NotFoundException(`Payment config "${name}" not found`);
    }

    return this.decryptFields(config);
  }

  /**
   * 获取已启用的支付配置（含解密，内部使用）
   */
  async findEnabledByName(name: string): Promise<PaymentConfig | null> {
    const config = await this.prisma.paymentConfig.findUnique({
      where: { name, is_enabled: true },
    });

    if (!config) {
      return null;
    }

    return this.decryptFields(config);
  }

  /**
   * 更新支付配置
   */
  async update(
    name: string,
    data: {
      display_name?: string;
      is_enabled?: boolean;
      merchant_id?: string;
      merchant_key?: string;
      merchant_secret?: string;
      api_endpoint?: string;
      notify_url?: string;
      return_url?: string;
      extra_config?: Record<string, any>;
    },
  ): Promise<PaymentConfig> {
    const existing = await this.prisma.paymentConfig.findUnique({
      where: { name },
    });

    if (!existing) {
      throw new NotFoundException(`Payment config "${name}" not found`);
    }

    // 加密敏感字段
    const updateData: any = { ...data };

    if (data.merchant_key !== undefined) {
      updateData.merchant_key = this.encryption.encrypt(data.merchant_key);
    }

    if (data.merchant_secret !== undefined) {
      updateData.merchant_secret = this.encryption.encrypt(data.merchant_secret);
    }

    const updated = await this.prisma.paymentConfig.update({
      where: { name },
      data: updateData,
    });

    this.logger.log(`Payment config "${name}" updated`);
    return this.maskSensitiveFields(updated);
  }

  /**
   * 切换启用状态
   */
  async toggle(name: string): Promise<PaymentConfig> {
    const config = await this.prisma.paymentConfig.findUnique({
      where: { name },
    });

    if (!config) {
      throw new NotFoundException(`Payment config "${name}" not found`);
    }

    const updated = await this.prisma.paymentConfig.update({
      where: { name },
      data: { is_enabled: !config.is_enabled },
    });

    this.logger.log(`Payment config "${name}" ${updated.is_enabled ? 'enabled' : 'disabled'}`);
    return this.maskSensitiveFields(updated);
  }

  /**
   * 获取所有已启用的支付方式
   */
  async getEnabledMethods(): Promise<Array<{ name: string; display_name: string }>> {
    const configs = await this.prisma.paymentConfig.findMany({
      where: { is_enabled: true },
      select: { name: true, display_name: true },
    });

    return configs;
  }

  /**
   * 脱敏敏感字段
   */
  private maskSensitiveFields(config: PaymentConfig): PaymentConfig {
    return {
      ...config,
      merchant_key: config.merchant_key ? this.encryption.mask(config.merchant_key) : null,
      merchant_secret: config.merchant_secret ? this.encryption.mask(config.merchant_secret) : null,
    };
  }

  /**
   * 解密敏感字段
   */
  private decryptFields(config: PaymentConfig): PaymentConfig {
    return {
      ...config,
      merchant_key: config.merchant_key ? this.encryption.decrypt(config.merchant_key) : null,
      merchant_secret: config.merchant_secret ? this.encryption.decrypt(config.merchant_secret) : null,
    };
  }
}
