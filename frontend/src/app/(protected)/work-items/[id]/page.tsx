'use client';

import { use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useDeleteWorkItem, useWorkItem } from '@/hooks/use-work-items';
import { StatusBadge } from '@/components/status-badge';
import { PriorityBadge } from '@/components/priority-badge';
import { OverdueBadge } from '@/components/overdue-badge';
import { AssigneesEditor } from '@/components/assignees-editor';
import { WorkflowActions } from '@/components/workflow-actions';
import { ExtensionRequestPanel } from '@/components/extension-request-panel';
import { ActivityLog } from '@/components/activity-log';
import { Skeleton } from '@/components/skeleton';
import { useWorkItemImage } from '@/hooks/use-work-item-image';

// Detail view of a single work item: read-only fields, Manager-only edit/delete/
// assign, workflow action buttons (start/submit/accept/etc.), and the due-date
// extension request flow.
export default function WorkItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user } = useAuth();
  const router = useRouter();
  const { data: item, isLoading, isError } = useWorkItem(id);
  const deleteWorkItem = useDeleteWorkItem();
  const imageUrl = useWorkItemImage(item?.id ?? null, Boolean(item?.imagePath));

  if (isLoading) {
    return (
      <div className="max-w-2xl space-y-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-32" />
      </div>
    );
  }

  if (isError || !item) {
    return (
      <div className="rounded-xl border border-dashed border-border-strong py-16 text-center text-sm text-zinc-500">
        Work item not found.
      </div>
    );
  }

  const isManager = user?.role === 'MANAGER';
  const isAssignee = item.assignees.some((a) => a.id === user?.id);

  return (
    <div className="max-w-2xl animate-fade-in">
      <Link
        href="/work-items"
        className="inline-flex items-center gap-1 text-sm text-zinc-500 transition-colors hover:text-foreground"
      >
        ← Back to work items
      </Link>

      <div className="mt-4 rounded-2xl border border-border-subtle bg-surface p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-xl font-semibold tracking-tight">{item.title}</h1>
          <div className="flex shrink-0 items-center gap-2">
            {item.isOverdue && <OverdueBadge />}
            <PriorityBadge priority={item.priority} />
            <StatusBadge status={item.status} />
          </div>
        </div>

        <dl className="mt-5 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-lg bg-surface-hover px-3 py-2">
            <dt className="text-xs text-zinc-500">Category</dt>
            <dd className="mt-0.5 font-medium">{item.category}</dd>
          </div>
          <div className="rounded-lg bg-surface-hover px-3 py-2">
            <dt className="text-xs text-zinc-500">Due</dt>
            <dd className="mt-0.5 font-medium">{new Date(item.dueDate).toLocaleString()}</dd>
          </div>
          <div className="rounded-lg bg-surface-hover px-3 py-2 sm:col-span-2">
            <dt className="text-xs text-zinc-500">Assignees</dt>
            <dd className="mt-0.5 font-medium">
              {item.assignees.length > 0
                ? item.assignees.map((a) => a.name).join(', ')
                : 'Unassigned'}
            </dd>
          </div>
        </dl>

        {item.description && (
          <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
            {item.description}
          </p>
        )}

        {imageUrl && (
          <Image
            src={imageUrl}
            alt={`Attachment for ${item.title}`}
            width={600}
            height={400}
            unoptimized
            className="mt-4 h-auto w-full max-w-sm rounded-xl border border-border-subtle"
          />
        )}

        {user?.role === 'MANAGER' && (
          <div className="mt-5 flex gap-3">
            <Link
              href={`/work-items/${item.id}/edit`}
              className="rounded-lg border border-border-subtle px-4 py-2 text-sm font-medium transition-colors hover:border-border-strong hover:bg-surface-hover"
            >
              Edit
            </Link>
            <button
              type="button"
              onClick={async () => {
                if (!confirm(`Delete "${item.title}"? This cannot be undone.`)) return;
                await deleteWorkItem.mutateAsync(item.id);
                router.push('/work-items');
              }}
              className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/40"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {user?.role === 'MANAGER' && (
        <div className="mt-4 max-w-sm rounded-2xl border border-border-subtle bg-surface p-5 shadow-sm">
          <h2 className="text-sm font-semibold">Assignees</h2>
          <p className="mt-1 text-xs text-zinc-500">
            Assigning moves a Backlog item to Assigned. Removing everyone sends it
            back to Backlog.
          </p>
          <div className="mt-3">
            <AssigneesEditor
              key={item.id}
              workItemId={item.id}
              currentAssigneeIds={item.assignees.map((a) => a.id)}
            />
          </div>
        </div>
      )}

      <WorkflowActions
        workItemId={item.id}
        status={item.status}
        isManager={isManager}
        isAssignee={isAssignee}
      />

      <ExtensionRequestPanel item={item} isManager={isManager} isAssignee={isAssignee} />

      <ActivityLog workItemId={item.id} />
    </div>
  );
}
