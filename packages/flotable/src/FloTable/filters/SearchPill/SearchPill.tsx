import type { FilterDef, FloTableClassNames, FloTableStyles } from '../../FloTable.types';
import { FilterPill } from '../FilterPill/FilterPill';
import './SearchPill.css';

const SEARCH_DEF: FilterDef = { key: '__search__', label: '', type: 'text' };

function SearchIcon() {
  return (
    <svg className="flotable-filter-search__icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.5" />
      <line x1="10" y1="10" x2="14" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

interface SearchPillProps {
  value: string;
  isOpen: boolean;
  isClosing: boolean;
  onPillClick: () => void;
  onValueChange: (value: string) => void;
  onClear: () => void;
  onClose: () => void;
  classNames?: FloTableClassNames;
  styles?: FloTableStyles;
}

export function SearchPill({
  value,
  isOpen,
  isClosing,
  onPillClick,
  onValueChange,
  onClear,
  onClose,
  classNames,
  styles,
}: SearchPillProps) {
  return (
    <FilterPill
      def={SEARCH_DEF}
      value={value}
      isOpen={isOpen}
      isClosing={isClosing}
      onPillClick={() => onPillClick()}
      onValueChange={(_, v) => onValueChange(v)}
      onClear={() => onClear()}
      onClose={() => onClose()}
      classNames={classNames}
      styles={styles}
      renderTriggerLabel={<SearchIcon />}
      renderActiveValue={(v) => <span className="flotable-filter-pill__active-value">{v}</span>}
      hideSeparator
      placeholder="Search…"
      variant="search"
      triggerAriaLabel="Search"
    />
  );
}
