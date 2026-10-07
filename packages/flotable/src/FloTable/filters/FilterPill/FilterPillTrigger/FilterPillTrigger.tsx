import type { ReactNode } from 'react';
import type { FilterDef, FloTableClassNames, FloTableLabels, FloTableStyles } from '../../../FloTable.types';
import { cx } from '../../../../utils/cx';
import './FilterPillTrigger.css';

export function formatActiveValue(def: FilterDef, value: string, labels?: FloTableLabels): string {
  if (def.type === 'boolean') {
    return value === 'true' ? labels?.booleanTrue ?? 'Yes' : labels?.booleanFalse ?? 'No';
  }
  return value;
}

interface FilterPillTriggerProps {
  def: FilterDef;
  value: string;
  isOpen: boolean;
  isClosing: boolean;
  onClick: (key: string) => void;
  renderTriggerLabel?: ReactNode;
  renderActiveValue?: (value: string) => ReactNode;
  classNames?: FloTableClassNames;
  styles?: FloTableStyles;
  ariaLabel?: string;
  labels?: FloTableLabels;
}

export function FilterPillTrigger({
  def,
  value,
  isOpen,
  isClosing,
  onClick,
  renderTriggerLabel,
  renderActiveValue,
  classNames,
  styles,
  ariaLabel,
  labels,
}: FilterPillTriggerProps) {
  const isActive = value !== '';

  return (
    <button
      type="button"
      className={cx('flotable-filter-pill__trigger', classNames?.filterPillTrigger)}
      style={styles?.filterPillTrigger}
      onClick={(e) => { e.stopPropagation(); onClick(def.key); }}
      aria-expanded={isOpen}
      aria-label={ariaLabel}
    >
      {renderTriggerLabel ?? <span className="flotable-filter-pill__label">{def.label}</span>}
      {isActive && !isOpen && !isClosing && (
        renderActiveValue
          ? renderActiveValue(value)
          : <span className="flotable-filter-pill__active-value">: {formatActiveValue(def, value, labels)}</span>
      )}
    </button>
  );
}
