import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { PrismaClient } from '@prisma/client';
import { AppModule } from './../src/app.module';
import { AllExceptionsFilter } from './../src/common/filters/http-exception.filter';

interface LoginResponseBody {
  accessToken: string;
  user: { id: string; email: string; role: string };
}

interface WorkItemResponseBody {
  id: string;
  status: string;
  assignees: { id: string }[];
}

interface PaginatedWorkItemsResponseBody {
  items: WorkItemResponseBody[];
  total: number;
}

// Integration test covering the assessment's required "login -> create -> assign"
// flow end to end against the real database, plus the explicit 401/403/400
// security cases called out in the brief. Uses the seeded Manager/Member accounts
// (see prisma/seed.ts) rather than registering new users, since assigning requires
// a real MEMBER account to already exist.
describe('Work items (e2e)', () => {
  let app: INestApplication<App>;
  const prisma = new PrismaClient();
  let managerToken: string;
  let aliceToken: string;
  let aliceId: string;
  let createdItemId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new AllExceptionsFilter());
    await app.init();

    const managerLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'manager@taskflow.dev', password: 'Password123!' })
      .expect(200);
    managerToken = (managerLogin.body as LoginResponseBody).accessToken;

    const aliceLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'alice@taskflow.dev', password: 'Password123!' })
      .expect(200);
    const aliceBody = aliceLogin.body as LoginResponseBody;
    aliceToken = aliceBody.accessToken;
    aliceId = aliceBody.user.id;
  }, 20000); // Neon's serverless connection can take a few seconds to wake from idle.

  afterAll(async () => {
    if (createdItemId) {
      await prisma.workItem.deleteMany({ where: { id: createdItemId } });
    }
    await prisma.$disconnect();
    await app.close();
  });

  it('logs in, creates a work item, and assigns it — the full required flow', async () => {
    // Create (Manager-only, multipart body since the endpoint supports an image field).
    const created = await request(app.getHttpServer())
      .post('/work-items')
      .set('Authorization', `Bearer ${managerToken}`)
      .field('title', 'E2E integration test item')
      .field('category', 'QA')
      .field('dueDate', '2026-12-01T10:00:00.000Z')
      .expect(201);

    const createdBody = created.body as WorkItemResponseBody;
    createdItemId = createdBody.id;
    expect(createdBody.status).toBe('BACKLOG');
    expect(createdBody.assignees).toEqual([]);

    // Assign — should move BACKLOG -> ASSIGNED.
    const assigned = await request(app.getHttpServer())
      .put(`/work-items/${createdItemId}/assignments`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ userIds: [aliceId] })
      .expect(200);

    const assignedBody = assigned.body as WorkItemResponseBody;
    expect(assignedBody.status).toBe('ASSIGNED');
    expect(assignedBody.assignees).toEqual([
      expect.objectContaining({ id: aliceId }),
    ]);

    // Confirm it shows up in Alice's own scoped list.
    const aliceList = await request(app.getHttpServer())
      .get('/work-items')
      .set('Authorization', `Bearer ${aliceToken}`)
      .expect(200);
    const aliceItems = (aliceList.body as PaginatedWorkItemsResponseBody).items;
    expect(aliceItems.some((item) => item.id === createdItemId)).toBe(true);
  }, 45000); // three sequential requests against Neon; give it real headroom.

  it('401s when no token is provided', () => {
    return request(app.getHttpServer()).get('/work-items').expect(401);
  });

  it('403s when a Member tries to create a work item (Manager-only)', () => {
    return request(app.getHttpServer())
      .post('/work-items')
      .set('Authorization', `Bearer ${aliceToken}`)
      .field('title', 'Should not be allowed')
      .field('category', 'QA')
      .field('dueDate', '2026-12-01T10:00:00.000Z')
      .expect(403);
  });

  it('400s on invalid input (missing required fields)', () => {
    return request(app.getHttpServer())
      .post('/work-items')
      .set('Authorization', `Bearer ${managerToken}`)
      .field('category', 'QA')
      .expect(400);
  });

  it('404s (not 403) when a Member requests an item they are not assigned to', async () => {
    // Bob is a seeded Member with no relation to the item this suite created.
    const bobLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'bob@taskflow.dev', password: 'Password123!' })
      .expect(200);
    const bobToken = (bobLogin.body as LoginResponseBody).accessToken;

    await request(app.getHttpServer())
      .get(`/work-items/${createdItemId}`)
      .set('Authorization', `Bearer ${bobToken}`)
      .expect(404);
  });
});
