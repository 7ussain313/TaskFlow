'use client';

import { useState } from 'react';
import { useMembers } from '@/hooks/use-users';
import { useSetAssignees } from '@/hooks/use-assignments';
import { getErrorMessage } from '@/lib/get-error-message';
import { Skeleton } from '@/components/skeleton';

interface AssigneesEditorProps {
  workItemId: string;
  currentAssigneeIds: string[];
}

// Manager-only checkbox list for assigning/reassigning/unassigning members on a
// work item. Saving replaces the whole list in one PUT — the backend derives any
// resulting status change (e.g. BACKLOG -> ASSIGNED, or falling back to BACKLOG
// if the list ends up empty).
//
// `selected` is seeded once from currentAssigneeIds and is otherwise the local
// source of truth for the editing session — it deliberately does NOT resync from
// props on every render. Work items CRUD's cache invalidation causes a background
// refetch after any save on the page, and resyncing from that would silently wipe
// out an in-progress, not-yet-saved checkbox change if the two happened to overlap.
export function AssigneesEditor({ workItemId, currentAssigneeIds }: AssigneesEditorProps) {
  const { data: members, isLoading } = useMembers();
  const setAssignees = useSetAssignees(workItemId);
  const [selected, setSelected] = useState<string[]>(currentAssigneeIds);
  const [error, setError] = useState<string | null>(null);

  const toggle = (userId: string) => {
    setSelected((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId],
    );
  };

  const save = async () => {
    setError(null);
    try {
      await setAssignees.mutateAsync(selected);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-1.5">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-6 w-3/5" />
      </div>
    );
  }

  return (
    <div>
      <ul className="space-y-1">
        {members?.map((member) => {
          const checked = selected.includes(member.id);
          return (
            <li key={member.id}>
              <label
                className={`flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors ${
                  checked ? 'bg-accent-soft' : 'hover:bg-surface-hover'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(member.id)}
                  disabled={setAssignees.isPending}
                  className="accent-accent"
                />
                <span className={checked ? 'font-medium text-accent' : ''}>{member.name}</span>
                <span className="text-zinc-500">({member.email})</span>
              </label>
            </li>
          );
        })}
      </ul>

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/40">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={save}
        disabled={setAssignees.isPending}
        className="mt-3 rounded-lg border border-border-subtle px-3.5 py-1.5 text-sm font-medium transition-colors hover:border-border-strong hover:bg-surface-hover disabled:opacity-50 disabled:hover:bg-transparent"
      >
        {setAssignees.isPending ? 'Saving…' : 'Save assignees'}
      </button>
    </div>
  );
}
