'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

// Wraps every page under this route group: redirects to /login if not signed in,
// otherwise renders the shared nav header + the page content.
export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-zinc-500">
        Loading…
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex flex-col gap-3 border-b border-black/10 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 dark:border-white/15">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
          <span className="font-semibold">TaskFlow</span>
          <nav className="flex flex-wrap gap-4 text-sm text-zinc-500">
            <Link href="/dashboard" className="transition-colors hover:text-foreground">
              Dashboard
            </Link>
            <Link href="/board" className="transition-colors hover:text-foreground">
              Board
            </Link>
            <Link href="/timeline" className="transition-colors hover:text-foreground">
              Timeline
            </Link>
            <Link href="/work-items" className="transition-colors hover:text-foreground">
              Work Items
            </Link>
          </nav>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span className="text-zinc-500">
            {user.name} · {user.role}
          </span>
          <button
            type="button"
            onClick={() => {
              logout();
              router.replace('/login');
            }}
            className="rounded border border-black/10 px-3 py-1 transition-colors hover:bg-black/[.03] dark:border-white/15 dark:hover:bg-white/[.05]"
          >
            Log out
          </button>
        </div>
      </header>
      <main className="flex flex-1 flex-col p-4 sm:p-6">{children}</main>
    </div>
  );
}
