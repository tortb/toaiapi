var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
import { IsString, IsArray, IsOptional, IsNumber, IsBoolean, IsEnum, ValidateNested, Min, Max, } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
/**
 * 聊天消息
 */
let ChatMessageDto = (() => {
    let _role_decorators;
    let _role_initializers = [];
    let _role_extraInitializers = [];
    let _content_decorators;
    let _content_initializers = [];
    let _content_extraInitializers = [];
    let _tool_call_id_decorators;
    let _tool_call_id_initializers = [];
    let _tool_call_id_extraInitializers = [];
    return class ChatMessageDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _role_decorators = [ApiProperty({
                    description: '消息角色',
                    enum: ['system', 'user', 'assistant', 'tool'],
                }), IsEnum(['system', 'user', 'assistant', 'tool'])];
            _content_decorators = [ApiProperty({ description: '消息内容' }), IsString()];
            _tool_call_id_decorators = [ApiPropertyOptional({ description: '工具调用 ID（role=tool 时必填）' }), IsOptional(), IsString()];
            __esDecorate(null, null, _role_decorators, { kind: "field", name: "role", static: false, private: false, access: { has: obj => "role" in obj, get: obj => obj.role, set: (obj, value) => { obj.role = value; } }, metadata: _metadata }, _role_initializers, _role_extraInitializers);
            __esDecorate(null, null, _content_decorators, { kind: "field", name: "content", static: false, private: false, access: { has: obj => "content" in obj, get: obj => obj.content, set: (obj, value) => { obj.content = value; } }, metadata: _metadata }, _content_initializers, _content_extraInitializers);
            __esDecorate(null, null, _tool_call_id_decorators, { kind: "field", name: "tool_call_id", static: false, private: false, access: { has: obj => "tool_call_id" in obj, get: obj => obj.tool_call_id, set: (obj, value) => { obj.tool_call_id = value; } }, metadata: _metadata }, _tool_call_id_initializers, _tool_call_id_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        role = __runInitializers(this, _role_initializers, void 0);
        content = (__runInitializers(this, _role_extraInitializers), __runInitializers(this, _content_initializers, void 0));
        tool_call_id = (__runInitializers(this, _content_extraInitializers), __runInitializers(this, _tool_call_id_initializers, void 0));
        constructor() {
            __runInitializers(this, _tool_call_id_extraInitializers);
        }
    };
})();
export { ChatMessageDto };
/**
 * 工具定义
 */
let ToolDto = (() => {
    let _type_decorators;
    let _type_initializers = [];
    let _type_extraInitializers = [];
    let _function_decorators;
    let _function_initializers = [];
    let _function_extraInitializers = [];
    return class ToolDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _type_decorators = [ApiProperty({ description: '工具类型', example: 'function' }), IsString()];
            _function_decorators = [ApiProperty({ description: '函数定义' }), ValidateNested(), Type(() => FunctionDto)];
            __esDecorate(null, null, _type_decorators, { kind: "field", name: "type", static: false, private: false, access: { has: obj => "type" in obj, get: obj => obj.type, set: (obj, value) => { obj.type = value; } }, metadata: _metadata }, _type_initializers, _type_extraInitializers);
            __esDecorate(null, null, _function_decorators, { kind: "field", name: "function", static: false, private: false, access: { has: obj => "function" in obj, get: obj => obj.function, set: (obj, value) => { obj.function = value; } }, metadata: _metadata }, _function_initializers, _function_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        type = __runInitializers(this, _type_initializers, void 0);
        function = (__runInitializers(this, _type_extraInitializers), __runInitializers(this, _function_initializers, void 0));
        constructor() {
            __runInitializers(this, _function_extraInitializers);
        }
    };
})();
export { ToolDto };
/**
 * 函数定义
 */
let FunctionDto = (() => {
    let _name_decorators;
    let _name_initializers = [];
    let _name_extraInitializers = [];
    let _description_decorators;
    let _description_initializers = [];
    let _description_extraInitializers = [];
    let _parameters_decorators;
    let _parameters_initializers = [];
    let _parameters_extraInitializers = [];
    return class FunctionDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _name_decorators = [ApiProperty({ description: '函数名称' }), IsString()];
            _description_decorators = [ApiPropertyOptional({ description: '函数描述' }), IsOptional(), IsString()];
            _parameters_decorators = [ApiPropertyOptional({ description: '参数 JSON Schema' }), IsOptional()];
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: obj => "name" in obj, get: obj => obj.name, set: (obj, value) => { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _description_decorators, { kind: "field", name: "description", static: false, private: false, access: { has: obj => "description" in obj, get: obj => obj.description, set: (obj, value) => { obj.description = value; } }, metadata: _metadata }, _description_initializers, _description_extraInitializers);
            __esDecorate(null, null, _parameters_decorators, { kind: "field", name: "parameters", static: false, private: false, access: { has: obj => "parameters" in obj, get: obj => obj.parameters, set: (obj, value) => { obj.parameters = value; } }, metadata: _metadata }, _parameters_initializers, _parameters_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        name = __runInitializers(this, _name_initializers, void 0);
        description = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _description_initializers, void 0));
        parameters = (__runInitializers(this, _description_extraInitializers), __runInitializers(this, _parameters_initializers, void 0));
        constructor() {
            __runInitializers(this, _parameters_extraInitializers);
        }
    };
})();
export { FunctionDto };
/**
 * OpenAI 兼容的 Chat Completion 请求 DTO
 *
 * 支持标准 OpenAI 格式，同时也支持 Anthropic 和 Gemini 的请求。
 */
let ChatCompletionDto = (() => {
    let _model_decorators;
    let _model_initializers = [];
    let _model_extraInitializers = [];
    let _messages_decorators;
    let _messages_initializers = [];
    let _messages_extraInitializers = [];
    let _temperature_decorators;
    let _temperature_initializers = [];
    let _temperature_extraInitializers = [];
    let _max_tokens_decorators;
    let _max_tokens_initializers = [];
    let _max_tokens_extraInitializers = [];
    let _top_p_decorators;
    let _top_p_initializers = [];
    let _top_p_extraInitializers = [];
    let _stream_decorators;
    let _stream_initializers = [];
    let _stream_extraInitializers = [];
    let _tools_decorators;
    let _tools_initializers = [];
    let _tools_extraInitializers = [];
    let _tool_choice_decorators;
    let _tool_choice_initializers = [];
    let _tool_choice_extraInitializers = [];
    let _stop_decorators;
    let _stop_initializers = [];
    let _stop_extraInitializers = [];
    let _frequency_penalty_decorators;
    let _frequency_penalty_initializers = [];
    let _frequency_penalty_extraInitializers = [];
    let _presence_penalty_decorators;
    let _presence_penalty_initializers = [];
    let _presence_penalty_extraInitializers = [];
    let _seed_decorators;
    let _seed_initializers = [];
    let _seed_extraInitializers = [];
    let _user_decorators;
    let _user_initializers = [];
    let _user_extraInitializers = [];
    return class ChatCompletionDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _model_decorators = [ApiProperty({
                    description: '模型名称',
                    example: 'gpt-4o',
                }), IsString()];
            _messages_decorators = [ApiProperty({
                    description: '消息列表',
                    type: [ChatMessageDto],
                }), IsArray(), ValidateNested({ each: true }), Type(() => ChatMessageDto)];
            _temperature_decorators = [ApiPropertyOptional({
                    description: '采样温度',
                    example: 0.7,
                    minimum: 0,
                    maximum: 2,
                }), IsOptional(), IsNumber(), Min(0), Max(2)];
            _max_tokens_decorators = [ApiPropertyOptional({
                    description: '最大生成 token 数',
                    example: 4096,
                }), IsOptional(), IsNumber(), Min(1)];
            _top_p_decorators = [ApiPropertyOptional({
                    description: '核采样参数',
                    example: 1,
                    minimum: 0,
                    maximum: 1,
                }), IsOptional(), IsNumber(), Min(0), Max(1)];
            _stream_decorators = [ApiPropertyOptional({
                    description: '是否流式输出',
                    default: false,
                }), IsOptional(), IsBoolean()];
            _tools_decorators = [ApiPropertyOptional({
                    description: '工具列表',
                    type: [ToolDto],
                }), IsOptional(), IsArray(), ValidateNested({ each: true }), Type(() => ToolDto)];
            _tool_choice_decorators = [ApiPropertyOptional({
                    description: '工具选择策略',
                    example: 'auto',
                }), IsOptional()];
            _stop_decorators = [ApiPropertyOptional({
                    description: '停止序列',
                    example: ['\n\n'],
                }), IsOptional(), IsArray(), IsString({ each: true })];
            _frequency_penalty_decorators = [ApiPropertyOptional({
                    description: '频率惩罚',
                    example: 0,
                    minimum: -2,
                    maximum: 2,
                }), IsOptional(), IsNumber(), Min(-2), Max(2)];
            _presence_penalty_decorators = [ApiPropertyOptional({
                    description: '存在惩罚',
                    example: 0,
                    minimum: -2,
                    maximum: 2,
                }), IsOptional(), IsNumber(), Min(-2), Max(2)];
            _seed_decorators = [ApiPropertyOptional({
                    description: '随机种子',
                }), IsOptional(), IsNumber()];
            _user_decorators = [ApiPropertyOptional({
                    description: '用户标识',
                }), IsOptional(), IsString()];
            __esDecorate(null, null, _model_decorators, { kind: "field", name: "model", static: false, private: false, access: { has: obj => "model" in obj, get: obj => obj.model, set: (obj, value) => { obj.model = value; } }, metadata: _metadata }, _model_initializers, _model_extraInitializers);
            __esDecorate(null, null, _messages_decorators, { kind: "field", name: "messages", static: false, private: false, access: { has: obj => "messages" in obj, get: obj => obj.messages, set: (obj, value) => { obj.messages = value; } }, metadata: _metadata }, _messages_initializers, _messages_extraInitializers);
            __esDecorate(null, null, _temperature_decorators, { kind: "field", name: "temperature", static: false, private: false, access: { has: obj => "temperature" in obj, get: obj => obj.temperature, set: (obj, value) => { obj.temperature = value; } }, metadata: _metadata }, _temperature_initializers, _temperature_extraInitializers);
            __esDecorate(null, null, _max_tokens_decorators, { kind: "field", name: "max_tokens", static: false, private: false, access: { has: obj => "max_tokens" in obj, get: obj => obj.max_tokens, set: (obj, value) => { obj.max_tokens = value; } }, metadata: _metadata }, _max_tokens_initializers, _max_tokens_extraInitializers);
            __esDecorate(null, null, _top_p_decorators, { kind: "field", name: "top_p", static: false, private: false, access: { has: obj => "top_p" in obj, get: obj => obj.top_p, set: (obj, value) => { obj.top_p = value; } }, metadata: _metadata }, _top_p_initializers, _top_p_extraInitializers);
            __esDecorate(null, null, _stream_decorators, { kind: "field", name: "stream", static: false, private: false, access: { has: obj => "stream" in obj, get: obj => obj.stream, set: (obj, value) => { obj.stream = value; } }, metadata: _metadata }, _stream_initializers, _stream_extraInitializers);
            __esDecorate(null, null, _tools_decorators, { kind: "field", name: "tools", static: false, private: false, access: { has: obj => "tools" in obj, get: obj => obj.tools, set: (obj, value) => { obj.tools = value; } }, metadata: _metadata }, _tools_initializers, _tools_extraInitializers);
            __esDecorate(null, null, _tool_choice_decorators, { kind: "field", name: "tool_choice", static: false, private: false, access: { has: obj => "tool_choice" in obj, get: obj => obj.tool_choice, set: (obj, value) => { obj.tool_choice = value; } }, metadata: _metadata }, _tool_choice_initializers, _tool_choice_extraInitializers);
            __esDecorate(null, null, _stop_decorators, { kind: "field", name: "stop", static: false, private: false, access: { has: obj => "stop" in obj, get: obj => obj.stop, set: (obj, value) => { obj.stop = value; } }, metadata: _metadata }, _stop_initializers, _stop_extraInitializers);
            __esDecorate(null, null, _frequency_penalty_decorators, { kind: "field", name: "frequency_penalty", static: false, private: false, access: { has: obj => "frequency_penalty" in obj, get: obj => obj.frequency_penalty, set: (obj, value) => { obj.frequency_penalty = value; } }, metadata: _metadata }, _frequency_penalty_initializers, _frequency_penalty_extraInitializers);
            __esDecorate(null, null, _presence_penalty_decorators, { kind: "field", name: "presence_penalty", static: false, private: false, access: { has: obj => "presence_penalty" in obj, get: obj => obj.presence_penalty, set: (obj, value) => { obj.presence_penalty = value; } }, metadata: _metadata }, _presence_penalty_initializers, _presence_penalty_extraInitializers);
            __esDecorate(null, null, _seed_decorators, { kind: "field", name: "seed", static: false, private: false, access: { has: obj => "seed" in obj, get: obj => obj.seed, set: (obj, value) => { obj.seed = value; } }, metadata: _metadata }, _seed_initializers, _seed_extraInitializers);
            __esDecorate(null, null, _user_decorators, { kind: "field", name: "user", static: false, private: false, access: { has: obj => "user" in obj, get: obj => obj.user, set: (obj, value) => { obj.user = value; } }, metadata: _metadata }, _user_initializers, _user_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        model = __runInitializers(this, _model_initializers, void 0);
        messages = (__runInitializers(this, _model_extraInitializers), __runInitializers(this, _messages_initializers, void 0));
        temperature = (__runInitializers(this, _messages_extraInitializers), __runInitializers(this, _temperature_initializers, void 0));
        max_tokens = (__runInitializers(this, _temperature_extraInitializers), __runInitializers(this, _max_tokens_initializers, void 0));
        top_p = (__runInitializers(this, _max_tokens_extraInitializers), __runInitializers(this, _top_p_initializers, void 0));
        stream = (__runInitializers(this, _top_p_extraInitializers), __runInitializers(this, _stream_initializers, void 0));
        tools = (__runInitializers(this, _stream_extraInitializers), __runInitializers(this, _tools_initializers, void 0));
        tool_choice = (__runInitializers(this, _tools_extraInitializers), __runInitializers(this, _tool_choice_initializers, void 0));
        stop = (__runInitializers(this, _tool_choice_extraInitializers), __runInitializers(this, _stop_initializers, void 0));
        frequency_penalty = (__runInitializers(this, _stop_extraInitializers), __runInitializers(this, _frequency_penalty_initializers, void 0));
        presence_penalty = (__runInitializers(this, _frequency_penalty_extraInitializers), __runInitializers(this, _presence_penalty_initializers, void 0));
        seed = (__runInitializers(this, _presence_penalty_extraInitializers), __runInitializers(this, _seed_initializers, void 0));
        user = (__runInitializers(this, _seed_extraInitializers), __runInitializers(this, _user_initializers, void 0));
        constructor() {
            __runInitializers(this, _user_extraInitializers);
        }
    };
})();
export { ChatCompletionDto };
/**
 * Chat Completion 响应 DTO
 */
let ChatCompletionResponseDto = (() => {
    let _id_decorators;
    let _id_initializers = [];
    let _id_extraInitializers = [];
    let _object_decorators;
    let _object_initializers = [];
    let _object_extraInitializers = [];
    let _created_decorators;
    let _created_initializers = [];
    let _created_extraInitializers = [];
    let _model_decorators;
    let _model_initializers = [];
    let _model_extraInitializers = [];
    let _choices_decorators;
    let _choices_initializers = [];
    let _choices_extraInitializers = [];
    let _usage_decorators;
    let _usage_initializers = [];
    let _usage_extraInitializers = [];
    return class ChatCompletionResponseDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _id_decorators = [ApiProperty({ description: '响应 ID' })];
            _object_decorators = [ApiProperty({ description: '对象类型', example: 'chat.completion' })];
            _created_decorators = [ApiProperty({ description: '创建时间戳' })];
            _model_decorators = [ApiProperty({ description: '使用的模型' })];
            _choices_decorators = [ApiProperty({ description: '选择列表' })];
            _usage_decorators = [ApiProperty({ description: 'Token 使用统计' })];
            __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: obj => "id" in obj, get: obj => obj.id, set: (obj, value) => { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
            __esDecorate(null, null, _object_decorators, { kind: "field", name: "object", static: false, private: false, access: { has: obj => "object" in obj, get: obj => obj.object, set: (obj, value) => { obj.object = value; } }, metadata: _metadata }, _object_initializers, _object_extraInitializers);
            __esDecorate(null, null, _created_decorators, { kind: "field", name: "created", static: false, private: false, access: { has: obj => "created" in obj, get: obj => obj.created, set: (obj, value) => { obj.created = value; } }, metadata: _metadata }, _created_initializers, _created_extraInitializers);
            __esDecorate(null, null, _model_decorators, { kind: "field", name: "model", static: false, private: false, access: { has: obj => "model" in obj, get: obj => obj.model, set: (obj, value) => { obj.model = value; } }, metadata: _metadata }, _model_initializers, _model_extraInitializers);
            __esDecorate(null, null, _choices_decorators, { kind: "field", name: "choices", static: false, private: false, access: { has: obj => "choices" in obj, get: obj => obj.choices, set: (obj, value) => { obj.choices = value; } }, metadata: _metadata }, _choices_initializers, _choices_extraInitializers);
            __esDecorate(null, null, _usage_decorators, { kind: "field", name: "usage", static: false, private: false, access: { has: obj => "usage" in obj, get: obj => obj.usage, set: (obj, value) => { obj.usage = value; } }, metadata: _metadata }, _usage_initializers, _usage_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        id = __runInitializers(this, _id_initializers, void 0);
        object = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _object_initializers, void 0));
        created = (__runInitializers(this, _object_extraInitializers), __runInitializers(this, _created_initializers, void 0));
        model = (__runInitializers(this, _created_extraInitializers), __runInitializers(this, _model_initializers, void 0));
        choices = (__runInitializers(this, _model_extraInitializers), __runInitializers(this, _choices_initializers, void 0));
        usage = (__runInitializers(this, _choices_extraInitializers), __runInitializers(this, _usage_initializers, void 0));
        constructor() {
            __runInitializers(this, _usage_extraInitializers);
        }
    };
})();
export { ChatCompletionResponseDto };
/**
 * 模型列表响应 DTO
 */
let ModelListResponseDto = (() => {
    let _object_decorators;
    let _object_initializers = [];
    let _object_extraInitializers = [];
    let _data_decorators;
    let _data_initializers = [];
    let _data_extraInitializers = [];
    return class ModelListResponseDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _object_decorators = [ApiProperty({ description: '对象类型', example: 'list' })];
            _data_decorators = [ApiProperty({ description: '模型列表' })];
            __esDecorate(null, null, _object_decorators, { kind: "field", name: "object", static: false, private: false, access: { has: obj => "object" in obj, get: obj => obj.object, set: (obj, value) => { obj.object = value; } }, metadata: _metadata }, _object_initializers, _object_extraInitializers);
            __esDecorate(null, null, _data_decorators, { kind: "field", name: "data", static: false, private: false, access: { has: obj => "data" in obj, get: obj => obj.data, set: (obj, value) => { obj.data = value; } }, metadata: _metadata }, _data_initializers, _data_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        object = __runInitializers(this, _object_initializers, void 0);
        data = (__runInitializers(this, _object_extraInitializers), __runInitializers(this, _data_initializers, void 0));
        constructor() {
            __runInitializers(this, _data_extraInitializers);
        }
    };
})();
export { ModelListResponseDto };
//# sourceMappingURL=chat-completion.dto.js.map