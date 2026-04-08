import type { FTableProps } from './FTable.types';
import { TableHeader } from './TableHeader/TableHeader';
import { TableBody } from './TableBody/TableBody';
import { TablePagination } from './TablePagination/TablePagination';
import './FTable.css';

const DEFAULT_PAGE_SIZE = 10;

function nextSortDirection(current: 'asc' | 'desc' | null): 'asc' | 'desc' | null {
  if (current === null) return 'asc';
  if (current === 'asc') return 'desc';
  return null;
}

export default function FTable<T extends object>({
  columns,
  data,
  totalRows,
  page,
  pageSize = DEFAULT_PAGE_SIZE,
  onPageChange,
  sortState = null,
  onSortChange,
}: FTableProps<T>) {
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));

  function handleSort(key: keyof T & string) {
    if (!onSortChange) return;
    const currentDirection = sortState?.key === key ? sortState.direction : null;
    const next = nextSortDirection(currentDirection);
    onSortChange(next === null ? null : { key, direction: next });
    onPageChange(1);
  }

  return (
    <div>
      <div className="ftable-wrapper">
        <table className="ftable">
          <TableHeader columns={columns} sortState={sortState} onSort={handleSort} />
          <TableBody columns={columns} rows={data} />
        </table>
      </div>

      <TablePagination
        currentPage={page}
        totalPages={totalPages}
        onPrev={() => onPageChange(page - 1)}
        onNext={() => onPageChange(page + 1)}
      />
    </div>
  );
}
