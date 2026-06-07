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
import { IsNumber, Min, IsString, IsNotEmpty, IsOptional, Max, IsEnum, IsDateString, IsIn } from 'class-validator';
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
 * 余额统计查询 DTO
 */
class BalanceStatsQueryDto {
  @ApiPropertyOptional({
    description: '统计周期',
    enum: ['24h', '7d', '30d', '90d'],
    default: '7d',
  })
  @IsOptional()
  @IsIn(['24h', '7d', '30d', '90d'])
  readonly period?: '24h' | '7d' | '30d' | '90d';

  @ApiPropertyOptional({
    description: '趋势聚合粒度',
    enum: ['hour', 'day'],
    default: 'day',
  })
  @IsOptional()
  @IsIn(['hour', 'day'])
  readonly granularity?: 'hour' | 'day';
}

/**
 * 充值请求 DTO
 */
class RechargeDto {
  @ApiProperty({ description: '目标用户 ID', example: 'uuid-string' })
  @IsString()
  @IsNotEmpty()
  readonly targetUserId!: string;

  @ApiProperty({ description: '充值金额（元）', example: 100.00 })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: '金额最多2位小数' })
  @Min(0.01, { message: '充值金额最少0.01元' })
  @Max(1000000, { message: '单次最多100万元' })
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

  /**
   * 获取余额和消费统计
   */
  @Get('stats')
  @ApiOperation({ summary: '获取余额和消费统计' })
  @ApiOkResponse()
  async getStats(
    @CurrentUser() user: CurrentUserInfo,
    @Query() query: BalanceStatsQueryDto,
  ) {
    return this.balanceService.getStats(
      user.id,
      query.period ?? '7d',
      query.granularity ?? 'day',
    );
  }

  /**
   * 获取消费明细（账单）
   */
  @Get('bills')
  @ApiOperation({ summary: '获取消费明细' })
  @ApiOkResponse()
  async getBills(
    @CurrentUser() user: CurrentUserInfo,
    @Query() pagination: PaginationDto,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.balanceService.getBills(
      user.id,
      pagination.page,
      pagination.pageSize,
      { startDate, endDate },
    );
  }

  /**
   * 获取按天聚合的消费统计
   */
  @Get('bills/daily')
  @ApiOperation({ summary: '获取按天聚合的消费统计' })
  @ApiOkResponse()
  async getDailyBills(
    @CurrentUser() user: CurrentUserInfo,
    @Query('days') days?: string,
  ) {
    return this.balanceService.getDailyBills(user.id, days ? parseInt(days, 10) : 30);
  }
}
