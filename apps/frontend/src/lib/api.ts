import { buildApiUrl } from "./http";

export type Model = {
  id: string;
  name: string;
  displayName?: string;
  providerId?: string;
  maxContext?: number | null;
  supportsStreaming?: boolean;
  supportsTools?: boolean;
  supportsVision?: boolean;
  pricing?: {
    inputPrice?: number | null;
    outputPrice?: number | null;
    cachedPrice?: number | null;
    reasoningPrice?: number | null;
    multiplier?: number | null;
  } | null;
  vendor?: string;
  input_price?: number | null;
  output_price?: number | null;
  cache_price?: number | null;
  reasoning_price?: number | null;
  description?: string | null;
  tags?: string[];
  type?: string;
  billing_type?: string;
  context_window?: number | null;
};

export type ChannelStatus = {
  name: string;
  healthy: boolean;
  provider?: string;
  channel?: string;
  status?: string;
  avgLatencyMs?: number;
  totalRequests?: number;
  failedRequests?: number;
  failureRate?: number;
  message?: string | null;
  last_checked?: string | null;
};

const API_PREFIX = "/api/v1";

async function fetchJSON<T>(path: string, init?: RequestInit): Promise<T> {
  const url = buildApiUrl(`${API_PREFIX}${path.startsWith("/") ? path : `/${path}`}`);
  const res = await fetch(url, {
    method: init?.method ?? "GET",
    headers: { "Content-Type": "application/json", ...(init?.headers as any) },
    credentials: "omit",
    // @ts-ignore-next-line Next.js fetch extension
    next: { revalidate: 60 },
    ...init,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`fetch ${url} failed: ${res.status} ${text}`);
  }

  const json = await res.json().catch(() => null);

  if (json && typeof json === "object" && "code" in json && "data" in json) {
    if (json.code !== 0) {
      throw new Error(json.message || "API Error");
    }
    return json.data as T;
  }

  return json as T;
}

export async function getPublicModels(): Promise<Model[]> {
  const result = await fetchJSON<{ data: Model[] } | Model[]>("/models/public");
  const items = Array.isArray(result) ? result : result?.data ?? [];
  return items.map(normalizeModel);
}

export interface ModelGroupPricing {
  group: string;
  billingType: string;
  inputPrice: number;
  outputPrice: number;
  cachePrice?: number;
}

export interface ModelApiEndpoint {
  method: string;
  path: string;
  label: string;
}

export interface ModelDetail extends Model {
  groupPricing?: ModelGroupPricing[];
  apiEndpoints?: ModelApiEndpoint[];
}

export async function getModelDetail(name: string): Promise<ModelDetail> {
  const models = await getPublicModels();
  const decoded = decodeURIComponent(name);
  const found = models.find((model) => model.id === decoded || model.name === decoded);
  if (!found) {
    throw new Error("模型不存在或未公开");
  }

  return {
    ...found,
    apiEndpoints: [
      { method: "POST", path: "/api/v1/chat/completions", label: "OpenAI Chat Completions" },
      { method: "GET", path: "/api/v1/models", label: "OpenAI Models" },
    ],
  };
}

export async function getStatus(): Promise<ChannelStatus[]> {
  const result = await fetchJSON<{ data: ChannelStatus[] } | ChannelStatus[]>("/status");
  const items = Array.isArray(result) ? result : result?.data ?? [];
  return items.map(normalizeStatus);
}

function normalizeModel(model: Model): Model {
  const pricing = model.pricing;
  const tags = model.tags ?? [
    model.supportsStreaming ? "流式" : null,
    model.supportsTools ? "工具" : null,
    model.supportsVision ? "视觉" : null,
  ].filter((tag): tag is string => Boolean(tag));

  return {
    ...model,
    name: model.displayName || model.name || model.id,
    vendor: model.vendor || model.providerId || "unknown",
    input_price: model.input_price ?? pricing?.inputPrice ?? null,
    output_price: model.output_price ?? pricing?.outputPrice ?? null,
    cache_price: model.cache_price ?? pricing?.cachedPrice ?? null,
    reasoning_price: model.reasoning_price ?? pricing?.reasoningPrice ?? null,
    context_window: model.context_window ?? model.maxContext ?? null,
    tags,
    type: model.type ?? (model.supportsVision ? "multimodal" : "text"),
    billing_type: model.billing_type ?? "token",
  };
}

function normalizeStatus(status: ChannelStatus): ChannelStatus {
  const rawStatus = status.status?.toUpperCase();
  const healthy = status.healthy ?? rawStatus === "ACTIVE";
  return {
    ...status,
    name: status.name || status.channel || status.provider || "未知渠道",
    healthy,
    message: status.message ?? (healthy ? "运行正常" : rawStatus || "异常"),
  };
}
