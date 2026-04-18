'use client';

import { useState } from 'react';
import { RowActionsInlineSection } from './RowActionsInlineSection/RowActionsInlineSection';
import { RowActionsIconSection } from './RowActionsIconSection/RowActionsIconSection';
import { RowActionsOverflowSection } from './RowActionsOverflowSection/RowActionsOverflowSection';
import './RowActionsDemo.css';

export function RowActionsDemo() {
  const [lastAction, setLastAction] = useState<string | null>(null);

  return (
    <main className="row-actions-demo demo-page-shell">
      <h1 className="row-actions-demo__title">Row Actions</h1>
      <p className="row-actions-demo__subtitle">
        Supply a <code>rowActions</code> array to add a trailing <strong>Actions</strong> column.
        Up to 3 actions render as inline buttons; more than 3 collapse into an overflow menu (<code>&#8943;</code>).
        Each action can optionally include an <code>icon</code> node.
      </p>

      {lastAction && (
        <div className="row-actions-demo__feedback" role="status">
          Action triggered: <strong>{lastAction}</strong>
        </div>
      )}

      <RowActionsInlineSection onAction={setLastAction} />
      <RowActionsIconSection onAction={setLastAction} />
      <RowActionsOverflowSection onAction={setLastAction} />
    </main>
  );
}
