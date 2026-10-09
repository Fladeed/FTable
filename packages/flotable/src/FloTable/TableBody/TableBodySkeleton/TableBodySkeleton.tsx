import type { ColumnDef, FloTableClassNames, FloTableStyles } from '../../FloTable.types';
import { cx } from '../../../utils/cx';
import './TableBodySkeleton.css';

interface TableBodySkeletonProps<T extends object, C extends object = T> {
  columns: ColumnDef<T, C>[];
  rowCount: number;
  selectable?: boolean;
  /** Whether a trailing row-actions column is rendered. */
  hasActions?: boolean;
  /** Whether a leading expander (chevron) column is rendered. */
  expandable?: boolean;
  classNames?: FloTableClassNames;
  styles?: FloTableStyles;
}

export function TableBodySkeleton<T extends object, C extends object = T>({
  columns,
  rowCount,
  selectable,
  hasActions,
  expandable,
  classNames,
  styles,
}: TableBodySkeletonProps<T, C>) {
  return (
    <tbody className={cx('flotable__body', classNames?.body)} style={styles?.body}>
      {Array.from({ length: rowCount }).map((_, rowIndex) => (
        <tr key={rowIndex} className="flotable__row--skeleton">
          {expandable && (
            <td className={cx('flotable__expander-cell flotable__cell--skeleton', classNames?.cell)} style={styles?.cell} />
          )}
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
          {hasActions && (
            <td className={cx('flotable__cell--actions flotable__cell--skeleton', classNames?.cell)} style={styles?.cell} />
          )}
        </tr>
      ))}
    </tbody>
  );
}
