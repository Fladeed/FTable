import type { TableBodyProps } from '../FloTable.types';
import { TableRow } from '../TableRow/TableRow';
import { TableBodySkeleton } from './TableBodySkeleton/TableBodySkeleton';
import { TableBodyError } from './TableBodyError/TableBodyError';
import { TableBodyEmpty } from './TableBodyEmpty/TableBodyEmpty';
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
  paginationLabels,
  showPageInput,
}: TableBodyProps<T, C>) {
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
        const value = String(row[rowKey as keyof T]);
        const key = value || String(index);
        return (
          <TableRow
            key={key}
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
            paginationLabels={paginationLabels}
            showPageInput={showPageInput}
          />
        );
      })}
    </tbody>
  );
}


