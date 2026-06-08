const SECRET_KEY_PATTERN = /(password|passwd|pwd|token|secret|api[_-]?key|authorization|cookie|set-cookie|merchant[_-]?key|merchant[_-]?secret|private[_-]?key|access[_-]?key[_-]?secret)/i;

const SENSITIVE_VALUE_PATTERNS: Array<[RegExp, string]> = [
  [/sk-[A-Za-z0-9_-]{8,}/g, 'sk-****'],
  [/sk-toai-[A-Za-z0-9_-]{8,}/g, 'sk-toai-****'],
  [/[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/g, '[jwt]'],
  [/(Bearer\s+)[A-Za-z0-9._~+\/-]+=*/gi, '$1[redacted]'],
];

export function redactSensitive(value: unknown): unknown {
  if (value === null || value === undefined) return value;

  if (typeof value === 'string') {
    return SENSITIVE_VALUE_PATTERNS.reduce((current, [pattern, replacement]) => current.replace(pattern, replacement), value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => redactSensitive(item));
  }

  if (typeof value === 'object') {
    const output: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      output[key] = SECRET_KEY_PATTERN.test(key) ? '[redacted]' : redactSensitive(item);
    }
    return output;
  }

  return value;
}

export function redactToString(value: unknown): string {
  const redacted = redactSensitive(value);
  if (typeof redacted === 'string') return redacted;
  try {
    return JSON.stringify(redacted);
  } catch {
    return String(redacted);
  }
}
