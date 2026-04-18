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
  if (actions.length <= 3) {
    return <RowActionsInline actions={actions} row={row} />;
  }
  return <RowActionsOverflow actions={actions} row={row} moreIcon={moreIcon} />;
}
