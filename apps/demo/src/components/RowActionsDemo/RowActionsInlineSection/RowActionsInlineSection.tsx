'use client';

import type { RowAction } from 'flotable';
import { ActionsTable } from '../ActionsTable/ActionsTable';
import type { Employee } from '../RowActionsDemoData';

interface RowActionsInlineSectionProps {
  onAction: (msg: string) => void;
}

const ACTIONS: RowAction<Employee>[] = [
  { key: 'edit', label: 'Edit', onClick: () => {} },
  { key: 'delete', label: 'Delete', onClick: () => {}, danger: true },
];

export function RowActionsInlineSection({ onAction }: RowActionsInlineSectionProps) {
  return (
    <section className="row-actions-demo__section">
      <h2 className="row-actions-demo__section-title">Inline buttons — label only (2 actions)</h2>
      <p className="row-actions-demo__section-desc">
        With 2 actions the buttons render inline. The <em>Delete</em> action uses <code>danger: true</code>.
      </p>
      <ActionsTable rowActions={ACTIONS} onAction={onAction} />
    </section>
  );
}
