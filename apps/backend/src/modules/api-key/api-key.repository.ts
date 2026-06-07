import { Injectable } from '@nestjs/common';
import { Prisma, ApiKey } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export type ApiKeyWithGroup = ApiKey & {
  group: { id: string; name: string; display_name: string } | null;
};

export type ApiKeyUsageWindow = {
  today: number;
  thirtyDays: number;
};

/**
 * API Key 数据访问层
 *
 * 封装所有 ApiKey 相关的数据库操作。
 */
@Injectable()
export class ApiKeyRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 根据 ID 查找
   */
  async findById(id: string): Promise<ApiKey | null> {
    return this.prisma.apiKey.findUnique({
      where: { id },
    });
  }

  /**
   * 根据 key_hash 查找
   */
  async findByKeyHash(keyHash: string): Promise<ApiKey | null> {
    return this.prisma.apiKey.findUnique({
      where: { key_hash: keyHash },
    });
  }

  /**
   * 根据 key_prefix 查找
   */
  async findByKeyPrefix(prefix: string): Promise<ApiKey | null> {
    return this.prisma.apiKey.findFirst({
      where: { key_prefix: prefix },
    });
  }

  /**
   * 根据用户分组 ID 或名称查找分组。
   */
  async findGroupByIdOrName(identifier: string): Promise<{ id: string; name: string; display_name: string } | null> {
    return this.prisma.userGroup.findFirst({
      where: {
        deleted_at: null,
        OR: [
          { id: identifier },
          { name: identifier },
        ],
      },
      select: {
        id: true,
        name: true,
        display_name: true,
      },
    });
  }

  /**
   * 查询用户所属分组，用于 API Key 数量上限。
   */
  async findUserGroupLimit(userId: string): Promise<number | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        group: {
          select: { max_api_keys: true },
        },
      },
    });
    return user?.group?.max_api_keys ?? null;
  }

  /**
   * 创建 API Key
   */
  async create(data: Prisma.ApiKeyCreateInput): Promise<ApiKey> {
    return this.prisma.apiKey.create({ data });
  }

  /**
   * 更新 API Key
   */
  async update(id: string, data: Prisma.ApiKeyUpdateInput): Promise<ApiKey> {
    return this.prisma.apiKey.update({
      where: { id },
      data,
    });
  }

  /**
   * 删除 API Key
   */
  async delete(id: string): Promise<ApiKey> {
    return this.prisma.apiKey.delete({
      where: { id },
    });
  }

  /**
   * 获取用户的 API Key 列表
   */
  async findByUserId(userId: string): Promise<ApiKeyWithGroup[]> {
    return this.prisma.apiKey.findMany({
      where: { user_id: userId },
      include: {
        group: {
          select: { id: true, name: true, display_name: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  /**
   * 统计用户的 API Key 数量
   */
  async countByUserId(userId: string): Promise<number> {
    return this.prisma.apiKey.count({
      where: { user_id: userId },
    });
  }

  /**
   * 批量统计 API Key 在今日与近 30 天内的消费，单位为分。
   */
  async getBatchKeyUsage(keyIds: string[], now = new Date()): Promise<Map<string, ApiKeyUsageWindow>> {
    const uniqueIds = [...new Set(keyIds.filter(Boolean))];
    const usageMap = new Map<string, ApiKeyUsageWindow>();
    for (const id of uniqueIds) {
      usageMap.set(id, { today: 0, thirtyDays: 0 });
    }
    if (uniqueIds.length === 0) return usageMap;

    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const thirtyDaysStart = new Date(now);
    thirtyDaysStart.setDate(thirtyDaysStart.getDate() - 29);
    thirtyDaysStart.setHours(0, 0, 0, 0);

    const [todayRows, thirtyDayRows] = await Promise.all([
      this.prisma.requestLog.groupBy({
        by: ['api_key_id'],
        where: {
          api_key_id: { in: uniqueIds },
          created_at: { gte: todayStart, lte: now },
        },
        _sum: { cost: true },
      }),
      this.prisma.requestLog.groupBy({
        by: ['api_key_id'],
        where: {
          api_key_id: { in: uniqueIds },
          created_at: { gte: thirtyDaysStart, lte: now },
        },
        _sum: { cost: true },
      }),
    ]);

    for (const row of todayRows) {
      const usage = usageMap.get(row.api_key_id);
      if (usage) usage.today = row._sum.cost ?? 0;
    }

    for (const row of thirtyDayRows) {
      const usage = usageMap.get(row.api_key_id);
      if (usage) usage.thirtyDays = row._sum.cost ?? 0;
    }

    return usageMap;
  }

  /**
   * 记录 API Key 使用（原子操作）
   * 更新最后使用时间并自增请求计数
   */
  async recordUsage(keyId: string): Promise<void> {
    await this.prisma.apiKey.update({
      where: { id: keyId },
      data: {
        last_used_at: new Date(),
        total_requests: { increment: 1 },
      },
    });
  }
}
