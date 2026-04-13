import type { FloTableClassNames, FloTableStyles } from '../../FloTable.types';
import { cx } from '../../../utils/cx';
import './TableBodyEmpty.css';

interface TableBodyEmptyProps {
  columns: number;
  classNames?: FloTableClassNames;
  styles?: FloTableStyles;
}

export function TableBodyEmpty({ columns, classNames, styles }: TableBodyEmptyProps) {
  return (
    <tbody className={cx('flotable__body', classNames?.body)} style={styles?.body}>
      <tr className="flotable__row--empty">
        <td colSpan={columns} className="flotable__empty-cell">
          No data
        </td>
      </tr>
    </tbody>
  );
}
