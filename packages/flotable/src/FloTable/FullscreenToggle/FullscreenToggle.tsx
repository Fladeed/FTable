import type { ReactNode } from 'react';
import type { FloTableClassNames, FloTableStyles } from '../FloTable.types';
import { cx } from '../../utils/cx';
import './FullscreenToggle.css';

interface FullscreenToggleProps {
  isFullscreen: boolean;
  onToggle: () => void;
  enterIcon?: ReactNode;
  exitIcon?: ReactNode;
  /** Aria label when currently not in fullscreen (clicking will enter). */
  enterLabel?: string;
  /** Aria label when currently in fullscreen (clicking will exit). */
  exitLabel?: string;
  classNames?: FloTableClassNames;
  styles?: FloTableStyles;
}

const DEFAULT_ENTER_ICON = (
  <svg
    className="flotable-fullscreen-toggle__svg"
    viewBox="0 0 16 16"
    width="14"
    height="14"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M2 6V2h4" />
    <path d="M10 2h4v4" />
    <path d="M14 10v4h-4" />
    <path d="M6 14H2v-4" />
  </svg>
);

const DEFAULT_EXIT_ICON = (
  <svg
    className="flotable-fullscreen-toggle__svg"
    viewBox="0 0 16 16"
    width="14"
    height="14"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M6 2v4H2" />
    <path d="M14 6h-4V2" />
    <path d="M10 14v-4h4" />
    <path d="M2 10h4v4" />
  </svg>
);

export function FullscreenToggle({
  isFullscreen,
  onToggle,
  enterIcon,
  exitIcon,
  enterLabel = 'Enter fullscreen',
  exitLabel = 'Exit fullscreen',
  classNames,
  styles,
}: FullscreenToggleProps) {
  const label = isFullscreen ? exitLabel : enterLabel;
  const icon = isFullscreen ? (exitIcon ?? DEFAULT_EXIT_ICON) : (enterIcon ?? DEFAULT_ENTER_ICON);

  return (
    <button
      type="button"
      className={cx('flotable-fullscreen-toggle', classNames?.fullscreenToggle)}
      style={styles?.fullscreenToggle}
      aria-label={label}
      aria-pressed={isFullscreen}
      title={label}
      onClick={onToggle}
    >
      {icon}
    </button>
  );
}
