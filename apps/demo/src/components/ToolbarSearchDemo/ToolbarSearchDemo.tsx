'use client';

import { useState } from 'react';
import { FloTable, SearchInput } from 'flotable';
import type { FilterDef, TableAction } from 'flotable';
import { useTableState, COLUMNS, PAGE_SIZE } from '../TableActionsDemo/TableActionsDemoData';
import { PeriodPicker } from '../TableActionsDemo/PeriodPicker/PeriodPicker';
import './ToolbarSearchDemo.css';

const FILTER_DEFS: FilterDef[] = [
  { key: 'name', label: 'Name', type: 'text' },
  { key: 'category', label: 'Category', type: 'select', options: ['Hardware', 'Software', 'Services'] },
  { key: 'price', label: 'Price', type: 'number' },
  { key: 'inStock', label: 'In stock', type: 'boolean' },
];

export function ToolbarSearchDemo() {
  const [applied, setApplied] = useState('');
  const [log, setLog] = useState<string[]>([]);
  const { page, setPage, sortState, setSortState, filterState, setFilterState, sortedData, pageData } =
    useTableState('ltr');

  const tableActions: TableAction[] = [
    { key: 'add', label: 'Add row', variant: 'primary', onClick: () => {} },
    { key: 'export', label: 'Export', onClick: () => {} },
  ];

  return (
    <main className="toolbar-search-demo demo-page-shell">
      <h1 className="toolbar-search-demo__title">Toolbar Search</h1>
      <p className="toolbar-search-demo__subtitle">
        Review page for the new <code>SearchInput</code> and the smoother filter pills.
      </p>

      <section className="toolbar-search-demo__section">
        <h2 className="toolbar-search-demo__section-title">SearchInput (standalone)</h2>
        <p className="toolbar-search-demo__section-desc">
          Type: the box updates instantly, <code>onChange</code> fires 300ms after the last key. Enter and × apply
          immediately.
        </p>
        <SearchInput
          value={applied}
          onChange={(v) => {
            setApplied(v);
            setLog((prev) => [`onChange(${JSON.stringify(v)})`, ...prev].slice(0, 5));
          }}
        />
        <p className="toolbar-search-demo__feedback">
          Applied: <strong>{applied === '' ? '—' : applied}</strong>
        </p>
        <ul className="toolbar-search-demo__log">
          {log.map((entry, i) => (
            <li key={i}>{entry}</li>
          ))}
        </ul>
      </section>

      <section className="toolbar-search-demo__section">
        <h2 className="toolbar-search-demo__section-title">In the table toolbar</h2>
        <p className="toolbar-search-demo__section-desc">
          <code>showSearch</code> + text, select, number and boolean pills + <code>toolbarEnd</code> +{' '}
          <code>tableActions</code>.
        </p>
        <FloTable
          columns={COLUMNS.ltr}
          data={pageData}
          totalRows={sortedData.length}
          page={page}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
          sortState={sortState}
          onSortChange={setSortState}
          showSearch
          filterDefs={FILTER_DEFS}
          quickFilters={filterState}
          onFilterChange={(f) => {
            setFilterState(f);
            setPage(1);
          }}
          toolbarEnd={<PeriodPicker direction="ltr" onChange={() => {}} />}
          tableActions={tableActions}
        />
      </section>
    </main>
  );
}
