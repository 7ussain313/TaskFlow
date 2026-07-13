'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { Assignee } from '@/types/work-item';

export interface ActivityLogEntry {
  id: string;
  action: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  actor: Assignee;
}

// Fetches a work item's activity log, newest first.
export function useActivityLog(workItemId: string) {
  return useQuery({
    queryKey: ['work-items', workItemId, 'activity'],
    queryFn: async () => {
      const { data } = await apiClient.get<ActivityLogEntry[]>(
        `/work-items/${workItemId}/activity`,
      );
      return data;
    },
    enabled: Boolean(workItemId),
  });
}
