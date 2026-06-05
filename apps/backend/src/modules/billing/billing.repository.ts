import { Injectable, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { Prisma, UserBalance, UserTransaction } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * 计费数据访问层
 *
 * 封装余额和交易流水相关的数据库操作。
 * 余额操作必须使用事务保证原子性。
 */
@Injectable()
export class BillingRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 创建用户余额
   */
  async createBalance(userId: string, initialAmount: number = 0): Promise<UserBalance> {
    return this.prisma.userBalance.create({
      data: {
        user_id: userId,
        amount: initialAmount,
      },
    });
  }

  /**
   * 获取用户余额
   */
  async getBalance(userId: string): Promise<UserBalance | null> {
    return this.prisma.userBalance.findUnique({
      where: { user_id: userId },
    });
  }

  /**
   * 扣减余额（事务）
   *
   * 保证扣余额和写流水的原子性。
   *
   * @param userId - 用户 ID
   * @param amount - 扣减金额（分）
   * @param orderId - 关联订单 ID（可选）
   * @param remark - 备注
   * @returns 交易记录
   * @throws {Error} 余额不足
   */
  async deductBalance(
    userId: string,
    amount: number,
    orderId?: string,
    remark?: string,
  ): Promise<UserTransaction> {
    return this.prisma.$transaction(async (tx) => {
      // 1. 检查余额（SELECT ... FOR UPDATE 防止并发超扣）
      const [balance] = await tx.$queryRaw<
        Array<{ user_id: string; amount: number; frozen: number }>
      >`SELECT user_id, amount, frozen FROM user_balances WHERE user_id = ${userId} FOR UPDATE`;

      if (!balance) {
        throw new NotFoundException('User balance not found');
      }

      const available = balance.amount - balance.frozen;
      if (available < amount) {
        throw new HttpException(
          `Insufficient balance: required ${amount}, available ${available}`,
          HttpStatus.PAYMENT_REQUIRED,
        );
      }

      // 2. 扣减余额
      const updatedBalance = await tx.userBalance.update({
        where: { user_id: userId },
        data: { amount: { decrement: amount } },
      });

      // 3. 写入流水
      const transaction = await tx.userTransaction.create({
        data: {
          user_id: userId,
          type: 'DEDUCT',
          amount: -amount,
          balance_after: updatedBalance.amount,
          order_id: orderId,
          remark: remark || 'API usage',
        },
      });

      return transaction;
    });
  }

  /**
   * 充值余额（事务）
   *
   * @param userId - 用户 ID
   * @param amount - 充值金额（分）
   * @param remark - 备注
   * @returns 交易记录
   */
  async rechargeBalance(
    userId: string,
    amount: number,
    remark?: string,
  ): Promise<UserTransaction> {
    return this.prisma.$transaction(async (tx) => {
      // 1. 增加余额
      const updatedBalance = await tx.userBalance.update({
        where: { user_id: userId },
        data: { amount: { increment: amount } },
      });

      // 2. 写入流水
      const transaction = await tx.userTransaction.create({
        data: {
          user_id: userId,
          type: 'RECHARGE',
          amount,
          balance_after: updatedBalance.amount,
          remark: remark || 'Recharge',
        },
      });

      return transaction;
    });
  }

  /**
   * 获取用户交易流水
   */
  async getTransactions(
    userId: string,
    params: {
      skip?: number;
      take?: number;
      orderBy?: Prisma.UserTransactionOrderByWithRelationInput;
      where?: Prisma.UserTransactionWhereInput;
    },
  ): Promise<UserTransaction[]> {
    return this.prisma.userTransaction.findMany({
      where: {
        user_id: userId,
        ...params.where,
      },
      skip: params.skip,
      take: params.take,
      orderBy: params.orderBy || { created_at: 'desc' },
    });
  }

  /**
   * 统计用户交易数量
   */
  async countTransactions(
    userId: string,
    where?: Prisma.UserTransactionWhereInput,
  ): Promise<number> {
    return this.prisma.userTransaction.count({
      where: {
        user_id: userId,
        ...where,
      },
    });
  }

  /**
   * 获取模型定价
   */
  async getModelPricing(modelName: string) {
    return this.prisma.modelPricing.findFirst({
      where: { model: { name: modelName } },
      include: { model: true },
    });
  }
}
