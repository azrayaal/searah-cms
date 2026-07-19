import { lazy, Suspense } from 'react';

import { Route, Routes } from 'react-router-dom';

import { LoadingState } from '@/components/ui/Feedback';
import { useSessionBootstrap, useSessionExpiryListener } from '@/hooks/useAuth';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { ProtectedRoute, PublicOnlyRoute } from '@/routes/ProtectedRoute';

/* Route-level code splitting: the login screen should not ship the whole CMS. */
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const NewsletterListPage = lazy(() => import('@/pages/newsletter/NewsletterListPage'));
const NewsletterFormPage = lazy(() => import('@/pages/newsletter/NewsletterFormPage'));
const ForbiddenPage = lazy(() => import('@/pages/ForbiddenPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

function RouteFallback() {
  return <LoadingState />;
}

export function App() {
  useSessionBootstrap();
  useSessionExpiryListener();

  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          }
        />

        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />

          <Route
            path="newsletters"
            element={
              <ProtectedRoute permission="newsletter:read">
                <NewsletterListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="newsletters/new"
            element={
              <ProtectedRoute permission="newsletter:create">
                <NewsletterFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="newsletters/:id"
            element={
              <ProtectedRoute permission="newsletter:update">
                <NewsletterFormPage />
              </ProtectedRoute>
            }
          />

          <Route path="forbidden" element={<ForbiddenPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
