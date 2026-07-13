/* eslint-disable @typescript-eslint/no-unsafe-assignment -- jest.fn() mock call
   assertions are inherently loosely-typed at the edges; not worth hand-typing
   every mock signature in a test file. */
import { Test } from '@nestjs/testing';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { WorkflowService } from './workflow.service';
import { PrismaService } from '../common/prisma/prisma.service';
import { AuthUser } from '../common/types/auth-user.type';

const MANAGER: AuthUser = {
  id: 'manager-1',
  email: 'manager@taskflow.dev',
  name: 'Manager',
  role: 'MANAGER',
};
const ALICE: AuthUser = {
  id: 'alice-1',
  email: 'alice@taskflow.dev',
  name: 'Alice',
  role: 'MEMBER',
};
const BOB: AuthUser = {
  id: 'bob-1',
  email: 'bob@taskflow.dev',
  name: 'Bob',
  role: 'MEMBER',
};

// Builds a fake work item row (as Prisma would return it with assignments included)
// and a PrismaService mock whose findUnique/update reflect it.
function buildHarness(status: string, assigneeIds: string[] = [ALICE.id]) {
  const workItem = {
    id: 'item-1',
    status,
    assignments: assigneeIds.map((userId) => ({ userId })),
  };

  const prisma = {
    workItem: {
      findUnique: jest.fn().mockResolvedValue(workItem),
      update: jest
        .fn()
        .mockImplementation(({ data }: { data: { status: string } }) =>
          Promise.resolve({
            ...workItem,
            ...data,
            assignments: assigneeIds.map((userId) => ({
              user: {
                id: userId,
                name: userId,
                email: `${userId}@taskflow.dev`,
                role: 'MEMBER',
              },
            })),
            extensionRequests: [],
          }),
        ),
    },
    activityLog: { create: jest.fn().mockResolvedValue({}) },
  };

  return { prisma, workItem };
}

async function buildService(prisma: unknown): Promise<WorkflowService> {
  const module = await Test.createTestingModule({
    providers: [WorkflowService, { provide: PrismaService, useValue: prisma }],
  }).compile();
  return module.get<WorkflowService>(WorkflowService);
}

describe('WorkflowService', () => {
  describe('startWork', () => {
    it('moves ASSIGNED -> IN_PROGRESS when the actor is the assignee', async () => {
      const { prisma } = buildHarness('ASSIGNED', [ALICE.id]);
      const service = await buildService(prisma);

      const result = await service.startWork('item-1', ALICE);

      expect(result.status).toBe('IN_PROGRESS');
      expect(prisma.workItem.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { status: 'IN_PROGRESS' } }),
      );
      expect(prisma.activityLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: 'START_WORK',
            actorId: ALICE.id,
          }),
        }),
      );
    });

    it('rejects a Manager (wrong role) with 403', async () => {
      const { prisma } = buildHarness('ASSIGNED', [ALICE.id]);
      const service = await buildService(prisma);

      await expect(service.startWork('item-1', MANAGER)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });

    it('rejects a Member who is not an assignee with 403', async () => {
      const { prisma } = buildHarness('ASSIGNED', [ALICE.id]);
      const service = await buildService(prisma);

      await expect(service.startWork('item-1', BOB)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });

    it('rejects starting work on a BACKLOG item (illegal transition) with 409', async () => {
      const { prisma } = buildHarness('BACKLOG', [ALICE.id]);
      const service = await buildService(prisma);

      await expect(service.startWork('item-1', ALICE)).rejects.toBeInstanceOf(
        ConflictException,
      );
    });

    it('rejects starting work a second time once already IN_PROGRESS (no-repeat) with 409', async () => {
      const { prisma } = buildHarness('IN_PROGRESS', [ALICE.id]);
      const service = await buildService(prisma);

      await expect(service.startWork('item-1', ALICE)).rejects.toBeInstanceOf(
        ConflictException,
      );
    });

    it('404s when the work item does not exist', async () => {
      const { prisma } = buildHarness('ASSIGNED', [ALICE.id]);
      prisma.workItem.findUnique.mockResolvedValueOnce(null);
      const service = await buildService(prisma);

      await expect(service.startWork('missing', ALICE)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('submitReview / accept / sendBack / cancel', () => {
    it('moves IN_PROGRESS -> IN_REVIEW on submitReview by the assignee', async () => {
      const { prisma } = buildHarness('IN_PROGRESS', [ALICE.id]);
      const service = await buildService(prisma);

      const result = await service.submitReview('item-1', ALICE);
      expect(result.status).toBe('IN_REVIEW');
    });

    it('moves IN_REVIEW -> DONE on accept by a Manager', async () => {
      const { prisma } = buildHarness('IN_REVIEW');
      const service = await buildService(prisma);

      const result = await service.accept('item-1', MANAGER);
      expect(result.status).toBe('DONE');
    });

    it('moves IN_REVIEW -> IN_PROGRESS on sendBack by a Manager', async () => {
      const { prisma } = buildHarness('IN_REVIEW');
      const service = await buildService(prisma);

      const result = await service.sendBack('item-1', MANAGER);
      expect(result.status).toBe('IN_PROGRESS');
    });

    it('cancels from any non-terminal status', async () => {
      for (const status of [
        'BACKLOG',
        'ASSIGNED',
        'IN_PROGRESS',
        'IN_REVIEW',
      ]) {
        const { prisma } = buildHarness(status);
        const service = await buildService(prisma);
        const result = await service.cancel('item-1', MANAGER);
        expect(result.status).toBe('CANCELLED');
      }
    });

    it('rejects cancelling an already-DONE item (terminal) with 409', async () => {
      const { prisma } = buildHarness('DONE');
      const service = await buildService(prisma);

      await expect(service.cancel('item-1', MANAGER)).rejects.toBeInstanceOf(
        ConflictException,
      );
    });
  });

  describe('reopen', () => {
    it('reopens DONE -> ASSIGNED when the item still has assignees', async () => {
      const { prisma } = buildHarness('DONE', [ALICE.id]);
      const service = await buildService(prisma);

      const result = await service.reopen('item-1', MANAGER);
      expect(result.status).toBe('ASSIGNED');
    });

    it('reopens CANCELLED -> BACKLOG when the item has no assignees', async () => {
      const { prisma } = buildHarness('CANCELLED', []);
      const service = await buildService(prisma);

      const result = await service.reopen('item-1', MANAGER);
      expect(result.status).toBe('BACKLOG');
    });

    it('rejects reopening a non-terminal item with 409', async () => {
      const { prisma } = buildHarness('IN_PROGRESS', [ALICE.id]);
      const service = await buildService(prisma);

      await expect(service.reopen('item-1', MANAGER)).rejects.toBeInstanceOf(
        ConflictException,
      );
    });

    it('rejects reopen from a Member (wrong role) with 403', async () => {
      const { prisma } = buildHarness('DONE', [ALICE.id]);
      const service = await buildService(prisma);

      await expect(service.reopen('item-1', ALICE)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });
  });
});
