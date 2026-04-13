import type { TablePaginationProps } from '../FloTable.types';
import { cx } from '../../utils/cx';
import './TablePagination.css';

export function TablePagination({
  currentPage,
  totalPages,
  onPrev,
  onNext,
  classNames,
  styles,
}: TablePaginationProps) {
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
        Prev
      </button>
      <span>
        Page {currentPage} of {totalPages}
      </span>
      <button
        className={cx('flotable-pagination__btn', classNames?.paginationButton)}
        style={styles?.paginationButton}
        onClick={onNext}
        disabled={currentPage >= totalPages}
      >
        Next
      </button>
    </div>
  );
}
