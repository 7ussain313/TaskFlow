import type { WorkItem } from '@/types/work-item';

export interface TimelineGroup {
  dateStr: string;
  items: WorkItem[];
}

function dateKey(iso: string): string {
  return new Date(iso).toDateString();
}

// Groups items (already sorted by dueDate asc from the API) into same-day buckets,
// preserving chronological order.
export function groupByDate(items: WorkItem[]): TimelineGroup[] {
  const groups: TimelineGroup[] = [];
  for (const item of items) {
    const key = dateKey(item.dueDate);
    const last = groups[groups.length - 1];
    if (last && last.dateStr === key) {
      last.items.push(item);
    } else {
      groups.push({ dateStr: key, items: [item] });
    }
  }
  return groups;
}

// Human-readable heading for a date group: relative for the near term, otherwise
// a full weekday/month/day/year string.
export function formatGroupHeading(dateStr: string, now: Date = new Date()): string {
  const date = new Date(dateStr);
  const diffDays = Math.round(
    (new Date(date.toDateString()).getTime() - new Date(now.toDateString()).getTime()) /
      (24 * 60 * 60 * 1000),
  );
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// Index of the first group on or after today — where the "Today" divider goes.
// -1 means every item is already in the past, so it trails at the end instead.
export function findTodayMarkerIndex(groups: TimelineGroup[], now: Date = new Date()): number {
  const todayTime = new Date(now.toDateString()).getTime();
  return groups.findIndex((group) => new Date(group.dateStr).getTime() >= todayTime);
}
