import type { BulkAction, FloTableClassNames, FloTableStyles } from '../../FloTable.types';
import { cx } from '../../../utils/cx';
import './BulkActionBar.css';

interface BulkActionBarProps<T> {
  actions: BulkAction<T>[];
  selectedRows: T[];
  onClearSelection: () => void;
  isVisible: boolean;
  classNames?: FloTableClassNames;
  styles?: FloTableStyles;
}

export function BulkActionBar<T>({
  actions,
  selectedRows,
  onClearSelection,
  isVisible,
  classNames,
  styles,
}: BulkActionBarProps<T>) {
  const count = selectedRows.length;

  return (
    <div
      className={cx('flotable-bulk-bar', isVisible && 'flotable-bulk-bar--visible', classNames?.bulkActionBar)}
      style={styles?.bulkActionBar}
    >
      <span
        className={cx('flotable-bulk-bar__count', classNames?.bulkActionBarCount)}
        style={styles?.bulkActionBarCount}
      >
        {count} row{count !== 1 ? 's' : ''} selected
      </span>
      <div
        className={cx('flotable-bulk-bar__actions', classNames?.bulkActionBarActions)}
        style={styles?.bulkActionBarActions}
      >
        {actions.map((action) => {
          const isDisabled = action.disabled?.(selectedRows) ?? false;
          return (
            <button
              key={action.key}
              type="button"
              className={cx(
                'flotable-bulk-bar__btn',
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
      <button
        type="button"
        className={cx('flotable-bulk-bar__clear', classNames?.bulkActionBarClear)}
        style={styles?.bulkActionBarClear}
        onClick={onClearSelection}
      >
        Clear selection
      </button>
    </div>
  );
}
