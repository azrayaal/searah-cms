import { create } from 'zustand';

import type { CurrentUser } from '@/types/api';

interface AuthState {
  user: CurrentUser | null;
  /** True until the initial /auth/me probe resolves — distinct from "logged out". */
  isInitialising: boolean;
  setUser: (user: CurrentUser | null) => void;
  setInitialised: () => void;
  clear: () => void;
  can: (permission: string) => boolean;
}

/**
 * Session state.
 *
 * Deliberately holds no tokens: those live in httpOnly cookies the browser attaches
 * automatically and JavaScript cannot read. Persisting a token here — or in
 * localStorage — would hand it to any successful XSS. What this store holds is
 * identity and permissions, which are display concerns; every one of them is
 * re-checked server-side on each request.
 */
export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isInitialising: true,

  setUser: (user) => set({ user, isInitialising: false }),
  setInitialised: () => set({ isInitialising: false }),
  clear: () => set({ user: null, isInitialising: false }),

  /**
   * Permission check for conditional UI. Mirrors the backend's wildcard rules so a
   * button is not shown for an action the API will refuse — but hiding a control is
   * a usability measure, never the access control itself.
   */
  can: (permission) => {
    const { user } = get();
    if (!user) return false;

    const granted = user.permissions;
    if (granted.includes('*:*') || granted.includes(permission)) return true;

    const [resource] = permission.split(':');
    return granted.includes(`${resource}:*`);
  },
}));
