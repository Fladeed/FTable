import type { FTableClassNames, FTableStyles } from '../../FTable.types';
import { cx } from '../../../utils/cx';
import './TableBodyEmpty.css';

interface TableBodyEmptyProps {
  columns: number;
  classNames?: FTableClassNames;
  styles?: FTableStyles;
}

export function TableBodyEmpty({ columns, classNames, styles }: TableBodyEmptyProps) {
  return (
    <tbody className={cx('ftable__body', classNames?.body)} style={styles?.body}>
      <tr className="ftable__row--empty">
        <td colSpan={columns} className="ftable__empty-cell">
          No data
        </td>
      </tr>
    </tbody>
  );
}
