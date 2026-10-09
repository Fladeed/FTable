'use client';

import { TableActionsSection } from './TableActionsSection/TableActionsSection';
import './TableActionsDemo.css';

export function TableActionsDemo() {
  return (
    <main className="table-actions-demo demo-page-shell">
      <h1 className="table-actions-demo__title">Table Actions</h1>
      <p className="table-actions-demo__subtitle">
        Pass <code>tableActions</code> to render selection-independent buttons at the end of the toolbar.
        Use <code>variant: &apos;primary&apos;</code> for the page&apos;s main action. The actions stay enabled
        while rows are selected, and they move to the left side under <code>direction=&quot;rtl&quot;</code>.
      </p>
      <TableActionsSection
        title="LTR — with filter pills and bulk actions"
        description={
          <>
            Search, a filter pill, and row selection with a bulk action. Select some rows: the bulk bar
            appears, and <em>Add row</em> and <em>Export</em> stay enabled.
          </>
        }
        direction="ltr"
        withFilters
      />
      <TableActionsSection
        title="LTR — actions only"
        description={
          <>
            No search, no pills, and no bulk actions. The toolbar still renders because{' '}
            <code>tableActions</code> is set.
          </>
        }
        direction="ltr"
        withFilters={false}
      />
      <TableActionsSection
        title="RTL — مع عوامل التصفية"
        description={
          <>
            <code>direction=&quot;rtl&quot;</code> with filter pills and bulk actions. The actions sit at the
            end side, which is the left in RTL.
          </>
        }
        direction="rtl"
        withFilters
      />
      <TableActionsSection
        title="RTL — الإجراءات فقط"
        description={<>RTL with only <code>tableActions</code> in the toolbar.</>}
        direction="rtl"
        withFilters={false}
      />
    </main>
  );
}
