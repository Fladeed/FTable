'use client';

import { useState, useMemo } from 'react';
import { FloTable } from 'flotable';
import type { SortState, QuickFilterState } from 'flotable';
import { applySorting, applyFilters } from '../../../utils/demoUtils';
import { COLUMNS, FILTER_DEFS, ALL_DATA, PAGE_SIZE } from '../FilterModeDemoData';
import '../FilterModeDemo.css';

interface FilterModeTableProps {
  mode: 'commit' | 'live';
}

export function FilterModeTable({ mode }: FilterModeTableProps) {
  const [page, setPage] = useState(1);
  const [sortState, setSortState] = useState<SortState<import('../FilterModeDemoData').Employee> | null>(null);
  const [filters, setFilters] = useState<QuickFilterState>({});
  const [requestCount, setRequestCount] = useState(0);

  function handleFilterChange(f: QuickFilterState) {
    setFilters(f);
    setPage(1);
    setRequestCount((c) => c + 1);
  }

  const filtered = useMemo(() => applyFilters(ALL_DATA, filters), [filters]);
  const sorted = useMemo(() => applySorting(filtered, sortState), [filtered, sortState]);
  const totalRows = sorted.length;
  const data = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <p className="fmd-request-counter">
        Filter requests fired: <strong>{requestCount}</strong>
      </p>
      <FloTable
        columns={COLUMNS}
        data={data}
        totalRows={totalRows}
        page={page}
        pageSize={PAGE_SIZE}
        sortState={sortState}
        quickFilters={filters}
        filterDefs={FILTER_DEFS}
        filterMode={mode}
        onSortChange={setSortState}
        onPageChange={setPage}
        onFilterChange={handleFilterChange}
      />
    </div>
  );
}
