import { OVERDUE_CLASSES } from '@/lib/status-colors';

// Solid pill flagging an overdue work item — deliberately higher-contrast than the
// status/priority pills since it's the one thing on a card that should jump out.
export function OverdueBadge() {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm shadow-status-overdue/30 ${OVERDUE_CLASSES}`}
    >
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
      Overdue
    </span>
  );
}
