import type { ReactNode } from 'react';
import type { BulkAction, FloTableClassNames, FloTableStyles } from '../../FloTable.types';
import { cx } from '../../../utils/cx';
import './BulkActionBar.css';

interface BulkActionBarProps<T> {
  actions: BulkAction<T>[];
  selectedRows: T[];
  onClearSelection: () => void;
  clearSelectionLabel?: string;
  clearSelectionIcon?: ReactNode;
  selectionCountLabel?: (count: number) => string;
  classNames?: FloTableClassNames;
  styles?: FloTableStyles;
}

const defaultSelectionCountLabel = (count: number) =>
  count === 0 ? 'No rows selected' : `${count} row${count !== 1 ? 's' : ''} selected`;

export function BulkActionBar<T>({
  actions,
  selectedRows,
  onClearSelection,
  clearSelectionLabel = 'Clear selection',
  clearSelectionIcon,
  selectionCountLabel = defaultSelectionCountLabel,
  classNames,
  styles,
}: BulkActionBarProps<T>) {
  const count = selectedRows.length;
  const hasSelection = count > 0;

  return (
    <div
      className={cx('flotable-bulk-bar', classNames?.bulkActionBar)}
      style={styles?.bulkActionBar}
    >
      <span
        className={cx('flotable-bulk-bar__count', classNames?.bulkActionBarCount)}
        style={styles?.bulkActionBarCount}
      >
        {selectionCountLabel(count)}
      </span>
      <div
        className={cx('flotable-bulk-bar__actions', classNames?.bulkActionBarActions)}
        style={styles?.bulkActionBarActions}
      >
        {actions.map((action) => {
          const isDisabled = !hasSelection || (action.disabled?.(selectedRows) ?? false);
          return (
            <button
              key={action.key}
              type="button"
              className={cx(
                'flotable-bulk-bar__btn',
                action.icon != null && !action.label ? 'flotable-bulk-bar__btn--icon-only' : null,
                action.danger && 'flotable-bulk-bar__btn--danger',
                action.className,
              )}
              style={action.style}
              disabled={isDisabled}
              onClick={() => action.onClick(selectedRows)}
              title={action.label}
            >
              {action.icon ? <span aria-hidden="true">{action.icon}</span> : null}
              {action.label}
            </button>
          );
        })}
      </div>
      {hasSelection && (
        <button
          type="button"
          className={cx('flotable-bulk-bar__clear', classNames?.bulkActionBarClear)}
          style={styles?.bulkActionBarClear}
          onClick={onClearSelection}
        >
          {clearSelectionIcon ? <span aria-hidden="true">{clearSelectionIcon}</span> : null}
          {clearSelectionLabel}
        </button>
      )}
    </div>
  );
}
