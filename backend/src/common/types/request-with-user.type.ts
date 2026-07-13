import { Request } from 'express';
import { AuthUser } from './auth-user.type';

// An Express request after JwtStrategy has attached the authenticated user.
export interface RequestWithUser extends Request {
  user: AuthUser;
}
