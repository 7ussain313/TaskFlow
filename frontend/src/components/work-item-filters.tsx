'use client';

import { useEffect, useRef, useState } from 'react';
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

const SORT_BY_OPTIONS: { value: NonNullable<WorkItemFilters['sortBy']>; label: string }[] = [
  { value: 'dueDate', label: 'Due date' },
  { value: 'priority', label: 'Priority' },
  { value: 'status', label: 'Status' },
];

// Manager can filter by phase (status), assignee, and priority — all three narrow
// on top of the server-enforced visibility scope, never in place of it.
export function WorkItemFiltersBar({ filters, onChange, showAssigneeFilter }: WorkItemFiltersBarProps) {
  const { data: members } = useMembers({ enabled: showAssigneeFilter });
  const hasActiveFilters = Boolean(
    filters.status || filters.assigneeId || filters.priority || filters.search,
  );

  // Local echo of the search box so typing feels instant while the actual filter
  // (and the network request it triggers) only updates after a short pause. Refs
  // hold the latest filters/onChange, updated post-render (never mutated during
  // render itself), so the debounce effect only needs to depend on searchInput.
  const filtersRef = useRef(filters);
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    filtersRef.current = filters;
    onChangeRef.current = onChange;
  });

  const [searchInput, setSearchInput] = useState(filters.search ?? '');
  useEffect(() => {
    const handle = setTimeout(() => {
      const current = filtersRef.current;
      if (searchInput !== (current.search ?? '')) {
        onChangeRef.current({ ...current, search: searchInput || undefined });
      }
    }, 300);
    return () => clearTimeout(handle);
  }, [searchInput]);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <input
        type="text"
        aria-label="Search title or description"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        placeholder="Search title or description…"
        className="rounded border border-black/15 px-2 py-1.5 text-sm dark:border-white/20 dark:bg-transparent"
      />

      <select
        aria-label="Filter by phase"
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
        aria-label="Filter by priority"
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
          aria-label="Filter by assignee"
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

      <select
        aria-label="Sort by"
        value={filters.sortBy ?? 'dueDate'}
        onChange={(e) =>
          onChange({ ...filters, sortBy: e.target.value as WorkItemFilters['sortBy'] })
        }
        className="rounded border border-black/15 px-2 py-1.5 text-sm dark:border-white/20 dark:bg-transparent"
      >
        {SORT_BY_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            Sort: {option.label}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={() =>
          onChange({ ...filters, sortOrder: filters.sortOrder === 'desc' ? 'asc' : 'desc' })
        }
        title="Toggle sort direction"
        className="rounded border border-black/15 px-2 py-1.5 text-sm dark:border-white/20 dark:bg-transparent"
      >
        {filters.sortOrder === 'desc' ? '↓ Desc' : '↑ Asc'}
      </button>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={() => {
            setSearchInput('');
            onChange({
              ...filters,
              status: undefined,
              assigneeId: undefined,
              priority: undefined,
              search: undefined,
            });
          }}
          className="text-sm text-zinc-500 underline"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
