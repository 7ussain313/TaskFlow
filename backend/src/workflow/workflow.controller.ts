import { Controller, Param, Post } from '@nestjs/common';
import { WorkflowService } from './workflow.service';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/types/auth-user.type';

@Controller('work-items/:id')
export class WorkflowController {
  constructor(private readonly workflowService: WorkflowService) {}

  // POST /api/work-items/:id/start — Member (assignee): ASSIGNED -> IN_PROGRESS.
  @Roles('MEMBER')
  @Post('start')
  startWork(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.workflowService.startWork(id, user);
  }

  // POST /api/work-items/:id/submit-review — Member (assignee): IN_PROGRESS -> IN_REVIEW.
  @Roles('MEMBER')
  @Post('submit-review')
  submitReview(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.workflowService.submitReview(id, user);
  }

  // POST /api/work-items/:id/accept — Manager: IN_REVIEW -> DONE.
  @Roles('MANAGER')
  @Post('accept')
  accept(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.workflowService.accept(id, user);
  }

  // POST /api/work-items/:id/send-back — Manager: IN_REVIEW -> IN_PROGRESS.
  @Roles('MANAGER')
  @Post('send-back')
  sendBack(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.workflowService.sendBack(id, user);
  }

  // POST /api/work-items/:id/cancel — Manager: any non-terminal status -> CANCELLED.
  @Roles('MANAGER')
  @Post('cancel')
  cancel(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.workflowService.cancel(id, user);
  }

  // POST /api/work-items/:id/reopen — Manager: DONE/CANCELLED -> ASSIGNED or BACKLOG.
  @Roles('MANAGER')
  @Post('reopen')
  reopen(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.workflowService.reopen(id, user);
  }
}
