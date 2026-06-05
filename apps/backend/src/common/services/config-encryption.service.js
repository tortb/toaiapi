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
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
/**
 * 配置加密服务
 *
 * 使用 AES-256-GCM 算法加密敏感配置字段。
 * 用于支付配置和SMTP配置中的密码、密钥等敏感信息。
 *
 * SECURITY: 加密密钥必须通过环境变量 ENCRYPTION_KEY 提供
 */
let ConfigEncryptionService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var ConfigEncryptionService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ConfigEncryptionService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        config;
        logger = new Logger(ConfigEncryptionService.name);
        encryptionKey;
        constructor(config) {
            this.config = config;
            const key = this.config.get('ENCRYPTION_KEY');
            if (!key) {
                throw new Error('ENCRYPTION_KEY environment variable is required');
            }
            // 支持 hex 和 base64 格式的密钥
            if (key.length === 64) {
                // hex 格式，32字节
                this.encryptionKey = Buffer.from(key, 'hex');
            }
            else if (key.length === 44) {
                // base64 格式，32字节
                this.encryptionKey = Buffer.from(key, 'base64');
            }
            else {
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
        encrypt(plaintext) {
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
            }
            catch (error) {
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
        decrypt(ciphertext) {
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
            }
            catch (error) {
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
        mask(value, visibleChars = 4) {
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
    };
    return ConfigEncryptionService = _classThis;
})();
export { ConfigEncryptionService };
//# sourceMappingURL=config-encryption.service.js.map