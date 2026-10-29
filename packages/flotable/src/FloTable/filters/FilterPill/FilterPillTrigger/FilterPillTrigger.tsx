import { useRef } from 'react';
import type { ReactNode } from 'react';
import type { FilterDef, FloTableClassNames, FloTableLabels, FloTableStyles } from '../../../FloTable.types';
import { cx } from '../../../../utils/cx';
import { toFilterOption } from '../../../tableUtils';
import { FilterPillReveal } from '../FilterPillReveal/FilterPillReveal';
import './FilterPillTrigger.css';

export function formatActiveValue(def: FilterDef, value: string, labels?: FloTableLabels): string {
  if (def.type === 'boolean') {
    return value === 'true' ? labels?.booleanTrue ?? 'Yes' : labels?.booleanFalse ?? 'No';
  }
  if (def.type === 'select') {
    const match = (def.options ?? []).map(toFilterOption).find((opt) => opt.value === value);
    return match?.label ?? value;
  }
  return value;
}

interface FilterPillTriggerProps {
  def: FilterDef;
  value: string;
  isOpen: boolean;
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
  onClick,
  renderTriggerLabel,
  renderActiveValue,
  classNames,
  styles,
  ariaLabel,
  labels,
}: FilterPillTriggerProps) {
  const isActive = value !== '';
  const lastValueRef = useRef(value);
  if (isActive) lastValueRef.current = value;
  const shownValue = lastValueRef.current;

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
      {shownValue !== '' && (
        <FilterPillReveal shown={isActive && (!isOpen || def.type === 'select')} className="flotable-filter-pill__active-value-wrap">
          {renderActiveValue
            ? renderActiveValue(shownValue)
            : <span className="flotable-filter-pill__active-value">: {formatActiveValue(def, shownValue, labels)}</span>}
        </FilterPillReveal>
      )}
    </button>
  );
}
