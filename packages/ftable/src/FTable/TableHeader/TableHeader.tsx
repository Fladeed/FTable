import type { TableHeaderProps } from '../FTable.types';
import { SortIndicator } from '../SortIndicator/SortIndicator';
import { cx } from '../../utils/cx';
import './TableHeader.css';

export function TableHeader<T extends object>({
  columns,
  sortState,
  onSort,
  classNames,
  styles,
}: TableHeaderProps<T>) {
  return (
    <thead className={cx('ftable__header', classNames?.header)} style={styles?.header}>
      <tr className={classNames?.headerRow} style={styles?.headerRow}>
        {columns.map((col) => {
          const isSortable = col.sortable !== false;
          const activeDirection = sortState?.key === col.key ? sortState.direction : null;
          return (
            <th
              key={col.key}
              className={cx(
                'ftable__header-cell',
                isSortable && 'ftable__header-cell--sortable',
                activeDirection && 'ftable__header-cell--sorted',
                classNames?.headerCell,
              )}
              style={styles?.headerCell}
              onClick={isSortable ? () => onSort(col.key) : undefined}
              aria-sort={activeDirection === 'asc' ? 'ascending' : activeDirection === 'desc' ? 'descending' : undefined}
            >
              <span className="ftable__header-cell-content">
                {col.header}
                {isSortable && <SortIndicator direction={activeDirection} />}
              </span>
            </th>
          );
        })}
      </tr>
    </thead>
  );
}
