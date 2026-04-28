'use client';

import { useState, useMemo } from 'react';
import type { FloTableStyleValue } from 'flotable';
import { FloTable } from 'flotable';
import type { ColumnDef, SortState, QuickFilterState, BulkAction, BulkActionBarContext } from 'flotable';
import { applySorting, applyFilters } from '../../utils/demoUtils';
import './BulkActionsDemo.css';

interface Employee {
  id: number;
  name: string;
  role: string;
  department: string;
  startDate: string;
  salary: number;
  active: boolean;
}

const COLUMNS: ColumnDef<Employee>[] = [
  { key: 'id', header: 'ID', type: 'number' },
  { key: 'name', header: 'Name', type: 'text' },
  { key: 'role', header: 'Role', type: 'text' },
  { key: 'department', header: 'Department', type: 'text' },
  { key: 'startDate', header: 'Start Date', type: 'date' },
  { key: 'salary', header: 'Salary', type: 'currency' },
  { key: 'active', header: 'Active', type: 'boolean' },
];

const ALL_DATA: Employee[] = [
  { id: 1, name: 'Alice Martin', role: 'Engineer', department: 'Engineering', startDate: '2021-03-15', salary: 95000, active: true },
  { id: 2, name: 'Bob Chen', role: 'Designer', department: 'Product', startDate: '2020-07-01', salary: 88000, active: true },
  { id: 3, name: 'Carol White', role: 'Manager', department: 'Engineering', startDate: '2019-11-20', salary: 115000, active: true },
  { id: 4, name: 'David Park', role: 'Analyst', department: 'Finance', startDate: '2022-01-10', salary: 72000, active: false },
  { id: 5, name: 'Eva Torres', role: 'Engineer', department: 'Engineering', startDate: '2023-05-08', salary: 91000, active: true },
  { id: 6, name: 'Frank Müller', role: 'Sales Rep', department: 'Sales', startDate: '2021-09-14', salary: 67000, active: true },
  { id: 7, name: 'Grace Kim', role: 'HR Lead', department: 'HR', startDate: '2018-04-03', salary: 98000, active: true },
  { id: 8, name: 'Henry Walsh', role: 'DevOps', department: 'Engineering', startDate: '2022-08-22', salary: 105000, active: false },
  { id: 9, name: 'Iris Nakamura', role: 'Engineer', department: 'Engineering', startDate: '2023-02-17', salary: 93000, active: true },
  { id: 10, name: 'James Ford', role: 'Analyst', department: 'Finance', startDate: '2020-12-01', salary: 76000, active: true },
  { id: 11, name: 'Karen Osei', role: 'Designer', department: 'Product', startDate: '2021-06-30', salary: 84000, active: true },
  { id: 12, name: 'Luca Rossi', role: 'Engineer', department: 'Engineering', startDate: '2024-01-08', salary: 89000, active: true },
];

const PAGE_SIZE = 5;

function useTableState() {
  const [page, setPage] = useState(1);
  const [sortState, setSortState] = useState<SortState<Employee> | null>(null);
  const [filterState, setFilterState] = useState<QuickFilterState>({});

  const filteredData = useMemo(() => applyFilters(ALL_DATA, filterState), [filterState]);
  const sortedData = useMemo(() => applySorting(filteredData, sortState), [filteredData, sortState]);
  const pageData = useMemo(
    () => sortedData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [sortedData, page],
  );

  return { page, setPage, sortState, setSortState, filterState, setFilterState, sortedData, pageData };
}

// ─── Section 1: Default bulk actions ─────────────────────────────────────────

const DEFAULT_BULK_ACTIONS: BulkAction<Employee>[] = [
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

function DefaultSection() {
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
        bulkActions={DEFAULT_BULK_ACTIONS}
      />
    </section>
  );
}

// ─── Section 2: Styled via classNames / styles ────────────────────────────────

const STYLED_BULK_ACTIONS: BulkAction<Employee>[] = [
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

function StyledSection() {
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
        quickFilters={filterState}
        onFilterChange={(f) => { setFilterState(f); setPage(1); }}
        selectable
        rowKey="id"
        bulkActions={STYLED_BULK_ACTIONS}
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

// ─── Section 3: Fully custom bar via renderBulkActionBar ──────────────────────

function CustomBarSection() {
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
        quickFilters={filterState}
        onFilterChange={(f) => { setFilterState(f); setPage(1); }}
        selectable
        rowKey="id"
        renderBulkActionBar={renderBar}
      />
    </section>
  );
}

// ─── Page shell ───────────────────────────────────────────────────────────────

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
