'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { Assignee } from '@/types/work-item';

// Fetches all Member accounts — Manager-only, powers the assignee picker.
export function useMembers() {
  return useQuery({
    queryKey: ['users', 'MEMBER'],
    queryFn: async () => {
      const { data } = await apiClient.get<Assignee[]>('/users', { params: { role: 'MEMBER' } });
      return data;
    },
  });
}
