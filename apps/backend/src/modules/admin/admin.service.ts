import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { UserRole, UserStatus, Prisma } from '@prisma/client';
import { AdminRepository } from './admin.repository';
import { toJsonArray, parseJsonArray } from '../../common/utils/json-array.util';
import { encrypt, decrypt, maskApiKey } from '../../common/utils/crypto.util';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { CreateModelDto } from './dto/create-model.dto';
import { UpdateModelDto } from './dto/update-model.dto';
import { UpsertPricingDto } from './dto/upsert-pricing.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { UpdatePaymentConfigDto } from './dto/payment-config.dto';
import { CreatePromotionDto, UpdatePromotionDto } from './dto/promotion.dto';
import { CreateInvoiceDto, ReviewInvoiceDto, IssueInvoiceDto } from './dto/invoice.dto';
import { UpdateSmtpConfigDto } from './dto/smtp-config.dto';
import { CreateUserGroupDto, UpdateUserGroupDto } from './dto/user-group.dto';
import { CreateRoleDto, UpdateRoleDto, AssignPermissionsDto } from './dto/role.dto';
import { ProviderResponseDto } from './dto/provider-response.dto';
import { ChannelResponseDto } from './dto/channel-response.dto';
import { ModelResponseDto } from './dto/model-response.dto';
import { DashboardResponseDto } from './dto/dashboard-response.dto';
import type { PaginatedResult } from '../../common/dto/pagination.dto';
import { PaymentConfigService } from '../../common/services/payment-config.service';
import { SmtpConfigService } from '../../common/services/smtp-config.service';
import { EmailService } from '../../common/services/email.service';
import { SystemSettingService } from '../../common/services/system-setting.service';

/**
 * Admin 管理服务
 *
 * 职责：Provider / Channel / Model / User / PaymentConfig / SmtpConfig 的管理操作。
 * 所有方法仅由 AdminController 调用，需 admin 角色。
 * SECURITY: Channel API Key 使用 AES-256-GCM 加密存储
 */
@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private readonly adminRepo: AdminRepository,
    private readonly paymentConfigService: PaymentConfigService,
    private readonly smtpConfigService: SmtpConfigService,
    private readonly emailService: EmailService,
    private readonly systemSettingService: SystemSettingService,
  ) {}

  // ──────────────────────────────────────────────
  // Dashboard
  // ──────────────────────────────────────────────

  /**
   * 获取 Dashboard 数据
   */
  async getDashboard(startDate?: string, endDate?: string): Promise<DashboardResponseDto> {
    // 默认最近 7 天
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate
      ? new Date(startDate)
      : new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);

    // 并行查询所有数据
    const [
      userStats,
      rechargeStats,
      consumptionStats,
      requestStats,
      totalBalance,
      callStats,
      modelDistribution,
      recentOrders,
      channelStatus,
    ] = await Promise.all([
      this.adminRepo.getUserStats(start, end),
      this.adminRepo.getRechargeStats(start, end),
      this.adminRepo.getConsumptionStats(start, end),
      this.adminRepo.getRequestStats(start, end),
      this.adminRepo.getTotalBalance(),
      this.adminRepo.getCallStatsByDay(start, end),
      this.adminRepo.getModelDistribution(start, end),
      this.adminRepo.getRecentOrders(10),
      this.adminRepo.getChannelStatus(),
    ]);

    // 计算增长率
    const calcGrowth = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100 * 10) / 10;
    };

    return {
      metrics: {
        totalUsers: userStats.totalUsers,
        totalUsersGrowth: calcGrowth(userStats.totalUsers, userStats.previousPeriodUsers),
        totalRecharge: rechargeStats.totalRecharge,
        totalRechargeGrowth: calcGrowth(rechargeStats.totalRecharge, rechargeStats.previousRecharge),
        totalConsumption: consumptionStats.totalConsumption,
        totalConsumptionGrowth: calcGrowth(consumptionStats.totalConsumption, consumptionStats.previousConsumption),
        totalRequests: requestStats.totalRequests,
        totalRequestsGrowth: calcGrowth(requestStats.totalRequests, requestStats.previousRequests),
        totalBalance,
      },
      callStats,
      modelDistribution,
      recentOrders,
      channelStatus,
    };
  }

  // ──────────────────────────────────────────────
  // UserGroup 管理
  // ──────────────────────────────────────────────

  /**
   * 查询用户组列表（分页）
   */
  async listUserGroups(
    page: number,
    pageSize: number,
    search?: string,
    isActive?: boolean,
  ): Promise<PaginatedResult<Record<string, unknown>>> {
    const skip = (page - 1) * pageSize;
    const where: Prisma.UserGroupWhereInput = { deleted_at: null };

    if (search) {
      where['OR'] = [
        { name: { contains: search } },
        { display_name: { contains: search } },
      ];
    }
    if (isActive !== undefined) {
      where['is_active'] = isActive;
    }

    const { items, total } = await this.adminRepo.findUserGroups({ skip, take: pageSize, where });

    return {
      items: items.map((g) => this.toUserGroupResponse(g)),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * 获取用户组详情
   */
  async getUserGroup(id: string): Promise<Record<string, unknown>> {
    const group = await this.adminRepo.findUserGroupById(id);
    if (!group) {
      throw new NotFoundException('User group not found');
    }
    return this.toUserGroupResponse(group);
  }

  /**
   * 创建用户组
   */
  async createUserGroup(dto: CreateUserGroupDto): Promise<Record<string, unknown>> {
    const existing = await this.adminRepo.findUserGroupByName(dto.name);
    if (existing) {
      throw new ConflictException(`User group '${dto.name}' already exists`);
    }

    const group = await this.adminRepo.createUserGroup({
      name: dto.name,
      display_name: dto.displayName,
      description: dto.description,
      price_multiplier: dto.priceMultiplier,
      rpm_limit: dto.rpmLimit,
      tpm_limit: dto.tpmLimit,
      max_api_keys: dto.maxApiKeys,
      allowed_models: toJsonArray(dto.allowedModels),
      allowed_channels: toJsonArray(dto.allowedChannels),
      allow_proxy: dto.allowProxy ?? true,
      allow_share: dto.allowShare ?? false,
    });

    this.logger.log(`User group created: ${group.id} (${group.name})`);
    return this.toUserGroupResponse(group);
  }

  /**
   * 更新用户组
   */
  async updateUserGroup(id: string, dto: UpdateUserGroupDto): Promise<Record<string, unknown>> {
    const existing = await this.adminRepo.findUserGroupById(id);
    if (!existing) {
      throw new NotFoundException('User group not found');
    }

    const group = await this.adminRepo.updateUserGroup(id, {
      ...(dto.displayName !== undefined && { display_name: dto.displayName }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.priceMultiplier !== undefined && { price_multiplier: dto.priceMultiplier }),
      ...(dto.rpmLimit !== undefined && { rpm_limit: dto.rpmLimit }),
      ...(dto.tpmLimit !== undefined && { tpm_limit: dto.tpmLimit }),
      ...(dto.maxApiKeys !== undefined && { max_api_keys: dto.maxApiKeys }),
      ...(dto.allowedModels !== undefined && { allowed_models: toJsonArray(dto.allowedModels) }),
      ...(dto.allowedChannels !== undefined && { allowed_channels: toJsonArray(dto.allowedChannels) }),
      ...(dto.allowProxy !== undefined && { allow_proxy: dto.allowProxy }),
      ...(dto.allowShare !== undefined && { allow_share: dto.allowShare }),
    });

    this.logger.log(`User group updated: ${id}`);
    return this.toUserGroupResponse(group);
  }

  /**
   * 切换用户组状态
   */
  async toggleUserGroup(id: string): Promise<Record<string, unknown>> {
    const existing = await this.adminRepo.findUserGroupById(id);
    if (!existing) {
      throw new NotFoundException('User group not found');
    }

    const group = await this.adminRepo.updateUserGroup(id, {
      is_active: !existing.is_active,
    });

    this.logger.log(`User group ${group.is_active ? 'enabled' : 'disabled'}: ${id}`);
    return this.toUserGroupResponse(group);
  }

  /**
   * 删除用户组
   */
  async deleteUserGroup(id: string): Promise<void> {
    const existing = await this.adminRepo.findUserGroupById(id);
    if (!existing) {
      throw new NotFoundException('User group not found');
    }

    if (existing.is_builtin) {
      throw new ForbiddenException('Cannot delete built-in user group');
    }

    const userCount = await this.adminRepo.countUsersInGroup(id);
    if (userCount > 0) {
      throw new ConflictException(
        `Cannot delete user group '${existing.name}': ${userCount} user(s) still assigned. Reassign users first.`,
      );
    }

    await this.adminRepo.deleteUserGroup(id);
    this.logger.log(`User group deleted: ${id} (${existing.name})`);
  }

  /**
   * 转换用户组响应
   */
  private toUserGroupResponse(group: any): Record<string, unknown> {
    return {
      id: group.id,
      name: group.name,
      displayName: group.display_name,
      description: group.description,
      priceMultiplier: Number(group.price_multiplier),
      rpmLimit: group.rpm_limit,
      tpmLimit: group.tpm_limit,
      maxApiKeys: group.max_api_keys,
      allowedModels: parseJsonArray(group.allowed_models),
      allowedChannels: parseJsonArray(group.allowed_channels),
      allowProxy: group.allow_proxy,
      allowShare: group.allow_share,
      isActive: group.is_active,
      isBuiltin: group.is_builtin,
      userCount: group._count?.users ?? 0,
      createdAt: group.created_at,
      updatedAt: group.updated_at,
    };
  }

  // ──────────────────────────────────────────────
  // Role 管理
  // ──────────────────────────────────────────────

  /**
   * 查询角色列表
   */
  async listRoles(): Promise<Record<string, unknown>[]> {
    const roles = await this.adminRepo.findRoles({});
    return roles.map((r) => this.toRoleResponse(r));
  }

  /**
   * 获取角色详情
   */
  async getRole(id: string): Promise<Record<string, unknown>> {
    const role = await this.adminRepo.findRoleById(id);
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    return this.toRoleDetailResponse(role);
  }

  /**
   * 创建角色
   */
  async createRole(dto: CreateRoleDto): Promise<Record<string, unknown>> {
    const existing = await this.adminRepo.findRoleByCode(dto.code);
    if (existing) {
      throw new ConflictException(`Role '${dto.code}' already exists`);
    }

    const role = await this.adminRepo.createRole({
      code: dto.code,
      name: dto.name,
      description: dto.description,
      level: dto.level,
      data_scope: dto.dataScope ?? 'SELF',
    });

    this.logger.log(`Role created: ${role.id} (${role.code})`);
    return this.toRoleResponse(role);
  }

  /**
   * 更新角色
   */
  async updateRole(id: string, dto: UpdateRoleDto): Promise<Record<string, unknown>> {
    const existing = await this.adminRepo.findRoleById(id);
    if (!existing) {
      throw new NotFoundException('Role not found');
    }

    if (existing.is_system) {
      throw new ForbiddenException('Cannot modify system role');
    }

    const role = await this.adminRepo.updateRole(id, {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.level !== undefined && { level: dto.level }),
      ...(dto.dataScope !== undefined && { data_scope: dto.dataScope }),
      ...(dto.isActive !== undefined && { is_active: dto.isActive }),
    });

    this.logger.log(`Role updated: ${id}`);
    return this.toRoleResponse(role);
  }

  /**
   * 删除角色
   */
  async deleteRole(id: string): Promise<void> {
    const existing = await this.adminRepo.findRoleById(id);
    if (!existing) {
      throw new NotFoundException('Role not found');
    }

    if (existing.is_system) {
      throw new ForbiddenException('Cannot delete system role');
    }

    if (existing._count.user_roles > 0) {
      throw new ConflictException('Cannot delete role with assigned users');
    }

    await this.adminRepo.deleteRole(id);
    this.logger.log(`Role deleted: ${id} (${existing.code})`);
  }

  /**
   * 设置角色权限
   */
  async setRolePermissions(id: string, dto: AssignPermissionsDto): Promise<Record<string, unknown>> {
    const role = await this.adminRepo.findRoleById(id);
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    await this.adminRepo.setRolePermissions(id, dto.permissionIds);

    const updated = await this.adminRepo.findRoleById(id);
    this.logger.log(`Role permissions updated: ${id}`);
    return this.toRoleDetailResponse(updated!);
  }

  /**
   * 获取所有权限
   */
  async listPermissions(): Promise<Record<string, unknown>[]> {
    const permissions = await this.adminRepo.findPermissions();
    return permissions.map((p) => ({
      id: p.id,
      code: p.code,
      name: p.name,
      resource: p.resource,
      action: p.action,
    }));
  }

  /**
   * 转换角色响应
   */
  private toRoleResponse(role: any): Record<string, unknown> {
    return {
      id: role.id,
      code: role.code,
      name: role.name,
      description: role.description,
      level: role.level,
      isSystem: role.is_system,
      isActive: role.is_active,
      dataScope: role.data_scope,
      permissionCount: role._count?.permissions ?? 0,
      userCount: role._count?.user_roles ?? 0,
      createdAt: role.created_at,
      updatedAt: role.updated_at,
    };
  }

  /**
   * 转换角色详情响应
   */
  private toRoleDetailResponse(role: any): Record<string, unknown> {
    return {
      ...this.toRoleResponse(role),
      permissions: role.permissions?.map((rp: any) => ({
        id: rp.permission.id,
        code: rp.permission.code,
        name: rp.permission.name,
        resource: rp.permission.resource,
        action: rp.permission.action,
      })) ?? [],
    };
  }

  // ──────────────────────────────────────────────
  // API Key 管理 (Admin)
  // ──────────────────────────────────────────────

  /**
   * 查询 API Key 列表（分页）
   */
  async listApiKeys(
    page: number,
    pageSize: number,
    search?: string,
    isActive?: boolean,
    userId?: string,
  ): Promise<PaginatedResult<Record<string, unknown>>> {
    const skip = (page - 1) * pageSize;
    const where: Prisma.ApiKeyWhereInput = {};

    if (userId) {
      where.user_id = userId;
    }
    if (isActive !== undefined) {
      where.is_active = isActive;
    }
    if (search) {
      where.OR = [
        { key_prefix: { contains: search } },
        { name: { contains: search } },
        { user: { email: { contains: search } } },
      ];
    }

    const { items, total } = await this.adminRepo.findApiKeys({ skip, take: pageSize, where });

    return {
      items: items.map((k) => this.toApiKeyResponse(k)),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * 获取 API Key 详情
   */
  async getApiKey(id: string): Promise<Record<string, unknown>> {
    const key = await this.adminRepo.findApiKeyById(id);
    if (!key) {
      throw new NotFoundException('API Key not found');
    }
    return this.toApiKeyResponse(key);
  }

  /**
   * 切换 API Key 状态
   */
  async toggleApiKey(id: string): Promise<Record<string, unknown>> {
    const key = await this.adminRepo.findApiKeyById(id);
    if (!key) {
      throw new NotFoundException('API Key not found');
    }

    const updated = await this.adminRepo.updateApiKey(id, {
      is_active: !key.is_active,
    });

    this.logger.log(`API Key ${updated.is_active ? 'enabled' : 'disabled'}: ${id}`);
    return this.toApiKeyResponse(updated);
  }

  /**
   * 删除 API Key
   */
  async deleteApiKey(id: string): Promise<void> {
    const key = await this.adminRepo.findApiKeyById(id);
    if (!key) {
      throw new NotFoundException('API Key not found');
    }

    await this.adminRepo.deleteApiKey(id);
    this.logger.log(`API Key deleted: ${id}`);
  }

  /**
   * 转换 API Key 响应
   */
  private toApiKeyResponse(key: any): Record<string, unknown> {
    return {
      id: key.id,
      userId: key.user_id,
      userEmail: key.user?.email ?? 'Unknown',
      userName: key.user?.display_name ?? null,
      keyPrefix: key.key_prefix,
      name: key.name,
      isActive: key.is_active,
      expiresAt: key.expires_at?.toISOString() ?? null,
      rateLimit: key.rate_limit,
      tokenLimit: key.token_limit,
      modelLimit: parseJsonArray(key.model_limit),
      ipWhitelist: parseJsonArray(key.ip_whitelist),
      lastUsedAt: key.last_used_at?.toISOString() ?? null,
      totalRequests: key.total_requests,
      createdAt: key.created_at.toISOString(),
      updatedAt: key.updated_at.toISOString(),
    };
  }

  // ──────────────────────────────────────────────
  // Order 管理
  // ──────────────────────────────────────────────

  /**
   * 查询订单列表（分页）
   */
  async listOrders(
    page: number,
    pageSize: number,
    search?: string,
    status?: string,
    userId?: string,
  ): Promise<PaginatedResult<Record<string, unknown>>> {
    const skip = (page - 1) * pageSize;
    const where: Prisma.OrderWhereInput = {};

    if (userId) {
      where.user_id = userId;
    }
    if (status) {
      where.status = status as any;
    }
    if (search) {
      where.OR = [
        { order_no: { contains: search } },
        { product_name: { contains: search } },
        { user: { email: { contains: search } } },
      ];
    }

    const { items, total } = await this.adminRepo.findOrders({ skip, take: pageSize, where });

    return {
      items: items.map((o) => this.toOrderResponse(o)),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * 获取订单详情
   */
  async getOrder(id: string): Promise<Record<string, unknown>> {
    const order = await this.adminRepo.findOrderById(id);
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return this.toOrderResponse(order);
  }

  /**
   * 转换订单响应
   */
  private toOrderResponse(order: any): Record<string, unknown> {
    return {
      id: order.id,
      orderNo: order.order_no,
      userId: order.user_id,
      userEmail: order.user?.email ?? 'Unknown',
      userName: order.user?.display_name ?? null,
      amount: order.amount,
      paidAmount: order.paid_amount,
      paymentMethod: order.payment?.method ?? order.payment_method ?? null,
      status: order.status,
      productType: order.product_type,
      productName: order.product_name,
      paidAt: order.paid_at?.toISOString() ?? null,
      remark: order.remark,
      createdAt: order.created_at.toISOString(),
      updatedAt: order.updated_at.toISOString(),
    };
  }

  // ──────────────────────────────────────────────
  // Bill / Transaction 管理
  // ──────────────────────────────────────────────

  /**
   * 查询账单/交易流水列表（分页）
   */
  async listBills(
    page: number,
    pageSize: number,
    search?: string,
    type?: string,
    userId?: string,
  ): Promise<PaginatedResult<Record<string, unknown>>> {
    const skip = (page - 1) * pageSize;
    const where: Prisma.UserTransactionWhereInput = {};

    if (userId) {
      where.user_id = userId;
    }
    if (type) {
      where.type = type as any;
    }
    if (search) {
      where.OR = [
        { remark: { contains: search } },
        { user: { email: { contains: search } } },
      ];
    }

    const { items, total } = await this.adminRepo.findTransactions({ skip, take: pageSize, where });

    return {
      items: items.map((t) => this.toBillResponse(t)),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * 转换账单响应
   */
  private toBillResponse(tx: any): Record<string, unknown> {
    return {
      id: tx.id,
      userId: tx.user_id,
      userEmail: tx.user?.email ?? 'Unknown',
      userName: tx.user?.display_name ?? null,
      type: tx.type,
      amount: tx.amount,
      balanceAfter: tx.balance_after,
      orderId: tx.order_id,
      remark: tx.remark,
      createdAt: tx.created_at.toISOString(),
    };
  }

  // ──────────────────────────────────────────────
  // Provider 管理
  // ──────────────────────────────────────────────

  /**
   * 查询 Provider 列表（分页）
   */
  async listProviders(page: number, pageSize: number): Promise<PaginatedResult<ProviderResponseDto>> {
    const skip = (page - 1) * pageSize;
    const { items, total } = await this.adminRepo.findProviders({ skip, take: pageSize });

    return {
      items: items.map((p) => this.toProviderResponse(p)),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * 获取 Provider 详情
   */
  async getProvider(id: string): Promise<ProviderResponseDto> {
    const provider = await this.adminRepo.findProviderById(id);
    if (!provider) {
      throw new NotFoundException('Provider not found');
    }
    return this.toProviderResponse(provider);
  }

  /**
   * 创建 Provider
   */
  async createProvider(dto: CreateProviderDto): Promise<ProviderResponseDto> {
    const existing = await this.adminRepo.findProviderByName(dto.name);
    if (existing) {
      throw new ConflictException(`Provider '${dto.name}' already exists`);
    }

    const provider = await this.adminRepo.createProvider({
      name: dto.name,
      display_name: dto.displayName,
      base_url: dto.baseUrl,
      is_active: dto.isActive ?? true,
    });

    this.logger.log(`Provider created: ${provider.id} (${provider.name})`);
    return this.toProviderResponse(provider);
  }

  /**
   * 更新 Provider
   */
  async updateProvider(id: string, dto: UpdateProviderDto): Promise<ProviderResponseDto> {
    const existing = await this.adminRepo.findProviderById(id);
    if (!existing) {
      throw new NotFoundException('Provider not found');
    }

    const provider = await this.adminRepo.updateProvider(id, {
      ...(dto.displayName !== undefined && { display_name: dto.displayName }),
      ...(dto.baseUrl !== undefined && { base_url: dto.baseUrl }),
      ...(dto.isActive !== undefined && { is_active: dto.isActive }),
    });

    this.logger.log(`Provider updated: ${id}`);
    return this.toProviderResponse(provider);
  }

  /**
   * 删除 Provider
   * 有关联 Channel 时拒绝删除
   */
  async deleteProvider(id: string): Promise<void> {
    const provider = await this.adminRepo.findProviderById(id);
    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    if (provider.channels.length > 0) {
      throw new ConflictException(
        `Cannot delete provider '${provider.name}': ${provider.channels.length} channel(s) still associated. Delete channels first.`,
      );
    }

    await this.adminRepo.deleteProvider(id);
    this.logger.log(`Provider deleted: ${id} (${provider.name})`);
  }

  // ──────────────────────────────────────────────
  // Channel 管理
  // ──────────────────────────────────────────────

  /**
   * 查询 Channel 列表（分页）
   */
  async listChannels(
    page: number,
    pageSize: number,
    providerId?: string,
  ): Promise<PaginatedResult<ChannelResponseDto>> {
    const skip = (page - 1) * pageSize;
    const where = providerId ? { provider_id: providerId } : undefined;
    const { items, total } = await this.adminRepo.findChannels({ skip, take: pageSize, where });

    return {
      items: items.map((c) => this.toChannelResponse(c)),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * 获取 Channel 详情
   */
  async getChannel(id: string): Promise<ChannelResponseDto> {
    const channel = await this.adminRepo.findChannelById(id);
    if (!channel) {
      throw new NotFoundException('Channel not found');
    }
    return this.toChannelResponse(channel);
  }

  /**
   * 创建 Channel
   * SECURITY: API Key 使用 AES-256-GCM 加密后存储
   *
   * @param dto - 创建 Channel 数据
   * @returns Channel 响应（API Key 已脱敏）
   */
  async createChannel(dto: CreateChannelDto): Promise<ChannelResponseDto> {
    const provider = await this.adminRepo.findProviderById(dto.providerId);
    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    // SECURITY: 加密 API Key 后存储
    const encryptedApiKey = encrypt(dto.apiKey);

    const channel = await this.adminRepo.createChannel({
      provider: { connect: { id: dto.providerId } },
      name: dto.name,
      base_url: dto.baseUrl,
      api_key: encryptedApiKey,
      weight: dto.weight ?? 1,
      priority: dto.priority ?? 0,
    });

    this.logger.log(`Channel created: ${channel.id} (${channel.name}) under provider ${provider.name}`);
    return this.toChannelResponse(channel, dto.apiKey);
  }

  /**
   * 更新 Channel
   * SECURITY: API Key 使用 AES-256-GCM 加密后存储
   */
  async updateChannel(id: string, dto: UpdateChannelDto): Promise<ChannelResponseDto> {
    const existing = await this.adminRepo.findChannelById(id);
    if (!existing) {
      throw new NotFoundException('Channel not found');
    }

    const updateData: Record<string, unknown> = {};
    if (dto.name !== undefined) updateData['name'] = dto.name;
    if (dto.baseUrl !== undefined) updateData['base_url'] = dto.baseUrl;
    if (dto.apiKey !== undefined) updateData['api_key'] = encrypt(dto.apiKey);
    if (dto.weight !== undefined) updateData['weight'] = dto.weight;
    if (dto.priority !== undefined) updateData['priority'] = dto.priority;

    const channel = await this.adminRepo.updateChannel(id, updateData);

    this.logger.log(`Channel updated: ${id}`);
    return this.toChannelResponse(channel, dto.apiKey);
  }

  /**
   * 启用 Channel
   */
  async enableChannel(id: string): Promise<ChannelResponseDto> {
    const existing = await this.adminRepo.findChannelById(id);
    if (!existing) {
      throw new NotFoundException('Channel not found');
    }

    const channel = await this.adminRepo.setChannelStatus(id, 'ACTIVE', true);
    this.logger.log(`Channel enabled: ${id}`);
    return this.toChannelResponse(channel);
  }

  /**
   * 禁用 Channel
   */
  async disableChannel(id: string): Promise<ChannelResponseDto> {
    const existing = await this.adminRepo.findChannelById(id);
    if (!existing) {
      throw new NotFoundException('Channel not found');
    }

    const channel = await this.adminRepo.setChannelStatus(id, 'DISABLED', false);
    this.logger.log(`Channel disabled: ${id}`);
    return this.toChannelResponse(channel);
  }

  /**
   * 删除 Channel
   */
  async deleteChannel(id: string): Promise<void> {
    const existing = await this.adminRepo.findChannelById(id);
    if (!existing) {
      throw new NotFoundException('Channel not found');
    }

    await this.adminRepo.deleteChannel(id);
    this.logger.log(`Channel deleted: ${id} (${existing.name})`);
  }

  /**
   * 测试渠道连通性
   *
   * 向渠道发送一个简单的 models 列表请求，验证配置是否正确。
   */
  async testChannel(id: string): Promise<{ success: boolean; latencyMs: number; message: string }> {
    const channel = await this.adminRepo.findChannelById(id);
    if (!channel) {
      throw new NotFoundException('Channel not found');
    }

    const startTime = Date.now();

    try {
      // 解密 API Key
      const apiKey = decrypt(channel.api_key);

      // 发送简单的 models 列表请求
      const response = await fetch(`${channel.base_url}/v1/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(10000),
      });

      const latencyMs = Date.now() - startTime;

      if (response.ok) {
        return {
          success: true,
          latencyMs,
          message: `连接成功 (HTTP ${response.status})`,
        };
      } else {
        const errorText = await response.text().catch(() => '');
        return {
          success: false,
          latencyMs,
          message: `HTTP ${response.status}: ${errorText.substring(0, 200)}`,
        };
      }
    } catch (error) {
      const latencyMs = Date.now() - startTime;
      const message = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        latencyMs,
        message: `连接失败: ${message}`,
      };
    }
  }

  // ──────────────────────────────────────────────
  // Model 管理
  // ──────────────────────────────────────────────

  /**
   * 查询 Model 列表（分页）
   */
  async listModels(page: number, pageSize: number): Promise<PaginatedResult<ModelResponseDto>> {
    const skip = (page - 1) * pageSize;
    const { items, total } = await this.adminRepo.findModels({ skip, take: pageSize });

    return {
      items: items.map((m) => this.toModelResponse(m)),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * 获取 Model 详情
   */
  async getModel(id: string): Promise<ModelResponseDto> {
    const model = await this.adminRepo.findModelById(id);
    if (!model) {
      throw new NotFoundException('Model not found');
    }
    return this.toModelResponse(model);
  }

  /**
   * 创建 Model
   */
  async createModel(dto: CreateModelDto): Promise<ModelResponseDto> {
    const existing = await this.adminRepo.findModelByName(dto.name);
    if (existing) {
      throw new ConflictException(`Model '${dto.name}' already exists`);
    }

    const model = await this.adminRepo.createModel({
      name: dto.name,
      display_name: dto.displayName,
      provider_id: dto.providerId,
      max_context: dto.maxContext,
      supports_streaming: dto.supportsStreaming ?? true,
      supports_tools: dto.supportsTools ?? false,
      supports_vision: dto.supportsVision ?? false,
    });

    this.logger.log(`Model created: ${model.id} (${model.name})`);
    return this.toModelResponse(model);
  }

  /**
   * 更新 Model
   */
  async updateModel(id: string, dto: UpdateModelDto): Promise<ModelResponseDto> {
    const existing = await this.adminRepo.findModelById(id);
    if (!existing) {
      throw new NotFoundException('Model not found');
    }

    const model = await this.adminRepo.updateModel(id, {
      ...(dto.displayName !== undefined && { display_name: dto.displayName }),
      ...(dto.maxContext !== undefined && { max_context: dto.maxContext }),
      ...(dto.supportsStreaming !== undefined && { supports_streaming: dto.supportsStreaming }),
      ...(dto.supportsTools !== undefined && { supports_tools: dto.supportsTools }),
      ...(dto.supportsVision !== undefined && { supports_vision: dto.supportsVision }),
      ...(dto.isActive !== undefined && { is_active: dto.isActive }),
    });

    this.logger.log(`Model updated: ${id}`);
    return this.toModelResponse(model);
  }

  /**
   * 删除 Model
   */
  async deleteModel(id: string): Promise<void> {
    const existing = await this.adminRepo.findModelById(id);
    if (!existing) {
      throw new NotFoundException('Model not found');
    }

    await this.adminRepo.deleteModel(id);
    this.logger.log(`Model deleted: ${id} (${existing.name})`);
  }

  /**
   * 更新或创建 Model 定价
   *
   * API 层价格单位：元/百万token
   * 存储层价格单位：分/百万token
   */
  async upsertPricing(modelId: string, dto: UpsertPricingDto): Promise<ModelResponseDto> {
    const model = await this.adminRepo.findModelById(modelId);
    if (!model) {
      throw new NotFoundException('Model not found');
    }

    // 元/百万token → 分/百万token
    await this.adminRepo.upsertModelPricing(modelId, {
      input_price: Math.round(dto.inputPrice * 100),
      output_price: Math.round(dto.outputPrice * 100),
      cached_price: dto.cachedPrice != null ? Math.round(dto.cachedPrice * 100) : null,
      reasoning_price: dto.reasoningPrice != null ? Math.round(dto.reasoningPrice * 100) : null,
      multiplier: dto.multiplier ?? 1.0,
    });

    this.logger.log(`Pricing updated for model: ${modelId} (${model.name})`);
    const updated = await this.adminRepo.findModelById(modelId);
    if (!updated) {
      throw new NotFoundException('Model not found after pricing update');
    }
    return this.toModelResponse(updated);
  }

  // ──────────────────────────────────────────────
  // User 管理
  // ──────────────────────────────────────────────

  /**
   * 查询用户列表（分页）
   * SECURITY: role 和 status 参数使用 Prisma 枚举类型校验
   *
   * @param page - 页码
   * @param pageSize - 每页数量
   * @param role - 角色筛选（UserRole 枚举值）
   * @param status - 状态筛选（UserStatus 枚举值）
   * @param search - 搜索关键字（ID/用户名/邮箱）
   */
  async listUsers(
    page: number,
    pageSize: number,
    role?: UserRole,
    status?: UserStatus,
    search?: string,
  ): Promise<PaginatedResult<Record<string, unknown>>> {
    const skip = (page - 1) * pageSize;
    const where: Prisma.UserWhereInput = { deleted_at: null };
    if (role) where['role'] = role;
    if (status) where['status'] = status;

    // 搜索：ID / 用户名 / 邮箱
    if (search && search.trim()) {
      const keyword = search.trim();
      where['OR'] = [
        { id: { contains: keyword } },
        { display_name: { contains: keyword } },
        { email: { contains: keyword } },
      ];
    }

    const { items, total } = await this.adminRepo.findUsers({ skip, take: pageSize, where });

    return {
      items: items.map((u) => ({
        id: u.id,
        email: u.email,
        displayName: u.display_name,
        role: u.role,
        status: u.status,
        createdAt: u.created_at,
        updatedAt: u.updated_at,
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * 获取用户详情（含余额、统计、关联数据）
   */
  async getUser(id: string): Promise<Record<string, unknown>> {
    const user = await this.adminRepo.findUserById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const stats = await this.adminRepo.getUserSpendingStats(id);

    return {
      id: user.id,
      email: user.email,
      displayName: user.display_name,
      phone: user.phone,
      avatarUrl: user.avatar_url,
      role: user.role,
      status: user.status,
      githubId: user.github_id,
      googleId: user.google_id,
      wechatId: user.wechat_id,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      balance: user.balance ? {
        amount: user.balance.amount,
        frozen: user.balance.frozen,
        available: user.balance.amount - user.balance.frozen,
      } : null,
      stats: {
        apiKeyCount: user._count.apiKeys,
        requestCount: user._count.requestLogs,
        ...stats,
      },
      recentOrders: user.orders.map((o) => ({
        id: o.id,
        orderNo: o.order_no,
        amount: o.amount,
        status: o.status,
        paymentMethod: o.payment_method,
        createdAt: o.created_at,
        paidAt: o.paid_at,
      })),
      recentTransactions: user.transactions.map((t) => ({
        id: t.id,
        type: t.type,
        amount: t.amount,
        balanceAfter: t.balance_after,
        remark: t.remark,
        createdAt: t.created_at,
      })),
      recentApiKeys: user.apiKeys.map((k) => ({
        id: k.id,
        name: k.name,
        keyPrefix: k.key_prefix,
        isActive: k.is_active,
        totalRequests: k.total_requests,
        lastUsedAt: k.last_used_at,
        createdAt: k.created_at,
      })),
    };
  }

  /**
   * 更新用户角色
   * SECURITY: 仅 SUPER_ADMIN 可修改角色
   * SECURITY: 使用 Prisma 枚举类型，移除 `as never` 断言
   */
  async updateUserRole(
    id: string,
    dto: UpdateUserRoleDto,
    operatorRole: UserRole,
    operatorId?: string,
  ): Promise<Record<string, unknown>> {
    const user = await this.adminRepo.findUserById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 仅 super_admin 可修改角色
    if (operatorRole !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Only super_admin can modify user roles');
    }

    // 不允许修改自己的角色
    if (operatorId && id === operatorId) {
      throw new ForbiddenException('Cannot modify your own role');
    }

    const updated = await this.adminRepo.updateUserRole(id, dto.role as UserRole);
    this.logger.log(`User role updated: ${id} -> ${dto.role}`);

    return {
      id: updated.id,
      email: updated.email,
      role: updated.role,
    };
  }

  /**
   * 更新用户状态
   * SECURITY: 不允许禁用自己
   * SECURITY: 使用 Prisma 枚举类型
   */
  async updateUserStatus(
    id: string,
    dto: UpdateUserStatusDto,
    operatorId: string,
  ): Promise<Record<string, unknown>> {
    const user = await this.adminRepo.findUserById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 不允许禁用自己
    if (id === operatorId) {
      throw new ForbiddenException('Cannot modify your own status');
    }

    const updated = await this.adminRepo.updateUserStatus(id, dto.status as UserStatus);
    this.logger.log(`User status updated: ${id} -> ${dto.status}${dto.reason ? ` (${dto.reason})` : ''}`);

    return {
      id: updated.id,
      email: updated.email,
      status: updated.status,
    };
  }

  // ──────────────────────────────────────────────
  // 响应转换（snake_case -> camelCase）
  // ──────────────────────────────────────────────

  /**
   * Provider 响应转换
   */
  private toProviderResponse(provider: Record<string, unknown>): ProviderResponseDto {
    return {
      id: provider['id'] as string,
      name: provider['name'] as string,
      displayName: provider['display_name'] as string,
      baseUrl: provider['base_url'] as string,
      isActive: provider['is_active'] as boolean,
      channelCount: (provider['_count'] as Record<string, number>)?.['channels'],
      createdAt: provider['created_at'] as Date,
      updatedAt: provider['updated_at'] as Date,
    };
  }

  /**
   * Channel 响应转换
   * SECURITY: API Key 脱敏显示，不暴露原始密钥
   *
   * @param channel - 数据库记录
   * @param plainApiKey - 明文 API Key（仅创建/更新时传入）
   */
  private toChannelResponse(channel: Record<string, unknown>, plainApiKey?: string): ChannelResponseDto {
    // 用于脱敏显示的 API Key
    // 仅创建/更新时传入明文，查询时不显示加密密文
    const displayKey = plainApiKey
      ? maskApiKey(plainApiKey)
      : 'sk-****';

    return {
      id: channel['id'] as string,
      providerId: channel['provider_id'] as string,
      provider: channel['provider'] ? {
        id: (channel['provider'] as Record<string, unknown>)['id'] as string,
        name: (channel['provider'] as Record<string, unknown>)['name'] as string,
        displayName: (channel['provider'] as Record<string, unknown>)['display_name'] as string,
      } : undefined,
      name: channel['name'] as string,
      baseUrl: channel['base_url'] as string,
      keyPrefix: displayKey,
      weight: channel['weight'] as number,
      priority: channel['priority'] as number,
      isActive: channel['is_active'] as boolean,
      status: channel['status'] as string,
      totalRequests: channel['total_requests'] as number,
      failedRequests: channel['failed_requests'] as number,
      avgLatencyMs: channel['avg_latency_ms'] as number,
      modelCount: Array.isArray(channel['models']) ? (channel['models'] as unknown[]).length : undefined,
      createdAt: channel['created_at'] as Date,
      updatedAt: channel['updated_at'] as Date,
    };
  }

  /**
   * Model 响应转换
   *
   * 价格从 分/百万token 转换为 元/百万token
   */
  private toModelResponse(model: Record<string, unknown>): ModelResponseDto {
    const pricing = model['pricing'] as Record<string, unknown> | null;
    return {
      id: model['id'] as string,
      name: model['name'] as string,
      displayName: model['display_name'] as string,
      providerId: model['provider_id'] as string,
      maxContext: model['max_context'] as number,
      supportsStreaming: model['supports_streaming'] as boolean,
      supportsTools: model['supports_tools'] as boolean,
      supportsVision: model['supports_vision'] as boolean,
      isActive: model['is_active'] as boolean,
      pricing: pricing ? {
        id: pricing['id'] as string,
        inputPrice: (pricing['input_price'] as number) / 100,
        outputPrice: (pricing['output_price'] as number) / 100,
        cachedPrice: pricing['cached_price'] != null ? (pricing['cached_price'] as number) / 100 : null,
        reasoningPrice: pricing['reasoning_price'] != null ? (pricing['reasoning_price'] as number) / 100 : null,
        multiplier: Number(pricing['multiplier']),
      } : null,
      createdAt: model['created_at'] as Date,
      updatedAt: model['updated_at'] as Date,
    };
  }

  // ──────────────────────────────────────────────
  // 支付配置管理
  // ──────────────────────────────────────────────

  /**
   * 获取所有支付配置
   */
  async listPaymentConfigs() {
    return this.paymentConfigService.findAll();
  }

  /**
   * 获取单个支付配置
   */
  async getPaymentConfig(name: string) {
    return this.paymentConfigService.findByName(name);
  }

  /**
   * 更新支付配置
   */
  async updatePaymentConfig(name: string, dto: UpdatePaymentConfigDto) {
    return this.paymentConfigService.update(name, dto);
  }

  /**
   * 切换支付配置启用状态
   */
  async togglePaymentConfig(name: string) {
    return this.paymentConfigService.toggle(name);
  }

  // ──────────────────────────────────────────────
  // SMTP配置管理
  // ──────────────────────────────────────────────

  /**
   * 获取SMTP配置
   */
  async getSmtpConfig() {
    return this.smtpConfigService.getConfig();
  }

  /**
   * 更新SMTP配置
   */
  async updateSmtpConfig(dto: UpdateSmtpConfigDto) {
    const result = await this.smtpConfigService.update(dto);
    // 刷新邮件服务
    await this.emailService.refreshTransporter();
    return result;
  }

  /**
   * 切换SMTP配置启用状态
   */
  async toggleSmtpConfig() {
    const result = await this.smtpConfigService.toggle();
    // 刷新邮件服务
    await this.emailService.refreshTransporter();
    return result;
  }

  /**
   * 测试SMTP连接
   */
  async testSmtpConnection() {
    return this.emailService.testConnection();
  }

  /**
   * 发送测试邮件
   */
  async sendTestEmail(email: string) {
    return this.emailService.sendTestEmail(email);
  }

  // ──────────────────────────────────────────────
  // RechargePromotion 充值赠送活动
  // ──────────────────────────────────────────────

  async listPromotions(page: number, pageSize: number, isActive?: boolean) {
    const skip = (page - 1) * pageSize;
    const where: Prisma.RechargePromotionWhereInput = {};
    if (isActive !== undefined) where.is_active = isActive;

    const { items, total } = await this.adminRepo.findPromotions({ skip, take: pageSize, where });
    return {
      items: items.map((p) => this.toPromotionResponse(p)),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async getPromotion(id: string) {
    const promo = await this.adminRepo.findPromotionById(id);
    if (!promo) throw new NotFoundException('活动不存在');
    return this.toPromotionResponse(promo);
  }

  async createPromotion(dto: CreatePromotionDto) {
    if (dto.bonus_type === 'PERCENTAGE' && dto.bonus_value > 10000) {
      throw new BadRequestException('百分比不能超过100%');
    }
    const promo = await this.adminRepo.createPromotion({
      name: dto.name,
      description: dto.description,
      min_amount: dto.min_amount,
      bonus_type: dto.bonus_type,
      bonus_value: dto.bonus_value,
      max_bonus: dto.max_bonus,
      start_at: new Date(dto.start_at),
      end_at: dto.end_at ? new Date(dto.end_at) : null,
      is_active: dto.is_active ?? true,
    });
    return this.toPromotionResponse(promo);
  }

  async updatePromotion(id: string, dto: UpdatePromotionDto) {
    const existing = await this.adminRepo.findPromotionById(id);
    if (!existing) throw new NotFoundException('活动不存在');

    const data: Prisma.RechargePromotionUpdateInput = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.min_amount !== undefined) data.min_amount = dto.min_amount;
    if (dto.bonus_type !== undefined) data.bonus_type = dto.bonus_type;
    if (dto.bonus_value !== undefined) data.bonus_value = dto.bonus_value;
    if (dto.max_bonus !== undefined) data.max_bonus = dto.max_bonus;
    if (dto.start_at !== undefined) data.start_at = new Date(dto.start_at);
    if (dto.end_at !== undefined) data.end_at = dto.end_at ? new Date(dto.end_at) : null;
    if (dto.is_active !== undefined) data.is_active = dto.is_active;

    const promo = await this.adminRepo.updatePromotion(id, data);
    return this.toPromotionResponse(promo);
  }

  async deletePromotion(id: string) {
    const existing = await this.adminRepo.findPromotionById(id);
    if (!existing) throw new NotFoundException('活动不存在');
    await this.adminRepo.deletePromotion(id);
  }

  async togglePromotion(id: string) {
    const existing = await this.adminRepo.findPromotionById(id);
    if (!existing) throw new NotFoundException('活动不存在');
    const promo = await this.adminRepo.updatePromotion(id, { is_active: !existing.is_active });
    return this.toPromotionResponse(promo);
  }

  private toPromotionResponse(p: any) {
    return {
      id: p.id,
      name: p.name,
      description: p.description,
      minAmount: p.min_amount,
      bonusType: p.bonus_type,
      bonusValue: p.bonus_value,
      maxBonus: p.max_bonus,
      startAt: p.start_at,
      endAt: p.end_at,
      isActive: p.is_active,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    };
  }

  // ──────────────────────────────────────────────
  // Invoice 发票管理
  // ──────────────────────────────────────────────

  async listInvoices(page: number, pageSize: number, status?: string, search?: string) {
    const skip = (page - 1) * pageSize;
    const where: Prisma.InvoiceWhereInput = {};
    if (status) where.status = status as any;
    if (search) {
      where.OR = [
        { invoice_no: { contains: search } },
        { company_name: { contains: search } },
        { tax_id: { contains: search } },
        { user: { email: { contains: search } } },
      ];
    }

    const { items, total } = await this.adminRepo.findInvoices({ skip, take: pageSize, where });
    return {
      items: items.map((i) => this.toInvoiceResponse(i)),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async getInvoice(id: string) {
    const invoice = await this.adminRepo.findInvoiceById(id);
    if (!invoice) throw new NotFoundException('发票不存在');
    return this.toInvoiceResponse(invoice);
  }

  async createInvoice(userId: string, dto: CreateInvoiceDto) {
    const invoiceNo = await this.adminRepo.generateInvoiceNo();
    const invoice = await this.adminRepo.createInvoice({
      invoice_no: invoiceNo,
      user: { connect: { id: userId } },
      type: dto.type,
      company_name: dto.company_name,
      tax_id: dto.tax_id,
      company_address: dto.company_address,
      company_phone: dto.company_phone,
      bank_name: dto.bank_name,
      bank_account: dto.bank_account,
      amount: dto.amount,
      content: dto.content ?? '技术服务费',
      applicant_email: dto.applicant_email,
      applicant_phone: dto.applicant_phone,
      mailing_address: dto.mailing_address,
    });
    return this.toInvoiceResponse(invoice);
  }

  async reviewInvoice(id: string, dto: ReviewInvoiceDto, reviewerId: string) {
    const existing = await this.adminRepo.findInvoiceById(id);
    if (!existing) throw new NotFoundException('发票不存在');
    if (existing.status !== 'PENDING') throw new BadRequestException('只能审核待审核状态的发票');

    const invoice = await this.adminRepo.updateInvoice(id, {
      status: dto.status,
      review_remark: dto.review_remark,
      reviewed_at: new Date(),
      reviewed_by: reviewerId,
    });
    return this.toInvoiceResponse(invoice);
  }

  async issueInvoice(id: string, dto: IssueInvoiceDto) {
    const existing = await this.adminRepo.findInvoiceById(id);
    if (!existing) throw new NotFoundException('发票不存在');
    if (existing.status !== 'APPROVED') throw new BadRequestException('只能开具已通过的发票');

    const invoice = await this.adminRepo.updateInvoice(id, {
      status: 'ISSUED',
      file_url: dto.file_url,
      issued_at: new Date(),
    });
    return this.toInvoiceResponse(invoice);
  }

  async deleteInvoice(id: string) {
    const existing = await this.adminRepo.findInvoiceById(id);
    if (!existing) throw new NotFoundException('发票不存在');
    if (existing.status === 'ISSUED') throw new BadRequestException('已开具的发票不能删除');
    await this.adminRepo.deleteInvoice(id);
  }

  private toInvoiceResponse(i: any) {
    return {
      id: i.id,
      invoiceNo: i.invoice_no,
      userId: i.user_id,
      userEmail: i.user?.email ?? 'Unknown',
      userName: i.user?.display_name ?? null,
      type: i.type,
      companyName: i.company_name,
      taxId: i.tax_id,
      companyAddress: i.company_address,
      companyPhone: i.company_phone,
      bankName: i.bank_name,
      bankAccount: i.bank_account,
      amount: i.amount,
      content: i.content,
      status: i.status,
      applicantEmail: i.applicant_email,
      applicantPhone: i.applicant_phone,
      mailingAddress: i.mailing_address,
      fileUrl: i.file_url,
      reviewedAt: i.reviewed_at,
      reviewedBy: i.reviewed_by,
      reviewRemark: i.review_remark,
      issuedAt: i.issued_at,
      createdAt: i.created_at,
      updatedAt: i.updated_at,
    };
  }

  // ──────────────────────────────────────────────
  // 系统设置管理
  // ──────────────────────────────────────────────

  /**
   * 获取所有系统设置（按分类分组）
   */
  async getSystemSettings() {
    return this.systemSettingService.getAll();
  }

  /**
   * 按分类获取系统设置
   */
  async getSystemSettingsByCategory(category: string) {
    return this.systemSettingService.getByCategory(category);
  }

  /**
   * 批量更新分类设置
   */
  async updateSystemSettings(category: string, settings: Array<{ key: string; value: string | null }>) {
    await this.systemSettingService.bulkUpdate(category, settings);
    return { success: true, message: `已更新 ${settings.length} 项设置` };
  }

  /**
   * 更新单个设置
   */
  async updateSystemSetting(category: string, key: string, value: string | null) {
    return this.systemSettingService.upsert(category, key, value);
  }
}
