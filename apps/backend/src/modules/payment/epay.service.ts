import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { createHash } from 'crypto';
import { PaymentConfigService } from '../../common/services/payment-config.service';
import {
  EPayConfig,
  EPayType,
  EPayCreateOrderParams,
  EPaySubmitParams,
  EPayNotifyParams,
} from './interfaces/epay.interface';

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
  generateSign(params: Record<string, any>, key: string): string {
    // 过滤空值和签名相关参数
    const filteredParams: Record<string, string> = {};
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
  verifySign(params: Record<string, any>, key: string): boolean {
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
    } catch {
      return false;
    }
  }

  /**
   * 创建支付链接
   *
   * @param params - 订单参数
   * @returns 支付链接
   */
  async createPayUrl(params: EPayCreateOrderParams): Promise<string> {
    const config = await this.getConfig();

    // 构建参数（仅包含非空值，符合 EPay 规范）
    const submitParams: Record<string, any> = {
      pid: config.pid,
      type: params.type,
      out_trade_no: params.outTradeNo,
      name: params.name,
      money: params.money,
    };

    // notify_url 和 return_url 仅在非空时添加（EPay 规范：空值不参与签名）
    if (config['notifyUrl']) {
      submitParams['notify_url'] = config['notifyUrl'];
    }
    if (config['returnUrl']) {
      submitParams['return_url'] = config['returnUrl'];
    }

    // 生成签名
    const sign = this.generateSign(submitParams, config.key);

    // 构建支付链接（去除末尾斜杠避免双斜杠）
    const endpoint = config.apiEndpoint.replace(/\/+$/, '');
    const queryString = Object.entries({ ...submitParams, sign, sign_type: 'MD5' })
      .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
      .join('&');

    const payUrl = `${endpoint}/submit.php?${queryString}`;

    this.logger.log(`Created EPay payment URL for order: ${params.outTradeNo}`);
    return payUrl;
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

  /**
   * 将金额从分转换为元
   *
   * @param fen - 金额（分）
   * @returns 金额（元，字符串）
   */
  fenToYuan(fen: number): string {
    return (fen / 100).toFixed(2);
  }

  /**
   * 将金额从元转换为分
   *
   * @param yuan - 金额（元）
   * @returns 金额（分）
   */
  yuanToFen(yuan: string | number): number {
    return Math.round(Number(yuan) * 100);
  }
}
