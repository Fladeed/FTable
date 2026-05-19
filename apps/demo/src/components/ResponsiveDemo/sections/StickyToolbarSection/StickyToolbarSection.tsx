'use client';

import { FloTable } from 'flotable';
import { COLUMNS, FILTER_DEFS } from '../../ResponsiveDemoData';
import { useOrdersTableState, PAGE_SIZE } from '../../useOrdersTableState';
import './StickyToolbarSection.css';

export function StickyToolbarSection() {
  const s = useOrdersTableState();
  return (
    <div className="rd-sticky-scroll">
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
        stickyToolbar
      />
    </div>
  );
}
