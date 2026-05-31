/**
 * Select a channel based on the specified strategy
 */
export function selectChannel(channels, strategy = 'priority_weighted') {
    const activeChannels = channels.filter(c => c.status === 'active');
    if (activeChannels.length === 0) {
        return null;
    }
    switch (strategy) {
        case 'weighted_round_robin':
            return weightedRoundRobin(activeChannels);
        case 'lowest_latency':
            return lowestLatency(activeChannels);
        case 'priority_weighted':
            return priorityWeighted(activeChannels);
        default:
            return priorityWeighted(activeChannels);
    }
}
/**
 * Weighted round-robin selection
 */
function weightedRoundRobin(channels) {
    const totalWeight = channels.reduce((sum, c) => sum + c.weight, 0);
    let random = Math.random() * totalWeight;
    for (const channel of channels) {
        random -= channel.weight;
        if (random <= 0)
            return channel;
    }
    return channels[0];
}
/**
 * Lowest latency selection
 */
function lowestLatency(channels) {
    return channels.reduce((best, current) => current.avgLatencyMs < best.avgLatencyMs ? current : best);
}
/**
 * Priority + weighted selection
 */
function priorityWeighted(channels) {
    // Sort by priority (highest first)
    const sorted = [...channels].sort((a, b) => b.priority - a.priority);
    const maxPriority = sorted[0].priority;
    // Get channels with highest priority
    const topPriority = sorted.filter(c => c.priority === maxPriority);
    // Select by weight within highest priority
    return weightedRoundRobin(topPriority);
}
//# sourceMappingURL=channel-selector.js.map