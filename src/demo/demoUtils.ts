import type { SortState } from '@/components/FTable/FTable.types';

/**
 * Client-side sort simulation for the demo app only.
 * Real consumers send sortState as query params to their API — they never call this.
 */
export function applySorting<T extends object>(
  data: T[],
  sortState: SortState<T> | null,
): T[] {
  if (!sortState) return data;

  const { key, direction } = sortState;

  return [...data].sort((a, b) => {
    const aVal = (a as Record<string, unknown>)[key];
    const bVal = (b as Record<string, unknown>)[key];

    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return 1;
    if (bVal == null) return -1;

    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;

    return 0;
  });
}
