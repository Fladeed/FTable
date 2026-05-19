'use client';

import { useCallback, useMemo, useState } from 'react';
import { FloTable, type FloTableRequestParams, type QuickFilterState, type SortState } from 'flotable';
import { applySorting, applyFilters } from '../../utils/demoUtils';
import { COLUMNS, FILTER_DEFS, LARGE_ORDERS, SAMPLE_ORDERS, type Order } from './ResponsiveDemoData';
import './ResponsiveDemo.css';

const PAGE_SIZE = 8;

function useOrdersTableState() {
  const [page, setPage] = useState(1);
  const [sortState, setSortState] = useState<SortState<Order> | null>(null);
  const [quickFilters, setQuickFilters] = useState<QuickFilterState>({});

  const filtered = useMemo(() => applyFilters(SAMPLE_ORDERS, quickFilters), [quickFilters]);
  const sorted = useMemo(() => applySorting(filtered, sortState), [filtered, sortState]);
  const pageRows = useMemo(
    () => sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [sorted, page],
  );

  return {
    page,
    setPage,
    sortState,
    setSortState,
    quickFilters,
    setQuickFilters,
    totalRows: sorted.length,
    pageRows,
  };
}

function AutoSection() {
  const s = useOrdersTableState();
  return (
    <section className="rd-section">
      <h2 className="rd-section__title">Auto mode — column priority</h2>
      <p className="rd-section__desc">
        <code>mobileVariant=&quot;auto&quot;</code> keeps the table layout but hides columns with{' '}
        <code>priority</code> below <code>mobileColumnPriority</code> (default <code>2</code>) when the
        viewport is at or below <code>mobileBreakpoint</code> (default <code>640</code>px). Resize the
        window to see the low-priority columns disappear.
      </p>
      <FloTable
        columns={COLUMNS}
        data={s.pageRows}
        totalRows={s.totalRows}
        page={s.page}
        onPageChange={s.setPage}
        sortState={s.sortState}
        onSortChange={s.setSortState}
        quickFilters={s.quickFilters}
        onFilterChange={s.setQuickFilters}
        filterDefs={FILTER_DEFS}
        showSearch
        pageSize={PAGE_SIZE}
      />
    </section>
  );
}

function CardSection() {
  const s = useOrdersTableState();
  return (
    <section className="rd-section">
      <h2 className="rd-section__title">Card view</h2>
      <p className="rd-section__desc">
        <code>mobileVariant=&quot;card&quot;</code> switches the data rows to a stacked card layout
        when the viewport drops below the breakpoint. The default card renders each visible column as
        a <code>header: value</code> pair; pass <code>renderCard</code> for full control.
      </p>
      <FloTable
        columns={COLUMNS}
        data={s.pageRows}
        totalRows={s.totalRows}
        page={s.page}
        onPageChange={s.setPage}
        sortState={s.sortState}
        onSortChange={s.setSortState}
        quickFilters={s.quickFilters}
        onFilterChange={s.setQuickFilters}
        filterDefs={FILTER_DEFS}
        showSearch
        pageSize={PAGE_SIZE}
        mobileVariant="card"
      />
    </section>
  );
}

function StickyToolbarSection() {
  const s = useOrdersTableState();
  return (
    <section className="rd-section">
      <h2 className="rd-section__title">Sticky toolbar</h2>
      <p className="rd-section__desc">
        <code>stickyToolbar</code> pins the filter bar to the top of the parent scroll container.
        Scroll inside the bordered area below — the toolbar stays in view as the rows scroll past.
      </p>
      <div className="rd-sticky-scroll">
        <FloTable
          columns={COLUMNS}
          data={s.pageRows}
          totalRows={s.totalRows}
          page={s.page}
          onPageChange={s.setPage}
          sortState={s.sortState}
          onSortChange={s.setSortState}
          quickFilters={s.quickFilters}
          onFilterChange={s.setQuickFilters}
          filterDefs={FILTER_DEFS}
          showSearch
          pageSize={PAGE_SIZE}
          mobileVariant="card"
          stickyToolbar
        />
      </div>
    </section>
  );
}

function InfiniteScrollSection() {
  const request = useCallback(
    async ({ page, pageSize, sortState, quickFilters }: FloTableRequestParams<Order>) => {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const filtered = applyFilters(LARGE_ORDERS, quickFilters);
      const sorted = applySorting(filtered, sortState);
      const start = (page - 1) * pageSize;
      return { data: sorted.slice(start, start + pageSize), totalRows: sorted.length };
    },
    [],
  );

  return (
    <section className="rd-section">
      <h2 className="rd-section__title">Infinite scroll (request mode + mobile)</h2>
      <p className="rd-section__desc">
        In <code>request</code> mode, resizing below <code>mobileBreakpoint</code> automatically
        swaps pagination for sentinel-driven infinite scroll. Rows accumulate as you scroll; sorting
        or filtering resets to page 1. Try resizing this window narrow and scrolling within the
        bordered area — there are 120 sample rows.
      </p>
      <div className="rd-sticky-scroll">
        <FloTable
          columns={COLUMNS}
          request={request}
          filterDefs={FILTER_DEFS}
          showSearch
          pageSize={10}
          mobileVariant="card"
          stickyToolbar
          infiniteScrollLabels={{ loading: 'Loading more orders…', end: 'No more orders.' }}
        />
      </div>
    </section>
  );
}

export function ResponsiveDemo() {
  return (
    <main className="rd-page demo-page-shell">
      <h1 className="rd-title">Responsive Primitives</h1>
      <p className="rd-subtitle">
        Opt-in primitives for phone-width screens: column priority, stacked card view, sticky toolbar,
        filter pill overflow, 44px touch targets, and (in request mode) infinite scroll. All defaults
        are backward-compatible — existing consumers see no change.
      </p>
      <AutoSection />
      <CardSection />
      <StickyToolbarSection />
      <InfiniteScrollSection />
    </main>
  );
}
