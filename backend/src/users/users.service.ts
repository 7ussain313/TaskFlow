import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service';

const SAFE_USER_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
} as const;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  // Looks up a user by their unique email, used during login and registration.
  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  // Looks up a user by id, used to re-hydrate req.user from a JWT's `sub` claim.
  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  // Creates a new user with an already-hashed password. Role always defaults to
  // MEMBER here — see SYSTEM_DESIGN.md assumptions for why public registration
  // never grants MANAGER.
  createMember(data: { email: string; passwordHash: string; name: string }) {
    return this.prisma.user.create({
      data: { ...data, role: 'MEMBER' },
    });
  }

  // Lists users (password hash never selected) for the Manager's assignment picker,
  // optionally filtered to one role.
  findAllSanitized(role?: Role) {
    return this.prisma.user.findMany({
      where: role ? { role } : undefined,
      select: SAFE_USER_SELECT,
      orderBy: { name: 'asc' },
    });
  }

  // Fetches the subset of the given ids that are real MEMBER accounts — used by
  // AssignmentsService to validate a manager's assignee list in one query.
  findMembersByIds(ids: string[]) {
    return this.prisma.user.findMany({
      where: { id: { in: ids }, role: 'MEMBER' },
      select: SAFE_USER_SELECT,
    });
  }
}
