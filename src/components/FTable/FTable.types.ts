export type ColumnType =
  | 'text'
  | 'number'
  | 'date'
  | 'boolean'
  | 'badge'
  | 'currency'
  | 'link';

export interface ColumnDef<T extends object> {
  key: keyof T & string;
  header: string;
  type?: ColumnType;
}

export interface FTableProps<T extends object> {
  columns: ColumnDef<T>[];
  data: T[];
  pageSize?: number;
}

export interface TableHeaderProps<T extends object> {
  columns: ColumnDef<T>[];
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
