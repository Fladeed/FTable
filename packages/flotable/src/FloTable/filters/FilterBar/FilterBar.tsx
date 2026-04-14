'use client';

import { useState, useEffect, useRef } from 'react';
import type { FilterDef, QuickFilterState, FloTableClassNames, FloTableStyles } from '../../FloTable.types';
import { cx } from '../../../utils/cx';
import { FilterPill } from '../FilterPill/FilterPill';
import { SearchPill } from '../SearchPill/SearchPill';
import './FilterBar.css';

const SEARCH_KEY = '__search__';

interface FilterBarProps {
  filterDefs: FilterDef[];
  activeFilters: QuickFilterState;
  onFilterChange: (filters: QuickFilterState) => void;
  showSearch?: boolean;
  classNames?: FloTableClassNames;
  styles?: FloTableStyles;
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

  return (
    <div className={cx('flotable-filter-bar', classNames?.filterBar)} ref={barRef} style={styles?.filterBar}>
      {showSearch && (
        <SearchPill
          value={activeFilters[SEARCH_KEY] ?? ''}
          isOpen={openKey === SEARCH_KEY}
          isClosing={closingKey === SEARCH_KEY}
          onPillClick={() => handlePillClick(SEARCH_KEY)}
          onValueChange={(value) => handleValueChange(SEARCH_KEY, value)}
          onClear={() => handleClear(SEARCH_KEY)}
          onClose={() => closeKey(SEARCH_KEY)}
          classNames={classNames}
          styles={styles}
        />
      )}
      {filterDefs.map((def) => (
        <FilterPill
          key={def.key}
          def={def}
          value={activeFilters[def.key] ?? ''}
          isOpen={openKey === def.key}
          isClosing={closingKey === def.key}
          onPillClick={handlePillClick}
          onValueChange={handleValueChange}
          onClear={handleClear}
          onClose={closeKey}
          classNames={classNames}
          styles={styles}
        />
      ))}
    </div>
  );
}
