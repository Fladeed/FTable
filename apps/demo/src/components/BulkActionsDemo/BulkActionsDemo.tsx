'use client';

import { useState, useMemo } from 'react';
import { FloTable } from 'flotable';
import type { ColumnDef, SortState, QuickFilterState, BulkAction } from 'flotable';
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

const PAGE_SIZE = 5;

export function BulkActionsDemo() {
  const [page, setPage] = useState(1);
  const [sortState, setSortState] = useState<SortState<Employee> | null>(null);
  const [filterState, setFilterState] = useState<QuickFilterState>({});
  const [lastSelection, setLastSelection] = useState<string[]>([]);

  const filteredData = useMemo(() => applyFilters(ALL_DATA, filterState), [filterState]);
  const sortedData = useMemo(() => applySorting(filteredData, sortState), [filteredData, sortState]);
  const pageData = useMemo(
    () => sortedData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [sortedData, page],
  );

  return (
    <main className="bulk-actions-demo demo-page-shell">
      <h1 className="bulk-actions-demo__title">Bulk Actions</h1>
      <p className="bulk-actions-demo__subtitle">
        Set <code>selectable</code> to enable checkboxes. Pass a <code>bulkActions</code> array to show the
        action bar when rows are selected. The bar slides in and replaces the filter bar.
      </p>

      {lastSelection.length > 0 && (
        <div className="bulk-actions-demo__feedback" role="status">
          {lastSelection.length} row{lastSelection.length !== 1 ? 's' : ''} selected — keys:{' '}
          <strong>{lastSelection.join(', ')}</strong>
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
        selectable={true}
        rowKey="id"
        onSelectionChange={setLastSelection}
        bulkActions={BULK_ACTIONS}
      />
    </main>
  );
}
