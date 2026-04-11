import type { TableBodyProps } from '../FTable.types';
import { TableRow } from '../TableRow/TableRow';
import { cx } from '../../utils/cx';
import './TableBody.css';

export function TableBody<T extends object>({
  columns,
  rows,
  classNames,
  styles,
}: TableBodyProps<T>) {
  return (
    <tbody className={cx('ftable__body', classNames?.body)} style={styles?.body}>
      {rows.length === 0 ? (
        <tr className="ftable__row--empty">
          <td colSpan={columns.length} className="ftable__empty-cell">
            No data
          </td>
        </tr>
      ) : (
        rows.map((row, index) => (
          <TableRow
            key={index}
            row={row}
            columns={columns}
            classNames={classNames}
            styles={styles}
          />
        ))
      )}
    </tbody>
  );
}
