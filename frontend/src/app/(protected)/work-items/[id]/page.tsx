'use client';

import { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useDeleteWorkItem, useWorkItem } from '@/hooks/use-work-items';
import { StatusBadge } from '@/components/status-badge';
import { PriorityBadge } from '@/components/priority-badge';
import { AssigneesEditor } from '@/components/assignees-editor';
import { getImageUrl } from '@/lib/image-url';

// Read-only detail view of a single work item, plus Manager-only edit/delete/assign
// actions. Workflow actions (start work, submit review, etc.) are added in Phase 6.
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

  if (isLoading) {
    return <p className="text-sm text-zinc-500">Loading…</p>;
  }

  if (isError || !item) {
    return <p className="text-sm text-red-600">Work item not found.</p>;
  }

  const imageUrl = getImageUrl(item.imagePath);

  return (
    <div className="max-w-2xl">
      <Link href="/work-items" className="text-sm text-zinc-500 underline">
        ← Back to work items
      </Link>

      <div className="mt-4 flex items-start justify-between">
        <h1 className="text-xl font-semibold">{item.title}</h1>
        <div className="flex items-center gap-2">
          {item.isOverdue && (
            <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs font-medium text-white">
              Overdue
            </span>
          )}
          <PriorityBadge priority={item.priority} />
          <StatusBadge status={item.status} />
        </div>
      </div>

      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex gap-2">
          <dt className="w-28 text-zinc-500">Category</dt>
          <dd>{item.category}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-28 text-zinc-500">Due</dt>
          <dd>{new Date(item.dueDate).toLocaleString()}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-28 text-zinc-500">Assignees</dt>
          <dd>
            {item.assignees.length > 0
              ? item.assignees.map((a) => a.name).join(', ')
              : 'Unassigned'}
          </dd>
        </div>
      </dl>

      {item.description && (
        <p className="mt-4 whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
          {item.description}
        </p>
      )}

      {imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={`Attachment for ${item.title}`}
          className="mt-4 max-w-sm rounded border border-black/10 dark:border-white/15"
        />
      )}

      {user?.role === 'MANAGER' && (
        <>
          <div className="mt-6 flex gap-3">
            <Link
              href={`/work-items/${item.id}/edit`}
              className="rounded border border-black/15 px-4 py-2 text-sm dark:border-white/20"
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
              className="rounded border border-red-600 px-4 py-2 text-sm text-red-600"
            >
              Delete
            </button>
          </div>

          <div className="mt-6 max-w-sm rounded border border-black/10 p-4 dark:border-white/15">
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
        </>
      )}
    </div>
  );
}
