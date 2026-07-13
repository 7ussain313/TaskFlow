type StatTileAccent = 'neutral' | 'good' | 'critical';

const ACCENT_CLASSES: Record<StatTileAccent, string> = {
  neutral: 'text-foreground',
  good: 'text-status-done',
  critical: 'text-status-overdue',
};

interface StatTileProps {
  label: string;
  value: number;
  accent?: StatTileAccent;
}

// Stat tile: sentence-case label, large semibold value — the dashboard's headline
// numbers. Accent color (when used) always sits beside a label, never carries
// meaning by itself.
export function StatTile({ label, value, accent = 'neutral' }: StatTileProps) {
  return (
    <div className="rounded border border-black/10 p-4 dark:border-white/15">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className={`mt-1 text-3xl font-semibold ${ACCENT_CLASSES[accent]}`}>{value}</p>
    </div>
  );
}
