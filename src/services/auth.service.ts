import { apiGet, apiPatch, apiPost, clearAuthTokens, getRefreshToken, setAuthTokens } from '@/services/apiClient';
import type { CurrentUser, LoginResponse } from '@/types/api';

export interface LoginPayload {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const authService = {
  login: async (payload: LoginPayload) => {
    const result = await apiPost<LoginResponse>('/auth/login', payload);
    setAuthTokens(result, payload.rememberMe ?? false);
    return result;
  },

  logout: async () => {
    try {
      // Sent explicitly so the server can revoke the refresh token even when the
      // cookie never made it across sites — otherwise it stays valid until expiry.
      return await apiPost<null>('/auth/logout', { refreshToken: getRefreshToken() ?? undefined });
    } finally {
      clearAuthTokens();
    }
  },

  /** Probes the session on boot, using the stored token or the cookie. */
  me: () => apiGet<CurrentUser>('/auth/me'),

  changePassword: async (payload: ChangePasswordPayload) => {
    // The backend revokes every session here, so the stored tokens are already dead.
    const result = await apiPost<null>('/auth/change-password', payload);
    clearAuthTokens();
    return result;
  },

  forgotPassword: (email: string) => apiPost<{ devToken?: string }>('/auth/forgot-password', { email }),

  resetPassword: (payload: { token: string; newPassword: string; confirmPassword: string }) =>
    apiPost<null>('/auth/reset-password', payload),

  updateProfile: (payload: { name?: string; position?: string | null; avatarUrl?: string | null }) =>
    apiPatch<CurrentUser>('/admin/users/me', payload),
};
