import { ProviderAdapter, ProviderConfig } from './provider-adapter.interface';
/**
 * Provider 适配器工厂
 *
 * 根据 provider 名称创建对应的适配器实例。
 * 支持运行时注册新的适配器。
 *
 * 注册规则：
 * - OpenAI, DeepSeek, Qwen, GLM, Moonshot, Grok → OpenAI 适配器
 * - Anthropic → Anthropic 适配器
 * - Google → Gemini 适配器
 */
export declare class ProviderAdapterFactory {
    private static readonly logger;
    /** 已注册的适配器构造函数 */
    private static readonly adapters;
    /** provider 名称到适配器类型的映射 */
    private static readonly providerAdapterMap;
    /**
     * 注册适配器
     */
    static registerAdapter(name: string, adapter: new (provider: string, config: ProviderConfig) => ProviderAdapter): void;
    /**
     * 创建适配器实例
     *
     * @param provider - provider 名称（如 'openai', 'anthropic'）
     * @param config - provider 配置
     * @returns 适配器实例
     * @throws {Error} 未知的 provider
     */
    static create(provider: string, config: ProviderConfig): ProviderAdapter;
    /**
     * 检查是否支持指定 provider
     */
    static has(provider: string): boolean;
    /**
     * 获取所有支持的 provider
     */
    static list(): string[];
}
//# sourceMappingURL=provider-adapter.factory.d.ts.map