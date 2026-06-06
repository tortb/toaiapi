import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { createHash } from 'crypto';
import { PaymentConfigService } from '../../common/services/payment-config.service';
import {
  EPayConfig,
  EPayType,
  EPayCreateOrderParams,
  EPayNotifyParams,
} from './interfaces/epay.interface';

/**
 * 易支付服务（基于官方 Node.js SDK）
 *
 * 签名算法：MD5
 * 接口地址：/mapi.php（API下单）, /submit.php（页面跳转）
 *
 * 配置字段映射：
 * - merchant_id → pid（商户ID）
 * - merchant_key → 密钥（MD5 签名密钥）
 *
 * SDK 参考：docs/sdk/epay/index.js
 *
 * SECURITY:
 * - 回调验签使用 timingSafeEqual 防止时序攻击
 * - 金额校验必须与订单一致
 */
@Injectable()
export class EPayService {
  private readonly logger = new Logger(EPayService.name);

  constructor(private readonly paymentConfigService: PaymentConfigService) {}

  /**
   * 获取易支付配置
   */
  private async getConfig(): Promise<EPayConfig> {
    const config = await this.paymentConfigService.findDecryptedByName('epay');

    if (!config || !config.is_enabled) {
      throw new BadRequestException('易支付未配置或已禁用');
    }

    if (!config.merchant_id || !config.merchant_key || !config.api_endpoint) {
      throw new BadRequestException('易支付配置不完整（需要商户ID、密钥和API地址）');
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
   * PHP 风格的对象排序（与 SDK 一致）
   *
   * 按照 PHP ksort 的默认行为排序：
   * - 数字键排在字母键之前
   * - 字母键按字典序排列
   * - 数字键按数值大小排列
   */
  private ksort(inputArr: Record<string, any>): Record<string, any> {
    const keys = Object.keys(inputArr);

    keys.sort((a, b) => {
      const aFloat = parseFloat(a);
      const bFloat = parseFloat(b);
      const aNumeric = aFloat + '' === a;
      const bNumeric = bFloat + '' === b;

      if (aNumeric && bNumeric) {
        return aFloat > bFloat ? 1 : aFloat < bFloat ? -1 : 0;
      } else if (aNumeric && !bNumeric) {
        return 1;
      } else if (!aNumeric && bNumeric) {
        return -1;
      }
      return a > b ? 1 : a < b ? -1 : 0;
    });

    const sorted: Record<string, any> = {};
    for (const k of keys) {
      sorted[k] = inputArr[k];
    }
    return sorted;
  }

  /**
   * 生成签名（与官方 SDK 一致）
   *
   * 签名规则：
   * 1. 将所有参数按 PHP ksort 排序
   * 2. 拼接 key=value&...（空值跳过）
   * 3. 去掉末尾 &，拼接密钥
   * 4. MD5 加密，小写
   *
   * @param params - 参数对象（不含 sign/sign_type）
   * @param key - 商户密钥
   * @returns MD5签名（小写）
   */
  generateSign(params: Record<string, any>, key: string): string {
    // 过滤 sign/sign_type
    const filtered: Record<string, any> = {};
    for (const [k, v] of Object.entries(params)) {
      if (k !== 'sign' && k !== 'sign_type') {
        filtered[k] = v;
      }
    }

    // 按 PHP ksort 规则排序
    const sorted = this.ksort(filtered);

    // 拼接签名字符串（空值跳过，与 SDK 一致）
    let signStr = '';
    for (const [k, v] of Object.entries(sorted)) {
      if (v !== '' && v !== null && v !== undefined) {
        signStr += `${k}=${v}&`;
      }
    }

    // 去掉末尾 &，拼接密钥，MD5
    signStr = signStr.substring(0, signStr.length - 1) + key;

    return createHash('md5').update(signStr).digest('hex');
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
  verifySign(params: Record<string, any>, key: string): boolean {
    const { sign, sign_type, ...rest } = params;

    if (!sign) {
      return false;
    }

    const expectedSign = this.generateSign(rest, key);

    try {
      const signBuffer = Buffer.from(sign, 'utf8');
      const expectedBuffer = Buffer.from(expectedSign, 'utf8');

      if (signBuffer.length !== expectedBuffer.length) {
        return false;
      }

      const { timingSafeEqual } = require('crypto');
      return timingSafeEqual(signBuffer, expectedBuffer);
    } catch {
      return false;
    }
  }

  /**
   * 创建支付链接
   *
   * 使用 /submit.php 页面跳转方式（与 SDK pay 方法一致，但用 GET 跳转）
   *
   * @param params - 订单参数
   * @returns 支付链接
   */
  async createPayUrl(params: EPayCreateOrderParams): Promise<string> {
    const config = await this.getConfig();

    // 构建完整参数（与 SDK 一致）
    const submitParams: Record<string, any> = {
      pid: config.pid,
      type: params.type,
      out_trade_no: params.outTradeNo,
      notify_url: config.notifyUrl || '',
      return_url: config.returnUrl || '',
      name: params.name,
      money: params.money,
    };

    // 生成签名
    const sign = this.generateSign(submitParams, config.key);

    // 构建支付链接
    const endpoint = config.apiEndpoint.replace(/\/+$/, '');
    const allParams = { ...submitParams, sign, sign_type: 'MD5' };
    const queryString = Object.entries(allParams)
      .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
      .join('&');

    const payUrl = `${endpoint}/submit.php?${queryString}`;

    this.logger.log(`Created EPay payment URL for order: ${params.outTradeNo}`);
    return payUrl;
  }

  /**
   * API 下单（POST /mapi.php）
   *
   * 与 SDK pay 方法完全一致，返回 JSON（qrcode/payurl/urlscheme）
   *
   * @param params - 订单参数
   * @param clientIp - 客户端 IP
   * @returns API 响应
   */
  async createPayApi(params: EPayCreateOrderParams, clientIp: string): Promise<{
    code: number;
    msg?: string;
    trade_no?: string;
    payurl?: string;
    qrcode?: string;
    urlscheme?: string;
  }> {
    const config = await this.getConfig();

    // 构建签名参数（与 SDK 一致，包含 clientip）
    const signParams: Record<string, any> = {
      pid: config.pid,
      type: params.type,
      out_trade_no: params.outTradeNo,
      notify_url: config.notifyUrl || '',
      name: params.name,
      money: params.money,
      clientip: clientIp,
    };

    // 生成签名
    const sign = this.generateSign(signParams, config.key);

    // 构建 POST body（与 SDK 一致）
    const formData = new URLSearchParams({
      pid: String(config.pid),
      type: params.type,
      out_trade_no: params.outTradeNo,
      notify_url: config.notifyUrl || '',
      name: params.name,
      money: params.money,
      clientip: clientIp,
      sign,
      sign_type: 'MD5',
    });

    // POST 到 /mapi.php
    const endpoint = config.apiEndpoint.replace(/\/+$/, '');
    const response = await fetch(`${endpoint}/mapi.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    });

    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch {
      this.logger.error(`EPay API response is not JSON: ${text}`);
      return { code: -1, msg: 'Invalid response from EPay' };
    }
  }

  /**
   * 验证异步通知
   *
   * @param params - 回调参数
   * @returns 验证结果和订单信息
   */
  async verifyNotify(params: Record<string, any>): Promise<{
    valid: boolean;
    orderNo?: string;
    tradeNo?: string;
    amount?: number;
    status?: string;
  }> {
    const config = await this.getConfig();

    // 验证签名
    const isValid = this.verifySign(params, config.key);

    if (!isValid) {
      this.logger.warn('EPay notify signature verification failed');
      return { valid: false };
    }

    const notifyParams = params as EPayNotifyParams;

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
  async verifyReturn(params: Record<string, any>): Promise<{
    valid: boolean;
    orderNo?: string;
  }> {
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

  fenToYuan(fen: number): string {
    return (fen / 100).toFixed(2);
  }

  yuanToFen(yuan: string | number): number {
    return Math.round(Number(yuan) * 100);
  }
}
