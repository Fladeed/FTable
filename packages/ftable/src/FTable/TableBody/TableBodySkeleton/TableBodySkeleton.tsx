import type { ColumnDef, FTableClassNames, FTableStyles } from '../../FTable.types';
import { cx } from '../../../utils/cx';
import './TableBodySkeleton.css';

interface TableBodySkeletonProps<T extends object> {
  columns: ColumnDef<T>[];
  rowCount: number;
  classNames?: FTableClassNames;
  styles?: FTableStyles;
}

export function TableBodySkeleton<T extends object>({
  columns,
  rowCount,
  classNames,
  styles,
}: TableBodySkeletonProps<T>) {
  return (
    <tbody className={cx('ftable__body', classNames?.body)} style={styles?.body}>
      {Array.from({ length: rowCount }).map((_, rowIndex) => (
        <tr key={rowIndex} className="ftable__row--skeleton">
          {columns.map((_, colIndex) => (
            <td
              key={colIndex}
              className={cx('ftable__cell--skeleton', classNames?.cell)}
              style={styles?.cell}
            >
              <span className="ftable__skeleton-shimmer" />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}
