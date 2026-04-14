'use client';

import { FilterPill } from 'flotable';
import type { FilterDef } from 'flotable';
import { usePill } from '../usePill';
import './FilterPillDefaultSection.css';

const DEF_TEXT: FilterDef = { key: 'name', label: 'Name', type: 'text' };
const DEF_SELECT: FilterDef = {
  key: 'status',
  label: 'Status',
  type: 'select',
  options: ['Active', 'Inactive', 'Pending'],
};

export function FilterPillDefaultSection() {
  const text = usePill();
  const select = usePill();

  return (
    <section className="filter-pill-demo__section">
      <h2 className="filter-pill-demo__section-title">Default</h2>
      <p className="filter-pill-demo__section-desc">
        Standard label trigger and plain text active value. No customization props needed.
      </p>
      <div className="filter-pill-demo__preview">
        <FilterPill
          def={DEF_TEXT}
          value={text.value}
          isOpen={text.isOpen}
          isClosing={text.isClosing}
          onPillClick={text.handlePillClick}
          onValueChange={text.handleValueChange}
          onClear={text.handleClear}
          onClose={text.handleClose}
        />
        <FilterPill
          def={DEF_SELECT}
          value={select.value}
          isOpen={select.isOpen}
          isClosing={select.isClosing}
          onPillClick={select.handlePillClick}
          onValueChange={select.handleValueChange}
          onClear={select.handleClear}
          onClose={select.handleClose}
        />
      </div>
    </section>
  );
}
