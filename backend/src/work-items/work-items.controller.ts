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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { WorkItemsService } from './work-items.service';
import { CreateWorkItemDto } from './dto/create-work-item.dto';
import { UpdateWorkItemDto } from './dto/update-work-item.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/types/auth-user.type';
import {
  MAX_IMAGE_SIZE_BYTES,
  multerImageOptions,
} from './multer-image.config';

@Controller('work-items')
export class WorkItemsController {
  constructor(private readonly workItemsService: WorkItemsService) {}

  // GET /api/work-items — scoped by role in the service (Manager: all, Member: assigned only).
  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.workItemsService.findAllForUser(user);
  }

  // GET /api/work-items/assigned-to-me — must be declared before the `:id` route
  // below, or Nest would match the literal path "assigned-to-me" as an :id instead.
  @Get('assigned-to-me')
  findAssignedToMe(@CurrentUser() user: AuthUser) {
    return this.workItemsService.findAssignedToUser(user.id);
  }

  // GET /api/work-items/:id — 404s if the item doesn't exist or isn't visible to the caller.
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.workItemsService.findOneForUser(id, user);
  }

  // POST /api/work-items — Manager-only; multipart body with an optional image attachment.
  // Bad mime types are rejected in multerImageOptions.fileFilter before any disk write;
  // this pipe only needs to catch an oversized file.
  @Roles('MANAGER')
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
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.workItemsService.remove(id);
  }
}
