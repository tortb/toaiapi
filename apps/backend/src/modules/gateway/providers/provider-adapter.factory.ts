import { Logger } from '@nestjs/common';
import { ProviderAdapter, ProviderConfig } from './provider-adapter.interface';
import { OpenAIAdapter } from './openai.adapter';
import { AnthropicAdapter } from './anthropic.adapter';
import { GeminiAdapter } from './gemini.adapter';

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
export class ProviderAdapterFactory {
  private static readonly logger = new Logger('ProviderAdapterFactory');

  /** 已注册的适配器构造函数 */
  private static readonly adapters = new Map<
    string,
    new (provider: string, config: ProviderConfig) => ProviderAdapter
  >();

  /** provider 名称到适配器类型的映射 */
  private static readonly providerAdapterMap = new Map<string, string>([
    ['openai', 'openai'],
    ['deepseek', 'openai'],
    ['qwen', 'openai'],
    ['glm', 'openai'],
    ['moonshot', 'openai'],
    ['grok', 'openai'],
    ['anthropic', 'anthropic'],
    ['google', 'gemini'],
  ]);

  static {
    // 注册内置适配器
    ProviderAdapterFactory.registerAdapter('openai', OpenAIAdapter);
    ProviderAdapterFactory.registerAdapter('anthropic', AnthropicAdapter);
    ProviderAdapterFactory.registerAdapter('gemini', GeminiAdapter);
  }

  /**
   * 注册适配器
   */
  static registerAdapter(
    name: string,
    adapter: new (provider: string, config: ProviderConfig) => ProviderAdapter,
  ): void {
    this.adapters.set(name, adapter);
    this.logger.log(`Registered adapter: ${name}`);
  }

  /**
   * 创建适配器实例
   *
   * @param provider - provider 名称（如 'openai', 'anthropic'）
   * @param config - provider 配置
   * @returns 适配器实例
   * @throws {Error} 未知的 provider
   */
  static create(provider: string, config: ProviderConfig): ProviderAdapter {
    const adapterName = this.providerAdapterMap.get(provider.toLowerCase());

    if (!adapterName) {
      throw new Error(`Unknown provider: ${provider}`);
    }

    const AdapterClass = this.adapters.get(adapterName);
    if (!AdapterClass) {
      throw new Error(`Adapter not registered: ${adapterName}`);
    }

    return new AdapterClass(provider, config);
  }

  /**
   * 检查是否支持指定 provider
   */
  static has(provider: string): boolean {
    return this.providerAdapterMap.has(provider.toLowerCase());
  }

  /**
   * 获取所有支持的 provider
   */
  static list(): string[] {
    return Array.from(this.providerAdapterMap.keys());
  }
}
