import type { ReactNode } from 'react';

export type ColumnType =
  | 'text'
  | 'number'
  | 'date'
  | 'boolean'
  | 'badge'
  | 'currency'
  | 'link';

export type SortDirection = 'asc' | 'desc' | null;

export interface SortState<T extends object> {
  key: keyof T & string;
  direction: 'asc' | 'desc';
}

export interface ColumnDef<T extends object> {
  key: keyof T & string;
  header: string;
  type?: ColumnType;
  sortable?: boolean;
  /** Badge type: maps each enum value to a background color. */
  badgeColors?: Record<string, string>;
  /** Currency type: ISO 4217 currency code (default: 'USD'). */
  currency?: string;
  /** Number / date / currency: BCP 47 locale string (default: browser locale). */
  locale?: string;
  /**
   * Custom render function — takes precedence over `type`.
   * Mirrors Ant Design's column `render` prop.
   */
  render?: (value: T[keyof T], row: T) => ReactNode;
  /** When autoFilters is enabled on FTable, columns with filterable: true get a pill generated automatically. */
  filterable?: boolean;
}

export type FilterInputType = 'text' | 'number' | 'date' | 'boolean' | 'select';

export interface FilterDef {
  key: string;
  label: string;
  type: FilterInputType;
  /** Option values for the 'select' input type. */
  options?: string[];
}

/** Flat map of filter key → active string value. An absent key means no filter is applied. */
export type QuickFilterState = Partial<Record<string, string>>;

export interface FTableProps<T extends object> {
  columns: ColumnDef<T>[];
  /** Current page rows only — already paginated by the server (or the consumer). */
  data: T[];
  /** Total number of rows across all pages (used to compute page count). */
  totalRows: number;
  /** Currently active page (1-based, controlled). */
  page: number;
  pageSize?: number;
  /** Called when the user navigates to a different page. */
  onPageChange: (page: number) => void;
  /** Currently active sort (controlled). Pass null for unsorted. */
  sortState?: SortState<T> | null;
  /** Called when the user clicks a sortable column header. */
  onSortChange?: (sort: SortState<T> | null) => void;
  /** Explicit consumer-defined filter pills. Keys can be any string (column keys or server params). */
  filterDefs?: FilterDef[];
  /** When true, auto-generates pills from columns that have filterable: true. Merged with filterDefs. */
  autoFilters?: boolean;
  /** Active quick filters (controlled). */
  quickFilters?: QuickFilterState;
  /** Called when the user changes any filter value. */
  onFilterChange?: (filters: QuickFilterState) => void;
  /** When true, renders a global search input at the start of the filter bar. Value stored under the reserved key '__search__'. */
  showSearch?: boolean;
}

export interface TableHeaderProps<T extends object> {
  columns: ColumnDef<T>[];
  sortState: SortState<T> | null;
  onSort: (key: keyof T & string) => void;
}

export interface TableRowProps<T extends object> {
  row: T;
  columns: ColumnDef<T>[];
}

export interface TableBodyProps<T extends object> {
  columns: ColumnDef<T>[];
  rows: T[];
}

export interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}
