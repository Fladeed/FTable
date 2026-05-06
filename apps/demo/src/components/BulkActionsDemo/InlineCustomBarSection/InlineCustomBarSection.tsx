'use client';

import { useState } from 'react';
import type { BulkActionBarContext } from 'flotable';
import { FloTable } from 'flotable';
import { useTableState, COLUMNS, FILTER_DEFS, PAGE_SIZE } from '../BulkActionsDemoData';
import type { Employee } from '../BulkActionsDemoData';

const IconDownload = (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M8 3v7M5 7l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 13h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const IconCheck = (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M3 8.5l3.5 3.5 6.5-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconTrash = (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M3 5h10M6 5V3h4v2M7 8v4M9 8v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    <rect x="4" y="5" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.4"/>
  </svg>
);

const IconTag = (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M2 2h6l6 6-6 6-6-6V2Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
    <circle cx="5.5" cy="5.5" r="1" fill="currentColor"/>
  </svg>
);

export function InlineCustomBarSection() {
  const { page, setPage, sortState, setSortState, filterState, setFilterState, sortedData, pageData } = useTableState();
  const [lastAction, setLastAction] = useState<string | null>(null);

  function renderInline({ selectedRows, count, clearSelection }: BulkActionBarContext<Employee>) {
    const hasInactive = selectedRows.some((r) => !r.active);
    const none = count === 0;

    return (
      <div className="ibar">
        {/* selection count chip */}
        <div className={`ibar__chip${none ? '' : ' ibar__chip--on'}`}>
          <span className="ibar__chip-dot" />
          <span>{none ? 'None' : count} selected</span>
        </div>

        {/* grouped action buttons */}
        <div className="ibar__group">
          <button
            type="button"
            className="ibar__group-btn"
            disabled={none}
            onClick={() => setLastAction(`Exported ${count} row${count !== 1 ? 's' : ''} as CSV`)}
          >
            {IconDownload}
            Export CSV
          </button>
          <div className="ibar__group-sep" />
          <button
            type="button"
            className="ibar__group-btn"
            disabled={none}
            onClick={() => setLastAction(`Assigned label to ${count} row${count !== 1 ? 's' : ''}`)}
          >
            {IconTag}
            Label
          </button>
          <div className="ibar__group-sep" />
          <button
            type="button"
            className="ibar__group-btn"
            disabled={none || !hasInactive}
            title={!none && !hasInactive ? 'All selected are already active' : undefined}
            onClick={() => {
              const n = selectedRows.filter((r) => !r.active).length;
              setLastAction(`Activated ${n} employee${n !== 1 ? 's' : ''}`);
            }}
          >
            {IconCheck}
            Activate
          </button>
        </div>

        {/* standalone danger button */}
        <button
          type="button"
          className="ibar__danger-btn"
          disabled={none}
          onClick={() => {
            setLastAction(`Deleted ${count} row${count !== 1 ? 's' : ''}`);
            clearSelection();
          }}
        >
          {IconTrash}
          Delete
        </button>
      </div>
    );
  }

  return (
    <section className="bulk-demo-section">
      <h2 className="bulk-demo-section__title">
        Inline custom actions via <code>renderInlineBulkActions</code>
      </h2>
      <p className="bulk-demo-section__desc">
        Renders inside the toolbar alongside filters — always visible, no layout shift.
        Receive <code>count</code>, <code>selectedRows</code>, and <code>clearSelection</code>;
        build any UI you need.
      </p>
      {lastAction && (
        <div className="bulk-demo-feedback" role="status">
          {lastAction}
        </div>
      )}
      <FloTable
        columns={COLUMNS}
        data={pageData}
        totalRows={sortedData.length}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        sortState={sortState}
        onSortChange={setSortState}
        filterDefs={FILTER_DEFS}
        showSearch
        quickFilters={filterState}
        onFilterChange={(f) => { setFilterState(f); setPage(1); }}
        selectable
        rowKey="id"
        renderInlineBulkActions={renderInline}
      />
    </section>
  );
}
