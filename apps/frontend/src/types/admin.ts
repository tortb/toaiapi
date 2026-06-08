import type { UserRole } from "./auth";

export interface AdminUser {
  id: string;
  email: string;
  displayName: string | null;
  role: UserRole;
  status: string;
  balance?: number;
  totalRequests?: number;
  createdAt: string;
  lastLoginAt?: string | null;
}

export interface UserGroup {
  id: string;
  name: string;
  description?: string | null;
  createdAt: string;
}

export interface RolePermission {
  id: string;
  name: string;
  description?: string | null;
  permissions: string[];
}

export interface AdminProvider {
  id: string;
  name: string;
  displayName: string;
  baseUrl?: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface AdminChannel {
  id: string;
  name: string;
  providerId: string;
  status: string;
  priority: number;
  weight: number;
  modelCount?: number;
  createdAt: string;
}

export interface AdminModel {
  id: string;
  name: string;
  displayName?: string | null;
  provider?: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface AdminPricing {
  id: string;
  modelId: string;
  inputPrice: number;
  outputPrice: number;
  cachedPrice?: number | null;
  reasoningPrice?: number | null;
  multiplier?: number | null;
}

export interface AdminOrder {
  id: string;
  orderNo: string;
  userId: string;
  userEmail?: string;
  amount: number;
  status: string;
  paymentMethod?: string | null;
  createdAt: string;
  paidAt?: string | null;
}

export interface SystemSetting {
  key: string;
  value: string | null;
  description?: string | null;
  encrypted?: boolean;
  updatedAt?: string;
}

export interface PaymentConfig {
  id: string;
  name: string;
  displayName: string;
  isEnabled: boolean;
  config?: Record<string, unknown>;
  updatedAt?: string;
}

export interface CaptchaConfig {
  identity: string;
  region: string;
  mode: string;
  scenes: Record<string, string>;
}

export interface SmsConfig {
  enabled: boolean;
  provider: string;
  signName?: string;
  templateCode?: string;
}
