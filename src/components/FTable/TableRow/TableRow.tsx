import type { TableRowProps } from '../FTable.types';
import { renderCell } from '../fields/renderCell';
import { cx } from '@/utils/cx';
import './TableRow.css';

export function TableRow<T extends object>({
  row,
  columns,
  classNames,
  styles,
}: TableRowProps<T>) {
  return (
    <tr className={cx('ftable__row', classNames?.row)} style={styles?.row}>
      {columns.map((col) => (
        <td key={col.key} className={cx('ftable__cell', classNames?.cell)} style={styles?.cell}>
          {renderCell(col, row)}
        </td>
      ))}
    </tr>
  );
}
