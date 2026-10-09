import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
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
  ColumnDef,
} from './FloTable.types';
import {
  nextSortDirection,
  columnTypeToFilterInputType,
  rowMatchesQuery,
  getRowKey,
  SEARCH_KEY,
} from './tableUtils';
import { TableHeader } from './TableHeader/TableHeader';
import { TableBody } from './TableBody/TableBody';
import { TablePagination } from './TablePagination/TablePagination';
import { FilterBar } from './filters/FilterBar/FilterBar';
import { BulkActionBar } from './ActionBar/BulkActionBar/BulkActionBar';
import { TableActions } from './ActionBar/TableActions/TableActions';
import { ToolbarEnd } from './ToolbarEnd/ToolbarEnd';
import { cx } from '../utils/cx';
import { FloTableThemeContext } from './theme/FloTableThemeContext';
import './FloTable.css';

const DEFAULT_PAGE_SIZE = 10;

function FloTableImpl<T extends object, C extends object = T>(
  props: FloTableProps<T, C>,
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
    tableActions,
    toolbarEnd,
    classNames,
    styles,
    direction,
    inheritTheme = false,
    rowActionsLabel,
    paginationLabels,
    showPageInput,
    getChildren,
    childRequest,
    rowHasChildren,
    childPageSize,
    childRowKey,
    childColumns,
    defaultExpanded = false,
    onExpandedChange,
    expandOn,
    childRowsLabels,
    labels,
  } = props;

  const isReqMode = 'request' in props && typeof props.request === 'function';
  const isExpandable = typeof getChildren === 'function' || typeof childRequest === 'function';

  const [internalPage, setInternalPage] = useState(1);
  const [internalSortState, setInternalSortState] = useState<SortState<T> | null>(
    () => (props as FloTableRequestProps<T, C>).initialSort ?? null,
  );
  const [internalFilters, setInternalFilters] = useState<QuickFilterState>(
    () => (props as FloTableRequestProps<T, C>).initialQuickFilters ?? {},
  );
  const [internalData, setInternalData] = useState<T[]>([]);
  const [internalTotalRows, setInternalTotalRows] = useState(0);
  const [isLoading, setIsLoading] = useState(isReqMode);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
  const seededKeysRef = useRef<Set<string>>(new Set());
  // Global-search auto-expansion for `query`: `opened` = rows the search expanded (collapsed again
  // when the query changes); `handled` = rows already processed, so a user collapse sticks.
  const searchExpandedRef = useRef<{ query: string; opened: Set<string>; handled: Set<string> }>({
    query: '',
    opened: new Set(),
    handled: new Set(),
  });

  const tableRef = useRef<HTMLTableElement>(null);
  const [columnWidths, setColumnWidths] = useState<number[]>([]);

  const requestRef = useRef<FloTableRequestProps<T, C>['request'] | null>(null);
  if (isReqMode) {
    requestRef.current = (props as FloTableRequestProps<T, C>).request;
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
    const dp = props as FloTableDataProps<T, C>;
    page = dp.page;
    sortState = dp.sortState ?? null;
    quickFilters = dp.quickFilters ?? {};
    data = dp.data;
    totalRows = dp.totalRows;
  }

  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));

  const searchQuery = (quickFilters[SEARCH_KEY] ?? '').trim();

  useEffect(() => {
    if (!isExpandable) return;
    const toExpand: string[] = [];
    data.forEach((row, index) => {
      const key = getRowKey(row, rowKey, index);
      if (seededKeysRef.current.has(key)) return;
      seededKeysRef.current.add(key);
      const isDefault =
        typeof defaultExpanded === 'function' ? defaultExpanded(row) : defaultExpanded;
      if (isDefault) toExpand.push(key);
    });
    if (toExpand.length > 0) {
      setExpandedKeys((prev) => {
        const next = new Set(prev);
        toExpand.forEach((k) => next.add(k));
        return next;
      });
    }
  }, [isExpandable, data, rowKey, defaultExpanded]);

  // Data mode: auto-expand parents with a child matching the global search. The keys go into
  // `expandedKeys` (one source of truth), so the user can still collapse them. Rows the search
  // opened are collapsed again when the query changes, unless the user toggled them meanwhile.
  useEffect(() => {
    if (typeof getChildren !== 'function') return;
    const tracked = searchExpandedRef.current;
    let stale: Set<string> | null = null;
    if (tracked.query !== searchQuery) {
      stale = tracked.opened;
      searchExpandedRef.current = { query: searchQuery, opened: new Set(), handled: new Set() };
    }
    const { opened, handled } = searchExpandedRef.current;
    const toExpand: string[] = [];
    if (searchQuery !== '') {
      const childCols = childColumns ?? (columns as unknown as ColumnDef<C>[]);
      data.forEach((row, index) => {
        const key = getRowKey(row, rowKey, index);
        if (handled.has(key)) return;
        const children = getChildren(row) ?? [];
        if (children.some((child) => rowMatchesQuery(child, childCols, searchQuery))) {
          handled.add(key);
          opened.add(key);
          toExpand.push(key);
        }
      });
    }
    if (toExpand.length === 0 && (!stale || stale.size === 0)) return;
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      stale?.forEach((k) => {
        if (!opened.has(k)) next.delete(k);
      });
      toExpand.forEach((k) => next.add(k));
      return next;
    });
  }, [getChildren, childColumns, columns, data, rowKey, searchQuery]);

  function handleToggleExpand(key: string) {
    // A user toggle takes the row over from the search auto-expansion.
    searchExpandedRef.current.opened.delete(key);
    searchExpandedRef.current.handled.add(key);
    const next = new Set(expandedKeys);
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    setExpandedKeys(next);
    onExpandedChange?.([...next]);
  }

  useEffect(() => {
    if (!isExpandable) return;
    const table = tableRef.current;
    if (!table || typeof ResizeObserver === 'undefined') return;
    const measure = () => {
      const ths = table.querySelectorAll<HTMLTableCellElement>('thead tr:first-child > th');
      setColumnWidths(Array.from(ths).map((th) => th.getBoundingClientRect().width));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(table);
    return () => ro.disconnect();
  }, [isExpandable, columns, data]);

  const pageRowKeys = data.map((row, index) => getRowKey(row, rowKey, index));
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

  const selectedRows = data.filter((row, index) => selectedKeys.has(getRowKey(row, rowKey, index)));

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
      const dp = props as FloTableDataProps<T, C>;
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
      const dp = props as FloTableDataProps<T, C>;
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
      (props as FloTableDataProps<T, C>).onPageChange(newPage);
    }
  }

  const hasBulkActions = (bulkActions?.length ?? 0) > 0;
  const hasCustomBar = typeof renderBulkActionBar === 'function';
  const hasInlineBar = typeof renderInlineBulkActions === 'function';
  const hasTableActions = (tableActions?.length ?? 0) > 0;
  const hasToolbarEnd = toolbarEnd != null && typeof toolbarEnd !== 'boolean';
  const hasSelection = selectedKeys.size > 0;
  const hasFilterBar = showSearch || effectiveFilterDefs.length > 0;

  const bulkBarContext: BulkActionBarContext<T> = {
    selectedRows,
    selectedKeys: [...selectedKeys],
    count: selectedKeys.size,
    clearSelection,
  };

  const themeContextValue = useMemo(() => ({ inheritTheme }), [inheritTheme]);

  return (
    <FloTableThemeContext.Provider value={themeContextValue}>
      <div
        className={cx('flotable-root', inheritTheme && 'flotable-root--inherit', classNames?.root)}
        style={styles?.root} dir={direction}>
        {(hasFilterBar || (!hasCustomBar && hasBulkActions) || hasInlineBar || hasToolbarEnd || hasTableActions) && (
          <div className="flotable-toolbar">
            <FilterBar
              filterDefs={effectiveFilterDefs}
              activeFilters={quickFilters}
              onFilterChange={handleFilterChange}
              showSearch={showSearch}
              filterMode={filterMode}
              classNames={classNames}
              styles={styles}
              labels={labels}
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
            {hasToolbarEnd && (
              <ToolbarEnd classNames={classNames} styles={styles}>
                {toolbarEnd}
              </ToolbarEnd>
            )}
            {hasTableActions && (
              <TableActions actions={tableActions!} classNames={classNames} styles={styles} />
            )}
          </div>
        )}
        {hasCustomBar && hasSelection && renderBulkActionBar(bulkBarContext)}
        <div className={cx('flotable-wrapper', classNames?.wrapper)} style={styles?.wrapper}>
          <table ref={tableRef} className={cx('flotable', classNames?.table)} style={styles?.table}>
            <TableHeader
              columns={columns}
              sortState={sortState}
              onSort={handleSort}
              rowActions={rowActions}
              rowActionsLabel={rowActionsLabel}
              selectable={selectable}
              selectionState={selectionState}
              onToggleAll={handleToggleAll}
              expandable={isExpandable}
              classNames={classNames}
              styles={styles}
              labels={labels}
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
              getChildren={getChildren}
              childRequest={childRequest}
              rowHasChildren={rowHasChildren}
              childPageSize={childPageSize}
              childRowKey={childRowKey}
              childColumns={childColumns}
              expandedKeys={expandedKeys}
              onToggleExpand={handleToggleExpand}
              expandOn={expandOn}
              searchQuery={searchQuery}
              columnWidths={columnWidths}
              childRowsLabels={childRowsLabels}
              labels={labels}
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
    </FloTableThemeContext.Provider>
  );
}

const FloTable = forwardRef(FloTableImpl) as <T extends object, C extends object = T>(
  props: FloTableProps<T, C> & { ref?: Ref<FloTableHandle<T>> },
) => ReactElement | null;

(FloTable as { displayName?: string }).displayName = 'FloTable';

export default FloTable;
