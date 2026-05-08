'use client';

import { DefaultSection } from './DefaultSection/DefaultSection';
import { StyledSection } from './StyledSection/StyledSection';
import { CustomBarSection } from './CustomBarSection/CustomBarSection';
import { InlineCustomBarSection } from './InlineCustomBarSection/InlineCustomBarSection';
import { IconOnlySection } from './IconOnlySection/IconOnlySection';
import { WrappingSection } from './WrappingSection/WrappingSection';
import './BulkActionsDemo.css';

export function BulkActionsDemo() {
  return (
    <main className="bulk-actions-demo demo-page-shell">
      <h1 className="bulk-actions-demo__title">Bulk Actions</h1>
      <p className="bulk-actions-demo__subtitle">
        Four levels of customization: default built-in bar, structural styling via{' '}
        <code>classNames</code>/<code>styles</code>, a fully custom bar via <code>renderBulkActionBar</code>,
        and an inline toolbar bar via <code>renderInlineBulkActions</code>.
        Also see icon-only actions and wrapping behavior with many filters and actions.
      </p>
      <DefaultSection />
      <StyledSection />
      <CustomBarSection />
      <InlineCustomBarSection />
      <IconOnlySection />
      <WrappingSection />
    </main>
  );
}
