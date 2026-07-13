import { memo } from 'react';
import Link from 'next/link';
import { StatusBadge } from '@/components/status-badge';
import { PriorityBadge } from '@/components/priority-badge';
import { OverdueBadge } from '@/components/overdue-badge';
import type { WorkItem } from '@/types/work-item';

interface WorkItemCardProps {
  item: WorkItem;
  // Board groups cards by status already, so repeating the status badge on every
  // card there is noise; Timeline mixes every status together chronologically, so
  // it needs the badge for context.
  showStatus?: boolean;
}

// Compact card used by both the Phase Board and the Timeline view. Memoized
// because both views re-render their full item list on every 15s poll — this
// keeps unchanged cards from re-rendering when only a sibling's data changed.
export const WorkItemCard = memo(function WorkItemCard({
  item,
  showStatus = false,
}: WorkItemCardProps) {
  return (
    <Link
      href={`/work-items/${item.id}`}
      className="group block rounded-xl border border-border-subtle bg-surface p-3.5 text-sm shadow-sm transition-all hover:-translate-y-0.5 hover:border-border-strong hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium transition-colors group-hover:text-accent">{item.title}</p>
        {item.isOverdue && <OverdueBadge />}
      </div>
      <p className="mt-1 text-xs text-zinc-500">
        {item.category} · Due {new Date(item.dueDate).toLocaleString()}
      </p>
      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        {showStatus && <StatusBadge status={item.status} />}
        <PriorityBadge priority={item.priority} />
      </div>
      {item.assignees.length > 0 && (
        <div className="mt-2.5 flex items-center -space-x-1.5">
          {item.assignees.slice(0, 4).map((a) => (
            <span
              key={a.id}
              title={a.name}
              className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-surface bg-accent-soft text-[10px] font-semibold text-accent"
            >
              {a.name.charAt(0).toUpperCase()}
            </span>
          ))}
          {item.assignees.length > 4 && (
            <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-surface bg-surface-hover text-[10px] font-semibold text-zinc-500">
              +{item.assignees.length - 4}
            </span>
          )}
        </div>
      )}
    </Link>
  );
});
