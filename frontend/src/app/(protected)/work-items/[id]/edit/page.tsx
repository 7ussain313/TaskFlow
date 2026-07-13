'use client';

import { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useUpdateWorkItem, useWorkItem } from '@/hooks/use-work-items';
import { WorkItemForm } from '@/components/work-item-form';
import { getImageUrl } from '@/lib/image-url';
import { toDatetimeLocalValue } from '@/lib/datetime-local';

// Manager-only edit form, pre-filled from the existing work item.
export default function EditWorkItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { data: item, isLoading } = useWorkItem(id);
  const updateWorkItem = useUpdateWorkItem(id);

  useEffect(() => {
    if (!authLoading && user && user.role !== 'MANAGER') {
      router.replace(`/work-items/${id}`);
    }
  }, [authLoading, user, router, id]);

  if (!user || user.role !== 'MANAGER') {
    return null;
  }

  if (isLoading || !item) {
    return <p className="text-sm text-zinc-500">Loading…</p>;
  }

  return (
    <div>
      <h1 className="text-lg font-semibold">Edit Work Item</h1>
      <div className="mt-6">
        <WorkItemForm
          submitLabel="Save changes"
          existingImageUrl={getImageUrl(item.imagePath)}
          defaultValues={{
            title: item.title,
            description: item.description ?? undefined,
            priority: item.priority,
            category: item.category,
            dueDateLocal: toDatetimeLocalValue(item.dueDate),
          }}
          onSubmit={async (input) => {
            await updateWorkItem.mutateAsync(input);
            router.push(`/work-items/${id}`);
          }}
        />
      </div>
    </div>
  );
}
