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
    // The member roster changes rarely (new registrations only) compared to work
    // items — a 5min staleTime means switching between the assignee picker, the
    // filter bar, and the assignees editor reuses one cached fetch instead of
    // three, without the list ever going noticeably stale.
    staleTime: 5 * 60 * 1000,
  });
}
