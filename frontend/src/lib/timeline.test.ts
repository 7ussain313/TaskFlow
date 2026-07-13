import { describe, expect, it } from 'vitest';
import { findTodayMarkerIndex, formatGroupHeading, groupByDate } from './timeline';
import type { WorkItem } from '@/types/work-item';

// Minimal fixture — only the fields groupByDate/findTodayMarkerIndex actually read.
function item(id: string, dueDateIso: string): WorkItem {
  return {
    id,
    title: id,
    description: null,
    priority: 'MEDIUM',
    category: 'Test',
    dueDate: dueDateIso,
    status: 'BACKLOG',
    imagePath: null,
    createdById: 'creator',
    createdAt: dueDateIso,
    updatedAt: dueDateIso,
    assignees: [],
    pendingExtensionRequest: null,
    isOverdue: false,
  };
}

describe('groupByDate', () => {
  it('buckets items due on the same calendar day together, preserving order', () => {
    const items = [
      item('a', '2026-07-10T09:00:00.000Z'),
      item('b', '2026-07-10T18:00:00.000Z'),
      item('c', '2026-07-11T09:00:00.000Z'),
    ];

    const groups = groupByDate(items);

    expect(groups).toHaveLength(2);
    expect(groups[0].items.map((i) => i.id)).toEqual(['a', 'b']);
    expect(groups[1].items.map((i) => i.id)).toEqual(['c']);
  });

  it('returns an empty array for no items', () => {
    expect(groupByDate([])).toEqual([]);
  });

  it('does not merge two non-adjacent groups that happen to share a date', () => {
    // Out-of-chronological-order input (shouldn't happen from the API, but the
    // grouping is a simple adjacent-bucket pass, not a full re-sort) — same-day
    // items separated by a different day become two distinct groups.
    const items = [
      item('a', '2026-07-10T09:00:00.000Z'),
      item('b', '2026-07-11T09:00:00.000Z'),
      item('c', '2026-07-10T18:00:00.000Z'),
    ];

    const groups = groupByDate(items);

    expect(groups).toHaveLength(3);
  });
});

describe('formatGroupHeading', () => {
  const now = new Date('2026-07-13T12:00:00');

  it('labels today, tomorrow, and yesterday relative to `now`', () => {
    expect(formatGroupHeading(new Date('2026-07-13T00:00:00').toDateString(), now)).toBe('Today');
    expect(formatGroupHeading(new Date('2026-07-14T00:00:00').toDateString(), now)).toBe(
      'Tomorrow',
    );
    expect(formatGroupHeading(new Date('2026-07-12T00:00:00').toDateString(), now)).toBe(
      'Yesterday',
    );
  });

  it('falls back to a full date string further out', () => {
    const heading = formatGroupHeading(new Date('2026-07-20T00:00:00').toDateString(), now);
    expect(heading).toContain('2026');
    expect(heading).not.toBe('Today');
  });
});

describe('findTodayMarkerIndex', () => {
  const now = new Date('2026-07-13T12:00:00');

  it('finds the exact group when something is due today', () => {
    const groups = groupByDate([
      item('past', '2026-07-10T09:00:00'),
      item('today', '2026-07-13T09:00:00'),
      item('future', '2026-07-15T09:00:00'),
    ]);

    expect(findTodayMarkerIndex(groups, now)).toBe(1);
  });

  it('finds the first future group when nothing is due exactly today', () => {
    const groups = groupByDate([
      item('past', '2026-07-10T09:00:00'),
      item('future', '2026-07-15T09:00:00'),
    ]);

    expect(findTodayMarkerIndex(groups, now)).toBe(1);
  });

  it('returns -1 when every item is already in the past', () => {
    const groups = groupByDate([item('past', '2026-07-10T09:00:00')]);

    expect(findTodayMarkerIndex(groups, now)).toBe(-1);
  });

  it('returns 0 when every item is in the future', () => {
    const groups = groupByDate([item('future', '2026-07-15T09:00:00')]);

    expect(findTodayMarkerIndex(groups, now)).toBe(0);
  });
});
