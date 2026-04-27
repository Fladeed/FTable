import type { ReactNode } from 'react';
import type { RowAction } from '../../FloTable.types';
import { RowActionsInline } from './RowActionsInline/RowActionsInline';
import { RowActionsOverflow } from './RowActionsOverflow/RowActionsOverflow';
import './RowActionsCell.css';

interface RowActionsCellProps<T> {
  actions: RowAction<T>[];
  row: T;
  moreIcon?: ReactNode;
}

export function RowActionsCell<T>({ actions, row, moreIcon }: RowActionsCellProps<T>) {
  const visibleActions = actions.filter((a) => a.visible?.(row) ?? true);
  if (visibleActions.length <= 3) {
    return <RowActionsInline actions={visibleActions} row={row} />;
  }
  return <RowActionsOverflow actions={visibleActions} row={row} moreIcon={moreIcon} />;
}
