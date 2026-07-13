import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { WorkItemStatus } from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service';
import { UsersService } from '../users/users.service';
import {
  toWorkItemResponse,
  workItemWithAssigneesInclude,
} from '../common/utils/work-item-response.util';
import { SetAssigneesDto } from './dto/set-assignees.dto';

const TERMINAL_STATUSES: WorkItemStatus[] = ['DONE', 'CANCELLED'];

@Injectable()
export class AssignmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  // Works out what the item's status should become after this assignee change, per
  // the SYSTEM_DESIGN.md business rules: first assignment moves BACKLOG -> ASSIGNED,
  // emptying the assignee list on an active item falls back to BACKLOG, and terminal
  // statuses (DONE/CANCELLED) are never touched by reassignment.
  private resolveStatus(
    currentStatus: WorkItemStatus,
    assigneeCount: number,
  ): WorkItemStatus {
    if (TERMINAL_STATUSES.includes(currentStatus)) {
      return currentStatus;
    }
    if (assigneeCount === 0) {
      return 'BACKLOG';
    }
    if (currentStatus === 'BACKLOG') {
      return 'ASSIGNED';
    }
    return currentStatus;
  }

  // Picks a human-readable activity log action name for the transition that happened.
  private resolveAction(
    currentStatus: WorkItemStatus,
    nextStatus: WorkItemStatus,
    assigneeCount: number,
  ): string {
    if (
      assigneeCount === 0 &&
      nextStatus === 'BACKLOG' &&
      currentStatus !== 'BACKLOG'
    ) {
      return 'UNASSIGNED';
    }
    if (currentStatus === 'BACKLOG' && nextStatus === 'ASSIGNED') {
      return 'ASSIGNED';
    }
    return 'REASSIGNED';
  }

  // Replaces a work item's assignee list (Manager-only, enforced at the controller)
  // and applies the resulting status change in a single transaction.
  async setAssignees(
    workItemId: string,
    dto: SetAssigneesDto,
    actorId: string,
  ) {
    const workItem = await this.prisma.workItem.findUnique({
      where: { id: workItemId },
      select: { status: true },
    });
    if (!workItem) {
      throw new NotFoundException('Work item not found');
    }

    const uniqueIds = Array.from(new Set(dto.userIds));

    if (uniqueIds.length > 0) {
      const members = await this.usersService.findMembersByIds(uniqueIds);
      if (members.length !== uniqueIds.length) {
        const foundIds = new Set(members.map((m) => m.id));
        const invalidIds = uniqueIds.filter((id) => !foundIds.has(id));
        throw new BadRequestException(
          `The following ids are not valid Member accounts: ${invalidIds.join(', ')}`,
        );
      }
    }

    const nextStatus = this.resolveStatus(workItem.status, uniqueIds.length);
    const action = this.resolveAction(
      workItem.status,
      nextStatus,
      uniqueIds.length,
    );

    const updated = await this.prisma.$transaction(
      async (tx) => {
        await tx.assignment.deleteMany({ where: { workItemId } });
        if (uniqueIds.length > 0) {
          await tx.assignment.createMany({
            data: uniqueIds.map((userId) => ({ workItemId, userId })),
            // Guards against a race between two overlapping requests for the same
            // work item (double-click, retry, two tabs) — without this, the second
            // transaction's insert can hit the (workItemId, userId) unique constraint
            // left by the first and crash with a raw 500 instead of just no-op'ing.
            skipDuplicates: true,
          });
        }
        return tx.workItem.update({
          where: { id: workItemId },
          data: { status: nextStatus },
          include: workItemWithAssigneesInclude,
        });
      },
      // Prisma's defaults (2s to acquire a connection, 5s to run) are too tight for
      // Neon's serverless connection latency observed in practice — widen both so a
      // slow-but-healthy connection doesn't surface as a hard 500.
      { maxWait: 10000, timeout: 10000 },
    );

    await this.prisma.activityLog.create({
      data: {
        workItemId,
        actorId,
        action,
        metadata: {
          assigneeIds: uniqueIds,
          statusBefore: workItem.status,
          statusAfter: nextStatus,
        },
      },
    });

    return toWorkItemResponse(updated);
  }
}
