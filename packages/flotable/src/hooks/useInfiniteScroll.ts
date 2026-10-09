import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';

export interface UseInfiniteScrollOptions {
  /** Whether more items can be loaded. The observer is detached while false. */
  enabled: boolean;
  /** Called when the sentinel scrolls into view. */
  onLoadMore: () => void;
  /** Scroll container used as the observer root. Omit to observe against the viewport. */
  rootRef?: RefObject<Element | null>;
  /** Distance before the sentinel at which loading starts. Defaults to `'0px 0px 80px 0px'`. */
  rootMargin?: string;
  /**
   * Re-observes the sentinel when it changes (e.g. the rendered item count), so loading continues
   * if the sentinel is still in view after a batch is appended.
   */
  resetKey?: unknown;
}

/**
 * Infinite scroll via `IntersectionObserver`: attach the returned ref to a sentinel element
 * placed after the last item, and `onLoadMore` fires whenever it scrolls into view.
 */
export function useInfiniteScroll<S extends Element = HTMLDivElement>({
  enabled,
  onLoadMore,
  rootRef,
  rootMargin = '0px 0px 80px 0px',
  resetKey,
}: UseInfiniteScrollOptions): RefObject<S | null> {
  const sentinelRef = useRef<S | null>(null);
  const onLoadMoreRef = useRef(onLoadMore);
  onLoadMoreRef.current = onLoadMore;

  useEffect(() => {
    const el = sentinelRef.current;
    if (!enabled || !el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) onLoadMoreRef.current();
      },
      { root: rootRef?.current ?? null, rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [enabled, rootRef, rootMargin, resetKey]);

  return sentinelRef;
}
