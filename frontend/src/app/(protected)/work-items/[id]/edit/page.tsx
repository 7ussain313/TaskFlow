'use client';

import { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useUpdateWorkItem, useWorkItem } from '@/hooks/use-work-items';
import { WorkItemForm } from '@/components/work-item-form';
import { useWorkItemImage } from '@/hooks/use-work-item-image';
import { toDatetimeLocalValue } from '@/lib/datetime-local';
import { Skeleton } from '@/components/skeleton';

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
  const existingImageUrl = useWorkItemImage(item?.id ?? null, Boolean(item?.imagePath));

  useEffect(() => {
    if (!authLoading && user && user.role !== 'MANAGER') {
      router.replace(`/work-items/${id}`);
    }
  }, [authLoading, user, router, id]);

  if (!user || user.role !== 'MANAGER') {
    return null;
  }

  if (isLoading || !item) {
    return (
      <div className="max-w-lg space-y-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Edit Work Item</h1>
      <div className="mt-6">
        <WorkItemForm
          submitLabel="Save changes"
          existingImageUrl={existingImageUrl}
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
