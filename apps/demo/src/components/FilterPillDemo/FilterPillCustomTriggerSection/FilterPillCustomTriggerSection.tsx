'use client';

import { FilterPill } from 'ftable';
import type { FilterDef } from 'ftable';
import { usePill } from '../usePill';
import './FilterPillCustomTriggerSection.css';

const DEF_DATE: FilterDef = { key: 'date', label: 'Date', type: 'date' };
const DEF_SELECT: FilterDef = {
  key: 'status2',
  label: 'Status',
  type: 'select',
  options: ['Active', 'Inactive', 'Pending'],
};

function CalendarIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="2" y="3" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <line x1="2" y1="6.5" x2="14" y2="6.5" stroke="currentColor" strokeWidth="1.5" />
      <line x1="5.5" y1="1.5" x2="5.5" y2="4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="10.5" y1="1.5" x2="10.5" y2="4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function TagIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2 2h6l6 6-6 6-6-6V2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="5" cy="5" r="1" fill="currentColor" />
    </svg>
  );
}

export function FilterPillCustomTriggerSection() {
  const date = usePill();
  const select = usePill();

  return (
    <section className="filter-pill-demo__section">
      <h2 className="filter-pill-demo__section-title">Custom trigger label</h2>
      <p className="filter-pill-demo__section-desc">
        Pass <code>renderTriggerLabel</code> to swap the label inside the trigger button —
        useful for adding icons or fully replacing the text.
      </p>
      <div className="filter-pill-demo__preview">
        <FilterPill
          def={DEF_DATE}
          value={date.value}
          isOpen={date.isOpen}
          isClosing={date.isClosing}
          onPillClick={date.handlePillClick}
          onValueChange={date.handleValueChange}
          onClear={date.handleClear}
          onClose={date.handleClose}
          renderTriggerLabel={
            <span className="pill-trigger-icon">
              <CalendarIcon />
              <span>Date</span>
            </span>
          }
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
          renderTriggerLabel={
            <span className="pill-trigger-icon">
              <TagIcon />
              <span>Tag</span>
            </span>
          }
        />
      </div>
    </section>
  );
}
