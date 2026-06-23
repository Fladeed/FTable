import type { CSSProperties, ReactNode } from 'react';

/** Context passed to the renderBulkActionBar render prop. */
export interface BulkActionBarContext<T = Record<string, unknown>> {
  selectedRows: T[];
  selectedKeys: string[];
  count: number;
  clearSelection: () => void;
}

/** A bulk action shown in the BulkActionBar when one or more rows are selected. */
export interface BulkAction<T = Record<string, unknown>> {
  /** Unique key for this action. */
  key: string;
  /** Label shown on the button. */
  label: string;
  /** Optional icon rendered before the label. */
  icon?: ReactNode;
  /** Called with the full array of currently selected row objects. */
  onClick: (selectedRows: T[]) => void;
  /** When provided, the action button is disabled when this returns true. */
  disabled?: (selectedRows: T[]) => boolean;
  /** When true, the action renders with a destructive (red) style. */
  danger?: boolean;
  /** Extra CSS class applied to this action's button. */
  className?: string;
  /** Inline style applied to this action's button. */
  style?: CSSProperties;
}

/** A single per-row action rendered in the trailing Actions column. */
export interface RowAction<T = Record<string, unknown>> {
  /** Unique key for this action. */
  key: string;
  /** Label shown in the button or dropdown item. */
  label: string;
  /** Optional icon rendered before the label. */
  icon?: ReactNode;
  /** Called when the user clicks this action. Receives the full row data object. */
  onClick: (row: T) => void;
  /** When provided, the action button is rendered as disabled (greyed-out, not clickable) for rows where this returns true. */
  disabled?: (row: T) => boolean;
  /** When provided, the action is completely hidden for rows where this returns false. Defaults to always visible. */
  visible?: (row: T) => boolean;
  /** When true, the action is rendered with a destructive (red) style. */
  danger?: boolean;
}

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

export interface ColumnDef<T extends object, C extends object = T> {
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
  /**
   * Expandable rows only: renders an aggregate of a parent row's children in this cell
   * (e.g. `"3 variants"`, a price range, a total). Receives the children array and the
   * parent row. Takes precedence over `render`/`type`, but only for parent rows that have
   * a non-empty children array — rows without children fall back to the normal cell.
   */
  aggregate?: (children: C[], parentRow: T) => ReactNode;
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

/** Labels for the pagination controls. Override any or all to translate or customise. */
export interface PaginationLabels {
  prev?: string;
  next?: string;
  /** Render the "Page X of Y" string. Defaults to `(c, t) => \`Page ${c} of ${t}\``. */
  pageInfo?: (current: number, total: number) => string;
  /** Label text rendered before the page number input. Defaults to `'Go to page'`. */
  goToPage?: string;
  /** Text for the Go button next to the page input. Defaults to `'Go'`. */
  goBtn?: string;
}

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
  /** BulkActionBar container `<div>` */
  bulkActionBar?: string;
  /** "N rows selected" `<span>` */
  bulkActionBarCount?: string;
  /** Action buttons wrapper `<div>` */
  bulkActionBarActions?: string;
  /** "Clear selection" `<button>` */
  bulkActionBarClear?: string;
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
  bulkActionBar?: FloTableStyleValue;
  bulkActionBarCount?: FloTableStyleValue;
  bulkActionBarActions?: FloTableStyleValue;
  bulkActionBarClear?: FloTableStyleValue;
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

/**
 * Imperative handle exposed via `ref` on `<FloTable>` in request mode.
 * Lets the caller refresh data or mutate rows without remounting the component
 * (so page / sort / filters are preserved).
 *
 * In data (controlled) mode both methods are no-ops — the consumer owns the data.
 */
export interface FloTableHandle<T extends object> {
  /**
   * Re-invokes the `request` function with the current internal page / sort / filters.
   * Resolves after the fetch settles. No skeleton flash — rows stay rendered but
   * dimmed while the request is in flight.
   */
  refresh(): Promise<void>;
  /**
   * Mutates the matching row(s) in the current page in-place. No network call.
   * Type-safe via `T`. Useful after an edit success when the caller already has
   * the updated row object.
   */
  updateRow(predicate: (row: T) => boolean, updater: (row: T) => T): void;
}

interface FloTableBaseProps<T extends object, C extends object = T> {
  columns: ColumnDef<T, C>[];
  pageSize?: number;
  /** Explicit consumer-defined filter pills. Keys can be any string (column keys or server params). */
  filterDefs?: FilterDef[];
  /** When true, auto-generates pills from columns that have filterable: true. Merged with filterDefs. */
  autoFilters?: boolean;
  /** When true, renders a global search input at the start of the filter bar. Value stored under the reserved key '__search__'. */
  showSearch?: boolean;
  /**
   * Controls when onFilterChange (and in request mode, the request function) is fired.
   * - 'commit' (default) — fires only when the pill is closed (Enter key, Escape, outside click, or clear button).
   * - 'live' — fires on every keystroke (previous behaviour).
   * The global search pill is always live regardless of this setting.
   */
  filterMode?: 'live' | 'commit';
  /** Per-row action buttons rendered in a trailing "Actions" column. */
  rowActions?: RowAction<T>[];
  /** Custom icon for the overflow (⋯) button when more than 3 actions are provided. */
  rowActionsMoreIcon?: ReactNode;
  /** When true, renders a leading checkbox column for row selection. */
  selectable?: boolean;
  /** The row property used as the unique key for selection. Defaults to "id". */
  rowKey?: string;
  /** Called with the array of selected row keys on every selection change. */
  onSelectionChange?: (selectedKeys: string[]) => void;
  /** Bulk action buttons shown in the BulkActionBar when rows are selected. */
  bulkActions?: BulkAction<T>[];
  /** Label for the clear-selection button. Defaults to `'Clear selection'`. */
  clearSelectionLabel?: string;
  /** Icon rendered before the clear-selection label. */
  clearSelectionIcon?: ReactNode;
  /**
   * Custom formatter for the selection-count text in the BulkActionBar.
   * Receives the number of selected rows and returns the text to display.
   * Defaults to `"No rows selected"` / `"N row(s) selected"`.
   */
  selectionCountLabel?: (count: number) => string;
  /**
   * Fully replaces the BulkActionBar with custom content.
   * Called only when at least one row is selected.
   * Takes precedence over `bulkActions` when both are provided.
   */
  renderBulkActionBar?: (ctx: BulkActionBarContext<T>) => ReactNode;
  /**
   * Renders custom bulk-action content inside the toolbar, inline with the filter bar.
   * Always called (even when nothing is selected — `count` will be 0).
   * Use `count` to decide whether to enable or disable your buttons.
   */
  renderInlineBulkActions?: (ctx: BulkActionBarContext<T>) => ReactNode;
  /** Custom class names for individual table parts. */
  classNames?: FloTableClassNames;
  /** Inline styles for individual table parts. CSS custom properties are accepted. */
  styles?: FloTableStyles;
  /** Text direction for the table. Defaults to `'ltr'`. Set to `'rtl'` for right-to-left languages. */
  direction?: 'ltr' | 'rtl';
  /** Label for the trailing Actions column header. Defaults to `'Actions'`. */
  rowActionsLabel?: string;
  /** Labels for the pagination controls. Override any or all to translate or customise. */
  paginationLabels?: PaginationLabels;
  /** When true, renders a page number input that lets users jump directly to any page. Defaults to `false`. */
  showPageInput?: boolean;
  /**
   * Expandable rows: returns the child rows for a given parent row.
   * Return `undefined` or an empty array for rows that have no children (no chevron is rendered).
   * Providing this prop enables the expandable-rows feature (a leading chevron column appears).
   */
  getChildren?: (row: T) => C[] | undefined;
  /**
   * Request mode for children: async function called the first time a parent is expanded, and on
   * every child page change, to fetch that parent's children. Mirrors FloTable's top-level
   * `request`. Use instead of `getChildren` when children are not already in memory. Loading
   * skeleton and error / retry states are handled internally.
   * Use either `getChildren` (data mode) or `childRequest` (request mode) — not both.
   */
  childRequest?: (
    row: T,
    params: { page: number; pageSize: number },
  ) => Promise<{ data: C[]; totalRows: number }>;
  /**
   * Request mode only: optional predicate deciding whether a parent row has children (and thus
   * shows a chevron) before they are fetched. When omitted, every parent row shows a chevron.
   */
  rowHasChildren?: (row: T) => boolean;
  /**
   * Rows per page for a parent's children. In data mode the in-memory children are sliced
   * client-side; in request mode it is passed to `childRequest`. A per-parent pager is shown
   * when a parent has more children than this. Defaults to `5`.
   */
  childPageSize?: number;
  /** The child property used as the unique React key for child rows. Defaults to `'id'`. */
  childRowKey?: string;
  /**
   * Optional column set used to render child rows. Defaults to the parent `columns`
   * (only valid when children share the parent row shape). Child columns reuse the same
   * `ColumnDef` shape (including custom `render`).
   */
  childColumns?: ColumnDef<C>[];
  /**
   * Initial expanded state for parent rows. A boolean applies to every parent;
   * a predicate decides per row. Defaults to `false` (all collapsed).
   * Applied as each parent row is first seen (so it also covers pagination / async pages).
   */
  defaultExpanded?: boolean | ((row: T) => boolean);
  /** Called with the array of currently-expanded parent row keys whenever the user toggles a row. */
  onExpandedChange?: (expandedKeys: string[]) => void;
  /**
   * What toggles expansion: just the chevron (`'chevron'`, default) or clicking anywhere on the
   * parent row (`'row'`). Row actions and the selection checkbox never toggle expansion.
   */
  expandOn?: 'chevron' | 'row';
}

/**
 * Controlled (data) mode — the consumer supplies pre-fetched rows, pagination, sort, and filters.
 * Cannot be combined with `request`.
 */
export interface FloTableDataProps<T extends object, C extends object = T>
  extends FloTableBaseProps<T, C> {
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
export interface FloTableRequestProps<T extends object, C extends object = T>
  extends FloTableBaseProps<T, C> {
  /** Async function called on mount and on every sort / filter / pagination change. */
  request: FloTableRequestFn<T>;
  /** Seeds the internal quick-filter state on mount. Resets to this value on remount (e.g. via a `key` change). */
  initialQuickFilters?: QuickFilterState;
  /** Seeds the internal sort state on mount. Resets to this value on remount (e.g. via a `key` change). */
  initialSort?: SortState<T> | null;
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
export type FloTableProps<T extends object, C extends object = T> =
  | FloTableDataProps<T, C>
  | FloTableRequestProps<T, C>;

export interface TableHeaderProps<T extends object, C extends object = T> {
  columns: ColumnDef<T, C>[];
  sortState: SortState<T> | null;
  onSort: (key: keyof T & string) => void;
  rowActions?: RowAction<T>[];
  rowActionsLabel?: string;
  selectable?: boolean;
  selectionState?: 'none' | 'some' | 'all';
  onToggleAll?: () => void;
  classNames?: FloTableClassNames;
  styles?: FloTableStyles;
  /** When true, renders a leading spacer cell aligned with the row chevron column. */
  expandable?: boolean;
}

export interface TableRowProps<T extends object, C extends object = T> {
  row: T;
  columns: ColumnDef<T, C>[];
  rowActions?: RowAction<T>[];
  rowActionsMoreIcon?: ReactNode;
  selectable?: boolean;
  isSelected?: boolean;
  onToggle?: () => void;
  classNames?: FloTableClassNames;
  styles?: FloTableStyles;
  /** Expandable rows: returns this row's children (undefined/empty ⇒ no chevron). Presence enables the chevron column. */
  getChildren?: (row: T) => C[] | undefined;
  /** Expandable rows (request mode): async fetcher for this row's children. */
  childRequest?: (
    row: T,
    params: { page: number; pageSize: number },
  ) => Promise<{ data: C[]; totalRows: number }>;
  /** Expandable rows (request mode): predicate deciding chevron visibility before children load. */
  rowHasChildren?: (row: T) => boolean;
  /** Expandable rows: rows per page for this row's children. Defaults to 5. */
  childPageSize?: number;
  /** Expandable rows: child row React key field. Defaults to 'id'. */
  childRowKey?: string;
  /** Expandable rows: column set for child rows. Defaults to the parent `columns`. */
  childColumns?: ColumnDef<C>[];
  /** Expandable rows: whether this parent row is currently expanded (user-driven). */
  isExpanded?: boolean;
  /** Expandable rows: toggles this row's expansion. */
  onToggleExpand?: () => void;
  /** Expandable rows: what toggles expansion. Defaults to `'chevron'`. */
  expandOn?: 'chevron' | 'row';
  /** Expandable rows: active global-search query, used to auto-expand and highlight matching children. */
  searchQuery?: string;
  /** Expandable rows: total column count, used as the colSpan of the child rows. */
  colSpan?: number;
  /** Expandable rows: measured parent column widths, synced into the child scroll table. */
  columnWidths?: number[];
}

export interface TableBodyProps<T extends object, C extends object = T> {
  columns: ColumnDef<T, C>[];
  rows: T[];
  rowActions?: RowAction<T>[];
  rowActionsMoreIcon?: ReactNode;
  selectable?: boolean;
  selectedKeys?: Set<string>;
  rowKey?: string;
  onToggleRow?: (key: string) => void;
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
  /**
   * When true, the body is rendered with a dim modifier class to signal an
   * in-flight refresh — rows stay visible (no skeleton flash) but slightly
   * faded out. Ignored while `isLoading` is true.
   */
  isRefreshing?: boolean;
  /** Expandable rows: returns a row's children (undefined/empty ⇒ no chevron). Presence enables the chevron column. */
  getChildren?: (row: T) => C[] | undefined;
  /** Expandable rows (request mode): async fetcher for a parent's children. */
  childRequest?: (
    row: T,
    params: { page: number; pageSize: number },
  ) => Promise<{ data: C[]; totalRows: number }>;
  /** Expandable rows (request mode): predicate deciding chevron visibility before children load. */
  rowHasChildren?: (row: T) => boolean;
  /** Expandable rows: rows per page for a parent's children. Defaults to 5. */
  childPageSize?: number;
  /** Expandable rows: child row React key field. Defaults to 'id'. */
  childRowKey?: string;
  /** Expandable rows: column set for child rows. Defaults to the parent `columns`. */
  childColumns?: ColumnDef<C>[];
  /** Expandable rows: set of currently-expanded parent row keys. */
  expandedKeys?: Set<string>;
  /** Expandable rows: toggles expansion for the given parent row key. */
  onToggleExpand?: (key: string) => void;
  /** Expandable rows: what toggles expansion. Defaults to `'chevron'`. */
  expandOn?: 'chevron' | 'row';
  /** Expandable rows: active global-search query, used to auto-expand and highlight matching children. */
  searchQuery?: string;
  /** Expandable rows: measured parent column widths, synced into the child scroll table. */
  columnWidths?: number[];
}

/** Props for the per-parent child sub-table (`ChildRows`). */
export interface ChildRowsProps<T extends object, C extends object = T> {
  parentRow: T;
  /** Whether the parent is currently expanded (drives the collapse animation & lazy fetch). */
  expanded: boolean;
  /** Parent columns (used as the child column fallback). */
  columns: ColumnDef<T, C>[];
  childColumns?: ColumnDef<C>[];
  /** Data mode: returns the in-memory children for this parent. */
  getChildren?: (row: T) => C[] | undefined;
  /** Request mode: async fetcher for this parent's children. */
  childRequest?: (
    row: T,
    params: { page: number; pageSize: number },
  ) => Promise<{ data: C[]; totalRows: number }>;
  childPageSize: number;
  childRowKey: string;
  /** Total column count (incl. reserved columns) — colSpan for full-width child rows. */
  colSpan: number;
  /** Whether a leading checkbox column exists on the parent (for alignment spacing). */
  selectable?: boolean;
  /** Whether a trailing actions column exists on the parent (for alignment spacing). */
  hasActions?: boolean;
  /** Active global-search query (data mode highlighting). */
  searchQuery?: string;
  /** Measured parent column widths, synced into the child scroll table's colgroup. */
  columnWidths?: number[];
  classNames?: FloTableClassNames;
  styles?: FloTableStyles;
}

export interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  onGoToPage: (page: number) => void;
  showPageInput?: boolean;
  labels?: PaginationLabels;
  classNames?: FloTableClassNames;
  styles?: FloTableStyles;
}
