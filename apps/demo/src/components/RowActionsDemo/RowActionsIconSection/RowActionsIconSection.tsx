'use client';

import type { RowAction } from 'flotable';
import { ActionsTable } from '../ActionsTable/ActionsTable';
import type { Employee } from '../RowActionsDemoData';
import { IconEdit, IconDuplicate, IconDelete } from '../RowActionsDemoData';

interface RowActionsIconSectionProps {
  onAction: (msg: string) => void;
}

const ACTIONS: RowAction<Employee>[] = [
  { key: 'edit', label: 'Edit', icon: IconEdit, onClick: () => {} },
  { key: 'duplicate', label: 'Duplicate', icon: IconDuplicate, onClick: () => {} },
  { key: 'delete', label: 'Delete', icon: IconDelete, onClick: () => {}, danger: true },
];

export function RowActionsIconSection({ onAction }: RowActionsIconSectionProps) {
  return (
    <section className="row-actions-demo__section">
      <h2 className="row-actions-demo__section-title">Inline buttons — with icons (3 actions)</h2>
      <p className="row-actions-demo__section-desc">
        Pass any React node as <code>icon</code>. When an icon is provided the button shows the icon
        instead of the label text (the label is still used for <code>aria-label</code> and <code>title</code>).
      </p>
      <ActionsTable rowActions={ACTIONS} onAction={onAction} />
    </section>
  );
}
