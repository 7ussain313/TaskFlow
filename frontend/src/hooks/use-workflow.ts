'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { WorkItem } from '@/types/work-item';

type WorkflowActionPath = 'start' | 'submit-review' | 'accept' | 'send-back' | 'cancel' | 'reopen';

// One mutation hook per workflow action — each just POSTs to its action endpoint
// and refreshes the work-items cache with the server's resulting state.
function useWorkflowAction(workItemId: string, action: WorkflowActionPath) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post<WorkItem>(`/work-items/${workItemId}/${action}`);
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['work-items'] });
    },
  });
}

export function useStartWork(workItemId: string) {
  return useWorkflowAction(workItemId, 'start');
}
export function useSubmitReview(workItemId: string) {
  return useWorkflowAction(workItemId, 'submit-review');
}
export function useAccept(workItemId: string) {
  return useWorkflowAction(workItemId, 'accept');
}
export function useSendBack(workItemId: string) {
  return useWorkflowAction(workItemId, 'send-back');
}
export function useCancel(workItemId: string) {
  return useWorkflowAction(workItemId, 'cancel');
}
export function useReopen(workItemId: string) {
  return useWorkflowAction(workItemId, 'reopen');
}
