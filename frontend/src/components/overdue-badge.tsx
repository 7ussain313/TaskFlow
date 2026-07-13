import { OVERDUE_CLASSES } from '@/lib/status-colors';

// Solid pill flagging an overdue work item — deliberately higher-contrast than the
// status/priority pills since it's the one thing on a card that should jump out.
export function OverdueBadge() {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${OVERDUE_CLASSES}`}>
      Overdue
    </span>
  );
}
