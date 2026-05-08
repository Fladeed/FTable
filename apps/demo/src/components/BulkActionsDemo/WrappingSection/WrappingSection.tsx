'use client';

import type { BulkAction, FilterDef } from 'flotable';
import { FloTable } from 'flotable';
import { useTableState, COLUMNS, PAGE_SIZE } from '../BulkActionsDemoData';
import type { Employee } from '../BulkActionsDemoData';

const FILTER_DEFS: FilterDef[] = [
  { key: 'department', label: 'Department', type: 'select', options: ['Engineering', 'Finance', 'HR', 'Product', 'Sales'] },
  { key: 'role', label: 'Role', type: 'select', options: ['Analyst', 'Designer', 'DevOps', 'Engineer', 'HR Lead', 'Manager', 'Sales Rep'] },
  { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive'] },
  { key: 'seniority', label: 'Seniority', type: 'select', options: ['Junior', 'Mid-level', 'Senior', 'Staff'] },
  { key: 'location', label: 'Location', type: 'select', options: ['Remote', 'Hybrid', 'On-site'] },
  { key: 'team', label: 'Team', type: 'select', options: ['Alpha', 'Beta', 'Gamma', 'Delta'] },
];

const BULK_ACTIONS: BulkAction<Employee>[] = [
  {
    key: 'promote',
    label: 'Promote',
    onClick: (rows) => alert(`Promote ${rows.length} employee${rows.length !== 1 ? 's' : ''}`),
  },
  {
    key: 'reassign',
    label: 'Reassign',
    onClick: (rows) => alert(`Reassign ${rows.length} employee${rows.length !== 1 ? 's' : ''}`),
  },
  {
    key: 'message',
    label: 'Send Message',
    onClick: (rows) => alert(`Message ${rows.length} employee${rows.length !== 1 ? 's' : ''}`),
  },
  {
    key: 'review',
    label: 'Schedule Review',
    onClick: (rows) => alert(`Schedule review for ${rows.length} employee${rows.length !== 1 ? 's' : ''}`),
  },
  {
    key: 'archive',
    label: 'Archive',
    onClick: (rows) => alert(`Archive ${rows.length} employee${rows.length !== 1 ? 's' : ''}`),
  },
  {
    key: 'export-csv',
    label: 'Export CSV',
    onClick: (rows) => console.log('CSV', rows),
  },
  {
    key: 'export-pdf',
    label: 'Export PDF',
    onClick: (rows) => console.log('PDF', rows),
  },
  {
    key: 'delete',
    label: 'Delete',
    danger: true,
    onClick: (rows) => alert(`Delete ${rows.length} employee${rows.length !== 1 ? 's' : ''}`),
  },
];

export function WrappingSection() {
  const { page, setPage, sortState, setSortState, filterState, setFilterState, sortedData, pageData } = useTableState();
  return (
    <section className="bulk-demo-section">
      <h2 className="bulk-demo-section__title">Many filters &amp; actions (wrapping)</h2>
      <p className="bulk-demo-section__desc">
        Six filter pills and eight bulk actions — select rows to see how the action bar wraps
        when there is not enough horizontal space.
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
      />
    </section>
  );
}
