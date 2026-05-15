'use client';

import { useMemo, useState } from 'react';
import type { RowAction } from 'flotable';
import { ActionsTable } from '../ActionsTable/ActionsTable';
import type { Employee } from '../RowActionsDemoData';
import { IconEdit, IconView, IconDuplicate, IconArchive, IconDelete } from '../RowActionsDemoData';

const ACTIONS: RowAction<Employee>[] = [
  { key: 'edit', label: 'Edit', icon: IconEdit, onClick: () => {} },
  { key: 'view', label: 'View', icon: IconView, onClick: () => {} },
  { key: 'duplicate', label: 'Duplicate', icon: IconDuplicate, onClick: () => {} },
  { key: 'archive', label: 'Archive', icon: IconArchive, onClick: () => {} },
  { key: 'delete', label: 'Delete', icon: IconDelete, onClick: () => {}, danger: true },
];

export function RowActionsOverflowClickProofSection() {
  const [counters, setCounters] = useState<Record<string, number>>(() =>
    Object.fromEntries(ACTIONS.map((a) => [a.key, 0])),
  );

  const labelToKey = useMemo(
    () => Object.fromEntries(ACTIONS.map((a) => [a.label, a.key])),
    [],
  );

  function handleAction(msg: string) {
    const label = msg.split(':')[0].trim();
    const key = labelToKey[label];
    if (!key) return;
    setCounters((prev) => ({ ...prev, [key]: (prev[key] ?? 0) + 1 }));
  }

  function reset() {
    setCounters(Object.fromEntries(ACTIONS.map((a) => [a.key, 0])));
  }

  return (
    <section className="row-actions-demo__section">
      <h2 className="row-actions-demo__section-title">Overflow click regression proof (ET-110)</h2>
      <p className="row-actions-demo__section-desc">
        Each of the 5 actions collapses into the overflow <code>&#8943;</code> menu past the first two.
        Click any item — including those inside the portal-rendered dropdown — and its counter below
        should increment by exactly 1. Before the ET-110 fix, only the first two inline actions advanced
        their counters; dropdown items closed silently.
      </p>
      <ActionsTable rowActions={ACTIONS} onAction={handleAction} />
      <div
        style={{
          marginTop: '1rem',
          padding: '0.75rem 1rem',
          border: '1px solid var(--color-border, #e5e7eb)',
          borderRadius: 6,
          background: 'var(--color-surface-1, #fafafa)',
          fontSize: '0.875rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <strong>Click tally</strong>
          <button
            type="button"
            onClick={reset}
            style={{
              padding: '4px 10px',
              fontSize: '0.8rem',
              border: '1px solid var(--color-border, #d1d5db)',
              background: 'transparent',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            Reset
          </button>
        </div>
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: '0.25rem' }}>
          {ACTIONS.map((a) => {
            const count = counters[a.key] ?? 0;
            const fired = count > 0;
            return (
              <li
                key={a.key}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0.25rem 0.5rem',
                  borderRadius: 4,
                  background: fired ? '#f0fdf4' : 'transparent',
                  color: fired ? '#166534' : 'var(--color-text-secondary, #6b7280)',
                }}
              >
                <span>{a.label}</span>
                <span style={{ fontVariantNumeric: 'tabular-nums' }}>{count}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
