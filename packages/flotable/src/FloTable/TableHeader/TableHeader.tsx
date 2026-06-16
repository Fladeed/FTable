import { useRef, useEffect } from 'react';
import type { TableHeaderProps } from '../FloTable.types';
import { SortIndicator } from '../SortIndicator/SortIndicator';
import { cx } from '../../utils/cx';
import './TableHeader.css';

export function TableHeader<T extends object, C extends object = T>({
  columns,
  sortState,
  onSort,
  rowActions,
  rowActionsLabel = 'Actions',
  selectable,
  selectionState,
  onToggleAll,
  expandable,
  classNames,
  styles,
}: TableHeaderProps<T, C>) {
  const checkboxRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = selectionState === 'some';
    }
  }, [selectionState]);

  return (
    <thead className={cx('flotable__header', classNames?.header)} style={styles?.header}>
      <tr className={classNames?.headerRow} style={styles?.headerRow}>
        {expandable && (
          <th className="flotable__expander-cell flotable__expander-cell--header" aria-hidden="true" style={styles?.headerCell} />
        )}
        {selectable && (
          <th className="flotable__checkbox-cell flotable__checkbox-cell--header" style={styles?.headerCell}>
            <input
              ref={checkboxRef}
              type="checkbox"
              checked={selectionState === 'all'}
              onChange={onToggleAll}
              aria-label="Select all rows"
            />
          </th>
        )}
        {columns.map((col) => {
          const isSortable = col.sortable !== false;
          const activeDirection = sortState?.key === col.key ? sortState.direction : null;
          return (
            <th
              key={col.key}
              className={cx(
                'flotable__header-cell',
                isSortable && 'flotable__header-cell--sortable',
                activeDirection && 'flotable__header-cell--sorted',
                classNames?.headerCell,
              )}
              style={styles?.headerCell}
              onClick={isSortable ? () => onSort(col.key) : undefined}
              aria-sort={activeDirection === 'asc' ? 'ascending' : activeDirection === 'desc' ? 'descending' : undefined}
            >
              <span className="flotable__header-cell-content">
                {col.header}
                {isSortable && <SortIndicator direction={activeDirection} />}
              </span>
            </th>
          );
        })}
        {rowActions && rowActions.length > 0 && (
          <th
            className={cx('flotable__header-cell flotable__header-cell--actions', classNames?.headerCell)}
            style={styles?.headerCell}
          >
            <span className="flotable__header-cell-content">{rowActionsLabel}</span>
          </th>
        )}
      </tr>
    </thead>
  );
}
