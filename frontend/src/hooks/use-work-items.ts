'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { Priority, WorkItem, WorkItemStatus } from '@/types/work-item';

export interface WorkItemFilters {
  status?: WorkItemStatus;
  assigneeId?: string;
  priority?: Priority;
}

export interface WorkItemFormInput {
  title: string;
  description?: string;
  priority?: Priority;
  category: string;
  dueDate: string;
  image?: File;
}

// Builds the multipart body the backend's Multer interceptor expects.
function toFormData(input: WorkItemFormInput): FormData {
  const formData = new FormData();
  formData.append('title', input.title);
  if (input.description) formData.append('description', input.description);
  if (input.priority) formData.append('priority', input.priority);
  formData.append('category', input.category);
  formData.append('dueDate', input.dueDate);
  if (input.image) formData.append('image', input.image);
  return formData;
}

// Fetches every work item visible to the current user (scoped server-side by role),
// optionally narrowed by status/assignee/priority (filters are applied on top of
// that scope server-side, never in place of it). Polls in the background so the
// Board/Timeline reflect another user's changes without a manual refresh, on top
// of the immediate refetch every mutation already triggers via cache invalidation.
export function useWorkItems(filters: WorkItemFilters = {}) {
  return useQuery({
    queryKey: ['work-items', filters],
    queryFn: async () => {
      const { data } = await apiClient.get<WorkItem[]>('/work-items', { params: filters });
      return data;
    },
    refetchInterval: 15000,
  });
}

// Fetches a single work item by id; 404s (via the API) if it's not visible to the caller.
export function useWorkItem(id: string) {
  return useQuery({
    queryKey: ['work-items', id],
    queryFn: async () => {
      const { data } = await apiClient.get<WorkItem>(`/work-items/${id}`);
      return data;
    },
    enabled: Boolean(id),
  });
}

// Creates a work item and refreshes the list so the new item shows up immediately.
export function useCreateWorkItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: WorkItemFormInput) => {
      const { data } = await apiClient.post<WorkItem>('/work-items', toFormData(input));
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['work-items'] });
    },
  });
}

// Updates a work item and refreshes both the list and that item's detail cache.
export function useUpdateWorkItem(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: WorkItemFormInput) => {
      const { data } = await apiClient.patch<WorkItem>(`/work-items/${id}`, toFormData(input));
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['work-items'] });
    },
  });
}

// Deletes a work item and refreshes the list.
export function useDeleteWorkItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/work-items/${id}`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['work-items'] });
    },
  });
}
