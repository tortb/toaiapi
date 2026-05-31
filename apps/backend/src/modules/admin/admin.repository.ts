import { Injectable } from '@nestjs/common';
import { Prisma, ChannelStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Admin 数据访问层
 *
 * 封装 Admin 管理所需的数据库操作。
 * Provider/Channel/Model/User 的 CRUD 和聚合查询。
 */
@Injectable()
export class AdminRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ──────────────────────────────────────────────
  // Provider
  // ──────────────────────────────────────────────

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

  async setChannelStatus(id: string, status: ChannelStatus, isActive: boolean) {
    return this.prisma.channel.update({
      where: { id },
      data: { status, is_active: isActive },
    });
  }

  // ──────────────────────────────────────────────
  // Model
  // ──────────────────────────────────────────────

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

  async findUserById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        display_name: true,
        role: true,
        status: true,
        created_at: true,
        updated_at: true,
        balance: { select: { amount: true, frozen: true } },
        _count: { select: { apiKeys: true, requestLogs: true } },
      },
    });
  }

  async updateUserRole(id: string, role: string) {
    return this.prisma.user.update({
      where: { id },
      data: { role: role as never },
      select: { id: true, email: true, role: true },
    });
  }

  async updateUserStatus(id: string, status: string) {
    return this.prisma.user.update({
      where: { id },
      data: { status: status as never },
      select: { id: true, email: true, status: true },
    });
  }
}
