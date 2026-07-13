'use client';

import Link from 'next/link';
import { useWorkItems } from '@/hooks/use-work-items';
import { StatTile } from '@/components/stat-tile';

function isToday(iso: string): boolean {
  return new Date(iso).toDateString() === new Date().toDateString();
}

// Dashboard: headline counts across every work item visible to the current user,
// plus quick links into the Board and Timeline views.
export default function DashboardPage() {
  const { data: items, isLoading, isError } = useWorkItems();

  const stats = items && {
    total: items.length,
    overdue: items.filter((i) => i.isOverdue).length,
    inReview: items.filter((i) => i.status === 'IN_REVIEW').length,
    doneToday: items.filter((i) => i.status === 'DONE' && isToday(i.updatedAt)).length,
  };

  return (
    <div>
      <h1 className="text-lg font-semibold">Dashboard</h1>

      {isLoading && <p className="mt-6 text-sm text-zinc-500">Loading dashboard…</p>}
      {isError && (
        <p className="mt-6 text-sm text-red-600">
          Couldn&apos;t load dashboard data. Please try again.
        </p>
      )}

      {stats && (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatTile label="Total items" value={stats.total} />
          <StatTile label="Overdue" value={stats.overdue} accent="critical" />
          <StatTile label="In review" value={stats.inReview} />
          <StatTile label="Done today" value={stats.doneToday} accent="good" />
        </div>
      )}

      <div className="mt-8 flex gap-4 text-sm">
        <Link href="/board" className="underline">
          View Phase Board →
        </Link>
        <Link href="/timeline" className="underline">
          View Timeline →
        </Link>
      </div>
    </div>
  );
}
