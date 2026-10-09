'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import { FloTable } from 'flotable';
import type { BulkAction, TableAction } from 'flotable';
import { useTableState, COLUMNS, FILTER_DEFS, LABELS, PAGE_SIZE } from '../TableActionsDemoData';
import type { Direction, Product } from '../TableActionsDemoData';
import { PeriodPicker } from '../PeriodPicker/PeriodPicker';

const PlusIcon = (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M8 3v10M3 8h10" />
  </svg>
);

interface TableActionsSectionProps {
  title: string;
  description: ReactNode;
  direction: Direction;
  withFilters: boolean;
  withTableActions?: boolean;
}

export function TableActionsSection({
  title,
  description,
  direction,
  withFilters,
  withTableActions = true,
}: TableActionsSectionProps) {
  const labels = LABELS[direction];
  const { page, setPage, sortState, setSortState, filterState, setFilterState, sortedData, pageData, addRow, removeRows } =
    useTableState(direction);
  const [lastAction, setLastAction] = useState<string | null>(null);

  const tableActions: TableAction[] = [
    {
      key: 'add',
      label: labels.addRow,
      icon: PlusIcon,
      variant: 'primary',
      onClick: () => {
        addRow();
        setLastAction(labels.addRow);
      },
    },
    {
      key: 'export',
      label: labels.export,
      onClick: () => setLastAction(labels.export),
    },
  ];

  const bulkActions: BulkAction<Product>[] = [
    {
      key: 'delete',
      label: labels.deleteSelected,
      danger: true,
      onClick: (rows) => {
        removeRows(rows.map((r) => r.id));
        setLastAction(labels.deleteSelected);
      },
    },
  ];

  return (
    <section className="table-actions-demo__section">
      <h2 className="table-actions-demo__section-title" dir={direction}>{title}</h2>
      <p className="table-actions-demo__section-desc">{description}</p>
      <p className="table-actions-demo__feedback" dir={direction} aria-live="polite">
        {lastAction ? labels.feedback(lastAction) : labels.idle}
      </p>
      <FloTable
        columns={COLUMNS[direction]}
        data={pageData}
        totalRows={sortedData.length}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        sortState={sortState}
        onSortChange={setSortState}
        direction={direction}
        tableActions={withTableActions ? tableActions : undefined}
        toolbarEnd={<PeriodPicker direction={direction} onChange={(p) => setLastAction(`${labels.period}: ${p}`)} />}
        {...(withFilters
          ? {
              filterDefs: FILTER_DEFS[direction],
              showSearch: true,
              quickFilters: filterState,
              onFilterChange: (f) => {
                setFilterState(f);
                setPage(1);
              },
              selectable: true,
              rowKey: 'id',
              bulkActions,
              clearSelectionLabel: direction === 'rtl' ? 'إلغاء التحديد' : undefined,
              selectionCountLabel:
                direction === 'rtl' ? (count: number) => (count === 0 ? 'لا توجد صفوف محددة' : `${count} صفوف محددة`) : undefined,
            }
          : {})}
        paginationLabels={
          direction === 'rtl' ? { prev: 'السابق', next: 'التالي', pageInfo: (c, t) => `صفحة ${c} من ${t}` } : undefined
        }
      />
    </section>
  );
}
