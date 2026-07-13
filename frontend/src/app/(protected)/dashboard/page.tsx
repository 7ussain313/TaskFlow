'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useWorkItems } from '@/hooks/use-work-items';
import { StatTile } from '@/components/stat-tile';
import { Skeleton } from '@/components/skeleton';

function isToday(iso: string): boolean {
  return new Date(iso).toDateString() === new Date().toDateString();
}

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

const ICONS = {
  total: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 7h6m-6 4h6" />
    </svg>
  ),
  overdue: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
    </svg>
  ),
  review: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  ),
  done: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  ),
};

// Dashboard: headline counts across every work item visible to the current user,
// plus quick links into the Board and Timeline views. Requests the max page size
// since these counts need to reflect the whole workspace, not one page of it.
export default function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading, isError } = useWorkItems({ limit: 200 });
  const items = data?.items;

  const stats = useMemo(() => {
    if (!items) return null;
    return {
      total: items.length,
      overdue: items.filter((i) => i.isOverdue).length,
      inReview: items.filter((i) => i.status === 'IN_REVIEW').length,
      doneToday: items.filter((i) => i.status === 'DONE' && isToday(i.updatedAt)).length,
    };
  }, [items]);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">
        {greeting()}, {user?.name.split(' ')[0]}
      </h1>
      <p className="mt-1 text-sm text-zinc-500">Here&apos;s where things stand right now.</p>

      {isError && (
        <p className="mt-6 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/40">
          Couldn&apos;t load dashboard data. Please try again.
        </p>
      )}

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {isLoading || !stats ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[84px]" />)
        ) : (
          <>
            <StatTile label="Total items" value={stats.total} icon={ICONS.total} />
            <StatTile
              label="Overdue"
              value={stats.overdue}
              accent="critical"
              icon={ICONS.overdue}
            />
            <StatTile label="In review" value={stats.inReview} icon={ICONS.review} />
            <StatTile label="Done today" value={stats.doneToday} accent="good" icon={ICONS.done} />
          </>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          href="/board"
          className="group flex items-center justify-between rounded-xl border border-border-subtle bg-surface p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-border-strong hover:shadow-md"
        >
          <div>
            <p className="font-medium">Phase Board</p>
            <p className="mt-0.5 text-sm text-zinc-500">Every item grouped by status</p>
          </div>
          <span className="text-accent transition-transform group-hover:translate-x-1">→</span>
        </Link>
        <Link
          href="/timeline"
          className="group flex items-center justify-between rounded-xl border border-border-subtle bg-surface p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-border-strong hover:shadow-md"
        >
          <div>
            <p className="font-medium">Timeline</p>
            <p className="mt-0.5 text-sm text-zinc-500">Chronological view with a Today marker</p>
          </div>
          <span className="text-accent transition-transform group-hover:translate-x-1">→</span>
        </Link>
      </div>
    </div>
  );
}
