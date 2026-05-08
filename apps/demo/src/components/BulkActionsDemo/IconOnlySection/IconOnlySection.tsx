'use client';

import type { BulkAction } from 'flotable';
import { FloTable } from 'flotable';
import { useTableState, COLUMNS, FILTER_DEFS, PAGE_SIZE } from '../BulkActionsDemoData';
import type { Employee } from '../BulkActionsDemoData';

const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11.5 2.5a1.5 1.5 0 0 1 2 2L4 14l-3 .5.5-3L11.5 2.5Z" />
  </svg>
);

const ArchiveIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="12" height="3" rx="1" />
    <path d="M3 6v6a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V6" />
    <line x1="6" y1="9.5" x2="10" y2="9.5" />
  </svg>
);

const DownloadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 2v9M5 8l3 3 3-3" />
    <path d="M2 13h12" />
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 5h12M6 5V3h4v2M4 5l.667 9h6.666L12 5" />
  </svg>
);

const BULK_ACTIONS: BulkAction<Employee>[] = [
  {
    key: 'edit',
    label: '',
    icon: <EditIcon />,
    onClick: (rows) => alert(`Edit ${rows.length} row${rows.length !== 1 ? 's' : ''}`),
  },
  {
    key: 'archive',
    label: '',
    icon: <ArchiveIcon />,
    onClick: (rows) => alert(`Archive ${rows.length} row${rows.length !== 1 ? 's' : ''}`),
  },
  {
    key: 'export',
    label: '',
    icon: <DownloadIcon />,
    onClick: (rows) => console.log('Export', rows),
  },
  {
    key: 'delete',
    label: '',
    icon: <TrashIcon />,
    danger: true,
    onClick: (rows) => alert(`Delete ${rows.length} row${rows.length !== 1 ? 's' : ''}`),
  },
];

export function IconOnlySection() {
  const { page, setPage, sortState, setSortState, filterState, setFilterState, sortedData, pageData } = useTableState();
  return (
    <section className="bulk-demo-section">
      <h2 className="bulk-demo-section__title">Icon-only actions</h2>
      <p className="bulk-demo-section__desc">
        Set <code>icon</code> and leave <code>label</code> empty for compact icon-only buttons.
        In production, add tooltips or <code>aria-label</code>s for accessibility.
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
