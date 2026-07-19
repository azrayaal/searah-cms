import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';

import type { ApiEnvelope, FieldError } from '@/types/api';

const BASE_URL = import.meta.env['VITE_API_URL'] ?? 'http://localhost:4000/api/v1';

/**
 * A typed error carrying the backend's envelope, so screens can bind field errors
 * to inputs instead of parsing an AxiosError at every call site.
 */
export class ApiRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
    readonly fieldErrors: FieldError[] = [],
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }

  /** Field errors keyed by name, ready for react-hook-form's setError. */
  get byField(): Record<string, string> {
    return Object.fromEntries(this.fieldErrors.map((error) => [error.field, error.message]));
  }
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  // Tokens live in httpOnly cookies, so credentials must ride along on every request.
  withCredentials: true,
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
});

/* ------------------------------------------------------- Refresh coordination */

type RetryableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

let refreshPromise: Promise<void> | null = null;

/**
 * Single-flight refresh.
 *
 * When a page fires six queries at once and the access token has expired, all six
 * get a 401. Without this shared promise each would POST /auth/refresh, and because
 * the backend rotates refresh tokens, the second request through would present an
 * already-rotated token — which the reuse detector correctly reads as theft and
 * responds to by revoking every session. Coordinating here is what keeps a normal
 * token expiry from logging the user out.
 */
async function refreshSession(): Promise<void> {
  refreshPromise ??= apiClient
    .post('/auth/refresh')
    .then(() => undefined)
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

/** Notifies the app that the session is unrecoverable, without importing the store. */
function broadcastSessionExpiry(): void {
  window.dispatchEvent(new CustomEvent('searah:session-expired'));
}

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,

  async (error: AxiosError<ApiEnvelope<null>>) => {
    const config = error.config as RetryableConfig | undefined;
    const status = error.response?.status;
    const envelope = error.response?.data;

    if (!error.response || !config) {
      throw new ApiRequestError(
        error.code === 'ECONNABORTED' ? 'The request timed out' : 'Cannot reach the server',
        0,
        'NETWORK_ERROR',
      );
    }

    const code = envelope?.meta?.code ?? 'ERROR';

    // Retry once on an expired access token. `_retried` guards against a loop when
    // the refresh itself returns 401.
    const isExpiredAccess = status === 401 && code === 'TOKEN_EXPIRED';
    const isAuthEndpoint = config.url?.includes('/auth/refresh') || config.url?.includes('/auth/login');

    if (isExpiredAccess && !config._retried && !isAuthEndpoint) {
      config._retried = true;

      try {
        await refreshSession();
        return await apiClient(config);
      } catch {
        broadcastSessionExpiry();
        throw new ApiRequestError('Your session has expired, please sign in again', 401, 'SESSION_EXPIRED');
      }
    }

    if (status === 401 && !isAuthEndpoint) {
      broadcastSessionExpiry();
    }

    throw new ApiRequestError(
      envelope?.message ?? error.message ?? 'Request failed',
      status ?? 0,
      code,
      envelope?.meta?.errors ?? [],
    );
  },
);

/* ------------------------------------------------------------------ Helpers */

/** Unwraps the envelope so callers receive `data` directly. */
export async function apiGet<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const response = await apiClient.get<ApiEnvelope<T>>(url, { params });
  return response.data.data;
}

/** Returns the whole envelope, for list endpoints that need `meta.pagination`. */
export async function apiGetEnvelope<T>(url: string, params?: Record<string, unknown>): Promise<ApiEnvelope<T>> {
  const response = await apiClient.get<ApiEnvelope<T>>(url, { params });
  return response.data;
}

export async function apiPost<T>(url: string, body?: unknown): Promise<T> {
  const response = await apiClient.post<ApiEnvelope<T>>(url, body);
  return response.data.data;
}

export async function apiPatch<T>(url: string, body?: unknown): Promise<T> {
  const response = await apiClient.patch<ApiEnvelope<T>>(url, body);
  return response.data.data;
}

export async function apiPut<T>(url: string, body?: unknown): Promise<T> {
  const response = await apiClient.put<ApiEnvelope<T>>(url, body);
  return response.data.data;
}

export async function apiDelete<T = null>(url: string): Promise<T> {
  const response = await apiClient.delete<ApiEnvelope<T>>(url);
  return response.data.data;
}
