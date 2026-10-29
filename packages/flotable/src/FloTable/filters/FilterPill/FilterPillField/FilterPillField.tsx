import { useEffect, useRef } from 'react';
import type { FilterDef, FloTableClassNames, FloTableLabels, FloTableStyles } from '../../../FloTable.types';
import { cx } from '../../../../utils/cx';
import { FilterPillSelect } from '../FilterPillSelect/FilterPillSelect';
import { FilterPillReveal } from '../FilterPillReveal/FilterPillReveal';
import './FilterPillField.css';

const defaultClearLabel = (label: string) => `Clear ${label || 'filter'}`;

interface FilterPillFieldProps {
  def: FilterDef;
  value: string;
  isOpen: boolean;
  onValueChange: (key: string, value: string) => void;
  onClear: (key: string) => void;
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
  onClear,
  onClose,
  hideSeparator = false,
  placeholder = '…',
  classNames,
  styles,
  labels,
}: FilterPillFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const selectRef = useRef<HTMLDivElement>(null);
  const hasValue = value !== '';

  useEffect(() => {
    if (isOpen) (inputRef.current ?? selectRef.current)?.focus({ preventScroll: true });
  }, [isOpen]);

  return (
    <FilterPillReveal shown={isOpen} className="flotable-filter-pill__field">
      {!hideSeparator && (
        <span className="flotable-filter-pill__separator" aria-hidden="true">:</span>
      )}

      {def.type === 'select' && (
        <FilterPillSelect
          def={def}
          value={value}
          isOpen={isOpen}
          onSelect={(v) => { onValueChange(def.key, v); onClose(def.key); }}
          controlRef={selectRef}
          classNames={classNames}
          styles={styles}
        />
      )}

      {(def.type === 'text' || def.type === 'number' || def.type === 'date') && (
        <input
          className={cx('flotable-filter-pill__input', `flotable-filter-pill__input--${def.type}`, classNames?.filterPillInput)}
          style={styles?.filterPillInput}
          type={def.type}
          inputMode={def.type === 'number' ? 'decimal' : undefined}
          value={value}
          onChange={(e) => onValueChange(def.key, e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') onClose(def.key); }}
          placeholder={placeholder}
          ref={inputRef}
        />
      )}

      <button
        type="button"
        className="flotable-filter-pill__close"
        onClick={() => (hasValue ? onClear(def.key) : onClose(def.key))}
        aria-label={hasValue ? (labels?.clearFilter ?? defaultClearLabel)(def.label) : labels?.closeFilter ?? 'Close filter'}
      >
        ×
      </button>
    </FilterPillReveal>
  );
}
