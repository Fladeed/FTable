import type { ReactNode } from 'react';
import type { FloTableClassNames, FloTableStyles } from '../FloTable.types';
import { cx } from '../../utils/cx';
import './ViewToggle.css';

export type FloTableView = 'table' | 'card';

interface ViewToggleProps {
  view: FloTableView;
  onToggle: () => void;
  tableIcon?: ReactNode;
  cardIcon?: ReactNode;
  /** Aria label when the current view is `'card'` (i.e. clicking switches to table). */
  showTableLabel?: string;
  /** Aria label when the current view is `'table'` (i.e. clicking switches to cards). */
  showCardLabel?: string;
  classNames?: FloTableClassNames;
  styles?: FloTableStyles;
}

const DEFAULT_TABLE_ICON = (
  <svg
    className="flotable-view-toggle__svg"
    viewBox="0 0 16 16"
    width="14"
    height="14"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
    aria-hidden="true"
  >
    <rect x="1.5" y="2.5" width="13" height="11" rx="1" />
    <line x1="1.5" y1="6.25" x2="14.5" y2="6.25" />
    <line x1="6" y1="2.5" x2="6" y2="13.5" />
    <line x1="10" y1="2.5" x2="10" y2="13.5" />
  </svg>
);

const DEFAULT_CARD_ICON = (
  <svg
    className="flotable-view-toggle__svg"
    viewBox="0 0 16 16"
    width="14"
    height="14"
    aria-hidden="true"
  >
    <rect
      x="1.5"
      y="2"
      width="13"
      height="5"
      rx="1"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
    />
    <rect
      x="1.5"
      y="9"
      width="13"
      height="5"
      rx="1"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
    />
  </svg>
);

export function ViewToggle({
  view,
  onToggle,
  tableIcon,
  cardIcon,
  showTableLabel = 'Show as table',
  showCardLabel = 'Show as cards',
  classNames,
  styles,
}: ViewToggleProps) {
  const isCard = view === 'card';
  const label = isCard ? showTableLabel : showCardLabel;
  const icon = isCard ? (tableIcon ?? DEFAULT_TABLE_ICON) : (cardIcon ?? DEFAULT_CARD_ICON);

  return (
    <button
      type="button"
      className={cx('flotable-view-toggle', classNames?.viewToggle)}
      style={styles?.viewToggle}
      aria-label={label}
      aria-pressed={isCard}
      title={label}
      onClick={onToggle}
    >
      {icon}
    </button>
  );
}
