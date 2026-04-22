import { useState, useEffect, useRef } from 'react';
import type { FloTableProps, FloTableDataProps, FloTableRequestProps, FilterDef, QuickFilterState, SortState } from './FloTable.types';
import { nextSortDirection, columnTypeToFilterInputType } from './tableUtils';
import { TableHeader } from './TableHeader/TableHeader';
import { TableBody } from './TableBody/TableBody';
import { TablePagination } from './TablePagination/TablePagination';
import { FilterBar } from './filters/FilterBar/FilterBar';
import { cx } from '../utils/cx';
import './FloTable.css';

const DEFAULT_PAGE_SIZE = 10;

export default function FloTable<T extends object>(props: FloTableProps<T>) {
  const {
    columns,
    pageSize = DEFAULT_PAGE_SIZE,
    filterDefs = [],
    autoFilters = false,
    showSearch = false,
    filterMode,
    rowActions,
    rowActionsMoreIcon,
    classNames,
    styles,
    direction,
    rowActionsLabel,
    paginationLabels,
    showPageInput,
  } = props;

  const isReqMode = 'request' in props && typeof props.request === 'function';

  const [internalPage, setInternalPage] = useState(1);
  const [internalSortState, setInternalSortState] = useState<SortState<T> | null>(null);
  const [internalFilters, setInternalFilters] = useState<QuickFilterState>(
    () => (props as FloTableRequestProps<T>).initialQuickFilters ?? {},
  );
  const [internalData, setInternalData] = useState<T[]>([]);
  const [internalTotalRows, setInternalTotalRows] = useState(0);
  const [isLoading, setIsLoading] = useState(isReqMode);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const requestRef = useRef<FloTableRequestProps<T>['request'] | null>(null);
  if (isReqMode) {
    requestRef.current = (props as FloTableRequestProps<T>).request;
  }

  useEffect(() => {
    if (!isReqMode || !requestRef.current) return;

    setIsLoading(true);
    setFetchError(null);

    let cancelled = false;

    requestRef
      .current({ page: internalPage, pageSize, sortState: internalSortState, quickFilters: internalFilters })
      .then((result) => {
        if (!cancelled) {
          setInternalData(result.data);
          setInternalTotalRows(result.totalRows);
          setIsLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setFetchError(err instanceof Error ? err.message : String(err));
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isReqMode, internalPage, internalSortState, internalFilters, pageSize, retryCount]);

  let page: number;
  let sortState: SortState<T> | null;
  let quickFilters: QuickFilterState;
  let data: T[];
  let totalRows: number;

  if (isReqMode) {
    page = internalPage;
    sortState = internalSortState;
    quickFilters = internalFilters;
    data = internalData;
    totalRows = internalTotalRows;
  } else {
    const dp = props as FloTableDataProps<T>;
    page = dp.page;
    sortState = dp.sortState ?? null;
    quickFilters = dp.quickFilters ?? {};
    data = dp.data;
    totalRows = dp.totalRows;
  }

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
    if (isReqMode) {
      const currentDirection =
        internalSortState?.key === key ? internalSortState.direction : null;
      const next = nextSortDirection(currentDirection);
      setInternalSortState(next === null ? null : { key, direction: next });
      setInternalPage(1);
    } else {
      const dp = props as FloTableDataProps<T>;
      if (!dp.onSortChange) return;
      const currentDirection = dp.sortState?.key === key ? dp.sortState.direction : null;
      const next = nextSortDirection(currentDirection);
      dp.onSortChange(next === null ? null : { key, direction: next });
      dp.onPageChange(1);
    }
  }

  function handleFilterChange(filters: QuickFilterState) {
    if (isReqMode) {
      setInternalFilters(filters);
      setInternalPage(1);
    } else {
      const dp = props as FloTableDataProps<T>;
      dp.onFilterChange?.(filters);
      dp.onPageChange(1);
    }
  }

  function handlePageChange(newPage: number) {
    if (isReqMode) {
      setInternalPage(newPage);
    } else {
      (props as FloTableDataProps<T>).onPageChange(newPage);
    }
  }

  return (
    <div className={classNames?.root} style={styles?.root} dir={direction}>
      <FilterBar
        filterDefs={effectiveFilterDefs}
        activeFilters={quickFilters}
        onFilterChange={handleFilterChange}
        showSearch={showSearch}
        filterMode={filterMode}
        classNames={classNames}
        styles={styles}
      />
      <div className={cx('flotable-wrapper', classNames?.wrapper)} style={styles?.wrapper}>
        <table className={cx('flotable', classNames?.table)} style={styles?.table}>
          <TableHeader
            columns={columns}
            sortState={sortState}
            onSort={handleSort}
            rowActions={rowActions}
            rowActionsLabel={rowActionsLabel}
            classNames={classNames}
            styles={styles}
          />
          <TableBody
            columns={columns}
            rows={data}
            rowActions={rowActions}
            rowActionsMoreIcon={rowActionsMoreIcon}
            classNames={classNames}
            styles={styles}
            isLoading={isLoading}
            loadingRowCount={pageSize}
            error={fetchError}
            onRetry={() => setRetryCount((c) => c + 1)}
          />
        </table>
      </div>
      <TablePagination
        currentPage={page}
        totalPages={totalPages}
        onPrev={() => handlePageChange(page - 1)}
        onNext={() => handlePageChange(page + 1)}
        onGoToPage={handlePageChange}
        showPageInput={showPageInput}
        labels={paginationLabels}
        classNames={classNames}
        styles={styles}
      />
    </div>
  );
}

