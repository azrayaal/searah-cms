import { useEffect, useMemo, useState } from 'react';

import { Eye, EyeOff, Newspaper, Pencil, Plus, Search, Star, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

import { PageHeader } from '@/components/layout/PageHeader';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/Feedback';
import { Input, Select } from '@/components/ui/Field';
import { Pagination } from '@/components/ui/Pagination';
import { useDeleteNewsletter, useNewsletterList, useSetNewsletterStatus } from '@/hooks/useNewsletters';
import { NEWSLETTER_CATEGORIES } from '@/services/newsletter.service';
import { useAuthStore } from '@/store/auth.store';
import type { ContentStatus } from '@/types/api';

const PAGE_SIZE = 15;

function formatDate(value: string | null): string {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function NewsletterListPage() {
  const can = useAuthStore((state) => state.can);

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');

  // Debounced search: firing a request per keystroke would hammer the API and race
  // its own responses.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const params = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      ...(search ? { search } : {}),
      ...(category ? { category } : {}),
      ...(status ? { status: status as ContentStatus } : {}),
    }),
    [page, search, category, status],
  );

  const { data, isPending, isError, error, refetch } = useNewsletterList(params);
  const deleteNewsletter = useDeleteNewsletter();
  const setNewsletterStatus = useSetNewsletterStatus();

  const items = data?.data ?? [];
  const pagination = data?.meta.pagination;

  const handleDelete = (id: string, title: string) => {
    // Deliberately a blocking confirm: deletion is irreversible and there is no
    // trash. A toast-with-undo would be better UX, but only if the API supported
    // soft delete — promising undo we cannot deliver is worse than a plain prompt.
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    deleteNewsletter.mutate(id);
  };

  return (
    <>
      <PageHeader
        title="Newsletter"
        description="Articles and publications shown across the corporate portal."
        breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Newsletter' }]}
        actions={
          can('newsletter:create') && (
            <Link to="/newsletters/new">
              <Button leadingIcon={<Plus className="h-4 w-4" aria-hidden="true" />}>New article</Button>
            </Link>
          )
        }
      />

      <Card flush>
        <div className="flex flex-wrap items-end gap-3 rounded-t-card border-b border-gray-200 bg-surface-page p-4">
          <div className="relative min-w-[240px] flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-[13px] h-4 w-4 text-gray-500"
              aria-hidden="true"
            />
            <Input
              type="search"
              placeholder="Search by title, excerpt or author…"
              aria-label="Search newsletters"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              className="[&_input]:pl-9"
            />
          </div>

          <Select
            aria-label="Filter by category"
            placeholder="All categories"
            className="w-[190px]"
            value={category}
            onChange={(event) => {
              setCategory(event.target.value);
              setPage(1);
            }}
            options={NEWSLETTER_CATEGORIES.map((value) => ({ value, label: value }))}
          />

          <Select
            aria-label="Filter by status"
            placeholder="All statuses"
            className="w-[170px]"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
            options={[
              { value: 'PUBLISHED', label: 'Published' },
              { value: 'DRAFT', label: 'Draft' },
              { value: 'ARCHIVED', label: 'Archived' },
            ]}
          />
        </div>

        {isPending ? (
          <LoadingState label="Loading articles…" />
        ) : isError ? (
          <ErrorState message={error instanceof Error ? error.message : 'Could not load articles'} onRetry={refetch} />
        ) : items.length === 0 ? (
          <EmptyState
            icon={<Newspaper className="h-6 w-6" aria-hidden="true" />}
            title="No articles found"
            description={
              search || category || status
                ? 'No article matches these filters. Try clearing them.'
                : 'Publish your first article to populate the newsroom.'
            }
            action={
              can('newsletter:create') && (
                <Link to="/newsletters/new">
                  <Button leadingIcon={<Plus className="h-4 w-4" aria-hidden="true" />}>New article</Button>
                </Link>
              )
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse text-left">
              <thead>
                <tr className="border-b border-gray-200 bg-primary-100">
                  <th scope="col" className="px-4 py-3 text-label uppercase text-primary">
                    Article
                  </th>
                  <th scope="col" className="px-4 py-3 text-label uppercase text-primary">
                    Category
                  </th>
                  <th scope="col" className="px-4 py-3 text-label uppercase text-primary">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-3 text-label uppercase text-primary">
                    Published
                  </th>
                  <th scope="col" className="px-4 py-3 text-right text-label uppercase text-primary">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {items.map((article) => (
                  <tr
                    key={article.id}
                    className="border-b border-gray-200 last:border-0 odd:bg-white even:bg-surface-page/60 transition-colors hover:bg-primary-100/60"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {article.thumbnailUrl ? (
                          <img
                            src={article.thumbnailUrl}
                            alt=""
                            loading="lazy"
                            className="h-10 w-14 shrink-0 rounded border border-gray-200 object-cover"
                          />
                        ) : (
                          <div
                            className="flex h-10 w-14 shrink-0 items-center justify-center rounded bg-primary-100 text-primary"
                            aria-hidden="true"
                          >
                            <Newspaper className="h-4 w-4" />
                          </div>
                        )}

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <Link
                              to={`/newsletters/${article.id}`}
                              className="truncate font-medium text-gray-900 hover:text-primary hover:underline"
                            >
                              {article.title}
                            </Link>
                            {/* Orange fill with the darker ramp step as the stroke: the
                                flat orange is 2.31:1 on white and misses the 3:1 a
                                meaningful icon needs, so the outline carries it. */}
                            {article.featured && (
                              <Star
                                className="h-3.5 w-3.5 shrink-0 fill-orange text-orange-700"
                                role="img"
                                aria-label="Featured"
                              />
                            )}
                          </div>
                          <p className="truncate text-sm text-gray-500">{article.authorName ?? 'Unattributed'}</p>
                        </div>
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-4 py-3">
                      <Badge tone="primary">{article.category}</Badge>
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 pl-6">
                      <StatusBadge status={article.status} />
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                      {formatDate(article.publishedAt)}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {can('newsletter:publish') && (
                          <Button
                            variant="ghost"
                            size="sm"
                            isLoading={
                              setNewsletterStatus.isPending && setNewsletterStatus.variables?.id === article.id
                            }
                            onClick={() =>
                              setNewsletterStatus.mutate({
                                id: article.id,
                                status: article.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED',
                              })
                            }
                            aria-label={article.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                            title={article.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                          >
                            {article.status === 'PUBLISHED' ? (
                              <EyeOff className="h-4 w-4" aria-hidden="true" />
                            ) : (
                              <Eye className="h-4 w-4" aria-hidden="true" />
                            )}
                          </Button>
                        )}

                        {can('newsletter:update') && (
                          <Link to={`/newsletters/${article.id}`}>
                            <Button variant="ghost" size="sm" aria-label="Edit" title="Edit">
                              <Pencil className="h-4 w-4" aria-hidden="true" />
                            </Button>
                          </Link>
                        )}

                        {can('newsletter:delete') && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-burgundy hover:bg-burgundy-100"
                            isLoading={deleteNewsletter.isPending && deleteNewsletter.variables === article.id}
                            onClick={() => handleDelete(article.id, article.title)}
                            aria-label="Delete"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination && (
          <div className="rounded-b-card border-t border-gray-200 bg-surface-page">
            <Pagination meta={pagination} onPageChange={setPage} />
          </div>
        )}
      </Card>
    </>
  );
}
