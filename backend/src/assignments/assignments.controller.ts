import { Body, Controller, Param, Put } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AssignmentsService } from './assignments.service';
import { SetAssigneesDto } from './dto/set-assignees.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/types/auth-user.type';

@ApiTags('Assignments')
@ApiBearerAuth('access-token')
@Controller('work-items/:id/assignments')
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  // PUT /api/work-items/:id/assignments — Manager-only; replaces the assignee list
  // (send an empty array to unassign everyone). Covers assign, reassign, and remove
  // in one operation, per ARCHITECTURE.md.
  @Roles('MANAGER')
  @ApiOperation({
    summary:
      "Replace a work item's assignee list (assign/reassign/remove in one call)",
    description:
      'First assignment moves BACKLOG -> ASSIGNED. Emptying the list falls back to ' +
      'BACKLOG (unless the item is DONE/CANCELLED, which is never touched by this).',
  })
  @ApiResponse({
    status: 400,
    description: 'One or more ids are not valid Member accounts',
  })
  @Put()
  setAssignees(
    @Param('id') id: string,
    @Body() dto: SetAssigneesDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.assignmentsService.setAssignees(id, dto, user.id);
  }
}
