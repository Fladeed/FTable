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
