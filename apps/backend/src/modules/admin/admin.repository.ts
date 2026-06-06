import { Injectable } from '@nestjs/common';
import { Prisma, UserRole, UserStatus, ChannelStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Admin 数据访问层
 *
 * 封装 Admin 管理所需的数据库操作。
 * Provider / Channel / Model / User 的 CRUD 和聚合查询。
 */
@Injectable()
export class AdminRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ──────────────────────────────────────────────
  // Provider
  // ──────────────────────────────────────────────

  /**
   * 查询 Provider 列表（分页）
   *
   * @param params - 分页和筛选参数
   * @returns Provider 列表和总数
   */
  async findProviders(params: { skip?: number; take?: number; where?: Prisma.ProviderWhereInput }) {
    const [items, total] = await Promise.all([
      this.prisma.provider.findMany({
        where: params.where,
        skip: params.skip,
        take: params.take,
        orderBy: { created_at: 'desc' },
        include: {
          _count: { select: { channels: true } },
        },
      }),
      this.prisma.provider.count({ where: params.where }),
    ]);
    return { items, total };
  }

  /**
   * 根据 ID 查询 Provider（含关联 Channel）
   */
  async findProviderById(id: string) {
    return this.prisma.provider.findUnique({
      where: { id },
      include: {
        channels: {
          select: { id: true, name: true, is_active: true, status: true },
        },
      },
    });
  }

  /**
   * 根据名称查询 Provider
   */
  async findProviderByName(name: string) {
    return this.prisma.provider.findUnique({ where: { name } });
  }

  async createProvider(data: Prisma.ProviderCreateInput) {
    return this.prisma.provider.create({ data });
  }

  async updateProvider(id: string, data: Prisma.ProviderUpdateInput) {
    return this.prisma.provider.update({ where: { id }, data });
  }

  async deleteProvider(id: string) {
    return this.prisma.provider.delete({ where: { id } });
  }

  // ──────────────────────────────────────────────
  // Channel
  // ──────────────────────────────────────────────

  /**
   * 查询 Channel 列表（分页，含 Provider 和 Model 关联）
   */
  async findChannels(params: {
    skip?: number;
    take?: number;
    where?: Prisma.ChannelWhereInput;
  }) {
    const [items, total] = await Promise.all([
      this.prisma.channel.findMany({
        where: params.where,
        skip: params.skip,
        take: params.take,
        orderBy: [{ priority: 'desc' }, { weight: 'desc' }],
        include: {
          provider: { select: { id: true, name: true, display_name: true } },
          models: { select: { id: true } },
        },
      }),
      this.prisma.channel.count({ where: params.where }),
    ]);
    return { items, total };
  }

  /**
   * 根据 ID 查询 Channel（含 Provider 和 Model 详情）
   */
  async findChannelById(id: string) {
    return this.prisma.channel.findUnique({
      where: { id },
      include: {
        provider: { select: { id: true, name: true, display_name: true } },
        models: {
          include: { model: { select: { id: true, name: true, display_name: true } } },
        },
      },
    });
  }

  async createChannel(data: Prisma.ChannelCreateInput) {
    return this.prisma.channel.create({ data });
  }

  async updateChannel(id: string, data: Prisma.ChannelUpdateInput) {
    return this.prisma.channel.update({ where: { id }, data });
  }

  async deleteChannel(id: string) {
    return this.prisma.channel.delete({ where: { id } });
  }

  /**
   * 设置 Channel 状态
   *
   * @param id - Channel ID
   * @param status - 新状态（使用 Prisma 枚举类型）
   * @param isActive - 是否激活
   */
  async setChannelStatus(id: string, status: ChannelStatus, isActive: boolean) {
    return this.prisma.channel.update({
      where: { id },
      data: { status, is_active: isActive },
    });
  }

  // ──────────────────────────────────────────────
  // Model
  // ──────────────────────────────────────────────

  /**
   * 查询 Model 列表（分页，含定价）
   */
  async findModels(params: {
    skip?: number;
    take?: number;
    where?: Prisma.ModelWhereInput;
  }) {
    const [items, total] = await Promise.all([
      this.prisma.model.findMany({
        where: params.where,
        skip: params.skip,
        take: params.take,
        orderBy: { created_at: 'desc' },
        include: { pricing: true },
      }),
      this.prisma.model.count({ where: params.where }),
    ]);
    return { items, total };
  }

  /**
   * 根据 ID 查询 Model（含定价和 Channel 关联）
   */
  async findModelById(id: string) {
    return this.prisma.model.findUnique({
      where: { id },
      include: {
        pricing: true,
        channels: {
          include: { channel: { select: { id: true, name: true } } },
        },
      },
    });
  }

  async findModelByName(name: string) {
    return this.prisma.model.findUnique({ where: { name } });
  }

  async createModel(data: Prisma.ModelCreateInput) {
    return this.prisma.model.create({ data, include: { pricing: true } });
  }

  async updateModel(id: string, data: Prisma.ModelUpdateInput) {
    return this.prisma.model.update({ where: { id }, data, include: { pricing: true } });
  }

  async deleteModel(id: string) {
    return this.prisma.model.delete({ where: { id } });
  }

  async upsertModelPricing(modelId: string, data: Prisma.ModelPricingCreateWithoutModelInput) {
    return this.prisma.modelPricing.upsert({
      where: { model_id: modelId },
      create: { model_id: modelId, ...data },
      update: data,
    });
  }

  // ──────────────────────────────────────────────
  // User
  // ──────────────────────────────────────────────

  /**
   * 查询 User 列表（分页）
   */
  async findUsers(params: {
    skip?: number;
    take?: number;
    where?: Prisma.UserWhereInput;
  }) {
    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where: params.where,
        skip: params.skip,
        take: params.take,
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          email: true,
          display_name: true,
          role: true,
          status: true,
          created_at: true,
          updated_at: true,
        },
      }),
      this.prisma.user.count({ where: params.where }),
    ]);
    return { items, total };
  }

  /**
   * 根据 ID 查询 User（含余额、统计、关联数据）
   */
  async findUserById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        display_name: true,
        phone: true,
        avatar_url: true,
        role: true,
        status: true,
        github_id: true,
        google_id: true,
        wechat_id: true,
        created_at: true,
        updated_at: true,
        balance: { select: { amount: true, frozen: true } },
        _count: { select: { apiKeys: true, requestLogs: true } },
        // 最近 5 笔订单
        orders: {
          select: {
            id: true,
            order_no: true,
            amount: true,
            status: true,
            payment_method: true,
            created_at: true,
            paid_at: true,
          },
          orderBy: { created_at: 'desc' as const },
          take: 5,
        },
        // 最近 5 笔交易
        transactions: {
          select: {
            id: true,
            type: true,
            amount: true,
            balance_after: true,
            remark: true,
            created_at: true,
          },
          orderBy: { created_at: 'desc' as const },
          take: 5,
        },
        // 最近 5 个 API Key
        apiKeys: {
          select: {
            id: true,
            name: true,
            key_prefix: true,
            is_active: true,
            total_requests: true,
            last_used_at: true,
            created_at: true,
          },
          orderBy: { created_at: 'desc' as const },
          take: 5,
        },
      },
    });
  }

  /**
   * 获取单个用户的消费和充值统计
   */
  async getUserSpendingStats(userId: string) {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [monthlySpend, monthlyRecharge, totalSpend, totalRecharge, tokenStats] = await Promise.all([
      // 本月消费
      this.prisma.userTransaction.aggregate({
        where: { user_id: userId, type: 'DEDUCT', created_at: { gte: monthStart } },
        _sum: { amount: true },
      }),
      // 本月充值
      this.prisma.userTransaction.aggregate({
        where: { user_id: userId, type: 'RECHARGE', created_at: { gte: monthStart } },
        _sum: { amount: true },
      }),
      // 总消费
      this.prisma.userTransaction.aggregate({
        where: { user_id: userId, type: 'DEDUCT' },
        _sum: { amount: true },
      }),
      // 总充值
      this.prisma.userTransaction.aggregate({
        where: { user_id: userId, type: 'RECHARGE' },
        _sum: { amount: true },
      }),
      // Token 统计
      this.prisma.requestLog.aggregate({
        where: { user_id: userId, created_at: { gte: monthStart } },
        _sum: { prompt_tokens: true, completion_tokens: true, total_tokens: true },
        _count: true,
      }),
    ]);

    return {
      monthlySpend: Math.abs(monthlySpend._sum.amount || 0),
      monthlyRecharge: monthlyRecharge._sum.amount || 0,
      totalSpend: Math.abs(totalSpend._sum.amount || 0),
      totalRecharge: totalRecharge._sum.amount || 0,
      monthlyRequests: tokenStats._count,
      monthlyPromptTokens: tokenStats._sum.prompt_tokens || 0,
      monthlyCompletionTokens: tokenStats._sum.completion_tokens || 0,
      monthlyTotalTokens: tokenStats._sum.total_tokens || 0,
    };
  }

  /**
   * 更新用户角色
   * SECURITY: 使用 Prisma 枚举类型，移除 `as never` 断言
   *
   * @param id - 用户 ID
   * @param role - 新角色（UserRole 枚举值）
   */
  async updateUserRole(id: string, role: UserRole) {
    return this.prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, email: true, role: true },
    });
  }

  /**
   * 更新用户状态
   * SECURITY: 使用 Prisma 枚举类型，移除 `as never` 断言
   *
   * @param id - 用户 ID
   * @param status - 新状态（UserStatus 枚举值）
   */
  async updateUserStatus(id: string, status: UserStatus) {
    return this.prisma.user.update({
      where: { id },
      data: { status },
      select: { id: true, email: true, status: true },
    });
  }

  // ──────────────────────────────────────────────
  // Dashboard
  // ──────────────────────────────────────────────

  /**
   * 获取用户统计
   */
  async getUserStats(startDate: Date, endDate: Date) {
    const [totalUsers, previousPeriodUsers] = await Promise.all([
      this.prisma.user.count({
        where: {
          created_at: { gte: startDate, lte: endDate },
          deleted_at: null,
        },
      }),
      this.prisma.user.count({
        where: {
          created_at: {
            gte: new Date(startDate.getTime() - (endDate.getTime() - startDate.getTime())),
            lt: startDate,
          },
          deleted_at: null,
        },
      }),
    ]);
    return { totalUsers, previousPeriodUsers };
  }

  /**
   * 获取充值统计
   */
  async getRechargeStats(startDate: Date, endDate: Date) {
    const [current, previous] = await Promise.all([
      this.prisma.order.aggregate({
        _sum: { amount: true },
        where: {
          status: 'PAID',
          created_at: { gte: startDate, lte: endDate },
        },
      }),
      this.prisma.order.aggregate({
        _sum: { amount: true },
        where: {
          status: 'PAID',
          created_at: {
            gte: new Date(startDate.getTime() - (endDate.getTime() - startDate.getTime())),
            lt: startDate,
          },
        },
      }),
    ]);
    return {
      totalRecharge: current._sum.amount ?? 0,
      previousRecharge: previous._sum.amount ?? 0,
    };
  }

  /**
   * 获取消费统计
   */
  async getConsumptionStats(startDate: Date, endDate: Date) {
    const [current, previous] = await Promise.all([
      this.prisma.userTransaction.aggregate({
        _sum: { amount: true },
        where: {
          type: 'DEDUCT',
          created_at: { gte: startDate, lte: endDate },
        },
      }),
      this.prisma.userTransaction.aggregate({
        _sum: { amount: true },
        where: {
          type: 'DEDUCT',
          created_at: {
            gte: new Date(startDate.getTime() - (endDate.getTime() - startDate.getTime())),
            lt: startDate,
          },
        },
      }),
    ]);
    return {
      totalConsumption: current._sum.amount ?? 0,
      previousConsumption: previous._sum.amount ?? 0,
    };
  }

  /**
   * 获取调用统计
   */
  async getRequestStats(startDate: Date, endDate: Date) {
    const [current, previous] = await Promise.all([
      this.prisma.requestLog.count({
        where: { created_at: { gte: startDate, lte: endDate } },
      }),
      this.prisma.requestLog.count({
        where: {
          created_at: {
            gte: new Date(startDate.getTime() - (endDate.getTime() - startDate.getTime())),
            lt: startDate,
          },
        },
      }),
    ]);
    return { totalRequests: current, previousRequests: previous };
  }

  /**
   * 获取总余额
   */
  async getTotalBalance() {
    const result = await this.prisma.userBalance.aggregate({
      _sum: { amount: true },
    });
    return result._sum.amount ?? 0;
  }

  /**
   * 获取调用统计（按天分组）
   */
  async getCallStatsByDay(startDate: Date, endDate: Date) {
    const logs = await this.prisma.requestLog.findMany({
      where: { created_at: { gte: startDate, lte: endDate } },
      select: {
        created_at: true,
        total_tokens: true,
        cost: true,
      },
    });

    // 按天分组
    const statsMap = new Map<string, { requests: number; tokens: number; cost: number }>();

    for (const log of logs) {
      const date = log.created_at;
      const label = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      const existing = statsMap.get(label) ?? { requests: 0, tokens: 0, cost: 0 };
      existing.requests++;
      existing.tokens += log.total_tokens;
      existing.cost += log.cost;
      statsMap.set(label, existing);
    }

    // 填充空日期
    const result: Array<{ label: string; requests: number; tokens: number; cost: number }> = [];
    const current = new Date(startDate);
    while (current <= endDate) {
      const label = `${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;
      const stats = statsMap.get(label) ?? { requests: 0, tokens: 0, cost: 0 };
      result.push({ label, ...stats });
      current.setDate(current.getDate() + 1);
    }

    return result;
  }

  /**
   * 获取模型分布
   */
  async getModelDistribution(startDate: Date, endDate: Date) {
    const distribution = await this.prisma.requestLog.groupBy({
      by: ['model_id'],
      _count: { id: true },
      where: { created_at: { gte: startDate, lte: endDate } },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    });

    const totalCount = await this.prisma.requestLog.count({
      where: { created_at: { gte: startDate, lte: endDate } },
    });

    // 获取模型名称
    const modelIds = distribution.map((d) => d.model_id).filter(Boolean) as string[];
    const models = await this.prisma.model.findMany({
      where: { id: { in: modelIds } },
      select: { id: true, display_name: true, name: true },
    });
    const modelMap = new Map(models.map((m) => [m.id, m.display_name ?? m.name]));

    return distribution.map((d) => ({
      name: modelMap.get(d.model_id ?? '') ?? 'Unknown',
      count: d._count.id,
      percentage: totalCount > 0 ? Math.round((d._count.id / totalCount) * 1000) / 10 : 0,
    }));
  }

  /**
   * 获取最近订单
   */
  async getRecentOrders(limit: number = 10) {
    const orders = await this.prisma.order.findMany({
      take: limit,
      orderBy: { created_at: 'desc' },
      include: {
        user: {
          select: { email: true },
        },
        payment: {
          select: { method: true },
        },
      },
    });

    return orders.map((o) => ({
      id: o.id,
      orderNo: o.order_no,
      userEmail: this.maskEmail(o.user.email),
      amount: o.amount,
      paymentMethod: o.payment?.method ?? null,
      status: o.status,
      createdAt: o.created_at.toISOString(),
    }));
  }

  /**
   * 获取渠道状态
   */
  async getChannelStatus() {
    const channels = await this.prisma.channel.findMany({
      take: 10,
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        name: true,
        status: true,
      },
    });

    // 获取今日每个渠道的调用次数
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = await Promise.all(
      channels.map(async (ch) => {
        const [todayRequests, avgResult] = await Promise.all([
          this.prisma.requestLog.count({
            where: {
              channel_id: ch.id,
              created_at: { gte: today },
            },
          }),
          this.prisma.requestLog.aggregate({
            where: {
              channel_id: ch.id,
              created_at: { gte: today },
            },
            _avg: { latency_ms: true },
          }),
        ]);

        return {
          id: ch.id,
          name: ch.name,
          status: ch.status,
          avgLatency: Math.round(avgResult._avg.latency_ms ?? 0),
          todayRequests,
        };
      }),
    );

    return result;
  }

  /**
   * 邮箱脱敏
   */
  private maskEmail(email: string): string {
    const [local = '', domain = ''] = email.split('@');
    if (!local || !domain) return email;
    if (local.length <= 3) {
      return `${local[0]}***@${domain}`;
    }
    return `${local.slice(0, 3)}***@${domain}`;
  }

  // ──────────────────────────────────────────────
  // UserGroup
  // ──────────────────────────────────────────────

  /**
   * 查询用户组列表（分页）
   */
  async findUserGroups(params: {
    skip?: number;
    take?: number;
    where?: Prisma.UserGroupWhereInput;
    orderBy?: Prisma.UserGroupOrderByWithRelationInput;
  }) {
    const [items, total] = await Promise.all([
      this.prisma.userGroup.findMany({
        where: params.where,
        skip: params.skip,
        take: params.take,
        orderBy: params.orderBy ?? { price_multiplier: 'asc' },
        include: {
          _count: { select: { users: true } },
        },
      }),
      this.prisma.userGroup.count({ where: params.where }),
    ]);
    return { items, total };
  }

  /**
   * 根据 ID 查询用户组
   */
  async findUserGroupById(id: string) {
    return this.prisma.userGroup.findUnique({
      where: { id },
      include: {
        _count: { select: { users: true } },
      },
    });
  }

  /**
   * 根据名称查询用户组
   */
  async findUserGroupByName(name: string) {
    return this.prisma.userGroup.findUnique({
      where: { name },
    });
  }

  /**
   * 创建用户组
   */
  async createUserGroup(data: Prisma.UserGroupCreateInput) {
    return this.prisma.userGroup.create({
      data,
      include: {
        _count: { select: { users: true } },
      },
    });
  }

  /**
   * 更新用户组
   */
  async updateUserGroup(id: string, data: Prisma.UserGroupUpdateInput) {
    return this.prisma.userGroup.update({
      where: { id },
      data,
      include: {
        _count: { select: { users: true } },
      },
    });
  }

  /**
   * 删除用户组
   */
  async deleteUserGroup(id: string) {
    return this.prisma.userGroup.delete({ where: { id } });
  }

  /**
   * 检查用户组是否有关联用户
   */
  async countUsersInGroup(groupId: string): Promise<number> {
    return this.prisma.user.count({
      where: { group_id: groupId, deleted_at: null },
    });
  }

  // ──────────────────────────────────────────────
  // Role
  // ──────────────────────────────────────────────

  /**
   * 查询角色列表
   */
  async findRoles(params: { where?: Prisma.RoleWhereInput; orderBy?: Prisma.RoleOrderByWithRelationInput }) {
    return this.prisma.role.findMany({
      where: params.where,
      orderBy: params.orderBy ?? { level: 'desc' },
      include: {
        _count: {
          select: {
            permissions: true,
            user_roles: true,
          },
        },
      },
    });
  }

  /**
   * 根据 ID 查询角色
   */
  async findRoleById(id: string) {
    return this.prisma.role.findUnique({
      where: { id },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
        _count: {
          select: {
            user_roles: true,
          },
        },
      },
    });
  }

  /**
   * 根据编码查询角色
   */
  async findRoleByCode(code: string) {
    return this.prisma.role.findUnique({ where: { code } });
  }

  /**
   * 创建角色
   */
  async createRole(data: Prisma.RoleCreateInput) {
    return this.prisma.role.create({ data });
  }

  /**
   * 更新角色
   */
  async updateRole(id: string, data: Prisma.RoleUpdateInput) {
    return this.prisma.role.update({ where: { id }, data });
  }

  /**
   * 删除角色
   */
  async deleteRole(id: string) {
    return this.prisma.role.delete({ where: { id } });
  }

  /**
   * 设置角色权限
   */
  async setRolePermissions(roleId: string, permissionIds: string[]) {
    // 先删除旧权限
    await this.prisma.rolePermission.deleteMany({ where: { role_id: roleId } });

    // 添加新权限
    if (permissionIds.length > 0) {
      await this.prisma.rolePermission.createMany({
        data: permissionIds.map((pid) => ({
          role_id: roleId,
          permission_id: pid,
        })),
      });
    }
  }

  // ──────────────────────────────────────────────
  // Permission
  // ──────────────────────────────────────────────

  /**
   * 查询所有权限
   */
  async findPermissions() {
    return this.prisma.permission.findMany({
      orderBy: [{ resource: 'asc' }, { action: 'asc' }],
    });
  }

  /**
   * 根据 ID 列表查询权限
   */
  async findPermissionsByIds(ids: string[]) {
    return this.prisma.permission.findMany({
      where: { id: { in: ids } },
    });
  }

  // ──────────────────────────────────────────────
  // API Key (Admin)
  // ──────────────────────────────────────────────

  /**
   * 查询 API Key 列表（分页，含用户信息）
   */
  async findApiKeys(params: {
    skip?: number;
    take?: number;
    where?: Prisma.ApiKeyWhereInput;
    orderBy?: Prisma.ApiKeyOrderByWithRelationInput;
  }) {
    const [items, total] = await Promise.all([
      this.prisma.apiKey.findMany({
        where: params.where,
        skip: params.skip,
        take: params.take,
        orderBy: params.orderBy ?? { created_at: 'desc' },
        include: {
          user: {
            select: { id: true, email: true, display_name: true },
          },
        },
      }),
      this.prisma.apiKey.count({ where: params.where }),
    ]);
    return { items, total };
  }

  /**
   * 根据 ID 查询 API Key
   */
  async findApiKeyById(id: string) {
    return this.prisma.apiKey.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, email: true, display_name: true },
        },
      },
    });
  }

  /**
   * 更新 API Key
   */
  async updateApiKey(id: string, data: Prisma.ApiKeyUpdateInput) {
    return this.prisma.apiKey.update({
      where: { id },
      data,
      include: {
        user: {
          select: { id: true, email: true, display_name: true },
        },
      },
    });
  }

  /**
   * 删除 API Key
   */
  async deleteApiKey(id: string) {
    return this.prisma.apiKey.delete({ where: { id } });
  }

  /**
   * 统计用户的 API Key 数量
   */
  async countUserApiKeys(userId: string): Promise<number> {
    return this.prisma.apiKey.count({
      where: { user_id: userId },
    });
  }

  // ──────────────────────────────────────────────
  // Order (Admin)
  // ──────────────────────────────────────────────

  /**
   * 查询订单列表（分页，含用户信息）
   */
  async findOrders(params: {
    skip?: number;
    take?: number;
    where?: Prisma.OrderWhereInput;
    orderBy?: Prisma.OrderOrderByWithRelationInput;
  }) {
    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where: params.where,
        skip: params.skip,
        take: params.take,
        orderBy: params.orderBy ?? { created_at: 'desc' },
        include: {
          user: {
            select: { id: true, email: true, display_name: true },
          },
          payment: {
            select: { method: true, trade_no: true },
          },
        },
      }),
      this.prisma.order.count({ where: params.where }),
    ]);
    return { items, total };
  }

  /**
   * 根据 ID 查询订单
   */
  async findOrderById(id: string) {
    return this.prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, email: true, display_name: true },
        },
        payment: true,
      },
    });
  }

  /**
   * 更新订单状态
   */
  async updateOrderStatus(id: string, status: string) {
    return this.prisma.order.update({
      where: { id },
      data: { status: status as any },
      include: {
        user: {
          select: { id: true, email: true, display_name: true },
        },
      },
    });
  }

  // ──────────────────────────────────────────────
  // Transaction / Bill (Admin)
  // ──────────────────────────────────────────────

  /**
   * 查询交易流水列表（分页）
   */
  async findTransactions(params: {
    skip?: number;
    take?: number;
    where?: Prisma.UserTransactionWhereInput;
    orderBy?: Prisma.UserTransactionOrderByWithRelationInput;
  }) {
    const [items, total] = await Promise.all([
      this.prisma.userTransaction.findMany({
        where: params.where,
        skip: params.skip,
        take: params.take,
        orderBy: params.orderBy ?? { created_at: 'desc' },
        include: {
          user: {
            select: { id: true, email: true, display_name: true },
          },
        },
      }),
      this.prisma.userTransaction.count({ where: params.where }),
    ]);
    return { items, total };
  }

  /**
   * 获取用户余额
   */
  async getUserBalance(userId: string) {
    return this.prisma.userBalance.findUnique({
      where: { user_id: userId },
    });
  }

  // ──────────────────────────────────────────────
  // RechargePromotion 充值赠送活动
  // ──────────────────────────────────────────────

  async findPromotions(params: {
    skip?: number;
    take?: number;
    where?: Prisma.RechargePromotionWhereInput;
  }) {
    const [items, total] = await Promise.all([
      this.prisma.rechargePromotion.findMany({
        where: params.where,
        skip: params.skip,
        take: params.take,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.rechargePromotion.count({ where: params.where }),
    ]);
    return { items, total };
  }

  async findPromotionById(id: string) {
    return this.prisma.rechargePromotion.findUnique({ where: { id } });
  }

  async createPromotion(data: Prisma.RechargePromotionCreateInput) {
    return this.prisma.rechargePromotion.create({ data });
  }

  async updatePromotion(id: string, data: Prisma.RechargePromotionUpdateInput) {
    return this.prisma.rechargePromotion.update({ where: { id }, data });
  }

  async deletePromotion(id: string) {
    return this.prisma.rechargePromotion.delete({ where: { id } });
  }

  /**
   * 获取当前有效的充值赠送活动
   */
  async findActivePromotions(amount: number) {
    const now = new Date();
    return this.prisma.rechargePromotion.findMany({
      where: {
        is_active: true,
        start_at: { lte: now },
        OR: [{ end_at: null }, { end_at: { gte: now } }],
        min_amount: { lte: amount },
      },
      orderBy: { min_amount: 'desc' },
    });
  }

  // ──────────────────────────────────────────────
  // Invoice 发票
  // ──────────────────────────────────────────────

  async findInvoices(params: {
    skip?: number;
    take?: number;
    where?: Prisma.InvoiceWhereInput;
  }) {
    const [items, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where: params.where,
        skip: params.skip,
        take: params.take,
        orderBy: { created_at: 'desc' },
        include: {
          user: { select: { id: true, email: true, display_name: true } },
        },
      }),
      this.prisma.invoice.count({ where: params.where }),
    ]);
    return { items, total };
  }

  async findInvoiceById(id: string) {
    return this.prisma.invoice.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, display_name: true } },
      },
    });
  }

  async createInvoice(data: Prisma.InvoiceCreateInput) {
    return this.prisma.invoice.create({
      data,
      include: {
        user: { select: { id: true, email: true, display_name: true } },
      },
    });
  }

  async updateInvoice(id: string, data: Prisma.InvoiceUpdateInput) {
    return this.prisma.invoice.update({
      where: { id },
      data,
      include: {
        user: { select: { id: true, email: true, display_name: true } },
      },
    });
  }

  async deleteInvoice(id: string) {
    return this.prisma.invoice.delete({ where: { id } });
  }

  /**
   * 生成发票号：INV-yyyyMMdd-xxxxxx
   */
  async generateInvoiceNo(): Promise<string> {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
    const count = await this.prisma.invoice.count({
      where: {
        created_at: {
          gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
        },
      },
    });
    return `INV-${dateStr}-${String(count + 1).padStart(6, "0")}`;
  }
}
