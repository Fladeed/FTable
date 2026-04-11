import type { CSSProperties, ReactNode } from 'react';

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

/**
 * Custom class names for each part of the table.
 * Passed through to the corresponding DOM elements alongside the built-in classes.
 */
export interface FTableClassNames {
  /** Outermost container `<div>` */
  root?: string;
  /** Horizontal-scroll wrapper `<div>` */
  wrapper?: string;
  /** `<table>` element */
  table?: string;
  /** `<thead>` element */
  header?: string;
  /** `<tr>` inside `<thead>` */
  headerRow?: string;
  /** Each `<th>` header cell */
  headerCell?: string;
  /** `<tbody>` element */
  body?: string;
  /** Each `<tr>` row in `<tbody>` */
  row?: string;
  /** Each `<td>` data cell */
  cell?: string;
  /** Pagination container */
  pagination?: string;
  /** Prev / Next buttons */
  paginationButton?: string;
  /** Filter bar container `<div>` */
  filterBar?: string;
  /** Each filter pill container `<div>` */
  filterPill?: string;
  /** Filter pill trigger `<button>` */
  filterPillTrigger?: string;
  /** Filter pill `<input>` or `<select>` */
  filterPillInput?: string;
}

/**
 * Inline styles for each part of the table.
 * CSS custom properties (e.g. `--ftable-border-color`) are accepted via a cast
 * and will propagate to all child elements that reference them.
 */
export type FTableStyleValue = CSSProperties & { [cssVar: `--${string}`]: string | number };

export interface FTableStyles {
  root?: FTableStyleValue;
  wrapper?: FTableStyleValue;
  table?: FTableStyleValue;
  header?: FTableStyleValue;
  headerRow?: FTableStyleValue;
  headerCell?: FTableStyleValue;
  body?: FTableStyleValue;
  row?: FTableStyleValue;
  cell?: FTableStyleValue;
  pagination?: FTableStyleValue;
  paginationButton?: FTableStyleValue;
  filterBar?: FTableStyleValue;
  filterPill?: FTableStyleValue;
  filterPillTrigger?: FTableStyleValue;
  filterPillInput?: FTableStyleValue;
}

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
  /** Custom class names for individual table parts. */
  classNames?: FTableClassNames;
  /** Inline styles for individual table parts. CSS custom properties are accepted. */
  styles?: FTableStyles;
}

export interface TableHeaderProps<T extends object> {
  columns: ColumnDef<T>[];
  sortState: SortState<T> | null;
  onSort: (key: keyof T & string) => void;
  classNames?: FTableClassNames;
  styles?: FTableStyles;
}

export interface TableRowProps<T extends object> {
  row: T;
  columns: ColumnDef<T>[];
  classNames?: FTableClassNames;
  styles?: FTableStyles;
}

export interface TableBodyProps<T extends object> {
  columns: ColumnDef<T>[];
  rows: T[];
  classNames?: FTableClassNames;
  styles?: FTableStyles;
}

export interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  classNames?: FTableClassNames;
  styles?: FTableStyles;
}
