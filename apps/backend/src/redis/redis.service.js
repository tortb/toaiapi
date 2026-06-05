var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
import { Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';
/**
 * Redis 服务
 *
 * 封装 ioredis，提供常用操作和分布式锁支持。
 * 用于缓存、限流、Session 管理等场景。
 */
let RedisService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var RedisService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            RedisService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        configService;
        client;
        logger = new Logger(RedisService.name);
        constructor(configService) {
            this.configService = configService;
            this.client = new Redis({
                host: this.configService.get('REDIS_HOST', 'localhost'),
                port: this.configService.get('REDIS_PORT', 6379),
                password: this.configService.get('REDIS_PASSWORD'),
                db: this.configService.get('REDIS_DB', 0),
                maxRetriesPerRequest: 3,
                retryStrategy(times) {
                    if (times > 3) {
                        return null;
                    }
                    return Math.min(times * 200, 2000);
                },
            });
            this.client.on('connect', () => {
                this.logger.log('Redis connected');
            });
            this.client.on('error', (error) => {
                this.logger.error('Redis error', error.message);
            });
        }
        async onModuleDestroy() {
            await this.client.quit();
        }
        /**
         * 获取原始 Redis 客户端
         */
        getClient() {
            return this.client;
        }
        /**
         * 设置键值对
         */
        async set(key, value, ttlSeconds) {
            if (ttlSeconds != null && ttlSeconds > 0) {
                await this.client.set(key, value, 'EX', ttlSeconds);
            }
            else {
                await this.client.set(key, value);
            }
        }
        /**
         * 获取值
         */
        async get(key) {
            return this.client.get(key);
        }
        /**
         * 删除键
         */
        async del(key) {
            await this.client.del(key);
        }
        /**
         * 检查键是否存在
         */
        async exists(key) {
            const result = await this.client.exists(key);
            return result === 1;
        }
        /**
         * 设置过期时间
         */
        async expire(key, seconds) {
            await this.client.expire(key, seconds);
        }
        /**
         * 自增
         */
        async incr(key) {
            return this.client.incr(key);
        }
        /**
         * 自增指定值
         */
        async incrby(key, increment) {
            return this.client.incrby(key, increment);
        }
        /**
         * 获取自增值
         */
        async getCounter(key) {
            const value = await this.client.get(key);
            return value ? parseInt(value, 10) : 0;
        }
        /**
         * Ping 测试连接
         */
        async ping() {
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
        async acquireLock(key, ttlSeconds) {
            const lockValue = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
            const result = await this.client.set(`lock:${key}`, lockValue, 'EX', ttlSeconds, 'NX');
            return result === 'OK' ? lockValue : null;
        }
        /**
         * 分布式锁 - 释放锁
         *
         * 使用 Lua 脚本保证原子性：只有持有者才能释放锁。
         */
        async releaseLock(key, lockValue) {
            const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;
            const result = await this.client.eval(script, 1, `lock:${key}`, lockValue);
            return result === 1;
        }
        /**
         * 设置 JSON 对象
         */
        async setJson(key, value, ttlSeconds) {
            const json = JSON.stringify(value);
            await this.set(key, json, ttlSeconds);
        }
        /**
         * 获取 JSON 对象
         */
        async getJson(key) {
            const json = await this.get(key);
            if (!json) {
                return null;
            }
            try {
                return JSON.parse(json);
            }
            catch {
                return null;
            }
        }
    };
    return RedisService = _classThis;
})();
export { RedisService };
//# sourceMappingURL=redis.service.js.map