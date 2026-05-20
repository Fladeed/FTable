import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import type { FilterDef, FloTableClassNames, FloTableStyles, QuickFilterState } from '../../FloTable.types';
import { cx } from '../../../utils/cx';
import './MobileFilters.css';

interface MobileFiltersProps {
  filterDefs: FilterDef[];
  values: QuickFilterState;
  onValueChange: (key: string, value: string) => void;
  onClear: (key: string) => void;
  classNames?: FloTableClassNames;
  styles?: FloTableStyles;
  /** Label shown on the trigger button. Defaults to `'Filters'`. */
  triggerLabel?: string;
  /** Aria label for the trigger when there are no active filters. */
  triggerAriaLabel?: string;
  /** Label for the sheet header. Defaults to `'Filters'`. */
  sheetTitle?: string;
  /** Label for the clear-all button. Defaults to `'Clear all'`. */
  clearAllLabel?: string;
  /** Label for the close button. Defaults to `'Done'`. */
  doneLabel?: string;
  /** Aria label for the close (X) button. Defaults to `'Close filters'`. */
  closeAriaLabel?: string;
  /** Swap the default funnel icon. */
  icon?: ReactNode;
  /** Fully replace the trigger button. */
  renderTrigger?: (ctx: {
    activeCount: number;
    isOpen: boolean;
    onOpen: () => void;
    label: string;
  }) => ReactNode;
  /**
   * When true, render a search input as the first row in the sheet
   * (instead of a separate inline pill in the toolbar).
   */
  showSearch?: boolean;
  /** Current search value. Used together with `showSearch`. */
  searchValue?: string;
  /** Called when the search value changes. Receives the new value. */
  onSearchChange?: (value: string) => void;
  /** Label for the search row. Defaults to `'Search'`. */
  searchLabel?: string;
  /** Placeholder for the search input. Defaults to `'Search…'`. */
  searchPlaceholder?: string;
}

export function MobileFilters({
  filterDefs,
  values,
  onValueChange,
  onClear,
  classNames,
  styles,
  triggerLabel = 'Filters',
  triggerAriaLabel = 'Open filters',
  sheetTitle = 'Filters',
  clearAllLabel = 'Clear all',
  doneLabel = 'Done',
  closeAriaLabel = 'Close filters',
  icon,
  renderTrigger,
  showSearch = false,
  searchValue = '',
  onSearchChange,
  searchLabel = 'Search',
  searchPlaceholder = 'Search…',
}: MobileFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const filterActiveCount = filterDefs.reduce(
    (n, def) => (values[def.key] && values[def.key] !== '' ? n + 1 : n),
    0,
  );
  const searchActive = showSearch && searchValue !== '';
  const activeCount = filterActiveCount + (searchActive ? 1 : 0);

  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    document.addEventListener('keydown', handleKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  function clearAll() {
    filterDefs.forEach((def) => {
      if (values[def.key] && values[def.key] !== '') onClear(def.key);
    });
    if (showSearch && searchValue !== '') onSearchChange?.('');
  }

  const openSheet = () => setIsOpen(true);

  const defaultIcon = (
    <svg
      className={cx('flotable-mobile-filters__icon', classNames?.mobileFilterIcon)}
      style={styles?.mobileFilterIcon}
      viewBox="0 0 16 16"
      width="14"
      height="14"
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M1.5 2.5h13a.5.5 0 0 1 .4.8L10 9.7v3.6a.5.5 0 0 1-.7.45l-3-1.5a.5.5 0 0 1-.3-.45V9.7L1.1 3.3a.5.5 0 0 1 .4-.8Z"
      />
    </svg>
  );

  return (
    <>
      {renderTrigger ? (
        renderTrigger({ activeCount, isOpen, onOpen: openSheet, label: triggerLabel })
      ) : (
        <button
          type="button"
          className={cx('flotable-mobile-filters__trigger', classNames?.mobileFilterButton)}
          style={styles?.mobileFilterButton}
          aria-label={triggerAriaLabel}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          onClick={openSheet}
        >
          {icon ?? defaultIcon}
          <span className="flotable-mobile-filters__label">{triggerLabel}</span>
          {activeCount > 0 && (
            <span
              className={cx('flotable-mobile-filters__count', classNames?.mobileFilterCount)}
              style={styles?.mobileFilterCount}
            >
              {activeCount}
            </span>
          )}
        </button>
      )}

      {isOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className={cx('flotable-mobile-filters__backdrop', classNames?.mobileFilterBackdrop)}
            style={styles?.mobileFilterBackdrop}
            role="dialog"
            aria-modal="true"
            aria-label={sheetTitle}
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsOpen(false);
            }}
          >
            <div
              className={cx('flotable-mobile-filters__sheet', classNames?.mobileFilterSheet)}
              style={styles?.mobileFilterSheet}
            >
              <div
                className={cx('flotable-mobile-filters__header', classNames?.mobileFilterHeader)}
                style={styles?.mobileFilterHeader}
              >
                <span className="flotable-mobile-filters__title">{sheetTitle}</span>
                <div className="flotable-mobile-filters__header-actions">
                  {activeCount > 0 && (
                    <button
                      type="button"
                      className={cx(
                        'flotable-mobile-filters__clear-all',
                        classNames?.mobileFilterClearAll,
                      )}
                      style={styles?.mobileFilterClearAll}
                      onClick={clearAll}
                    >
                      {clearAllLabel}
                    </button>
                  )}
                  <button
                    type="button"
                    className={cx(
                      'flotable-mobile-filters__close',
                      classNames?.mobileFilterClose,
                    )}
                    style={styles?.mobileFilterClose}
                    aria-label={closeAriaLabel}
                    onClick={() => setIsOpen(false)}
                  >
                    &times;
                  </button>
                </div>
              </div>

              <div
                className={cx('flotable-mobile-filters__body', classNames?.mobileFilterBody)}
                style={styles?.mobileFilterBody}
              >
                {showSearch && (
                  <label
                    className={cx('flotable-mobile-filters__row', classNames?.mobileFilterRow)}
                    style={styles?.mobileFilterRow}
                  >
                    <span
                      className={cx(
                        'flotable-mobile-filters__row-label',
                        classNames?.mobileFilterRowLabel,
                      )}
                      style={styles?.mobileFilterRowLabel}
                    >
                      {searchLabel}
                    </span>
                    <input
                      className={cx(
                        'flotable-mobile-filters__input',
                        classNames?.mobileFilterInput,
                      )}
                      style={styles?.mobileFilterInput}
                      type="search"
                      value={searchValue}
                      placeholder={searchPlaceholder}
                      onChange={(e) => onSearchChange?.(e.target.value)}
                    />
                  </label>
                )}
                {filterDefs.map((def) => (
                  <MobileFilterRow
                    key={def.key}
                    def={def}
                    value={values[def.key] ?? ''}
                    onValueChange={onValueChange}

                    styles={styles}
                  />
                ))}
              </div>

              <div
                className={cx('flotable-mobile-filters__footer', classNames?.mobileFilterFooter)}
                style={styles?.mobileFilterFooter}
              >
                <button
                  type="button"
                  className={cx('flotable-mobile-filters__done', classNames?.mobileFilterDone)}
                  style={styles?.mobileFilterDone}
                  onClick={() => setIsOpen(false)}
                >
                  {doneLabel}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

interface MobileFilterRowProps {
  def: FilterDef;
  value: string;
  onValueChange: (key: string, value: string) => void;
  classNames?: FloTableClassNames;
  styles?: FloTableStyles;
}

function MobileFilterRow({ def, value, onValueChange, classNames, styles }: MobileFilterRowProps) {
  const inputClass = cx('flotable-mobile-filters__input', classNames?.mobileFilterInput);
  const inputStyle = styles?.mobileFilterInput;
  return (
    <label
      className={cx('flotable-mobile-filters__row', classNames?.mobileFilterRow)}
      style={styles?.mobileFilterRow}
    >
      <span
        className={cx('flotable-mobile-filters__row-label', classNames?.mobileFilterRowLabel)}
        style={styles?.mobileFilterRowLabel}
      >
        {def.label}
      </span>
      {def.type === 'boolean' && (
        <select
          className={inputClass}
          style={inputStyle}
          value={value}
          onChange={(e) => onValueChange(def.key, e.target.value)}
        >
          <option value="">All</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      )}
      {def.type === 'select' && (
        <select
          className={inputClass}
          style={inputStyle}
          value={value}
          onChange={(e) => onValueChange(def.key, e.target.value)}
        >
          <option value="">All</option>
          {(def.options ?? []).map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      )}
      {(def.type === 'text' || def.type === 'number' || def.type === 'date') && (
        <input
          className={inputClass}
          style={inputStyle}
          type={def.type}
          value={value}
          onChange={(e) => onValueChange(def.key, e.target.value)}
        />
      )}
    </label>
  );
}
