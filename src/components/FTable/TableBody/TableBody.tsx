import type { TableBodyProps } from '../FTable.types';
import { TableRow } from '../TableRow/TableRow';
import './TableBody.css';

export function TableBody<T extends object>({ columns, rows }: TableBodyProps<T>) {
  return (
    <tbody className="ftable__body">
      {rows.length === 0 ? (
        <tr className="ftable__row--empty">
          <td colSpan={columns.length} className="ftable__empty-cell">
            No data
          </td>
        </tr>
      ) : (
        rows.map((row, index) => (
          <TableRow key={index} row={row} columns={columns} />
        ))
      )}
    </tbody>
  );
}
