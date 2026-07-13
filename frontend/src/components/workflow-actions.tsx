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

type ButtonVariant = 'primary' | 'secondary' | 'danger';

const ACTION_BUTTON_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'rounded-lg bg-gradient-to-br from-accent to-accent-hover px-3.5 py-1.5 text-sm font-medium text-white shadow-sm shadow-accent/25 transition-all hover:shadow-md hover:shadow-accent/30 active:scale-[.98] disabled:opacity-50 disabled:shadow-none',
  secondary:
    'rounded-lg border border-border-subtle px-3.5 py-1.5 text-sm font-medium transition-colors hover:border-border-strong hover:bg-surface-hover disabled:opacity-50 disabled:hover:bg-transparent',
  danger:
    'rounded-lg border border-red-200 px-3.5 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 disabled:hover:bg-transparent dark:border-red-900 dark:hover:bg-red-950/40',
};

// Cancel is the one destructive action here — everything else that changes the
// item's phase forward (or reopens it) reads as the primary call to action.
function buttonVariant(label: string): ButtonVariant {
  if (label === 'Cancel') return 'danger';
  if (label === 'Send Back') return 'secondary';
  return 'primary';
}

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
    <div className="mt-4 max-w-sm rounded-2xl border border-border-subtle bg-surface p-5 shadow-sm">
      <h2 className="text-sm font-semibold">Workflow actions</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {actions.map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={action.onClick}
            disabled={action.pending}
            className={ACTION_BUTTON_CLASSES[buttonVariant(action.label)]}
          >
            {action.pending ? 'Working…' : action.label}
          </button>
        ))}
      </div>
      {error && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/40">
          {error}
        </p>
      )}
    </div>
  );
}
