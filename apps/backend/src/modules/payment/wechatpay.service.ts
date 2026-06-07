import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PaymentConfigService } from '../../common/services/payment-config.service';
import { fetchWithPool } from '../../common/http/http-agent';

/**
 * 微信支付服务
 *
 * 实现微信支付 Native/H5 支付、回调验签。
 * 使用微信支付 API v3。
 *
 * SECURITY:
 * - 回调验签使用平台证书验签，防止伪造通知
 * - 平台证书自动下载和缓存
 * - 所有金额校验必须与订单金额一致
 */

/** 缓存的平台证书 */
interface CachedCertificate {
  serialNo: string;
  publicKey: crypto.KeyObject;
  fetchedAt: number;
}

@Injectable()
export class WechatPayService {
  private readonly logger = new Logger(WechatPayService.name);

  /** 平台证书缓存（有效期 1 小时） */
  private certificates: CachedCertificate[] = [];
  private certFetchedAt = 0;
  private readonly CERT_CACHE_TTL = 3600_000; // 1 小时

  constructor(private readonly paymentConfigService: PaymentConfigService) {}

  /**
   * 获取微信支付配置
   */
  private async getConfig() {
    const config = await this.paymentConfigService.findDecryptedByName('wechatpay');

    if (!config || !config.is_enabled) {
      throw new BadRequestException('微信支付未配置或已禁用');
    }

    if (!config.merchant_id || !config.merchant_key || !config.merchant_secret) {
      throw new BadRequestException('微信支付配置不完整');
    }

    this.validateApiV3Key(config.merchant_key);

    const extraConfig = (config.extra_config as Record<string, any>) || {};

    return {
      appId: extraConfig['appId'] || '',
      mchId: config.merchant_id,
      apiV3Key: config.merchant_key,
      privateKey: config.merchant_secret,
      notifyUrl: config.notify_url || '',
    };
  }

  private validateApiV3Key(apiV3Key: string): void {
    if (Buffer.byteLength(apiV3Key, 'utf8') !== 32) {
      throw new BadRequestException('微信支付 API v3 密钥必须为 32 字节');
    }
  }

  /**
   * 生成签名
   *
   * 微信支付 API v3 签名：
   * 1. 构造签名串：HTTP方法\nURL\n请求时间戳\n请求随机串\n请求报文主体
   * 2. 使用 SHA256-RSA2048 签名
   */
  private generateSign(
    method: string,
    url: string,
    timestamp: string,
    nonceStr: string,
    body: string,
    privateKey: string,
  ): string {
    const message = `${method}\n${url}\n${timestamp}\n${nonceStr}\n${body}\n`;

    const formattedKey = privateKey.includes('-----BEGIN')
      ? privateKey
      : `-----BEGIN RSA PRIVATE KEY-----\n${privateKey}\n-----END RSA PRIVATE KEY-----`;

    const sign = crypto.createSign('RSA-SHA256');
    sign.update(message, 'utf8');
    return sign.sign(formattedKey, 'base64');
  }

  /**
   * 生成请求 Authorization 头
   */
  private buildAuthorization(
    method: string,
    url: string,
    body: string,
    mchId: string,
    privateKey: string,
  ): string {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const nonceStr = this.generateNonceStr();
    const signature = this.generateSign(method, url, timestamp, nonceStr, body, privateKey);

    return `WECHATPAY2-SHA256-RSA2048 mchid="${mchId}",nonce_str="${nonceStr}",signature="${signature}",timestamp="${timestamp}",serial_no="${this.getSerialNo(privateKey)}"`;
  }

  /**
   * 获取商户证书序列号（用于 Authorization 头）
   */
  private getSerialNo(privateKey: string): string {
    const formattedKey = privateKey.includes('-----BEGIN')
      ? privateKey
      : `-----BEGIN RSA PRIVATE KEY-----\n${privateKey}\n-----END RSA PRIVATE KEY-----`;

    try {
      const keyObject = crypto.createPrivateKey(formattedKey);
      const publicKey = crypto.createPublicKey(keyObject);
      const der = publicKey.export({ type: 'spki', format: 'der' });
      const hash = crypto.createHash('sha256').update(der).digest('hex');
      return hash.substring(0, 40);
    } catch {
      return '';
    }
  }

  /**
   * 下载并缓存微信支付平台证书
   *
   * 使用 API v3 密钥解密证书内容。
   * 证书缓存 1 小时后自动刷新。
   */
  private async getPlatformCertificates(mchId: string, apiV3Key: string, privateKey: string): Promise<CachedCertificate[]> {
    const now = Date.now();
    if (this.certificates.length > 0 && now - this.certFetchedAt < this.CERT_CACHE_TTL) {
      return this.certificates;
    }

    try {
      const url = '/v3/certificates';
      const fullUrl = `https://api.mch.weixin.qq.com${url}`;
      const authorization = this.buildAuthorization('GET', url, '', mchId, privateKey);

      const res = await fetchWithPool(fullUrl, {
        method: 'GET',
        headers: {
          'Authorization': authorization,
          'Accept': 'application/json',
          'User-Agent': 'ToAIAPI/1.0',
        },
      });

      if (!res.ok) {
        const text = await res.text();
        this.logger.error(`Failed to fetch WeChatPay certificates: ${res.status} ${text}`);
        return this.certificates; // 返回旧缓存
      }

      const data = await res.json() as any;
      const certs: CachedCertificate[] = [];

      for (const cert of data.data || []) {
        try {
          const decrypted = this.decryptCertificate(
            cert.encrypt_certificate.ciphertext,
            cert.encrypt_certificate.nonce,
            cert.encrypt_certificate.associated_data,
            apiV3Key,
          );

          const publicKey = crypto.createPublicKey(decrypted);
          certs.push({
            serialNo: cert.serial_no,
            publicKey,
            fetchedAt: now,
          });
        } catch (err) {
          this.logger.error(`Failed to decrypt certificate ${cert.serial_no}: ${err}`);
        }
      }

      if (certs.length > 0) {
        this.certificates = certs;
        this.certFetchedAt = now;
        this.logger.log(`Fetched ${certs.length} WeChatPay platform certificates`);
      }

      return certs;
    } catch (err) {
      this.logger.error(`Failed to fetch WeChatPay platform certificates: ${err}`);
      return this.certificates;
    }
  }

  /**
   * 解密平台证书
   */
  private decryptCertificate(ciphertext: string, nonce: string, associatedData: string, apiV3Key: string): string {
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      Buffer.from(apiV3Key, 'utf8'),
      Buffer.from(nonce, 'utf8'),
    );

    const ciphertextBuffer = Buffer.from(ciphertext, 'base64');
    const authTag = ciphertextBuffer.subarray(ciphertextBuffer.length - 16);
    const encryptedData = ciphertextBuffer.subarray(0, ciphertextBuffer.length - 16);

    decipher.setAuthTag(authTag);
    decipher.setAAD(Buffer.from(associatedData, 'utf8'));

    const decrypted = Buffer.concat([
      decipher.update(encryptedData),
      decipher.final(),
    ]);

    return decrypted.toString('utf8');
  }

  /**
   * 验证回调签名
   *
   * 使用微信支付平台证书验签，防止伪造通知。
   */
  private async verifyNotifySign(
    timestamp: string,
    nonce: string,
    body: string,
    signature: string,
    serial: string,
    mchId: string,
    apiV3Key: string,
    privateKey: string,
  ): Promise<boolean> {
    // 检查时间戳有效期（5 分钟）
    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - parseInt(timestamp, 10)) > 300) {
      this.logger.warn('WeChatPay notify timestamp expired');
      return false;
    }

    // 获取平台证书
    const certs = await this.getPlatformCertificates(mchId, apiV3Key, privateKey);
    if (certs.length === 0) {
      this.logger.error('No WeChatPay platform certificates available');
      return false;
    }

    // 查找匹配的证书
    const cert = certs.find((c) => c.serialNo === serial);
    if (!cert) {
      this.logger.warn(`WeChatPay platform certificate not found for serial: ${serial}`);
      return false;
    }

    // 构造验签名串
    const message = `${timestamp}\n${nonce}\n${body}\n`;

    // RSA-SHA256 验签
    const verify = crypto.createVerify('RSA-SHA256');
    verify.update(message, 'utf8');
    return verify.verify(cert.publicKey, signature, 'base64');
  }

  /**
   * 解密回调数据
   */
  private decryptNotifyData(ciphertext: string, nonce: string, associatedData: string, apiV3Key: string): any {
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      Buffer.from(apiV3Key, 'utf8'),
      Buffer.from(nonce, 'utf8'),
    );

    const ciphertextBuffer = Buffer.from(ciphertext, 'base64');
    const authTag = ciphertextBuffer.subarray(ciphertextBuffer.length - 16);
    const encryptedData = ciphertextBuffer.subarray(0, ciphertextBuffer.length - 16);

    decipher.setAuthTag(authTag);
    decipher.setAAD(Buffer.from(associatedData, 'utf8'));

    const decrypted = Buffer.concat([
      decipher.update(encryptedData),
      decipher.final(),
    ]);

    return JSON.parse(decrypted.toString('utf8'));
  }

  /**
   * 创建 Native 支付（扫码支付）
   *
   * 调用微信支付 API v3 /v3/pay/transactions/native
   * 返回二维码链接 code_url，前端用于生成二维码。
   */
  async createNativePay(params: {
    outTradeNo: string;
    total: number;
    description: string;
  }): Promise<{ codeUrl: string }> {
    const config = await this.getConfig();

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

    const url = '/v3/pay/transactions/native';
    const fullUrl = `https://api.mch.weixin.qq.com${url}`;
    const authorization = this.buildAuthorization('POST', url, body, config.mchId, config.privateKey);

    const res = await fetchWithPool(fullUrl, {
      method: 'POST',
      headers: {
        'Authorization': authorization,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'ToAIAPI/1.0',
      },
      body,
    });

    if (!res.ok) {
      const errorText = await res.text();
      this.logger.error(`WeChatPay Native API error: ${res.status} ${errorText}`);
      throw new BadRequestException(`微信支付下单失败: ${res.status}`);
    }

    const data = await res.json() as { code_url: string };
    this.logger.log(`Created WeChatPay Native payment for order: ${params.outTradeNo}`);
    return { codeUrl: data.code_url };
  }

  /**
   * 创建 H5 支付
   *
   * 调用微信支付 API v3 /v3/pay/transactions/h5
   * 返回 h5_url，用户点击后跳转微信支付页面。
   */
  async createH5Pay(params: {
    outTradeNo: string;
    total: number;
    description: string;
    payerIp?: string;
  }): Promise<{ h5Url: string }> {
    const config = await this.getConfig();

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

    const url = '/v3/pay/transactions/h5';
    const fullUrl = `https://api.mch.weixin.qq.com${url}`;
    const authorization = this.buildAuthorization('POST', url, body, config.mchId, config.privateKey);

    const res = await fetchWithPool(fullUrl, {
      method: 'POST',
      headers: {
        'Authorization': authorization,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'ToAIAPI/1.0',
      },
      body,
    });

    if (!res.ok) {
      const errorText = await res.text();
      this.logger.error(`WeChatPay H5 API error: ${res.status} ${errorText}`);
      throw new BadRequestException(`微信支付H5下单失败: ${res.status}`);
    }

    const data = await res.json() as { h5_url: string };
    this.logger.log(`Created WeChatPay H5 payment for order: ${params.outTradeNo}`);
    return { h5Url: data.h5_url };
  }

  /**
   * 验证异步通知
   *
   * 1. 从请求头提取签名信息
   * 2. 使用平台证书验签
   * 3. 解密通知数据
   */
  async verifyNotify(
    headers: Record<string, string>,
    body: string,
  ): Promise<{
    valid: boolean;
    orderNo?: string;
    tradeNo?: string;
    amount?: number;
    status?: string;
  }> {
    const config = await this.getConfig();

    const timestamp = headers['wechatpay-timestamp'] || '';
    const nonce = headers['wechatpay-nonce'] || '';
    const signature = headers['wechatpay-signature'] || '';
    const serial = headers['wechatpay-serial'] || '';

    // 验证签名
    const isValid = await this.verifyNotifySign(
      timestamp,
      nonce,
      body,
      signature,
      serial,
      config.mchId,
      config.apiV3Key,
      config.privateKey,
    );

    if (!isValid) {
      this.logger.warn('WeChatPay notify signature verification failed');
      return { valid: false };
    }

    // 解密数据
    try {
      const data = JSON.parse(body);
      const resource = data.resource;
      const decrypted = this.decryptNotifyData(
        resource.ciphertext,
        resource.nonce,
        resource.associated_data || 'transaction',
        config.apiV3Key,
      );

      this.logger.log(`WeChatPay notify verified for order: ${decrypted.out_trade_no}`);
      return {
        valid: true,
        orderNo: decrypted.out_trade_no,
        tradeNo: decrypted.transaction_id,
        amount: decrypted.amount?.total,
        status: decrypted.trade_state,
      };
    } catch (error) {
      this.logger.error(`Failed to decrypt WeChatPay notify data: ${error}`);
      return { valid: false };
    }
  }

  /**
   * 生成随机串
   */
  private generateNonceStr(length: number = 32): string {
    return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
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
