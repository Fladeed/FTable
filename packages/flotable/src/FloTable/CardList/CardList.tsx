import type { ReactNode } from 'react';
import type { ColumnDef, FloTableClassNames, FloTableStyles, RowAction } from '../FloTable.types';
import { renderCell } from '../fields/renderCell';
import { RowActionsCell } from '../ActionBar/RowActionsCell/RowActionsCell';
import { cx } from '../../utils/cx';
import './CardList.css';

interface CardListProps<T extends object> {
  columns: ColumnDef<T>[];
  rows: T[];
  rowKey?: string;
  rowActions?: RowAction<T>[];
  rowActionsMoreIcon?: ReactNode;
  selectable?: boolean;
  selectedKeys?: Set<string>;
  onToggleRow?: (key: string) => void;
  renderCard?: (row: T, index: number) => ReactNode;
  classNames?: FloTableClassNames;
  styles?: FloTableStyles;
  isLoading?: boolean;
  loadingRowCount?: number;
  error?: string | null;
  onRetry?: () => void;
  emptyLabel?: string;
  retryLabel?: string;
  selectRowAriaLabel?: string;
}

export function CardList<T extends object>({
  columns,
  rows,
  rowKey = 'id',
  rowActions,
  rowActionsMoreIcon,
  selectable,
  selectedKeys,
  onToggleRow,
  renderCard,
  classNames,
  styles,
  isLoading = false,
  loadingRowCount = 5,
  error = null,
  onRetry,
  emptyLabel = 'No data',
  retryLabel = 'Retry',
  selectRowAriaLabel = 'Select row',
}: CardListProps<T>) {
  if (isLoading) {
    return (
      <div className={cx('flotable-card-list', classNames?.body)} style={styles?.body}>
        {Array.from({ length: loadingRowCount }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className={cx('flotable-card flotable-card--skeleton', classNames?.card)}
            style={styles?.card}
          >
            {columns.map((_, colIndex) => (
              <div key={colIndex} className="flotable-card__row">
                <span className="flotable-card__label flotable-card__skeleton-line flotable-card__skeleton-line--label" />
                <span className="flotable-card__value flotable-card__skeleton-line flotable-card__skeleton-line--value" />
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={cx('flotable-card-list', classNames?.body)} style={styles?.body}>
        <div
          className={cx('flotable-card flotable-card--error', classNames?.card)}
          style={styles?.card}
          role="alert"
        >
          <span className="flotable-card__error-message">{error}</span>
          {onRetry && (
            <button type="button" className="flotable-card__retry-btn" onClick={onRetry}>
              {retryLabel}
            </button>
          )}
        </div>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className={cx('flotable-card-list', classNames?.body)} style={styles?.body}>
        <div
          className={cx('flotable-card flotable-card--empty', classNames?.card)}
          style={styles?.card}
        >
          {emptyLabel}
        </div>
      </div>
    );
  }

  return (
    <div className={cx('flotable-card-list', classNames?.body)} style={styles?.body}>
      {rows.map((row, index) => {
        const key = String(row[rowKey as keyof T]);
        const isSelected = selectedKeys?.has(key) ?? false;
        return (
          <div
            key={key}
            className={cx(
              'flotable-card',
              isSelected && 'flotable-card--selected',
              classNames?.card,
            )}
            style={styles?.card}
          >
            {selectable && (
              <div
                className={cx(
                  'flotable-card__row flotable-card__row--select',
                  classNames?.cardSelectRow,
                )}
                style={styles?.cardSelectRow}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onToggleRow?.(key)}
                  aria-label={selectRowAriaLabel}
                />
              </div>
            )}
            {renderCard
              ? renderCard(row, index)
              : columns.map((col) => (
                  <div key={col.key} className="flotable-card__row">
                    <span
                      className={cx('flotable-card__label', classNames?.cardLabel)}
                      style={styles?.cardLabel}
                    >
                      {col.header}
                    </span>
                    <span
                      className={cx('flotable-card__value', classNames?.cardValue)}
                      style={styles?.cardValue}
                    >
                      {renderCell(col, row)}
                    </span>
                  </div>
                ))}
            {rowActions && rowActions.length > 0 && (
              <div
                className={cx(
                  'flotable-card__row flotable-card__row--actions',
                  classNames?.cardActionsRow,
                )}
                style={styles?.cardActionsRow}
              >
                <RowActionsCell actions={rowActions} row={row} moreIcon={rowActionsMoreIcon} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
