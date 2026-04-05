import type { TableHeaderProps } from '../FTable.types';
import './TableHeader.css';

export function TableHeader<T extends object>({ columns }: TableHeaderProps<T>) {
  return (
    <thead className="ftable__header">
      <tr>
        {columns.map((col) => (
          <th key={col.key} className="ftable__header-cell">{col.header}</th>
        ))}
      </tr>
    </thead>
  );
}
