import type { TablePaginationProps } from '../FloTable.types';
import { GoToPage } from './GoToPage/GoToPage';
import { cx } from '../../utils/cx';
import './TablePagination.css';

export function TablePagination({
  currentPage,
  totalPages,
  onPrev,
  onNext,
  onGoToPage,
  showPageInput = false,
  labels,
  classNames,
  styles,
}: TablePaginationProps) {
  const prevLabel = labels?.prev ?? 'Prev';
  const nextLabel = labels?.next ?? 'Next';
  const pageInfo = labels?.pageInfo ?? ((c, t) => `Page ${c} of ${t}`);

  // `suppressHydrationWarning` on the pagination controls:
  // In `request` mode, `currentPage` / `totalPages` derive from the async
  // result of the consumer's request function. The promise resolves on a
  // microtask, which React 19's concurrent hydration may interleave with
  // the hydration commit on the client — so the page-info text and the
  // boolean `disabled` state can be reported as mismatched against the
  // SSR-rendered HTML even though both server and client renders are
  // individually correct. The divergence is intentional and self-healing
  // (the post-fetch state replaces the SSR state immediately after
  // hydration), so we silence the warning here rather than gating the
  // fetch behind an extra render cycle that would visibly delay data.
  return (
    <div
      className={cx('flotable-pagination', classNames?.pagination)}
      style={styles?.pagination}
    >
      <button
        className={cx('flotable-pagination__btn', classNames?.paginationButton)}
        style={styles?.paginationButton}
        onClick={onPrev}
        disabled={currentPage <= 1}
        suppressHydrationWarning
      >
        {prevLabel}
      </button>
      <span suppressHydrationWarning>{pageInfo(currentPage, totalPages)}</span>
      <button
        className={cx('flotable-pagination__btn', classNames?.paginationButton)}
        style={styles?.paginationButton}
        onClick={onNext}
        disabled={currentPage >= totalPages}
        suppressHydrationWarning
      >
        {nextLabel}
      </button>
      {showPageInput && (
        <GoToPage
          currentPage={currentPage}
          totalPages={totalPages}
          onGoToPage={onGoToPage}
          label={labels?.goToPage}
          buttonLabel={labels?.goBtn}
        />
      )}
    </div>
  );
}
