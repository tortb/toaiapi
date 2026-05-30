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
import { Catch, HttpException, HttpStatus, Logger, } from '@nestjs/common';
/**
 * 全局 HTTP 异常过滤器
 *
 * 统一异常响应格式：
 * {
 *   code: number,
 *   message: string,
 *   data: null,
 *   timestamp: string,
 *   path: string
 * }
 */
let HttpExceptionFilter = (() => {
    let _classDecorators = [Catch()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var HttpExceptionFilter = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            HttpExceptionFilter = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        logger = new Logger(HttpExceptionFilter.name);
        catch(exception, host) {
            const ctx = host.switchToHttp();
            const response = ctx.getResponse();
            const request = ctx.getRequest();
            let status = HttpStatus.INTERNAL_SERVER_ERROR;
            let message = 'Internal server error';
            if (exception instanceof HttpException) {
                status = exception.getStatus();
                const exceptionResponse = exception.getResponse();
                if (typeof exceptionResponse === 'string') {
                    message = exceptionResponse;
                }
                else if (typeof exceptionResponse === 'object' &&
                    exceptionResponse !== null) {
                    const resp = exceptionResponse;
                    const msg = resp['message'];
                    if (typeof msg === 'string') {
                        message = msg;
                    }
                    else if (Array.isArray(msg) && msg.length > 0 && typeof msg[0] === 'string') {
                        message = msg[0];
                    }
                }
            }
            else if (exception instanceof Error) {
                message = exception.message;
                this.logger.error(`Unhandled error: ${exception.message}`, exception.stack);
            }
            // 生产环境不暴露内部错误详情
            if (status === HttpStatus.INTERNAL_SERVER_ERROR && process.env['NODE_ENV'] === 'production') {
                message = 'Internal server error';
            }
            response.status(status).send({
                code: status,
                message,
                data: null,
                timestamp: new Date().toISOString(),
                path: request.url,
            });
        }
    };
    return HttpExceptionFilter = _classThis;
})();
export { HttpExceptionFilter };
//# sourceMappingURL=http-exception.filter.js.map