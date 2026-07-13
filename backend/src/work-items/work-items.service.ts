import { Injectable, NotFoundException } from '@nestjs/common';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service';
import { AuthUser } from '../common/types/auth-user.type';
import {
  toWorkItemResponse,
  workItemWithAssigneesInclude,
} from '../common/utils/work-item-response.util';
import { CreateWorkItemDto } from './dto/create-work-item.dto';
import { UpdateWorkItemDto } from './dto/update-work-item.dto';
import {
  QueryWorkItemsDto,
  SortOrder,
  WorkItemSortBy,
} from './dto/query-work-items.dto';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

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

  // Maps the sort query params to a Prisma orderBy clause. Priority and status are
  // Postgres enums ordered by declaration order in schema.prisma (LOW..URGENT,
  // BACKLOG..CANCELLED), so 'asc'/'desc' on them sorts in that natural order.
  private buildOrderBy(
    sortBy: WorkItemSortBy = WorkItemSortBy.DUE_DATE,
    sortOrder: SortOrder = SortOrder.ASC,
  ): Prisma.WorkItemOrderByWithRelationInput {
    switch (sortBy) {
      case WorkItemSortBy.PRIORITY:
        return { priority: sortOrder };
      case WorkItemSortBy.STATUS:
        return { status: sortOrder };
      case WorkItemSortBy.DUE_DATE:
      default:
        return { dueDate: sortOrder };
    }
  }

  // Lists work items visible to the caller (all for Manager, own assignments for
  // Member), optionally narrowed by status/assignee/priority/search, sorted, and
  // paginated. Filters are combined with the visibility scope via an explicit
  // `AND` array — NOT object spread — because the visibility filter and an
  // assigneeId filter both use an `assignments` key; spreading them into one
  // object would let the later key silently overwrite the earlier one, which for
  // a Member would drop their own scoping and leak another member's items. `AND`
  // keeps both conditions distinct and both required.
  async findAllForUser(user: AuthUser, filters: QueryWorkItemsDto = {}) {
    const where: Prisma.WorkItemWhereInput = {
      AND: [
        this.visibilityFilter(user),
        ...(filters.status ? [{ status: filters.status }] : []),
        ...(filters.priority ? [{ priority: filters.priority }] : []),
        ...(filters.assigneeId
          ? [
              {
                assignments: { some: { userId: filters.assigneeId } },
              } as const,
            ]
          : []),
        ...(filters.search
          ? [
              {
                OR: [
                  {
                    title: {
                      contains: filters.search,
                      mode: 'insensitive' as const,
                    },
                  },
                  {
                    description: {
                      contains: filters.search,
                      mode: 'insensitive' as const,
                    },
                  },
                ],
              },
            ]
          : []),
      ],
    };

    const page = filters.page ?? DEFAULT_PAGE;
    const limit = filters.limit ?? DEFAULT_LIMIT;

    const [items, total] = await Promise.all([
      this.prisma.workItem.findMany({
        where,
        include: workItemWithAssigneesInclude,
        orderBy: this.buildOrderBy(filters.sortBy, filters.sortOrder),
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.workItem.count({ where }),
    ]);

    return {
      items: items.map(toWorkItemResponse),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Lists work items the given user is personally assigned to — the "Assigned to me"
  // view. Scoped by userId directly rather than role, so it behaves sensibly even if
  // a Manager (who normally can't be an assignee) ever calls it.
  async findAssignedToUser(userId: string) {
    const items = await this.prisma.workItem.findMany({
      where: { assignments: { some: { userId } } },
      include: workItemWithAssigneesInclude,
      orderBy: { dueDate: 'asc' },
    });
    return items.map(toWorkItemResponse);
  }

  // Fetches one item, scoped the same way as the list — a Member asking for an item
  // they can't see gets 404, not 403, so we don't confirm the item even exists to them.
  async findOneForUser(id: string, user: AuthUser) {
    const item = await this.prisma.workItem.findFirst({
      where: { id, ...this.visibilityFilter(user) },
      include: workItemWithAssigneesInclude,
    });
    if (!item) {
      throw new NotFoundException('Work item not found');
    }
    return toWorkItemResponse(item);
  }

  // Lists a work item's activity log (who did what, when), newest first — scoped
  // the same way as the item itself, so it 404s rather than leaking that an item a
  // Member can't see even exists.
  async findActivityLog(id: string, user: AuthUser) {
    const item = await this.prisma.workItem.findFirst({
      where: { id, ...this.visibilityFilter(user) },
      select: { id: true },
    });
    if (!item) {
      throw new NotFoundException('Work item not found');
    }

    return this.prisma.activityLog.findMany({
      where: { workItemId: id },
      include: {
        actor: { select: { id: true, name: true, email: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
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
      include: workItemWithAssigneesInclude,
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
      include: workItemWithAssigneesInclude,
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
