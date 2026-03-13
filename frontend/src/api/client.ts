/**
 * API client for https://api.larevela.com (OAS 3.1.0)
 *
 * Auth strategy: session cookies (credentials: 'include').
 * Optional Bearer token via VITE_API_TOKEN for token-based flows.
 */

const getBaseUrl = () =>
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(
    /\/$/,
    "",
  ) ?? "https://api.larevela.com";

export type RequestConfig = RequestInit & {
  params?: Record<string, string | number | boolean | undefined>;
};

function buildUrl(path: string, params?: RequestConfig["params"]): string {
  const base = getBaseUrl();
  const url = new URL(path.startsWith("/") ? path : `/${path}`, base);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "")
        url.searchParams.set(key, String(value));
    });
  }
  return url.toString();
}

export type ApiError = Error & { status: number; body?: unknown };

function createApiError(
  status: number,
  message: string,
  body?: unknown,
): ApiError {
  const err = new Error(message) as ApiError;
  err.name = "ApiError";
  err.status = status;
  err.body = body;
  return err;
}

export function isApiError(err: unknown): err is ApiError {
  return err instanceof Error && (err as ApiError).status !== undefined;
}

export async function apiRequest<T>(
  path: string,
  options: RequestConfig = {},
): Promise<T> {
  const { params, ...init } = options;
  const url = buildUrl(path, params);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  };

  // Optional Bearer token (uncomment VITE_API_TOKEN in .env if the API requires it)
  const token = import.meta.env.VITE_API_TOKEN as string | undefined;
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...init,
    headers,
    credentials: "include", // send/receive session cookies
  });

  if (!res.ok) {
    const body = await res.text();
    let message = `HTTP ${res.status}`;
    try {
      const json = JSON.parse(body);
      message = json.error?.detail ?? json.message ?? json.error ?? message;
    } catch {
      message = res.statusText || body || message;
    }
    throw createApiError(res.status, message, body);
  }

  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) return res.json() as Promise<T>;
  return res.text() as unknown as Promise<T>;
}

export const api = {
  get: <T>(path: string, config?: RequestConfig) =>
    apiRequest<T>(path, { ...config, method: "GET" }),

  post: <T>(path: string, body?: unknown, config?: RequestConfig) =>
    apiRequest<T>(path, {
      ...config,
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  put: <T>(path: string, body?: unknown, config?: RequestConfig) =>
    apiRequest<T>(path, {
      ...config,
      method: "PUT",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(path: string, body?: unknown, config?: RequestConfig) =>
    apiRequest<T>(path, {
      ...config,
      method: "PATCH",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(path: string, config?: RequestConfig) =>
    apiRequest<T>(path, { ...config, method: "DELETE" }),
};
