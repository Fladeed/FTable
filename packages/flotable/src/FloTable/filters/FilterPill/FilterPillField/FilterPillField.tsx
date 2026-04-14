import type { FilterDef, FloTableClassNames, FloTableStyles } from '../../../FloTable.types';
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
}: FilterPillFieldProps) {
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
          onChange={(e) => onValueChange(def.key, e.target.value)}
          autoFocus={isOpen && !isClosing}
        >
          <option value="">All</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      )}

      {def.type === 'select' && (
        <select
          className={cx('flotable-filter-pill__input', classNames?.filterPillInput)}
          style={styles?.filterPillInput}
          value={value}
          onChange={(e) => onValueChange(def.key, e.target.value)}
          autoFocus={isOpen && !isClosing}
        >
          <option value="">All</option>
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
          placeholder={placeholder}
          autoFocus={isOpen && !isClosing}
        />
      )}

      <button
        type="button"
        className="flotable-filter-pill__close"
        onClick={() => onClose(def.key)}
        aria-label="Close filter"
      >
        ×
      </button>
    </span>
  );
}
