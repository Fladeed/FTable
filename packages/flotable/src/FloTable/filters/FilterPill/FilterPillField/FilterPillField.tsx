import { useEffect, useRef } from 'react';
import type { FilterDef, FloTableClassNames, FloTableLabels, FloTableStyles } from '../../../FloTable.types';
import { cx } from '../../../../utils/cx';
import { toFilterOption } from '../../../tableUtils';
import './FilterPillField.css';

interface FilterPillFieldProps {
  def: FilterDef;
  value: string;
  isOpen: boolean;
  onValueChange: (key: string, value: string) => void;
  onClose: (key: string) => void;
  hideSeparator?: boolean;
  placeholder?: string;
  classNames?: FloTableClassNames;
  styles?: FloTableStyles;
  labels?: FloTableLabels;
}

export function FilterPillField({
  def,
  value,
  isOpen,
  onValueChange,
  onClose,
  hideSeparator = false,
  placeholder = '…',
  classNames,
  styles,
  labels,
}: FilterPillFieldProps) {
  const allLabel = labels?.filterAll ?? 'All';
  const controlRef = useRef<HTMLInputElement & HTMLSelectElement>(null);

  useEffect(() => {
    if (isOpen) controlRef.current?.focus({ preventScroll: true });
  }, [isOpen]);

  return (
    <span
      className={cx('flotable-filter-pill__field-wrap', isOpen && 'flotable-filter-pill__field-wrap--open')}
      aria-hidden={!isOpen}
      inert={!isOpen}
    >
    <span className="flotable-filter-pill__field">
      {!hideSeparator && (
        <span className="flotable-filter-pill__separator" aria-hidden="true">:</span>
      )}

      {def.type === 'select' && (
        <select
          className={cx('flotable-filter-pill__input', classNames?.filterPillInput)}
          style={styles?.filterPillInput}
          value={value}
          onChange={(e) => { onValueChange(def.key, e.target.value); onClose(def.key); }}
          ref={controlRef}
        >
          <option value="">{allLabel}</option>
          {(def.options ?? []).map(toFilterOption).map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      )}

      {(def.type === 'text' || def.type === 'number' || def.type === 'date') && (
        <input
          className={cx('flotable-filter-pill__input', classNames?.filterPillInput)}
          style={styles?.filterPillInput}
          type={def.type}
          value={value}
          onChange={(e) => onValueChange(def.key, e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') onClose(def.key); }}
          placeholder={placeholder}
          ref={controlRef}
        />
      )}

      <button
        type="button"
        className="flotable-filter-pill__close"
        onClick={() => onClose(def.key)}
        aria-label={labels?.closeFilter ?? 'Close filter'}
      >
        ×
      </button>
    </span>
    </span>
  );
}
