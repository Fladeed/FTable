import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { RowAction } from '../../../FloTable.types';
import { RowActionsDropdown } from '../../RowActionsDropdown/RowActionsDropdown';
import '../RowActionsInline/RowActionsInline.css';
import './RowActionsOverflow.css';

interface RowActionsOverflowProps<T> {
  actions: RowAction<T>[];
  row: T;
  moreIcon?: ReactNode;
}

export function RowActionsOverflow<T>({ actions, row, moreIcon }: RowActionsOverflowProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const inlineActions = actions.slice(0, 2);
  const overflowActions = actions.slice(2);

  useEffect(() => {
    if (!isOpen) return;
    function handleOutsideClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  return (
    <div
      ref={containerRef}
      className="flotable__row-actions-cell flotable__row-actions-cell--overflow"
    >
      {inlineActions.map((action) => {
        const isDisabled = action.disabled?.(row) ?? false;
        return (
          <button
            key={action.key}
            type="button"
            className={[
              'flotable__row-actions-cell__btn',
              action.danger ? 'flotable__row-actions-cell__btn--danger' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            disabled={isDisabled}
            aria-label={action.label}
            title={action.label}
            onClick={() => action.onClick(row)}
          >
            {action.icon ? <span aria-hidden="true">{action.icon}</span> : action.label}
          </button>
        );
      })}
      <button
        type="button"
        className="flotable__row-actions-cell__overflow-btn"
        aria-label="More actions"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((o) => !o)}
      >
        {moreIcon ?? <>&#8943;</>}
      </button>
      {isOpen && (
        <RowActionsDropdown
          actions={overflowActions}
          row={row}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
