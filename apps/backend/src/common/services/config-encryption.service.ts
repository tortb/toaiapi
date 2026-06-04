import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

/**
 * 配置加密服务
 *
 * 使用 AES-256-GCM 算法加密敏感配置字段。
 * 用于支付配置和SMTP配置中的密码、密钥等敏感信息。
 *
 * SECURITY: 加密密钥必须通过环境变量 ENCRYPTION_KEY 提供
 */
@Injectable()
export class ConfigEncryptionService {
  private readonly logger = new Logger(ConfigEncryptionService.name);
  private readonly encryptionKey: Buffer;

  constructor(private readonly config: ConfigService) {
    const key = this.config.get<string>('ENCRYPTION_KEY');
    if (!key) {
      throw new Error('ENCRYPTION_KEY environment variable is required');
    }

    // 支持 hex 和 base64 格式的密钥
    if (key.length === 64) {
      // hex 格式，32字节
      this.encryptionKey = Buffer.from(key, 'hex');
    } else if (key.length === 44) {
      // base64 格式，32字节
      this.encryptionKey = Buffer.from(key, 'base64');
    } else {
      throw new Error('ENCRYPTION_KEY must be 32 bytes (64 hex chars or 44 base64 chars)');
    }

    if (this.encryptionKey.length !== 32) {
      throw new Error('ENCRYPTION_KEY must be exactly 32 bytes');
    }

    this.logger.log('Config encryption service initialized');
  }

  /**
   * 加密文本
   *
   * @param plaintext - 明文
   * @returns 加密后的 base64 字符串（格式: IV + AuthTag + Ciphertext）
   */
  encrypt(plaintext: string | null | undefined): string | null {
    if (!plaintext) {
      return null;
    }

    try {
      // 生成随机 IV（12字节）
      const iv = randomBytes(12);

      // 创建加密器
      const cipher = createCipheriv('aes-256-gcm', this.encryptionKey, iv);

      // 加密数据
      const encrypted = Buffer.concat([
        cipher.update(plaintext, 'utf8'),
        cipher.final(),
      ]);

      // 获取认证标签
      const authTag = cipher.getAuthTag();

      // 组合: IV (12) + AuthTag (16) + Encrypted Data
      const result = Buffer.concat([iv, authTag, encrypted]);

      return result.toString('base64');
    } catch (error) {
      this.logger.error(`Encryption failed: ${error}`);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * 解密文本
   *
   * @param ciphertext - base64 加密字符串
   * @returns 解密后的明文
   */
  decrypt(ciphertext: string | null | undefined): string | null {
    if (!ciphertext) {
      return null;
    }

    try {
      // 解析 base64
      const data = Buffer.from(ciphertext, 'base64');

      // 验证最小长度 (IV: 12 + AuthTag: 16 + 至少1字节数据)
      if (data.length < 29) {
        throw new Error('Invalid encrypted data format');
      }

      // 提取 IV、AuthTag 和加密数据
      const iv = data.subarray(0, 12);
      const authTag = data.subarray(12, 28);
      const encrypted = data.subarray(28);

      // 创建解密器
      const decipher = createDecipheriv('aes-256-gcm', this.encryptionKey, iv);
      decipher.setAuthTag(authTag);

      // 解密数据
      const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final(),
      ]);

      return decrypted.toString('utf8');
    } catch (error) {
      this.logger.error(`Decryption failed: ${error}`);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * 脱敏显示（用于API返回）
   *
   * @param value - 原始值
   * @param visibleChars - 可见字符数（默认4）
   * @returns 脱敏后的字符串
   */
  mask(value: string | null | undefined, visibleChars: number = 4): string {
    if (!value) {
      return '';
    }

    if (value.length <= visibleChars) {
      return '*'.repeat(8);
    }

    const masked = '*'.repeat(8);
    const visible = value.slice(-visibleChars);
    return `${masked}${visible}`;
  }
}
