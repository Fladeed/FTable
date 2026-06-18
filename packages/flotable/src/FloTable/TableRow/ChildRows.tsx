import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { ChildRowsProps, ColumnDef } from '../FloTable.types';
import { renderCell } from '../fields/renderCell';
import { rowMatchesQuery } from '../tableUtils';
import { TablePagination } from '../TablePagination/TablePagination';
import { cx } from '../../utils/cx';

/**
 * Renders one parent's children as real rows inside the parent table (so their cells stay
 * aligned under the column headers), and gives them FloTable's two data modes:
 *  - data mode    (`getChildren`): in-memory children, sliced client-side per child page.
 *  - request mode (`childRequest`): fetched lazily on first expand and on child page change,
 *    with a loading skeleton and error / retry — mirroring FloTable's top-level request mode.
 * A per-parent pager (the shared TablePagination) appears when there is more than one page.
 */
export function ChildRows<T extends object, C extends object = T>({
  parentRow,
  expanded,
  columns,
  childColumns,
  getChildren,
  childRequest,
  childPageSize,
  childRowKey,
  colSpan,
  selectable,
  hasActions,
  searchQuery = '',
  paginationLabels,
  showPageInput,
  classNames,
  styles,
}: ChildRowsProps<T, C>) {
  const isRequest = typeof childRequest === 'function';
  const childCols = childColumns ?? (columns as unknown as ColumnDef<C>[]);

  const [page, setPage] = useState(1);
  const [reqData, setReqData] = useState<C[]>([]);
  const [reqTotal, setReqTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);

  const requestIdRef = useRef(0);
  const hasFetchedRef = useRef(false);
  const lastFetchedRef = useRef<string | null>(null);

  const eager = useMemo(
    () => (isRequest ? [] : getChildren?.(parentRow) ?? []),
    [isRequest, getChildren, parentRow],
  );
  const eagerPageData = useMemo(
    () => eager.slice((page - 1) * childPageSize, page * childPageSize),
    [eager, page, childPageSize],
  );

  useEffect(() => {
    if (!isRequest || !expanded || !childRequest) return;
    const fetchKey = `${page}:${retry}`;
    if (lastFetchedRef.current === fetchKey) return;
    lastFetchedRef.current = fetchKey;

    const id = ++requestIdRef.current;
    setLoading(true);
    setError(null);
    childRequest(parentRow, { page, pageSize: childPageSize })
      .then((res) => {
        if (id !== requestIdRef.current) return;
        setReqData(res.data);
        setReqTotal(res.totalRows);
        hasFetchedRef.current = true;
      })
      .catch((err: unknown) => {
        if (id !== requestIdRef.current) return;
        lastFetchedRef.current = null;
        setError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => {
        if (id === requestIdRef.current) setLoading(false);
      });
  }, [isRequest, expanded, childRequest, parentRow, page, childPageSize, retry]);

  const rows = isRequest ? reqData : eagerPageData;
  const totalRows = isRequest ? reqTotal : eager.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / childPageSize));

  const rowClass = cx('flotable__child-row', expanded && 'flotable__child-row--expanded');
  const ariaHidden = expanded ? undefined : true;

  const childKeyOf = (child: C, index: number) => {
    const value = String((child as Record<string, unknown>)[childRowKey] ?? '');
    return value || String(index);
  };
  const childMatches = (child: C) =>
    searchQuery !== '' && rowMatchesQuery(child, childCols, searchQuery);

  const leadingSpacers = (
    <>
      <td className="flotable__expander-cell flotable__child-spacer" aria-hidden="true" />
      {selectable && (
        <td className="flotable__checkbox-cell flotable__child-spacer" aria-hidden="true" />
      )}
    </>
  );
  const trailingSpacer = hasActions ? (
    <td className="flotable__cell--actions flotable__child-spacer" aria-hidden="true" />
  ) : null;

  const dataCells = (content: (col: ColumnDef<C>) => ReactNode) =>
    childCols.map((col, colIndex) => (
      <td
        key={col.key}
        className={cx('flotable__child-cell', colIndex === 0 && 'flotable__child-cell--first')}
      >
        <div className="flotable__child-collapser">
          <div className="flotable__child-collapser-inner">
            <div className="flotable__child-collapser-content">{content(col)}</div>
          </div>
        </div>
      </td>
    ));

  const leadingCount = 1 + (selectable ? 1 : 0);
  const fullWidthRow = (key: string, content: ReactNode, extraClass?: string) => (
    <tr key={key} className={cx(rowClass, extraClass)} aria-hidden={ariaHidden}>
      {leadingSpacers}
      <td className="flotable__child-fullspan" colSpan={Math.max(1, colSpan - leadingCount)}>
        <div className="flotable__child-collapser">
          <div className="flotable__child-collapser-inner">
            <div className="flotable__child-collapser-content">{content}</div>
          </div>
        </div>
      </td>
    </tr>
  );

  const out: ReactNode[] = [];

  if (isRequest && error) {
    out.push(
      fullWidthRow(
        'child-error',
        <div className="flotable__child-state flotable__child-state--error">
          <span>{error}</span>
          <button
            type="button"
            className="flotable__child-retry"
            onClick={() => setRetry((c) => c + 1)}
          >
            Retry
          </button>
        </div>,
        'flotable__child-state-row',
      ),
    );
  } else if (isRequest && loading && !hasFetchedRef.current) {
    for (let i = 0; i < childPageSize; i++) {
      out.push(
        <tr key={`child-skel-${i}`} className={rowClass} aria-hidden={ariaHidden}>
          {leadingSpacers}
          {dataCells(() => <span className="flotable__skeleton-shimmer" />)}
          {trailingSpacer}
        </tr>,
      );
    }
  } else if (isRequest && hasFetchedRef.current && rows.length === 0) {
    out.push(
      fullWidthRow(
        'child-empty',
        <span className="flotable__child-state">No items</span>,
        'flotable__child-state-row',
      ),
    );
  } else {
    rows.forEach((child, index) => {
      out.push(
        <tr
          key={`child-${childKeyOf(child, index)}`}
          className={cx(rowClass, childMatches(child) && 'flotable__child-row--match')}
          aria-hidden={ariaHidden}
        >
          {leadingSpacers}
          {dataCells((col) => renderCell(col, child))}
          {trailingSpacer}
        </tr>,
      );
    });
  }

  if (totalPages > 1) {
    out.push(
      fullWidthRow(
        'child-pager',
        <TablePagination
          currentPage={page}
          totalPages={totalPages}
          onPrev={() => setPage((p) => Math.max(1, p - 1))}
          onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
          onGoToPage={(p) => setPage(Math.min(totalPages, Math.max(1, p)))}
          showPageInput={showPageInput}
          labels={paginationLabels}
          classNames={classNames}
          styles={styles}
        />,
        'flotable__child-pager-row',
      ),
    );
  }

  return <>{out}</>;
}
