import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/types/auth-user.type';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // POST /api/auth/register — creates a new MEMBER account and returns a JWT.
  @Public()
  @ApiOperation({
    summary: 'Register a new account (always created as MEMBER)',
  })
  @ApiResponse({
    status: 201,
    description: 'Account created; returns { accessToken, user }',
  })
  @ApiResponse({ status: 409, description: 'Email already registered' })
  @ApiResponse({
    status: 400,
    description: 'Validation failed (or tried to set a role field)',
  })
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  // POST /api/auth/login — verifies credentials and returns a fresh JWT.
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log in with email + password' })
  @ApiResponse({ status: 200, description: 'Returns { accessToken, user }' })
  @ApiResponse({ status: 401, description: 'Invalid email or password' })
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // GET /api/auth/me — returns the currently-authenticated user (requires a valid JWT).
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get the currently-authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'The current user (never includes the password hash)',
  })
  @ApiResponse({ status: 401, description: 'Missing or invalid token' })
  @Get('me')
  me(@CurrentUser() user: AuthUser) {
    return user;
  }
}
