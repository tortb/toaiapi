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
import { encrypt, maskApiKey } from '../../common/utils/crypto.util';
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
         */
        async listUsers(page, pageSize, role, status) {
            const skip = (page - 1) * pageSize;
            const where = {};
            if (role)
                where['role'] = role;
            if (status)
                where['status'] = status;
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
            const displayKey = plainApiKey || channel['api_key'] || '';
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
                keyPrefix: maskApiKey(displayKey),
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