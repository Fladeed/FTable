import type { BulkAction } from '../../FloTable.types';
import { cx } from '../../../utils/cx';
import './BulkActionBar.css';

interface BulkActionBarProps<T> {
  actions: BulkAction<T>[];
  selectedRows: T[];
  onClearSelection: () => void;
  isVisible: boolean;
}

export function BulkActionBar<T>({ actions, selectedRows, onClearSelection, isVisible }: BulkActionBarProps<T>) {
  const count = selectedRows.length;

  return (
    <div className={cx('flotable-bulk-bar', isVisible && 'flotable-bulk-bar--visible')}>
      <span className="flotable-bulk-bar__count">
        {count} row{count !== 1 ? 's' : ''} selected
      </span>
      <div className="flotable-bulk-bar__actions">
        {actions.map((action) => {
          const isDisabled = action.disabled?.(selectedRows) ?? false;
          return (
            <button
              key={action.key}
              type="button"
              className={cx(
                'flotable-bulk-bar__btn',
                action.danger && 'flotable-bulk-bar__btn--danger',
              )}
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
        className="flotable-bulk-bar__clear"
        onClick={onClearSelection}
      >
        Clear selection
      </button>
    </div>
  );
}
