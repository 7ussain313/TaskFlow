import type { Priority } from '@/types/work-item';

const PRIORITY_STYLES: Record<Priority, string> = {
  LOW: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300',
  MEDIUM: 'bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-200',
  HIGH: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200',
  URGENT: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200',
};

// Small colored pill showing a work item's priority.
export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_STYLES[priority]}`}>
      {priority}
    </span>
  );
}
