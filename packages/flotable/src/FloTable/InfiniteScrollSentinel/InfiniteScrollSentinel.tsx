import { useEffect, useRef } from 'react';
import type { FloTableClassNames, FloTableStyles } from '../FloTable.types';
import { cx } from '../../utils/cx';
import './InfiniteScrollSentinel.css';

interface InfiniteScrollSentinelProps {
  onLoadMore: () => void;
  isLoading: boolean;
  isExhausted: boolean;
  loadingLabel?: string;
  endLabel?: string;
  classNames?: FloTableClassNames;
  styles?: FloTableStyles;
}

export function InfiniteScrollSentinel({
  onLoadMore,
  isLoading,
  isExhausted,
  loadingLabel = 'Loading…',
  endLabel,
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
        <div className="flotable-infinite-scroll__loading" role="status">
          <span className="flotable-infinite-scroll__spinner" aria-hidden="true" />
          {loadingLabel}
        </div>
      )}
      {isExhausted && !isLoading && endLabel && (
        <div className="flotable-infinite-scroll__end">{endLabel}</div>
      )}
    </div>
  );
}
