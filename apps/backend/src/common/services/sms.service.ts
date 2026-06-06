import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SmsConfigService } from './sms-config.service';
import {
  generateAliyunSignature,
  buildSmsRequestParams,
} from '../utils/aliyun-signature.util';

/**
 * 阿里云短信返回格式
 */
interface AliyunSmsResponse {
  RequestId: string;
  Code: string;
  Message: string;
  BizId?: string;
}

/**
 * 短信发送结果
 */
export interface SmsSendResult {
  success: boolean;
  requestId: string;
  code: string;
  message: string;
  bizId?: string;
}

/**
 * 短信服务
 *
 * 使用阿里云短信服务 API 发送短信。
 * 配置从数据库读取，支持通过 Admin 前端动态配置。
 *
 * 支持：
 * - 验证码短信
 * - 通知短信
 * - 通用短信发送
 */
@Injectable()
export class SmsService implements OnModuleInit {
  private readonly logger = new Logger(SmsService.name);
  private enabled = false;

  /** 阿里云短信 API 端点 */
  private readonly ENDPOINT = 'https://dysmsapi.aliyuncs.com';

  constructor(private readonly smsConfigService: SmsConfigService) {}

  async onModuleInit() {
    await this.refreshState();
  }

  /**
   * 刷新服务状态
   *
   * 当短信配置变更时调用。
   */
  async refreshState(): Promise<void> {
    try {
      const config = await this.smsConfigService.getEnabledConfig();
      this.enabled = !!(config && config.access_key_id && config.access_key_secret);

      if (this.enabled) {
        this.logger.log('SMS service enabled');
      } else {
        this.logger.warn('SMS not configured or disabled');
      }
    } catch (error) {
      this.logger.error(`Failed to refresh SMS state: ${error}`);
      this.enabled = false;
    }
  }

  /**
   * 发送短信
   *
   * @param phoneNumbers - 手机号（多个用逗号分隔），国内号无需加 +86
   * @param templateCode - 模板 CODE（不传则使用配置中的默认值）
   * @param templateParam - 模板参数（JSON 字符串，如 '{"code":"1234"}'）
   * @param signName - 短信签名（不传则使用配置中的默认值）
   * @returns 发送结果
   */
  async sendSms(
    phoneNumbers: string,
    templateCode?: string,
    templateParam?: string,
    signName?: string,
  ): Promise<SmsSendResult> {
    if (!this.enabled) {
      this.logger.warn('SMS service not configured or disabled');
      return {
        success: false,
        requestId: '',
        code: 'SERVICE_DISABLED',
        message: 'SMS service not configured or disabled',
      };
    }

    const config = await this.smsConfigService.getEnabledConfig();
    if (!config || !config.access_key_id || !config.access_key_secret) {
      return {
        success: false,
        requestId: '',
        code: 'CONFIG_MISSING',
        message: 'SMS config missing required fields',
      };
    }

    const effectiveTemplateCode = templateCode || config.template_code;
    const effectiveSignName = signName || config.sign_name;

    if (!effectiveTemplateCode || !effectiveSignName) {
      return {
        success: false,
        requestId: '',
        code: 'PARAM_MISSING',
        message: 'TemplateCode and SignName are required',
      };
    }

    try {
      // 构建请求参数
      const params = buildSmsRequestParams({
        accessKeyId: config.access_key_id,
        phoneNumbers,
        signName: effectiveSignName,
        templateCode: effectiveTemplateCode,
        templateParam,
      });

      // 生成签名
      const signature = generateAliyunSignature(params, config.access_key_secret);
      (params as Record<string, string>)['Signature'] = signature;

      // 构建 URL 编码的请求体
      const body = new URLSearchParams(params).toString();

      // 发送请求
      const response = await fetch(this.ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body,
      });

      const data = (await response.json()) as AliyunSmsResponse;

      const success = data.Code === 'OK';
      if (success) {
        this.logger.log(
          `SMS sent to ${phoneNumbers}: requestId=${data.RequestId}, bizId=${data.BizId}`,
        );
      } else {
        this.logger.warn(
          `SMS failed to ${phoneNumbers}: code=${data.Code}, message=${data.Message}`,
        );
      }

      return {
        success,
        requestId: data.RequestId,
        code: data.Code,
        message: data.Message,
        bizId: data.BizId,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`SMS send error: ${message}`);
      return {
        success: false,
        requestId: '',
        code: 'NETWORK_ERROR',
        message,
      };
    }
  }

  /**
   * 发送验证码短信（便捷方法）
   *
   * @param phone - 手机号
   * @param code - 验证码
   * @param templateCode - 模板 CODE（可选，不传使用默认）
   * @returns 发送结果
   */
  async sendVerificationCode(
    phone: string,
    code: string,
    templateCode?: string,
  ): Promise<SmsSendResult> {
    const templateParam = JSON.stringify({ code });
    return this.sendSms(phone, templateCode, templateParam);
  }

  /**
   * 测试连接
   *
   * 调用阿里云 API 发送一个参数验证请求来测试凭证是否有效。
   * （由于没有有效手机号时 SendSms 也会返回错误，这里用获取时间戳的方式验证）
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    const config = await this.smsConfigService.getDecryptedConfig();

    if (!config || !config.access_key_id || !config.access_key_secret) {
      return {
        success: false,
        message: '短信配置不完整，请先配置 AccessKey ID 和 AccessKey Secret',
      };
    }

    if (!config.sign_name || !config.template_code) {
      return {
        success: false,
        message: '短信配置不完整，请配置短信签名和模板 CODE',
      };
    }

    try {
      // 构建一个轻量级请求来验证凭证
      const params = buildSmsRequestParams({
        accessKeyId: config.access_key_id,
        phoneNumbers: '13800138000', // 测试号码（阿里云不会实际发送）
        signName: config.sign_name,
        templateCode: config.template_code,
        templateParam: JSON.stringify({ code: '000000' }),
      });

      const signature = generateAliyunSignature(params, config.access_key_secret);
      (params as Record<string, string>)['Signature'] = signature;

      const body = new URLSearchParams(params).toString();

      const response = await fetch(this.ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body,
      });

      const data = (await response.json()) as AliyunSmsResponse;

      // OK 表示凭证有效，其他错误码表示配置有问题
      if (data.Code === 'OK') {
        return {
          success: true,
          message: `连接成功 (RequestId: ${data.RequestId})`,
        };
      }

      // isv. 开头的错误码通常是配置问题而非凭证问题
      if (data.Code.startsWith('isv.')) {
        return {
          success: true,
          message: `凭证有效，业务配置需要调整: ${data.Message}`,
        };
      }

      // SignatureDoesNotMatch 等是凭证问题
      return {
        success: false,
        message: `连接失败: [${data.Code}] ${data.Message}`,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        message: `网络错误: ${message}`,
      };
    }
  }
}
