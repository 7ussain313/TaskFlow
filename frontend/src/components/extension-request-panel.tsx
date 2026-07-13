'use client';

import { useState } from 'react';
import {
  useApproveExtension,
  useRejectExtension,
  useRequestExtension,
} from '@/hooks/use-extension-requests';
import { getErrorMessage } from '@/lib/get-error-message';
import type { WorkItem } from '@/types/work-item';

interface ExtensionRequestPanelProps {
  item: WorkItem;
  isManager: boolean;
  isAssignee: boolean;
}

const TERMINAL_STATUSES = ['DONE', 'CANCELLED'];

// Member (assignee) side: propose a new due date. Manager side: approve/reject
// whatever is currently pending. Hidden entirely if neither role has anything to do.
export function ExtensionRequestPanel({ item, isManager, isAssignee }: ExtensionRequestPanelProps) {
  const [proposedDate, setProposedDate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const requestExtension = useRequestExtension(item.id);
  const approveExtension = useApproveExtension();
  const rejectExtension = useRejectExtension();

  const pending = item.pendingExtensionRequest;

  if (pending) {
    return (
      <div className="mt-4 max-w-sm rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm dark:border-amber-900 dark:bg-amber-950/40">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold text-amber-900 dark:text-amber-200">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          Pending extension request
        </h2>
        <p className="mt-1.5 text-sm text-amber-900/80 dark:text-amber-200/80">
          {pending.requestedBy.name} proposed{' '}
          <strong className="font-semibold">{new Date(pending.proposedDueDate).toLocaleString()}</strong>
        </p>
        {isManager && (
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={async () => {
                setError(null);
                try {
                  await approveExtension.mutateAsync(pending.id);
                } catch (err) {
                  setError(getErrorMessage(err));
                }
              }}
              disabled={approveExtension.isPending || rejectExtension.isPending}
              className="rounded-lg bg-gradient-to-br from-accent to-accent-hover px-3.5 py-1.5 text-sm font-medium text-white shadow-sm shadow-accent/25 transition-all hover:shadow-md disabled:opacity-50 disabled:shadow-none"
            >
              Approve
            </button>
            <button
              type="button"
              onClick={async () => {
                setError(null);
                try {
                  await rejectExtension.mutateAsync(pending.id);
                } catch (err) {
                  setError(getErrorMessage(err));
                }
              }}
              disabled={approveExtension.isPending || rejectExtension.isPending}
              className="rounded-lg border border-red-200 px-3.5 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 disabled:hover:bg-transparent dark:border-red-900 dark:hover:bg-red-950/40"
            >
              Reject
            </button>
          </div>
        )}
        {error && (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/40">
            {error}
          </p>
        )}
      </div>
    );
  }

  if (!isAssignee || TERMINAL_STATUSES.includes(item.status)) {
    return null;
  }

  return (
    <div className="mt-4 max-w-sm rounded-2xl border border-border-subtle bg-surface p-5 shadow-sm">
      <h2 className="text-sm font-semibold">Request more time</h2>
      <div className="mt-3 flex items-center gap-2">
        <input
          type="datetime-local"
          aria-label="Proposed due date"
          value={proposedDate}
          onChange={(e) => setProposedDate(e.target.value)}
          className="rounded-lg border border-border-subtle bg-transparent px-2.5 py-1.5 text-sm outline-none transition-colors focus:border-accent"
        />
        <button
          type="button"
          onClick={async () => {
            setError(null);
            try {
              await requestExtension.mutateAsync(new Date(proposedDate).toISOString());
              setProposedDate('');
            } catch (err) {
              setError(getErrorMessage(err));
            }
          }}
          disabled={!proposedDate || requestExtension.isPending}
          className="rounded-lg border border-border-subtle px-3.5 py-1.5 text-sm font-medium transition-colors hover:border-border-strong hover:bg-surface-hover disabled:opacity-50 disabled:hover:bg-transparent"
        >
          {requestExtension.isPending ? 'Requesting…' : 'Request'}
        </button>
      </div>
      {error && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/40">
          {error}
        </p>
      )}
    </div>
  );
}
