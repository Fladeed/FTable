'use client';

import { useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import type { FilterDef, QuickFilterState, FloTableClassNames, FloTableStyles } from '../../FloTable.types';
import { cx } from '../../../utils/cx';
import { FilterPill } from '../FilterPill/FilterPill';
import { SearchPill } from '../SearchPill/SearchPill';
import { MobileFilters } from '../MobileFilters/MobileFilters';
import './FilterBar.css';

const SEARCH_KEY = '__search__';

interface FilterBarProps {
  filterDefs: FilterDef[];
  activeFilters: QuickFilterState;
  onFilterChange: (filters: QuickFilterState) => void;
  showSearch?: boolean;
  filterMode?: 'live' | 'commit';
  isMobile?: boolean;
  mobileFilterIcon?: ReactNode;
  renderMobileFilterTrigger?: (ctx: {
    activeCount: number;
    isOpen: boolean;
    onOpen: () => void;
    label: string;
  }) => ReactNode;
  classNames?: FloTableClassNames;
  styles?: FloTableStyles;
}

export function FilterBar({
  filterDefs,
  activeFilters,
  onFilterChange,
  showSearch = false,
  filterMode,
  isMobile = false,
  mobileFilterIcon,
  renderMobileFilterTrigger,
  classNames,
  styles,
}: FilterBarProps) {
  const resolvedMode = filterMode ?? 'commit';

  const [openKey, setOpenKey] = useState<string | null>(null);
  const [closingKey, setClosingKey] = useState<string | null>(null);
  const [localFilters, setLocalFilters] = useState<QuickFilterState>(() => ({ ...activeFilters }));
  const localFiltersRef = useRef<QuickFilterState>(localFilters);
  const barRef = useRef<HTMLDivElement>(null);
  const liveDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const synced = { ...activeFilters };
    localFiltersRef.current = synced;
    setLocalFilters(synced);
  }, [activeFilters]);

  function closeKey(key: string) {
    if (resolvedMode === 'commit' && key !== SEARCH_KEY) {
      const prevValue = activeFilters[key] ?? '';
      const nextValue = localFiltersRef.current[key] ?? '';
      if (prevValue !== nextValue) {
        onFilterChange({ ...localFiltersRef.current });
      }
    }
    setClosingKey(key);
    setTimeout(() => {
      setOpenKey(null);
      setClosingKey(null);
    }, 400); // matches flotable-pill-collapse duration
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
  }, [openKey, localFilters, resolvedMode]);

  function handlePillClick(key: string) {
    if (openKey === key) {
      closeKey(key);
    } else {
      if (openKey) setClosingKey(openKey);
      setOpenKey(key);
    }
  }

  function handleValueChange(key: string, value: string) {
    const next = { ...localFiltersRef.current };
    if (value === '') {
      delete next[key];
    } else {
      next[key] = value;
    }
    localFiltersRef.current = next;
    setLocalFilters(next);
    if (key === SEARCH_KEY) {
      onFilterChange(next);
    } else if (resolvedMode === 'live') {
      if (liveDebounceRef.current !== null) clearTimeout(liveDebounceRef.current);
      liveDebounceRef.current = setTimeout(() => {
        liveDebounceRef.current = null;
        onFilterChange(next);
      }, 300);
    }
  }

  function handleClear(key: string) {
    const next = { ...localFiltersRef.current };
    delete next[key];
    localFiltersRef.current = next;
    setLocalFilters(next);
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

      {isMobile && filterDefs.length > 0 ? (
        <MobileFilters
          filterDefs={filterDefs}
          values={localFilters}
          onValueChange={handleValueChange}
          onClear={handleClear}
          icon={mobileFilterIcon}
          renderTrigger={renderMobileFilterTrigger}
          classNames={classNames}
          styles={styles}
        />
      ) : (
        filterDefs.map((def) => (
          <FilterPill
            key={def.key}
            def={def}
            value={localFilters[def.key] ?? ''}
            isOpen={openKey === def.key}
            isClosing={closingKey === def.key}
            onPillClick={handlePillClick}
            onValueChange={handleValueChange}
            onClear={handleClear}
            onClose={closeKey}
            classNames={classNames}
            styles={styles}
          />
        ))
      )}
    </div>
  );
}
