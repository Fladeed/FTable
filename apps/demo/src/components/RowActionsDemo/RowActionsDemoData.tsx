import type { ColumnDef } from 'flotable';

export interface Employee {
  id: number;
  name: string;
  role: string;
  department: string;
  salary: number;
  active: boolean;
}

export const COLUMNS: ColumnDef<Employee>[] = [
  { key: 'id', header: 'ID', type: 'number' },
  { key: 'name', header: 'Name', type: 'text' },
  { key: 'role', header: 'Role', type: 'text' },
  { key: 'department', header: 'Department', type: 'text' },
  { key: 'salary', header: 'Salary', type: 'currency' },
  { key: 'active', header: 'Active', type: 'boolean' },
];

export const ALL_DATA: Employee[] = [
  { id: 1, name: 'Alice Martin', role: 'Engineer', department: 'Engineering', salary: 95000, active: true },
  { id: 2, name: 'Bob Chen', role: 'Designer', department: 'Product', salary: 88000, active: true },
  { id: 3, name: 'Carol White', role: 'Manager', department: 'Engineering', salary: 115000, active: true },
  { id: 4, name: 'David Park', role: 'Analyst', department: 'Finance', salary: 72000, active: false },
  { id: 5, name: 'Eva Torres', role: 'Engineer', department: 'Engineering', salary: 91000, active: true },
  { id: 6, name: 'Frank Müller', role: 'Sales Rep', department: 'Sales', salary: 67000, active: true },
  { id: 7, name: 'Grace Kim', role: 'HR Lead', department: 'HR', salary: 98000, active: true },
  { id: 8, name: 'Henry Walsh', role: 'DevOps', department: 'Engineering', salary: 105000, active: false },
];

export const PAGE_SIZE = 5;

export const IconEdit = (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M11.5 1.5a1.414 1.414 0 0 1 2 2L5 12H3v-2L11.5 1.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
  </svg>
);

export const IconDuplicate = (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <rect x="5" y="5" width="8" height="9" rx="1" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M3 11V3a1 1 0 0 1 1-1h8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);

export const IconDelete = (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M3 5h10M6 5V3h4v2M7 8v4M9 8v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    <rect x="4" y="5" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.4"/>
  </svg>
);

export const IconView = (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <ellipse cx="8" cy="8" rx="6" ry="4" stroke="currentColor" strokeWidth="1.4"/>
    <circle cx="8" cy="8" r="1.8" fill="currentColor"/>
  </svg>
);

export const IconRestore = (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M3 8a5 5 0 1 0 1.5-3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    <path d="M3 4.5V8h3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const IconArchive = (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <rect x="2" y="2" width="12" height="3" rx="1" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M3 5v7a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V5" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M6 9h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);
