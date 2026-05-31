import { OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
/**
 * Redis 服务
 *
 * 封装 ioredis，提供常用操作和分布式锁支持。
 * 用于缓存、限流、Session 管理等场景。
 */
export declare class RedisService implements OnModuleDestroy {
    private readonly configService;
    private readonly client;
    private readonly logger;
    constructor(configService: ConfigService);
    onModuleDestroy(): Promise<void>;
    /**
     * 获取原始 Redis 客户端
     */
    getClient(): Redis;
    /**
     * 设置键值对
     */
    set(key: string, value: string, ttlSeconds?: number): Promise<void>;
    /**
     * 获取值
     */
    get(key: string): Promise<string | null>;
    /**
     * 删除键
     */
    del(key: string): Promise<void>;
    /**
     * 检查键是否存在
     */
    exists(key: string): Promise<boolean>;
    /**
     * 设置过期时间
     */
    expire(key: string, seconds: number): Promise<void>;
    /**
     * 自增
     */
    incr(key: string): Promise<number>;
    /**
     * 自增指定值
     */
    incrby(key: string, increment: number): Promise<number>;
    /**
     * 获取自增值
     */
    getCounter(key: string): Promise<number>;
    /**
     * 分布式锁 - 获取锁
     *
     * @param key - 锁的键
     * @param ttlSeconds - 锁的过期时间（秒）
     * @returns 锁的标识符，释放时需要传入
     */
    acquireLock(key: string, ttlSeconds: number): Promise<string | null>;
    /**
     * 分布式锁 - 释放锁
     *
     * 使用 Lua 脚本保证原子性：只有持有者才能释放锁。
     */
    releaseLock(key: string, lockValue: string): Promise<boolean>;
    /**
     * 设置 JSON 对象
     */
    setJson<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
    /**
     * 获取 JSON 对象
     */
    getJson<T>(key: string): Promise<T | null>;
}
//# sourceMappingURL=redis.service.d.ts.map