export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type WorkItemStatus =
  | 'BACKLOG'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'IN_REVIEW'
  | 'DONE'
  | 'CANCELLED';

export interface Assignee {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface WorkItem {
  id: string;
  title: string;
  description: string | null;
  priority: Priority;
  category: string;
  dueDate: string;
  status: WorkItemStatus;
  imagePath: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  assignees: Assignee[];
  isOverdue: boolean;
}
