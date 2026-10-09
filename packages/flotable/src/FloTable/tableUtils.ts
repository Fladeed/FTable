import type { ColumnDef, ColumnType, FilterInputType } from './FloTable.types';

export function nextSortDirection(current: 'asc' | 'desc' | null): 'asc' | 'desc' | null {
  if (current === null) return 'asc';
  if (current === 'asc') return 'desc';
  return null;
}

export function columnTypeToFilterInputType(type?: ColumnType): FilterInputType {
  if (type === 'number' || type === 'currency') return 'number';
  if (type === 'date') return 'date';
  if (type === 'boolean') return 'boolean';
  return 'text';
}

/**
 * Case-insensitive substring match of `query` against a row's column values.
 * Used by expandable rows to decide which children match the global search
 * (so their parent auto-expands and the child is highlighted). Returns false
 * for an empty / whitespace-only query.
 */
export function rowMatchesQuery<T extends object>(
  row: T,
  columns: ColumnDef<T>[],
  query: string,
): boolean {
  const q = query.trim().toLowerCase();
  if (q === '') return false;
  return columns.some((col) => {
    const value = (row as Record<string, unknown>)[col.key];
    return String(value ?? '').toLowerCase().includes(q);
  });
}

/** Quick-filter key under which the global search query is stored. */
export const SEARCH_KEY = '__search__';

/**
 * Stable string key for a row: the value of its `rowKey` field, or the row index when that
 * field is missing (`null` / `undefined`). Used for React keys, selection and expansion.
 */
export function getRowKey<T extends object>(row: T, rowKey: string, index: number): string {
  const raw = (row as Record<string, unknown>)[rowKey];
  return raw == null ? String(index) : String(raw);
}
