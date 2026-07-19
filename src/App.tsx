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
/* Every module that is still to be built shares one placeholder list, so the sidebar
   never leads anywhere dead. Each stub route is swapped for its real page as that
   module lands — see src/pages/stubs/stubConfig.ts. */
const StubListPage = lazy(() => import('@/pages/stubs/StubListPage'));
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

          <Route
            path="about"
            element={
              <ProtectedRoute permission="about:read">
                <StubListPage resource="about" />
              </ProtectedRoute>
            }
          />
          <Route
            path="leadership"
            element={
              <ProtectedRoute permission="leadership:read">
                <StubListPage resource="leadership" />
              </ProtectedRoute>
            }
          />
          <Route
            path="galleries"
            element={
              <ProtectedRoute permission="gallery:read">
                <StubListPage resource="gallery" />
              </ProtectedRoute>
            }
          />
          <Route
            path="resources"
            element={
              <ProtectedRoute permission="resource:read">
                <StubListPage resource="resource" />
              </ProtectedRoute>
            }
          />
          <Route
            path="faqs"
            element={
              <ProtectedRoute permission="faq:read">
                <StubListPage resource="faq" />
              </ProtectedRoute>
            }
          />
          <Route
            path="legal"
            element={
              <ProtectedRoute permission="legal:read">
                <StubListPage resource="legal" />
              </ProtectedRoute>
            }
          />

          <Route
            path="production"
            element={
              <ProtectedRoute permission="production:read">
                <StubListPage resource="production" />
              </ProtectedRoute>
            }
          />
          <Route
            path="applications"
            element={
              <ProtectedRoute permission="application:read">
                <StubListPage resource="application" />
              </ProtectedRoute>
            }
          />
          <Route
            path="contacts"
            element={
              <ProtectedRoute permission="contact:read">
                <StubListPage resource="contact" />
              </ProtectedRoute>
            }
          />
          <Route
            path="emergency"
            element={
              <ProtectedRoute permission="emergency:read">
                <StubListPage resource="emergency" />
              </ProtectedRoute>
            }
          />

          <Route
            path="media"
            element={
              <ProtectedRoute permission="media:read">
                <StubListPage resource="media" />
              </ProtectedRoute>
            }
          />
          <Route
            path="users"
            element={
              <ProtectedRoute permission="user:read">
                <StubListPage resource="user" />
              </ProtectedRoute>
            }
          />
          <Route
            path="audit-logs"
            element={
              <ProtectedRoute permission="audit:read">
                <StubListPage resource="audit" />
              </ProtectedRoute>
            }
          />
          <Route
            path="settings"
            element={
              <ProtectedRoute permission="setting:read">
                <StubListPage resource="setting" />
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
