import type { TableRowProps } from '../FTable.types';
import { renderCell } from '../fields/renderCell';
import './TableRow.css';

export function TableRow<T extends object>({ row, columns }: TableRowProps<T>) {
  return (
    <tr className="ftable__row">
      {columns.map((col) => (
        <td key={col.key} className="ftable__cell">
          {renderCell(col, row)}
        </td>
      ))}
    </tr>
  );
}
