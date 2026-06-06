import { createHmac, randomUUID } from 'crypto';

/**
 * Aliyun API V1 签名工具
 *
 * 用于阿里云短信服务 (Dysmsapi) 的请求签名。
 * 签名算法：HMAC-SHA1，符合阿里云 RPC 调用规范。
 *
 * 参考文档：https://help.aliyun.com/zh/sdk/product-overview/v3-request-structure-and-signature
 */

/**
 * RFC 3986 标准的 URL 编码
 *
 * 阿里云签名要求对特殊字符进行严格编码：
 * - 字母数字和 - _ . ~ 不编码
 * - 其他字符编码为 %XX（大写）
 * - 空格编码为 %20（不是 +）
 */
function percentEncode(str: string): string {
  return encodeURIComponent(str)
    .replace(/!/g, '%21')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/\*/g, '%2A')
    .replace(/\+/g, '%20')
    .replace(/~/g, '%7E');
}

/**
 * 生成 ISO 8601 格式的 UTC 时间戳
 *
 * 格式：YYYY-MM-DDThh:mm:ssZ
 * 例如：2024-01-01T12:00:00Z
 */
function generateTimestamp(): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  const hours = String(now.getUTCHours()).padStart(2, '0');
  const minutes = String(now.getUTCMinutes()).padStart(2, '0');
  const seconds = String(now.getUTCSeconds()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}Z`;
}

/**
 * 生成签名随机数
 */
function generateSignatureNonce(): string {
  return randomUUID();
}

/**
 * 阿里云签名参数构建接口
 */
export interface AliyunSignatureParams {
  AccessKeyId: string;
  Action: string;
  /** 额外参数（如 PhoneNumbers、SignName 等） */
  [key: string]: string;
}

/**
 * 生成阿里云 API V1 请求签名
 *
 * 签名步骤：
 * 1. 构建规范查询字符串（按 key 排序，URL 编码）
 * 2. 构建待签名字符串：HTTPMethod + "&" + percentEncode("/") + "&" + percentEncode(CanonicalQueryString)
 * 3. 使用 HMAC-SHA1 签名，密钥为 AccessKeySecret + "&"
 * 4. Base64 编码签名结果
 *
 * @param params - 所有请求参数（不含 Signature）
 * @param accessKeySecret - 阿里云 AccessKey Secret
 * @returns Base64 编码的签名字符串
 */
export function generateAliyunSignature(
  params: Record<string, string>,
  accessKeySecret: string,
  httpMethod: 'GET' | 'POST' = 'POST',
): string {
  // 1. 按参数 key 排序
  const sortedKeys = Object.keys(params).sort();

  // 2. 构建规范查询字符串
  const canonicalQueryString = sortedKeys
    .map((key) => `${percentEncode(key)}=${percentEncode(params[key] ?? '')}`)
    .join('&');

  // 3. 构建待签名字符串：HTTPMethod + "&" + percentEncode("/") + "&" + percentEncode(CanonicalQueryString)
  const stringToSign = httpMethod + '&' + percentEncode('/') + '&' + percentEncode(canonicalQueryString);

  // 4. HMAC-SHA1 签名
  const key = accessKeySecret + '&';
  const hmac = createHmac('sha1', key);
  hmac.update(stringToSign);

  // 5. Base64 编码
  return hmac.digest('base64');
}

/**
 * 构建阿里云 SMS SendSms API 的完整请求参数
 *
 * @param accessKeyId - 阿里云 AccessKey ID
 * @param phoneNumbers - 手机号（多个用逗号分隔），国内号无需加 +86
 * @param signName - 短信签名
 * @param templateCode - 模板 CODE
 * @param templateParam - 模板参数（JSON 字符串）
 * @returns 包含所有公共参数和业务参数的签名前参数对象
 */
export function buildSmsRequestParams(params: {
  accessKeyId: string;
  phoneNumbers: string;
  signName: string;
  templateCode: string;
  templateParam?: string;
}): Record<string, string> {
  return {
    AccessKeyId: params.accessKeyId,
    Action: 'SendSms',
    Format: 'JSON',
    PhoneNumbers: params.phoneNumbers,
    RegionId: 'cn-hangzhou',
    SignName: params.signName,
    SignatureMethod: 'HMAC-SHA1',
    SignatureNonce: generateSignatureNonce(),
    SignatureVersion: '1.0',
    TemplateCode: params.templateCode,
    TemplateParam: params.templateParam ?? '',
    Timestamp: generateTimestamp(),
    Version: '2017-05-25',
  };
}
