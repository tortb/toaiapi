export interface Channel {
    id: string;
    providerId: string;
    name: string;
    baseUrl: string;
    apiKey: string;
    weight: number;
    priority: number;
    status: string;
    avgLatencyMs: number;
}
export type SelectionStrategy = 'weighted_round_robin' | 'lowest_latency' | 'priority_weighted';
/**
 * Select a channel based on the specified strategy
 */
export declare function selectChannel(channels: Channel[], strategy?: SelectionStrategy): Channel | null;
//# sourceMappingURL=channel-selector.d.ts.map