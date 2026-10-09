import type { FilterDef, FloTableClassNames, FloTableLabels, FloTableStyles } from '../../../FloTable.types';
import { cx } from '../../../../utils/cx';
import './FilterPillField.css';

interface FilterPillFieldProps {
  def: FilterDef;
  value: string;
  isOpen: boolean;
  isClosing: boolean;
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
  isClosing,
  onValueChange,
  onClose,
  hideSeparator = false,
  placeholder = '…',
  classNames,
  styles,
  labels,
}: FilterPillFieldProps) {
  const allLabel = labels?.filterAll ?? 'All';
  return (
    <span className={`flotable-filter-pill__field${isClosing ? ' flotable-filter-pill__field--closing' : ''}`}>
      {!hideSeparator && (
        <span className="flotable-filter-pill__separator" aria-hidden="true">:</span>
      )}

      {def.type === 'boolean' && (
        <select
          className={cx('flotable-filter-pill__input', classNames?.filterPillInput)}
          style={styles?.filterPillInput}
          value={value}
          onChange={(e) => { onValueChange(def.key, e.target.value); onClose(def.key); }}
          autoFocus={isOpen && !isClosing}
        >
          <option value="">{allLabel}</option>
          <option value="true">{labels?.booleanTrue ?? 'Yes'}</option>
          <option value="false">{labels?.booleanFalse ?? 'No'}</option>
        </select>
      )}

      {def.type === 'select' && (
        <select
          className={cx('flotable-filter-pill__input', classNames?.filterPillInput)}
          style={styles?.filterPillInput}
          value={value}
          onChange={(e) => { onValueChange(def.key, e.target.value); onClose(def.key); }}
          autoFocus={isOpen && !isClosing}
        >
          <option value="">{allLabel}</option>
          {(def.options ?? []).map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
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
          autoFocus={isOpen && !isClosing}
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
  );
}
