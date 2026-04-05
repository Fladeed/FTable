import type { TableRowProps } from '../FTable.types';
import './TableRow.css';

export function TableRow<T extends object>({ row, columns }: TableRowProps<T>) {
  return (
    <tr className="ftable__row">
      {columns.map((col) => (
        <td key={col.key} className="ftable__cell">
          {String((row as Record<string, unknown>)[col.key] ?? '')}
        </td>
      ))}
    </tr>
  );
}
