'use client';

import type { FloTableStyleValue } from 'flotable';
import type { BulkAction } from 'flotable';
import { FloTable } from 'flotable';
import { useTableState, COLUMNS, FILTER_DEFS, PAGE_SIZE } from '../BulkActionsDemoData';
import type { Employee } from '../BulkActionsDemoData';

const BULK_ACTIONS: BulkAction<Employee>[] = [
  {
    key: 'archive',
    label: 'Archive',
    onClick: (rows) => alert(`Archive ${rows.length} row${rows.length !== 1 ? 's' : ''}`),
    className: 'demo-archive-btn',
  },
  {
    key: 'delete',
    label: 'Delete',
    danger: true,
    onClick: (rows) => alert(`Delete ${rows.length} row${rows.length !== 1 ? 's' : ''}`),
    style: { fontWeight: 700, letterSpacing: '0.03em' },
  },
];

export function StyledSection() {
  const { page, setPage, sortState, setSortState, filterState, setFilterState, sortedData, pageData } = useTableState();
  return (
    <section className="bulk-demo-section">
      <h2 className="bulk-demo-section__title">Styled via <code>classNames</code> / <code>styles</code></h2>
      <p className="bulk-demo-section__desc">
        Target every part of the bar through the <code>classNames</code> and <code>styles</code> props.
        Individual actions also accept <code>className</code> and <code>style</code>.
      </p>
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
        bulkActions={BULK_ACTIONS}
        classNames={{
          bulkActionBar: 'demo-styled-bar',
          bulkActionBarCount: 'demo-styled-bar__count',
          bulkActionBarClear: 'demo-styled-bar__clear',
        }}
        styles={{
          bulkActionBar: { '--flotable-bulk-bar-count-color': '#6d28d9' } as FloTableStyleValue,
          bulkActionBarActions: { gap: '0.75rem' },
        }}
      />
    </section>
  );
}
