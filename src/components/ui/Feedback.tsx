import type { ReactNode } from 'react';

import { AlertTriangle, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('h-5 w-5 animate-spin text-primary', className)} aria-hidden="true" />;
}

/**
 * Full-region loading state.
 *
 * `role="status"` + `aria-live="polite"` means a screen reader announces the wait
 * instead of landing on an empty region and reporting nothing.
 */
export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex animate-fade-in flex-col items-center justify-center gap-4 py-16"
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-card bg-primary-100" aria-hidden="true">
        <Spinner className="h-6 w-6" />
      </span>
      <p className="text-caption text-gray-700">{label}</p>
    </div>
  );
}

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

/**
 * An empty table is the state a new user sees first, so it gets the same care as a
 * populated one: a brand-tinted chip, a real heading, and the action that fills it.
 */
export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="flex animate-slide-up flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      {icon && (
        <div
          className="flex h-14 w-14 items-center justify-center rounded-card bg-primary-100 text-primary"
          aria-hidden="true"
        >
          {icon}
        </div>
      )}
      <div>
        <p className="text-h4 text-gray-900">{title}</p>
        {description && <p className="mx-auto mt-1.5 max-w-prose text-sm text-gray-700">{description}</p>}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ title = 'Something went wrong', message, onRetry }: ErrorStateProps) {
  return (
    <div role="alert" className="flex animate-fade-in flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-card bg-burgundy-100 text-burgundy">
        <AlertTriangle className="h-6 w-6" aria-hidden="true" />
      </div>
      <div>
        <p className="text-h4 text-gray-900">{title}</p>
        <p className="mx-auto mt-1.5 max-w-prose text-sm text-gray-700">{message}</p>
      </div>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

/** Inline banner for form-level errors that belong to no single field. */
export function FormAlert({ message }: { message: string }) {
  return (
    <div role="alert" className="flex items-start gap-2.5 rounded-field border border-burgundy/25 bg-burgundy-100 px-4 py-3">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-burgundy" aria-hidden="true" />
      <p className="text-sm text-burgundy-700">{message}</p>
    </div>
  );
}

/* --------------------------------------------------------------------- Skeleton */

/** A single shimmering bar. `width` is any Tailwind width class. */
export function Skeleton({ className }: { className?: string }) {
  return <span className={cn('block animate-pulse rounded-field bg-gray-100', className)} aria-hidden="true" />;
}

export interface SkeletonRowsProps {
  /** How many placeholder rows to draw — match the page size you are loading. */
  rows?: number;
  /** How many cells per row — match the table's column count. */
  columns?: number;
  className?: string;
}

/**
 * Table placeholder that holds the layout while data loads, so the page does not
 * collapse and then jump back open.
 *
 * The whole block is one `role="status"` region rather than a hundred announced
 * bars: a screen reader hears "Loading rows" once, and `aria-hidden` on the bars
 * keeps the decoration out of the accessibility tree.
 */
export function SkeletonRows({ rows = 5, columns = 4, className }: SkeletonRowsProps) {
  return (
    <div role="status" aria-live="polite" aria-label="Loading rows" className={cn('divide-y divide-gray-300/40', className)}>
      {Array.from({ length: rows }, (_, row) => (
        <div key={row} className="flex items-center gap-4 px-6 py-4">
          {Array.from({ length: columns }, (_, column) => (
            // The first cell is the wide one — it stands in for the title column.
            <Skeleton key={column} className={cn('h-4', column === 0 ? 'flex-[2]' : 'flex-1')} />
          ))}
        </div>
      ))}
    </div>
  );
}
