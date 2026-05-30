/**
 * Convert yuan to cents
 */
export function yuanToFen(yuan: number): number {
  return Math.round(yuan * 100);
}

/**
 * Convert cents to yuan string
 */
export function fenToYuan(fen: number): string {
  return (fen / 100).toFixed(2);
}

/**
 * Mask email for logging
 */
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!local || !domain) return '***';
  const maskedLocal = local[0] + '***' + local[local.length - 1];
  return `${maskedLocal}@${domain}`;
}

/**
 * Mask phone number for logging
 */
export function maskPhone(phone: string): string {
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
}

/**
 * Mask API key for logging
 */
export function maskApiKey(key: string): string {
  return key.substring(0, 16) + '...';
}

/**
 * Generate order number
 */
export function generateOrderNo(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `TOAI${timestamp}${random}`;
}

/**
 * Calculate token cost (in cents)
 */
export function calculateTokenCost(
  tokenCount: number,
  pricePerMillionTokens: number,
): number {
  return Math.ceil((tokenCount / 1_000_000) * pricePerMillionTokens);
}

/**
 * Check if value is defined
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
