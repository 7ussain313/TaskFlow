'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/board', label: 'Board' },
  { href: '/timeline', label: 'Timeline' },
  { href: '/work-items', label: 'Work Items' },
];

// Wraps every page under this route group: redirects to /login if not signed in,
// otherwise renders the shared nav header + the page content.
export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-border-strong border-t-accent" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-10 flex flex-col gap-3 border-b border-border-subtle bg-background/80 px-4 py-4 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent-hover text-sm font-bold text-white shadow-sm shadow-accent/30">
              T
            </span>
            TaskFlow
          </Link>
          <nav className="flex flex-wrap gap-1 text-sm">
            {NAV_LINKS.map((link) => {
              const isActive =
                pathname === link.href || (link.href !== '/dashboard' && pathname?.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-md px-3 py-1.5 font-medium transition-colors ${
                    isActive
                      ? 'bg-accent-soft text-accent'
                      : 'text-zinc-500 hover:bg-surface-hover hover:text-foreground'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="flex items-center gap-2 rounded-full border border-border-subtle bg-surface px-3 py-1 text-zinc-500 shadow-sm">
            <span className="font-medium text-foreground">{user.name}</span>
            <span className="h-1 w-1 rounded-full bg-zinc-400" />
            <span className="text-xs font-semibold uppercase tracking-wide text-accent">
              {user.role}
            </span>
          </span>
          <button
            type="button"
            onClick={() => {
              logout();
              router.replace('/login');
            }}
            className="rounded-md border border-border-subtle px-3 py-1.5 text-sm font-medium transition-colors hover:border-border-strong hover:bg-surface-hover"
          >
            Log out
          </button>
        </div>
      </header>
      <main className="flex flex-1 flex-col p-4 sm:p-6">
        <div className="mx-auto w-full max-w-6xl animate-fade-in">{children}</div>
      </main>
    </div>
  );
}
