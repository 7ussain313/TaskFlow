import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

// Confirms the one exception to "every route requires a JWT" actually works end to end:
// the root route stays public (health-check use case) while a real protected route still
// enforces auth — proving @Public() exempts specifically the route it's applied to, not
// that the global JwtAuthGuard is silently disabled.
describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('allows the public root route with no token', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('still requires a token on a real protected route, proving auth is not globally disabled', () => {
    return request(app.getHttpServer()).get('/work-items').expect(401);
  });
});
