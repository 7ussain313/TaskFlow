'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { WorkItem } from '@/types/work-item';

// Member (assignee) proposes a new due date for a work item.
export function useRequestExtension(workItemId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (proposedDueDate: string) => {
      const { data } = await apiClient.post<WorkItem>(
        `/work-items/${workItemId}/extension-requests`,
        { proposedDueDate },
      );
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['work-items'] });
    },
  });
}

// Manager approves or rejects a pending extension request by its own id.
function useDecideExtension(action: 'approve' | 'reject') {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (extensionRequestId: string) => {
      const { data } = await apiClient.post<WorkItem>(
        `/extension-requests/${extensionRequestId}/${action}`,
      );
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['work-items'] });
    },
  });
}

export function useApproveExtension() {
  return useDecideExtension('approve');
}
export function useRejectExtension() {
  return useDecideExtension('reject');
}
