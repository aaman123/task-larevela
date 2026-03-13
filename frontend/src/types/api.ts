/**
 * TypeScript types derived from https://api.larevela.com/openapi.json (OAS 3.1.0)
 * Covers the endpoints used in this application.
 */

// ─── Generic wrapper ────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: Record<string, string> | null;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  has_next: boolean;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
  remember_me?: boolean;
  device_label?: string | null;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  account_id: string;
  primary_role: string;
}

export interface AuthAccount {
  id: string;
  name: string;
}

export interface LoginPayload {
  user: AuthUser;
  account: AuthAccount;
  subscription?: { plan_id?: string | null } | null;
}

export type LoginResponse = ApiResponse<LoginPayload>;

export interface LogoutPayload {
  message: string;
}
export type LogoutResponse = ApiResponse<LogoutPayload>;

// ─── Users ───────────────────────────────────────────────────────────────────

export interface UserProfile {
  user_id: string;
  email: string;
  secondary_email?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  job_title?: string | null;
  department?: string | null;
  photo?: string | null;
  language?: string | null;
  timezone?: string | null;
  currency?: string | null;
  role?: string | null;
  account_id?: string | null;
  account_name?: string | null;
  updated_at?: string | null;
}

export type UserProfileResponse = ApiResponse<UserProfile>;

export interface UserProfileUpdateRequest {
  first_name?: string | null;
  last_name?: string | null;
  job_title?: string | null;
  phone?: string | null;
  department?: string | null;
  photo?: string | null;
  language?: string | null;
  timezone?: string | null;
  secondary_email?: string | null;
}

export type UserProfileUpdateResponse = ApiResponse<UserProfile>;

// ─── Websites ────────────────────────────────────────────────────────────────

export type WebsiteStatus =
  | "pending"
  | "verifying"
  | "live"
  | "error"
  | "disabled";

export interface Website {
  id: string;
  account_id: string;
  domain: string;
  status: WebsiteStatus;
  created_at: string;
}

export interface WebsiteDetail extends Website {
  platform: string;
  last_seen_at?: string | null;
  privacy_acknowledged?: string;
  verification: { status?: WebsiteStatus | null };
}

export interface WebsiteCreateRequest {
  account_id: string;
  domain: string;
  platform: string;
}

export interface WebsiteUpdateRequest {
  display_name?: string | null;
  platform?: string | null;
}

export interface WebsiteListResponse extends ApiResponse<WebsiteDetail[]> {
  pagination: PaginationMeta;
}

export type WebsiteCreateResponse = ApiResponse<Website>;
export type WebsiteDetailResponse = ApiResponse<WebsiteDetail>;
export type WebsiteDeleteResponse = ApiResponse<{ deleted: boolean }>;
