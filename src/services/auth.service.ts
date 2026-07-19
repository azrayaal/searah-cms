import { apiGet, apiPatch, apiPost } from '@/services/apiClient';
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
  login: (payload: LoginPayload) => apiPost<LoginResponse>('/auth/login', payload),

  logout: () => apiPost<null>('/auth/logout'),

  /** Probes the session on boot. The cookie is sent automatically. */
  me: () => apiGet<CurrentUser>('/auth/me'),

  changePassword: (payload: ChangePasswordPayload) => apiPost<null>('/auth/change-password', payload),

  forgotPassword: (email: string) => apiPost<{ devToken?: string }>('/auth/forgot-password', { email }),

  resetPassword: (payload: { token: string; newPassword: string; confirmPassword: string }) =>
    apiPost<null>('/auth/reset-password', payload),

  updateProfile: (payload: { name?: string; position?: string | null; avatarUrl?: string | null }) =>
    apiPatch<CurrentUser>('/admin/users/me', payload),
};
