import { Role, WorkItemStatus } from '@prisma/client';

// Every status-changing action except ASSIGN (handled by AssignmentsService in
// Phase 5, since assigning members and moving BACKLOG -> ASSIGNED are the same
// operation) and REOPEN (handled separately below — its target status depends on
// whether the item still has assignees, not a fixed value).
export type WorkflowAction =
  'START_WORK' | 'SUBMIT_REVIEW' | 'ACCEPT' | 'SEND_BACK' | 'CANCEL';

export interface TransitionRule {
  from: WorkItemStatus[];
  to: WorkItemStatus;
  actorRole: Role;
  // Member actions must additionally be performed by someone assigned to the item.
  requireAssignee: boolean;
}

// The single source of truth for legal status transitions — see SYSTEM_DESIGN.md
// "Workflow state machine". WorkflowService rejects anything not listed here.
export const WORKFLOW_TRANSITIONS: Record<WorkflowAction, TransitionRule> = {
  START_WORK: {
    from: ['ASSIGNED'],
    to: 'IN_PROGRESS',
    actorRole: 'MEMBER',
    requireAssignee: true,
  },
  SUBMIT_REVIEW: {
    from: ['IN_PROGRESS'],
    to: 'IN_REVIEW',
    actorRole: 'MEMBER',
    requireAssignee: true,
  },
  ACCEPT: {
    from: ['IN_REVIEW'],
    to: 'DONE',
    actorRole: 'MANAGER',
    requireAssignee: false,
  },
  SEND_BACK: {
    from: ['IN_REVIEW'],
    to: 'IN_PROGRESS',
    actorRole: 'MANAGER',
    requireAssignee: false,
  },
  CANCEL: {
    from: ['BACKLOG', 'ASSIGNED', 'IN_PROGRESS', 'IN_REVIEW'],
    to: 'CANCELLED',
    actorRole: 'MANAGER',
    requireAssignee: false,
  },
};

// Reopen is only legal from a terminal status; its target is computed at runtime.
export const REOPENABLE_FROM: WorkItemStatus[] = ['DONE', 'CANCELLED'];
