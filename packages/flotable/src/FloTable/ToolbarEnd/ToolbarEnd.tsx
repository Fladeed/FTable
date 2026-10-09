import type { ReactNode } from 'react';
import type { FloTableClassNames, FloTableStyles } from '../FloTable.types';
import { cx } from '../../utils/cx';
import './ToolbarEnd.css';

interface ToolbarEndProps {
  children: ReactNode;
  classNames?: FloTableClassNames;
  styles?: FloTableStyles;
}

export function ToolbarEnd({ children, classNames, styles }: ToolbarEndProps) {
  return (
    <div className={cx('flotable__toolbar-end', classNames?.toolbarEnd)} style={styles?.toolbarEnd}>
      {children}
    </div>
  );
}
