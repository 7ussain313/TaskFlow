'use client';

import { useWorkItems } from '@/hooks/use-work-items';
import { WorkItemCard } from '@/components/work-item-card';
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
      <h1 className="text-lg font-semibold">Phase Board</h1>

      {isLoading && <p className="mt-6 text-sm text-zinc-500">Loading board…</p>}
      {isError && (
        <p className="mt-6 text-sm text-red-600">Couldn&apos;t load the board. Please try again.</p>
      )}
      {items && items.length === 0 && (
        <p className="mt-6 text-sm text-zinc-500">No work items yet.</p>
      )}

      {items && items.length > 0 && (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {COLUMNS.map((column) => {
            const columnItems = items.filter((item) => item.status === column.status);
            return (
              <div key={column.status} className="min-w-0">
                <div className="flex items-center justify-between border-b border-black/10 pb-2 dark:border-white/15">
                  <h2 className="text-sm font-semibold">{column.label}</h2>
                  <span className="text-xs text-zinc-500">{columnItems.length}</span>
                </div>
                <div className="mt-3 space-y-2">
                  {columnItems.length === 0 && (
                    <p className="text-xs text-zinc-400">No items</p>
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
