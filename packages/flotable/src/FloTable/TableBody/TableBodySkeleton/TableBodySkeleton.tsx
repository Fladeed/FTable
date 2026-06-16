import type { ColumnDef, FloTableClassNames, FloTableStyles } from '../../FloTable.types';
import { cx } from '../../../utils/cx';
import './TableBodySkeleton.css';

interface TableBodySkeletonProps<T extends object, C extends object = T> {
  columns: ColumnDef<T, C>[];
  rowCount: number;
  selectable?: boolean;
  classNames?: FloTableClassNames;
  styles?: FloTableStyles;
}

export function TableBodySkeleton<T extends object, C extends object = T>({
  columns,
  rowCount,
  selectable,
  classNames,
  styles,
}: TableBodySkeletonProps<T, C>) {
  return (
    <tbody className={cx('flotable__body', classNames?.body)} style={styles?.body}>
      {Array.from({ length: rowCount }).map((_, rowIndex) => (
        <tr key={rowIndex} className="flotable__row--skeleton">
          {selectable && (
            <td className={cx('flotable__checkbox-cell flotable__cell--skeleton', classNames?.cell)} style={styles?.cell} />
          )}
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
