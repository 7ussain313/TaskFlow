import { PrismaClient, Priority, WorkItemStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Hashes a plaintext seed password the same way the real register endpoint will.
async function hash(password: string) {
  return bcrypt.hash(password, 10);
}

// Shorthand for building a due date N days from now (negative = in the past).
function daysFromNow(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

// Wipes existing data (in FK-safe order) so the seed can be re-run from a clean slate.
async function clearDatabase() {
  await prisma.activityLog.deleteMany();
  await prisma.extensionRequest.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.workItem.deleteMany();
  await prisma.user.deleteMany();
}

// Creates the Manager + Member accounts used throughout the demo data.
async function seedUsers() {
  const passwordHash = await hash('Password123!');

  const manager = await prisma.user.create({
    data: {
      email: 'manager@taskflow.dev',
      passwordHash,
      name: 'Morgan Reyes',
      role: 'MANAGER',
    },
  });

  const [alice, bob, carol] = await Promise.all([
    prisma.user.create({
      data: {
        email: 'alice@taskflow.dev',
        passwordHash,
        name: 'Alice Chen',
        role: 'MEMBER',
      },
    }),
    prisma.user.create({
      data: {
        email: 'bob@taskflow.dev',
        passwordHash,
        name: 'Bob Nguyen',
        role: 'MEMBER',
      },
    }),
    prisma.user.create({
      data: {
        email: 'carol@taskflow.dev',
        passwordHash,
        name: 'Carol Diaz',
        role: 'MEMBER',
      },
    }),
  ]);

  return { manager, alice, bob, carol };
}

// Creates one work item with its assignees and an initial "CREATED" activity log entry.
async function createWorkItem(params: {
  title: string;
  description: string;
  priority: Priority;
  category: string;
  dueDate: Date;
  status: WorkItemStatus;
  createdById: string;
  assigneeIds?: string[];
}) {
  const { assigneeIds = [], ...data } = params;

  const workItem = await prisma.workItem.create({ data });

  if (assigneeIds.length > 0) {
    await prisma.assignment.createMany({
      data: assigneeIds.map((userId) => ({ workItemId: workItem.id, userId })),
    });
  }

  await prisma.activityLog.create({
    data: {
      workItemId: workItem.id,
      actorId: params.createdById,
      action: 'CREATED',
      metadata: { status: params.status },
    },
  });

  return workItem;
}

// Populates work items covering every workflow status, including overdue examples.
async function seedWorkItems(users: {
  manager: { id: string };
  alice: { id: string };
  bob: { id: string };
  carol: { id: string };
}) {
  const { manager, alice, bob, carol } = users;

  await createWorkItem({
    title: 'Fix printer driver on 3rd floor',
    description: 'Printer HP-4200 shows a driver error on Windows 11 machines.',
    priority: 'MEDIUM',
    category: 'Hardware',
    dueDate: daysFromNow(5),
    status: 'BACKLOG',
    createdById: manager.id,
  });

  await createWorkItem({
    title: 'Set up VPN for new hires',
    description: 'Provision VPN access for the two engineers starting Monday.',
    priority: 'HIGH',
    category: 'Network',
    dueDate: daysFromNow(3),
    status: 'ASSIGNED',
    createdById: manager.id,
    assigneeIds: [alice.id],
  });

  await createWorkItem({
    title: 'Migrate email to new domain',
    description: 'Cut over mailboxes to the new company domain without downtime.',
    priority: 'URGENT',
    category: 'Infrastructure',
    dueDate: daysFromNow(2),
    status: 'IN_PROGRESS',
    createdById: manager.id,
    assigneeIds: [bob.id],
  });

  await createWorkItem({
    title: 'Password reset for HR system',
    description: 'HR lead is locked out of the payroll portal.',
    priority: 'LOW',
    category: 'Access',
    dueDate: daysFromNow(4),
    status: 'IN_REVIEW',
    createdById: manager.id,
    assigneeIds: [carol.id],
  });

  await createWorkItem({
    title: 'Replace faulty keyboard - Reception',
    description: 'Front desk keyboard has several unresponsive keys.',
    priority: 'LOW',
    category: 'Hardware',
    dueDate: daysFromNow(-2),
    status: 'DONE',
    createdById: manager.id,
    assigneeIds: [alice.id],
  });

  await createWorkItem({
    title: 'Decommission old file server',
    description: 'Superseded by the new NAS; safe to power down and archive.',
    priority: 'MEDIUM',
    category: 'Infrastructure',
    dueDate: daysFromNow(-10),
    status: 'CANCELLED',
    createdById: manager.id,
    assigneeIds: [bob.id],
  });

  // Overdue: still IN_PROGRESS but the due date has already passed.
  const firewallItem = await createWorkItem({
    title: 'Update firewall rules',
    description: 'Block the flagged outbound IP ranges from the security report.',
    priority: 'URGENT',
    category: 'Network',
    dueDate: daysFromNow(-3),
    status: 'IN_PROGRESS',
    createdById: manager.id,
    assigneeIds: [carol.id],
  });

  // Overdue: still ASSIGNED, multiple assignees, has a pending extension request.
  await createWorkItem({
    title: 'Renew SSL certificates',
    description: 'Certificates for the internal portal expired last week.',
    priority: 'HIGH',
    category: 'Infrastructure',
    dueDate: daysFromNow(-1),
    status: 'ASSIGNED',
    createdById: manager.id,
    assigneeIds: [alice.id, bob.id],
  });

  // A pending extension request demonstrates the request/approve/reject flow in the UI.
  await prisma.extensionRequest.create({
    data: {
      workItemId: firewallItem.id,
      requestedById: carol.id,
      proposedDueDate: daysFromNow(2),
      status: 'PENDING',
    },
  });
  await prisma.activityLog.create({
    data: {
      workItemId: firewallItem.id,
      actorId: carol.id,
      action: 'EXTENSION_REQUESTED',
      metadata: { proposedDueDate: daysFromNow(2).toISOString() },
    },
  });
}

// Entry point: clears old data, then recreates users and work items from scratch.
async function main() {
  await clearDatabase();
  const users = await seedUsers();
  await seedWorkItems(users);

  console.log('Seed complete:');
  console.log('  Manager -> manager@taskflow.dev / Password123!');
  console.log('  Members -> alice@taskflow.dev, bob@taskflow.dev, carol@taskflow.dev / Password123!');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
