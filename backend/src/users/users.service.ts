import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

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
}
