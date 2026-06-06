import { ApiProperty } from '@nestjs/swagger';

/**
 * 指标卡数据
 */
export class MetricCardDto {
  @ApiProperty({ description: '注册用户数' })
  totalUsers!: number;

  @ApiProperty({ description: '注册用户增长率 (%)' })
  totalUsersGrowth!: number;

  @ApiProperty({ description: '总充值金额（分）' })
  totalRecharge!: number;

  @ApiProperty({ description: '充值增长率 (%)' })
  totalRechargeGrowth!: number;

  @ApiProperty({ description: '总消费金额（分）' })
  totalConsumption!: number;

  @ApiProperty({ description: '消费增长率 (%)' })
  totalConsumptionGrowth!: number;

  @ApiProperty({ description: '总调用次数' })
  totalRequests!: number;

  @ApiProperty({ description: '调用增长率 (%)' })
  totalRequestsGrowth!: number;

  @ApiProperty({ description: '总余额（分）' })
  totalBalance!: number;
}

/**
 * 调用统计数据点
 */
export class CallStatsPointDto {
  @ApiProperty({ description: '时间标签 (MM-DD 或 HH:mm)' })
  label!: string;

  @ApiProperty({ description: '请求数' })
  requests!: number;

  @ApiProperty({ description: 'Token 数' })
  tokens!: number;

  @ApiProperty({ description: '费用（分）' })
  cost!: number;
}

/**
 * 模型分布数据
 */
export class ModelDistributionDto {
  @ApiProperty({ description: '模型名称' })
  name!: string;

  @ApiProperty({ description: '请求数' })
  count!: number;

  @ApiProperty({ description: '占比 (%)' })
  percentage!: number;
}

/**
 * 最近订单
 */
export class RecentOrderDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ description: '订单号' })
  orderNo!: string;

  @ApiProperty({ description: '用户邮箱（脱敏）' })
  userEmail!: string;

  @ApiProperty({ description: '金额（分）' })
  amount!: number;

  @ApiProperty({ description: '支付方式' })
  paymentMethod!: string | null;

  @ApiProperty({ description: '状态' })
  status!: string;

  @ApiProperty({ description: '创建时间' })
  createdAt!: string;
}

/**
 * 渠道状态
 */
export class ChannelStatusDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ description: '渠道名称' })
  name!: string;

  @ApiProperty({ description: '状态' })
  status!: string;

  @ApiProperty({ description: '平均响应时间（毫秒）' })
  avgLatency!: number;

  @ApiProperty({ description: '今日调用次数' })
  todayRequests!: number;
}

/**
 * Dashboard 完整响应
 */
export class DashboardResponseDto {
  @ApiProperty({ type: MetricCardDto })
  metrics!: MetricCardDto;

  @ApiProperty({ type: [CallStatsPointDto] })
  callStats!: CallStatsPointDto[];

  @ApiProperty({ type: [ModelDistributionDto] })
  modelDistribution!: ModelDistributionDto[];

  @ApiProperty({ type: [RecentOrderDto] })
  recentOrders!: RecentOrderDto[];

  @ApiProperty({ type: [ChannelStatusDto] })
  channelStatus!: ChannelStatusDto[];
}
