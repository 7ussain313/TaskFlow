import { IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RequestExtensionDto {
  @ApiProperty({ example: '2026-08-01T10:00:00.000Z' })
  @IsDateString()
  proposedDueDate: string;
}
