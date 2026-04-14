import type { TableRowProps } from '../FloTable.types';
import { renderCell } from '../fields/renderCell';
import { cx } from '../../utils/cx';
import './TableRow.css';

export function TableRow<T extends object>({
  row,
  columns,
  classNames,
  styles,
}: TableRowProps<T>) {
  return (
    <tr className={cx('flotable__row', classNames?.row)} style={styles?.row}>
      {columns.map((col) => (
        <td key={col.key} className={cx('flotable__cell', classNames?.cell)} style={styles?.cell}>
          {renderCell(col, row)}
        </td>
      ))}
    </tr>
  );
}
