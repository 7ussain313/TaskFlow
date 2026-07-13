'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useCreateWorkItem } from '@/hooks/use-work-items';
import { WorkItemForm } from '@/components/work-item-form';

// Manager-only create form; redirects away if a Member somehow lands here
// (the API also enforces this with a 403 — this is just UX, not the real guard).
export default function NewWorkItemPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const createWorkItem = useCreateWorkItem();

  useEffect(() => {
    if (!isLoading && user && user.role !== 'MANAGER') {
      router.replace('/work-items');
    }
  }, [isLoading, user, router]);

  if (!user || user.role !== 'MANAGER') {
    return null;
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">New Work Item</h1>
      <div className="mt-6">
        <WorkItemForm
          submitLabel="Create work item"
          onSubmit={async (input) => {
            const created = await createWorkItem.mutateAsync(input);
            router.push(`/work-items/${created.id}`);
          }}
        />
      </div>
    </div>
  );
}
