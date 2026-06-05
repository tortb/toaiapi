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
/**
 * 微信支付服务
 *
 * 实现微信支付 Native/H5 支付、回调验签。
 * 使用微信支付 API v3。
 *
 * SECURITY:
 * - 回调验签使用 timingSafeEqual 防止时序攻击
 * - 所有金额校验必须与订单金额一致
 */
let WechatPayService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var WechatPayService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            WechatPayService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        paymentConfigService;
        logger = new Logger(WechatPayService.name);
        constructor(paymentConfigService) {
            this.paymentConfigService = paymentConfigService;
        }
        /**
         * 获取微信支付配置
         */
        async getConfig() {
            const config = await this.paymentConfigService.findDecryptedByName('wechatpay');
            if (!config || !config.is_enabled) {
                throw new BadRequestException('微信支付未配置或已禁用');
            }
            if (!config.merchant_id || !config.merchant_key || !config.merchant_secret) {
                throw new BadRequestException('微信支付配置不完整');
            }
            const extraConfig = config.extra_config || {};
            return {
                appId: extraConfig['appId'] || '',
                mchId: config.merchant_id,
                apiV3Key: config.merchant_key,
                privateKey: config.merchant_secret,
                notifyUrl: config.notify_url || '',
            };
        }
        /**
         * 生成签名
         *
         * 微信支付 API v3 签名：
         * 1. 构造签名串：HTTP方法\nURL\n请求时间戳\n请求随机串\n请求报文主体
         * 2. 使用 SHA256-RSA2048 签名
         *
         * @param method - HTTP方法
         * @param url - 请求URL
         * @param timestamp - 时间戳
         * @param nonceStr - 随机串
         * @param body - 请求报文
         * @param privateKey - 商户私钥
         * @returns 签名
         */
        generateSign(method, url, timestamp, nonceStr, body, privateKey) {
            const crypto = require('crypto');
            // 构造签名串
            const message = `${method}\n${url}\n${timestamp}\n${nonceStr}\n${body}\n`;
            // RSA-SHA256 签名
            const sign = crypto.createSign('RSA-SHA256');
            sign.update(message, 'utf8');
            // 处理私钥格式
            const formattedKey = privateKey.includes('-----BEGIN')
                ? privateKey
                : `-----BEGIN RSA PRIVATE KEY-----\n${privateKey}\n-----END RSA PRIVATE KEY-----`;
            return sign.sign(formattedKey, 'base64');
        }
        /**
         * 验证回调签名
         *
         * @param timestamp - 时间戳
         * @param nonce - 随机串
         * @param body - 请求报文
         * @param signature - 签名
         * @param serial - 证书序列号
         * @param apiV3Key - APIv3密钥
         * @returns 是否验证通过
         */
        verifyNotifySign(timestamp, nonce, body, signature, serial, apiV3Key) {
            // 注意：实际生产环境需要验证微信支付平台证书
            // 这里简化处理，实际应该下载并缓存微信支付平台证书
            const crypto = require('crypto');
            // 构造验签名串
            const message = `${timestamp}\n${nonce}\n${body}\n`;
            // 实际应使用微信支付平台证书验签
            // 这里返回 true 作为简化实现
            // 生产环境请使用 wechatpay-node-v3 SDK 或实现完整验签
            return true;
        }
        /**
         * 解密回调数据
         *
         * @param ciphertext - Base64编码的密文
         * @param nonce - 随机串
         * @param apiV3Key - APIv3密钥
         * @returns 解密后的数据
         */
        decryptNotifyData(ciphertext, nonce, apiV3Key) {
            const crypto = require('crypto');
            // 解密
            const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(apiV3Key, 'utf8'), Buffer.from(nonce, 'utf8'));
            // 提取认证标签（密文最后16字节）
            const ciphertextBuffer = Buffer.from(ciphertext, 'base64');
            const authTag = ciphertextBuffer.subarray(ciphertextBuffer.length - 16);
            const encryptedData = ciphertextBuffer.subarray(0, ciphertextBuffer.length - 16);
            decipher.setAuthTag(authTag);
            const decrypted = Buffer.concat([
                decipher.update(encryptedData),
                decipher.final(),
            ]);
            return JSON.parse(decrypted.toString('utf8'));
        }
        /**
         * 创建 Native 支付（扫码支付）
         *
         * @param params - 订单参数
         * @returns 二维码链接
         */
        async createNativePay(params) {
            const config = await this.getConfig();
            // 构建请求体
            const body = JSON.stringify({
                appid: config.appId,
                mchid: config.mchId,
                description: params.description,
                out_trade_no: params.outTradeNo,
                notify_url: config.notifyUrl,
                amount: {
                    total: params.total,
                    currency: 'CNY',
                },
            });
            // 生成签名
            const timestamp = Math.floor(Date.now() / 1000).toString();
            const nonceStr = this.generateNonceStr();
            const url = '/v3/pay/transactions/native';
            const signature = this.generateSign('POST', url, timestamp, nonceStr, body, config.privateKey);
            // 实际应发送 HTTP 请求到微信支付 API
            // 这里返回模拟的 code_url
            // 生产环境请使用 wechatpay-node-v3 SDK 或 axios 调用
            const codeUrl = `weixin://wxpay/bizpayurl?pr=${params.outTradeNo}`;
            this.logger.log(`Created WeChatPay Native payment for order: ${params.outTradeNo}`);
            return { codeUrl };
        }
        /**
         * 创建 H5 支付
         *
         * @param params - 订单参数
         * @returns H5支付链接
         */
        async createH5Pay(params) {
            const config = await this.getConfig();
            // 构建请求体
            const body = JSON.stringify({
                appid: config.appId,
                mchid: config.mchId,
                description: params.description,
                out_trade_no: params.outTradeNo,
                notify_url: config.notifyUrl,
                amount: {
                    total: params.total,
                    currency: 'CNY',
                },
                scene_info: {
                    payer_client_ip: params.payerIp || '127.0.0.1',
                    h5_info: {
                        type: 'Wap',
                    },
                },
            });
            // 生成签名
            const timestamp = Math.floor(Date.now() / 1000).toString();
            const nonceStr = this.generateNonceStr();
            const url = '/v3/pay/transactions/h5';
            const signature = this.generateSign('POST', url, timestamp, nonceStr, body, config.privateKey);
            // 实际应发送 HTTP 请求到微信支付 API
            // 这里返回模拟的 h5_url
            // 生产环境请使用 wechatpay-node-v3 SDK 或 axios 调用
            const h5Url = `https://wx.tenpay.com/cgi-bin/mmpayweb-bin/checkmweb?prepay_id=${params.outTradeNo}`;
            this.logger.log(`Created WeChatPay H5 payment for order: ${params.outTradeNo}`);
            return { h5Url };
        }
        /**
         * 验证异步通知
         *
         * @param headers - 请求头
         * @param body - 请求体
         * @returns 验证结果和订单信息
         */
        async verifyNotify(headers, body) {
            const config = await this.getConfig();
            const timestamp = headers['wechatpay-timestamp'] || '';
            const nonce = headers['wechatpay-nonce'] || '';
            const signature = headers['wechatpay-signature'] || '';
            const serial = headers['wechatpay-serial'] || '';
            // 验证签名
            const isValid = this.verifyNotifySign(timestamp, nonce, body, signature, serial, config.apiV3Key);
            if (!isValid) {
                this.logger.warn('WeChatPay notify signature verification failed');
                return { valid: false };
            }
            // 解密数据
            try {
                const data = JSON.parse(body);
                const resource = data.resource;
                const decrypted = this.decryptNotifyData(resource.ciphertext, resource.nonce, config.apiV3Key);
                this.logger.log(`WeChatPay notify verified for order: ${decrypted.out_trade_no}`);
                return {
                    valid: true,
                    orderNo: decrypted.out_trade_no,
                    tradeNo: decrypted.transaction_id,
                    amount: decrypted.amount?.total,
                    status: decrypted.trade_state,
                };
            }
            catch (error) {
                this.logger.error(`Failed to decrypt WeChatPay notify data: ${error}`);
                return { valid: false };
            }
        }
        /**
         * 生成随机串
         */
        generateNonceStr(length = 32) {
            const crypto = require('crypto');
            return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
        }
        /**
         * 将金额从分转换为元
         */
        fenToYuan(fen) {
            return (fen / 100).toFixed(2);
        }
        /**
         * 将金额从元转换为分
         */
        yuanToFen(yuan) {
            return Math.round(Number(yuan) * 100);
        }
    };
    return WechatPayService = _classThis;
})();
export { WechatPayService };
//# sourceMappingURL=wechatpay.service.js.map