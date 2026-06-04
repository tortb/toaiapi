import { Injectable, Logger } from '@nestjs/common';
import { BillingService } from '../billing/billing.service';
import { RequestLogService } from '../request-log/request-log.service';

/**
 * 余额业务服务
 *
 * 提供余额查询、充值、交易流水查询等功能。
 * 作为 BillingService 和 RequestLogService 的上层封装，提供用户友好的接口。
 */
@Injectable()
export class BalanceService {
  private readonly logger = new Logger(BalanceService.name);

  constructor(
    private readonly billingService: BillingService,
    private readonly requestLogService: RequestLogService,
  ) {}

  /**
   * 获取用户余额
   *
   * @param userId - 用户 ID
   * @returns 余额信息（分）：amount, frozen, available
   */
  async getBalance(userId: string) {
    return this.billingService.getBalance(userId);
  }

  /**
   * 充值余额（管理员操作）
   *
   * @param userId - 目标用户 ID
   * @param amount - 充值金额（分），必须为正整数
   * @param remark - 备注
   * @returns 充值后的余额
   */
  async recharge(userId: string, amount: number, remark?: string) {
    await this.billingService.recharge(userId, amount, remark);
    return this.getBalance(userId);
  }

  /**
   * 获取交易流水
   *
   * @param userId - 用户 ID
   * @param page - 页码（从 1 开始）
   * @param pageSize - 每页数量（1-100）
   */
  async getTransactions(userId: string, page: number, pageSize: number) {
    return this.billingService.getTransactions(userId, page, pageSize);
  }

  /**
   * 获取请求日志
   *
   * @param userId - 用户 ID
   * @param page - 页码（从 1 开始）
   * @param pageSize - 每页数量（1-100）
   */
  async getRequestLogs(userId: string, page: number, pageSize: number) {
    return this.requestLogService.getUserLogs(userId, page, pageSize);
  }
}
