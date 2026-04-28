import type { TableBodyProps } from '../FloTable.types';
import { TableRow } from '../TableRow/TableRow';
import { TableBodySkeleton } from './TableBodySkeleton/TableBodySkeleton';
import { TableBodyError } from './TableBodyError/TableBodyError';
import { TableBodyEmpty } from './TableBodyEmpty/TableBodyEmpty';
import { cx } from '../../utils/cx';
import './TableBody.css';

export function TableBody<T extends object>({
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
}: TableBodyProps<T>) {
  const hasActions = (rowActions?.length ?? 0) > 0;
  const colCount = columns.length + (hasActions ? 1 : 0) + (selectable ? 1 : 0);

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
    <tbody className={cx('flotable__body', classNames?.body)} style={styles?.body}>
      {rows.map((row, index) => {
        const key = String(row[rowKey as keyof T]);
        return (
          <TableRow
            key={index}
            row={row}
            columns={columns}
            rowActions={rowActions}
            rowActionsMoreIcon={rowActionsMoreIcon}
            selectable={selectable}
            isSelected={selectedKeys?.has(key)}
            onToggle={() => onToggleRow?.(key)}
            classNames={classNames}
            styles={styles}
          />
        );
      })}
    </tbody>
  );
}


