'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useWorkItems, type WorkItemFilters } from '@/hooks/use-work-items';
import { StatusBadge } from '@/components/status-badge';
import { PriorityBadge } from '@/components/priority-badge';
import { OverdueBadge } from '@/components/overdue-badge';
import { WorkItemFiltersBar } from '@/components/work-item-filters';
import { Skeleton } from '@/components/skeleton';

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
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Work Items</h1>
          <p className="mt-1 text-sm text-zinc-500">Every item you can see, searchable and filterable.</p>
        </div>
        {user?.role === 'MANAGER' && (
          <Link
            href="/work-items/new"
            className="rounded-lg bg-gradient-to-br from-accent to-accent-hover px-4 py-2 text-sm font-medium text-white shadow-md shadow-accent/25 transition-all hover:shadow-lg hover:shadow-accent/30 active:scale-[.99]"
          >
            + New Work Item
          </Link>
        )}
      </div>

      <div className="mt-5 rounded-xl border border-border-subtle bg-surface p-3 shadow-sm">
        <WorkItemFiltersBar
          filters={filters}
          onChange={handleFiltersChange}
          showAssigneeFilter={user?.role === 'MANAGER'}
        />
      </div>

      {isError && (
        <p className="mt-6 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/40">
          Couldn&apos;t load work items. Please try again.
        </p>
      )}

      {isLoading && (
        <div className="mt-6 space-y-2">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      )}

      {items && items.length === 0 && (
        <div className="mt-6 flex flex-col items-center rounded-xl border border-dashed border-border-strong py-16 text-center">
          <p className="text-sm font-medium">
            {hasFilters ? 'No matches' : 'Nothing here yet'}
          </p>
          <p className="mt-1 text-sm text-zinc-500">
            {hasFilters
              ? 'No work items match these filters.'
              : user?.role === 'MANAGER'
                ? 'Create the first one above.'
                : 'Nothing assigned to you yet.'}
          </p>
        </div>
      )}

      {items && items.length > 0 && (
        <ul className="mt-6 space-y-2">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={`/work-items/${item.id}`}
                className="flex items-center justify-between gap-4 rounded-xl border border-border-subtle bg-surface px-4 py-3.5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-border-strong hover:shadow-md"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{item.title}</p>
                  <p className="text-xs text-zinc-500">
                    {item.category} · Due {new Date(item.dueDate).toLocaleString()}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
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
            className="rounded-lg border border-border-subtle px-3 py-1.5 font-medium transition-colors hover:border-border-strong hover:bg-surface-hover disabled:opacity-40 disabled:hover:bg-transparent"
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
            className="rounded-lg border border-border-subtle px-3 py-1.5 font-medium transition-colors hover:border-border-strong hover:bg-surface-hover disabled:opacity-40 disabled:hover:bg-transparent"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
