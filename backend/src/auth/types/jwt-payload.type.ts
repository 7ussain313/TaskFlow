import { Role } from '@prisma/client';

// Shape of the data encoded into every issued JWT.
export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
}
