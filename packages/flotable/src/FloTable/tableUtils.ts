import type { ColumnType, FilterInputType } from './FloTable.types';

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
