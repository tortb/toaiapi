import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
} from '@nestjs/swagger';
import { BalanceService } from './balance.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser, CurrentUserInfo } from '../../common/decorators/current-user.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { IsInt, Min, IsString, IsNotEmpty, IsOptional, Max, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionType } from '@prisma/client';

/**
 * 交易流水查询 DTO
 */
class TransactionQueryDto extends PaginationDto {
  @ApiPropertyOptional({ description: '交易类型', enum: TransactionType })
  @IsOptional()
  @IsEnum(TransactionType)
  readonly type?: TransactionType;

  @ApiPropertyOptional({ description: '开始日期（ISO 格式）', example: '2026-06-01' })
  @IsOptional()
  @IsDateString()
  readonly startDate?: string;

  @ApiPropertyOptional({ description: '结束日期（ISO 格式）', example: '2026-06-05' })
  @IsOptional()
  @IsDateString()
  readonly endDate?: string;
}

/**
 * 充值请求 DTO
 */
class RechargeDto {
  @ApiProperty({ description: '目标用户 ID', example: 'uuid-string' })
  @IsString()
  @IsNotEmpty()
  readonly targetUserId!: string;

  @ApiProperty({ description: '充值金额（分）', example: 10000 })
  @IsInt()
  @Min(1)
  @Max(100000000) // 单次最多 100 万元
  readonly amount!: number;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  readonly remark?: string;
}

/**
 * 余额控制器
 *
 * 提供余额查询、充值、交易流水查询等接口。
 */
@ApiTags('Balance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('balance')
export class BalanceController {
  constructor(private readonly balanceService: BalanceService) {}

  /**
   * 查询当前用户余额
   */
  @Get()
  @ApiOperation({ summary: '查询余额' })
  @ApiOkResponse({
    schema: {
      properties: {
        amount: { type: 'number', description: '总余额（分）' },
        frozen: { type: 'number', description: '冻结金额（分）' },
        available: { type: 'number', description: '可用余额（分）' },
      },
    },
  })
  async getBalance(@CurrentUser() user: CurrentUserInfo) {
    return this.balanceService.getBalance(user.id);
  }

  /**
   * 充值余额（管理员）
   */
  @Post('recharge')
  @Roles('admin')
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: '充值余额',
    description: '管理员为用户充值余额',
  })
  async recharge(
    @CurrentUser() user: CurrentUserInfo,
    @Body() dto: RechargeDto,
  ) {
    return this.balanceService.recharge(dto.targetUserId, dto.amount, dto.remark);
  }

  /**
   * 获取交易流水
   */
  @Get('transactions')
  @ApiOperation({ summary: '获取交易流水' })
  async getTransactions(
    @CurrentUser() user: CurrentUserInfo,
    @Query() query: TransactionQueryDto,
  ) {
    return this.balanceService.getTransactions(
      user.id,
      query.page,
      query.pageSize,
      {
        type: query.type,
        startDate: query.startDate ? new Date(query.startDate) : undefined,
        endDate: query.endDate ? new Date(query.endDate) : undefined,
      },
    );
  }

  /**
   * 获取请求日志
   */
  @Get('logs')
  @ApiOperation({ summary: '获取请求日志' })
  async getRequestLogs(
    @CurrentUser() user: CurrentUserInfo,
    @Query() pagination: PaginationDto,
  ) {
    return this.balanceService.getRequestLogs(
      user.id,
      pagination.page,
      pagination.pageSize,
    );
  }
}
