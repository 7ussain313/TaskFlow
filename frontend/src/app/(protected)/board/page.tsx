'use client';

import { useWorkItems } from '@/hooks/use-work-items';
import { WorkItemCard } from '@/components/work-item-card';
import { Skeleton } from '@/components/skeleton';
import { statusDotClasses } from '@/lib/status-colors';
import type { WorkItemStatus } from '@/types/work-item';

const COLUMNS: { status: WorkItemStatus; label: string }[] = [
  { status: 'BACKLOG', label: 'Backlog' },
  { status: 'ASSIGNED', label: 'Assigned' },
  { status: 'IN_PROGRESS', label: 'In Progress' },
  { status: 'IN_REVIEW', label: 'In Review' },
  { status: 'DONE', label: 'Done' },
  { status: 'CANCELLED', label: 'Cancelled' },
];

// Phase board: every work item grouped into a column by its current status. A
// board shows the whole workspace at once, not one page at a time, so this
// requests the max page size rather than using the list page's pagination.
export default function BoardPage() {
  const { data, isLoading, isError } = useWorkItems({ limit: 200 });
  const items = data?.items;

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Phase Board</h1>
      <p className="mt-1 text-sm text-zinc-500">Every work item, grouped by where it stands.</p>

      {isError && (
        <p className="mt-6 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/40">
          Couldn&apos;t load the board. Please try again.
        </p>
      )}
      {items && items.length === 0 && (
        <div className="mt-10 flex flex-col items-center rounded-xl border border-dashed border-border-strong py-16 text-center">
          <p className="text-sm font-medium">No work items yet</p>
          <p className="mt-1 text-sm text-zinc-500">Items will appear here as soon as they&apos;re created.</p>
        </div>
      )}

      {isLoading && (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {COLUMNS.map((column) => (
            <div key={column.status} className="space-y-2">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
          ))}
        </div>
      )}

      {items && items.length > 0 && (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {COLUMNS.map((column) => {
            const columnItems = items.filter((item) => item.status === column.status);
            return (
              <div key={column.status} className="min-w-0">
                <div className="flex items-center justify-between rounded-t-lg border-b-2 px-1 pb-2" style={{ borderColor: `var(--status-${column.status.toLowerCase().replace(/_/g, '-')})` }}>
                  <h2 className="flex items-center gap-1.5 text-sm font-semibold">
                    <span className={`h-2 w-2 rounded-full ${statusDotClasses(column.status)}`} />
                    {column.label}
                  </h2>
                  <span className="rounded-full bg-surface-hover px-1.5 py-0.5 text-xs font-medium text-zinc-500">
                    {columnItems.length}
                  </span>
                </div>
                <div className="mt-3 space-y-2">
                  {columnItems.length === 0 && (
                    <p className="rounded-lg border border-dashed border-border-subtle px-3 py-4 text-center text-xs text-zinc-400">
                      No items
                    </p>
                  )}
                  {columnItems.map((item) => (
                    <WorkItemCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
