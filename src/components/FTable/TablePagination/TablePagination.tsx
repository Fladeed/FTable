import type { TablePaginationProps } from '../FTable.types';
import './TablePagination.css';

export function TablePagination({
  currentPage,
  totalPages,
  onPrev,
  onNext,
}: TablePaginationProps) {
  return (
    <div className="ftable-pagination">
      <button
        className="ftable-pagination__btn"
        onClick={onPrev}
        disabled={currentPage <= 1}
      >
        Prev
      </button>
      <span>
        Page {currentPage} of {totalPages}
      </span>
      <button
        className="ftable-pagination__btn"
        onClick={onNext}
        disabled={currentPage >= totalPages}
      >
        Next
      </button>
    </div>
  );
}
