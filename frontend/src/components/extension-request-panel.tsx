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
      <div className="mt-6 max-w-sm rounded border border-amber-300 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-950">
        <h2 className="text-sm font-semibold">Pending extension request</h2>
        <p className="mt-1 text-sm">
          {pending.requestedBy.name} proposed{' '}
          <strong>{new Date(pending.proposedDueDate).toLocaleString()}</strong>
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
              className="rounded border border-black/15 px-3 py-1.5 text-sm transition-colors hover:bg-black/[.03] disabled:opacity-50 disabled:hover:bg-transparent dark:border-white/20 dark:hover:bg-white/[.05]"
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
              className="rounded border border-red-600 px-3 py-1.5 text-sm text-red-600 transition-colors hover:bg-red-600/10 disabled:opacity-50 disabled:hover:bg-transparent"
            >
              Reject
            </button>
          </div>
        )}
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
    );
  }

  if (!isAssignee || TERMINAL_STATUSES.includes(item.status)) {
    return null;
  }

  return (
    <div className="mt-6 max-w-sm rounded border border-black/10 p-4 dark:border-white/15">
      <h2 className="text-sm font-semibold">Request more time</h2>
      <div className="mt-3 flex items-center gap-2">
        <input
          type="datetime-local"
          aria-label="Proposed due date"
          value={proposedDate}
          onChange={(e) => setProposedDate(e.target.value)}
          className="rounded border border-black/15 px-2 py-1.5 text-sm dark:border-white/20 dark:bg-transparent"
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
          className="rounded border border-black/15 px-3 py-1.5 text-sm transition-colors hover:bg-black/[.03] disabled:opacity-50 disabled:hover:bg-transparent dark:border-white/20 dark:hover:bg-white/[.05]"
        >
          {requestExtension.isPending ? 'Requesting…' : 'Request'}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
