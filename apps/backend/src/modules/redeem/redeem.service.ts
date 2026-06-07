import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { RedeemRepository } from './redeem.repository';
import { BalanceService } from '../balance/balance.service';

/**
 * 兑换码业务服务
 *
 * 核心职责：
 * 1. 兑换码生成
 * 2. 兑换码验证
 * 3. 兑换逻辑处理
 * 4. 余额更新
 */
@Injectable()
export class RedeemService {
  private readonly logger = new Logger(RedeemService.name);

  constructor(
    private readonly redeemRepo: RedeemRepository,
    private readonly balanceService: BalanceService,
  ) {}

  /**
   * 用户兑换码
   *
   * 流程：
   * 1. 验证兑换码是否存在且有效
   * 2. 检查是否已达到使用上限
   * 3. 检查用户是否已使用过
   * 4. 计算奖励金额
   * 5. 增加用户余额
   * 6. 记录兑换记录
   *
   * @param userId - 用户 ID
   * @param code - 兑换码
   * @returns 兑换结果（奖励金额）
   */
  async redeemCode(userId: string, code: string) {
    // 1. 验证兑换码
    const redeemCode = await this.redeemRepo.findByCode(code.toUpperCase());

    if (!redeemCode) {
      throw new BadRequestException('兑换码不存在');
    }

    if (!redeemCode.is_active) {
      throw new BadRequestException('兑换码已失效');
    }

    if (redeemCode.expires_at && new Date() > redeemCode.expires_at) {
      throw new BadRequestException('兑换码已过期');
    }

    // 2. 检查使用上限
    if (redeemCode.used_count >= redeemCode.max_uses) {
      throw new BadRequestException('兑换码已达到使用上限');
    }

    // 3. 检查用户是否已使用过
    const hasUsed = await this.redeemRepo.hasUserUsedCode(userId, redeemCode.id);
    if (hasUsed) {
      throw new BadRequestException('您已使用过此兑换码');
    }

    // 4. 计算奖励金额（分）
    let reward = 0;
    if (redeemCode.type === 'FIXED') {
      reward = redeemCode.value; // 固定金额（分）
    } else if (redeemCode.type === 'PERCENTAGE') {
      // 百分比模式暂不支持（需要基于用户充值金额计算）
      throw new BadRequestException('百分比兑换码暂不支持');
    }

    try {
      // 5. 增加用户余额
      await this.balanceService.addBalance(userId, reward, `兑换码：${code}`);

      // 6. 增加使用次数
      await this.redeemRepo.incrementUsedCount(redeemCode.id);

      // 7. 创建兑换记录
      await this.redeemRepo.createRecord({
        user_id: userId,
        code_id: redeemCode.id,
        reward,
      });

      this.logger.log(
        `User ${userId} redeemed code ${code}, reward: ${reward / 100}元`,
      );

      return {
        code,
        reward,
        rewardYuan: reward / 100,
      };
    } catch (error) {
      this.logger.error(`Redeem failed for user ${userId}: ${error}`);
      throw new BadRequestException('兑换失败，请稍后再试');
    }
  }

  /**
   * 生成兑换码
   *
   * @param adminId - 管理员 ID
   * @param type - 类型（FIXED/PERCENTAGE）
   * @param value - 值（分或百分比）
   * @param count - 生成数量
   * @param maxUses - 每个码的最大使用次数
   * @param expiresAt - 过期时间
   * @returns 生成的兑换码列表
   */
  async generateCodes(
    adminId: string,
    type: string,
    value: number,
    count: number,
    maxUses: number,
    expiresAt: Date | null,
  ) {
    if (count < 1 || count > 1000) {
      throw new BadRequestException('生成数量必须在 1-1000 之间');
    }

    if (value <= 0) {
      throw new BadRequestException('金额必须大于 0');
    }

    if (maxUses < 1) {
      throw new BadRequestException('最大使用次数必须大于 0');
    }

    const codes: string[] = [];

    for (let i = 0; i < count; i++) {
      const code = this.generateRandomCode();
      await this.redeemRepo.create({
        code,
        type,
        value,
        max_uses: maxUses,
        expires_at: expiresAt,
        created_by: adminId,
      });
      codes.push(code);
    }

    this.logger.log(
      `Admin ${adminId} generated ${count} redeem codes, type=${type}, value=${value}`,
    );

    return codes;
  }

  /**
   * 获取兑换码列表（管理员）
   */
  async listCodes(page: number, pageSize: number) {
    return this.redeemRepo.findAll(page, pageSize);
  }

  /**
   * 删除兑换码（管理员）
   */
  async deleteCode(codeId: string) {
    return this.redeemRepo.delete(codeId);
  }

  /**
   * 更新兑换码（管理员）
   */
  async updateCode(
    codeId: string,
    data: {
      is_active?: boolean;
      expires_at?: Date | null;
      max_uses?: number;
    },
  ) {
    return this.redeemRepo.update(codeId, data);
  }

  /**
   * 生成随机兑换码
   * 格式：8位大写字母+数字
   */
  private generateRandomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 移除容易混淆的字符 I,O,0,1
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
}
