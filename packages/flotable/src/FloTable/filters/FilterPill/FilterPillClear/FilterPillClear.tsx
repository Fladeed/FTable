import './FilterPillClear.css';

interface FilterPillClearProps {
  filterKey: string;
  label?: string;
  onClear: (key: string) => void;
  /** Builds the button's accessible label from the filter label. Defaults to `Clear <label>`. */
  ariaLabel?: (label: string) => string;
}

const defaultClearLabel = (label: string) => `Clear ${label || 'filter'}`;

export function FilterPillClear({
  filterKey,
  label,
  onClear,
  ariaLabel = defaultClearLabel,
}: FilterPillClearProps) {
  return (
    <button
      type="button"
      className="flotable-filter-pill__clear"
      onClick={(e) => { e.stopPropagation(); onClear(filterKey); }}
      aria-label={ariaLabel(label ?? '')}
    >
      ×
    </button>
  );
}
