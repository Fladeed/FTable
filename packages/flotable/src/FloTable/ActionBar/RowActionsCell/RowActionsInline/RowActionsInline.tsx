import type { RowAction } from '../../../FloTable.types';
import './RowActionsInline.css';

interface RowActionsInlineProps<T> {
  actions: RowAction<T>[];
  row: T;
}

export function RowActionsInline<T>({ actions, row }: RowActionsInlineProps<T>) {
  return (
    <div className="flotable__row-actions-cell">
      {actions.map((action) => (
        <button
          key={action.key}
          type="button"
          className={[
            'flotable__row-actions-cell__btn',
            action.danger ? 'flotable__row-actions-cell__btn--danger' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          disabled={action.disabled?.(row) ?? false}
          aria-label={action.label}
          title={action.label}
          onClick={() => action.onClick(row)}
        >
          {action.icon ? <span aria-hidden="true">{action.icon}</span> : action.label}
        </button>
      ))}
    </div>
  );
}
