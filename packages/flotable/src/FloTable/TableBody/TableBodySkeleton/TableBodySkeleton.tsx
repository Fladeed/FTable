import type { ColumnDef, FloTableClassNames, FloTableStyles } from '../../FloTable.types';
import { cx } from '../../../utils/cx';
import './TableBodySkeleton.css';

interface TableBodySkeletonProps<T extends object> {
  columns: ColumnDef<T>[];
  rowCount: number;
  classNames?: FloTableClassNames;
  styles?: FloTableStyles;
}

export function TableBodySkeleton<T extends object>({
  columns,
  rowCount,
  classNames,
  styles,
}: TableBodySkeletonProps<T>) {
  return (
    <tbody className={cx('flotable__body', classNames?.body)} style={styles?.body}>
      {Array.from({ length: rowCount }).map((_, rowIndex) => (
        <tr key={rowIndex} className="flotable__row--skeleton">
          {columns.map((_, colIndex) => (
            <td
              key={colIndex}
              className={cx('flotable__cell--skeleton', classNames?.cell)}
              style={styles?.cell}
            >
              <span className="flotable__skeleton-shimmer" />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}
