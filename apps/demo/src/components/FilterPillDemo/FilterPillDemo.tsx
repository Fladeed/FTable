'use client';

import { useState } from 'react';
import { FilterPill } from 'ftable';
import type { FilterDef } from 'ftable';
import './FilterPillDemo.css';

/* ── Helpers ─────────────────────────────────────────────────── */

function usePill(key: string) {
  const [value, setValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  function open() { setIsOpen(true); setIsClosing(false); }
  function close() {
    setIsClosing(true);
    setTimeout(() => { setIsOpen(false); setIsClosing(false); }, 180);
  }

  function handlePillClick(_key: string) { isOpen ? close() : open(); }
  function handleValueChange(_key: string, v: string) { setValue(v); }
  function handleClear(_key: string) { setValue(''); }
  function handleClose(_key: string) { close(); }

  return { value, isOpen, isClosing, handlePillClick, handleValueChange, handleClear, handleClose };
}

/* ── Icons ─────────────────────────────────────────────────── */

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

/* ── Pill defs ──────────────────────────────────────────────── */

const DEF_TEXT: FilterDef = { key: 'name', label: 'Name', type: 'text' };
const DEF_SELECT: FilterDef = {
  key: 'status',
  label: 'Status',
  type: 'select',
  options: ['Active', 'Inactive', 'Pending'],
};
const DEF_DATE: FilterDef = { key: 'date', label: 'Date', type: 'date' };
const DEF_BOOLEAN: FilterDef = { key: 'active', label: 'Active', type: 'boolean' };

/* ── Demo ───────────────────────────────────────────────────── */

export function FilterPillDemo() {
  const defaultText = usePill('name');
  const defaultSelect = usePill('status');

  const customTriggerDate = usePill('date');
  const customTriggerSelect = usePill('status2');

  const customValueBoolean = usePill('active');
  const customValueSelect = usePill('status3');

  return (
    <div className="filter-pill-demo">
      <h1 className="filter-pill-demo__title">Filter Pill</h1>
      <p className="filter-pill-demo__subtitle">
        <code>FilterPill</code> is the building block behind every filter in the bar.
        Use <code>renderTriggerLabel</code> and <code>renderActiveValue</code> to replace the
        default trigger content and active-state display with anything you like.
      </p>

      {/* ── Default ──────────────────────────────────────────── */}
      <section className="filter-pill-demo__section">
        <h2 className="filter-pill-demo__section-title">Default</h2>
        <p className="filter-pill-demo__section-desc">
          Standard label trigger and plain text active value. No customization props needed.
        </p>
        <div className="filter-pill-demo__preview">
          <FilterPill
            def={DEF_TEXT}
            value={defaultText.value}
            isOpen={defaultText.isOpen}
            isClosing={defaultText.isClosing}
            onPillClick={defaultText.handlePillClick}
            onValueChange={defaultText.handleValueChange}
            onClear={defaultText.handleClear}
            onClose={defaultText.handleClose}
          />
          <FilterPill
            def={DEF_SELECT}
            value={defaultSelect.value}
            isOpen={defaultSelect.isOpen}
            isClosing={defaultSelect.isClosing}
            onPillClick={defaultSelect.handlePillClick}
            onValueChange={defaultSelect.handleValueChange}
            onClear={defaultSelect.handleClear}
            onClose={defaultSelect.handleClose}
          />
        </div>
      </section>

      {/* ── Custom trigger ───────────────────────────────────── */}
      <section className="filter-pill-demo__section">
        <h2 className="filter-pill-demo__section-title">Custom trigger label</h2>
        <p className="filter-pill-demo__section-desc">
          Pass <code>renderTriggerLabel</code> to swap the label inside the trigger button —
          useful for adding icons or fully replacing the text.
        </p>
        <div className="filter-pill-demo__preview">
          <FilterPill
            def={DEF_DATE}
            value={customTriggerDate.value}
            isOpen={customTriggerDate.isOpen}
            isClosing={customTriggerDate.isClosing}
            onPillClick={customTriggerDate.handlePillClick}
            onValueChange={customTriggerDate.handleValueChange}
            onClear={customTriggerDate.handleClear}
            onClose={customTriggerDate.handleClose}
            renderTriggerLabel={
              <span className="pill-trigger-icon">
                <CalendarIcon />
                <span>Date</span>
              </span>
            }
          />
          <FilterPill
            def={{ ...DEF_SELECT, key: 'status2' }}
            value={customTriggerSelect.value}
            isOpen={customTriggerSelect.isOpen}
            isClosing={customTriggerSelect.isClosing}
            onPillClick={customTriggerSelect.handlePillClick}
            onValueChange={customTriggerSelect.handleValueChange}
            onClear={customTriggerSelect.handleClear}
            onClose={customTriggerSelect.handleClose}
            renderTriggerLabel={
              <span className="pill-trigger-icon">
                <TagIcon />
                <span>Tag</span>
              </span>
            }
          />
        </div>
      </section>

      {/* ── Custom active value ──────────────────────────────── */}
      <section className="filter-pill-demo__section">
        <h2 className="filter-pill-demo__section-title">Custom active value</h2>
        <p className="filter-pill-demo__section-desc">
          Pass <code>renderActiveValue</code> to control how the selected value is displayed
          when the pill is closed — e.g. colored status badges.
        </p>
        <div className="filter-pill-demo__preview">
          <FilterPill
            def={DEF_BOOLEAN}
            value={customValueBoolean.value}
            isOpen={customValueBoolean.isOpen}
            isClosing={customValueBoolean.isClosing}
            onPillClick={customValueBoolean.handlePillClick}
            onValueChange={customValueBoolean.handleValueChange}
            onClear={customValueBoolean.handleClear}
            onClose={customValueBoolean.handleClose}
            renderActiveValue={(v: string) => (
              <span className={`pill-value-badge ${v === 'true' ? 'pill-value-badge--active' : 'pill-value-badge--inactive'}`}>
                {v === 'true' ? '✓ Yes' : '✗ No'}
              </span>
            )}
          />
          <FilterPill
            def={{ ...DEF_SELECT, key: 'status3' }}
            value={customValueSelect.value}
            isOpen={customValueSelect.isOpen}
            isClosing={customValueSelect.isClosing}
            onPillClick={customValueSelect.handlePillClick}
            onValueChange={customValueSelect.handleValueChange}
            onClear={customValueSelect.handleClear}
            onClose={customValueSelect.handleClose}
            renderActiveValue={(v: string) => (
              <span className="pill-value-badge">{v}</span>
            )}
          />
        </div>
      </section>
    </div>
  );
}
