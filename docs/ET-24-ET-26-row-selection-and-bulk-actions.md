# ET-24 + ET-26 — Row Selection & Bulk Actions

## Overview

Add row selection via checkboxes (ET-24) and a contextual bulk-action bar (ET-26) to `FloTable` in the `flotable` package. Row selection is a prerequisite for bulk actions; both ship in a single branch.

## Problem

`FloTable` has no concept of row selection or bulk operations. Consumers cannot let users select multiple rows and run cross-row actions (delete, export, assign, etc.).

## Suggested Solution

- Add `BulkAction<T>`, `selectable`, `rowKey`, `onSelectionChange`, and `bulkActions` to `FloTable.types.ts`.
- Thread selection state (`Set<string>` of row keys, managed internally in `FloTable`) down through `TableHeader` → `TableBody` → `TableRow`.
- `TableHeader` renders a leading `<th>` with an indeterminate-capable checkbox that toggles select-all / deselect-all for the current page.
- `TableRow` renders a leading `<td>` checkbox; selected rows get a CSS-custom-property highlight (`--ftable-row-selected-bg`).
- `BulkActionBar` is a new component under `ActionBar/BulkActionBar/`. It is always in the DOM when `bulkActions` is provided, toggling a `--visible` CSS class to drive a CSS-only slide/fade (no JS animation library). It shows a "{N} rows selected" counter, the bulk action buttons, and a "Clear selection" button.
- When selection is non-empty `FilterBar` is suppressed; when empty it is shown again.
- Selection is cleared on page navigation.
- A new `/bulk-actions` demo page exercises both features.

## Task Checklist

### Phase 1 [DEV]: Row selection system (ET-24)

#### Task 1.1: Add types for row selection and bulk actions [15 min] — ⬜ TODO

**Files to create or modify:**
- `packages/flotable/src/FloTable/FloTable.types.ts` — add `BulkAction<T>`, selection props to base props, extend internal component prop interfaces
- `packages/flotable/src/index.ts` — export `BulkAction`

**References:**
- Existing `RowAction<T>` interface — `BulkAction<T>` mirrors its shape, only `onClick` differs (`T[]` vs `T`)

**Subtasks:**
- [ ] Add `BulkAction<T>` interface: `key: string`, `label: string`, `icon?: ReactNode`, `onClick: (selectedRows: T[]) => void`, `disabled?: (selectedRows: T[]) => boolean`, `danger?: boolean`
- [ ] Add to `FloTableBaseProps<T>`: `selectable?: boolean`, `rowKey?: string`, `onSelectionChange?: (selectedKeys: string[]) => void`, `bulkActions?: BulkAction<T>[]`
- [ ] Add to `TableHeaderProps<T>`: `selectable?: boolean`, `selectionState?: 'none' | 'some' | 'all'`, `onToggleAll?: () => void`
- [ ] Add to `TableBodyProps<T>`: `selectable?: boolean`, `selectedKeys?: Set<string>`, `rowKey?: string`, `onToggleRow?: (key: string) => void`
- [ ] Add to `TableRowProps<T>`: `selectable?: boolean`, `isSelected?: boolean`, `onToggle?: () => void`
- [ ] Export `BulkAction` from `packages/flotable/src/index.ts`

---

#### Task 1.2: Update TableHeader with checkbox column [20 min] — ⬜ TODO

**Files to create or modify:**
- `packages/flotable/src/FloTable/TableHeader/TableHeader.tsx` — add leading `<th>` checkbox when `selectable` is true
- `packages/flotable/src/FloTable/TableHeader/TableHeader.css` — style `.flotable__checkbox-cell--header`

**References:**
- `packages/flotable/src/FloTable/TableHeader/TableHeader.css` — existing header cell styles and CSS variable pattern
- `packages/flotable/src/FloTable/ActionBar/RowActionsCell/RowActionsInline/RowActionsInline.tsx` — checkbox input pattern

**Subtasks:**
- [ ] Accept `selectable`, `selectionState`, `onToggleAll` from the updated `TableHeaderProps`
- [ ] Add a leading `<th className="flotable__checkbox-cell flotable__checkbox-cell--header">` before all data-column `<th>` elements, rendered only when `selectable` is true
- [ ] Inside that `<th>`, render `<input type="checkbox">` with a `useRef`; use `useEffect` to set `inputRef.current.indeterminate = selectionState === 'some'`; `checked` when `selectionState === 'all'`; `onChange` calls `onToggleAll`; `aria-label="Select all rows"`
- [ ] In `TableHeader.css`, add `.flotable__checkbox-cell` with `width: 2.5rem; text-align: center; cursor: default;` and ensure the cell is not treated as sortable (no hover/cursor change)

---

#### Task 1.3: Update TableRow with checkbox cell and selection highlight [20 min] — ⬜ TODO

**Files to create or modify:**
- `packages/flotable/src/FloTable/TableRow/TableRow.tsx` — add leading `<td>` checkbox when `selectable`; add `--selected` modifier class
- `packages/flotable/src/FloTable/TableRow/TableRow.css` — add `.flotable__row--selected` using `--ftable-row-selected-bg`

**References:**
- `packages/flotable/src/FloTable/TableRow/TableRow.css` — existing hover style with CSS variable pattern
- `packages/flotable/src/FloTable/TableRow/TableRow.tsx` — existing `<tr>` class composition via `cx()`

**Subtasks:**
- [ ] Accept `selectable`, `isSelected`, `onToggle` from the updated `TableRowProps`
- [ ] Apply `flotable__row--selected` class to `<tr>` when `isSelected` is true (via `cx()`)
- [ ] Add a leading `<td className="flotable__checkbox-cell">` before all data cells when `selectable` is true; render `<input type="checkbox" checked={isSelected} onChange={onToggle} aria-label="Select row" />`
- [ ] In `TableRow.css` inside `@layer flotable`, add `.flotable__row--selected { background-color: var(--ftable-row-selected-bg, #eff6ff); }` — ensure it takes precedence over hover by specificity or ordering

---

#### Task 1.4: Update TableBody and TableBodySkeleton [15 min] — ⬜ TODO

**Files to create or modify:**
- `packages/flotable/src/FloTable/TableBody/TableBody.tsx` — pass selection props to `<TableRow>`; add `+1` to `colCount` when `selectable`
- `packages/flotable/src/FloTable/TableBody/TableBodySkeleton/TableBodySkeleton.tsx` — render extra leading skeleton cell when `selectable`

**References:**
- `packages/flotable/src/FloTable/TableBody/TableBody.tsx` — existing `colCount` pattern for error/empty states
- `packages/flotable/src/FloTable/TableBody/TableBodySkeleton/TableBodySkeleton.tsx` — existing skeleton cell rendering

**Subtasks:**
- [ ] Accept `selectable`, `selectedKeys`, `rowKey`, `onToggleRow` in `TableBody` (already added to `TableBodyProps` in Task 1.1)
- [ ] Update `colCount` to `columns.length + (hasActions ? 1 : 0) + (selectable ? 1 : 0)`
- [ ] Pass `selectable`, `isSelected={selectedKeys?.has(String(row[rowKey as keyof T]))}`, and `onToggle={() => onToggleRow?.(String(row[rowKey as keyof T]))}` to each `<TableRow>`
- [ ] Pass `selectable` to `<TableBodySkeleton>`
- [ ] In `TableBodySkeleton`, add `selectable?: boolean` to its local props interface; when true, prepend a leading `<td className="flotable__checkbox-cell flotable__cell--skeleton" />` in each skeleton row

---

#### Task 1.5: Wire selection state in FloTable [25 min] — ⬜ TODO

**Files to create or modify:**
- `packages/flotable/src/FloTable/FloTable.tsx` — destructure new props, manage `selectedKeys` state, compute `selectionState`, thread down

**References:**
- `packages/flotable/src/FloTable/FloTable.tsx` — existing `useState` / `useEffect` state management pattern

**Subtasks:**
- [ ] Destructure `selectable`, `rowKey = 'id'`, `onSelectionChange`, `bulkActions` from `props`
- [ ] Add `const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set())`
- [ ] Implement `handleToggleRow(key: string)`: clone the set, toggle the key, call `setSelectedKeys` and `onSelectionChange?.([...next])`
- [ ] Implement `handleToggleAll()`: if all current-page row keys are in `selectedKeys` → deselect all (new empty Set); otherwise → select all current-page row keys; call `setSelectedKeys` and `onSelectionChange`
- [ ] Compute `selectionState: 'none' | 'some' | 'all'` from `selectedKeys` vs resolved `data`
- [ ] Add `useEffect(() => { setSelectedKeys(new Set()); }, [page])` to clear selection on page change
- [ ] Pass `selectable`, `selectionState`, `onToggleAll={handleToggleAll}` to `<TableHeader>`
- [ ] Pass `selectable`, `selectedKeys`, `rowKey`, `onToggleRow={handleToggleRow}` to `<TableBody>`

---

### Phase 2 [DEV]: BulkActionBar (ET-26)

#### Task 2.1: Create BulkActionBar component [30 min] — ⬜ TODO

**Files to create or modify:**
- `packages/flotable/src/FloTable/ActionBar/BulkActionBar/BulkActionBar.tsx` — new component
- `packages/flotable/src/FloTable/ActionBar/BulkActionBar/BulkActionBar.css` — slide/fade animation, button styles

**References:**
- `packages/flotable/src/FloTable/ActionBar/RowActionsCell/RowActionsInline/RowActionsInline.tsx` — action button rendering pattern (danger, disabled, icon)
- `packages/flotable/src/FloTable/ActionBar/RowActionsCell/RowActionsInline/RowActionsInline.css` — CSS variable names for buttons

**Subtasks:**
- [ ] Define local `BulkActionBarProps<T>`: `actions: BulkAction<T>[]`, `selectedRows: T[]`, `onClearSelection: () => void`, `isVisible: boolean`
- [ ] Render `<div className={cx('flotable-bulk-bar', isVisible && 'flotable-bulk-bar--visible')}>` as root
- [ ] Inside root: render `<span className="flotable-bulk-bar__count">{selectedRows.length} row{selectedRows.length !== 1 ? 's' : ''} selected</span>`
- [ ] Render `<div className="flotable-bulk-bar__actions">` containing action buttons: for each `action`, render `<button>` with `disabled={action.disabled?.(selectedRows) ?? false}`, danger class when `action.danger`, `onClick={() => action.onClick(selectedRows)}`; render icon (if provided) or label text
- [ ] Render a "Clear selection" `<button className="flotable-bulk-bar__clear">` that calls `onClearSelection`
- [ ] In `BulkActionBar.css` (inside `@layer flotable`):
  - `.flotable-bulk-bar`: `display: flex; align-items: center; gap: 0.75rem; padding: 0; overflow: hidden; max-height: 0; opacity: 0; transition: max-height 0.25s ease, opacity 0.2s ease, padding 0.25s ease;`
  - `.flotable-bulk-bar--visible`: `max-height: 3rem; opacity: 1; padding: 0 0 0.75rem 0;`
  - `.flotable-bulk-bar__count`: muted secondary text color
  - `.flotable-bulk-bar__actions`: `display: flex; gap: 0.5rem; align-items: center;`
  - Action button styles mirroring `RowActionsInline` CSS variables; danger variant uses `--flotable-danger-color`
  - `.flotable-bulk-bar__clear`: neutral ghost button style

---

#### Task 2.2: Integrate BulkActionBar into FloTable [20 min] — ⬜ TODO

**Files to create or modify:**
- `packages/flotable/src/FloTable/FloTable.tsx` — import and render `BulkActionBar`; gate `FilterBar` on no selection

**References:**
- `packages/flotable/src/FloTable/FloTable.tsx` — `<FilterBar>` render block

**Subtasks:**
- [ ] Import `BulkActionBar` from `./ActionBar/BulkActionBar/BulkActionBar`
- [ ] Compute `selectedRows: T[]` by filtering resolved `data` using `selectedKeys` and `rowKey`
- [ ] Implement `clearSelection()`: `setSelectedKeys(new Set())`, `onSelectionChange?.([])`
- [ ] Render `<BulkActionBar>` directly above `<div className="flotable-wrapper">` when `bulkActions` is a non-empty array (always rendered for CSS animation; `isVisible={selectedKeys.size > 0}`); pass `actions={bulkActions}`, `selectedRows`, `onClearSelection={clearSelection}`
- [ ] Wrap `<FilterBar>` render in `{selectedKeys.size === 0 && <FilterBar .../>}` so it is suppressed while selection is active

---

#### Task 2.3: Add demo page and nav link [20 min] — ⬜ TODO

**Files to create or modify:**
- `apps/demo/src/app/bulk-actions/page.tsx` — new Next.js route
- `apps/demo/src/components/BulkActionsDemo/BulkActionsDemo.tsx` — demo component
- `apps/demo/src/components/BulkActionsDemo/BulkActionsDemo.css` — demo shell styles
- `apps/demo/src/components/DemoNav/DemoNav.tsx` — add nav entry

**References:**
- `apps/demo/src/app/row-actions/page.tsx` — minimal page wrapper pattern
- `apps/demo/src/components/RowActionsDemo/RowActionsDemo.tsx` — demo component structure with feedback state
- `apps/demo/src/components/Demo/Demo.tsx` — Employee data, columns, `FloTable` controlled-mode wiring
- `apps/demo/src/components/DemoNav/DemoNav.tsx` — `TABS` array

**Subtasks:**
- [ ] Create `apps/demo/src/app/bulk-actions/page.tsx`: import and render `<BulkActionsDemo />`
- [ ] Create `BulkActionsDemo.tsx` (mark `'use client'`): reuse `Employee` type and `ALL_DATA`/`COLUMNS` from `Demo.tsx`; add `selectable={true}`, `rowKey="id"`, `onSelectionChange={(keys) => console.log('Selected:', keys)}`; add `bulkActions` with two entries — `{ key: 'delete', label: 'Delete Selected', danger: true, onClick: (rows) => alert(\`Delete \${rows.length} rows\`) }` and `{ key: 'export', label: 'Export Selected', onClick: (rows) => console.log('Export', rows) }`
- [ ] Create `BulkActionsDemo.css`: copy shell styles from `RowActionsDemo.css` with a `bulk-actions-demo` prefix
- [ ] Add `{ href: '/bulk-actions', label: 'Bulk Actions' }` to `TABS` in `DemoNav.tsx`
