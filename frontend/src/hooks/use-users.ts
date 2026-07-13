'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { Assignee } from '@/types/work-item';

// Fetches all Member accounts — Manager-only, powers the assignee picker. Callers
// that render for both roles (e.g. a filter bar shown to everyone) must pass
// `enabled: false` when the current user isn't a Manager — the endpoint 403s for
// anyone else, and firing it anyway just produces a needless failed request.
export function useMembers(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ['users', 'MEMBER'],
    queryFn: async () => {
      const { data } = await apiClient.get<Assignee[]>('/users', { params: { role: 'MEMBER' } });
      return data;
    },
    enabled: options.enabled ?? true,
  });
}
