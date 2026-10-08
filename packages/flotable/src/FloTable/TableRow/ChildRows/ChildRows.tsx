import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode, RefObject } from 'react';
import type { ChildRowsProps, ColumnDef } from '../../FloTable.types';
import { useInfiniteScroll } from '../../../hooks/useInfiniteScroll';
import { renderCell } from '../../fields/renderCell';
import { rowMatchesQuery } from '../../tableUtils';
import { cx } from '../../../utils/cx';
import './ChildRows.css';

/**
 * Renders one parent's children inside a single full-width cell, as a fixed-height **scroll box**
 * containing a nested table whose column widths are synced to the parent's (via `columnWidths`),
 * so the child cells stay aligned under the parent headers while scrolling internally.
 *
 * Two data modes, both with infinite scroll (the scroll box is the observer root):
 *  - data mode    (`getChildren`): in-memory children revealed in batches of `childPageSize`.
 *  - request mode (`childRequest`): first batch fetched on expand, next batch fetched & appended
 *    as you scroll — with a loading skeleton and error / retry. Children are re-fetched whenever
 *    the parent row object changes (e.g. after the table refetches), so they never go stale.
 */
export function ChildRows<T extends object, C extends object = T>({
  parentRow,
  closing = false,
  onClosed,
  cache,
  cacheKey,
  columns,
  childColumns,
  eagerChildren,
  childRequest,
  childPageSize,
  childRowKey,
  colSpan,
  selectable,
  hasActions,
  searchQuery = '',
  columnWidths,
  childRowsLabels,
  labels,
}: ChildRowsProps<T, C>) {
  const isRequest = typeof childRequest === 'function';
  const childCols = childColumns ?? (columns as unknown as ColumnDef<C>[]);

  // Request mode: start from the table-level cache when it still belongs to this parent row object.
  const cachedEntry = cacheKey !== undefined ? cache?.get(cacheKey) : undefined;
  const cached = isRequest && cachedEntry?.parentRow === parentRow ? cachedEntry : undefined;

  const [loaded, setLoaded] = useState<C[]>(() => cached?.data ?? []);
  const [total, setTotal] = useState(() => cached?.total ?? 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(childPageSize);

  const requestIdRef = useRef(0);
  const nextPageRef = useRef(cached?.nextPage ?? 1);
  const failedPageRef = useRef(1);
  const initialFetchedRef = useRef(!!cached);
  // The parent row object the current (or in-flight) first page was requested for.
  const fetchedForRef = useRef<T | null>(cached ? parentRow : null);
  // The parent row object `loaded` belongs to.
  const loadedForRef = useRef<T | null>(cached ? parentRow : null);
  const loadingRef = useRef(false);
  loadingRef.current = loading;

  // Read through refs so an inline `childRequest` doesn't change `fetchPage` on every render.
  const childRequestRef = useRef(childRequest);
  childRequestRef.current = childRequest;
  const parentRowRef = useRef(parentRow);
  parentRowRef.current = parentRow;

  const fetchPage = useCallback(
    (pageNum: number) => {
      const request = childRequestRef.current;
      if (!request) return;
      const id = ++requestIdRef.current;
      setLoading(true);
      setError(null);
      const forRow = parentRowRef.current;
      request(forRow, { page: pageNum, pageSize: childPageSize })
        .then((res) => {
          if (id !== requestIdRef.current) return;
          loadedForRef.current = forRow;
          setLoaded((prev) => (pageNum === 1 ? res.data : [...prev, ...res.data]));
          setTotal(res.totalRows);
          nextPageRef.current = pageNum + 1;
          initialFetchedRef.current = true;
        })
        .catch((err: unknown) => {
          if (id !== requestIdRef.current) return;
          failedPageRef.current = pageNum;
          setError(err instanceof Error ? err.message : String(err));
        })
        .finally(() => {
          if (id === requestIdRef.current) setLoading(false);
        });
    },
    [childPageSize],
  );

  // Fetch the first page on expand (unless cached), and again whenever the parent row changes.
  useEffect(() => {
    if (!isRequest || closing || fetchedForRef.current === parentRow) return;
    fetchedForRef.current = parentRow;
    fetchPage(1);
  }, [isRequest, closing, parentRow, fetchPage]);

  // Keep the cache in sync with what has been loaded, so it survives collapsing (unmount).
  useEffect(() => {
    if (!isRequest || !cache || cacheKey === undefined || !initialFetchedRef.current) return;
    cache.set(cacheKey, {
      parentRow: loadedForRef.current,
      data: loaded,
      total,
      nextPage: nextPageRef.current,
    });
  }, [isRequest, cache, cacheKey, loaded, total]);

  const childMatches = (child: C) =>
    searchQuery !== '' && rowMatchesQuery(child, childCols, searchQuery);

  // Data mode: always reveal up to the last search match, so a match is never hidden past the batch.
  const lastMatchIndex = useMemo(() => {
    if (isRequest || searchQuery === '') return -1;
    for (let i = eagerChildren.length - 1; i >= 0; i--) {
      if (rowMatchesQuery(eagerChildren[i], childCols, searchQuery)) return i;
    }
    return -1;
  }, [isRequest, eagerChildren, childCols, searchQuery]);
  const shownCount = Math.max(visibleCount, lastMatchIndex + 1);

  const rows = isRequest ? loaded : eagerChildren.slice(0, shownCount);
  const hasMore = isRequest
    ? initialFetchedRef.current && loaded.length < total
    : shownCount < eagerChildren.length;

  const loadMore = () => {
    if (loadingRef.current) return;
    if (isRequest) {
      if (loaded.length >= total) return;
      fetchPage(nextPageRef.current);
    } else {
      setVisibleCount(Math.min(shownCount + childPageSize, eagerChildren.length));
    }
  };

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useInfiniteScroll<HTMLDivElement>({
    enabled: hasMore && !closing,
    onLoadMore: loadMore,
    rootRef: viewportRef,
    resetKey: rows.length,
  });

  const childKeyOf = (child: C, index: number) => {
    const value = String((child as Record<string, unknown>)[childRowKey] ?? '');
    return value || String(index);
  };
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

  const fullWidthCell = (content: ReactNode, ref?: RefObject<HTMLDivElement | null>) => (
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
              {renderCell(col, child, undefined, labels)}
            </td>
          ))}
          {trailingSpacer}
        </tr>,
      );
    });

    if (isRequest && initialFetchedRef.current && rows.length === 0 && !loading && !error) {
      body.push(
        <tr key="child-empty" className="flotable__child-row flotable__child-state-row">
          {fullWidthCell(<span className="flotable__child-state">{childRowsLabels?.empty ?? 'No items'}</span>)}
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
              onClick={() => fetchPage(failedPageRef.current)}
            >
              {childRowsLabels?.retry ?? 'Retry'}
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
          loading ? <span className="flotable__child-state">{childRowsLabels?.loading ?? 'Loading…'}</span> : null,
          sentinelRef,
        )}
      </tr>,
    );
  }

  // Closing: the collapse keyframe plays, then `onClosed` lets the parent unmount us. The box is
  // `inert` meanwhile so its buttons can't be focused. If animations are disabled (no keyframe
  // applied), close immediately.
  const collapserRef = useRef<HTMLDivElement | null>(null);
  const onClosedRef = useRef(onClosed);
  onClosedRef.current = onClosed;
  useEffect(() => {
    const el = collapserRef.current;
    if (!el) return;
    el.inert = closing;
    if (closing && getComputedStyle(el).animationName === 'none') onClosedRef.current?.();
  }, [closing]);

  const widthsValid = !!columnWidths && columnWidths.length === colSpan;

  return (
    <tr
      className={cx('flotable__child-scroll-row', closing && 'flotable__child-scroll-row--closing')}
      aria-hidden={closing || undefined}
    >
      <td className="flotable__child-fullspan" colSpan={colSpan}>
        <div
          className="flotable__child-collapser"
          ref={collapserRef}
          onAnimationEnd={(e) => {
            if (closing && e.target === e.currentTarget) onClosed?.();
          }}
        >
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
