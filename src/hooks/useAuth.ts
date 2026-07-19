import { useEffect } from 'react';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { queryClient } from '@/lib/queryClient';
import { ApiRequestError } from '@/services/apiClient';
import { authService, type LoginPayload } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';

/**
 * Restores the session on boot.
 *
 * The access token is an httpOnly cookie the app cannot read, so "am I signed in?"
 * is answered by asking the server, not by inspecting storage. A 401 here is the
 * normal signed-out path and must not surface as an error.
 */
export function useSessionBootstrap(): void {
  const setUser = useAuthStore((state) => state.setUser);
  const setInitialised = useAuthStore((state) => state.setInitialised);

  useEffect(() => {
    let cancelled = false;

    authService
      .me()
      .then((user) => {
        if (!cancelled) setUser(user);
      })
      .catch(() => {
        if (!cancelled) setInitialised();
      });

    return () => {
      cancelled = true;
    };
  }, [setUser, setInitialised]);
}

/** Clears local session state when the API reports the session is unrecoverable. */
export function useSessionExpiryListener(): void {
  const clear = useAuthStore((state) => state.clear);

  useEffect(() => {
    const handler = () => {
      clear();
      queryClient.clear();
    };

    window.addEventListener('searah:session-expired', handler);
    return () => window.removeEventListener('searah:session-expired', handler);
  }, [clear]);
}

export function useLogin() {
  const setUser = useAuthStore((state) => state.setUser);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
    onSuccess: (result) => {
      setUser(result.user);
      navigate('/', { replace: true });
    },
  });
}

export function useLogout() {
  const clear = useAuthStore((state) => state.clear);
  const client = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: () => authService.logout(),
    // Runs on both paths: if the logout call fails, the local session must still be
    // discarded. Leaving the user apparently signed in after they clicked "sign out"
    // is the worse failure.
    onSettled: () => {
      clear();
      client.clear();
      navigate('/login', { replace: true });
    },
  });
}

export function useChangePassword() {
  const clear = useAuthStore((state) => state.clear);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authService.changePassword,
    // The backend revokes every session on password change, so the current one is
    // already dead — send the user to sign in again rather than let them hit 401s.
    onSuccess: () => {
      clear();
      navigate('/login?reason=password-changed', { replace: true });
    },
  });
}

/** Maps API field errors onto react-hook-form. */
export function applyFieldErrors<T extends Record<string, unknown>>(
  error: unknown,
  setError: (field: keyof T & string, error: { type: string; message: string }) => void,
): string | null {
  if (!(error instanceof ApiRequestError)) {
    return error instanceof Error ? error.message : 'Something went wrong';
  }

  let matched = false;
  for (const fieldError of error.fieldErrors) {
    setError(fieldError.field as keyof T & string, { type: 'server', message: fieldError.message });
    matched = true;
  }

  // Field-level errors are shown inline; only an unattributed error needs a banner.
  return matched ? null : error.message;
}
