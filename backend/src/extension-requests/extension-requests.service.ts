import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { AuthUser } from '../common/types/auth-user.type';
import {
  toWorkItemResponse,
  workItemWithAssigneesInclude,
} from '../common/utils/work-item-response.util';
import { RequestExtensionDto } from './dto/request-extension.dto';

const TERMINAL_STATUSES = ['DONE', 'CANCELLED'];

@Injectable()
export class ExtensionRequestsService {
  constructor(private readonly prisma: PrismaService) {}

  // Loads a work item's current state and re-shapes it into the standard API
  // response — used after every mutation below so the caller always gets back a
  // fresh, consistent view (including the now-current pendingExtensionRequest).
  private async loadWorkItemResponse(workItemId: string) {
    const item = await this.prisma.workItem.findUniqueOrThrow({
      where: { id: workItemId },
      include: workItemWithAssigneesInclude,
    });
    return toWorkItemResponse(item);
  }

  // Member (must be an assignee) proposes a new due date. Only one pending request
  // is allowed per item at a time — approve/reject it before requesting another.
  async request(workItemId: string, dto: RequestExtensionDto, user: AuthUser) {
    const item = await this.prisma.workItem.findUnique({
      where: { id: workItemId },
      include: { assignments: true },
    });
    if (!item) {
      throw new NotFoundException('Work item not found');
    }
    if (!item.assignments.some((a) => a.userId === user.id)) {
      throw new ForbiddenException('You are not assigned to this work item');
    }
    if (TERMINAL_STATUSES.includes(item.status)) {
      throw new ConflictException(
        'Cannot request an extension on a finished or cancelled item',
      );
    }

    const existingPending = await this.prisma.extensionRequest.findFirst({
      where: { workItemId, status: 'PENDING' },
    });
    if (existingPending) {
      throw new ConflictException(
        'An extension request is already pending for this item',
      );
    }

    await this.prisma.extensionRequest.create({
      data: {
        workItemId,
        requestedById: user.id,
        proposedDueDate: new Date(dto.proposedDueDate),
      },
    });

    await this.prisma.activityLog.create({
      data: {
        workItemId,
        actorId: user.id,
        action: 'EXTENSION_REQUESTED',
        metadata: { proposedDueDate: dto.proposedDueDate },
      },
    });

    return this.loadWorkItemResponse(workItemId);
  }

  // Manager approves: the work item's due date moves to the proposed date.
  async approve(extensionRequestId: string, user: AuthUser) {
    const request = await this.findPendingOrThrow(extensionRequestId);

    // The array form of $transaction sends both statements as a single round-trip,
    // so it isn't subject to the multi-await connection-acquisition timeout that
    // the interactive callback form can hit (see AssignmentsService).
    await this.prisma.$transaction([
      this.prisma.extensionRequest.update({
        where: { id: extensionRequestId },
        data: {
          status: 'APPROVED',
          decidedById: user.id,
          decidedAt: new Date(),
        },
      }),
      this.prisma.workItem.update({
        where: { id: request.workItemId },
        data: { dueDate: request.proposedDueDate },
      }),
    ]);

    await this.prisma.activityLog.create({
      data: {
        workItemId: request.workItemId,
        actorId: user.id,
        action: 'EXTENSION_APPROVED',
        metadata: { newDueDate: request.proposedDueDate.toISOString() },
      },
    });

    return this.loadWorkItemResponse(request.workItemId);
  }

  // Manager rejects: the request is marked REJECTED, the work item is untouched.
  async reject(extensionRequestId: string, user: AuthUser) {
    const request = await this.findPendingOrThrow(extensionRequestId);

    await this.prisma.extensionRequest.update({
      where: { id: extensionRequestId },
      data: { status: 'REJECTED', decidedById: user.id, decidedAt: new Date() },
    });

    await this.prisma.activityLog.create({
      data: {
        workItemId: request.workItemId,
        actorId: user.id,
        action: 'EXTENSION_REJECTED',
      },
    });

    return this.loadWorkItemResponse(request.workItemId);
  }

  // Shared lookup for approve/reject: 404 if the request doesn't exist, 409 if it's
  // already been decided (approve/reject only make sense on a PENDING request).
  private async findPendingOrThrow(extensionRequestId: string) {
    const request = await this.prisma.extensionRequest.findUnique({
      where: { id: extensionRequestId },
    });
    if (!request) {
      throw new NotFoundException('Extension request not found');
    }
    if (request.status !== 'PENDING') {
      throw new ConflictException(
        'This extension request has already been decided',
      );
    }
    return request;
  }
}
