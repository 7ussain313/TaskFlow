'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useWorkItems, type WorkItemFilters } from '@/hooks/use-work-items';
import { StatusBadge } from '@/components/status-badge';
import { PriorityBadge } from '@/components/priority-badge';
import { OverdueBadge } from '@/components/overdue-badge';
import { WorkItemFiltersBar } from '@/components/work-item-filters';

const PAGE_SIZE = 5;

// List of every work item visible to the current user (API-scoped by role),
// with Manager-facing filters by phase, assignee, and priority, plus search,
// sorting, and pagination.
export default function WorkItemsPage() {
  const { user } = useAuth();
  const [filters, setFilters] = useState<WorkItemFilters>({ limit: PAGE_SIZE, page: 1 });
  const { data, isLoading, isError } = useWorkItems(filters);
  const items = data?.items;

  // Any change from the filter bar (status/priority/assignee/search/sort) jumps
  // back to page 1 — a filter narrowing the result set could otherwise land the
  // user on a page number that no longer exists.
  function handleFiltersChange(next: WorkItemFilters) {
    setFilters({ ...next, page: 1 });
  }

  function goToPage(page: number) {
    setFilters((prev) => ({ ...prev, page }));
  }

  const hasFilters = Boolean(
    filters.status || filters.assigneeId || filters.priority || filters.search,
  );

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Work Items</h1>
        {user?.role === 'MANAGER' && (
          <Link
            href="/work-items/new"
            className="rounded bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            New Work Item
          </Link>
        )}
      </div>

      <div className="mt-4">
        <WorkItemFiltersBar
          filters={filters}
          onChange={handleFiltersChange}
          showAssigneeFilter={user?.role === 'MANAGER'}
        />
      </div>

      {isLoading && <p className="mt-6 text-sm text-zinc-500">Loading work items…</p>}

      {isError && (
        <p className="mt-6 text-sm text-red-600">
          Couldn&apos;t load work items. Please try again.
        </p>
      )}

      {items && items.length === 0 && (
        <p className="mt-6 text-sm text-zinc-500">
          {hasFilters
            ? 'No work items match these filters.'
            : user?.role === 'MANAGER'
              ? 'No work items yet. Create the first one above.'
              : 'Nothing assigned to you yet.'}
        </p>
      )}

      {items && items.length > 0 && (
        <ul className="mt-6 divide-y divide-black/10 dark:divide-white/15">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={`/work-items/${item.id}`}
                className="flex items-center justify-between gap-4 py-3 transition-colors hover:bg-black/[.02] dark:hover:bg-white/[.03]"
              >
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-xs text-zinc-500">
                    {item.category} · Due {new Date(item.dueDate).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {item.isOverdue && <OverdueBadge />}
                  <PriorityBadge priority={item.priority} />
                  <StatusBadge status={item.status} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {data && data.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between text-sm">
          <button
            type="button"
            disabled={data.page <= 1}
            onClick={() => goToPage(data.page - 1)}
            className="rounded border border-black/15 px-3 py-1.5 disabled:opacity-40 dark:border-white/20"
          >
            ← Previous
          </button>
          <span className="text-zinc-500">
            Page {data.page} of {data.totalPages} · {data.total} item{data.total === 1 ? '' : 's'}
          </span>
          <button
            type="button"
            disabled={data.page >= data.totalPages}
            onClick={() => goToPage(data.page + 1)}
            className="rounded border border-black/15 px-3 py-1.5 disabled:opacity-40 dark:border-white/20"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
