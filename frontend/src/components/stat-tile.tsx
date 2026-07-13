import type { ReactNode } from 'react';

type StatTileAccent = 'neutral' | 'good' | 'critical';

const ACCENT_CLASSES: Record<StatTileAccent, string> = {
  neutral: 'text-foreground',
  good: 'text-status-done',
  critical: 'text-status-overdue',
};

const ICON_WRAP_CLASSES: Record<StatTileAccent, string> = {
  neutral: 'bg-accent-soft text-accent',
  good: 'bg-status-done/10 text-status-done',
  critical: 'bg-status-overdue/10 text-status-overdue',
};

interface StatTileProps {
  label: string;
  value: number;
  accent?: StatTileAccent;
  icon?: ReactNode;
}

// Stat tile: sentence-case label, large semibold value — the dashboard's headline
// numbers. Accent color (when used) always sits beside a label, never carries
// meaning by itself.
export function StatTile({ label, value, accent = 'neutral', icon }: StatTileProps) {
  return (
    <div className="rounded-xl border border-border-subtle bg-surface p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">{label}</p>
        {icon && (
          <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${ICON_WRAP_CLASSES[accent]}`}>
            {icon}
          </span>
        )}
      </div>
      <p className={`mt-2 text-3xl font-semibold tracking-tight ${ACCENT_CLASSES[accent]}`}>{value}</p>
    </div>
  );
}
