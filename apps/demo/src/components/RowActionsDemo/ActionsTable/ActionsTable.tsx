'use client';

import { useState, useMemo } from 'react';
import { FloTable } from 'flotable';
import type { RowAction } from 'flotable';
import { applySorting, applyFilters } from '../../../utils/demoUtils';
import type { Employee } from '../RowActionsDemoData';
import { COLUMNS, ALL_DATA, PAGE_SIZE } from '../RowActionsDemoData';

interface ActionsTableProps {
  rowActions: RowAction<Employee>[];
  onAction: (msg: string) => void;
}

export function ActionsTable({ rowActions, onAction }: ActionsTableProps) {
  const [page, setPage] = useState(1);
  const [sortState, setSortState] = useState<import('flotable').SortState<Employee> | null>(null);
  const [filters] = useState<import('flotable').QuickFilterState>({});

  const sorted = useMemo(() => applySorting(applyFilters(ALL_DATA, filters), sortState), [filters, sortState]);
  const totalRows = sorted.length;
  const data = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const boundActions: RowAction<Employee>[] = rowActions.map((a) => ({
    ...a,
    onClick: (row: Employee) => onAction(`${a.label}: ${row.name}`),
  }));

  return (
    <FloTable
      columns={COLUMNS}
      data={data}
      totalRows={totalRows}
      page={page}
      pageSize={PAGE_SIZE}
      sortState={sortState}
      quickFilters={filters}
      rowActions={boundActions}
      onSortChange={setSortState}
      onPageChange={setPage}
    />
  );
}
