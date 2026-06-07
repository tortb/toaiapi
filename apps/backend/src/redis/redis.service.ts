import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

/**
 * Redis 服务
 *
 * 封装 ioredis，提供常用操作和分布式锁支持。
 * 用于缓存、限流、Session 管理等场景。
 */
@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly client: Redis;
  private readonly logger = new Logger(RedisService.name);

  constructor(private readonly configService: ConfigService) {
    this.client = new Redis({
      host: this.configService.get<string>('REDIS_HOST', 'localhost'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
      password: this.configService.get<string>('REDIS_PASSWORD'),
      db: this.configService.get<number>('REDIS_DB', 0),
      maxRetriesPerRequest: 3,
      connectTimeout: 5000,        // 5秒连接超时
      commandTimeout: 3000,        // 3秒命令超时
      enableOfflineQueue: false,   // 未连接时不排队命令
      lazyConnect: true,
      retryStrategy(times: number): number | null {
        if (times > 3) {
          return null;
        }
        return Math.min(times * 200, 2000);
      },
    });

    this.client.on('connect', () => {
      this.logger.log('Redis connected');
    });

    this.client.on('error', (error: Error) => {
      this.logger.warn(`Redis error (non-fatal): ${error.message}`);
    });

    // 启动时异步测试连接（不阻塞主流程）
    this.testConnection();
  }

  /**
   * 启动时异步测试连接（不阻塞主流程）
   */
  private async testConnection(): Promise<void> {
    try {
      await this.client.connect();
      await this.client.ping();
      this.logger.log('Redis health check passed');
    } catch (error) {
      this.logger.warn('Redis unavailable - caching disabled');
      // 不抛出错误，允许应用在无Redis情况下运行
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.quit();
  }

  /**
   * 获取原始 Redis 客户端
   */
  getClient(): Redis {
    return this.client;
  }

  /**
   * 设置键值对
   */
  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    try {
      if (ttlSeconds != null && ttlSeconds > 0) {
        await this.client.set(key, value, 'EX', ttlSeconds);
      } else {
        await this.client.set(key, value);
      }
    } catch {
      // Redis unavailable, silently ignore
    }
  }

  /**
   * 获取值
   */
  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  /**
   * 删除键
   */
  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch {
      // Redis unavailable, silently ignore
    }
  }

  /**
   * 检查键是否存在
   */
  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  /**
   * 设置过期时间
   */
  async expire(key: string, seconds: number): Promise<void> {
    try {
      await this.client.expire(key, seconds);
    } catch {
      // Redis unavailable, silently ignore
    }
  }

  /**
   * 自增
   */
  async incr(key: string): Promise<number> {
    try {
      return await this.client.incr(key);
    } catch {
      return 0;
    }
  }

  /**
   * 自增指定值
   */
  async incrby(key: string, increment: number): Promise<number> {
    return this.client.incrby(key, increment);
  }

  /**
   * 获取自增值
   */
  async getCounter(key: string): Promise<number> {
    try {
      const value = await this.client.get(key);
      return value ? parseInt(value, 10) : 0;
    } catch {
      return 0;
    }
  }

  /**
   * Ping 测试连接
   */
  async ping(): Promise<boolean> {
    const result = await this.client.ping();
    return result === 'PONG';
  }

  /**
   * 分布式锁 - 获取锁
   *
   * @param key - 锁的键
   * @param ttlSeconds - 锁的过期时间（秒）
   * @returns 锁的标识符，释放时需要传入
   */
  async acquireLock(key: string, ttlSeconds: number): Promise<string | null> {
    const lockValue = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const result = await this.client.set(
      `lock:${key}`,
      lockValue,
      'EX',
      ttlSeconds,
      'NX',
    );
    return result === 'OK' ? lockValue : null;
  }

  /**
   * 分布式锁 - 释放锁
   *
   * 使用 Lua 脚本保证原子性：只有持有者才能释放锁。
   */
  async releaseLock(key: string, lockValue: string): Promise<boolean> {
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;
    const result = await this.client.eval(
      script,
      1,
      `lock:${key}`,
      lockValue,
    );
    return result === 1;
  }

  /**
   * 设置 JSON 对象
   */
  async setJson<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const json = JSON.stringify(value);
    await this.set(key, json, ttlSeconds);
  }

  /**
   * 获取 JSON 对象
   */
  async getJson<T>(key: string): Promise<T | null> {
    const json = await this.get(key);
    if (!json) {
      return null;
    }
    try {
      return JSON.parse(json) as T;
    } catch {
      return null;
    }
  }
}
