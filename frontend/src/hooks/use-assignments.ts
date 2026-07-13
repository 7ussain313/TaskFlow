'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { WorkItem } from '@/types/work-item';

// Replaces a work item's assignee list (Manager-only) and refreshes both the list
// and that item's detail cache with the server's resulting state (status may have
// changed too, e.g. BACKLOG -> ASSIGNED).
export function useSetAssignees(workItemId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userIds: string[]) => {
      const { data } = await apiClient.put<WorkItem>(
        `/work-items/${workItemId}/assignments`,
        { userIds },
      );
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['work-items'] });
    },
  });
}
