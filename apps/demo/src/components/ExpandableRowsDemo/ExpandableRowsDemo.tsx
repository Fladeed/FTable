'use client';

import { useCallback, useMemo, useState } from 'react';
import { FloTable, type SortState, type QuickFilterState } from 'flotable';
import { applyFilters, applySorting } from '@/utils/demoUtils';
import {
  PRODUCTS,
  PARENT_COLUMNS,
  CHILD_COLUMNS,
  type Product,
  type Variant,
} from './ExpandableRowsDemoData';

const PAGE_SIZE = 5;

/**
 * In data mode the consumer owns filtering. To match FloTable's child-aware search, a parent is
 * kept when it matches the query OR any of its children does — so the table can auto-expand it.
 */
function filterProducts(products: Product[], filters: QuickFilterState): Product[] {
  const search = filters['__search__']?.trim().toLowerCase() ?? '';
  const parentMatched = applyFilters(products, filters);
  if (search === '') return parentMatched;

  const kept = new Set(parentMatched);
  for (const product of products) {
    if (kept.has(product)) continue;
    const childMatch = product.variants.some((v) =>
      Object.values(v).some((field) => String(field ?? '').toLowerCase().includes(search)),
    );
    if (childMatch) kept.add(product);
  }
  return products.filter((p) => kept.has(p));
}

export function ExpandableRowsDemo() {
  const [page, setPage] = useState(1);
  const [sortState, setSortState] = useState<SortState<Product> | null>(null);
  const [quickFilters, setQuickFilters] = useState<QuickFilterState>({});
  const [expandOnRow, setExpandOnRow] = useState(false);
  const [lazyChildren, setLazyChildren] = useState(false);
  const [lastExpanded, setLastExpanded] = useState<string[]>([]);

  const fetchVariants = useCallback(
    (product: Product, { page: childPage, pageSize }: { page: number; pageSize: number }) =>
      new Promise<{ data: Variant[]; totalRows: number }>((resolve) => {
        setTimeout(() => {
          const all = product.variants;
          const start = (childPage - 1) * pageSize;
          resolve({ data: all.slice(start, start + pageSize), totalRows: all.length });
        }, 600);
      }),
    [],
  );

  const { pageData, totalRows } = useMemo(() => {
    const filtered = filterProducts(PRODUCTS, quickFilters);
    const sorted = applySorting(filtered, sortState);
    const start = (page - 1) * PAGE_SIZE;
    return {
      pageData: sorted.slice(start, start + PAGE_SIZE),
      totalRows: sorted.length,
    };
  }, [page, sortState, quickFilters]);

  return (
    <main className="demo-page-shell">
      <h1>Expandable Rows</h1>
      <p>
        Provide <code>getChildren</code> to turn any row into an expandable parent. A chevron
        appears only for rows that have children. Child rows render in their own{' '}
        <code>childColumns</code> layout, indented under the parent. Parent columns can show an{' '}
        <code>aggregate</code> of their children (here: <code>&quot;N variants&quot;</code> and a
        price range). Try the <strong>search</strong> box — typing a variant SKU or option (e.g.{' '}
        <code>SKU-103</code> or <code>Ivory</code>) auto-expands the matching parent and highlights
        the child. Pagination counts parents, not children.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', margin: '0.5rem 0 1rem' }}>
        <label style={{ display: 'inline-flex', gap: '0.5rem', alignItems: 'center' }}>
          <input
            type="checkbox"
            checked={expandOnRow}
            onChange={(e) => setExpandOnRow(e.target.checked)}
          />
          Toggle expansion by clicking anywhere on the row (<code>expandOn=&quot;row&quot;</code>)
        </label>
        <label style={{ display: 'inline-flex', gap: '0.5rem', alignItems: 'center' }}>
          <input
            type="checkbox"
            checked={lazyChildren}
            onChange={(e) => setLazyChildren(e.target.checked)}
          />
          Fetch children lazily with infinite scroll (<code>childRequest</code> request mode, 2 / batch)
        </label>
      </div>

      {lastExpanded.length > 0 && (
        <p role="status">
          Expanded parents: <strong>{lastExpanded.join(', ')}</strong>
        </p>
      )}

      <FloTable<Product, Variant>
        key={lazyChildren ? 'lazy' : 'eager'}
        columns={PARENT_COLUMNS}
        data={pageData}
        totalRows={totalRows}
        page={page}
        onPageChange={setPage}
        pageSize={PAGE_SIZE}
        sortState={sortState}
        onSortChange={setSortState}
        quickFilters={quickFilters}
        onFilterChange={setQuickFilters}
        showSearch
        childColumns={CHILD_COLUMNS}
        expandOn={expandOnRow ? 'row' : 'chevron'}
        onExpandedChange={setLastExpanded}
        {...(lazyChildren
          ? {
              childRequest: fetchVariants,
              rowHasChildren: (product: Product) => product.variants.length > 0,
              childPageSize: 2,
            }
          : { getChildren: (product: Product) => product.variants, childPageSize: 3 })}
      />
    </main>
  );
}
