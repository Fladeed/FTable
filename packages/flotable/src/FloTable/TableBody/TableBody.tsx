import { useRef } from 'react';
import type { ChildCache, TableBodyProps } from '../FloTable.types';
import { TableRow } from '../TableRow/TableRow';
import { TableBodySkeleton } from './TableBodySkeleton/TableBodySkeleton';
import { TableBodyError } from './TableBodyError/TableBodyError';
import { TableBodyEmpty } from './TableBodyEmpty/TableBodyEmpty';
import { getRowKey } from '../tableUtils';
import { cx } from '../../utils/cx';
import './TableBody.css';

export function TableBody<T extends object, C extends object = T>({
  columns,
  rows,
  rowActions,
  rowActionsMoreIcon,
  selectable,
  selectedKeys,
  rowKey = 'id',
  onToggleRow,
  classNames,
  styles,
  isLoading = false,
  loadingRowCount = 5,
  error = null,
  onRetry,
  isRefreshing = false,
  getChildren,
  childRequest,
  rowHasChildren,
  childPageSize,
  childRowKey,
  childColumns,
  expandedKeys,
  onToggleExpand,
  expandOn,
  searchQuery,
  columnWidths,
  childRowsLabels,
  labels,
}: TableBodyProps<T, C>) {
  // Lives here (not in ChildRows, which unmounts on collapse) so reopening a row reuses its children.
  const childCacheRef = useRef<ChildCache<C>>(new Map());

  const hasActions = (rowActions?.length ?? 0) > 0;
  const isExpandable = typeof getChildren === 'function' || typeof childRequest === 'function';
  const colCount =
    columns.length + (hasActions ? 1 : 0) + (selectable ? 1 : 0) + (isExpandable ? 1 : 0);

  if (isLoading) {
    return (
      <TableBodySkeleton
        columns={columns}
        rowCount={loadingRowCount}
        selectable={selectable}
        hasActions={hasActions}
        expandable={isExpandable}
        classNames={classNames}
        styles={styles}
      />
    );
  }

  if (error) {
    return (
      <TableBodyError
        columns={colCount}
        message={error}
        retryLabel={labels?.retry}
        classNames={classNames}
        styles={styles}
        onRetry={onRetry}
      />
    );
  }

  if (rows.length === 0) {
    return (
      <TableBodyEmpty
        columns={colCount}
        message={labels?.empty}
        classNames={classNames}
        styles={styles}
      />
    );
  }

  return (
    <tbody
      className={cx('flotable__body', isRefreshing && 'flotable__body--refreshing', classNames?.body)}
      style={styles?.body}
    >
      {rows.map((row, index) => {
        const value = getRowKey(row, rowKey, index);
        return (
          <TableRow
            key={value}
            row={row}
            columns={columns}
            rowActions={rowActions}
            rowActionsMoreIcon={rowActionsMoreIcon}
            selectable={selectable}
            isSelected={selectedKeys?.has(value)}
            onToggle={() => onToggleRow?.(value)}
            classNames={classNames}
            styles={styles}
            getChildren={getChildren}
            childRequest={childRequest}
            rowHasChildren={rowHasChildren}
            childPageSize={childPageSize}
            childRowKey={childRowKey}
            childColumns={childColumns}
            isExpanded={expandedKeys?.has(value) ?? false}
            onToggleExpand={() => onToggleExpand?.(value)}
            expandOn={expandOn}
            searchQuery={searchQuery}
            colSpan={colCount}
            columnWidths={columnWidths}
            childRowsLabels={childRowsLabels}
            labels={labels}
            childCache={childCacheRef.current}
            rowKeyValue={value}
          />
        );
      })}
    </tbody>
  );
}


