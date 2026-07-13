import type { Priority } from '@/types/work-item';
import { priorityColorClasses } from '@/lib/status-colors';

// Small colored pill showing a work item's priority (ordinal: color rides the
// sequential ramp low->high, with URGENT breaking into the reserved critical red).
export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ring-black/[.03] dark:ring-white/[.06] ${priorityColorClasses(priority)}`}
    >
      {priority}
    </span>
  );
}
