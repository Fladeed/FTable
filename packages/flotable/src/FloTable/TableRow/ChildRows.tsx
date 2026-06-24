import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { ChildRowsProps, ColumnDef } from '../FloTable.types';
import { renderCell } from '../fields/renderCell';
import { rowMatchesQuery } from '../tableUtils';
import { cx } from '../../utils/cx';

/**
 * Renders one parent's children inside a single full-width cell, as a fixed-height **scroll box**
 * containing a nested table whose column widths are synced to the parent's (via `columnWidths`),
 * so the child cells stay aligned under the parent headers while scrolling internally.
 *
 * Two data modes, both with infinite scroll (the scroll box is the observer root):
 *  - data mode    (`getChildren`): in-memory children revealed in batches of `childPageSize`.
 *  - request mode (`childRequest`): first batch fetched on expand, next batch fetched & appended
 *    as you scroll — with a loading skeleton and error / retry.
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
  columnWidths,
}: ChildRowsProps<T, C>) {
  const isRequest = typeof childRequest === 'function';
  const childCols = childColumns ?? (columns as unknown as ColumnDef<C>[]);

  const [loaded, setLoaded] = useState<C[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(childPageSize);

  const requestIdRef = useRef(0);
  const nextPageRef = useRef(1);
  const initialFetchedRef = useRef(false);
  const loadingRef = useRef(false);
  loadingRef.current = loading;

  const eager = useMemo(
    () => (isRequest ? [] : getChildren?.(parentRow) ?? []),
    [isRequest, getChildren, parentRow],
  );

  const fetchPage = useCallback(
    (pageNum: number) => {
      if (!childRequest) return;
      const id = ++requestIdRef.current;
      setLoading(true);
      setError(null);
      childRequest(parentRow, { page: pageNum, pageSize: childPageSize })
        .then((res) => {
          if (id !== requestIdRef.current) return;
          setLoaded((prev) => (pageNum === 1 ? res.data : [...prev, ...res.data]));
          setTotal(res.totalRows);
          nextPageRef.current = pageNum + 1;
          initialFetchedRef.current = true;
        })
        .catch((err: unknown) => {
          if (id !== requestIdRef.current) return;
          setError(err instanceof Error ? err.message : String(err));
        })
        .finally(() => {
          if (id === requestIdRef.current) setLoading(false);
        });
    },
    [childRequest, parentRow, childPageSize],
  );

  useEffect(() => {
    if (!isRequest || !expanded || initialFetchedRef.current) return;
    fetchPage(1);
  }, [isRequest, expanded, fetchPage]);

  const rows = isRequest ? loaded : eager.slice(0, visibleCount);
  const totalRows = isRequest ? total : eager.length;
  const hasMore = isRequest
    ? initialFetchedRef.current && loaded.length < total
    : visibleCount < eager.length;

  const loadMore = () => {
    if (loadingRef.current) return;
    if (isRequest) {
      if (loaded.length >= total) return;
      fetchPage(nextPageRef.current);
    } else {
      setVisibleCount((v) => Math.min(v + childPageSize, eager.length));
    }
  };
  const loadMoreRef = useRef(loadMore);
  loadMoreRef.current = loadMore;

  // Infinite scroll — observe the sentinel within the scroll box (root = viewport).
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!expanded || !hasMore) return;
    const root = viewportRef.current;
    const el = sentinelRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) loadMoreRef.current();
      },
      { root, rootMargin: '0px 0px 80px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [expanded, hasMore, rows.length]);

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

  const fullWidthCell = (content: ReactNode, ref?: (el: HTMLDivElement | null) => void) => (
    <td className="flotable__child-statecell" colSpan={colSpan}>
      <div className="flotable__child-statecell-inner" ref={ref}>
        {content}
      </div>
    </td>
  );

  const body: ReactNode[] = [];

  if (isRequest && loading && !initialFetchedRef.current) {
    for (let i = 0; i < childPageSize; i++) {
      body.push(
        <tr key={`child-skel-${i}`} className="flotable__child-row">
          {leadingSpacers}
          {childCols.map((col, colIndex) => (
            <td
              key={col.key}
              className={cx('flotable__child-cell', colIndex === 0 && 'flotable__child-cell--first')}
            >
              <span className="flotable__skeleton-shimmer" />
            </td>
          ))}
          {trailingSpacer}
        </tr>,
      );
    }
  } else {
    rows.forEach((child, index) => {
      body.push(
        <tr
          key={`child-${childKeyOf(child, index)}`}
          className={cx('flotable__child-row', childMatches(child) && 'flotable__child-row--match')}
        >
          {leadingSpacers}
          {childCols.map((col, colIndex) => (
            <td
              key={col.key}
              className={cx('flotable__child-cell', colIndex === 0 && 'flotable__child-cell--first')}
            >
              {renderCell(col, child)}
            </td>
          ))}
          {trailingSpacer}
        </tr>,
      );
    });

    if (isRequest && initialFetchedRef.current && rows.length === 0 && !loading && !error) {
      body.push(
        <tr key="child-empty" className="flotable__child-row flotable__child-state-row">
          {fullWidthCell(<span className="flotable__child-state">No items</span>)}
        </tr>,
      );
    }
  }

  if (isRequest && error) {
    body.push(
      <tr key="child-error" className="flotable__child-row flotable__child-state-row">
        {fullWidthCell(
          <div className="flotable__child-state flotable__child-state--error">
            <span>{error}</span>
            <button
              type="button"
              className="flotable__child-retry"
              onClick={() => fetchPage(initialFetchedRef.current ? nextPageRef.current : 1)}
            >
              Retry
            </button>
          </div>,
        )}
      </tr>,
    );
  }

  if ((hasMore || (isRequest && loading && initialFetchedRef.current)) && !error) {
    body.push(
      <tr key="child-sentinel" className="flotable__child-row flotable__child-sentinel-row">
        {fullWidthCell(
          loading ? <span className="flotable__child-state">Loading…</span> : null,
          (el) => {
            sentinelRef.current = el;
          },
        )}
      </tr>,
    );
  }

  const widthsValid = !!columnWidths && columnWidths.length === colSpan;

  return (
    <tr
      className={cx('flotable__child-scroll-row', expanded && 'flotable__child-scroll-row--expanded')}
      aria-hidden={expanded ? undefined : true}
    >
      <td className="flotable__child-fullspan" colSpan={colSpan}>
        <div className="flotable__child-collapser">
          <div className="flotable__child-collapser-inner">
            <div className="flotable__child-scroll" ref={viewportRef}>
              <table
                className="flotable__child-table"
                style={{ tableLayout: widthsValid ? 'fixed' : 'auto' }}
              >
                {widthsValid && (
                  <colgroup>
                    {columnWidths!.map((w, i) => (
                      // Last column is left flexible so it absorbs the vertical scrollbar width
                      // (otherwise the fixed widths overflow and add a horizontal scrollbar).
                      <col
                        key={i}
                        style={i === columnWidths!.length - 1 ? undefined : { width: `${w}px` }}
                      />
                    ))}
                  </colgroup>
                )}
                <tbody>{body}</tbody>
              </table>
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
}
