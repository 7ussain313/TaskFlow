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
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-accent-hover text-lg font-bold text-white shadow-lg shadow-accent/30">
            T
          </span>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Create your account</h1>
            <p className="mt-1 text-sm text-zinc-500">
              New accounts are created as Members. A Manager account is seeded — see the README.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="rounded-2xl border border-border-subtle bg-surface p-8 shadow-xl shadow-black/[.03] dark:shadow-black/20"
        >
          <label htmlFor="name" className="block text-sm font-medium">
            Name
          </label>
          <input
            id="name"
            {...register('name')}
            className="mt-1.5 w-full rounded-lg border border-border-subtle bg-transparent px-3 py-2 text-sm outline-none transition-colors focus:border-accent"
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
            className="mt-1.5 w-full rounded-lg border border-border-subtle bg-transparent px-3 py-2 text-sm outline-none transition-colors focus:border-accent"
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
            className="mt-1.5 w-full rounded-lg border border-border-subtle bg-transparent px-3 py-2 text-sm outline-none transition-colors focus:border-accent"
            placeholder="At least 8 characters"
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
          )}

          {serverError && (
            <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/40">
              {serverError}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 w-full rounded-lg bg-gradient-to-br from-accent to-accent-hover px-4 py-2.5 text-sm font-medium text-white shadow-md shadow-accent/25 transition-all hover:shadow-lg hover:shadow-accent/30 active:scale-[.99] disabled:opacity-50 disabled:shadow-none"
          >
            {isSubmitting ? 'Creating account…' : 'Create account'}
          </button>

          <p className="mt-5 text-center text-sm text-zinc-500">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-accent hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
