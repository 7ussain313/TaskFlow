import { Priority, WorkItemStatus } from '@prisma/client';

export interface AssigneeSummary {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface WorkItemWithAssignments {
  id: string;
  title: string;
  description: string | null;
  priority: Priority;
  category: string;
  dueDate: Date;
  status: WorkItemStatus;
  imagePath: string | null;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  assignments: { user: AssigneeSummary }[];
}

const TERMINAL_STATUSES: WorkItemStatus[] = ['DONE', 'CANCELLED'];

// A work item is overdue if its due date has passed and it isn't in a terminal status.
export function isOverdue(dueDate: Date, status: WorkItemStatus): boolean {
  return dueDate < new Date() && !TERMINAL_STATUSES.includes(status);
}

// Flattens a Prisma WorkItem (loaded with assignments->user) into the API shape:
// drops the raw `assignments` join rows in favor of a plain `assignees` list, and
// adds the derived `isOverdue` flag.
export function toWorkItemResponse(item: WorkItemWithAssignments) {
  const { assignments, ...rest } = item;
  return {
    ...rest,
    assignees: assignments.map((a) => a.user),
    isOverdue: isOverdue(rest.dueDate, rest.status),
  };
}
