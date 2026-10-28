import type { ReactNode } from 'react';
import type { FilterDef, FloTableClassNames, FloTableLabels, FloTableStyles } from '../../../FloTable.types';
import { cx } from '../../../../utils/cx';
import { formatActiveValue } from '../FilterPillTrigger/FilterPillTrigger';
import './FilterPillToggle.css';

interface FilterPillToggleProps {
  def: FilterDef;
  value: string;
  onToggle: () => void;
  renderTriggerLabel?: ReactNode;
  renderActiveValue?: (value: string) => ReactNode;
  classNames?: FloTableClassNames;
  styles?: FloTableStyles;
  ariaLabel?: string;
  labels?: FloTableLabels;
}

export function FilterPillToggle({
  def,
  value,
  onToggle,
  renderTriggerLabel,
  renderActiveValue,
  classNames,
  styles,
  ariaLabel,
  labels,
}: FilterPillToggleProps) {
  const isActive = value !== '';

  return (
    <button
      type="button"
      className={cx('flotable-filter-pill__trigger', 'flotable-filter-pill__toggle', classNames?.filterPillTrigger)}
      style={styles?.filterPillTrigger}
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
      aria-pressed={isActive}
      aria-label={ariaLabel}
    >
      {renderTriggerLabel ?? <span className="flotable-filter-pill__label">{def.label}</span>}
      {value === 'false' && (
        renderActiveValue
          ? renderActiveValue(value)
          : <span className="flotable-filter-pill__active-value">: {formatActiveValue(def, value, labels)}</span>
      )}
    </button>
  );
}
