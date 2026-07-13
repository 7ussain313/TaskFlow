import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { WorkItemStatus } from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service';
import { AuthUser } from '../common/types/auth-user.type';
import {
  toWorkItemResponse,
  workItemWithAssigneesInclude,
} from '../common/utils/work-item-response.util';
import {
  REOPENABLE_FROM,
  WORKFLOW_TRANSITIONS,
  WorkflowAction,
} from './workflow-transitions';

@Injectable()
export class WorkflowService {
  constructor(private readonly prisma: PrismaService) {}

  // Loads the work item with just enough data (assignee ids) to check permissions.
  private async loadWorkItemOrThrow(id: string) {
    const item = await this.prisma.workItem.findUnique({
      where: { id },
      include: { assignments: true },
    });
    if (!item) {
      throw new NotFoundException('Work item not found');
    }
    return item;
  }

  // Applies the new status and writes the activity log entry — the one place every
  // workflow action funnels through, so every mutation is guaranteed to be logged.
  private async finalizeTransition(
    workItemId: string,
    fromStatus: WorkItemStatus,
    toStatus: WorkItemStatus,
    action: string,
    actorId: string,
  ) {
    const updated = await this.prisma.workItem.update({
      where: { id: workItemId },
      data: { status: toStatus },
      include: workItemWithAssigneesInclude,
    });

    await this.prisma.activityLog.create({
      data: {
        workItemId,
        actorId,
        action,
        metadata: { statusBefore: fromStatus, statusAfter: toStatus },
      },
    });

    return toWorkItemResponse(updated);
  }

  // Shared logic for every table-driven action (everything except REOPEN): checks
  // role, assignee membership, and that the current status legally allows this
  // action, then hands off to finalizeTransition.
  private async applyTransition(
    id: string,
    action: WorkflowAction,
    user: AuthUser,
  ) {
    const rule = WORKFLOW_TRANSITIONS[action];
    const item = await this.loadWorkItemOrThrow(id);

    if (user.role !== rule.actorRole) {
      throw new ForbiddenException(
        `Only a ${rule.actorRole} can perform this action`,
      );
    }
    if (
      rule.requireAssignee &&
      !item.assignments.some((a) => a.userId === user.id)
    ) {
      throw new ForbiddenException('You are not assigned to this work item');
    }
    if (!rule.from.includes(item.status)) {
      throw new ConflictException(
        `Cannot perform this action while the item is ${item.status}`,
      );
    }

    return this.finalizeTransition(id, item.status, rule.to, action, user.id);
  }

  // Member (assignee): ASSIGNED -> IN_PROGRESS.
  startWork(id: string, user: AuthUser) {
    return this.applyTransition(id, 'START_WORK', user);
  }

  // Member (assignee): IN_PROGRESS -> IN_REVIEW.
  submitReview(id: string, user: AuthUser) {
    return this.applyTransition(id, 'SUBMIT_REVIEW', user);
  }

  // Manager: IN_REVIEW -> DONE.
  accept(id: string, user: AuthUser) {
    return this.applyTransition(id, 'ACCEPT', user);
  }

  // Manager: IN_REVIEW -> IN_PROGRESS (work needs more changes).
  sendBack(id: string, user: AuthUser) {
    return this.applyTransition(id, 'SEND_BACK', user);
  }

  // Manager: any non-terminal status -> CANCELLED.
  cancel(id: string, user: AuthUser) {
    return this.applyTransition(id, 'CANCEL', user);
  }

  // Manager: DONE/CANCELLED -> ASSIGNED (if it still has assignees) or BACKLOG.
  // Not table-driven like the others because its target status is dynamic.
  async reopen(id: string, user: AuthUser) {
    const item = await this.loadWorkItemOrThrow(id);

    if (user.role !== 'MANAGER') {
      throw new ForbiddenException('Only a MANAGER can perform this action');
    }
    if (!REOPENABLE_FROM.includes(item.status)) {
      throw new ConflictException(
        `Cannot reopen an item that is currently ${item.status}`,
      );
    }

    const toStatus: WorkItemStatus =
      item.assignments.length > 0 ? 'ASSIGNED' : 'BACKLOG';
    return this.finalizeTransition(
      id,
      item.status,
      toStatus,
      'REOPENED',
      user.id,
    );
  }
}
