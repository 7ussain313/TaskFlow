import { IsArray, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// Replaces a work item's entire assignee list. An empty array is valid — it means
// "unassign everyone," which triggers the auto-fallback-to-Backlog business rule.
export class SetAssigneesDto {
  @ApiProperty({
    type: [String],
    description: 'Member user ids; empty array unassigns everyone',
  })
  @IsArray()
  @IsUUID('4', { each: true })
  userIds: string[];
}
