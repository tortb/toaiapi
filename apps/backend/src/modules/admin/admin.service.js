var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
import { Injectable, Logger, NotFoundException, ConflictException, ForbiddenException, } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { encrypt, decrypt, maskApiKey } from '../../common/utils/crypto.util';
/**
 * Admin 管理服务
 *
 * 职责：Provider / Channel / Model / User / PaymentConfig / SmtpConfig 的管理操作。
 * 所有方法仅由 AdminController 调用，需 admin 角色。
 * SECURITY: Channel API Key 使用 AES-256-GCM 加密存储
 */
let AdminService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AdminService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AdminService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        adminRepo;
        paymentConfigService;
        smtpConfigService;
        emailService;
        logger = new Logger(AdminService.name);
        constructor(adminRepo, paymentConfigService, smtpConfigService, emailService) {
            this.adminRepo = adminRepo;
            this.paymentConfigService = paymentConfigService;
            this.smtpConfigService = smtpConfigService;
            this.emailService = emailService;
        }
        // ──────────────────────────────────────────────
        // Dashboard
        // ──────────────────────────────────────────────
        /**
         * 获取 Dashboard 数据
         */
        async getDashboard(startDate, endDate) {
            // 默认最近 7 天
            const end = endDate ? new Date(endDate) : new Date();
            const start = startDate
                ? new Date(startDate)
                : new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
            // 并行查询所有数据
            const [userStats, rechargeStats, consumptionStats, requestStats, totalBalance, callStats, modelDistribution, recentOrders, channelStatus,] = await Promise.all([
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
            const calcGrowth = (current, previous) => {
                if (previous === 0)
                    return current > 0 ? 100 : 0;
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
        async listUserGroups(page, pageSize, search, isActive) {
            const skip = (page - 1) * pageSize;
            const where = { deleted_at: null };
            if (search) {
                where['OR'] = [
                    { name: { contains: search, mode: 'insensitive' } },
                    { display_name: { contains: search, mode: 'insensitive' } },
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
        async getUserGroup(id) {
            const group = await this.adminRepo.findUserGroupById(id);
            if (!group) {
                throw new NotFoundException('User group not found');
            }
            return this.toUserGroupResponse(group);
        }
        /**
         * 创建用户组
         */
        async createUserGroup(dto) {
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
                allowed_models: dto.allowedModels ?? [],
                allowed_channels: dto.allowedChannels ?? [],
                allow_proxy: dto.allowProxy ?? true,
                allow_share: dto.allowShare ?? false,
            });
            this.logger.log(`User group created: ${group.id} (${group.name})`);
            return this.toUserGroupResponse(group);
        }
        /**
         * 更新用户组
         */
        async updateUserGroup(id, dto) {
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
                ...(dto.allowedModels !== undefined && { allowed_models: dto.allowedModels }),
                ...(dto.allowedChannels !== undefined && { allowed_channels: dto.allowedChannels }),
                ...(dto.allowProxy !== undefined && { allow_proxy: dto.allowProxy }),
                ...(dto.allowShare !== undefined && { allow_share: dto.allowShare }),
            });
            this.logger.log(`User group updated: ${id}`);
            return this.toUserGroupResponse(group);
        }
        /**
         * 切换用户组状态
         */
        async toggleUserGroup(id) {
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
        async deleteUserGroup(id) {
            const existing = await this.adminRepo.findUserGroupById(id);
            if (!existing) {
                throw new NotFoundException('User group not found');
            }
            if (existing.is_builtin) {
                throw new ForbiddenException('Cannot delete built-in user group');
            }
            const userCount = await this.adminRepo.countUsersInGroup(id);
            if (userCount > 0) {
                throw new ConflictException(`Cannot delete user group '${existing.name}': ${userCount} user(s) still assigned. Reassign users first.`);
            }
            await this.adminRepo.deleteUserGroup(id);
            this.logger.log(`User group deleted: ${id} (${existing.name})`);
        }
        /**
         * 转换用户组响应
         */
        toUserGroupResponse(group) {
            return {
                id: group.id,
                name: group.name,
                displayName: group.display_name,
                description: group.description,
                priceMultiplier: Number(group.price_multiplier),
                rpmLimit: group.rpm_limit,
                tpmLimit: group.tpm_limit,
                maxApiKeys: group.max_api_keys,
                allowedModels: group.allowed_models,
                allowedChannels: group.allowed_channels,
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
        async listRoles() {
            const roles = await this.adminRepo.findRoles({});
            return roles.map((r) => this.toRoleResponse(r));
        }
        /**
         * 获取角色详情
         */
        async getRole(id) {
            const role = await this.adminRepo.findRoleById(id);
            if (!role) {
                throw new NotFoundException('Role not found');
            }
            return this.toRoleDetailResponse(role);
        }
        /**
         * 创建角色
         */
        async createRole(dto) {
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
        async updateRole(id, dto) {
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
        async deleteRole(id) {
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
        async setRolePermissions(id, dto) {
            const role = await this.adminRepo.findRoleById(id);
            if (!role) {
                throw new NotFoundException('Role not found');
            }
            await this.adminRepo.setRolePermissions(id, dto.permissionIds);
            const updated = await this.adminRepo.findRoleById(id);
            this.logger.log(`Role permissions updated: ${id}`);
            return this.toRoleDetailResponse(updated);
        }
        /**
         * 获取所有权限
         */
        async listPermissions() {
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
        toRoleResponse(role) {
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
        toRoleDetailResponse(role) {
            return {
                ...this.toRoleResponse(role),
                permissions: role.permissions?.map((rp) => ({
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
        async listApiKeys(page, pageSize, search, isActive, userId) {
            const skip = (page - 1) * pageSize;
            const where = {};
            if (userId) {
                where.user_id = userId;
            }
            if (isActive !== undefined) {
                where.is_active = isActive;
            }
            if (search) {
                where.OR = [
                    { key_prefix: { contains: search, mode: 'insensitive' } },
                    { name: { contains: search, mode: 'insensitive' } },
                    { user: { email: { contains: search, mode: 'insensitive' } } },
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
        async getApiKey(id) {
            const key = await this.adminRepo.findApiKeyById(id);
            if (!key) {
                throw new NotFoundException('API Key not found');
            }
            return this.toApiKeyResponse(key);
        }
        /**
         * 切换 API Key 状态
         */
        async toggleApiKey(id) {
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
        async deleteApiKey(id) {
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
        toApiKeyResponse(key) {
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
                modelLimit: key.model_limit,
                ipWhitelist: key.ip_whitelist,
                lastUsedAt: key.last_used_at?.toISOString() ?? null,
                totalRequests: key.total_requests,
                createdAt: key.created_at.toISOString(),
                updatedAt: key.updated_at.toISOString(),
            };
        }
        // ──────────────────────────────────────────────
        // Provider 管理
        // ──────────────────────────────────────────────
        /**
         * 查询 Provider 列表（分页）
         */
        async listProviders(page, pageSize) {
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
        async getProvider(id) {
            const provider = await this.adminRepo.findProviderById(id);
            if (!provider) {
                throw new NotFoundException('Provider not found');
            }
            return this.toProviderResponse(provider);
        }
        /**
         * 创建 Provider
         */
        async createProvider(dto) {
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
        async updateProvider(id, dto) {
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
        async deleteProvider(id) {
            const provider = await this.adminRepo.findProviderById(id);
            if (!provider) {
                throw new NotFoundException('Provider not found');
            }
            if (provider.channels.length > 0) {
                throw new ConflictException(`Cannot delete provider '${provider.name}': ${provider.channels.length} channel(s) still associated. Delete channels first.`);
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
        async listChannels(page, pageSize, providerId) {
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
        async getChannel(id) {
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
        async createChannel(dto) {
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
        async updateChannel(id, dto) {
            const existing = await this.adminRepo.findChannelById(id);
            if (!existing) {
                throw new NotFoundException('Channel not found');
            }
            const updateData = {};
            if (dto.name !== undefined)
                updateData['name'] = dto.name;
            if (dto.baseUrl !== undefined)
                updateData['base_url'] = dto.baseUrl;
            if (dto.apiKey !== undefined)
                updateData['api_key'] = encrypt(dto.apiKey);
            if (dto.weight !== undefined)
                updateData['weight'] = dto.weight;
            if (dto.priority !== undefined)
                updateData['priority'] = dto.priority;
            const channel = await this.adminRepo.updateChannel(id, updateData);
            this.logger.log(`Channel updated: ${id}`);
            return this.toChannelResponse(channel, dto.apiKey);
        }
        /**
         * 启用 Channel
         */
        async enableChannel(id) {
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
        async disableChannel(id) {
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
        async deleteChannel(id) {
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
        async testChannel(id) {
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
                }
                else {
                    const errorText = await response.text().catch(() => '');
                    return {
                        success: false,
                        latencyMs,
                        message: `HTTP ${response.status}: ${errorText.substring(0, 200)}`,
                    };
                }
            }
            catch (error) {
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
        async listModels(page, pageSize) {
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
        async getModel(id) {
            const model = await this.adminRepo.findModelById(id);
            if (!model) {
                throw new NotFoundException('Model not found');
            }
            return this.toModelResponse(model);
        }
        /**
         * 创建 Model
         */
        async createModel(dto) {
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
        async updateModel(id, dto) {
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
        async deleteModel(id) {
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
        async upsertPricing(modelId, dto) {
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
         * @param search - 搜索关键字（ID/用户名/邮箱）
         */
        async listUsers(page, pageSize, role, status, search) {
            const skip = (page - 1) * pageSize;
            const where = { deleted_at: null };
            if (role)
                where['role'] = role;
            if (status)
                where['status'] = status;
            // 搜索：ID / 用户名 / 邮箱
            if (search && search.trim()) {
                const keyword = search.trim();
                where['OR'] = [
                    { id: { contains: keyword, mode: 'insensitive' } },
                    { display_name: { contains: keyword, mode: 'insensitive' } },
                    { email: { contains: keyword, mode: 'insensitive' } },
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
         * 获取用户详情（含余额和统计）
         */
        async getUser(id) {
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
        async updateUserRole(id, dto, operatorRole, operatorId) {
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
            const updated = await this.adminRepo.updateUserRole(id, dto.role);
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
        async updateUserStatus(id, dto, operatorId) {
            const user = await this.adminRepo.findUserById(id);
            if (!user) {
                throw new NotFoundException('User not found');
            }
            // 不允许禁用自己
            if (id === operatorId) {
                throw new ForbiddenException('Cannot modify your own status');
            }
            const updated = await this.adminRepo.updateUserStatus(id, dto.status);
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
        toProviderResponse(provider) {
            return {
                id: provider['id'],
                name: provider['name'],
                displayName: provider['display_name'],
                baseUrl: provider['base_url'],
                isActive: provider['is_active'],
                channelCount: provider['_count']?.['channels'],
                createdAt: provider['created_at'],
                updatedAt: provider['updated_at'],
            };
        }
        /**
         * Channel 响应转换
         * SECURITY: API Key 脱敏显示，不暴露原始密钥
         *
         * @param channel - 数据库记录
         * @param plainApiKey - 明文 API Key（仅创建/更新时传入）
         */
        toChannelResponse(channel, plainApiKey) {
            // 用于脱敏显示的 API Key
            // 仅创建/更新时传入明文，查询时不显示加密密文
            const displayKey = plainApiKey
                ? maskApiKey(plainApiKey)
                : 'sk-****';
            return {
                id: channel['id'],
                providerId: channel['provider_id'],
                provider: channel['provider'] ? {
                    id: channel['provider']['id'],
                    name: channel['provider']['name'],
                    displayName: channel['provider']['display_name'],
                } : undefined,
                name: channel['name'],
                baseUrl: channel['base_url'],
                keyPrefix: displayKey,
                weight: channel['weight'],
                priority: channel['priority'],
                isActive: channel['is_active'],
                status: channel['status'],
                totalRequests: channel['total_requests'],
                failedRequests: channel['failed_requests'],
                avgLatencyMs: channel['avg_latency_ms'],
                modelCount: Array.isArray(channel['models']) ? channel['models'].length : undefined,
                createdAt: channel['created_at'],
                updatedAt: channel['updated_at'],
            };
        }
        /**
         * Model 响应转换
         */
        toModelResponse(model) {
            const pricing = model['pricing'];
            return {
                id: model['id'],
                name: model['name'],
                displayName: model['display_name'],
                providerId: model['provider_id'],
                maxContext: model['max_context'],
                supportsStreaming: model['supports_streaming'],
                supportsTools: model['supports_tools'],
                supportsVision: model['supports_vision'],
                isActive: model['is_active'],
                pricing: pricing ? {
                    id: pricing['id'],
                    inputPrice: pricing['input_price'],
                    outputPrice: pricing['output_price'],
                    cachedPrice: pricing['cached_price'],
                    reasoningPrice: pricing['reasoning_price'],
                    multiplier: Number(pricing['multiplier']),
                } : null,
                createdAt: model['created_at'],
                updatedAt: model['updated_at'],
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
        async getPaymentConfig(name) {
            return this.paymentConfigService.findByName(name);
        }
        /**
         * 更新支付配置
         */
        async updatePaymentConfig(name, dto) {
            return this.paymentConfigService.update(name, dto);
        }
        /**
         * 切换支付配置启用状态
         */
        async togglePaymentConfig(name) {
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
        async updateSmtpConfig(dto) {
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
        async sendTestEmail(email) {
            return this.emailService.sendTestEmail(email);
        }
    };
    return AdminService = _classThis;
})();
export { AdminService };
//# sourceMappingURL=admin.service.js.map