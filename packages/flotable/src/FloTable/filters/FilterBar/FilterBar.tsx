'use client';

import { useState, useEffect, useRef } from 'react';
import type { FilterDef, QuickFilterState, FloTableClassNames, FloTableLabels, FloTableStyles } from '../../FloTable.types';
import { cx } from '../../../utils/cx';
import { FilterPill } from '../FilterPill/FilterPill';
import './FilterBar.css';

interface FilterBarProps {
  filterDefs: FilterDef[];
  activeFilters: QuickFilterState;
  onFilterChange: (filters: QuickFilterState) => void;
  filterMode?: 'live' | 'commit';
  classNames?: FloTableClassNames;
  styles?: FloTableStyles;
  labels?: FloTableLabels;
}

export function FilterBar({ filterDefs, activeFilters, onFilterChange, filterMode, classNames, styles, labels }: FilterBarProps) {
  const resolvedMode = filterMode ?? 'commit';

  const [openKey, setOpenKey] = useState<string | null>(null);
  const [localFilters, setLocalFilters] = useState<QuickFilterState>(() => ({ ...activeFilters }));
  const localFiltersRef = useRef<QuickFilterState>(localFilters);
  const barRef = useRef<HTMLDivElement>(null);
  const liveDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const synced = { ...activeFilters };
    localFiltersRef.current = synced;
    setLocalFilters(synced);
  }, [activeFilters]);

  function commitIfChanged(key: string) {
    if (resolvedMode !== 'commit') return;
    const prevValue = activeFilters[key] ?? '';
    const nextValue = localFiltersRef.current[key] ?? '';
    if (prevValue !== nextValue) {
      onFilterChange({ ...localFiltersRef.current });
    }
  }

  function closeKey(key: string) {
    commitIfChanged(key);
    setOpenKey(null);
  }

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (!openKey) return;
      const openPill = barRef.current?.querySelector('.flotable-filter-pill--open');
      if (!openPill || !openPill.contains(e.target as Node)) closeKey(openKey);
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
      if (openKey) commitIfChanged(openKey);
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
    if (resolvedMode === 'live') {
      if (liveDebounceRef.current !== null) clearTimeout(liveDebounceRef.current);
      liveDebounceRef.current = setTimeout(() => {
        liveDebounceRef.current = null;
        onFilterChange(next);
      }, 300);
    }
  }

  function applyNow(key: string, value: string) {
    const next = { ...localFiltersRef.current };
    if (value === '') {
      delete next[key];
    } else {
      next[key] = value;
    }
    localFiltersRef.current = next;
    setLocalFilters(next);
    onFilterChange(next);
  }

  function handleClear(key: string) {
    if (liveDebounceRef.current !== null) {
      clearTimeout(liveDebounceRef.current);
      liveDebounceRef.current = null;
    }
    const next = { ...localFiltersRef.current };
    delete next[key];
    localFiltersRef.current = next;
    setLocalFilters(next);
    if ((activeFilters[key] ?? '') !== '') onFilterChange(next);
    if (openKey === key) setOpenKey(null);
  }

  if (filterDefs.length === 0) return null;

  return (
    <div className={cx('flotable-filter-bar', classNames?.filterBar)} ref={barRef} style={styles?.filterBar}>
      {filterDefs.map((def) => (
        <FilterPill
          key={def.key}
          def={def}
          value={localFilters[def.key] ?? ''}
          isOpen={openKey === def.key}
          onPillClick={handlePillClick}
          onValueChange={def.type === 'boolean' ? applyNow : handleValueChange}
          onClear={handleClear}
          onClose={closeKey}
          classNames={classNames}
          styles={styles}
          labels={labels}
        />
      ))}
    </div>
  );
}
