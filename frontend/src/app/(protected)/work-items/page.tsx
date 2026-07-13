'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useWorkItems } from '@/hooks/use-work-items';
import { StatusBadge } from '@/components/status-badge';
import { PriorityBadge } from '@/components/priority-badge';
import { OverdueBadge } from '@/components/overdue-badge';

// Simple list of every work item visible to the current user (API-scoped by role).
export default function WorkItemsPage() {
  const { user } = useAuth();
  const { data: items, isLoading, isError } = useWorkItems();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Work Items</h1>
        {user?.role === 'MANAGER' && (
          <Link
            href="/work-items/new"
            className="rounded bg-foreground px-4 py-2 text-sm font-medium text-background"
          >
            New Work Item
          </Link>
        )}
      </div>

      {isLoading && <p className="mt-6 text-sm text-zinc-500">Loading work items…</p>}

      {isError && (
        <p className="mt-6 text-sm text-red-600">
          Couldn&apos;t load work items. Please try again.
        </p>
      )}

      {items && items.length === 0 && (
        <p className="mt-6 text-sm text-zinc-500">
          No work items yet.{' '}
          {user?.role === 'MANAGER' ? 'Create the first one above.' : 'Nothing assigned to you yet.'}
        </p>
      )}

      {items && items.length > 0 && (
        <ul className="mt-6 divide-y divide-black/10 dark:divide-white/15">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={`/work-items/${item.id}`}
                className="flex items-center justify-between gap-4 py-3 hover:bg-black/[.02] dark:hover:bg-white/[.03]"
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
    </div>
  );
}
