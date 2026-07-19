import { QueryClient } from '@tanstack/react-query';

import { ApiRequestError } from '@/services/apiClient';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // CMS data changes under the editor's own hands, so a short stale window keeps
      // lists fresh without a request per focus change.
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,

      retry: (failureCount, error) => {
        // Never retry what will fail identically: auth, permission and validation
        // errors are decisions, not transient faults. Retrying a 401 also races the
        // refresh interceptor.
        if (error instanceof ApiRequestError) {
          if (error.status === 0) return failureCount < 2;
          if (error.status >= 400 && error.status < 500) return false;
        }

        return failureCount < 2;
      },
    },

    mutations: {
      // A retried POST can create two records. Mutations are never retried.
      retry: false,
    },
  },
});

/** Query keys, centralised so invalidation cannot drift from the fetch. */
export const queryKeys = {
  auth: { me: ['auth', 'me'] as const },

  newsletters: {
    all: ['newsletters'] as const,
    list: (params: Record<string, unknown>) => ['newsletters', 'list', params] as const,
    detail: (id: string) => ['newsletters', 'detail', id] as const,
  },

  media: {
    all: ['media'] as const,
    list: (params: Record<string, unknown>) => ['media', 'list', params] as const,
    folders: ['media', 'folders'] as const,
  },

  dashboard: { stats: ['dashboard', 'stats'] as const },

  auditLogs: {
    list: (params: Record<string, unknown>) => ['audit-logs', 'list', params] as const,
  },
} as const;
