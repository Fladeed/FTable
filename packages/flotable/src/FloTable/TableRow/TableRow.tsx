import type { TableRowProps } from '../FloTable.types';
import { renderCell } from '../fields/renderCell';
import { RowActionsCell } from '../ActionBar/RowActionsCell/RowActionsCell';
import { cx } from '../../utils/cx';
import './TableRow.css';

export function TableRow<T extends object>({
  row,
  columns,
  rowActions,
  rowActionsMoreIcon,
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
      {rowActions && rowActions.length > 0 && (
        <td className={cx('flotable__cell flotable__cell--actions', classNames?.cell)} style={styles?.cell}>
          <RowActionsCell actions={rowActions} row={row} moreIcon={rowActionsMoreIcon} />
        </td>
      )}
    </tr>
  );
}
