import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import type { RowAction } from '../../../FloTable.types';
import { RowActionsDropdown } from '../../RowActionsDropdown/RowActionsDropdown';
import '../RowActionsInline/RowActionsInline.css';
import './RowActionsOverflow.css';

interface RowActionsOverflowProps<T> {
  actions: RowAction<T>[];
  row: T;
  moreIcon?: ReactNode;
}

const VIEWPORT_MARGIN = 8;

export function RowActionsOverflow<T>({ actions, row, moreIcon }: RowActionsOverflowProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<CSSProperties | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const overflowBtnRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const inlineActions = actions.slice(0, 2);
  const overflowActions = actions.slice(2);

  function computePosition() {
    if (!overflowBtnRef.current) return;
    const btnRect = overflowBtnRef.current.getBoundingClientRect();
    // Default: right-anchored to the button. If we already know the menu's width
    // (from a prior render), flip to left-anchored when it would overflow the
    // left edge of the viewport.
    const menuWidth = dropdownRef.current?.offsetWidth ?? 0;
    if (menuWidth > 0 && btnRect.right - menuWidth < VIEWPORT_MARGIN) {
      setDropdownStyle({
        top: btnRect.bottom + 4,
        left: Math.max(VIEWPORT_MARGIN, btnRect.left),
      });
      return;
    }
    setDropdownStyle({
      top: btnRect.bottom + 4,
      right: window.innerWidth - btnRect.right,
    });
  }

  // After the dropdown first renders we can measure its real width. If the
  // initial right-anchored position pushes it past the viewport's left edge,
  // flip it to left-anchored so the whole menu stays on screen.
  useLayoutEffect(() => {
    if (!isOpen) return;
    if (!overflowBtnRef.current || !dropdownRef.current) return;
    const menuRect = dropdownRef.current.getBoundingClientRect();
    if (menuRect.left >= VIEWPORT_MARGIN) return;
    const btnRect = overflowBtnRef.current.getBoundingClientRect();
    setDropdownStyle({
      top: btnRect.bottom + 4,
      left: Math.max(VIEWPORT_MARGIN, btnRect.left),
    });
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    function handleOutsideClick(e: MouseEvent) {
      const target = e.target as Node;
      const insideContainer = containerRef.current?.contains(target) ?? false;
      const insideDropdown = dropdownRef.current?.contains(target) ?? false;
      if (!insideContainer && !insideDropdown) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    function reposition() {
      if (!overflowBtnRef.current) return;
      const btnRect = overflowBtnRef.current.getBoundingClientRect();
      const menuWidth = dropdownRef.current?.offsetWidth ?? 0;
      if (menuWidth > 0 && btnRect.right - menuWidth < VIEWPORT_MARGIN) {
        setDropdownStyle({
          top: btnRect.bottom + 4,
          left: Math.max(VIEWPORT_MARGIN, btnRect.left),
        });
        return;
      }
      setDropdownStyle({
        top: btnRect.bottom + 4,
        right: window.innerWidth - btnRect.right,
      });
    }
    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);
    return () => {
      window.removeEventListener('scroll', reposition, true);
      window.removeEventListener('resize', reposition);
    };
  }, [isOpen]);

  return (
    <div
      ref={containerRef}
      className="flotable__row-actions-cell flotable__row-actions-cell--overflow"
    >
      {inlineActions.map((action) => (
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
      <button
        ref={overflowBtnRef}
        type="button"
        className="flotable__row-actions-cell__overflow-btn"
        aria-label="More actions"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => {
          if (!isOpen) computePosition();
          setIsOpen((o) => !o);
        }}
      >
        {moreIcon ?? <>&#8943;</>}
      </button>
      {isOpen && dropdownStyle && (
        <RowActionsDropdown
          actions={overflowActions}
          row={row}
          onClose={() => setIsOpen(false)}
          style={dropdownStyle}
          dropdownRef={dropdownRef}
        />
      )}
    </div>
  );
}
