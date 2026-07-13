import { Role } from '@prisma/client';

// The shape of the currently-authenticated user, attached to req.user by JwtStrategy
// and never includes the password hash.
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}
