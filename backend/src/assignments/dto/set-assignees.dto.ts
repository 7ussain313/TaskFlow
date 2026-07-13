import { IsArray, IsUUID } from 'class-validator';

// Replaces a work item's entire assignee list. An empty array is valid — it means
// "unassign everyone," which triggers the auto-fallback-to-Backlog business rule.
export class SetAssigneesDto {
  @IsArray()
  @IsUUID('4', { each: true })
  userIds: string[];
}
