import type { TablePaginationProps } from '../FTable.types';
import { cx } from '@/utils/cx';
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
      className={cx('ftable-pagination', classNames?.pagination)}
      style={styles?.pagination}
    >
      <button
        className={cx('ftable-pagination__btn', classNames?.paginationButton)}
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
        className={cx('ftable-pagination__btn', classNames?.paginationButton)}
        style={styles?.paginationButton}
        onClick={onNext}
        disabled={currentPage >= totalPages}
      >
        Next
      </button>
    </div>
  );
}
