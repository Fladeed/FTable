import type { FTableClassNames, FTableStyles } from '../../FTable.types';
import { cx } from '../../../utils/cx';
import './TableBodyError.css';

interface TableBodyErrorProps {
  columns: number;
  message: string;
  classNames?: FTableClassNames;
  styles?: FTableStyles;
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
    <tbody className={cx('ftable__body', classNames?.body)} style={styles?.body}>
      <tr className="ftable__row--error">
        <td colSpan={columns} className="ftable__error-cell">
          <div className="ftable__error-content">
            <span className="ftable__error-message">{message}</span>
            {onRetry && (
              <button type="button" className="ftable__retry-btn" onClick={onRetry}>
                Retry
              </button>
            )}
          </div>
        </td>
      </tr>
    </tbody>
  );
}
