import type { Priority } from '@/types/work-item';
import { priorityColorClasses } from '@/lib/status-colors';

// Small colored pill showing a work item's priority (ordinal: color rides the
// sequential ramp low->high, with URGENT breaking into the reserved critical red).
export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${priorityColorClasses(priority)}`}
    >
      {priority}
    </span>
  );
}
