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
  @ApiOperation({ summary: '获取用户列表', description: '分页查询，支持按角色/状态筛选' })
  @ApiOkResponse()
  async listUsers(
    @Query() pagination: PaginationDto,
    @Query('role') role?: UserRole,
    @Query('status') status?: UserStatus,
  ) {
    return this.adminService.listUsers(pagination.page, pagination.pageSize, role, status);
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
}
