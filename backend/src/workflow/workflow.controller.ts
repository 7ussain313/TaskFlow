import { Controller, Param, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { WorkflowService } from './workflow.service';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/types/auth-user.type';

const ILLEGAL_TRANSITION_RESPONSE = {
  status: 409,
  description:
    'Illegal transition — the item is not currently in a status this action allows',
};

@ApiTags('Workflow')
@ApiBearerAuth('access-token')
@ApiResponse(ILLEGAL_TRANSITION_RESPONSE)
@Controller('work-items/:id')
export class WorkflowController {
  constructor(private readonly workflowService: WorkflowService) {}

  // POST /api/work-items/:id/start — Member (assignee): ASSIGNED -> IN_PROGRESS.
  @Roles('MEMBER')
  @ApiOperation({
    summary: 'Start work (assignee only): ASSIGNED -> IN_PROGRESS',
  })
  @Post('start')
  startWork(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.workflowService.startWork(id, user);
  }

  // POST /api/work-items/:id/submit-review — Member (assignee): IN_PROGRESS -> IN_REVIEW.
  @Roles('MEMBER')
  @ApiOperation({
    summary: 'Submit for review (assignee only): IN_PROGRESS -> IN_REVIEW',
  })
  @Post('submit-review')
  submitReview(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.workflowService.submitReview(id, user);
  }

  // POST /api/work-items/:id/accept — Manager: IN_REVIEW -> DONE.
  @Roles('MANAGER')
  @ApiOperation({ summary: 'Accept (Manager only): IN_REVIEW -> DONE' })
  @Post('accept')
  accept(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.workflowService.accept(id, user);
  }

  // POST /api/work-items/:id/send-back — Manager: IN_REVIEW -> IN_PROGRESS.
  @Roles('MANAGER')
  @ApiOperation({
    summary: 'Send back for more work (Manager only): IN_REVIEW -> IN_PROGRESS',
  })
  @Post('send-back')
  sendBack(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.workflowService.sendBack(id, user);
  }

  // POST /api/work-items/:id/cancel — Manager: any non-terminal status -> CANCELLED.
  @Roles('MANAGER')
  @ApiOperation({
    summary: 'Cancel (Manager only): any non-terminal status -> CANCELLED',
  })
  @Post('cancel')
  cancel(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.workflowService.cancel(id, user);
  }

  // POST /api/work-items/:id/reopen — Manager: DONE/CANCELLED -> ASSIGNED or BACKLOG.
  @Roles('MANAGER')
  @ApiOperation({
    summary:
      'Reopen (Manager only): DONE/CANCELLED -> ASSIGNED (if still has assignees) or BACKLOG',
  })
  @Post('reopen')
  reopen(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.workflowService.reopen(id, user);
  }
}
