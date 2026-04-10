'use client';

import { useState, useMemo } from 'react';
import { FTable } from 'ftable';
import type { SortState, QuickFilterState } from 'ftable';
import { applySorting, applyFilters } from '../../../utils/demoUtils';
import type { ThemeConfig, Employee } from '../StyleCustomizationDemoData';
import { ALL_DATA, COLUMNS, FILTER_DEFS, PAGE_SIZE } from '../StyleCustomizationDemoData';
import './ThemePreview.css';

interface ThemePreviewProps {
  config: ThemeConfig;
  /** CSS class(es) applied to the preview wrapper div (e.g. "sc-preview sc-preview--antd"). */
  previewClass: string;
}

export function ThemePreview({ config, previewClass }: ThemePreviewProps) {
  const [page, setPage] = useState(1);
  const [sortState, setSortState] = useState<SortState<Employee> | null>(null);
  const [filterState, setFilterState] = useState<QuickFilterState>({});

  function handleFilterChange(filters: QuickFilterState) {
    setFilterState(filters);
    setPage(1);
  }

  const filteredData = useMemo(() => applyFilters(ALL_DATA, filterState), [filterState]);
  const sortedData = useMemo(() => applySorting(filteredData, sortState), [filteredData, sortState]);
  const pageData = useMemo(
    () => sortedData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [sortedData, page],
  );

  return (
    <div className={previewClass}>
      <FTable
        columns={COLUMNS}
        data={pageData}
        totalRows={filteredData.length}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        sortState={sortState}
        onSortChange={setSortState}
        filterDefs={FILTER_DEFS}
        autoFilters={true}
        showSearch={true}
        quickFilters={filterState}
        onFilterChange={handleFilterChange}
        classNames={config.classNames}
        styles={config.styles}
      />
    </div>
  );
}
