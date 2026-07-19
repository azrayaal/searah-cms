import { useQuery } from '@tanstack/react-query';
import { ArrowRight, ChevronRight, FileText, Gauge, Images, Newspaper, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, StatCard } from '@/components/ui/Card';
import { EmptyState, LoadingState } from '@/components/ui/Feedback';
import { apiGetEnvelope } from '@/services/apiClient';
import { useAuthStore } from '@/store/auth.store';
import type { Newsletter } from '@/types/api';

/**
 * Counts are read from each list endpoint's `meta.pagination.total` with `limit=1`.
 *
 * One row per resource rather than a dedicated stats endpoint: the totals are exact,
 * the payload is negligible, and there is no second code path to keep in sync with
 * the filters the modules actually apply.
 */
function useCount(resource: string, enabled: boolean) {
  return useQuery({
    queryKey: ['dashboard', 'count', resource],
    queryFn: async () => {
      const envelope = await apiGetEnvelope<unknown[]>(`/admin/${resource}`, { limit: 1 });
      return envelope.meta.pagination?.total ?? 0;
    },
    enabled,
  });
}

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const can = useAuthStore((state) => state.can);

  const newsletters = useCount('newsletters', can('newsletter:read'));
  const leadership = useCount('leadership', can('leadership:read'));
  const galleries = useCount('galleries', can('gallery:read'));
  const production = useCount('production', can('production:read'));
  const resources = useCount('resources', can('resource:read'));

  const recent = useQuery({
    queryKey: ['dashboard', 'recent-newsletters'],
    queryFn: () =>
      apiGetEnvelope<Newsletter[]>('/admin/newsletters', { limit: 5, sortBy: 'updatedAt', sortOrder: 'desc' }),
    enabled: can('newsletter:read'),
  });

  const firstName = user?.name.split(' ')[0] ?? 'there';

  return (
    <>
      {/*
        A navy welcome band. It carries the greeting that PageHeader would otherwise
        render, so the page gains a colour anchor without gaining a row of height —
        the stat cards still sit above the fold.
      */}
      <section className="overflow-hidden rounded-card bg-surface-dark px-6 py-7 sm:px-8">
        <p className="text-label uppercase text-primary-300">Searah corporate portal</p>
        <h1 className="mt-2 text-h2 text-white">Welcome back, {firstName}</h1>
        <p className="mt-2 max-w-prose text-sm text-white/70">
          An overview of the content published across the Searah corporate portal.
        </p>
      </section>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {can('newsletter:read') && (
          <StatCard
            label="Articles"
            value={newsletters.data ?? '—'}
            caption="Newsletter entries"
            icon={<Newspaper className="h-5 w-5" aria-hidden="true" />}
          />
        )}
        {can('leadership:read') && (
          <StatCard
            label="Leadership"
            value={leadership.data ?? '—'}
            caption="Published profiles"
            tone="accent"
            icon={<Users className="h-5 w-5" aria-hidden="true" />}
          />
        )}
        {can('production:read') && (
          <StatCard
            label="Production readings"
            value={production.data ?? '—'}
            caption="Daily rate records"
            tone="sage"
            icon={<Gauge className="h-5 w-5" aria-hidden="true" />}
          />
        )}
        {can('gallery:read') && (
          <StatCard
            label="Galleries"
            value={galleries.data ?? '—'}
            caption="Image collections"
            tone="success"
            icon={<Images className="h-5 w-5" aria-hidden="true" />}
          />
        )}
        {can('resource:read') && (
          <StatCard
            label="Resources"
            value={resources.data ?? '—'}
            caption="Documents and templates"
            tone="primary"
            icon={<FileText className="h-5 w-5" aria-hidden="true" />}
          />
        )}
      </div>

      {can('newsletter:read') && (
        <Card flush className="mt-6">
          <div className="p-6 pb-0">
            <CardHeader
              title="Recently updated"
              description="The latest articles edited across the newsroom."
              actions={
                <Link
                  to="/newsletters"
                  className="inline-flex items-center gap-1 rounded-btn text-sm font-medium text-primary hover:text-primary-900 hover:underline"
                >
                  View all
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              }
            />
          </div>

          {recent.isPending ? (
            <LoadingState label="Loading recent articles…" />
          ) : !recent.data?.data.length ? (
            <EmptyState
              icon={<Newspaper className="h-6 w-6" aria-hidden="true" />}
              title="No articles yet"
              description="Articles you write or edit will collect here, most recently updated first."
              action={
                can('newsletter:create') && (
                  <Link to="/newsletters/new">
                    <Button variant="secondary">Write the first article</Button>
                  </Link>
                )
              }
            />
          ) : (
            <ul className="mt-4 divide-y divide-gray-200">
              {recent.data.data.map((article) => (
                <li key={article.id}>
                  {/*
                    The whole row is the target. The link is positioned over it via a
                    pseudo-element, so the accessible name stays the title alone rather
                    than every scrap of text in the row.
                  */}
                  <div className="group relative flex items-center gap-4 px-6 py-4 transition-colors hover:bg-primary-100/50">
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-field bg-primary-100 text-primary"
                      aria-hidden="true"
                    >
                      <Newspaper className="h-4 w-4" />
                    </span>

                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/newsletters/${article.id}`}
                        className="block truncate font-medium text-gray-900 after:absolute after:inset-0 after:content-[''] group-hover:text-primary"
                      >
                        {article.title}
                      </Link>
                      <p className="mt-0.5 truncate text-sm text-gray-500">
                        Updated{' '}
                        {new Date(article.updatedAt).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>

                    <Badge tone="neutral" className="hidden shrink-0 sm:inline-flex">
                      {article.category}
                    </Badge>
                    <StatusBadge status={article.status} />

                    <ChevronRight
                      className="h-4 w-4 shrink-0 text-gray-300 transition-colors group-hover:text-primary"
                      aria-hidden="true"
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}
    </>
  );
}
