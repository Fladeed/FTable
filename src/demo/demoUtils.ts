import type { SortState, QuickFilterState } from '@/components/FTable/FTable.types';

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

/**
 * Client-side filter simulation for the demo app only.
 * Real consumers send quickFilters as query params to their API — they never call this.
 */
export function applyFilters<T extends object>(
  data: T[],
  filters: QuickFilterState,
): T[] {
  const entries = Object.entries(filters) as [keyof T & string, string][];
  if (entries.length === 0) return data;

  return data.filter((row) =>
    entries.every(([key, filterValue]) => {
      if (filterValue === '') return true;

      // Reserved key: global search across all row fields
      if (key === '__search__') {
        return Object.values(row as Record<string, unknown>).some((v) =>
          String(v ?? '').toLowerCase().includes(filterValue.toLowerCase()),
        );
      }

      const rawValue = (row as Record<string, unknown>)[key];
      if (typeof rawValue === 'boolean') {
        return String(rawValue) === filterValue;
      }
      if (typeof rawValue === 'number') {
        return String(rawValue) === filterValue;
      }
      return String(rawValue ?? '').toLowerCase().includes(filterValue.toLowerCase());
    }),
  );
}

