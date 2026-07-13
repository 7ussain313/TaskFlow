'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { getErrorMessage } from '@/lib/get-error-message';
import type { LoginResponse } from '@/types/auth';

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

// Registers a new MEMBER account (role is always MEMBER server-side — see
// SYSTEM_DESIGN.md), logs them straight in, and redirects.
export default function RegisterPage() {
  const auth = useAuth();
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (values: RegisterFormValues) => {
    setServerError(null);
    try {
      const { data } = await apiClient.post<LoginResponse>('/auth/register', values);
      auth.login(data.accessToken, data.user);
      router.push('/dashboard');
    } catch (error) {
      setServerError(getErrorMessage(error));
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-sm rounded-lg border border-black/10 p-8 dark:border-white/15"
      >
        <h1 className="text-xl font-semibold">Create your TaskFlow account</h1>
        <p className="mt-1 text-xs text-zinc-500">
          New accounts are created as Members. A Manager account is seeded — see the README.
        </p>

        <label htmlFor="name" className="mt-6 block text-sm font-medium">
          Name
        </label>
        <input
          id="name"
          {...register('name')}
          className="mt-1 w-full rounded border border-black/15 px-3 py-2 text-sm dark:border-white/20 dark:bg-transparent"
          placeholder="Jane Doe"
        />
        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}

        <label htmlFor="email" className="mt-4 block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          {...register('email')}
          className="mt-1 w-full rounded border border-black/15 px-3 py-2 text-sm dark:border-white/20 dark:bg-transparent"
          placeholder="jane@taskflow.dev"
        />
        {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}

        <label htmlFor="password" className="mt-4 block text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          type="password"
          {...register('password')}
          className="mt-1 w-full rounded border border-black/15 px-3 py-2 text-sm dark:border-white/20 dark:bg-transparent"
          placeholder="At least 8 characters"
        />
        {errors.password && (
          <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
        )}

        {serverError && <p className="mt-4 text-sm text-red-600">{serverError}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-6 w-full rounded bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </button>

        <p className="mt-4 text-center text-sm text-zinc-500">
          Already have an account?{' '}
          <Link href="/login" className="underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
