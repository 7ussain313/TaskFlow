import Link from 'next/link';

// Placeholder /dashboard screen; real stats/overview + timeline land in Phase 7.
export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-lg font-semibold">Dashboard</h1>
      <p className="mt-2 text-sm text-zinc-500">
        Stats, phase board, and timeline are built in Phase 7. For now, head to{' '}
        <Link href="/work-items" className="underline">
          Work Items
        </Link>{' '}
        to see and manage everything that&apos;s been built so far.
      </p>
    </div>
  );
}
