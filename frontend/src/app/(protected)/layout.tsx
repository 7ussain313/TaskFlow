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
      <header className="flex items-center justify-between border-b border-black/10 px-6 py-4 dark:border-white/15">
        <div className="flex items-center gap-6">
          <span className="font-semibold">TaskFlow</span>
          <nav className="flex gap-4 text-sm text-zinc-500">
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/board">Board</Link>
            <Link href="/timeline">Timeline</Link>
            <Link href="/work-items">Work Items</Link>
          </nav>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-zinc-500">
            {user.name} · {user.role}
          </span>
          <button
            type="button"
            onClick={() => {
              logout();
              router.replace('/login');
            }}
            className="rounded border border-black/10 px-3 py-1 dark:border-white/15"
          >
            Log out
          </button>
        </div>
      </header>
      <main className="flex flex-1 flex-col p-6">{children}</main>
    </div>
  );
}
