import type { PaginatedData } from "./api";

export interface BalanceInfo {
  amount: number;
  frozen: number;
  available: number;
}

export interface BalanceStats {
  balance: BalanceInfo;
  monthlySpend: number;
  monthlyRecharge: number;
  monthlyRequests: number;
  monthlyPromptTokens: number;
  monthlyCompletionTokens: number;
  monthlyTotalTokens: number;
}

export interface ActivePromotion {
  id: string;
  name: string;
  description: string | null;
  minAmount: number;
  bonusType: "FIXED" | "PERCENTAGE";
  bonusValue: number;
  maxBonus: number | null;
  startAt: string;
  endAt: string | null;
}

export interface PaymentMethod {
  name: string;
  displayName: string;
}

export interface CreateOrderResult {
  orderNo: string;
  amount: number;
  paymentMethod: string;
  status: string;
  payUrl: string | null;
  createdAt: string;
}

export interface OrderInfo {
  id: string;
  orderNo: string;
  amount: number;
  paidAmount: number | null;
  paymentMethod: string | null;
  status: string;
  productName: string;
  paidAt: string | null;
  createdAt: string;
}

export interface DailyBill {
  date: string;
  cost: number;
  tokens: number;
  requests: number;
}

export interface BillItem {
  id: string;
  createdAt: string;
  endpoint: string;
  promptTokens: number;
  completionTokens: number;
  cachedTokens: number;
  reasoningTokens: number;
  totalTokens: number;
  cost: number;
  statusCode: number;
  latencyMs: number;
  modelId: string;
  channelId: string;
}

export type OrderPage = PaginatedData<OrderInfo>;
export type BillPage = PaginatedData<BillItem>;
