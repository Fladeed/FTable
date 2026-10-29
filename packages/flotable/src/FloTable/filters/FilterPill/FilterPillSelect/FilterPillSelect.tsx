import { useEffect, useId, useRef, useState } from 'react';
import type { KeyboardEvent, Ref } from 'react';
import type { FilterDef, FloTableClassNames, FloTableLabels, FloTableStyles } from '../../../FloTable.types';
import { cx } from '../../../../utils/cx';
import { toFilterOption } from '../../../tableUtils';
import './FilterPillSelect.css';

interface FilterPillSelectProps {
  def: FilterDef;
  value: string;
  isOpen: boolean;
  onSelect: (value: string) => void;
  controlRef?: Ref<HTMLDivElement>;
  classNames?: FloTableClassNames;
  styles?: FloTableStyles;
  labels?: FloTableLabels;
}

const TYPE_AHEAD_RESET_MS = 500;

function ChevronIcon() {
  return (
    <svg className="flotable-filter-pill__select-chevron" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="flotable-filter-pill__option-check" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function FilterPillSelect({
  def,
  value,
  isOpen,
  onSelect,
  controlRef,
  classNames,
  styles,
  labels,
}: FilterPillSelectProps) {
  const baseId = useId();
  const listboxId = `${baseId}-listbox`;
  const options = [{ value: '', label: labels?.filterAll ?? 'All' }, ...(def.options ?? []).map(toFilterOption)];
  const currentIndex = Math.max(0, options.findIndex((opt) => opt.value === value));
  const frozenIndexRef = useRef(currentIndex);
  if (isOpen) frozenIndexRef.current = currentIndex;
  const selectedIndex = frozenIndexRef.current;
  const [activeIndex, setActiveIndex] = useState(selectedIndex);
  const listRef = useRef<HTMLUListElement>(null);
  const typeAheadRef = useRef({ buffer: '', timer: null as ReturnType<typeof setTimeout> | null });

  useEffect(() => {
    if (isOpen) setActiveIndex(selectedIndex);
  }, [isOpen]);

  useEffect(() => {
    const item = listRef.current?.children[activeIndex] as HTMLElement | undefined;
    item?.scrollIntoView?.({ block: 'nearest' });
  }, [activeIndex]);

  useEffect(() => () => {
    if (typeAheadRef.current.timer !== null) clearTimeout(typeAheadRef.current.timer);
  }, []);

  const optionId = (index: number) => `${baseId}-option-${index}`;

  function typeAhead(char: string) {
    const state = typeAheadRef.current;
    if (state.timer !== null) clearTimeout(state.timer);
    state.buffer += char.toLowerCase();
    state.timer = setTimeout(() => {
      state.buffer = '';
      state.timer = null;
    }, TYPE_AHEAD_RESET_MS);
    const match = options.findIndex((opt) => opt.label.toLowerCase().startsWith(state.buffer));
    if (match !== -1) setActiveIndex(match);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const last = options.length - 1;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((i) => Math.min(last, i + 1));
        return;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((i) => Math.max(0, i - 1));
        return;
      case 'Home':
        e.preventDefault();
        setActiveIndex(0);
        return;
      case 'End':
        e.preventDefault();
        setActiveIndex(last);
        return;
      case 'Enter':
      case ' ':
        e.preventDefault();
        onSelect(options[activeIndex].value);
        return;
    }
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) typeAhead(e.key);
  }

  return (
    <>
      <div
        ref={controlRef}
        role="combobox"
        tabIndex={0}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-activedescendant={isOpen ? optionId(activeIndex) : undefined}
        aria-label={def.label}
        className={cx('flotable-filter-pill__select', classNames?.filterPillInput)}
        style={styles?.filterPillInput}
        onKeyDown={handleKeyDown}
      >
        <span className="flotable-filter-pill__select-value">{options[selectedIndex].label}</span>
        <ChevronIcon />
      </div>
      <ul
        ref={listRef}
        id={listboxId}
        role="listbox"
        aria-label={def.label}
        className={cx('flotable-filter-pill__listbox', isOpen && 'flotable-filter-pill__listbox--open')}
      >
        {options.map((opt, index) => (
          <li
            key={opt.value}
            id={optionId(index)}
            role="option"
            aria-selected={index === selectedIndex}
            className={cx(
              'flotable-filter-pill__option',
              index === activeIndex && 'flotable-filter-pill__option--active',
              index === selectedIndex && 'flotable-filter-pill__option--selected',
            )}
            onMouseDown={(e) => e.preventDefault()}
            onMouseEnter={() => setActiveIndex(index)}
            onClick={() => onSelect(opt.value)}
          >
            <span className="flotable-filter-pill__option-label">{opt.label}</span>
            {index === selectedIndex && <CheckIcon />}
          </li>
        ))}
      </ul>
    </>
  );
}
