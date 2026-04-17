'use client';

import type { RowAction } from 'flotable';
import { ActionsTable } from '../ActionsTable/ActionsTable';
import type { Employee } from '../RowActionsDemoData';
import { IconEdit, IconView, IconDuplicate, IconArchive, IconDelete } from '../RowActionsDemoData';

interface RowActionsOverflowSectionProps {
  onAction: (msg: string) => void;
}

const ACTIONS: RowAction<Employee>[] = [
  { key: 'edit', label: 'Edit', icon: IconEdit, onClick: () => {} },
  { key: 'view', label: 'View', icon: IconView, onClick: () => {} },
  { key: 'duplicate', label: 'Duplicate', icon: IconDuplicate, onClick: () => {} },
  { key: 'archive', label: 'Archive', icon: IconArchive, onClick: () => {}, disabled: (row) => !row.active },
  { key: 'delete', label: 'Delete', icon: IconDelete, onClick: () => {}, danger: true },
];

export function RowActionsOverflowSection({ onAction }: RowActionsOverflowSectionProps) {
  return (
    <section className="row-actions-demo__section">
      <h2 className="row-actions-demo__section-title">Overflow menu (5 actions)</h2>
      <p className="row-actions-demo__section-desc">
        With 5 actions the cell renders a <code>&#8943;</code> button. Navigate with arrow keys or press Escape to close.
        The <em>Archive</em> action is disabled for inactive employees.
        The <em>Delete</em> action is styled as destructive.
      </p>
      <ActionsTable rowActions={ACTIONS} onAction={onAction} />
    </section>
  );
}
