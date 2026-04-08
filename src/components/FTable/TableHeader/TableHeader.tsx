import type { TableHeaderProps } from '../FTable.types';
import { SortIndicator } from '../SortIndicator/SortIndicator';
import './TableHeader.css';

export function TableHeader<T extends object>({ columns, sortState, onSort }: TableHeaderProps<T>) {
  return (
    <thead className="ftable__header">
      <tr>
        {columns.map((col) => {
          const isSortable = col.sortable !== false;
          const activeDirection = sortState?.key === col.key ? sortState.direction : null;
          return (
            <th
              key={col.key}
              className={`ftable__header-cell${isSortable ? ' ftable__header-cell--sortable' : ''}${activeDirection ? ' ftable__header-cell--sorted' : ''}`}
              onClick={isSortable ? () => onSort(col.key) : undefined}
              aria-sort={activeDirection === 'asc' ? 'ascending' : activeDirection === 'desc' ? 'descending' : undefined}
            >
              <span className="ftable__header-cell-content">
                {col.header}
                {isSortable && <SortIndicator direction={activeDirection} />}
              </span>
            </th>
          );
        })}
      </tr>
    </thead>
  );
}
