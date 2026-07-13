// Shimmering placeholder block used everywhere a "Loading…" state needs to show
// real structure instead of a bare sentence — reused across board/timeline/
// dashboard/list/detail so a loading page never looks emptier than the loaded one.
export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}
