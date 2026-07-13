'use client';

import { useMembers } from '@/hooks/use-users';
import type { WorkItemFilters } from '@/hooks/use-work-items';

interface WorkItemFiltersBarProps {
  filters: WorkItemFilters;
  onChange: (filters: WorkItemFilters) => void;
  // Assignee filter only makes sense for a Manager — a Member's list is already
  // scoped to their own items, so filtering it by another assignee.
  showAssigneeFilter: boolean;
}

const STATUS_OPTIONS: WorkItemFilters['status'][] = [
  'BACKLOG',
  'ASSIGNED',
  'IN_PROGRESS',
  'IN_REVIEW',
  'DONE',
  'CANCELLED',
];

const PRIORITY_OPTIONS: WorkItemFilters['priority'][] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

// Manager can filter by phase (status), assignee, and priority — all three narrow
// on top of the server-enforced visibility scope, never in place of it.
export function WorkItemFiltersBar({ filters, onChange, showAssigneeFilter }: WorkItemFiltersBarProps) {
  const { data: members } = useMembers({ enabled: showAssigneeFilter });
  const hasActiveFilters = Boolean(filters.status || filters.assigneeId || filters.priority);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        value={filters.status ?? ''}
        onChange={(e) =>
          onChange({ ...filters, status: (e.target.value || undefined) as WorkItemFilters['status'] })
        }
        className="rounded border border-black/15 px-2 py-1.5 text-sm dark:border-white/20 dark:bg-transparent"
      >
        <option value="">All phases</option>
        {STATUS_OPTIONS.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>

      <select
        value={filters.priority ?? ''}
        onChange={(e) =>
          onChange({ ...filters, priority: (e.target.value || undefined) as WorkItemFilters['priority'] })
        }
        className="rounded border border-black/15 px-2 py-1.5 text-sm dark:border-white/20 dark:bg-transparent"
      >
        <option value="">All priorities</option>
        {PRIORITY_OPTIONS.map((priority) => (
          <option key={priority} value={priority}>
            {priority}
          </option>
        ))}
      </select>

      {showAssigneeFilter && (
        <select
          value={filters.assigneeId ?? ''}
          onChange={(e) => onChange({ ...filters, assigneeId: e.target.value || undefined })}
          className="rounded border border-black/15 px-2 py-1.5 text-sm dark:border-white/20 dark:bg-transparent"
        >
          <option value="">All assignees</option>
          {members?.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name}
            </option>
          ))}
        </select>
      )}

      {hasActiveFilters && (
        <button
          type="button"
          onClick={() => onChange({})}
          className="text-sm text-zinc-500 underline"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
