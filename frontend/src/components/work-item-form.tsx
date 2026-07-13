'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getErrorMessage } from '@/lib/get-error-message';
import type { WorkItemFormInput } from '@/hooks/use-work-items';

const workItemSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(5000).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  category: z.string().min(1, 'Category is required').max(100),
  dueDateLocal: z.string().min(1, 'Due date is required'),
});

type WorkItemFormValues = z.infer<typeof workItemSchema>;

interface WorkItemFormProps {
  defaultValues?: Partial<WorkItemFormValues>;
  existingImageUrl?: string | null;
  submitLabel: string;
  onSubmit: (input: WorkItemFormInput) => Promise<void>;
}

// Shared create/edit form for work items — text fields go through RHF+Zod, the
// image file is handled separately (Zod's FileList type breaks under SSR).
export function WorkItemForm({
  defaultValues,
  existingImageUrl,
  submitLabel,
  onSubmit,
}: WorkItemFormProps) {
  const [image, setImage] = useState<File | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<WorkItemFormValues>({
    resolver: zodResolver(workItemSchema),
    defaultValues: { priority: 'MEDIUM', ...defaultValues },
  });

  const submit = async (values: WorkItemFormValues) => {
    setServerError(null);
    try {
      await onSubmit({
        title: values.title,
        description: values.description,
        priority: values.priority,
        category: values.category,
        dueDate: new Date(values.dueDateLocal).toISOString(),
        image: image ?? undefined,
      });
    } catch (error) {
      setServerError(getErrorMessage(error));
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="max-w-lg space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium">
          Title
        </label>
        <input
          id="title"
          {...register('title')}
          className="mt-1 w-full rounded border border-black/15 px-3 py-2 text-sm dark:border-white/20 dark:bg-transparent"
        />
        {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium">
          Description
        </label>
        <textarea
          id="description"
          {...register('description')}
          rows={4}
          className="mt-1 w-full rounded border border-black/15 px-3 py-2 text-sm dark:border-white/20 dark:bg-transparent"
        />
        {errors.description && (
          <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="priority" className="block text-sm font-medium">
            Priority
          </label>
          <select
            id="priority"
            {...register('priority')}
            className="mt-1 w-full rounded border border-black/15 px-3 py-2 text-sm dark:border-white/20 dark:bg-transparent"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium">
            Category
          </label>
          <input
            id="category"
            {...register('category')}
            placeholder="Hardware, Network, Access…"
            className="mt-1 w-full rounded border border-black/15 px-3 py-2 text-sm dark:border-white/20 dark:bg-transparent"
          />
          {errors.category && (
            <p className="mt-1 text-xs text-red-600">{errors.category.message}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="dueDateLocal" className="block text-sm font-medium">
          Due date &amp; time
        </label>
        <input
          id="dueDateLocal"
          type="datetime-local"
          {...register('dueDateLocal')}
          className="mt-1 w-full rounded border border-black/15 px-3 py-2 text-sm dark:border-white/20 dark:bg-transparent"
        />
        {errors.dueDateLocal && (
          <p className="mt-1 text-xs text-red-600">{errors.dueDateLocal.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="image" className="block text-sm font-medium">
          Image attachment (PNG/JPEG/WEBP, max 5MB)
        </label>
        {existingImageUrl && !image && (
          <Image
            src={existingImageUrl}
            alt="Current attachment"
            width={96}
            height={96}
            className="mt-2 h-24 w-24 rounded object-cover"
          />
        )}
        <input
          id="image"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(e) => setImage(e.target.files?.[0] ?? null)}
          className="mt-1 w-full text-sm"
        />
      </div>

      {serverError && <p className="text-sm text-red-600">{serverError}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {isSubmitting ? 'Saving…' : submitLabel}
      </button>
    </form>
  );
}
