import { Injectable, NotFoundException } from '@nestjs/common';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service';
import { AuthUser } from '../common/types/auth-user.type';
import { toWorkItemResponse } from '../common/utils/work-item-response.util';
import { CreateWorkItemDto } from './dto/create-work-item.dto';
import { UpdateWorkItemDto } from './dto/update-work-item.dto';

// Shared `include` so every read query returns assignees in the same shape.
const WITH_ASSIGNEES = {
  assignments: {
    include: {
      user: { select: { id: true, name: true, email: true, role: true } },
    },
  },
} satisfies Prisma.WorkItemInclude;

@Injectable()
export class WorkItemsService {
  constructor(private readonly prisma: PrismaService) {}

  // Builds the Prisma `where` clause enforcing "Manager sees all, Member sees only
  // items they're assigned to" — done here so every query path stays scoped.
  private visibilityFilter(user: AuthUser): Prisma.WorkItemWhereInput {
    if (user.role === 'MANAGER') {
      return {};
    }
    return { assignments: { some: { userId: user.id } } };
  }

  // Lists work items visible to the caller (all for Manager, own assignments for Member).
  async findAllForUser(user: AuthUser) {
    const items = await this.prisma.workItem.findMany({
      where: this.visibilityFilter(user),
      include: WITH_ASSIGNEES,
      orderBy: { dueDate: 'asc' },
    });
    return items.map(toWorkItemResponse);
  }

  // Fetches one item, scoped the same way as the list — a Member asking for an item
  // they can't see gets 404, not 403, so we don't confirm the item even exists to them.
  async findOneForUser(id: string, user: AuthUser) {
    const item = await this.prisma.workItem.findFirst({
      where: { id, ...this.visibilityFilter(user) },
      include: WITH_ASSIGNEES,
    });
    if (!item) {
      throw new NotFoundException('Work item not found');
    }
    return toWorkItemResponse(item);
  }

  // Creates a new work item in BACKLOG, owned by the Manager who created it.
  async create(
    dto: CreateWorkItemDto,
    createdById: string,
    image?: Express.Multer.File,
  ) {
    const item = await this.prisma.workItem.create({
      data: {
        title: dto.title,
        description: dto.description,
        priority: dto.priority ?? 'MEDIUM',
        category: dto.category,
        dueDate: new Date(dto.dueDate),
        createdById,
        imagePath: image ? image.filename : null,
      },
      include: WITH_ASSIGNEES,
    });

    await this.prisma.activityLog.create({
      data: { workItemId: item.id, actorId: createdById, action: 'CREATED' },
    });

    return toWorkItemResponse(item);
  }

  // Updates editable fields (never `status`) and optionally swaps the attached image,
  // deleting the old file from disk so uploads/ doesn't accumulate orphans.
  async update(
    id: string,
    dto: UpdateWorkItemDto,
    actorId: string,
    image?: Express.Multer.File,
  ) {
    const existing = await this.prisma.workItem.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Work item not found');
    }

    const item = await this.prisma.workItem.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        priority: dto.priority,
        category: dto.category,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        imagePath: image ? image.filename : undefined,
      },
      include: WITH_ASSIGNEES,
    });

    if (image && existing.imagePath) {
      await this.deleteImageFile(existing.imagePath);
    }

    await this.prisma.activityLog.create({
      data: {
        workItemId: item.id,
        actorId,
        action: 'UPDATED',
        metadata: { fields: Object.keys(dto) },
      },
    });

    return toWorkItemResponse(item);
  }

  // Deletes a work item (assignments/activity/extension rows cascade via the FK) and
  // its attached image file, if any.
  async remove(id: string) {
    const existing = await this.prisma.workItem.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Work item not found');
    }

    await this.prisma.workItem.delete({ where: { id } });

    if (existing.imagePath) {
      await this.deleteImageFile(existing.imagePath);
    }
  }

  // Best-effort disk cleanup; a missing file should never fail the request.
  private async deleteImageFile(filename: string) {
    try {
      await unlink(join(process.cwd(), 'uploads', filename));
    } catch {
      // File already gone or never existed on disk — nothing to do.
    }
  }
}
