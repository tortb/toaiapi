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
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { createHash } from 'crypto';
/**
 * 易支付服务
 *
 * 实现易支付（EPay）的签名生成、订单创建、回调验证。
 * 支持支付宝、微信支付、QQ钱包。
 *
 * SECURITY:
 * - 签名使用 MD5（易支付标准）
 * - 回调验签使用 timingSafeEqual 防止时序攻击
 * - 所有金额校验必须与订单金额一致
 */
let EPayService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var EPayService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            EPayService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        paymentConfigService;
        logger = new Logger(EPayService.name);
        constructor(paymentConfigService) {
            this.paymentConfigService = paymentConfigService;
        }
        /**
         * 获取易支付配置
         */
        async getConfig() {
            const config = await this.paymentConfigService.findDecryptedByName('epay');
            if (!config || !config.is_enabled) {
                throw new BadRequestException('易支付未配置或已禁用');
            }
            if (!config.merchant_id || !config.merchant_key || !config.api_endpoint) {
                throw new BadRequestException('易支付配置不完整');
            }
            return {
                pid: config.merchant_id,
                key: config.merchant_key,
                apiEndpoint: config.api_endpoint,
                notifyUrl: config.notify_url || '',
                returnUrl: config.return_url || '',
            };
        }
        /**
         * 生成签名
         *
         * 签名规则：
         * 1. 将所有参数按key排序
         * 2. 拼接成 key=value&key=value 格式
         * 3. 末尾拼接密钥
         * 4. MD5加密
         *
         * @param params - 参数对象
         * @param key - 商户密钥
         * @returns MD5签名（小写）
         */
        generateSign(params, key) {
            // 过滤空值和签名相关参数
            const filteredParams = {};
            for (const [k, v] of Object.entries(params)) {
                if (v !== null && v !== undefined && v !== '' && k !== 'sign' && k !== 'sign_type') {
                    filteredParams[k] = String(v);
                }
            }
            // 按key排序
            const sortedKeys = Object.keys(filteredParams).sort();
            // 拼接字符串
            const signStr = sortedKeys
                .map((k) => `${k}=${filteredParams[k]}`)
                .join('&');
            // 拼接密钥并MD5
            const md5 = createHash('md5');
            md5.update(signStr + key);
            return md5.digest('hex');
        }
        /**
         * 验证签名
         *
         * 使用 timingSafeEqual 进行安全比较，防止时序攻击
         *
         * @param params - 回调参数
         * @param key - 商户密钥
         * @returns 是否验证通过
         */
        verifySign(params, key) {
            const { sign, sign_type, ...rest } = params;
            if (!sign) {
                return false;
            }
            const expectedSign = this.generateSign(rest, key);
            // 使用 timingSafeEqual 进行安全比较
            try {
                const signBuffer = Buffer.from(sign, 'utf8');
                const expectedBuffer = Buffer.from(expectedSign, 'utf8');
                if (signBuffer.length !== expectedBuffer.length) {
                    return false;
                }
                const { timingSafeEqual } = require('crypto');
                return timingSafeEqual(signBuffer, expectedBuffer);
            }
            catch {
                return false;
            }
        }
        /**
         * 创建支付链接
         *
         * @param params - 订单参数
         * @returns 支付链接
         */
        async createPayUrl(params) {
            const config = await this.getConfig();
            // 构建参数
            const submitParams = {
                pid: config.pid,
                type: params.type,
                out_trade_no: params.outTradeNo,
                notify_url: config.notifyUrl,
                return_url: config.returnUrl,
                name: params.name,
                money: params.money,
                sitename: params.sitename || 'ToAIAPI',
            };
            // 生成签名
            const sign = this.generateSign(submitParams, config.key);
            // 构建支付链接
            const queryString = Object.entries({ ...submitParams, sign, sign_type: 'MD5' })
                .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
                .join('&');
            const payUrl = `${config.apiEndpoint}/submit.php?${queryString}`;
            this.logger.log(`Created EPay payment URL for order: ${params.outTradeNo}`);
            return payUrl;
        }
        /**
         * 验证异步通知
         *
         * @param params - 回调参数
         * @returns 验证结果和订单信息
         */
        async verifyNotify(params) {
            const config = await this.getConfig();
            // 验证签名
            const isValid = this.verifySign(params, config.key);
            if (!isValid) {
                this.logger.warn('EPay notify signature verification failed');
                return { valid: false };
            }
            const notifyParams = params;
            this.logger.log(`EPay notify verified for order: ${notifyParams.out_trade_no}`);
            return {
                valid: true,
                orderNo: notifyParams.out_trade_no,
                tradeNo: notifyParams.trade_no,
                amount: this.yuanToFen(notifyParams.money),
                status: notifyParams.trade_status,
            };
        }
        /**
         * 验证同步跳转
         *
         * @param params - 跳转参数
         * @returns 验证结果
         */
        async verifyReturn(params) {
            const config = await this.getConfig();
            // 验证签名
            const isValid = this.verifySign(params, config.key);
            if (!isValid) {
                this.logger.warn('EPay return signature verification failed');
                return { valid: false };
            }
            return {
                valid: true,
                orderNo: params['out_trade_no'],
            };
        }
        /**
         * 将金额从分转换为元
         *
         * @param fen - 金额（分）
         * @returns 金额（元，字符串）
         */
        fenToYuan(fen) {
            return (fen / 100).toFixed(2);
        }
        /**
         * 将金额从元转换为分
         *
         * @param yuan - 金额（元）
         * @returns 金额（分）
         */
        yuanToFen(yuan) {
            return Math.round(Number(yuan) * 100);
        }
    };
    return EPayService = _classThis;
})();
export { EPayService };
//# sourceMappingURL=epay.service.js.map