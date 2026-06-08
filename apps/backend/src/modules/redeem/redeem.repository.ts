import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * 兑换码数据仓库
 */
@Injectable()
export class RedeemRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 根据兑换码查找
   */
  async findByCode(code: string) {
    return this.prisma.redeemCode.findUnique({
      where: { code },
      include: {
        user: {
          select: { id: true, email: true, display_name: true },
        },
      },
    });
  }

  /**
   * 创建兑换码
   */
  async create(data: {
    code: string;
    type: string;
    value: number;
    max_uses: number;
    expires_at: Date | null;
    created_by: string;
  }) {
    return this.prisma.redeemCode.create({
      data: {
        code: data.code,
        type: data.type,
        value: data.value,
        max_uses: data.max_uses,
        expires_at: data.expires_at,
        created_by: data.created_by,
      },
    });
  }

  /**
   * 增加兑换码使用次数（原子操作）
   */
  async incrementUsedCount(codeId: string) {
    return this.prisma.redeemCode.update({
      where: { id: codeId },
      data: {
        used_count: { increment: 1 },
      },
    });
  }

  /**
   * 创建兑换记录
   */
  async createRecord(data: {
    user_id: string;
    code_id: string;
    reward: number;
  }) {
    return this.prisma.redeemRecord.create({
      data,
    });
  }

  /**
   * 检查用户是否已使用过该兑换码
   */
  async hasUserUsedCode(userId: string, codeId: string): Promise<boolean> {
    const count = await this.prisma.redeemRecord.count({
      where: {
        user_id: userId,
        code_id: codeId,
      },
    });
    return count > 0;
  }

  /**
   * 获取兑换码列表（管理员）
   */
  async findAll(page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;

    const [items, total] = await Promise.all([
      this.prisma.redeemCode.findMany({
        skip,
        take: pageSize,
        orderBy: { created_at: 'desc' },
        include: {
          user: {
            select: { id: true, email: true, display_name: true },
          },
          records: {
            select: { id: true, created_at: true },
          },
        },
      }),
      this.prisma.redeemCode.count(),
    ]);

    return { items, total };
  }

  /**
   * 删除兑换码
   */
  async delete(codeId: string) {
    return this.prisma.redeemCode.delete({
      where: { id: codeId },
    });
  }

  /**
   * 更新兑换码
   */
  async update(codeId: string, data: {
    is_active?: boolean;
    expires_at?: Date | null;
    max_uses?: number;
  }) {
    return this.prisma.redeemCode.update({
      where: { id: codeId },
      data,
    });
  }
}
