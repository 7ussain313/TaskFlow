import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { Priority, WorkItemStatus } from '@prisma/client';

export class QueryWorkItemsDto {
  @IsOptional()
  @IsEnum(WorkItemStatus)
  status?: WorkItemStatus;

  @IsOptional()
  @IsUUID('4')
  assigneeId?: string;

  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;
}
