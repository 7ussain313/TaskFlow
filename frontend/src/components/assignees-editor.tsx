'use client';

import { useState } from 'react';
import { useMembers } from '@/hooks/use-users';
import { useSetAssignees } from '@/hooks/use-assignments';
import { getErrorMessage } from '@/lib/get-error-message';

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
    return <p className="text-sm text-zinc-500">Loading members…</p>;
  }

  return (
    <div>
      <ul className="space-y-1">
        {members?.map((member) => (
          <li key={member.id}>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={selected.includes(member.id)}
                onChange={() => toggle(member.id)}
                disabled={setAssignees.isPending}
              />
              {member.name} <span className="text-zinc-500">({member.email})</span>
            </label>
          </li>
        ))}
      </ul>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <button
        type="button"
        onClick={save}
        disabled={setAssignees.isPending}
        className="mt-3 rounded border border-black/15 px-3 py-1.5 text-sm dark:border-white/20 disabled:opacity-50"
      >
        {setAssignees.isPending ? 'Saving…' : 'Save assignees'}
      </button>
    </div>
  );
}
