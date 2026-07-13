import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { AuthUser } from '../types/auth-user.type';

// Builds a fake ExecutionContext carrying the given user, for guard unit tests.
function buildContext(user: AuthUser | undefined): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  const manager: AuthUser = {
    id: '1',
    email: 'manager@taskflow.dev',
    name: 'Manager',
    role: 'MANAGER',
  };
  const member: AuthUser = {
    id: '2',
    email: 'member@taskflow.dev',
    name: 'Member',
    role: 'MEMBER',
  };

  it('allows the request when the route declares no @Roles() metadata', () => {
    const reflector = {
      getAllAndOverride: () => undefined,
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);

    expect(guard.canActivate(buildContext(member))).toBe(true);
  });

  it('allows the request when the user has one of the required roles', () => {
    const reflector = {
      getAllAndOverride: () => ['MANAGER'],
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);

    expect(guard.canActivate(buildContext(manager))).toBe(true);
  });

  it('throws ForbiddenException when the user lacks the required role', () => {
    const reflector = {
      getAllAndOverride: () => ['MANAGER'],
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);

    expect(() => guard.canActivate(buildContext(member))).toThrow(
      ForbiddenException,
    );
  });

  it('throws ForbiddenException when there is no authenticated user at all', () => {
    const reflector = {
      getAllAndOverride: () => ['MANAGER'],
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);

    expect(() => guard.canActivate(buildContext(undefined))).toThrow(
      ForbiddenException,
    );
  });
});
