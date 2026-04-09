'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import FTable from '@/components/FTable/FTable';
import type { ColumnDef, SortState } from '@/components/FTable/FTable.types';
import { applySorting } from './demoUtils';

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

/**
 * Simulates what a real API consumer would do.
 * In production, page/sortState are sent as query params to the API,
 * and the API response supplies `data` (current page rows) + `totalRows`.
 */
export function Demo() {
  const [page, setPage] = useState(1);
  const [sortState, setSortState] = useState<SortState<Employee> | null>(null);

  const sortedData = useMemo(() => applySorting(ALL_DATA, sortState), [sortState]);
  const pageData = useMemo(
    () => sortedData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [sortedData, page],
  );

  return (
    <main style={{ minHeight: '100vh', padding: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>FTable — Demo</h1>
        <Link href="/field-renderers" style={{ fontSize: '0.875rem', color: '#2563eb' }}>
          Field Renderers Demo →
        </Link>
      </div>
      <FTable
        columns={COLUMNS}
        data={pageData}
        totalRows={ALL_DATA.length}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        sortState={sortState}
        onSortChange={setSortState}
      />
    </main>
  );
}
