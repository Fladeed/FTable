import './FilterPillClear.css';

interface FilterPillClearProps {
  filterKey: string;
  label?: string;
  onClear: (key: string) => void;
}

export function FilterPillClear({ filterKey, label, onClear }: FilterPillClearProps) {
  return (
    <button
      type="button"
      className="flotable-filter-pill__clear"
      onClick={(e) => { e.stopPropagation(); onClear(filterKey); }}
      aria-label={`Clear ${label || 'filter'}`}
    >
      ×
    </button>
  );
}
