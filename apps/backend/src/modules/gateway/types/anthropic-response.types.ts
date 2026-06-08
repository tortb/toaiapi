/**
 * Anthropic Messages API 响应类型定义
 */

/**
 * Token 使用统计
 */
export interface AnthropicUsage {
  input_tokens: number;
  output_tokens: number;
  cache_creation_input_tokens?: number;
  cache_read_input_tokens?: number;
}

/**
 * 响应内容项
 */
export interface AnthropicResponseContent {
  type: 'text';
  text: string;
}

/**
 * 消息响应
 */
export interface AnthropicMessageResponse {
  id: string;
  type: 'message';
  role: 'assistant';
  content: AnthropicResponseContent[];
  model: string;
  stop_reason: 'end_turn' | 'max_tokens' | 'stop_sequence' | null;
  stop_sequence: string | null;
  usage: AnthropicUsage;
}

/**
 * 流式事件类型
 */
export type AnthropicStreamEventType =
  | 'message_start'
  | 'content_block_start'
  | 'content_block_delta'
  | 'content_block_stop'
  | 'message_delta'
  | 'message_stop'
  | 'ping'
  | 'error';

/**
 * 流式事件基础结构
 */
export interface AnthropicStreamEvent {
  type: AnthropicStreamEventType;
}

/**
 * message_start 事件
 */
export interface AnthropicMessageStartEvent extends AnthropicStreamEvent {
  type: 'message_start';
  message: AnthropicMessageResponse;
}

/**
 * content_block_start 事件
 */
export interface AnthropicContentBlockStartEvent extends AnthropicStreamEvent {
  type: 'content_block_start';
  index: number;
  content_block: {
    type: 'text';
    text: string;
  };
}

/**
 * content_block_delta 事件
 */
export interface AnthropicContentBlockDeltaEvent extends AnthropicStreamEvent {
  type: 'content_block_delta';
  index: number;
  delta: {
    type: 'text_delta';
    text: string;
  };
}

/**
 * content_block_stop 事件
 */
export interface AnthropicContentBlockStopEvent extends AnthropicStreamEvent {
  type: 'content_block_stop';
  index: number;
}

/**
 * message_delta 事件
 */
export interface AnthropicMessageDeltaEvent extends AnthropicStreamEvent {
  type: 'message_delta';
  delta: {
    stop_reason: 'end_turn' | 'max_tokens' | 'stop_sequence' | null;
    stop_sequence: string | null;
  };
  usage: {
    output_tokens: number;
  };
}

/**
 * message_stop 事件
 */
export interface AnthropicMessageStopEvent extends AnthropicStreamEvent {
  type: 'message_stop';
}

/**
 * ping 事件
 */
export interface AnthropicPingEvent extends AnthropicStreamEvent {
  type: 'ping';
}

/**
 * error 事件
 */
export interface AnthropicErrorEvent extends AnthropicStreamEvent {
  type: 'error';
  error: {
    type: string;
    message: string;
  };
}

/**
 * 所有流式事件联合类型
 */
export type AnthropicStreamEventUnion =
  | AnthropicMessageStartEvent
  | AnthropicContentBlockStartEvent
  | AnthropicContentBlockDeltaEvent
  | AnthropicContentBlockStopEvent
  | AnthropicMessageDeltaEvent
  | AnthropicMessageStopEvent
  | AnthropicPingEvent
  | AnthropicErrorEvent;

/**
 * Anthropic 错误响应
 */
export interface AnthropicErrorResponse {
  type: 'error';
  error: {
    type: string;
    message: string;
  };
}
