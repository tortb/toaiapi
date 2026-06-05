import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * 用户数据访问层
 *
 * 封装所有 User 相关的数据库操作。
 * 只负责数据访问，不包含业务逻辑。
 */
@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 根据 ID 查找用户
   */
  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id, deleted_at: null },
    });
  }

  /**
   * 根据邮箱查找用户
   * SECURITY: 排除已软删除的用户，防止信息泄露和已删除用户登录
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email, deleted_at: null },
    });
  }

  /**
   * 创建用户
   */
  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data });
  }

  /**
   * 更新用户
   */
  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return this.prisma.user.update({
      where: { id, deleted_at: null },
      data,
    });
  }

  /**
   * 软删除用户
   */
  async softDelete(id: string): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }

  /**
   * 检查邮箱是否已注册
   */
  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: { email },
    });
    return count > 0;
  }

  /**
   * 获取用户列表（分页）
   */
  async findMany(params: {
    skip?: number;
    take?: number;
    orderBy?: Prisma.UserOrderByWithRelationInput;
    where?: Prisma.UserWhereInput;
  }): Promise<User[]> {
    const { skip, take, orderBy, where } = params;
    return this.prisma.user.findMany({
      skip,
      take,
      orderBy,
      where: {
        ...where,
        deleted_at: null,
      },
    });
  }

  /**
   * 统计用户数量
   */
  async count(where?: Prisma.UserWhereInput): Promise<number> {
    return this.prisma.user.count({
      where: {
        ...where,
        deleted_at: null,
      },
    });
  }
}
