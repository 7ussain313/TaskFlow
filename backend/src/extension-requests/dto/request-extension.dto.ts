import { IsDateString } from 'class-validator';

export class RequestExtensionDto {
  @IsDateString()
  proposedDueDate: string;
}
