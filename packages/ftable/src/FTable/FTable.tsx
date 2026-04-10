import type { FTableProps, FilterDef, QuickFilterState } from './FTable.types';
import { nextSortDirection, columnTypeToFilterInputType } from './tableUtils';
import { TableHeader } from './TableHeader/TableHeader';
import { TableBody } from './TableBody/TableBody';
import { TablePagination } from './TablePagination/TablePagination';
import { FilterBar } from './filters/FilterBar/FilterBar';
import { cx } from '../utils/cx';
import './FTable.css';

const DEFAULT_PAGE_SIZE = 10;

export default function FTable<T extends object>({
  columns,
  data,
  totalRows,
  page,
  pageSize = DEFAULT_PAGE_SIZE,
  onPageChange,
  sortState = null,
  onSortChange,
  filterDefs = [],
  autoFilters = false,
  quickFilters = {},
  onFilterChange,
  showSearch = false,
  classNames,
  styles,
}: FTableProps<T>) {
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));

  const autoFilterDefs: FilterDef[] = autoFilters
    ? columns
        .filter((col) => col.filterable)
        .map((col) => ({
          key: col.key,
          label: col.header,
          type: columnTypeToFilterInputType(col.type),
        }))
    : [];

  const explicitKeys = new Set(filterDefs.map((fd) => fd.key));
  const effectiveFilterDefs: FilterDef[] = [
    ...autoFilterDefs.filter((fd) => !explicitKeys.has(fd.key)),
    ...filterDefs,
  ];

  function handleSort(key: keyof T & string) {
    if (!onSortChange) return;
    const currentDirection = sortState?.key === key ? sortState.direction : null;
    const next = nextSortDirection(currentDirection);
    onSortChange(next === null ? null : { key, direction: next });
    onPageChange(1);
  }

  function handleFilterChange(filters: QuickFilterState) {
    onFilterChange?.(filters);
    onPageChange(1);
  }

  return (
    <div className={classNames?.root} style={styles?.root}>
      <FilterBar
        filterDefs={effectiveFilterDefs}
        activeFilters={quickFilters}
        onFilterChange={handleFilterChange}
        showSearch={showSearch}
        className={classNames?.filterBar}
        style={styles?.filterBar}
      />
      <div className={cx('ftable-wrapper', classNames?.wrapper)} style={styles?.wrapper}>
        <table className={cx('ftable', classNames?.table)} style={styles?.table}>
          <TableHeader
            columns={columns}
            sortState={sortState}
            onSort={handleSort}
            classNames={classNames}
            styles={styles}
          />
          <TableBody
            columns={columns}
            rows={data}
            classNames={classNames}
            styles={styles}
          />
        </table>
      </div>
      <TablePagination
        currentPage={page}
        totalPages={totalPages}
        onPrev={() => onPageChange(page - 1)}
        onNext={() => onPageChange(page + 1)}
        classNames={classNames}
        styles={styles}
      />
    </div>
  );
}
