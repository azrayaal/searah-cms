import type { ReactNode } from 'react';

import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface Crumb {
  label: string;
  to?: string;
}

export interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: Crumb[];
  actions?: ReactNode;
}

export function PageHeader({ title, description, breadcrumbs, actions }: PageHeaderProps) {
  return (
    <div className="mb-6 flex animate-fade-in flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-2">
            <ol className="flex flex-wrap items-center gap-1 text-sm text-gray-700">
              {breadcrumbs.map((crumb, index) => (
                <li key={`${crumb.label}-${index}`} className="flex items-center gap-1">
                  {index > 0 && <ChevronRight className="h-3.5 w-3.5 text-primary-300" aria-hidden="true" />}
                  {crumb.to ? (
                    <Link
                      to={crumb.to}
                      className="rounded-btn text-primary-500 transition-colors hover:text-primary hover:underline"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    // The current page is marked, not linked — a link to here is a no-op.
                    <span aria-current="page" className="text-gray-700">
                      {crumb.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        {/* A short navy rule beside the title — the cheapest way to give every page a
            spot of brand colour without adding a decorative panel to each one. */}
        <div className="flex items-center gap-3">
          <span className="h-7 w-1 shrink-0 rounded-full bg-primary" aria-hidden="true" />
          <h1 className="text-h2 text-gray-900">{title}</h1>
        </div>
        {description && <p className="mt-1.5 max-w-prose text-gray-700">{description}</p>}
      </div>

      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
