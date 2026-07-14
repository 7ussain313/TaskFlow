'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { getErrorMessage } from '@/lib/get-error-message';
import type { LoginResponse } from '@/types/auth';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// useSearchParams needs a Suspense boundary in the App Router, or static
// prerendering of this page fails at build time.
export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

// Real login form: submits to POST /auth/login, stores the token, then redirects.
function LoginForm() {
  const auth = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionExpired = searchParams.get('sessionExpired') === '1';
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);
    try {
      const { data } = await apiClient.post<LoginResponse>('/auth/login', values);
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
            <h1 className="text-xl font-semibold tracking-tight">Sign in to TaskFlow</h1>
            <p className="mt-1 text-sm text-zinc-500">
              Track work items from Backlog to Done.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="rounded-2xl border border-border-subtle bg-surface p-8 shadow-xl shadow-black/[.03] dark:shadow-black/20"
        >
          {sessionExpired && (
            <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
              Your session has expired. Please log in again.
            </p>
          )}

          <label htmlFor="email" className="block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            {...register('email')}
            className="mt-1.5 w-full rounded-lg border border-border-subtle bg-transparent px-3 py-2 text-sm outline-none transition-colors focus:border-accent"
            placeholder="manager@taskflow.dev"
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
            placeholder="••••••••"
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
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>

          <p className="mt-5 text-center text-sm text-zinc-500">
            No account?{' '}
            <Link href="/register" className="font-medium text-accent hover:underline">
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
