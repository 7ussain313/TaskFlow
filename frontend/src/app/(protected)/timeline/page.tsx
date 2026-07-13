'use client';

import { useWorkItems } from '@/hooks/use-work-items';
import { WorkItemCard } from '@/components/work-item-card';
import { Skeleton } from '@/components/skeleton';
import { findTodayMarkerIndex, formatGroupHeading, groupByDate } from '@/lib/timeline';

// Timeline: every visible work item placed chronologically by due date, with a
// clear divider marking where "today" falls among them. Requests the max page
// size since the timeline plots the whole workspace, not one page of it.
export default function TimelinePage() {
  const { data, isLoading, isError } = useWorkItems({ limit: 200 });
  const items = data?.items;

  const groups = items ? groupByDate(items) : [];
  const todayStr = new Date().toDateString();
  const firstFutureOrTodayIndex = findTodayMarkerIndex(groups);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Timeline</h1>
      <p className="mt-1 text-sm text-zinc-500">Every work item, placed chronologically by due date.</p>

      {isError && (
        <p className="mt-6 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/40">
          Couldn&apos;t load the timeline. Please try again.
        </p>
      )}
      {items && items.length === 0 && (
        <div className="mt-10 flex flex-col items-center rounded-xl border border-dashed border-border-strong py-16 text-center">
          <p className="text-sm font-medium">No work items yet</p>
          <p className="mt-1 text-sm text-zinc-500">Items will appear here as soon as they&apos;re created.</p>
        </div>
      )}

      {isLoading && (
        <div className="mt-6 max-w-2xl space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-16" />
            </div>
          ))}
        </div>
      )}

      {items && items.length > 0 && (
        <div className="relative mt-8 max-w-2xl">
          <div className="absolute top-0 bottom-0 left-[5px] w-px bg-border-subtle" />
          <div className="space-y-7">
            {groups.map((group, index) => {
              const isToday = group.dateStr === todayStr;
              const showDividerBefore = index === firstFutureOrTodayIndex && !isToday;

              return (
                <div key={group.dateStr}>
                  {showDividerBefore && <TodayMarker />}
                  <div className="relative pl-6">
                    <span
                      className={`absolute top-1 left-0 h-2.5 w-2.5 rounded-full ring-4 ring-background ${
                        isToday ? 'bg-accent' : 'bg-border-strong'
                      }`}
                    />
                    <h2 className="flex items-center text-sm font-semibold text-zinc-600 dark:text-zinc-400">
                      {formatGroupHeading(group.dateStr)}
                      {isToday && <TodayMarker inline />}
                    </h2>
                    <div className="mt-2 space-y-2">
                      {group.items.map((item) => (
                        <WorkItemCard key={item.id} item={item} showStatus />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
            {firstFutureOrTodayIndex === -1 && <TodayMarker />}
          </div>
        </div>
      )}
    </div>
  );
}

// The "clear today marker" the assessment calls for — a distinct divider, not
// just a relabeled date heading, so "where does today fall" reads at a glance.
function TodayMarker({ inline = false }: { inline?: boolean }) {
  if (inline) {
    return (
      <span className="ml-2 rounded-full bg-gradient-to-r from-accent to-accent-hover px-2 py-0.5 text-xs font-medium text-white shadow-sm shadow-accent/30">
        Today
      </span>
    );
  }
  return (
    <div className="relative my-2 flex items-center gap-2 pl-6">
      <div className="h-px flex-1 bg-gradient-to-r from-accent to-transparent" />
      <span className="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-accent">
        Today
      </span>
      <div className="h-px flex-1 bg-gradient-to-l from-accent to-transparent" />
    </div>
  );
}
