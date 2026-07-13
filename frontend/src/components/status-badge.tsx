import type { WorkItemStatus } from '@/types/work-item';
import { statusColorClasses, statusDotClasses } from '@/lib/status-colors';

const STATUS_LABELS: Record<WorkItemStatus, string> = {
  BACKLOG: 'Backlog',
  ASSIGNED: 'Assigned',
  IN_PROGRESS: 'In Progress',
  IN_REVIEW: 'In Review',
  DONE: 'Done',
  CANCELLED: 'Cancelled',
};

// Small colored pill showing a work item's current workflow status. Color is
// never the only signal — the label always renders alongside it, plus a solid
// dot for a legible signal even at a glance (or for a colorblind reader relying
// on the label text rather than the hue).
export function StatusBadge({ status }: { status: WorkItemStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ring-black/[.03] dark:ring-white/[.06] ${statusColorClasses(status)}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${statusDotClasses(status)}`} />
      {STATUS_LABELS[status]}
    </span>
  );
}
