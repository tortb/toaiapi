import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiNoContentResponse,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import type { UserEntity } from './entities/user.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserInfo } from '../../common/decorators/current-user.decorator';

/**
 * 用户控制器
 *
 * 处理用户相关的 HTTP 请求。
 * 所有接口都需要 JWT 认证。
 */
@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * 获取当前用户信息
   */
  @Get('me')
  @ApiOperation({ summary: '获取当前用户信息' })
  @ApiOkResponse({ type: UserResponseDto })
  async getCurrentUser(
    @CurrentUser() user: CurrentUserInfo,
  ): Promise<UserResponseDto> {
    const userEntity = await this.userService.findById(user.id);
    return this.toResponseDto(userEntity);
  }

  /**
   * 更新当前用户信息
   */
  @Patch('me')
  @ApiOperation({ summary: '更新当前用户信息' })
  @ApiOkResponse({ type: UserResponseDto })
  async updateCurrentUser(
    @CurrentUser() user: CurrentUserInfo,
    @Body() dto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const userEntity = await this.userService.updateUser(user.id, dto);
    return this.toResponseDto(userEntity);
  }

  /**
   * 删除当前用户（软删除）
   */
  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除当前用户' })
  @ApiNoContentResponse()
  async deleteCurrentUser(@CurrentUser() user: CurrentUserInfo): Promise<void> {
    await this.userService.deleteUser(user.id);
  }

  /**
   * 转换为响应 DTO
   */
  private toResponseDto(
    user: UserEntity,
  ): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      displayName: user.display_name,
      avatarUrl: user.avatar_url,
      role: user.role,
      status: user.status,
      createdAt: user.created_at,
    };
  }
}
