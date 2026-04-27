'use client';

import type { RowAction } from 'flotable';
import { ActionsTable } from '../ActionsTable/ActionsTable';
import type { Employee } from '../RowActionsDemoData';
import { IconEdit, IconView, IconDelete, IconRestore } from '../RowActionsDemoData';

interface RowActionsDisabledSectionProps {
  onAction: (msg: string) => void;
}

const ACTIONS: RowAction<Employee>[] = [
  { key: 'view', label: 'View', icon: IconView, onClick: () => {} },
  { key: 'edit', label: 'Edit', icon: IconEdit, onClick: () => {} },
  { key: 'delete', label: 'Delete', icon: IconDelete, onClick: () => {}, danger: true, visible: (row) => row.active },
  { key: 'restore', label: 'Restore', icon: IconRestore, onClick: () => {}, visible: (row) => !row.active },
];

export function RowActionsDisabledSection({ onAction }: RowActionsDisabledSectionProps) {
  return (
    <section className="row-actions-demo__section">
      <h2 className="row-actions-demo__section-title">Disabled actions excluded from threshold (4 actions, 3 ever visible)</h2>
      <p className="row-actions-demo__section-desc">
        There are 4 actions, but <em>Delete</em> and <em>Restore</em> are mutually exclusive — only one is
        enabled per row based on the employee&apos;s <code>active</code> status. The threshold counts only
        non-disabled actions, so every row stays inline instead of collapsing into an overflow menu.
      </p>
      <ActionsTable rowActions={ACTIONS} onAction={onAction} />
    </section>
  );
}
