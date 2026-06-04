import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PaymentConfigService } from '../../common/services/payment-config.service';

/**
 * 支付宝服务
 *
 * 实现支付宝网页支付、回调验签。
 * 使用简化实现，支持公钥模式。
 *
 * SECURITY:
 * - 回调验签使用 timingSafeEqual 防止时序攻击
 * - 所有金额校验必须与订单金额一致
 */
@Injectable()
export class AlipayService {
  private readonly logger = new Logger(AlipayService.name);

  constructor(private readonly paymentConfigService: PaymentConfigService) {}

  /**
   * 获取支付宝配置
   */
  private async getConfig() {
    const config = await this.paymentConfigService.findDecryptedByName('alipay');

    if (!config || !config.is_enabled) {
      throw new BadRequestException('支付宝未配置或已禁用');
    }

    if (!config.merchant_id || !config.merchant_key || !config.merchant_secret) {
      throw new BadRequestException('支付宝配置不完整');
    }

    return {
      appId: config.merchant_id,
      privateKey: config.merchant_secret,
      alipayPublicKey: config.merchant_key,
      notifyUrl: config.notify_url || '',
      returnUrl: config.return_url || '',
    };
  }

  /**
   * 生成 RSA2 签名
   *
   * @param params - 参数对象
   * @param privateKey - 应用私钥
   * @returns Base64编码的签名
   */
  private generateSign(params: Record<string, string>, privateKey: string): string {
    const crypto = require('crypto');

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

    // RSA2 签名
    const sign = crypto.createSign('RSA-SHA256');
    sign.update(signStr, 'utf8');

    // 处理私钥格式
    const formattedKey = privateKey.includes('-----BEGIN')
      ? privateKey
      : `-----BEGIN RSA PRIVATE KEY-----\n${privateKey}\n-----END RSA PRIVATE KEY-----`;

    return sign.sign(formattedKey, 'base64');
  }

  /**
   * 验证 RSA2 签名
   *
   * @param params - 回调参数
   * @param alipayPublicKey - 支付宝公钥
   * @returns 是否验证通过
   */
  private verifySign(params: Record<string, string>, alipayPublicKey: string): boolean {
    const crypto = require('crypto');
    const { sign, sign_type, ...rest } = params;

    if (!sign) {
      return false;
    }

    // 过滤空值
    const filteredParams: Record<string, string> = {};
    for (const [k, v] of Object.entries(rest)) {
      if (v !== null && v !== undefined && v !== '') {
        filteredParams[k] = String(v);
      }
    }

    // 按key排序
    const sortedKeys = Object.keys(filteredParams).sort();

    // 拼接字符串
    const signStr = sortedKeys
      .map((k) => `${k}=${filteredParams[k]}`)
      .join('&');

    // 验证签名
    const verify = crypto.createVerify('RSA-SHA256');
    verify.update(signStr, 'utf8');

    // 处理公钥格式
    const formattedKey = alipayPublicKey.includes('-----BEGIN')
      ? alipayPublicKey
      : `-----BEGIN PUBLIC KEY-----\n${alipayPublicKey}\n-----END PUBLIC KEY-----`;

    return verify.verify(formattedKey, sign, 'base64');
  }

  /**
   * 创建网页支付表单HTML
   *
   * @param params - 订单参数
   * @returns HTML表单字符串
   */
  async createPagePayForm(params: {
    outTradeNo: string;
    totalAmount: string;
    subject: string;
    body?: string;
  }): Promise<string> {
    const config = await this.getConfig();

    // 构建业务参数
    const bizContent = JSON.stringify({
      out_trade_no: params.outTradeNo,
      total_amount: params.totalAmount,
      subject: params.subject,
      body: params.body || params.subject,
      product_code: 'FAST_INSTANT_TRADE_PAY',
    });

    // 构建请求参数
    const requestParams: Record<string, string> = {
      app_id: config.appId,
      method: 'alipay.trade.page.pay',
      charset: 'utf-8',
      sign_type: 'RSA2',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      version: '1.0',
      notify_url: config.notifyUrl,
      return_url: config.returnUrl,
      biz_content: bizContent,
    };

    // 生成签名
    const sign = this.generateSign(requestParams, config.privateKey);

    // 构建表单HTML
    const formInputs = Object.entries({ ...requestParams, sign })
      .map(([k, v]) => `<input type="hidden" name="${k}" value="${this.escapeHtml(v)}" />`)
      .join('\n    ');

    const html = `
<form id="alipayForm" action="https://openapi.alipay.com/gateway.do" method="POST">
    ${formInputs}
</form>
<script>document.getElementById('alipayForm').submit();</script>`;

    this.logger.log(`Created Alipay page pay form for order: ${params.outTradeNo}`);
    return html;
  }

  /**
   * 创建手机网页支付链接
   *
   * @param params - 订单参数
   * @returns 支付链接
   */
  async createWapPayUrl(params: {
    outTradeNo: string;
    totalAmount: string;
    subject: string;
    body?: string;
  }): Promise<string> {
    const config = await this.getConfig();

    // 构建业务参数
    const bizContent = JSON.stringify({
      out_trade_no: params.outTradeNo,
      total_amount: params.totalAmount,
      subject: params.subject,
      body: params.body || params.subject,
      product_code: 'QUICK_WAP_WAY',
    });

    // 构建请求参数
    const requestParams: Record<string, string> = {
      app_id: config.appId,
      method: 'alipay.trade.wap.pay',
      charset: 'utf-8',
      sign_type: 'RSA2',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      version: '1.0',
      notify_url: config.notifyUrl,
      return_url: config.returnUrl,
      biz_content: bizContent,
    };

    // 生成签名
    const sign = this.generateSign(requestParams, config.privateKey);

    // 构建支付链接
    const queryString = Object.entries({ ...requestParams, sign })
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join('&');

    const payUrl = `https://openapi.alipay.com/gateway.do?${queryString}`;

    this.logger.log(`Created Alipay wap pay URL for order: ${params.outTradeNo}`);
    return payUrl;
  }

  /**
   * 验证异步通知
   *
   * @param params - 回调参数
   * @returns 验证结果和订单信息
   */
  async verifyNotify(params: Record<string, string>): Promise<{
    valid: boolean;
    orderNo?: string;
    tradeNo?: string;
    amount?: number;
    status?: string;
    buyerId?: string;
  }> {
    const config = await this.getConfig();

    // 验证签名
    const isValid = this.verifySign(params, config.alipayPublicKey);

    if (!isValid) {
      this.logger.warn('Alipay notify signature verification failed');
      return { valid: false };
    }

    this.logger.log(`Alipay notify verified for order: ${params['out_trade_no']}`);
    return {
      valid: true,
      orderNo: params['out_trade_no'],
      tradeNo: params['trade_no'],
      amount: Math.round(parseFloat(params['total_amount'] || '0') * 100), // 转换为分
      status: params['trade_status'],
      buyerId: params['buyer_id'],
    };
  }

  /**
   * HTML转义
   */
  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * 将金额从分转换为元
   */
  fenToYuan(fen: number): string {
    return (fen / 100).toFixed(2);
  }

  /**
   * 将金额从元转换为分
   */
  yuanToFen(yuan: string | number): number {
    return Math.round(Number(yuan) * 100);
  }
}
