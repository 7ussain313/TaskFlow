import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Prisma, User } from '@prisma/client';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './types/jwt-payload.type';
import { AuthUser } from '../common/types/auth-user.type';

const BCRYPT_SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  // Strips the password hash before a user object is ever sent to the client.
  private sanitizeUser(user: User): AuthUser {
    return { id: user.id, email: user.email, name: user.name, role: user.role };
  }

  // Signs a JWT carrying the user's id/email/role for use as the Bearer token.
  private issueToken(user: User): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    return this.jwtService.sign(payload);
  }

  // Creates a new MEMBER account (rejecting duplicate emails) and logs them straight in.
  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);

    let user: User;
    try {
      user = await this.usersService.createMember({
        email: dto.email,
        passwordHash,
        name: dto.name,
      });
    } catch (err) {
      // The findByEmail check above can't prevent two concurrent registrations
      // for the same email (double-submit, retried request) from both passing
      // it and racing to insert — the DB's unique constraint on email is the
      // real guard. Translate its violation to the same 409 the pre-check
      // throws, instead of letting a raw PrismaClientKnownRequestError fall
      // through to the exception filter as a generic 500.
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        throw new ConflictException(
          'An account with this email already exists',
        );
      }
      throw err;
    }

    return {
      accessToken: this.issueToken(user),
      user: this.sanitizeUser(user),
    };
  }

  // Verifies credentials and issues a fresh JWT on success.
  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatches = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return {
      accessToken: this.issueToken(user),
      user: this.sanitizeUser(user),
    };
  }
}
