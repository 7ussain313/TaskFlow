import { Controller, Get, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { QueryUsersDto } from './dto/query-users.dto';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // GET /api/users?role=MEMBER — Manager-only; powers the assignment picker.
  @Roles('MANAGER')
  @Get()
  findAll(@Query() query: QueryUsersDto) {
    return this.usersService.findAllSanitized(query.role);
  }
}
