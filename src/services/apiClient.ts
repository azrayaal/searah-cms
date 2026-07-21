import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';

import { mockRequest } from '@/services/mock/mockApi';
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
  // The httpOnly cookies are the secondary path; they only arrive when the browser
  // allows third-party cookies, so credentials still ride along on every request.
  withCredentials: true,
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
    // While the API is behind an ngrok tunnel, ngrok answers browser-looking requests
    // with an HTML interstitial that carries no CORS headers — which the browser then
    // reports as a CORS failure, hiding the real cause. This header opts out.
    // Harmless once the API moves to a real host.
    'ngrok-skip-browser-warning': 'true',
  },
});

/* ------------------------------------------------------------ Token storage */

/**
 * The CMS and the API are on different sites, and browsers that block third-party
 * cookies drop the session cookies entirely — login returns 200 and every request
 * after it is 401. So the access token from the login body is held here and sent as
 * a Bearer header, which no cookie policy can interfere with.
 *
 * The trade-off is that a token in web storage is readable by injected script,
 * whereas an httpOnly cookie is not. Kept in sessionStorage unless the user asked to
 * be remembered, mirroring the lifetime the refresh cookie would have had.
 */
const ACCESS_KEY = 'searah.accessToken';
const REFRESH_KEY = 'searah.refreshToken';

function readStored(key: string): string | null {
  return window.sessionStorage.getItem(key) ?? window.localStorage.getItem(key);
}

let accessToken: string | null = readStored(ACCESS_KEY);

export interface SessionTokens {
  accessToken: string;
  refreshToken: string;
}

export function setAuthTokens(tokens: SessionTokens, remember: boolean): void {
  accessToken = tokens.accessToken;

  const target = remember ? window.localStorage : window.sessionStorage;
  const other = remember ? window.sessionStorage : window.localStorage;

  // Clear the other store first, so a "remember me" downgrade cannot leave a stale
  // long-lived token behind for the next person on the machine.
  other.removeItem(ACCESS_KEY);
  other.removeItem(REFRESH_KEY);

  target.setItem(ACCESS_KEY, tokens.accessToken);
  target.setItem(REFRESH_KEY, tokens.refreshToken);
}

export function clearAuthTokens(): void {
  accessToken = null;

  for (const store of [window.sessionStorage, window.localStorage]) {
    store.removeItem(ACCESS_KEY);
    store.removeItem(REFRESH_KEY);
  }
}

export function getRefreshToken(): string | null {
  return readStored(REFRESH_KEY);
}

apiClient.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
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
  // The refresh token goes in the body as well as the cookie, for the same reason
  // the access token goes in a header: the cookie may never have reached us.
  const remember = window.localStorage.getItem(REFRESH_KEY) !== null;

  refreshPromise ??= apiClient
    .post<ApiEnvelope<SessionTokens>>('/auth/refresh', { refreshToken: getRefreshToken() ?? undefined })
    .then((response) => {
      const tokens = response.data.data;
      if (tokens?.accessToken) setAuthTokens(tokens, remember);
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

/** Notifies the app that the session is unrecoverable, without importing the store. */
function broadcastSessionExpiry(): void {
  clearAuthTokens();
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

/*
 * DUMMY MODE — the backend is not available yet, so every helper below answers from
 * the in-memory fixtures in `@/services/mock/mockApi` instead of the network. The real
 * axios call is kept commented directly above each mock call: going live is deleting
 * the `mockRequest` line, uncommenting the axios lines, and removing the mock folder.
 */

/** Unwraps the envelope so callers receive `data` directly. */
export async function apiGet<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  // const response = await apiClient.get<ApiEnvelope<T>>(url, { params });
  const response = { data: await mockRequest<T>('GET', url, undefined, params) };
  return response.data.data;
}

/** Returns the whole envelope, for list endpoints that need `meta.pagination`. */
export async function apiGetEnvelope<T>(url: string, params?: Record<string, unknown>): Promise<ApiEnvelope<T>> {
  // const response = await apiClient.get<ApiEnvelope<T>>(url, { params });
  const response = { data: await mockRequest<T>('GET', url, undefined, params) };
  return response.data;
}

export async function apiPost<T>(url: string, body?: unknown): Promise<T> {
  // const response = await apiClient.post<ApiEnvelope<T>>(url, body);
  const response = { data: await mockRequest<T>('POST', url, body) };
  return response.data.data;
}

export async function apiPatch<T>(url: string, body?: unknown): Promise<T> {
  // const response = await apiClient.patch<ApiEnvelope<T>>(url, body);
  const response = { data: await mockRequest<T>('PATCH', url, body) };
  return response.data.data;
}

export async function apiPut<T>(url: string, body?: unknown): Promise<T> {
  // const response = await apiClient.put<ApiEnvelope<T>>(url, body);
  const response = { data: await mockRequest<T>('PUT', url, body) };
  return response.data.data;
}

export async function apiDelete<T = null>(url: string): Promise<T> {
  // const response = await apiClient.delete<ApiEnvelope<T>>(url);
  const response = { data: await mockRequest<T>('DELETE', url) };
  return response.data.data;
}
