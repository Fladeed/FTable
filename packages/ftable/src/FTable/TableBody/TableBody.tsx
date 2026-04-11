import type { TableBodyProps } from '../FTable.types';
import { TableRow } from '../TableRow/TableRow';
import { TableBodySkeleton } from './TableBodySkeleton/TableBodySkeleton';
import { TableBodyError } from './TableBodyError/TableBodyError';
import { TableBodyEmpty } from './TableBodyEmpty/TableBodyEmpty';
import { cx } from '../../utils/cx';
import './TableBody.css';

export function TableBody<T extends object>({
  columns,
  rows,
  classNames,
  styles,
  isLoading = false,
  loadingRowCount = 5,
  error = null,
  onRetry,
}: TableBodyProps<T>) {
  if (isLoading) {
    return (
      <TableBodySkeleton
        columns={columns}
        rowCount={loadingRowCount}
        classNames={classNames}
        styles={styles}
      />
    );
  }

  if (error) {
    return (
      <TableBodyError
        columns={columns.length}
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
        columns={columns.length}
        classNames={classNames}
        styles={styles}
      />
    );
  }

  return (
    <tbody className={cx('ftable__body', classNames?.body)} style={styles?.body}>
      {rows.map((row, index) => (
        <TableRow
          key={index}
          row={row}
          columns={columns}
          classNames={classNames}
          styles={styles}
        />
      ))}
    </tbody>
  );
}


