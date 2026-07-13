import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { PrismaClient } from '@prisma/client';
import { AppModule } from './../src/app.module';
import { AllExceptionsFilter } from './../src/common/filters/http-exception.filter';

// Shape of a successful /auth/register or /auth/login response body, used to give
// supertest's untyped `res.body` a concrete type in assertions below.
interface AuthResponseBody {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    passwordHash?: string;
  };
}

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;
  const prisma = new PrismaClient();
  // Unique per test run so re-running the suite never collides with a leftover user.
  const email = `e2e-${Date.now()}@taskflow.dev`;
  const password = 'Password123!';

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
  });

  afterAll(async () => {
    // Clean up the user this suite created so re-runs start from the same state.
    await prisma.user.deleteMany({ where: { email } });
    await prisma.$disconnect();
    await app.close();
  });

  it('registers a new account as a MEMBER and rejects a duplicate email with 409', async () => {
    const first = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, password, name: 'E2E Test User' })
      .expect(201);

    const firstBody = first.body as AuthResponseBody;
    expect(firstBody.accessToken).toEqual(expect.any(String));
    expect(firstBody.user).toMatchObject({ email, role: 'MEMBER' });
    expect(firstBody.user.passwordHash).toBeUndefined();

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, password, name: 'E2E Test User' })
      .expect(409);
  });

  it('rejects registration that tries to sneak in a role field', () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: `${email}-2`, password, name: 'Sneaky', role: 'MANAGER' })
      .expect(400);
  });

  it('logs in with correct credentials and rejects incorrect ones with 401', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password: 'wrong-password' })
      .expect(401);

    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password })
      .expect(200);

    expect((res.body as AuthResponseBody).accessToken).toEqual(
      expect.any(String),
    );
  });

  it('blocks /auth/me without a token and allows it with a valid one', async () => {
    await request(app.getHttpServer()).get('/auth/me').expect(401);

    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password })
      .expect(200);

    const loginBody = login.body as AuthResponseBody;
    const me = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${loginBody.accessToken}`)
      .expect(200);

    expect(me.body).toMatchObject({ email, role: 'MEMBER' });
  });
});
