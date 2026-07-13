'use client';

import { useState } from 'react';
import type { UseMutationResult } from '@tanstack/react-query';
import {
  useAccept,
  useCancel,
  useReopen,
  useSendBack,
  useStartWork,
  useSubmitReview,
} from '@/hooks/use-workflow';
import { getErrorMessage } from '@/lib/get-error-message';
import type { WorkItem, WorkItemStatus } from '@/types/work-item';

interface WorkflowActionsProps {
  workItemId: string;
  status: WorkItemStatus;
  isManager: boolean;
  isAssignee: boolean;
}

const CANCELLABLE_STATUSES: WorkItemStatus[] = ['BACKLOG', 'ASSIGNED', 'IN_PROGRESS', 'IN_REVIEW'];
const REOPENABLE_STATUSES: WorkItemStatus[] = ['DONE', 'CANCELLED'];

// Renders only the workflow buttons that are actually legal right now, per the
// same state machine WorkflowService enforces server-side (workflow-transitions.ts)
// — this is just UX convenience; the server is the real gatekeeper.
export function WorkflowActions({ workItemId, status, isManager, isAssignee }: WorkflowActionsProps) {
  const [error, setError] = useState<string | null>(null);
  const startWork = useStartWork(workItemId);
  const submitReview = useSubmitReview(workItemId);
  const accept = useAccept(workItemId);
  const sendBack = useSendBack(workItemId);
  const cancel = useCancel(workItemId);
  const reopen = useReopen(workItemId);

  const run = async (mutation: UseMutationResult<WorkItem, unknown, void>) => {
    setError(null);
    try {
      await mutation.mutateAsync();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const actions: { label: string; onClick: () => void; pending: boolean }[] = [];

  if (isAssignee && status === 'ASSIGNED') {
    actions.push({ label: 'Start Work', onClick: () => run(startWork), pending: startWork.isPending });
  }
  if (isAssignee && status === 'IN_PROGRESS') {
    actions.push({
      label: 'Submit for Review',
      onClick: () => run(submitReview),
      pending: submitReview.isPending,
    });
  }
  if (isManager && status === 'IN_REVIEW') {
    actions.push({ label: 'Accept', onClick: () => run(accept), pending: accept.isPending });
    actions.push({ label: 'Send Back', onClick: () => run(sendBack), pending: sendBack.isPending });
  }
  if (isManager && CANCELLABLE_STATUSES.includes(status)) {
    actions.push({ label: 'Cancel', onClick: () => run(cancel), pending: cancel.isPending });
  }
  if (isManager && REOPENABLE_STATUSES.includes(status)) {
    actions.push({ label: 'Reopen', onClick: () => run(reopen), pending: reopen.isPending });
  }

  if (actions.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 max-w-sm rounded border border-black/10 p-4 dark:border-white/15">
      <h2 className="text-sm font-semibold">Workflow actions</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {actions.map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={action.onClick}
            disabled={action.pending}
            className="rounded border border-black/15 px-3 py-1.5 text-sm transition-colors hover:bg-black/[.03] disabled:opacity-50 disabled:hover:bg-transparent dark:border-white/20 dark:hover:bg-white/[.05]"
          >
            {action.pending ? 'Working…' : action.label}
          </button>
        ))}
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
