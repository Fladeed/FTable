import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { CSSProperties } from 'react';
import type { RowAction } from '../../FloTable.types';
import './RowActionsDropdown.css';

interface RowActionsDropdownProps<T> {
  actions: RowAction<T>[];
  row: T;
  onClose: () => void;
  style?: CSSProperties;
}

export function RowActionsDropdown<T>({ actions, row, onClose, style }: RowActionsDropdownProps<T>) {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    itemRefs.current[focusedIndex]?.focus();
  }, [focusedIndex]);

  useEffect(() => {
    itemRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedIndex((i) => (i + 1) % actions.length);
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedIndex((i) => (i - 1 + actions.length) % actions.length);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [actions.length, onClose]);

  return createPortal(
    <div role="menu" className="flotable__row-actions-dropdown" style={style}>
      {actions.map((action, index) => (
          <button
            key={action.key}
            ref={(el) => { itemRefs.current[index] = el; }}
            role="menuitem"
            type="button"
            className={[
              'flotable__row-actions-dropdown__item',
              action.danger ? 'flotable__row-actions-dropdown__item--danger' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            disabled={action.disabled?.(row) ?? false}
            onFocus={() => setFocusedIndex(index)}
            onClick={() => {
              action.onClick(row);
              onClose();
            }}
          >
            {action.icon && (
              <span aria-hidden="true" className="flotable__row-actions-dropdown__item-icon">
                {action.icon}
              </span>
            )}
            {action.label}
          </button>
      ))}
    </div>,
    document.body,
  );
}
