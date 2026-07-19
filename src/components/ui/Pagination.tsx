import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import type { PaginationMeta } from '@/types/api';

export interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  className?: string;
}

/**
 * Builds a compact page list with ellipses: 1 … 4 5 6 … 20.
 * Always includes the first and last page so the ends stay reachable in one click.
 */
function buildPages(current: number, total: number): (number | 'gap')[] {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);

  const pages: (number | 'gap')[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  if (start > 2) pages.push('gap');
  for (let page = start; page <= end; page += 1) pages.push(page);
  if (end < total - 1) pages.push('gap');

  pages.push(total);
  return pages;
}

export function Pagination({ meta, onPageChange, className }: PaginationProps) {
  if (meta.totalPages <= 1) return null;

  const pages = buildPages(meta.page, meta.totalPages);
  const from = (meta.page - 1) * meta.limit + 1;
  const to = Math.min(meta.page * meta.limit, meta.total);

  return (
    <nav
      aria-label="Pagination"
      className={cn('flex flex-wrap items-center justify-between gap-4 border-t border-gray-300/60 px-6 py-4', className)}
    >
      <p className="text-sm text-gray-700">
        Showing <span className="font-semibold text-primary">{from}</span>–
        <span className="font-semibold text-primary">{to}</span> of{' '}
        <span className="font-semibold text-primary">{meta.total}</span>
      </p>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          disabled={!meta.hasPreviousPage}
          onClick={() => onPageChange(meta.page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </Button>

        {pages.map((page, index) =>
          page === 'gap' ? (
            <span key={`gap-${index}`} className="px-2 text-gray-700" aria-hidden="true">
              …
            </span>
          ) : (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              aria-label={`Page ${page}`}
              aria-current={page === meta.page ? 'page' : undefined}
              className={cn(
                'h-9 min-w-9 rounded-btn px-2 text-sm font-semibold tabular-nums',
                'transition-colors duration-150 ease-premium',
                page === meta.page
                  ? 'bg-primary text-white shadow-card'
                  : 'text-gray-700 hover:bg-primary-100 hover:text-primary',
              )}
            >
              {page}
            </button>
          ),
        )}

        <Button
          variant="ghost"
          size="sm"
          disabled={!meta.hasNextPage}
          onClick={() => onPageChange(meta.page + 1)}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </nav>
  );
}
