import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigEncryptionService } from './config-encryption.service';

/**
 * 系统设置服务（通用 KV 存储）
 *
 * 支持 15 个分类的系统参数配置。
 * 新增设置无需修改表结构，直接写入即可。
 */
@Injectable()
export class SystemSettingService {
  private readonly logger = new Logger(SystemSettingService.name);

  /** 需要加密存储的 key 列表 */
  private readonly ENCRYPTED_KEYS = new Set([
    'smtp_password',
    'epay_merchant_key',
    'epay_merchant_secret',
    'alipay_private_key',
    'alipay_public_key',
    'wechat_mch_key',
    'jwt_secret',
  ]);

  constructor(
    private readonly prisma: PrismaService,
    private readonly encryption: ConfigEncryptionService,
  ) {}

  /**
   * 获取所有设置（按分类分组）
   */
  async getAll(): Promise<Record<string, any[]>> {
    const settings = await this.prisma.systemSetting.findMany({
      orderBy: [{ category: 'asc' }, { key: 'asc' }],
    });

    const grouped: Record<string, any[]> = {};
    for (const s of settings) {
      if (!grouped[s.category]) grouped[s.category] = [];
      grouped[s.category]!.push(this.toResponse(s));
    }
    return grouped;
  }

  /**
   * 按分类获取设置
   */
  async getByCategory(category: string): Promise<any[]> {
    const settings = await this.prisma.systemSetting.findMany({
      where: { category },
      orderBy: { key: 'asc' },
    });
    return settings.map((s) => this.toResponse(s));
  }

  /**
   * 获取单个设置值
   */
  async getByKey(key: string): Promise<string | null> {
    const setting = await this.prisma.systemSetting.findUnique({
      where: { key },
    });
    return setting?.value ?? null;
  }

  /**
   * 获取单个设置值并按 type 解析
   */
  async getTypedByKey<T = string>(key: string, defaultValue?: T): Promise<T | null> {
    const setting = await this.prisma.systemSetting.findUnique({
      where: { key },
    });
    if (!setting || setting.value === null || setting.value === undefined) {
      return defaultValue ?? null;
    }
    return this.parseValue<T>(setting.value, setting.type);
  }

  /**
   * 创建或更新单个设置
   */
  async upsert(category: string, key: string, value: string | null, type: string = 'string'): Promise<any> {
    let storedValue = value;

    // 加密敏感字段
    if (this.ENCRYPTED_KEYS.has(key) && value) {
      storedValue = this.encryption.encrypt(value);
    }

    const setting = await this.prisma.systemSetting.upsert({
      where: { key },
      create: { category, key, value: storedValue, type },
      update: { value: storedValue, type, updated_at: new Date() },
    });

    this.logger.log(`Setting "${key}" upserted`);
    return this.toResponse(setting);
  }

  /**
   * 批量更新某分类下的设置
   */
  async bulkUpdate(category: string, settings: Array<{ key: string; value: string | null }>): Promise<void> {
    for (const { key, value } of settings) {
      // 保留原有的 type，如果不存在则默认 string
      const existing = await this.prisma.systemSetting.findUnique({ where: { key } });
      const type = existing?.type ?? 'string';

      let storedValue = value;
      if (this.ENCRYPTED_KEYS.has(key) && value) {
        storedValue = this.encryption.encrypt(value);
      }

      await this.prisma.systemSetting.upsert({
        where: { key },
        create: { category, key, value: storedValue, type },
        update: { value: storedValue, updated_at: new Date() },
      });
    }
    this.logger.log(`Bulk updated ${settings.length} settings in category "${category}"`);
  }

  /**
   * 删除设置
   */
  async deleteByKey(key: string): Promise<void> {
    const existing = await this.prisma.systemSetting.findUnique({ where: { key } });
    if (!existing) {
      throw new NotFoundException(`Setting "${key}" not found`);
    }
    await this.prisma.systemSetting.delete({ where: { key } });
    this.logger.log(`Setting "${key}" deleted`);
  }

  /**
   * 种子数据：批量初始化默认设置（跳过已存在的）
   */
  async seed(category: string, defaults: Array<{ key: string; value: string; type?: string }>): Promise<number> {
    let created = 0;
    for (const { key, value, type } of defaults) {
      const existing = await this.prisma.systemSetting.findUnique({ where: { key } });
      if (!existing) {
        await this.prisma.systemSetting.create({
          data: { category, key, value, type: type ?? 'string' },
        });
        created++;
      }
    }
    if (created > 0) {
      this.logger.log(`Seeded ${created} settings for category "${category}"`);
    }
    return created;
  }

  /**
   * 响应格式化（敏感字段脱敏）
   */
  private toResponse(setting: any): any {
    let value = setting.value;
    if (this.ENCRYPTED_KEYS.has(setting.key) && value) {
      value = this.encryption.mask(value);
    }
    return {
      category: setting.category,
      key: setting.key,
      value,
      type: setting.type,
    };
  }

  /**
   * 按 type 解析值
   */
  private parseValue<T>(value: string, type: string): T {
    switch (type) {
      case 'number':
        return Number(value) as T;
      case 'boolean':
        return (value === 'true' || value === '1') as T;
      case 'json':
        return JSON.parse(value) as T;
      default:
        return value as T;
    }
  }
}
