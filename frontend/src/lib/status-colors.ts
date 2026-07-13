import type { Priority, WorkItemStatus } from '@/types/work-item';

// Tailwind class names must be static string literals for the build-time scanner
// to find them — template-literal interpolation (`bg-[${hex}]`) would silently
// produce unstyled elements. The actual hex values live in globals.css as theme
// tokens (validated reference palette from the dataviz skill); these are just the
// utility classes that reference those tokens.
const STATUS_CLASSES: Record<WorkItemStatus, string> = {
  BACKLOG: 'bg-status-backlog/15 text-status-backlog',
  ASSIGNED: 'bg-status-assigned/15 text-status-assigned',
  IN_PROGRESS: 'bg-status-in-progress/15 text-status-in-progress',
  IN_REVIEW: 'bg-status-in-review/15 text-status-in-review',
  DONE: 'bg-status-done/15 text-status-done',
  CANCELLED: 'bg-status-cancelled/15 text-status-cancelled',
};

// Solid (not tinted) version of the same per-status color, for the small dot
// indicator inside StatusBadge — reuses the exact same hue so the dot and the
// pill's text color never drift apart.
const STATUS_DOT_CLASSES: Record<WorkItemStatus, string> = {
  BACKLOG: 'bg-status-backlog',
  ASSIGNED: 'bg-status-assigned',
  IN_PROGRESS: 'bg-status-in-progress',
  IN_REVIEW: 'bg-status-in-review',
  DONE: 'bg-status-done',
  CANCELLED: 'bg-status-cancelled',
};

// Priority rides the sequential ramp (light->dark = low->high severity); URGENT
// breaks into the reserved "critical" red to grab attention, same token as Overdue.
const PRIORITY_CLASSES: Record<Priority, string> = {
  LOW: 'bg-priority-low/15 text-priority-low',
  MEDIUM: 'bg-priority-medium/15 text-priority-medium',
  HIGH: 'bg-priority-high/15 text-priority-high',
  URGENT: 'bg-priority-urgent/15 text-priority-urgent',
};

export function statusColorClasses(status: WorkItemStatus): string {
  return STATUS_CLASSES[status];
}

export function statusDotClasses(status: WorkItemStatus): string {
  return STATUS_DOT_CLASSES[status];
}

export function priorityColorClasses(priority: Priority): string {
  return PRIORITY_CLASSES[priority];
}

export const OVERDUE_CLASSES = 'bg-status-overdue text-white';
