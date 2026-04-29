'use client';

import { DefaultSection } from './DefaultSection/DefaultSection';
import { StyledSection } from './StyledSection/StyledSection';
import { CustomBarSection } from './CustomBarSection/CustomBarSection';
import './BulkActionsDemo.css';

export function BulkActionsDemo() {
  return (
    <main className="bulk-actions-demo demo-page-shell">
      <h1 className="bulk-actions-demo__title">Bulk Actions</h1>
      <p className="bulk-actions-demo__subtitle">
        Three levels of customization: default built-in bar, structural styling via{' '}
        <code>classNames</code>/<code>styles</code>, and a fully custom bar via{' '}
        <code>renderBulkActionBar</code>.
      </p>
      <DefaultSection />
      <StyledSection />
      <CustomBarSection />
    </main>
  );
}
