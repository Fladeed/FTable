import type { FloTableClassNames, FloTableStyles } from '../../FloTable.types';
import { cx } from '../../../utils/cx';
import './TableBodyError.css';

interface TableBodyErrorProps {
  columns: number;
  message: string;
  classNames?: FloTableClassNames;
  styles?: FloTableStyles;
  onRetry?: () => void;
}

export function TableBodyError({
  columns,
  message,
  classNames,
  styles,
  onRetry,
}: TableBodyErrorProps) {
  return (
    <tbody className={cx('flotable__body', classNames?.body)} style={styles?.body}>
      <tr className="flotable__row--error">
        <td colSpan={columns} className="flotable__error-cell">
          <div className="flotable__error-content">
            <span className="flotable__error-message">{message}</span>
            {onRetry && (
              <button type="button" className="flotable__retry-btn" onClick={onRetry}>
                Retry
              </button>
            )}
          </div>
        </td>
      </tr>
    </tbody>
  );
}
