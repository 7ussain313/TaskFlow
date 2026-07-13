import type { WorkItemStatus } from '@/types/work-item';
import { statusColorClasses } from '@/lib/status-colors';

const STATUS_LABELS: Record<WorkItemStatus, string> = {
  BACKLOG: 'Backlog',
  ASSIGNED: 'Assigned',
  IN_PROGRESS: 'In Progress',
  IN_REVIEW: 'In Review',
  DONE: 'Done',
  CANCELLED: 'Cancelled',
};

// Small colored pill showing a work item's current workflow status. Color is
// never the only signal — the label always renders alongside it.
export function StatusBadge({ status }: { status: WorkItemStatus }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColorClasses(status)}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
