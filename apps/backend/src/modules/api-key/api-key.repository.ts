import { Injectable } from '@nestjs/common';
import { Prisma, ApiKey } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

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
  async findByUserId(userId: string): Promise<ApiKey[]> {
    return this.prisma.apiKey.findMany({
      where: { user_id: userId },
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
}
