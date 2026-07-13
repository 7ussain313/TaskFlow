'use client';

import { useActivityLog } from '@/hooks/use-activity-log';
import { Skeleton } from '@/components/skeleton';

const ACTION_LABELS: Record<string, string> = {
  CREATED: 'created this item',
  UPDATED: 'updated this item',
  ASSIGNED: 'assigned this item',
  REASSIGNED: 'changed the assignees',
  UNASSIGNED: 'removed all assignees',
  START_WORK: 'started work',
  SUBMIT_REVIEW: 'submitted for review',
  ACCEPT: 'accepted the work',
  SEND_BACK: 'sent it back for more work',
  CANCEL: 'cancelled this item',
  REOPENED: 'reopened this item',
  EXTENSION_REQUESTED: 'requested a due-date extension',
  EXTENSION_APPROVED: 'approved the extension request',
  EXTENSION_REJECTED: 'rejected the extension request',
};

// Read-only "who did what and when" feed for one work item, newest first.
export function ActivityLog({ workItemId }: { workItemId: string }) {
  const { data: entries, isLoading, isError } = useActivityLog(workItemId);

  return (
    <div className="mt-4 max-w-sm rounded-2xl border border-border-subtle bg-surface p-5 shadow-sm">
      <h2 className="text-sm font-semibold">Activity</h2>

      {isLoading && (
        <div className="mt-3 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-3/5" />
        </div>
      )}
      {isError && <p className="mt-2 text-sm text-red-600">Couldn&apos;t load activity.</p>}
      {entries && entries.length === 0 && (
        <p className="mt-2 text-sm text-zinc-500">No activity yet.</p>
      )}

      {entries && entries.length > 0 && (
        <ul className="mt-3 space-y-3 border-l-2 border-border-subtle pl-3.5 text-sm">
          {entries.map((entry) => (
            <li key={entry.id} className="relative text-zinc-700 dark:text-zinc-300">
              <span className="absolute top-1.5 -left-[19px] h-2 w-2 rounded-full bg-accent" />
              <span className="font-medium text-foreground">{entry.actor.name}</span>{' '}
              {ACTION_LABELS[entry.action] ?? entry.action.toLowerCase()}
              <div className="text-xs text-zinc-500">
                {new Date(entry.createdAt).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
