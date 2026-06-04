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
import { ProviderResponseDto } from './dto/provider-response.dto';
import { ChannelResponseDto } from './dto/channel-response.dto';
import { ModelResponseDto } from './dto/model-response.dto';
import type { PaginatedResult } from '../../common/dto/pagination.dto';

/**
 * Admin 管理服务
 *
 * 职责：Provider / Channel / Model / User 的管理操作。
 * 所有方法仅由 AdminController 调用，需 admin 角色。
 * SECURITY: Channel API Key 使用 AES-256-GCM 加密存储
 */
@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(private readonly adminRepo: AdminRepository) {}

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
   */
  async upsertPricing(modelId: string, dto: UpsertPricingDto): Promise<ModelResponseDto> {
    const model = await this.adminRepo.findModelById(modelId);
    if (!model) {
      throw new NotFoundException('Model not found');
    }

    await this.adminRepo.upsertModelPricing(modelId, {
      input_price: dto.inputPrice,
      output_price: dto.outputPrice,
      cached_price: dto.cachedPrice ?? null,
      reasoning_price: dto.reasoningPrice ?? null,
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
   */
  async listUsers(
    page: number,
    pageSize: number,
    role?: UserRole,
    status?: UserStatus,
  ): Promise<PaginatedResult<Record<string, unknown>>> {
    const skip = (page - 1) * pageSize;
    const where: Prisma.UserWhereInput = {};
    if (role) where['role'] = role;
    if (status) where['status'] = status;

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
   * 获取用户详情（含余额和统计）
   */
  async getUser(id: string): Promise<Record<string, unknown>> {
    const user = await this.adminRepo.findUserById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      displayName: user.display_name,
      role: user.role,
      status: user.status,
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
      },
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
    const displayKey = plainApiKey || (channel['api_key'] as string) || '';

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
      keyPrefix: maskApiKey(displayKey),
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
        inputPrice: pricing['input_price'] as number,
        outputPrice: pricing['output_price'] as number,
        cachedPrice: pricing['cached_price'] as number | null,
        reasoningPrice: pricing['reasoning_price'] as number | null,
        multiplier: Number(pricing['multiplier']),
      } : null,
      createdAt: model['created_at'] as Date,
      updatedAt: model['updated_at'] as Date,
    };
  }
}
