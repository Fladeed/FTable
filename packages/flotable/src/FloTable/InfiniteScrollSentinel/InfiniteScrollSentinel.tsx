import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import type { FloTableClassNames, FloTableStyles } from '../FloTable.types';
import { cx } from '../../utils/cx';
import './InfiniteScrollSentinel.css';

interface InfiniteScrollSentinelProps {
  onLoadMore: () => void;
  isLoading: boolean;
  isExhausted: boolean;
  loadingLabel?: string;
  endLabel?: string;
  renderLoading?: () => ReactNode;
  renderEnd?: () => ReactNode;
  classNames?: FloTableClassNames;
  styles?: FloTableStyles;
}

export function InfiniteScrollSentinel({
  onLoadMore,
  isLoading,
  isExhausted,
  loadingLabel = 'Loading…',
  endLabel,
  renderLoading,
  renderEnd,
  classNames,
  styles,
}: InfiniteScrollSentinelProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const onLoadMoreRef = useRef(onLoadMore);

  useEffect(() => {
    onLoadMoreRef.current = onLoadMore;
  }, [onLoadMore]);

  useEffect(() => {
    if (isExhausted) return;
    if (typeof IntersectionObserver === 'undefined') return;
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && !isLoading) {
          onLoadMoreRef.current();
        }
      },
      { rootMargin: '200px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [isLoading, isExhausted]);

  return (
    <div
      className={cx('flotable-infinite-scroll', classNames?.infiniteScroll)}
      style={styles?.infiniteScroll}
    >
      <div
        ref={sentinelRef}
        className="flotable-infinite-scroll__sentinel"
        aria-hidden="true"
      />
      {isLoading && !isExhausted && (
        renderLoading ? (
          renderLoading()
        ) : (
          <div
            className={cx('flotable-infinite-scroll__loading', classNames?.infiniteScrollLoading)}
            style={styles?.infiniteScrollLoading}
            role="status"
          >
            <span
              className={cx('flotable-infinite-scroll__spinner', classNames?.infiniteScrollSpinner)}
              style={styles?.infiniteScrollSpinner}
              aria-hidden="true"
            />
            {loadingLabel}
          </div>
        )
      )}
      {isExhausted && !isLoading && (renderEnd ? (
        renderEnd()
      ) : endLabel ? (
        <div
          className={cx('flotable-infinite-scroll__end', classNames?.infiniteScrollEnd)}
          style={styles?.infiniteScrollEnd}
        >
          {endLabel}
        </div>
      ) : null)}
    </div>
  );
}
