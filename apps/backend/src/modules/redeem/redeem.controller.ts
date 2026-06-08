import {
  Controller,
  Post,
  Get,
  Delete,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiSecurity, ApiOkResponse } from '@nestjs/swagger';
import { RedeemService } from './redeem.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, CurrentUserInfo } from '../../common/decorators/current-user.decorator';
import { RedeemCodeDto, GenerateCodesDto, UpdateCodeDto } from './dto/redeem.dto';

/**
 * 兑换码控制器
 */
@ApiTags('Redeem')
@Controller('redeem')
export class RedeemController {
  constructor(private readonly redeemService: RedeemService) {}

  /**
   * 用户兑换
   *
   * POST /redeem
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiSecurity('jwt')
  @ApiOperation({
    summary: '兑换码充值',
    description: '使用兑换码为账户充值',
  })
  @ApiOkResponse({
    description: '兑换成功',
    schema: {
      example: {
        code: 'ABCD1234',
        reward: 10000,
        rewardYuan: 100.0,
      },
    },
  })
  async redeemCode(
    @CurrentUser() user: CurrentUserInfo,
    @Body() dto: RedeemCodeDto,
  ) {
    return this.redeemService.redeemCode(user.id, dto.code);
  }

  /**
   * 生成兑换码（管理员）
   *
   * POST /redeem/codes
   */
  @Post('codes')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiSecurity('jwt')
  @ApiOperation({
    summary: '生成兑换码',
    description: '管理员批量生成兑换码（仅管理员可用）',
  })
  @ApiOkResponse({
    description: '生成成功',
    schema: {
      example: ['ABCD1234', 'EFGH5678'],
    },
  })
  async generateCodes(
    @CurrentUser() user: CurrentUserInfo,
    @Body() dto: GenerateCodesDto,
  ) {
    return this.redeemService.generateCodes(
      user.id,
      dto.type,
      dto.value,
      dto.count,
      dto.max_uses,
      dto.expires_at ? new Date(dto.expires_at) : null,
    );
  }

  /**
   * 获取兑换码列表（管理员）
   *
   * GET /redeem/codes
   */
  @Get('codes')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiSecurity('jwt')
  @ApiOperation({
    summary: '获取兑换码列表',
    description: '管理员查询所有兑换码（仅管理员可用）',
  })
  @ApiOkResponse({
    description: '兑换码列表',
  })
  async listCodes(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 20,
  ) {
    return this.redeemService.listCodes(page, pageSize);
  }

  /**
   * 删除兑换码（管理员）
   *
   * DELETE /redeem/codes/:id
   */
  @Delete('codes/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiSecurity('jwt')
  @ApiOperation({
    summary: '删除兑换码',
    description: '管理员删除指定兑换码（仅管理员可用）',
  })
  async deleteCode(@Param('id') codeId: string) {
    await this.redeemService.deleteCode(codeId);
  }

  /**
   * 更新兑换码（管理员）
   *
   * PUT /redeem/codes/:id
   */
  @Put('codes/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiSecurity('jwt')
  @ApiOperation({
    summary: '更新兑换码',
    description: '管理员更新兑换码信息（仅管理员可用）',
  })
  async updateCode(
    @Param('id') codeId: string,
    @Body() dto: UpdateCodeDto,
  ) {
    return this.redeemService.updateCode(codeId, {
      is_active: dto.is_active,
      expires_at: dto.expires_at ? new Date(dto.expires_at) : undefined,
      max_uses: dto.max_uses,
    });
  }
}
