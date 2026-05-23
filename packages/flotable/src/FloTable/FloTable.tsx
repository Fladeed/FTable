import {
  useState,
  useEffect,
  useRef,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from 'react';
import type { Ref, ReactElement } from 'react';
import type {
  FloTableProps,
  FloTableDataProps,
  FloTableRequestProps,
  FloTableHandle,
  FilterDef,
  QuickFilterState,
  SortState,
  BulkActionBarContext,
} from './FloTable.types';
import { nextSortDirection, columnTypeToFilterInputType } from './tableUtils';
import { TableHeader } from './TableHeader/TableHeader';
import { TableBody } from './TableBody/TableBody';
import { TablePagination } from './TablePagination/TablePagination';
import { FilterBar } from './filters/FilterBar/FilterBar';
import { BulkActionBar } from './ActionBar/BulkActionBar/BulkActionBar';
import { cx } from '../utils/cx';
import './FloTable.css';

const DEFAULT_PAGE_SIZE = 10;

function FloTableImpl<T extends object>(
  props: FloTableProps<T>,
  ref: Ref<FloTableHandle<T>>,
) {
  const {
    columns,
    pageSize = DEFAULT_PAGE_SIZE,
    filterDefs = [],
    autoFilters = false,
    showSearch = false,
    filterMode,
    rowActions,
    rowActionsMoreIcon,
    selectable,
    rowKey = 'id',
    onSelectionChange,
    bulkActions,
    clearSelectionLabel,
    clearSelectionIcon,
    selectionCountLabel,
    renderBulkActionBar,
    renderInlineBulkActions,
    classNames,
    styles,
    direction,
    rowActionsLabel,
    paginationLabels,
    showPageInput,
  } = props;

  const isReqMode = 'request' in props && typeof props.request === 'function';

  const [internalPage, setInternalPage] = useState(1);
  const [internalSortState, setInternalSortState] = useState<SortState<T> | null>(
    () => (props as FloTableRequestProps<T>).initialSort ?? null,
  );
  const [internalFilters, setInternalFilters] = useState<QuickFilterState>(
    () => (props as FloTableRequestProps<T>).initialQuickFilters ?? {},
  );
  const [internalData, setInternalData] = useState<T[]>([]);
  const [internalTotalRows, setInternalTotalRows] = useState(0);
  const [isLoading, setIsLoading] = useState(isReqMode);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

  const requestRef = useRef<FloTableRequestProps<T>['request'] | null>(null);
  if (isReqMode) {
    requestRef.current = (props as FloTableRequestProps<T>).request;
  }

  const pageRef = useRef(internalPage);
  const sortStateRef = useRef(internalSortState);
  const filtersRef = useRef(internalFilters);
  const pageSizeRef = useRef(pageSize);
  pageRef.current = internalPage;
  sortStateRef.current = internalSortState;
  filtersRef.current = internalFilters;
  pageSizeRef.current = pageSize;

  const requestIdRef = useRef(0);

  const fireRequest = useCallback(
    async ({ silent }: { silent: boolean }): Promise<void> => {
      if (!isReqMode || !requestRef.current) return;
      const id = ++requestIdRef.current;
      if (silent) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
        setFetchError(null);
      }
      try {
        const result = await requestRef.current({
          page: pageRef.current,
          pageSize: pageSizeRef.current,
          sortState: sortStateRef.current,
          quickFilters: filtersRef.current,
        });
        if (id !== requestIdRef.current) return;
        setInternalData(result.data);
        setInternalTotalRows(result.totalRows);
        setFetchError(null);
      } catch (err: unknown) {
        if (id !== requestIdRef.current) return;
        setFetchError(err instanceof Error ? err.message : String(err));
      } finally {
        if (id === requestIdRef.current) {
          if (silent) setIsRefreshing(false);
          else setIsLoading(false);
        }
      }
    },
    [isReqMode],
  );

  useEffect(() => {
    if (!isReqMode || !requestRef.current) return;
    fireRequest({ silent: false });
  }, [isReqMode, internalPage, internalSortState, internalFilters, pageSize, retryCount, fireRequest]);

  useImperativeHandle(
    ref,
    () => ({
      refresh: async () => {
        if (!isReqMode) return;
        await fireRequest({ silent: true });
      },
      updateRow: (predicate, updater) => {
        if (!isReqMode) return;
        setInternalData((prev) => prev.map((row) => (predicate(row) ? updater(row) : row)));
      },
    }),
    [isReqMode, fireRequest],
  );

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

  const pageRowKeys = data.map((row) => String(row[rowKey as keyof T]));
  const selectedOnPage = pageRowKeys.filter((k) => selectedKeys.has(k));
  const selectionState =
    selectedOnPage.length === 0
      ? 'none'
      : selectedOnPage.length === pageRowKeys.length
        ? 'all'
        : 'some';

  function handleToggleRow(key: string) {
    const next = new Set(selectedKeys);
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    setSelectedKeys(next);
    onSelectionChange?.([...next]);
  }

  function clearSelection() {
    setSelectedKeys(new Set());
    onSelectionChange?.([]);
  }

  const selectedRows = data.filter((row) => selectedKeys.has(String(row[rowKey as keyof T])));

  function handleToggleAll() {
    const allSelected = pageRowKeys.every((k) => selectedKeys.has(k));
    const next = new Set(selectedKeys);
    if (allSelected) {
      pageRowKeys.forEach((k) => next.delete(k));
    } else {
      pageRowKeys.forEach((k) => next.add(k));
    }
    setSelectedKeys(next);
    onSelectionChange?.([...next]);
  }

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
    setSelectedKeys(new Set());
    onSelectionChange?.([]);
    if (isReqMode) {
      setInternalPage(newPage);
    } else {
      (props as FloTableDataProps<T>).onPageChange(newPage);
    }
  }

  const hasBulkActions = (bulkActions?.length ?? 0) > 0;
  const hasCustomBar = typeof renderBulkActionBar === 'function';
  const hasInlineBar = typeof renderInlineBulkActions === 'function';
  const hasSelection = selectedKeys.size > 0;
  const hasFilterBar = showSearch || effectiveFilterDefs.length > 0;

  const bulkBarContext: BulkActionBarContext<T> = {
    selectedRows,
    selectedKeys: [...selectedKeys],
    count: selectedKeys.size,
    clearSelection,
  };

  return (
    <div className={classNames?.root} style={styles?.root} dir={direction}>
      {(hasFilterBar || (!hasCustomBar && hasBulkActions) || hasInlineBar) && (
        <div className="flotable-toolbar">
          <FilterBar
            filterDefs={effectiveFilterDefs}
            activeFilters={quickFilters}
            onFilterChange={handleFilterChange}
            showSearch={showSearch}
            filterMode={filterMode}
            classNames={classNames}
            styles={styles}
          />
          {!hasCustomBar && hasBulkActions && (
            <BulkActionBar
              actions={bulkActions!}
              selectedRows={selectedRows}
              onClearSelection={clearSelection}
              clearSelectionLabel={clearSelectionLabel}
              clearSelectionIcon={clearSelectionIcon}
              selectionCountLabel={selectionCountLabel}
              classNames={classNames}
              styles={styles}
            />
          )}
          {hasInlineBar && renderInlineBulkActions!(bulkBarContext)}
        </div>
      )}
      {hasCustomBar && hasSelection && renderBulkActionBar(bulkBarContext)}
      <div className={cx('flotable-wrapper', classNames?.wrapper)} style={styles?.wrapper}>
        <table className={cx('flotable', classNames?.table)} style={styles?.table}>
          <TableHeader
            columns={columns}
            sortState={sortState}
            onSort={handleSort}
            rowActions={rowActions}
            rowActionsLabel={rowActionsLabel}
            selectable={selectable}
            selectionState={selectionState}
            onToggleAll={handleToggleAll}
            classNames={classNames}
            styles={styles}
          />
          <TableBody
            columns={columns}
            rows={data}
            rowActions={rowActions}
            rowActionsMoreIcon={rowActionsMoreIcon}
            selectable={selectable}
            selectedKeys={selectedKeys}
            rowKey={rowKey}
            onToggleRow={handleToggleRow}
            classNames={classNames}
            styles={styles}
            isLoading={isLoading}
            isRefreshing={isRefreshing}
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

const FloTable = forwardRef(FloTableImpl) as <T extends object>(
  props: FloTableProps<T> & { ref?: Ref<FloTableHandle<T>> },
) => ReactElement | null;

(FloTable as { displayName?: string }).displayName = 'FloTable';

export default FloTable;
