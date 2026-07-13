import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

export const ROLES_KEY = 'roles';

// Declares which roles may call a route, read by RolesGuard at request time.
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
