/**
 * 易支付接口定义（V1 MD5 签名，与官方 SDK 一致）
 */

/**
 * 易支付配置
 *
 * 字段映射：
 * - merchant_id → pid（商户ID）
 * - merchant_key → 密钥（MD5 签名密钥）
 */
export interface EPayConfig {
  /** 商户ID */
  pid: string;
  /** 商户密钥（MD5） */
  key: string;
  /** API网关地址 */
  apiEndpoint: string;
  /** 异步通知地址 */
  notifyUrl: string;
  /** 同步跳转地址 */
  returnUrl: string;
}

/**
 * 支付方式
 */
export type EPayType = 'alipay' | 'wxpay';

/**
 * 创建订单请求
 */
export interface EPayCreateOrderParams {
  /** 商户订单号 */
  outTradeNo: string;
  /** 支付方式 */
  type: EPayType;
  /** 商品名称 */
  name: string;
  /** 金额（元） */
  money: string;
  /** 网站名称 */
  sitename?: string;
}

/**
 * 易支付提交参数
 */
export interface EPaySubmitParams {
  pid: string;
  type: EPayType;
  out_trade_no: string;
  notify_url: string;
  return_url?: string;
  name: string;
  money: string;
  clientip?: string;
  sign: string;
  sign_type: 'MD5';
}

/**
 * 易支付异步通知参数
 */
export interface EPayNotifyParams {
  pid: string;
  trade_no: string;
  out_trade_no: string;
  type: EPayType;
  name: string;
  money: string;
  trade_status: 'TRADE_SUCCESS' | 'TRADE_FINISHED';
  param?: string;
  sign: string;
  sign_type: string;
}

/**
 * 易支付查询订单响应
 */
export interface EPayQueryResponse {
  code: number;
  msg: string;
  data?: {
    pid: string;
    type: string;
    name: string;
    money: string;
    out_trade_no: string;
    trade_no: string;
    trade_status: string;
  };
}

/**
 * 订单状态
 */
export type EPayTradeStatus = 'TRADE_SUCCESS' | 'TRADE_FINISHED' | 'WAIT_BUYER_PAY' | 'TRADE_CLOSED';
