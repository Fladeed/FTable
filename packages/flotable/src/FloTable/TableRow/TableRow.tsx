import { Fragment } from 'react';
import type { MouseEvent, KeyboardEvent } from 'react';
import type { ColumnDef, TableRowProps } from '../FloTable.types';
import { renderCell } from '../fields/renderCell';
import { RowActionsCell } from '../ActionBar/RowActionsCell/RowActionsCell';
import { rowMatchesQuery } from '../tableUtils';
import { cx } from '../../utils/cx';
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
  childColumns,
  isExpanded,
  onToggleExpand,
  expandOn = 'chevron',
  searchQuery = '',
}: TableRowProps<T, C>) {
  const isExpandable = typeof getChildren === 'function';
  const children = getChildren?.(row) ?? [];
  const hasChildren = children.length > 0;
  // When childColumns is omitted, children are assumed to share the parent row shape (C = T),
  // so the parent columns are reused to render them.
  const childCols = childColumns ?? (columns as unknown as ColumnDef<C>[]);

  const childMatches = (child: C) =>
    searchQuery !== '' && rowMatchesQuery(child, childCols, searchQuery);
  const anyMatch = hasChildren && children.some(childMatches);
  const expanded = (isExpanded ?? false) || anyMatch;

  const rowClickToggles = expandOn === 'row' && hasChildren;

  function handleRowClick(e: MouseEvent<HTMLTableRowElement>) {
    if (!rowClickToggles) return;
    if (e.target !== e.currentTarget && (e.target as HTMLElement).closest('button, input, a')) {
      return;
    }
    onToggleExpand?.();
  }

  const primaryAction = rowActions?.find(
    (a) => (a.visible?.(row) ?? true) && !(a.disabled?.(row) ?? false),
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
      if (primaryAction) {
        e.preventDefault();
        primaryAction.onClick(row);
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
                aria-label={expanded ? 'Collapse row' : 'Expand row'}
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
            {renderCell(col, row, hasChildren ? children : undefined)}
          </td>
        ))}
        {rowActions && rowActions.length > 0 && (
          <td className={cx('flotable__cell flotable__cell--actions', classNames?.cell)} style={styles?.cell}>
            <RowActionsCell actions={rowActions} row={row} moreIcon={rowActionsMoreIcon} />
          </td>
        )}
      </tr>
      {isExpandable &&
        hasChildren &&
        children.map((child, childIndex) => (
          <tr
            key={`child-${childIndex}`}
            className={cx(
              'flotable__child-row',
              expanded && 'flotable__child-row--expanded',
              childMatches(child) && 'flotable__child-row--match',
            )}
            aria-hidden={expanded ? undefined : true}
          >
            <td className="flotable__expander-cell flotable__child-spacer" aria-hidden="true" />
            {selectable && (
              <td className="flotable__checkbox-cell flotable__child-spacer" aria-hidden="true" />
            )}
            {childCols.map((col, colIndex) => (
              <td
                key={col.key}
                className={cx(
                  'flotable__child-cell',
                  colIndex === 0 && 'flotable__child-cell--first',
                )}
              >
                <div className="flotable__child-collapser">
                  <div className="flotable__child-collapser-inner">
                    <div className="flotable__child-collapser-content">{renderCell(col, child)}</div>
                  </div>
                </div>
              </td>
            ))}
            {rowActions && rowActions.length > 0 && (
              <td className="flotable__cell--actions flotable__child-spacer" aria-hidden="true" />
            )}
          </tr>
        ))}
    </Fragment>
  );
}
