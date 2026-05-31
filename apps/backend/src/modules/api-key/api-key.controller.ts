import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
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
import { ApiKeyService } from './api-key.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { ApiKeyResponseDto } from './dto/api-key-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserInfo } from '../../common/decorators/current-user.decorator';

/**
 * API Key 控制器
 *
 * 处理 API Key 的 CRUD 操作。
 * 所有接口都需要 JWT 认证。
 */
@ApiTags('API Keys')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api-keys')
export class ApiKeyController {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  /**
   * 创建 API Key
   */
  @Post()
  @ApiOperation({
    summary: '创建 API Key',
    description: '创建新的 API Key，完整 key 只在此次返回',
  })
  @ApiCreatedResponse({ type: ApiKeyResponseDto })
  async createApiKey(
    @CurrentUser() user: CurrentUserInfo,
    @Body() dto: CreateApiKeyDto,
  ): Promise<ApiKeyResponseDto> {
    return this.apiKeyService.createApiKey(user.id, dto);
  }

  /**
   * 获取 API Key 列表
   */
  @Get()
  @ApiOperation({ summary: '获取 API Key 列表' })
  @ApiOkResponse({ type: [ApiKeyResponseDto] })
  async listApiKeys(
    @CurrentUser() user: CurrentUserInfo,
  ): Promise<ApiKeyResponseDto[]> {
    return this.apiKeyService.listApiKeys(user.id);
  }

  /**
   * 更新 API Key
   */
  @Patch(':id')
  @ApiOperation({ summary: '更新 API Key 配置' })
  @ApiOkResponse({ type: ApiKeyResponseDto })
  async updateApiKey(
    @CurrentUser() user: CurrentUserInfo,
    @Param('id') keyId: string,
    @Body() dto: Partial<CreateApiKeyDto>,
  ): Promise<ApiKeyResponseDto> {
    return this.apiKeyService.updateApiKey(user.id, keyId, dto);
  }

  /**
   * 禁用 API Key
   */
  @Patch(':id/disable')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '禁用 API Key' })
  @ApiOkResponse({ type: ApiKeyResponseDto })
  async disableApiKey(
    @CurrentUser() user: CurrentUserInfo,
    @Param('id') keyId: string,
  ): Promise<ApiKeyResponseDto> {
    return this.apiKeyService.toggleApiKey(user.id, keyId, false);
  }

  /**
   * 启用 API Key
   */
  @Patch(':id/enable')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '启用 API Key' })
  @ApiOkResponse({ type: ApiKeyResponseDto })
  async enableApiKey(
    @CurrentUser() user: CurrentUserInfo,
    @Param('id') keyId: string,
  ): Promise<ApiKeyResponseDto> {
    return this.apiKeyService.toggleApiKey(user.id, keyId, true);
  }

  /**
   * 删除 API Key
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除 API Key' })
  @ApiNoContentResponse()
  async deleteApiKey(
    @CurrentUser() user: CurrentUserInfo,
    @Param('id') keyId: string,
  ): Promise<void> {
    await this.apiKeyService.deleteApiKey(user.id, keyId);
  }
}
