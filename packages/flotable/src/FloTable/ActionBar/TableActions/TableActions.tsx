import type { FloTableClassNames, FloTableStyles, TableAction } from '../../FloTable.types';
import { cx } from '../../../utils/cx';
import './TableActions.css';

interface TableActionsProps {
  actions: TableAction[];
  classNames?: FloTableClassNames;
  styles?: FloTableStyles;
}

export function TableActions({ actions, classNames, styles }: TableActionsProps) {
  return (
    <div
      className={cx('flotable-table-actions', classNames?.tableActions)}
      style={styles?.tableActions}
    >
      {actions.map((action) => {
        const isPrimary = action.variant === 'primary';
        const style =
          isPrimary && styles?.tableActionPrimary
            ? { ...styles?.tableAction, ...styles.tableActionPrimary }
            : styles?.tableAction;
        return (
          <button
            key={action.key}
            type="button"
            className={cx(
              'flotable-table-actions__btn',
              isPrimary && 'flotable-table-actions__btn--primary',
              classNames?.tableAction,
              isPrimary && classNames?.tableActionPrimary,
            )}
            style={style}
            aria-label={action.ariaLabel ?? action.label}
            disabled={action.disabled ?? false}
            onClick={() => action.onClick()}
          >
            {action.icon != null ? (
              <span className="flotable-table-actions__icon" aria-hidden="true">
                {action.icon}
              </span>
            ) : null}
            {action.label}
          </button>
        );
      })}
    </div>
  );
}
