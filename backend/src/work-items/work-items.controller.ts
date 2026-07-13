import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { WorkItemsService } from './work-items.service';
import { CreateWorkItemDto } from './dto/create-work-item.dto';
import { UpdateWorkItemDto } from './dto/update-work-item.dto';
import { QueryWorkItemsDto } from './dto/query-work-items.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/types/auth-user.type';
import {
  MAX_IMAGE_SIZE_BYTES,
  multerImageOptions,
} from './multer-image.config';

// Multipart body schema shared by create/update — Swagger can't infer a file
// field from @UploadedFile() alone, so it's spelled out explicitly here.
const workItemMultipartSchema = {
  type: 'object',
  properties: {
    title: { type: 'string', example: 'Fix printer driver on 3rd floor' },
    description: { type: 'string', nullable: true },
    priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] },
    category: { type: 'string', example: 'Hardware' },
    dueDate: { type: 'string', format: 'date-time' },
    image: { type: 'string', format: 'binary', nullable: true },
  },
};

@ApiTags('Work Items')
@ApiBearerAuth('access-token')
@Controller('work-items')
export class WorkItemsController {
  constructor(private readonly workItemsService: WorkItemsService) {}

  // GET /api/work-items?status=&assigneeId=&priority=&search=&sortBy=&sortOrder=&page=&limit=
  // — scoped by role in the service (Manager: all, Member: assigned only);
  // filters/search/sort narrow within that scope, page/limit paginate the result.
  @ApiOperation({
    summary:
      'List work items visible to the caller, optionally filtered, sorted, and paginated',
  })
  @Get()
  findAll(@Query() query: QueryWorkItemsDto, @CurrentUser() user: AuthUser) {
    return this.workItemsService.findAllForUser(user, query);
  }

  // GET /api/work-items/assigned-to-me — must be declared before the `:id` route
  // below, or Nest would match the literal path "assigned-to-me" as an :id instead.
  @ApiOperation({ summary: 'List work items assigned to the caller' })
  @Get('assigned-to-me')
  findAssignedToMe(@CurrentUser() user: AuthUser) {
    return this.workItemsService.findAssignedToUser(user.id);
  }

  // GET /api/work-items/:id — 404s if the item doesn't exist or isn't visible to the caller.
  @ApiOperation({ summary: 'Get one work item by id' })
  @ApiResponse({
    status: 404,
    description: 'Not found, or not visible to the caller',
  })
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.workItemsService.findOneForUser(id, user);
  }

  // GET /api/work-items/:id/activity — the activity timeline for one item, newest first.
  @ApiOperation({ summary: "Get a work item's activity log (newest first)" })
  @Get(':id/activity')
  findActivityLog(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.workItemsService.findActivityLog(id, user);
  }

  // POST /api/work-items — Manager-only; multipart body with an optional image attachment.
  // Bad mime types are rejected in multerImageOptions.fileFilter before any disk write;
  // this pipe only needs to catch an oversized file.
  @Roles('MANAGER')
  @ApiOperation({ summary: 'Create a work item (Manager-only)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: workItemMultipartSchema })
  @ApiResponse({ status: 403, description: 'Not a Manager' })
  @Post()
  @UseInterceptors(FileInterceptor('image', multerImageOptions))
  create(
    @Body() dto: CreateWorkItemDto,
    @CurrentUser() user: AuthUser,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_IMAGE_SIZE_BYTES }),
        ],
        fileIsRequired: false,
      }),
    )
    image?: Express.Multer.File,
  ) {
    return this.workItemsService.create(dto, user.id, image);
  }

  // PATCH /api/work-items/:id — Manager-only; edits fields and/or swaps the image.
  // Never accepts `status` — see UpdateWorkItemDto.
  @Roles('MANAGER')
  @ApiOperation({
    summary:
      "Update a work item's fields and/or image (Manager-only, never status)",
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: workItemMultipartSchema })
  @Patch(':id')
  @UseInterceptors(FileInterceptor('image', multerImageOptions))
  update(
    @Param('id') id: string,
    @Body() dto: UpdateWorkItemDto,
    @CurrentUser() user: AuthUser,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_IMAGE_SIZE_BYTES }),
        ],
        fileIsRequired: false,
      }),
    )
    image?: Express.Multer.File,
  ) {
    return this.workItemsService.update(id, dto, user.id, image);
  }

  // DELETE /api/work-items/:id — Manager-only; cascades assignments/activity/extensions.
  @Roles('MANAGER')
  @ApiOperation({ summary: 'Delete a work item (Manager-only)' })
  @ApiResponse({ status: 204, description: 'Deleted' })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.workItemsService.remove(id);
  }
}
