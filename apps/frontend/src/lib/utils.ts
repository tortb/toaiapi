export type ClassValue = string | number | false | null | undefined | ClassValue[] | { [key: string]: boolean | null | undefined };

export function cn(...inputs: ClassValue[]): string {
  const classes: string[] = [];

  const visit = (input: ClassValue) => {
    if (!input) return;
    if (typeof input === "string" || typeof input === "number") {
      classes.push(String(input));
      return;
    }
    if (Array.isArray(input)) {
      for (const item of input) visit(item);
      return;
    }
    for (const [key, value] of Object.entries(input)) {
      if (value) classes.push(key);
    }
  };

  for (const input of inputs) visit(input);
  return classes.join(" ");
}

export function formatYuan(cents: number | null | undefined): string {
  const value = typeof cents === "number" && Number.isFinite(cents) ? cents / 100 : 0;
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatNumber(value: number | null | undefined): string {
  const number = typeof value === "number" && Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat("zh-CN").format(number);
}

export function formatPercent(value: number | null | undefined, digits = 2): string {
  const number = typeof value === "number" && Number.isFinite(value) ? value : 0;
  return `${(number * 100).toFixed(digits)}%`;
}

export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return "-";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Shanghai",
  }).format(date);
}

export function formatTableDate(value: string | Date | null | undefined): string {
  if (!value) return "-";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Shanghai",
  }).format(date);
}
