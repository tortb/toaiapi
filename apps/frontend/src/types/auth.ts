export type UserRole = "user" | "admin" | "super_admin" | "operator" | "finance" | "auditor" | string;

export interface UserInfo {
  id: string;
  email: string;
  displayName: string | null;
  role: UserRole;
}

export interface UserProfile extends UserInfo {
  avatarUrl: string | null;
  createdAt: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken?: string;
  refreshExpiresIn?: number;
  tokenType: string;
  expiresIn: number;
}

export interface AuthResponse {
  user: UserInfo;
  tokens: TokenResponse;
}

export interface LoginPayload {
  email: string;
  password: string;
  captchaVerifyParam?: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  displayName?: string;
  inviteCode?: string;
  captchaToken?: string;
  captchaVerifyParam?: string;
  emailCode?: string;
}
