'use client';

import { useState } from 'react';
import type { BulkActionBarContext } from 'flotable';
import { FloTable } from 'flotable';
import { useTableState, COLUMNS, FILTER_DEFS, PAGE_SIZE } from '../BulkActionsDemoData';
import type { Employee } from '../BulkActionsDemoData';

export function CustomBarSection() {
  const { page, setPage, sortState, setSortState, filterState, setFilterState, sortedData, pageData } = useTableState();
  const [lastAction, setLastAction] = useState<string | null>(null);

  function renderBar({ selectedRows, count, clearSelection }: BulkActionBarContext<Employee>) {
    const hasInactive = selectedRows.some((r) => !r.active);
    return (
      <div className="demo-custom-bar">
        <div className="demo-custom-bar__left">
          <span className="demo-custom-bar__badge">{count}</span>
          <span className="demo-custom-bar__label">
            {count === 1 ? 'employee' : 'employees'} selected
          </span>
        </div>
        <div className="demo-custom-bar__actions">
          <button
            type="button"
            className="demo-custom-bar__btn demo-custom-bar__btn--primary"
            onClick={() => {
              console.log('Export CSV', selectedRows);
              setLastAction(`Exported ${count} row${count !== 1 ? 's' : ''} as CSV`);
            }}
          >
            Export CSV
          </button>
          <button
            type="button"
            className="demo-custom-bar__btn demo-custom-bar__btn--secondary"
            disabled={!hasInactive}
            title={!hasInactive ? 'All selected employees are already active' : undefined}
            onClick={() => {
              setLastAction(`Activated ${selectedRows.filter((r) => !r.active).length} inactive employee${selectedRows.filter((r) => !r.active).length !== 1 ? 's' : ''}`);
            }}
          >
            Activate inactive
          </button>
          <button
            type="button"
            className="demo-custom-bar__btn demo-custom-bar__btn--danger"
            onClick={() => {
              setLastAction(`Deleted ${count} row${count !== 1 ? 's' : ''}`);
              clearSelection();
            }}
          >
            Delete
          </button>
        </div>
        <button type="button" className="demo-custom-bar__dismiss" onClick={clearSelection}>
          ✕
        </button>
      </div>
    );
  }

  return (
    <section className="bulk-demo-section">
      <h2 className="bulk-demo-section__title">Fully custom bar via <code>renderBulkActionBar</code></h2>
      <p className="bulk-demo-section__desc">
        Replace the entire bar with your own markup. Receives <code>selectedRows</code>, <code>selectedKeys</code>,{' '}
        <code>count</code>, and <code>clearSelection</code> — build whatever UI you need.
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
        renderBulkActionBar={renderBar}
      />
    </section>
  );
}
