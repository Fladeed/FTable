'use client';

import type { BulkAction } from 'flotable';
import { FloTable } from 'flotable';
import { useTableState, COLUMNS, PAGE_SIZE } from '../BulkActionsDemoData';
import type { Employee } from '../BulkActionsDemoData';

const BULK_ACTIONS: BulkAction<Employee>[] = [
  {
    key: 'delete',
    label: 'Delete Selected',
    danger: true,
    onClick: (rows) => alert(`Delete ${rows.length} employee${rows.length !== 1 ? 's' : ''}:\n${rows.map((r) => r.name).join(', ')}`),
  },
  {
    key: 'export',
    label: 'Export Selected',
    onClick: (rows) => console.log('Export', rows),
  },
];

export function DefaultSection() {
  const { page, setPage, sortState, setSortState, filterState, setFilterState, sortedData, pageData } = useTableState();
  return (
    <section className="bulk-demo-section">
      <h2 className="bulk-demo-section__title">Default bar</h2>
      <p className="bulk-demo-section__desc">
        Pass <code>bulkActions</code> to get the built-in bar. Supports <code>danger</code>, <code>icon</code>,
        and <code>disabled</code> per action.
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
        quickFilters={filterState}
        onFilterChange={(f) => { setFilterState(f); setPage(1); }}
        selectable
        rowKey="id"
        bulkActions={BULK_ACTIONS}
      />
    </section>
  );
}
