'use client';

import { FloTable } from 'flotable';
import { COLUMNS, FILTER_DEFS } from '../../ResponsiveDemoData';
import { useOrdersTableState, PAGE_SIZE } from '../../useOrdersTableState';

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
    />
  );
}
