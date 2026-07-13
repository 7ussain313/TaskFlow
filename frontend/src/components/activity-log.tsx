'use client';

import { useActivityLog } from '@/hooks/use-activity-log';

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
    <div className="mt-6 max-w-sm">
      <h2 className="text-sm font-semibold">Activity</h2>

      {isLoading && <p className="mt-2 text-sm text-zinc-500">Loading activity…</p>}
      {isError && <p className="mt-2 text-sm text-red-600">Couldn&apos;t load activity.</p>}
      {entries && entries.length === 0 && (
        <p className="mt-2 text-sm text-zinc-500">No activity yet.</p>
      )}

      {entries && entries.length > 0 && (
        <ul className="mt-2 space-y-2 text-sm">
          {entries.map((entry) => (
            <li key={entry.id} className="text-zinc-700 dark:text-zinc-300">
              <span className="font-medium">{entry.actor.name}</span>{' '}
              {ACTION_LABELS[entry.action] ?? entry.action.toLowerCase()}
              <span className="text-zinc-500">
                {' '}
                · {new Date(entry.createdAt).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
