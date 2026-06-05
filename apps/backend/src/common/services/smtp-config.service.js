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
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
/**
 * SMTP配置服务
 *
 * 管理SMTP邮件服务器配置，密码自动加解密。
 */
let SmtpConfigService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var SmtpConfigService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            SmtpConfigService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        prisma;
        encryption;
        logger = new Logger(SmtpConfigService.name);
        constructor(prisma, encryption) {
            this.prisma = prisma;
            this.encryption = encryption;
        }
        /**
         * 获取SMTP配置（脱敏）
         */
        async getConfig() {
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
        async getDecryptedConfig() {
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
        async getEnabledConfig() {
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
        async update(data) {
            // 加密密码
            const updateData = { ...data };
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
        async toggle() {
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
        maskSensitiveFields(config) {
            return {
                ...config,
                password: config.password ? this.encryption.mask(config.password) : null,
            };
        }
        /**
         * 解密敏感字段
         */
        decryptFields(config) {
            return {
                ...config,
                password: config.password ? this.encryption.decrypt(config.password) : null,
            };
        }
    };
    return SmtpConfigService = _classThis;
})();
export { SmtpConfigService };
//# sourceMappingURL=smtp-config.service.js.map