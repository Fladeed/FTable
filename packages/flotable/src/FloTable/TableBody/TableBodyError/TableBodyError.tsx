import type { FloTableClassNames, FloTableStyles } from '../../FloTable.types';
import { cx } from '../../../utils/cx';
import './TableBodyError.css';

interface TableBodyErrorProps {
  columns: number;
  message: string;
  /** Retry button text. Defaults to `'Retry'`. */
  retryLabel?: string;
  classNames?: FloTableClassNames;
  styles?: FloTableStyles;
  onRetry?: () => void;
}

export function TableBodyError({
  columns,
  message,
  retryLabel = 'Retry',
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
                {retryLabel}
              </button>
            )}
          </div>
        </td>
      </tr>
    </tbody>
  );
}
