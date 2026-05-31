/**
 * Provider adapter factory
 */
export class ProviderAdapterFactory {
    static adapters = new Map();
    static register(provider, adapter) {
        this.adapters.set(provider, adapter);
    }
    static create(provider, config) {
        const Adapter = this.adapters.get(provider);
        if (!Adapter) {
            throw new Error(`Unknown provider: ${provider}`);
        }
        return new Adapter(config);
    }
    static has(provider) {
        return this.adapters.has(provider);
    }
    static list() {
        return Array.from(this.adapters.keys());
    }
}
//# sourceMappingURL=provider-adapter.js.map