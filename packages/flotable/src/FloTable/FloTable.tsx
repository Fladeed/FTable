import { useState, useEffect, useRef } from 'react';
import type { FloTableProps, FloTableDataProps, FloTableRequestProps, FilterDef, QuickFilterState, SortState, BulkActionBarContext } from './FloTable.types';
import { nextSortDirection, columnTypeToFilterInputType } from './tableUtils';
import { TableHeader } from './TableHeader/TableHeader';
import { TableBody } from './TableBody/TableBody';
import { TablePagination } from './TablePagination/TablePagination';
import { FilterBar } from './filters/FilterBar/FilterBar';
import { BulkActionBar } from './ActionBar/BulkActionBar/BulkActionBar';
import { CardList } from './CardList/CardList';
import { useMediaBreakpoint } from '../hooks/useMediaBreakpoint';
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
    mobileBreakpoint = 640,
    mobileVariant = 'auto',
    mobileColumnPriority = 2,
    renderCard,
  } = props;

  const isReqMode = 'request' in props && typeof props.request === 'function';
  const isMobile = useMediaBreakpoint(mobileBreakpoint - 1);

  const responsiveColumns = isMobile
    ? columns.filter((col) => (col.priority ?? Infinity) >= mobileColumnPriority)
    : columns;

  const useCardView = mobileVariant === 'card' && isMobile;

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
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

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
    <div
      className={classNames?.root}
      style={styles?.root}
      dir={direction}
      data-flotable-mobile={isMobile ? 'true' : undefined}
    >
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
      {useCardView ? (
        <CardList
          columns={responsiveColumns}
          rows={data}
          rowKey={rowKey}
          rowActions={rowActions}
          rowActionsMoreIcon={rowActionsMoreIcon}
          selectable={selectable}
          selectedKeys={selectedKeys}
          onToggleRow={handleToggleRow}
          renderCard={renderCard}
          classNames={classNames}
          styles={styles}
          isLoading={isLoading}
          loadingRowCount={pageSize}
          error={fetchError}
          onRetry={() => setRetryCount((c) => c + 1)}
        />
      ) : (
        <div className={cx('flotable-wrapper', classNames?.wrapper)} style={styles?.wrapper}>
          <table className={cx('flotable', classNames?.table)} style={styles?.table}>
            <TableHeader
              columns={responsiveColumns}
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
              columns={responsiveColumns}
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
              loadingRowCount={pageSize}
              error={fetchError}
              onRetry={() => setRetryCount((c) => c + 1)}
            />
          </table>
        </div>
      )}
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

