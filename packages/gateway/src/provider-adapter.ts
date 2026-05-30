import type { ChatRequest, ChatResponse, ChatChunk, ProviderConfig } from './types';

/**
 * Provider adapter interface
 * All AI providers must implement this interface
 */
export interface ProviderAdapter {
  readonly name: string;
  readonly provider: string;

  chat(request: ChatRequest): Promise<ChatResponse>;
  chatStream(request: ChatRequest): AsyncGenerator<ChatChunk>;
}

/**
 * Provider adapter factory
 */
export class ProviderAdapterFactory {
  private static adapters = new Map<string, new (config: ProviderConfig) => ProviderAdapter>();

  static register(provider: string, adapter: new (config: ProviderConfig) => ProviderAdapter) {
    this.adapters.set(provider, adapter);
  }

  static create(provider: string, config: ProviderConfig): ProviderAdapter {
    const Adapter = this.adapters.get(provider);
    if (!Adapter) {
      throw new Error(`Unknown provider: ${provider}`);
    }
    return new Adapter(config);
  }

  static has(provider: string): boolean {
    return this.adapters.has(provider);
  }

  static list(): string[] {
    return Array.from(this.adapters.keys());
  }
}
