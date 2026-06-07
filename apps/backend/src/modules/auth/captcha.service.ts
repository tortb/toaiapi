import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, createHmac, randomUUID } from 'crypto';
import { fetchWithPool } from '../../common/http/http-agent';

interface VerifyCaptchaResponse {
  Success?: boolean;
  Code?: string;
  Message?: string;
  RequestId?: string;
  Result?: {
    VerifyResult?: boolean;
    VerifyCode?: string;
  };
}

/**
 * 阿里云验证码 2.0 服务端验签。
 *
 * 使用 HTTPS 原生调用 VerifyIntelligentCaptcha，避免新增 SDK 依赖。
 */
@Injectable()
export class CaptchaService {
  private readonly logger = new Logger(CaptchaService.name);

  constructor(private readonly config: ConfigService) {}

  async verify(sceneId: string, captchaVerifyParam: string, region?: string): Promise<boolean> {
    if (!sceneId) {
      throw new BadRequestException('验证码场景未配置');
    }
    if (!captchaVerifyParam) {
      throw new BadRequestException('请完成验证码验证');
    }

    const accessKeyId = this.getConfigValue([
      'ALIYUN_CAPTCHA_ACCESS_KEY_ID',
      'ALIBABA_CLOUD_ACCESS_KEY_ID',
      'ALICLOUD_ACCESS_KEY_ID',
    ]);
    const accessKeySecret = this.getConfigValue([
      'ALIYUN_CAPTCHA_ACCESS_KEY_SECRET',
      'ALIBABA_CLOUD_ACCESS_KEY_SECRET',
      'ALICLOUD_ACCESS_KEY_SECRET',
    ]);

    if (!accessKeyId || !accessKeySecret) {
      this.logger.error('Aliyun captcha AccessKey is not configured');
      throw new BadRequestException('验证码服务端验签未配置');
    }

    const endpoint = this.getEndpoint(region);
    const body = new URLSearchParams({
      CaptchaVerifyParam: captchaVerifyParam,
      SceneId: sceneId,
    }).toString();

    const headers = this.buildSignedHeaders({
      endpoint,
      body,
      accessKeyId,
      accessKeySecret,
    });

    try {
      const response = await fetchWithPool(endpoint, {
        method: 'POST',
        headers,
        body,
        signal: AbortSignal.timeout(5000),
      });

      const text = await response.text();
      let data: VerifyCaptchaResponse;
      try {
        data = JSON.parse(text) as VerifyCaptchaResponse;
      } catch {
        this.logger.warn('Aliyun captcha returned non-JSON response: status=' + response.status);
        return false;
      }

      if (!response.ok || !data.Success) {
        this.logger.warn('Aliyun captcha API failed: status=' + response.status + ', code=' + (data.Code || 'unknown') + ', requestId=' + (data.RequestId || '-'));
        return false;
      }

      const verifyCode = data.Result?.VerifyCode;
      const passed = data.Result?.VerifyResult === true && (verifyCode === 'T001' || verifyCode === 'T005');
      if (!passed) {
        this.logger.warn('Aliyun captcha rejected request: verifyCode=' + (verifyCode || 'unknown') + ', requestId=' + (data.RequestId || '-'));
      }

      return passed;
    } catch (error) {
      this.logger.error('Aliyun captcha verification failed: ' + (error instanceof Error ? error.message : error));
      return false;
    }
  }

  private getConfigValue(keys: string[]): string | undefined {
    for (const key of keys) {
      const value = this.config.get<string>(key);
      if (value) return value;
    }
    return undefined;
  }

  private getEndpoint(region?: string): string {
    const override = this.config.get<string>('ALIYUN_CAPTCHA_ENDPOINT');
    if (override) {
      return override.startsWith('http') ? override : 'https://' + override;
    }

    switch (region) {
      case 'sgp':
      case 'ap-southeast-1':
        return 'https://captcha.ap-southeast-1.aliyuncs.com';
      case 'cn':
      case 'cn-shanghai':
      default:
        return 'https://captcha.cn-shanghai.aliyuncs.com';
    }
  }

  private buildSignedHeaders(params: {
    endpoint: string;
    body: string;
    accessKeyId: string;
    accessKeySecret: string;
  }): Record<string, string> {
    const { endpoint, body, accessKeyId, accessKeySecret } = params;
    const host = new URL(endpoint).host;
    const contentSha256 = this.sha256Hex(body);
    const securityToken = this.getConfigValue([
      'ALIYUN_CAPTCHA_SECURITY_TOKEN',
      'ALIBABA_CLOUD_SECURITY_TOKEN',
      'ALICLOUD_SECURITY_TOKEN',
    ]);

    const signedHeaderValues: Record<string, string> = {
      'content-type': 'application/x-www-form-urlencoded',
      host,
      'x-acs-action': 'VerifyIntelligentCaptcha',
      'x-acs-content-sha256': contentSha256,
      'x-acs-date': new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
      'x-acs-signature-nonce': randomUUID().replace(/-/g, ''),
      'x-acs-version': '2023-03-05',
    };

    if (securityToken) {
      signedHeaderValues['x-acs-security-token'] = securityToken;
    }

    const signedHeaders = Object.keys(signedHeaderValues).sort();
    const canonicalHeaders = signedHeaders
      .map((key) => key + ':' + (signedHeaderValues[key]?.trim() || '') + '\n')
      .join('');
    const signedHeadersString = signedHeaders.join(';');
    const canonicalRequest = [
      'POST',
      '/',
      '',
      canonicalHeaders,
      signedHeadersString,
      contentSha256,
    ].join('\n');
    const stringToSign = 'ACS3-HMAC-SHA256\n' + this.sha256Hex(canonicalRequest);
    const signature = createHmac('sha256', accessKeySecret).update(stringToSign).digest('hex');

    return {
      'Content-Type': signedHeaderValues['content-type']!,
      Host: signedHeaderValues['host']!,
      'x-acs-action': signedHeaderValues['x-acs-action']!,
      'x-acs-content-sha256': signedHeaderValues['x-acs-content-sha256']!,
      'x-acs-date': signedHeaderValues['x-acs-date']!,
      'x-acs-signature-nonce': signedHeaderValues['x-acs-signature-nonce']!,
      'x-acs-version': signedHeaderValues['x-acs-version']!,
      ...(securityToken ? { 'x-acs-security-token': securityToken } : {}),
      Authorization: 'ACS3-HMAC-SHA256 Credential=' + accessKeyId + ',SignedHeaders=' + signedHeadersString + ',Signature=' + signature,
    };
  }

  private sha256Hex(value: string): string {
    return createHash('sha256').update(value, 'utf8').digest('hex');
  }
}
