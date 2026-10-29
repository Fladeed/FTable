'use client';

import { useEffect, useRef, useState } from 'react';
import type { FloTableClassNames, FloTableLabels, FloTableStyles } from '../../FloTable.types';
import { cx } from '../../../utils/cx';
import './SearchInput.css';

function SearchIcon() {
  return (
    <svg className="flotable-search__icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.5" />
      <line x1="10" y1="10" x2="14" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

const defaultClearLabel = (label: string) => `Clear ${label}`;

export interface SearchInputProps {
  /** Applied search value. */
  value: string;
  /** Called with the new value after `debounceMs` of inactivity, or immediately on Enter / clear. */
  onChange: (value: string) => void;
  /** Delay before `onChange` fires while typing. Defaults to `300`. */
  debounceMs?: number;
  classNames?: FloTableClassNames;
  styles?: FloTableStyles;
  /** Built-in text: `searchPlaceholder` (`'Search…'`), `search` (aria-label, `'Search'`) and `clearFilter` (clear button). */
  labels?: FloTableLabels;
}

export function SearchInput({ value, onChange, debounceMs = 300, classNames, styles, labels }: SearchInputProps) {
  const [draft, setDraft] = useState(value);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchLabel = labels?.search ?? 'Search';
  const clearLabel = (labels?.clearFilter ?? defaultClearLabel)(searchLabel);

  useEffect(() => {
    if (timerRef.current === null) setDraft(value);
  }, [value]);

  useEffect(() => () => cancelPending(), []);

  function cancelPending() {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  function commit(next: string) {
    cancelPending();
    onChange(next);
  }

  function handleChange(next: string) {
    setDraft(next);
    if (next === '') {
      commit('');
      return;
    }
    cancelPending();
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      onChange(next);
    }, debounceMs);
  }

  function handleClear() {
    setDraft('');
    commit('');
    inputRef.current?.focus();
  }

  return (
    <div className={cx('flotable-search', classNames?.search)} style={styles?.search}>
      <SearchIcon />
      <input
        ref={inputRef}
        type="search"
        className={cx('flotable-search__input', classNames?.searchInput)}
        style={styles?.searchInput}
        value={draft}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') commit(draft); }}
        placeholder={labels?.searchPlaceholder ?? 'Search…'}
        aria-label={searchLabel}
      />
      {draft !== '' && (
        <button type="button" className="flotable-search__clear" onClick={handleClear} aria-label={clearLabel}>
          ×
        </button>
      )}
    </div>
  );
}
