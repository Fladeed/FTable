'use client';

import { useCallback } from 'react';
import { FloTable, type FloTableRequestParams } from 'flotable';
import { applyFilters, applySorting } from '../../../../utils/demoUtils';
import { COLUMNS, FILTER_DEFS, LARGE_ORDERS, type Order } from '../../ResponsiveDemoData';
import './InfiniteScrollSection.css';

export function InfiniteScrollSection() {
  const request = useCallback(
    async ({ page, pageSize, sortState, quickFilters }: FloTableRequestParams<Order>) => {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const filtered = applyFilters(LARGE_ORDERS, quickFilters);
      const sorted = applySorting(filtered, sortState);
      const start = (page - 1) * pageSize;
      return { data: sorted.slice(start, start + pageSize), totalRows: sorted.length };
    },
    [],
  );

  return (
    <div className="rd-infinite-scroll">
      <FloTable
        columns={COLUMNS}
        request={request}
        filterDefs={FILTER_DEFS}
        showSearch
        pageSize={10}
        mobileVariant="card"
        stickyToolbar
        showViewToggle
        showFullscreenToggle
        infiniteScrollLabels={{ loading: 'Loading more orders…', end: 'No more orders.' }}
      />
    </div>
  );
}
