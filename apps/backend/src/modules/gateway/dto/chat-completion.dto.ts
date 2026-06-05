import {
  IsString,
  IsArray,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsEnum,
  ValidateNested,
  Min,
  Max,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 聊天消息
 */
export class ChatMessageDto {
  @ApiProperty({
    description: '消息角色',
    enum: ['system', 'user', 'assistant', 'tool'],
  })
  @IsEnum(['system', 'user', 'assistant', 'tool'])
  readonly role!: 'system' | 'user' | 'assistant' | 'tool';

  @ApiProperty({ description: '消息内容', required: false, nullable: true })
  @IsOptional()
  @IsString()
  readonly content?: string | null;

  @ApiPropertyOptional({ description: '工具调用 ID（role=tool 时必填）' })
  @IsOptional()
  @IsString()
  readonly tool_call_id?: string;
}

/**
 * 函数定义
 */
export class FunctionDto {
  @ApiProperty({ description: '函数名称' })
  @IsString()
  readonly name!: string;

  @ApiPropertyOptional({ description: '函数描述' })
  @IsOptional()
  @IsString()
  readonly description?: string;

  @ApiPropertyOptional({ description: '参数 JSON Schema' })
  @IsOptional()
  readonly parameters?: Record<string, unknown>;
}

/**
 * 工具定义
 */
export class ToolDto {
  @ApiProperty({ description: '工具类型', example: 'function' })
  @IsString()
  readonly type!: string;

  @ApiProperty({ description: '函数定义' })
  @ValidateNested()
  @Type(() => FunctionDto)
  readonly function!: FunctionDto;
}

/**
 * OpenAI 兼容的 Chat Completion 请求 DTO
 *
 * 支持标准 OpenAI 格式，同时也支持 Anthropic 和 Gemini 的请求。
 */
export class ChatCompletionDto {
  @ApiProperty({
    description: '模型名称',
    example: 'gpt-4o',
  })
  @IsString()
  readonly model!: string;

  @ApiProperty({
    description: '消息列表',
    type: [ChatMessageDto],
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'messages 不能为空' })
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  readonly messages!: ChatMessageDto[];

  @ApiPropertyOptional({
    description: '采样温度',
    example: 0.7,
    minimum: 0,
    maximum: 2,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(2)
  readonly temperature?: number;

  @ApiPropertyOptional({
    description: '最大生成 token 数',
    example: 4096,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  readonly max_tokens?: number;

  @ApiPropertyOptional({
    description: '核采样参数',
    example: 1,
    minimum: 0,
    maximum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  readonly top_p?: number;

  @ApiPropertyOptional({
    description: '是否流式输出',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  readonly stream?: boolean;

  @ApiPropertyOptional({
    description: '工具列表',
    type: [ToolDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ToolDto)
  readonly tools?: ToolDto[];

  @ApiPropertyOptional({
    description: '工具选择策略',
    example: 'auto',
  })
  @IsOptional()
  readonly tool_choice?: 'auto' | 'none' | { type: string; function: { name: string } };

  @ApiPropertyOptional({
    description: '停止序列',
    example: ['\n\n'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  readonly stop?: string[];

  @ApiPropertyOptional({
    description: '频率惩罚',
    example: 0,
    minimum: -2,
    maximum: 2,
  })
  @IsOptional()
  @IsNumber()
  @Min(-2)
  @Max(2)
  readonly frequency_penalty?: number;

  @ApiPropertyOptional({
    description: '存在惩罚',
    example: 0,
    minimum: -2,
    maximum: 2,
  })
  @IsOptional()
  @IsNumber()
  @Min(-2)
  @Max(2)
  readonly presence_penalty?: number;

  @ApiPropertyOptional({
    description: '随机种子',
  })
  @IsOptional()
  @IsNumber()
  readonly seed?: number;

  @ApiPropertyOptional({
    description: '用户标识',
  })
  @IsOptional()
  @IsString()
  readonly user?: string;
}

/**
 * Chat Completion 响应 DTO
 */
export class ChatCompletionResponseDto {
  @ApiProperty({ description: '响应 ID' })
  readonly id!: string;

  @ApiProperty({ description: '对象类型', example: 'chat.completion' })
  readonly object!: string;

  @ApiProperty({ description: '创建时间戳' })
  readonly created!: number;

  @ApiProperty({ description: '使用的模型' })
  readonly model!: string;

  @ApiProperty({ description: '选择列表' })
  readonly choices!: Array<{
    readonly index: number;
    readonly message: {
      readonly role: string;
      readonly content: string;
      readonly tool_calls?: unknown[];
    };
    readonly finish_reason: string;
  }>;

  @ApiProperty({ description: 'Token 使用统计' })
  readonly usage!: {
    readonly prompt_tokens: number;
    readonly completion_tokens: number;
    readonly total_tokens: number;
  };
}

/**
 * 模型列表响应 DTO
 */
export class ModelListResponseDto {
  @ApiProperty({ description: '对象类型', example: 'list' })
  readonly object!: string;

  @ApiProperty({ description: '模型列表' })
  readonly data!: Array<{
    readonly id: string;
    readonly object: string;
    readonly created: number;
    readonly owned_by: string;
  }>;
}
