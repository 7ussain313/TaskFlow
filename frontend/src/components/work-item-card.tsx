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
      className="block rounded border border-black/10 bg-background p-3 text-sm transition-colors hover:border-black/20 dark:border-white/15 dark:hover:border-white/30"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium">{item.title}</p>
        {item.isOverdue && <OverdueBadge />}
      </div>
      <p className="mt-1 text-xs text-zinc-500">
        {item.category} · Due {new Date(item.dueDate).toLocaleString()}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {showStatus && <StatusBadge status={item.status} />}
        <PriorityBadge priority={item.priority} />
        {item.assignees.length > 0 && (
          <span className="text-xs text-zinc-500">
            {item.assignees.map((a) => a.name).join(', ')}
          </span>
        )}
      </div>
    </Link>
  );
});
