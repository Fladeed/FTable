'use client';

import { FloTable, type RowAction } from 'flotable';
import { COLUMNS, FILTER_DEFS, type Order } from '../../ResponsiveDemoData';
import { useOrdersTableState, PAGE_SIZE } from '../../useOrdersTableState';

const ROW_ACTIONS: RowAction<Order>[] = [
  {
    key: 'view',
    label: 'View',
    onClick: (row) => console.log('view', row.reference),
  },
  {
    key: 'edit',
    label: 'Edit',
    onClick: (row) => console.log('edit', row.reference),
    disabled: (row) => row.status === 'Refunded' || row.status === 'Cancelled',
  },
  {
    key: 'delete',
    label: 'Delete',
    onClick: (row) => console.log('delete', row.reference),
    danger: true,
  },
];

export function CardSection() {
  const s = useOrdersTableState();
  return (
    <FloTable
      columns={COLUMNS}
      data={s.pageRows}
      totalRows={s.totalRows}
      page={s.page}
      onPageChange={s.setPage}
      sortState={s.sortState}
      onSortChange={s.setSortState}
      quickFilters={s.quickFilters}
      onFilterChange={s.setQuickFilters}
      filterDefs={FILTER_DEFS}
      showSearch
      pageSize={PAGE_SIZE}
      mobileVariant="card"
      showViewToggle
      showFullscreenToggle
      rowActions={ROW_ACTIONS}
    />
  );
}
