import { Prisma, Priority, WorkItemStatus } from '@prisma/client';

const SAFE_USER_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
} as const;

// Shared `include` so every query that needs a work item's assignees and any pending
// extension request shapes them the same way — reused by WorkItemsService,
// AssignmentsService, WorkflowService, and ExtensionRequestsService.
export const workItemWithAssigneesInclude = {
  assignments: { include: { user: { select: SAFE_USER_SELECT } } },
  extensionRequests: {
    where: { status: 'PENDING' },
    include: { requestedBy: { select: SAFE_USER_SELECT } },
  },
} satisfies Prisma.WorkItemInclude;

export interface AssigneeSummary {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface PendingExtensionRequest {
  id: string;
  proposedDueDate: Date;
  createdAt: Date;
  requestedBy: AssigneeSummary;
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
  extensionRequests: PendingExtensionRequest[];
}

const TERMINAL_STATUSES: WorkItemStatus[] = ['DONE', 'CANCELLED'];

// A work item is overdue if its due date has passed and it isn't in a terminal status.
export function isOverdue(dueDate: Date, status: WorkItemStatus): boolean {
  return dueDate < new Date() && !TERMINAL_STATUSES.includes(status);
}

// Flattens a Prisma WorkItem (loaded with assignments->user and pending
// extensionRequests) into the API shape: drops the raw join rows in favor of a
// plain `assignees` list and a single `pendingExtensionRequest` (or null), and
// adds the derived `isOverdue` flag.
export function toWorkItemResponse(item: WorkItemWithAssignments) {
  const { assignments, extensionRequests, ...rest } = item;
  return {
    ...rest,
    assignees: assignments.map((a) => a.user),
    pendingExtensionRequest: extensionRequests[0] ?? null,
    isOverdue: isOverdue(rest.dueDate, rest.status),
  };
}
