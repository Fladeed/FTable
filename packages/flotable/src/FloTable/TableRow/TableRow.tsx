import { Fragment, useMemo, useState } from 'react';
import type { MouseEvent, KeyboardEvent } from 'react';
import type { TableRowProps } from '../FloTable.types';
import { renderCell } from '../fields/renderCell';
import { RowActionsCell } from '../ActionBar/RowActionsCell/RowActionsCell';
import { cx } from '../../utils/cx';
import { ChildRows } from './ChildRows/ChildRows';
import './TableRow.css';

export function TableRow<T extends object, C extends object = T>({
  row,
  columns,
  rowActions,
  rowActionsMoreIcon,
  selectable,
  isSelected,
  onToggle,
  classNames,
  styles,
  getChildren,
  childRequest,
  rowHasChildren,
  childPageSize = 5,
  childRowKey = 'id',
  childColumns,
  isExpanded,
  onToggleExpand,
  expandOn = 'chevron',
  searchQuery = '',
  colSpan,
  columnWidths,
  childRowsLabels,
}: TableRowProps<T, C>) {
  const isRequestChildren = typeof childRequest === 'function';
  const isExpandable = typeof getChildren === 'function' || isRequestChildren;

  const eagerChildren = useMemo(
    () => (isRequestChildren ? [] : getChildren?.(row) ?? []),
    [isRequestChildren, getChildren, row],
  );
  const hasChildren = isRequestChildren
    ? rowHasChildren
      ? rowHasChildren(row)
      : true
    : eagerChildren.length > 0;

  // Search auto-expansion is folded into `isExpanded` by FloTable, so the chevron always reflects
  // (and toggles) one source of truth.
  const expanded = isExpanded ?? false;

  // Children are mounted on first expand and kept afterwards (for the collapse animation).
  const [hasOpened, setHasOpened] = useState(expanded);
  if (expanded && !hasOpened) setHasOpened(true);

  const rowClickToggles = expandOn === 'row' && hasChildren;
  const hasActions = !!rowActions && rowActions.length > 0;

  function handleRowClick(e: MouseEvent<HTMLTableRowElement>) {
    if (!rowClickToggles) return;
    if (e.target !== e.currentTarget && (e.target as HTMLElement).closest('button, input, a')) {
      return;
    }
    onToggleExpand?.();
  }

  // Enter runs the first visible, enabled, non-destructive action — never a `danger` one
  // (e.g. Delete), since a stray keypress must not destroy data. Without one, Enter toggles.
  const primaryAction = rowActions?.find(
    (a) => !a.danger && (a.visible?.(row) ?? true) && !(a.disabled?.(row) ?? false),
  );

  function handleRowKeyDown(e: KeyboardEvent<HTMLTableRowElement>) {
    if (e.target !== e.currentTarget) return;
    if (e.key === 'ArrowRight') {
      if (hasChildren && !expanded) {
        e.preventDefault();
        onToggleExpand?.();
      }
    } else if (e.key === 'ArrowLeft') {
      if (hasChildren && expanded) {
        e.preventDefault();
        onToggleExpand?.();
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (primaryAction) {
        primaryAction.onClick(row);
      } else {
        onToggleExpand?.();
      }
    }
  }

  return (
    <Fragment>
      <tr
        className={cx(
          'flotable__row',
          isSelected && 'flotable__row--selected',
          rowClickToggles && 'flotable__row--expandable-click',
          classNames?.row,
        )}
        style={styles?.row}
        aria-expanded={hasChildren ? expanded : undefined}
        tabIndex={isExpandable && hasChildren ? 0 : undefined}
        onClick={rowClickToggles ? handleRowClick : undefined}
        onKeyDown={isExpandable && hasChildren ? handleRowKeyDown : undefined}
      >
        {isExpandable && (
          <td className="flotable__expander-cell" style={styles?.cell}>
            {hasChildren && (
              <button
                type="button"
                className={cx('flotable__expander-btn', expanded && 'flotable__expander-btn--expanded')}
                aria-label={
                  expanded
                    ? childRowsLabels?.collapse ?? 'Collapse row'
                    : childRowsLabels?.expand ?? 'Expand row'
                }
                aria-expanded={expanded}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleExpand?.();
                }}
              >
                <span className="flotable__expander-chevron" aria-hidden="true" />
              </button>
            )}
          </td>
        )}
        {selectable && (
          <td className="flotable__checkbox-cell" style={styles?.cell}>
            <input
              type="checkbox"
              checked={isSelected ?? false}
              onChange={onToggle}
              aria-label="Select row"
            />
          </td>
        )}
        {columns.map((col) => (
          <td key={col.key} className={cx('flotable__cell', classNames?.cell)} style={styles?.cell}>
            {renderCell(col, row, eagerChildren.length > 0 ? eagerChildren : undefined)}
          </td>
        ))}
        {hasActions && (
          <td className={cx('flotable__cell flotable__cell--actions', classNames?.cell)} style={styles?.cell}>
            <RowActionsCell actions={rowActions!} row={row} moreIcon={rowActionsMoreIcon} />
          </td>
        )}
      </tr>
      {isExpandable && hasChildren && hasOpened && (
        <ChildRows
          parentRow={row}
          expanded={expanded}
          columns={columns}
          childColumns={childColumns}
          eagerChildren={eagerChildren}
          childRequest={childRequest}
          childPageSize={childPageSize}
          childRowKey={childRowKey}
          colSpan={colSpan ?? columns.length + 1}
          selectable={selectable}
          hasActions={hasActions}
          searchQuery={searchQuery}
          columnWidths={columnWidths}
          labels={childRowsLabels}
          classNames={classNames}
          styles={styles}
        />
      )}
    </Fragment>
  );
}
