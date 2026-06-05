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
 * 支付配置服务
 *
 * 管理支付渠道配置，敏感字段自动加解密。
 */
let PaymentConfigService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var PaymentConfigService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            PaymentConfigService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        prisma;
        encryption;
        logger = new Logger(PaymentConfigService.name);
        constructor(prisma, encryption) {
            this.prisma = prisma;
            this.encryption = encryption;
        }
        /**
         * 获取所有支付配置（脱敏）
         */
        async findAll() {
            const configs = await this.prisma.paymentConfig.findMany({
                orderBy: { name: 'asc' },
            });
            return configs.map((config) => this.maskSensitiveFields(config));
        }
        /**
         * 获取单个支付配置（脱敏）
         */
        async findByName(name) {
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
        async findDecryptedByName(name) {
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
        async findEnabledByName(name) {
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
        async update(name, data) {
            const existing = await this.prisma.paymentConfig.findUnique({
                where: { name },
            });
            if (!existing) {
                throw new NotFoundException(`Payment config "${name}" not found`);
            }
            // 加密敏感字段
            const updateData = { ...data };
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
        async toggle(name) {
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
        async getEnabledMethods() {
            const configs = await this.prisma.paymentConfig.findMany({
                where: { is_enabled: true },
                select: { name: true, display_name: true },
            });
            return configs;
        }
        /**
         * 脱敏敏感字段
         */
        maskSensitiveFields(config) {
            return {
                ...config,
                merchant_key: config.merchant_key ? this.encryption.mask(config.merchant_key) : null,
                merchant_secret: config.merchant_secret ? this.encryption.mask(config.merchant_secret) : null,
            };
        }
        /**
         * 解密敏感字段
         */
        decryptFields(config) {
            return {
                ...config,
                merchant_key: config.merchant_key ? this.encryption.decrypt(config.merchant_key) : null,
                merchant_secret: config.merchant_secret ? this.encryption.decrypt(config.merchant_secret) : null,
            };
        }
    };
    return PaymentConfigService = _classThis;
})();
export { PaymentConfigService };
//# sourceMappingURL=payment-config.service.js.map