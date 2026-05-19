'use client';

import { useMemo, useState } from 'react';
import type { QuickFilterState, SortState } from 'flotable';
import { applyFilters, applySorting } from '../../utils/demoUtils';
import { SAMPLE_ORDERS, type Order } from './ResponsiveDemoData';

export const PAGE_SIZE = 8;

export function useOrdersTableState() {
  const [page, setPage] = useState(1);
  const [sortState, setSortState] = useState<SortState<Order> | null>(null);
  const [quickFilters, setQuickFilters] = useState<QuickFilterState>({});

  const filtered = useMemo(() => applyFilters(SAMPLE_ORDERS, quickFilters), [quickFilters]);
  const sorted = useMemo(() => applySorting(filtered, sortState), [filtered, sortState]);
  const pageRows = useMemo(
    () => sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [sorted, page],
  );

  return {
    page,
    setPage,
    sortState,
    setSortState,
    quickFilters,
    setQuickFilters,
    totalRows: sorted.length,
    pageRows,
  };
}
