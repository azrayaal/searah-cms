import type { ReactNode } from 'react';

import { Navigate, useLocation } from 'react-router-dom';

import { LoadingState } from '@/components/ui/Feedback';
import { useAuthStore } from '@/store/auth.store';

export interface ProtectedRouteProps {
  children: ReactNode;
  /** Optional permission gate for a specific module. */
  permission?: string;
}

/**
 * Client-side route guard.
 *
 * This is navigation ergonomics, not security: it stops an editor landing on a
 * screen they cannot use. Every request the screen makes is authorised again on the
 * server, which is where access is actually decided — a determined user can always
 * edit client state, and nothing here would stop them.
 */
export function ProtectedRoute({ children, permission }: ProtectedRouteProps) {
  const user = useAuthStore((state) => state.user);
  const isInitialising = useAuthStore((state) => state.isInitialising);
  const can = useAuthStore((state) => state.can);
  const location = useLocation();

  // Distinguishing "still checking" from "signed out" matters: redirecting during
  // the initial probe would bounce a signed-in user to the login screen on refresh.
  if (isInitialising) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingState label="Checking your session…" />
      </div>
    );
  }

  if (!user) {
    // `from` lets the login screen return the user where they were headed.
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }

  if (permission && !can(permission)) {
    return <Navigate to="/forbidden" replace />;
  }

  return <>{children}</>;
}

/** Keeps a signed-in user off the login screen. */
export function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const user = useAuthStore((state) => state.user);
  const isInitialising = useAuthStore((state) => state.isInitialising);

  if (isInitialising) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingState label="Loading…" />
      </div>
    );
  }

  return user ? <Navigate to="/" replace /> : <>{children}</>;
}
