import { Construction } from 'lucide-react';

import { PageHeader } from '@/components/layout/PageHeader';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/cn';
import { STUB_PAGES, type StubCell, type StubColumn, type StubResourceKey } from '@/pages/stubs/stubConfig';

/**
 * One component for all fourteen not-yet-built modules.
 *
 * Fourteen near-identical files would be fourteen places to forget when the table
 * conventions change, and each one would have to be deleted by hand as its real
 * module lands. A single component driven by `stubConfig` keeps the markup honest
 * against the newsletter list — the screen these will all eventually become — and
 * makes retiring a stub a one-line route swap.
 */

function renderCell(cell: StubCell) {
  if (typeof cell === 'string') return cell;
  if (cell.kind === 'status') return <StatusBadge status={cell.status} />;
  return <Badge tone="primary">{cell.label}</Badge>;
}

/** Badges bring their own padding and shape; plain text needs the row's type styles. */
function cellClassName(column: StubColumn, cell: StubCell) {
  return cn(
    'px-4 py-3',
    column.align === 'right' && 'text-right',
    typeof cell === 'string'
      ? cn('whitespace-nowrap', column.muted ? 'text-sm text-gray-500' : 'font-medium text-gray-900')
      : 'whitespace-nowrap',
  );
}

export interface StubListPageProps {
  resource: StubResourceKey;
}

export default function StubListPage({ resource }: StubListPageProps) {
  const config = STUB_PAGES[resource];

  return (
    <>
      <PageHeader
        title={config.title}
        description={config.description}
        breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: config.breadcrumb }]}
      />

      <Card flush>
        {/* Said plainly and above the fold. The sample rows are convincing on purpose,
            which is exactly why the screen has to admit what it is — an editor who
            mistakes this for live data will report the wrong bug, or worse, trust a
            production figure that nobody entered. */}
        <div className="flex items-start gap-3 rounded-t-card border-b border-gray-200 bg-surface-page p-4">
          <span
            aria-hidden="true"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-field bg-primary-100 text-primary"
          >
            <Construction className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="font-medium text-gray-900">Placeholder screen</p>
            <p className="mt-0.5 text-sm text-gray-500">
              The rows below are sample data. This module is not connected to the API yet, so nothing here can be
              searched, edited or saved.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse text-left">
            <thead>
              <tr className="border-b border-gray-200 bg-primary-100">
                {config.columns.map((column) => (
                  <th
                    key={column.key}
                    scope="col"
                    className={cn(
                      'px-4 py-3 text-label uppercase text-primary',
                      column.align === 'right' && 'text-right',
                    )}
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {config.rows.map((row, index) => (
                <tr
                  // Sample rows have no identity of their own, and the list never
                  // reorders — the index is a stable key here in a way it would not
                  // be once these come from the API.
                  key={index}
                  className="border-b border-gray-200 last:border-0 odd:bg-white even:bg-surface-page/60 transition-colors hover:bg-primary-100/60"
                >
                  {config.columns.map((column) => {
                    const cell = row[column.key] ?? '—';
                    return (
                      <td key={column.key} className={cellClassName(column, cell)}>
                        {renderCell(cell)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
