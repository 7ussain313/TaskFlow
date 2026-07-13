import { Body, Controller, Param, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ExtensionRequestsService } from './extension-requests.service';
import { RequestExtensionDto } from './dto/request-extension.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/types/auth-user.type';

@ApiTags('Extension Requests')
@ApiBearerAuth('access-token')
@Controller()
export class ExtensionRequestsController {
  constructor(
    private readonly extensionRequestsService: ExtensionRequestsService,
  ) {}

  // POST /api/work-items/:id/extension-requests — Member (assignee) proposes a new due date.
  @Roles('MEMBER')
  @ApiOperation({ summary: 'Request a due-date extension (assignee only)' })
  @ApiResponse({
    status: 409,
    description:
      'Item is DONE/CANCELLED, or another request is already pending',
  })
  @Post('work-items/:id/extension-requests')
  request(
    @Param('id') id: string,
    @Body() dto: RequestExtensionDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.extensionRequestsService.request(id, dto, user);
  }

  // POST /api/extension-requests/:id/approve — Manager approves; the item's due date updates.
  @Roles('MANAGER')
  @ApiOperation({
    summary:
      "Approve a pending extension request (Manager only) — updates the item's due date",
  })
  @ApiResponse({ status: 409, description: 'Already decided' })
  @Post('extension-requests/:id/approve')
  approve(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.extensionRequestsService.approve(id, user);
  }

  // POST /api/extension-requests/:id/reject — Manager rejects; the item is untouched.
  @Roles('MANAGER')
  @ApiOperation({
    summary:
      'Reject a pending extension request (Manager only) — item untouched',
  })
  @ApiResponse({ status: 409, description: 'Already decided' })
  @Post('extension-requests/:id/reject')
  reject(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.extensionRequestsService.reject(id, user);
  }
}
