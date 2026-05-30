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
export declare class ProviderAdapterFactory {
    private static adapters;
    static register(provider: string, adapter: new (config: ProviderConfig) => ProviderAdapter): void;
    static create(provider: string, config: ProviderConfig): ProviderAdapter;
    static has(provider: string): boolean;
    static list(): string[];
}
//# sourceMappingURL=provider-adapter.d.ts.map