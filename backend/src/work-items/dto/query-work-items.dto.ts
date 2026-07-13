import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Priority, WorkItemStatus } from '@prisma/client';

export enum WorkItemSortBy {
  DUE_DATE = 'dueDate',
  PRIORITY = 'priority',
  STATUS = 'status',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class QueryWorkItemsDto {
  @ApiPropertyOptional({ enum: WorkItemStatus })
  @IsOptional()
  @IsEnum(WorkItemStatus)
  status?: WorkItemStatus;

  @ApiPropertyOptional({ description: 'A Member user id' })
  @IsOptional()
  @IsUUID('4')
  assigneeId?: string;

  @ApiPropertyOptional({ enum: Priority })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @ApiPropertyOptional({
    description: 'Case-insensitive match against title or description',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    enum: WorkItemSortBy,
    default: WorkItemSortBy.DUE_DATE,
  })
  @IsOptional()
  @IsEnum(WorkItemSortBy)
  sortBy?: WorkItemSortBy;

  @ApiPropertyOptional({ enum: SortOrder, default: SortOrder.ASC })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder;

  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 200, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number;
}
