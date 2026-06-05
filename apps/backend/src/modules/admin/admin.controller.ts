import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
} from '@nestjs/swagger';
import { UserRole, UserStatus } from '@prisma/client';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, CurrentUserInfo } from '../../common/decorators/current-user.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { ProviderResponseDto } from './dto/provider-response.dto';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { ChannelResponseDto } from './dto/channel-response.dto';
import { CreateModelDto } from './dto/create-model.dto';
import { UpdateModelDto } from './dto/update-model.dto';
import { ModelResponseDto } from './dto/model-response.dto';
import { UpsertPricingDto } from './dto/upsert-pricing.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { UpdatePaymentConfigDto } from './dto/payment-config.dto';
import { UpdateSmtpConfigDto, SendTestEmailDto } from './dto/smtp-config.dto';
import { DashboardResponseDto } from './dto/dashboard-response.dto';
import { CreateUserGroupDto, UpdateUserGroupDto } from './dto/user-group.dto';
import { CreateRoleDto, UpdateRoleDto, AssignPermissionsDto } from './dto/role.dto';
import { CreatePromotionDto, UpdatePromotionDto } from './dto/promotion.dto';
import { CreateInvoiceDto, ReviewInvoiceDto, IssueInvoiceDto } from './dto/invoice.dto';

/**
 * Admin 管理控制器
 *
 * 所有端点需要 JWT 认证 + admin 角色。
 * 提供 Provider / Channel / Model / User 的管理 API。
 */
@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ──────────────────────────────────────────────
  // Dashboard
  // ──────────────────────────────────────────────

  @Get('dashboard')
  @ApiOperation({ summary: '获取 Dashboard 数据', description: '返回系统概览、调用统计、模型分布等' })
  @ApiOkResponse({ type: DashboardResponseDto })
  async getDashboard(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<DashboardResponseDto> {
    return this.adminService.getDashboard(startDate, endDate);
  }

  // ──────────────────────────────────────────────
  // UserGroup 管理
  // ──────────────────────────────────────────────

  @Get('user-groups')
  @ApiOperation({ summary: '获取用户组列表', description: '分页查询，支持搜索和状态筛选' })
  @ApiOkResponse()
  async listUserGroups(
    @Query() pagination: PaginationDto,
    @Query('search') search?: string,
    @Query('isActive') isActive?: boolean,
  ) {
    return this.adminService.listUserGroups(pagination.page, pagination.pageSize, search, isActive);
  }

  @Post('user-groups')
  @Roles('admin')
  @ApiOperation({ summary: '创建用户组' })
  @ApiCreatedResponse()
  async createUserGroup(@Body() dto: CreateUserGroupDto) {
    return this.adminService.createUserGroup(dto);
  }

  @Get('user-groups/:id')
  @ApiOperation({ summary: '获取用户组详情' })
  @ApiOkResponse()
  async getUserGroup(@Param('id') id: string) {
    return this.adminService.getUserGroup(id);
  }

  @Patch('user-groups/:id')
  @Roles('admin')
  @ApiOperation({ summary: '更新用户组' })
  @ApiOkResponse()
  async updateUserGroup(@Param('id') id: string, @Body() dto: UpdateUserGroupDto) {
    return this.adminService.updateUserGroup(id, dto);
  }

  @Patch('user-groups/:id/toggle')
  @Roles('admin')
  @ApiOperation({ summary: '切换用户组状态' })
  @ApiOkResponse()
  async toggleUserGroup(@Param('id') id: string) {
    return this.adminService.toggleUserGroup(id);
  }

  @Delete('user-groups/:id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除用户组', description: '有关联用户时拒绝删除' })
  @ApiNoContentResponse()
  async deleteUserGroup(@Param('id') id: string) {
    await this.adminService.deleteUserGroup(id);
  }

  // ──────────────────────────────────────────────
  // Role 管理
  // ──────────────────────────────────────────────

  @Get('roles')
  @ApiOperation({ summary: '获取角色列表' })
  @ApiOkResponse()
  async listRoles() {
    return this.adminService.listRoles();
  }

  @Post('roles')
  @Roles('super_admin')
  @ApiOperation({ summary: '创建角色' })
  @ApiCreatedResponse()
  async createRole(@Body() dto: CreateRoleDto) {
    return this.adminService.createRole(dto);
  }

  @Get('roles/:id')
  @ApiOperation({ summary: '获取角色详情' })
  @ApiOkResponse()
  async getRole(@Param('id') id: string) {
    return this.adminService.getRole(id);
  }

  @Patch('roles/:id')
  @Roles('super_admin')
  @ApiOperation({ summary: '更新角色' })
  @ApiOkResponse()
  async updateRole(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.adminService.updateRole(id, dto);
  }

  @Delete('roles/:id')
  @Roles('super_admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除角色', description: '系统角色不可删除' })
  @ApiNoContentResponse()
  async deleteRole(@Param('id') id: string) {
    await this.adminService.deleteRole(id);
  }

  @Put('roles/:id/permissions')
  @Roles('super_admin')
  @ApiOperation({ summary: '设置角色权限' })
  @ApiOkResponse()
  async setRolePermissions(@Param('id') id: string, @Body() dto: AssignPermissionsDto) {
    return this.adminService.setRolePermissions(id, dto);
  }

  // ──────────────────────────────────────────────
  // Permission 管理
  // ──────────────────────────────────────────────

  @Get('permissions')
  @ApiOperation({ summary: '获取所有权限点' })
  @ApiOkResponse()
  async listPermissions() {
    return this.adminService.listPermissions();
  }

  // ──────────────────────────────────────────────
  // API Key 管理 (Admin)
  // ──────────────────────────────────────────────

  @Get('api-keys')
  @ApiOperation({ summary: '获取 API Key 列表', description: '分页查询，支持搜索和筛选' })
  @ApiOkResponse()
  async listApiKeys(
    @Query() pagination: PaginationDto,
    @Query('search') search?: string,
    @Query('isActive') isActive?: boolean,
    @Query('userId') userId?: string,
  ) {
    return this.adminService.listApiKeys(pagination.page, pagination.pageSize, search, isActive, userId);
  }

  @Get('api-keys/:id')
  @ApiOperation({ summary: '获取 API Key 详情' })
  @ApiOkResponse()
  async getApiKey(@Param('id') id: string) {
    return this.adminService.getApiKey(id);
  }

  @Patch('api-keys/:id/toggle')
  @Roles('admin')
  @ApiOperation({ summary: '切换 API Key 状态' })
  @ApiOkResponse()
  async toggleApiKey(@Param('id') id: string) {
    return this.adminService.toggleApiKey(id);
  }

  @Delete('api-keys/:id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除 API Key' })
  @ApiNoContentResponse()
  async deleteApiKey(@Param('id') id: string) {
    await this.adminService.deleteApiKey(id);
  }

  // ──────────────────────────────────────────────
  // Order 管理
  // ──────────────────────────────────────────────

  @Get('orders')
  @ApiOperation({ summary: '获取订单列表', description: '分页查询，支持搜索和筛选' })
  @ApiOkResponse()
  async listOrders(
    @Query() pagination: PaginationDto,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('userId') userId?: string,
  ) {
    return this.adminService.listOrders(pagination.page, pagination.pageSize, search, status, userId);
  }

  @Get('orders/:id')
  @ApiOperation({ summary: '获取订单详情' })
  @ApiOkResponse()
  async getOrder(@Param('id') id: string) {
    return this.adminService.getOrder(id);
  }

  // ──────────────────────────────────────────────
  // Bill / Transaction 管理
  // ──────────────────────────────────────────────

  @Get('bills')
  @ApiOperation({ summary: '获取账单/交易流水列表', description: '分页查询，支持搜索和筛选' })
  @ApiOkResponse()
  async listBills(
    @Query() pagination: PaginationDto,
    @Query('search') search?: string,
    @Query('type') type?: string,
    @Query('userId') userId?: string,
  ) {
    return this.adminService.listBills(pagination.page, pagination.pageSize, search, type, userId);
  }

  // ──────────────────────────────────────────────
  // Provider 管理
  // ──────────────────────────────────────────────

  @Get('providers')
  @ApiOperation({ summary: '获取 Provider 列表', description: '分页查询所有 Provider' })
  @ApiOkResponse({ type: [ProviderResponseDto] })
  async listProviders(@Query() pagination: PaginationDto) {
    return this.adminService.listProviders(pagination.page, pagination.pageSize);
  }

  @Post('providers')
  @ApiOperation({ summary: '创建 Provider' })
  @ApiCreatedResponse({ type: ProviderResponseDto })
  async createProvider(@Body() dto: CreateProviderDto) {
    return this.adminService.createProvider(dto);
  }

  @Get('providers/:id')
  @ApiOperation({ summary: '获取 Provider 详情' })
  @ApiOkResponse({ type: ProviderResponseDto })
  async getProvider(@Param('id') id: string) {
    return this.adminService.getProvider(id);
  }

  @Patch('providers/:id')
  @ApiOperation({ summary: '更新 Provider' })
  @ApiOkResponse({ type: ProviderResponseDto })
  async updateProvider(@Param('id') id: string, @Body() dto: UpdateProviderDto) {
    return this.adminService.updateProvider(id, dto);
  }

  @Delete('providers/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除 Provider', description: '有关联渠道时拒绝删除' })
  @ApiNoContentResponse()
  async deleteProvider(@Param('id') id: string) {
    await this.adminService.deleteProvider(id);
  }

  // ──────────────────────────────────────────────
  // Channel 管理
  // ──────────────────────────────────────────────

  @Get('channels')
  @ApiOperation({ summary: '获取渠道列表', description: '分页查询，支持按 Provider 筛选' })
  @ApiOkResponse({ type: [ChannelResponseDto] })
  async listChannels(
    @Query() pagination: PaginationDto,
    @Query('providerId') providerId?: string,
  ) {
    return this.adminService.listChannels(pagination.page, pagination.pageSize, providerId);
  }

  @Post('channels')
  @ApiOperation({ summary: '创建渠道' })
  @ApiCreatedResponse({ type: ChannelResponseDto })
  async createChannel(@Body() dto: CreateChannelDto) {
    return this.adminService.createChannel(dto);
  }

  @Get('channels/:id')
  @ApiOperation({ summary: '获取渠道详情' })
  @ApiOkResponse({ type: ChannelResponseDto })
  async getChannel(@Param('id') id: string) {
    return this.adminService.getChannel(id);
  }

  @Patch('channels/:id')
  @ApiOperation({ summary: '更新渠道' })
  @ApiOkResponse({ type: ChannelResponseDto })
  async updateChannel(@Param('id') id: string, @Body() dto: UpdateChannelDto) {
    return this.adminService.updateChannel(id, dto);
  }

  @Patch('channels/:id/enable')
  @ApiOperation({ summary: '启用渠道' })
  @ApiOkResponse({ type: ChannelResponseDto })
  async enableChannel(@Param('id') id: string) {
    return this.adminService.enableChannel(id);
  }

  @Patch('channels/:id/disable')
  @ApiOperation({ summary: '禁用渠道' })
  @ApiOkResponse({ type: ChannelResponseDto })
  async disableChannel(@Param('id') id: string) {
    return this.adminService.disableChannel(id);
  }

  @Delete('channels/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除渠道' })
  @ApiNoContentResponse()
  async deleteChannel(@Param('id') id: string) {
    await this.adminService.deleteChannel(id);
  }

  @Post('channels/:id/test')
  @ApiOperation({
    summary: '测试渠道连通性',
    description: '向渠道发送一个简单的测试请求，验证 API Key 和 Base URL 是否有效',
  })
  @ApiOkResponse()
  async testChannel(@Param('id') id: string) {
    return this.adminService.testChannel(id);
  }

  // ──────────────────────────────────────────────
  // Model 管理
  // ──────────────────────────────────────────────

  @Get('models')
  @ApiOperation({ summary: '获取模型列表', description: '分页查询所有模型（含定价）' })
  @ApiOkResponse({ type: [ModelResponseDto] })
  async listModels(@Query() pagination: PaginationDto) {
    return this.adminService.listModels(pagination.page, pagination.pageSize);
  }

  @Post('models')
  @ApiOperation({ summary: '创建模型' })
  @ApiCreatedResponse({ type: ModelResponseDto })
  async createModel(@Body() dto: CreateModelDto) {
    return this.adminService.createModel(dto);
  }

  @Get('models/:id')
  @ApiOperation({ summary: '获取模型详情' })
  @ApiOkResponse({ type: ModelResponseDto })
  async getModel(@Param('id') id: string) {
    return this.adminService.getModel(id);
  }

  @Patch('models/:id')
  @ApiOperation({ summary: '更新模型' })
  @ApiOkResponse({ type: ModelResponseDto })
  async updateModel(@Param('id') id: string, @Body() dto: UpdateModelDto) {
    return this.adminService.updateModel(id, dto);
  }

  @Delete('models/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除模型' })
  @ApiNoContentResponse()
  async deleteModel(@Param('id') id: string) {
    await this.adminService.deleteModel(id);
  }

  @Put('models/:id/pricing')
  @ApiOperation({ summary: '设置/更新模型定价', description: '如果无定价则创建，已有则更新' })
  @ApiOkResponse({ type: ModelResponseDto })
  async upsertPricing(@Param('id') id: string, @Body() dto: UpsertPricingDto) {
    return this.adminService.upsertPricing(id, dto);
  }

  // ──────────────────────────────────────────────
  // User 管理
  // ──────────────────────────────────────────────

  @Get('users')
  @ApiOperation({ summary: '获取用户列表', description: '分页查询，支持按角色/状态/关键字筛选' })
  @ApiOkResponse()
  async listUsers(
    @Query() pagination: PaginationDto,
    @Query('role') role?: UserRole,
    @Query('status') status?: UserStatus,
    @Query('search') search?: string,
  ) {
    return this.adminService.listUsers(pagination.page, pagination.pageSize, role, status, search);
  }

  @Get('users/:id')
  @ApiOperation({ summary: '获取用户详情', description: '含余额和统计信息' })
  @ApiOkResponse()
  async getUser(@Param('id') id: string) {
    return this.adminService.getUser(id);
  }

  @Patch('users/:id/role')
  @Roles('super_admin')
  @ApiOperation({ summary: '修改用户角色', description: '仅 super_admin 可执行' })
  @ApiOkResponse()
  async updateUserRole(
    @Param('id') id: string,
    @Body() dto: UpdateUserRoleDto,
    @CurrentUser() operator: CurrentUserInfo,
  ) {
    return this.adminService.updateUserRole(id, dto, operator.role as UserRole, operator.id);
  }

  @Patch('users/:id/status')
  @ApiOperation({ summary: '修改用户状态', description: '禁用/封禁/启用用户' })
  @ApiOkResponse()
  async updateUserStatus(
    @Param('id') id: string,
    @Body() dto: UpdateUserStatusDto,
    @CurrentUser() operator: CurrentUserInfo,
  ) {
    return this.adminService.updateUserStatus(id, dto, operator.id);
  }

  // ──────────────────────────────────────────────
  // 支付配置管理
  // ──────────────────────────────────────────────

  @Get('payment-configs')
  @ApiOperation({ summary: '获取所有支付配置' })
  @ApiOkResponse()
  async listPaymentConfigs() {
    return this.adminService.listPaymentConfigs();
  }

  @Get('payment-configs/:name')
  @ApiOperation({ summary: '获取单个支付配置' })
  @ApiOkResponse()
  async getPaymentConfig(@Param('name') name: string) {
    return this.adminService.getPaymentConfig(name);
  }

  @Put('payment-configs/:name')
  @ApiOperation({ summary: '更新支付配置' })
  @ApiOkResponse()
  async updatePaymentConfig(
    @Param('name') name: string,
    @Body() dto: UpdatePaymentConfigDto,
  ) {
    return this.adminService.updatePaymentConfig(name, dto);
  }

  @Patch('payment-configs/:name/toggle')
  @ApiOperation({ summary: '切换支付配置启用状态' })
  @ApiOkResponse()
  async togglePaymentConfig(@Param('name') name: string) {
    return this.adminService.togglePaymentConfig(name);
  }

  // ──────────────────────────────────────────────
  // SMTP配置管理
  // ──────────────────────────────────────────────

  @Get('smtp-config')
  @ApiOperation({ summary: '获取SMTP配置' })
  @ApiOkResponse()
  async getSmtpConfig() {
    return this.adminService.getSmtpConfig();
  }

  @Put('smtp-config')
  @ApiOperation({ summary: '更新SMTP配置' })
  @ApiOkResponse()
  async updateSmtpConfig(@Body() dto: UpdateSmtpConfigDto) {
    return this.adminService.updateSmtpConfig(dto);
  }

  @Patch('smtp-config/toggle')
  @ApiOperation({ summary: '切换SMTP配置启用状态' })
  @ApiOkResponse()
  async toggleSmtpConfig() {
    return this.adminService.toggleSmtpConfig();
  }

  @Post('smtp-config/test-connection')
  @ApiOperation({ summary: '测试SMTP连接' })
  @ApiOkResponse()
  async testSmtpConnection() {
    return this.adminService.testSmtpConnection();
  }

  @Post('smtp-config/send-test')
  @ApiOperation({ summary: '发送测试邮件' })
  @ApiOkResponse()
  async sendTestEmail(@Body() dto: SendTestEmailDto) {
    return this.adminService.sendTestEmail(dto.email);
  }

  // ──────────────────────────────────────────────
  // RechargePromotion 充值赠送活动
  // ──────────────────────────────────────────────

  @Get('promotions')
  @ApiOperation({ summary: '获取充值赠送活动列表' })
  @ApiOkResponse()
  async listPromotions(
    @Query() pagination: PaginationDto,
    @Query('isActive') isActive?: boolean,
  ) {
    return this.adminService.listPromotions(pagination.page, pagination.pageSize, isActive);
  }

  @Post('promotions')
  @Roles('admin')
  @ApiOperation({ summary: '创建充值赠送活动' })
  @ApiCreatedResponse()
  async createPromotion(@Body() dto: CreatePromotionDto) {
    return this.adminService.createPromotion(dto);
  }

  @Get('promotions/:id')
  @ApiOperation({ summary: '获取充值赠送活动详情' })
  @ApiOkResponse()
  async getPromotion(@Param('id') id: string) {
    return this.adminService.getPromotion(id);
  }

  @Patch('promotions/:id')
  @Roles('admin')
  @ApiOperation({ summary: '更新充值赠送活动' })
  @ApiOkResponse()
  async updatePromotion(@Param('id') id: string, @Body() dto: UpdatePromotionDto) {
    return this.adminService.updatePromotion(id, dto);
  }

  @Patch('promotions/:id/toggle')
  @Roles('admin')
  @ApiOperation({ summary: '切换充值赠送活动状态' })
  @ApiOkResponse()
  async togglePromotion(@Param('id') id: string) {
    return this.adminService.togglePromotion(id);
  }

  @Delete('promotions/:id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除充值赠送活动' })
  @ApiNoContentResponse()
  async deletePromotion(@Param('id') id: string) {
    await this.adminService.deletePromotion(id);
  }

  // ──────────────────────────────────────────────
  // Invoice 发票管理
  // ──────────────────────────────────────────────

  @Get('invoices')
  @ApiOperation({ summary: '获取发票列表' })
  @ApiOkResponse()
  async listInvoices(
    @Query() pagination: PaginationDto,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.adminService.listInvoices(pagination.page, pagination.pageSize, status, search);
  }

  @Post('invoices')
  @Roles('admin')
  @ApiOperation({ summary: '创建发票' })
  @ApiCreatedResponse()
  async createInvoice(
    @Body() dto: CreateInvoiceDto,
    @CurrentUser() operator: CurrentUserInfo,
  ) {
    return this.adminService.createInvoice(operator.id, dto);
  }

  @Get('invoices/:id')
  @ApiOperation({ summary: '获取发票详情' })
  @ApiOkResponse()
  async getInvoice(@Param('id') id: string) {
    return this.adminService.getInvoice(id);
  }

  @Patch('invoices/:id/review')
  @Roles('admin')
  @ApiOperation({ summary: '审核发票' })
  @ApiOkResponse()
  async reviewInvoice(
    @Param('id') id: string,
    @Body() dto: ReviewInvoiceDto,
    @CurrentUser() operator: CurrentUserInfo,
  ) {
    return this.adminService.reviewInvoice(id, dto, operator.id);
  }

  @Patch('invoices/:id/issue')
  @Roles('admin')
  @ApiOperation({ summary: '开具发票' })
  @ApiOkResponse()
  async issueInvoice(@Param('id') id: string, @Body() dto: IssueInvoiceDto) {
    return this.adminService.issueInvoice(id, dto);
  }

  @Delete('invoices/:id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除发票' })
  @ApiNoContentResponse()
  async deleteInvoice(@Param('id') id: string) {
    await this.adminService.deleteInvoice(id);
  }
}
