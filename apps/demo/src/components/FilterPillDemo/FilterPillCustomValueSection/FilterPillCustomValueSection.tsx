'use client';

import { FilterPill } from 'ftable';
import type { FilterDef } from 'ftable';
import { usePill } from '../usePill';
import './FilterPillCustomValueSection.css';

const DEF_BOOLEAN: FilterDef = { key: 'active', label: 'Active', type: 'boolean' };
const DEF_SELECT: FilterDef = {
  key: 'status3',
  label: 'Priority',
  type: 'select',
  options: ['Low', 'Medium', 'High', 'Critical'],
};

export function FilterPillCustomValueSection() {
  const bool = usePill();
  const select = usePill();

  return (
    <section className="filter-pill-demo__section">
      <h2 className="filter-pill-demo__section-title">Custom active value</h2>
      <p className="filter-pill-demo__section-desc">
        Pass <code>renderActiveValue</code> to control how the selected value is displayed
        inside the trigger — great for badges, icons, or color-coded chips.
      </p>
      <div className="filter-pill-demo__preview">
        <FilterPill
          def={DEF_BOOLEAN}
          value={bool.value}
          isOpen={bool.isOpen}
          isClosing={bool.isClosing}
          onPillClick={bool.handlePillClick}
          onValueChange={bool.handleValueChange}
          onClear={bool.handleClear}
          onClose={bool.handleClose}
          renderActiveValue={(v: string) => (
            <span
              className={`pill-value-badge ${
                v === 'true' ? 'pill-value-badge--active' : 'pill-value-badge--inactive'
              }`}
            >
              {v === 'true' ? '✓ Yes' : '✗ No'}
            </span>
          )}
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
          renderActiveValue={(v: string) => (
            <span className="pill-value-badge">{v}</span>
          )}
        />
      </div>
    </section>
  );
}
