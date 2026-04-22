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
      >
        {prevLabel}
      </button>
      <span>{pageInfo(currentPage, totalPages)}</span>
      <button
        className={cx('flotable-pagination__btn', classNames?.paginationButton)}
        style={styles?.paginationButton}
        onClick={onNext}
        disabled={currentPage >= totalPages}
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
