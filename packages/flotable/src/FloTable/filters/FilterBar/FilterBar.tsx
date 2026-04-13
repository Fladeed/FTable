'use client';

import { useState, useEffect, useRef } from 'react';
import type { FilterDef, QuickFilterState, FloTableClassNames, FloTableStyles } from '../../FloTable.types';
import { cx } from '../../../utils/cx';
import './FilterBar.css';

interface FilterBarProps {
  filterDefs: FilterDef[];
  activeFilters: QuickFilterState;
  onFilterChange: (filters: QuickFilterState) => void;
  showSearch?: boolean;
  classNames?: FloTableClassNames;
  styles?: FloTableStyles;
}

function formatActiveValue(def: FilterDef, value: string): string {
  if (def.type === 'boolean') return value === 'true' ? 'Yes' : 'No';
  return value;
}

export function FilterBar({ filterDefs, activeFilters, onFilterChange, showSearch = false, classNames, styles }: FilterBarProps) {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [closingKey, setClosingKey] = useState<string | null>(null);
  const barRef = useRef<HTMLDivElement>(null);

  function closeKey(key: string) {
    setClosingKey(key);
    setTimeout(() => {
      setOpenKey(null);
      setClosingKey(null);
    }, 180); // matches flotable-pill-collapse duration
  }

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        if (openKey) closeKey(openKey);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape' && openKey) closeKey(openKey);
    }
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [openKey]);

  function handlePillClick(key: string) {
    if (openKey === key) {
      closeKey(key);
    } else {
      if (openKey) setClosingKey(openKey);
      setOpenKey(key);
    }
  }

  function handleValueChange(key: string, value: string) {
    const next = { ...activeFilters };
    if (value === '') {
      delete next[key];
    } else {
      next[key] = value;
    }
    onFilterChange(next);
  }

  function handleClear(key: string) {
    const next = { ...activeFilters };
    delete next[key];
    onFilterChange(next);
  }

  if (!showSearch && filterDefs.length === 0) return null;

  const SEARCH_KEY = '__search__';

  function SearchIcon() {
    return (
      <svg className="flotable-filter-search__icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.5" />
        <line x1="10" y1="10" x2="14" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <div className={cx('flotable-filter-bar', classNames?.filterBar)} ref={barRef} style={styles?.filterBar}>
        {showSearch && (() => {
          const searchValue = activeFilters[SEARCH_KEY] ?? '';
          const isSearchOpen = openKey === SEARCH_KEY;
          const isSearchClosing = closingKey === SEARCH_KEY;
          const isSearchActive = searchValue !== '';
          return (
            <div
              className={cx(
                'flotable-filter-pill flotable-filter-pill--search',
                classNames?.filterPill,
                isSearchActive && 'flotable-filter-pill--active',
                (isSearchOpen || isSearchClosing) && 'flotable-filter-pill--open',
              )}
              style={styles?.filterPill}
            >
              <button
                type="button"
                className={cx('flotable-filter-pill__trigger', classNames?.filterPillTrigger)}
                style={styles?.filterPillTrigger}
                onClick={() => handlePillClick(SEARCH_KEY)}
                aria-expanded={isSearchOpen}
                aria-label="Search"
              >
                <SearchIcon />
                {isSearchActive && !isSearchOpen && !isSearchClosing && (
                  <span className="flotable-filter-pill__active-value">{searchValue}</span>
                )}
              </button>

              {(isSearchOpen || isSearchClosing) && (
                <span className={`flotable-filter-pill__field${isSearchClosing ? ' flotable-filter-pill__field--closing' : ''}`}>
                  <input
                    className={cx('flotable-filter-pill__input', classNames?.filterPillInput)}
                    style={styles?.filterPillInput}
                    type="text"
                    value={searchValue}
                    onChange={(e) => handleValueChange(SEARCH_KEY, e.target.value)}
                    placeholder="Search…"
                    autoFocus={isSearchOpen && !isSearchClosing}
                  />
                  <button
                    type="button"
                    className="flotable-filter-pill__close"
                    onClick={() => closeKey(SEARCH_KEY)}
                    aria-label="Close search"
                  >
                    ×
                  </button>
                </span>
              )}

              {isSearchActive && !isSearchOpen && !isSearchClosing && (
                <button
                  type="button"
                  className="flotable-filter-pill__clear"
                  onClick={(e) => { e.stopPropagation(); handleClear(SEARCH_KEY); }}
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>
          );
        })()}
      {filterDefs.map((def) => {
        const value = activeFilters[def.key] ?? '';
        const isActive = value !== '';
        const isOpen = openKey === def.key;
        const isClosing = closingKey === def.key;

        return (
          <div
            key={def.key}
            className={cx(
              'flotable-filter-pill',
              classNames?.filterPill,
              isActive && 'flotable-filter-pill--active',
              (isOpen || isClosing) && 'flotable-filter-pill--open',
            )}
            style={styles?.filterPill}
          >
            <button
              type="button"
              className={cx('flotable-filter-pill__trigger', classNames?.filterPillTrigger)}
              style={styles?.filterPillTrigger}
              onClick={() => handlePillClick(def.key)}
              aria-expanded={isOpen}
            >
              <span className="flotable-filter-pill__label">{def.label}</span>
              {isActive && !isOpen && !isClosing && (
                <span className="flotable-filter-pill__active-value">: {formatActiveValue(def, value)}</span>
              )}
            </button>

            {(isOpen || isClosing) && (
              <span className={`flotable-filter-pill__field${isClosing ? ' flotable-filter-pill__field--closing' : ''}`}>
                <span className="flotable-filter-pill__separator" aria-hidden="true">:</span>

                {def.type === 'boolean' && (
                  <select
                    className={cx('flotable-filter-pill__input', classNames?.filterPillInput)}
                    style={styles?.filterPillInput}
                    value={value}
                    onChange={(e) => handleValueChange(def.key, e.target.value)}
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
                    onChange={(e) => handleValueChange(def.key, e.target.value)}
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
                    onChange={(e) => handleValueChange(def.key, e.target.value)}
                    placeholder="…"
                    autoFocus={isOpen && !isClosing}
                  />
                )}

                <button
                  type="button"
                  className="flotable-filter-pill__close"
                  onClick={() => closeKey(def.key)}
                  aria-label="Close filter"
                >
                  ×
                </button>
              </span>
            )}

            {isActive && !isOpen && !isClosing && (
              <button
                type="button"
                className="flotable-filter-pill__clear"
                onClick={(e) => { e.stopPropagation(); handleClear(def.key); }}
                aria-label={`Clear ${def.label} filter`}
              >
                ×
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
