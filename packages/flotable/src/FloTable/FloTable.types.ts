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
  /** When autoFilters is enabled on FloTable, columns with filterable: true get a pill generated automatically. */
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
export interface FloTableClassNames {
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
 * CSS custom properties (e.g. `--flotable-border-color`) are accepted via a cast
 * and will propagate to all child elements that reference them.
 */
export type FloTableStyleValue = CSSProperties & { [cssVar: `--${string}`]: string | number };

export interface FloTableStyles {
  root?: FloTableStyleValue;
  wrapper?: FloTableStyleValue;
  table?: FloTableStyleValue;
  header?: FloTableStyleValue;
  headerRow?: FloTableStyleValue;
  headerCell?: FloTableStyleValue;
  body?: FloTableStyleValue;
  row?: FloTableStyleValue;
  cell?: FloTableStyleValue;
  pagination?: FloTableStyleValue;
  paginationButton?: FloTableStyleValue;
  filterBar?: FloTableStyleValue;
  filterPill?: FloTableStyleValue;
  filterPillTrigger?: FloTableStyleValue;
  filterPillInput?: FloTableStyleValue;
}

/** Parameters passed to the `request` function on each fetch. */
export interface FloTableRequestParams<T extends object> {
  page: number;
  pageSize: number;
  sortState: SortState<T> | null;
  quickFilters: QuickFilterState;
}

/** The object the `request` function must resolve with. */
export interface FloTableRequestResult<T extends object> {
  data: T[];
  totalRows: number;
}

/** Async function signature for the `request` prop. */
export type FloTableRequestFn<T extends object> = (
  params: FloTableRequestParams<T>,
) => Promise<FloTableRequestResult<T>>;

interface FloTableBaseProps<T extends object> {
  columns: ColumnDef<T>[];
  pageSize?: number;
  /** Explicit consumer-defined filter pills. Keys can be any string (column keys or server params). */
  filterDefs?: FilterDef[];
  /** When true, auto-generates pills from columns that have filterable: true. Merged with filterDefs. */
  autoFilters?: boolean;
  /** When true, renders a global search input at the start of the filter bar. Value stored under the reserved key '__search__'. */
  showSearch?: boolean;
  /** Custom class names for individual table parts. */
  classNames?: FloTableClassNames;
  /** Inline styles for individual table parts. CSS custom properties are accepted. */
  styles?: FloTableStyles;
}

/**
 * Controlled (data) mode — the consumer supplies pre-fetched rows, pagination, sort, and filters.
 * Cannot be combined with `request`.
 */
export interface FloTableDataProps<T extends object> extends FloTableBaseProps<T> {
  /** Current page rows only — already paginated by the server (or the consumer). */
  data: T[];
  /** Total number of rows across all pages (used to compute page count). */
  totalRows: number;
  /** Currently active page (1-based, controlled). */
  page: number;
  /** Called when the user navigates to a different page. */
  onPageChange: (page: number) => void;
  /** Currently active sort (controlled). Pass null for unsorted. */
  sortState?: SortState<T> | null;
  /** Called when the user clicks a sortable column header. */
  onSortChange?: (sort: SortState<T> | null) => void;
  /** Active quick filters (controlled). */
  quickFilters?: QuickFilterState;
  /** Called when the user changes any filter value. */
  onFilterChange?: (filters: QuickFilterState) => void;
  request?: never;
}

/**
 * Request mode — FloTable manages its own page / sort / filter state and calls
 * the provided async function whenever those change.
 * Cannot be combined with `data`.
 */
export interface FloTableRequestProps<T extends object> extends FloTableBaseProps<T> {
  /** Async function called on mount and on every sort / filter / pagination change. */
  request: FloTableRequestFn<T>;
  data?: never;
  totalRows?: never;
  page?: never;
  onPageChange?: never;
  sortState?: never;
  onSortChange?: never;
  quickFilters?: never;
  onFilterChange?: never;
}

/** Props for `<FloTable />`. Use either `data` (controlled) or `request` (self-managed) — not both. */
export type FloTableProps<T extends object> = FloTableDataProps<T> | FloTableRequestProps<T>;

export interface TableHeaderProps<T extends object> {
  columns: ColumnDef<T>[];
  sortState: SortState<T> | null;
  onSort: (key: keyof T & string) => void;
  classNames?: FloTableClassNames;
  styles?: FloTableStyles;
}

export interface TableRowProps<T extends object> {
  row: T;
  columns: ColumnDef<T>[];
  classNames?: FloTableClassNames;
  styles?: FloTableStyles;
}

export interface TableBodyProps<T extends object> {
  columns: ColumnDef<T>[];
  rows: T[];
  classNames?: FloTableClassNames;
  styles?: FloTableStyles;
  /** When true, renders animated skeleton rows instead of data. */
  isLoading?: boolean;
  /** Number of skeleton rows to render while loading. Defaults to 5. */
  loadingRowCount?: number;
  /** Error message to display in place of rows. */
  error?: string | null;
  /** Called when the user clicks the Retry button shown in the error state. */
  onRetry?: () => void;
}

export interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  classNames?: FloTableClassNames;
  styles?: FloTableStyles;
}
