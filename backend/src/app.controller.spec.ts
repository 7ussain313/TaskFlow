import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IS_PUBLIC_KEY } from './common/decorators/public.decorator';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  it('returns the health-check greeting', () => {
    expect(appController.getHello()).toBe('Hello World!');
  });

  // JwtAuthGuard skips verification only when this metadata is present on the handler
  // (see jwt-auth.guard.ts) — this is the actual mechanism the e2e test's "200 with no
  // token" observation depends on, checked directly rather than only inferred from behavior.
  it('is marked @Public(), exempting it from the global JwtAuthGuard', () => {
    // Referencing the method off the prototype (never called) just to read its
    // metadata — not a real unbound-`this` call site, so the lint rule doesn't apply.
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const { getHello } = AppController.prototype;
    const isPublic = new Reflector().get<boolean>(IS_PUBLIC_KEY, getHello);
    expect(isPublic).toBe(true);
  });
});
