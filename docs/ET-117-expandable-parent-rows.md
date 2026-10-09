# ET-117 — FloTable: expandable parent rows with inline child rows

## Overview

Add a generic "expandable parent rows" pattern to FloTable: each top-level row may be a
**parent** that expands inline to reveal a set of **child** rows. The motivating use case is a
product-variants listing (one row per product, a chevron expands to show variants), but the
feature is generic — any row that represents a group with sub-items.

Must work in **both data mode and request mode**, add **zero runtime dependencies** (flotable
stays zero-dep), and ship with a README example plus a runnable demo page.

## Problem

FloTable currently renders a flat list: `FloTable → TableBody → TableRow → renderCell(col, row)`.
There is no concept of nested/child rows, no expansion state, no chevron affordance, no aggregate
column rendering, and no row-level keyboard handling. We need to add all of this without breaking
the existing flat-table behavior (every new prop is optional; absence of `getChildren` = today's
behavior, byte-for-byte).

### Key constraints & how they're handled

- **Filtering is consumer-owned.** In data mode the consumer filters and passes already-filtered
  parent rows; the table only holds UI state and sees the raw `__search__` query in `quickFilters`.
  → The table itself runs a built-in case-insensitive substring match of the `__search__` query
  against each child's (child-)column values to decide **auto-expand** and **highlight**. No new
  consumer API needed for v1.
- **Animating `<tr>` height inside a `<table>` is fragile.** → Child rows live in a single
  full-width container `<tr>` whose content sits in a CSS-grid collapser animated via
  `grid-template-rows: 0fr → 1fr`. Pure CSS, no JS height measurement, preserves scroll position.
- **`childColumns` may differ from parent columns.** → Children render in a nested
  `<table class="flotable__child-table">` inside the container cell, reusing `renderCell`.

### Decisions made (previously open questions, resolved with best judgment)

1. **Animation:** CSS `grid-template-rows 0fr→1fr` collapser (pure CSS, robust, scroll-safe).
2. **Child match for search:** built-in substring matcher over child column values reading the
   reserved `__search__` query. No extra consumer prop in v1.
3. **Demo scope:** README example **and** a new `apps/demo` page (matches repo conventions —
   one demo page per feature).
4. **Chevron placement:** a dedicated **leading** expander column (standard Ant/MUI pattern,
   cleaner than the trailing chevron in the ticket's ASCII sketch; better for keyboard nav).
5. **Expand trigger:** `expandOn?: 'chevron' | 'row'` (default `'chevron'`) — satisfies the
   ticket's "clicking the chevron (or the row, configurable)".

### Assumptions

- Only **one level** of nesting (nested children, child selection, child DnD are explicitly out of
  scope per the ticket).
- Pagination counts **parents** — already true, since `data`/`totalRows` describe parent rows. No
  change needed.
- Sorting applies to **parents** — already true. Child order is whatever `getChildren` returns
  (consumer-controlled `position`). No change needed.
- This is a **purely frontend** change to a UI component package that has **no test runner and no
  existing tests**. Per the task-planner frontend rule, **`[TEST]` phases are skipped**. Each
  phase is verified with `npm run typecheck` (and `npm run build`).

## Suggested Solution

Thread an optional "expandable" capability through the existing render pipeline:

- **Types:** extend `ColumnDef` with `aggregate?`, and `FloTableBaseProps` with `getChildren`,
  `childColumns`, `defaultExpanded`, `onExpandedChange`, `expandOn`. Extend the sub-component
  prop interfaces (`TableHeaderProps`, `TableBodyProps`, `TableRowProps`) accordingly.
- **State (FloTable):** an `expandedKeys: Set<string>` of currently-expanded parent keys, seeded
  per-row from `defaultExpanded` as rows are first seen (handles pagination/async), a toggle
  handler that fires `onExpandedChange`, and a derived `searchQuery` (the `__search__` value).
- **Render:** `TableHeader` adds a leading spacer `<th>` when expandable; `TableBody` computes the
  child set per row and the effective `colSpan`; `TableRow` renders a chevron button (only when
  the row has children), and — when expandable — a sibling container `<tr>` holding the animated
  collapser with a nested child table; `renderCell` gains an `aggregate` branch used for parent
  cells that have children.
- **Search:** `TableRow` auto-expands when the search query matches any child, and adds a
  `--match` highlight class to matching child rows. User-driven expansion via `expandedKeys`
  remains independent of search auto-expand.
- **Keyboard:** the parent `<tr>` becomes focusable (`tabIndex=0`, `aria-expanded`), with
  ArrowRight/ArrowLeft to expand/collapse and Enter to fire the row's primary action (first
  `rowAction`).
- **CSS:** new `flotable__expander-*`, `flotable__child-*` classes, all under `@layer flotable`
  with `--flotable-*` custom properties and sensible fallbacks.
- **Docs:** README section + `apps/demo/src/app/expandable-rows` page with a product-variants
  example.

---

## Task Checklist

> Phases are `[DEV]` / `[DOCS]` only — purely frontend, no test runner in repo (see Assumptions).
> One commit per completed phase. Stop for approval after **each task**.

### Phase 1: Types & Public API

#### Task 1.1: Extend type definitions — ⬜ TODO

**Files to create or modify:**
- `packages/flotable/src/FloTable/FloTable.types.ts` — add new optional fields + a shared
  `ExpandableProps` shape; extend sub-component prop interfaces.

**References:**
- Existing `ColumnDef<T>` (lines 65–83), `FloTableBaseProps<T>` (225–287),
  `TableHeaderProps` (338–349), `TableBodyProps` (363–388), `TableRowProps` (351–361).
- The ticket's API sketch (`getChildren`, `childColumns`, `defaultExpanded`, `onExpandedChange`,
  column `aggregate`).

**Subtasks:**
- Add to `ColumnDef<T>`: `aggregate?: (children: T[], parentRow: T) => ReactNode;` with a JSDoc
  note that it renders **instead of** the normal cell for parent rows that have children.
- Add to `FloTableBaseProps<T>`:
  - `getChildren?: (row: T) => T[] | undefined;` (undefined/empty ⇒ no chevron).
  - `childColumns?: ColumnDef<T>[];` (optional; defaults to `columns`).
  - `defaultExpanded?: boolean | ((row: T) => boolean);` (default `false`).
  - `onExpandedChange?: (expandedKeys: string[]) => void;`
  - `expandOn?: 'chevron' | 'row';` (default `'chevron'`).
  - JSDoc each prop.
- Extend `TableHeaderProps<T>` with `expandable?: boolean;`.
- Extend `TableBodyProps<T>` with `getChildren?`, `childColumns?`, `expandedKeys?: Set<string>`,
  `onToggleExpand?: (key: string) => void`, `expandOn?`, `searchQuery?: string`,
  `defaultExpanded?` (only what `TableRow` needs — see Task 3.3).
- Extend `TableRowProps<T>` with `getChildren?`, `childColumns?`, `isExpanded?: boolean`,
  `onToggleExpand?: () => void`, `expandOn?`, `searchQuery?: string`, `colSpan?: number`,
  `rowKey?: string`.
- `npm run typecheck` passes (no consumers updated yet, so this should be green on its own).

---

### Phase 2: Expansion state & search logic (FloTable)

#### Task 2.1: Add a `rowMatchesQuery` helper — ⬜ TODO

**Files to create or modify:**
- `packages/flotable/src/FloTable/tableUtils.ts` — add a small, dependency-free matcher.

**References:**
- Existing demo `applyFilters` global-search logic (case-insensitive substring over values).
- Existing `tableUtils.ts` style (`nextSortDirection`, `columnTypeToFilterInputType`).

**Subtasks:**
- Implement `export function rowMatchesQuery<T extends object>(row: T, columns: ColumnDef<T>[], query: string): boolean`:
  - Return `false` for empty/whitespace query (caller should guard, but be safe).
  - Lowercase the query once; return `true` if any `String(row[col.key] ?? '').toLowerCase()`
    includes it. Uses `col.key` only (no custom-render text extraction in v1).
- `npm run typecheck` passes.

#### Task 2.2: Expansion state + handlers in FloTable — ⬜ TODO

**Files to create or modify:**
- `packages/flotable/src/FloTable/FloTable.tsx` — destructure new props, add expansion state,
  seeding effect, toggle handler, and derive `searchQuery`; pass props to `TableHeader`/`TableBody`.

**References:**
- Existing destructure block (lines 35–59), selection-state pattern (`selectedKeys` Set, lines 76,
  180–208), `quickFilters` derivation (148–167), `TableHeader`/`TableBody` JSX (308–337).
- `SEARCH_KEY = '__search__'` convention (filters).

**Subtasks:**
- Destructure `getChildren`, `childColumns`, `defaultExpanded = false`, `onExpandedChange`,
  `expandOn` from `props`.
- Compute `const isExpandable = typeof getChildren === 'function';`.
- Add `const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());` and a
  `seededKeysRef = useRef<Set<string>>(new Set())`.
- Add a seeding `useEffect` keyed on `data`: for each parent key not in `seededKeysRef`, mark it
  seeded and — if `resolveDefaultExpanded(row)` is true — add to `expandedKeys` (functional
  `setExpandedKeys`). `resolveDefaultExpanded` = `typeof defaultExpanded === 'function' ? defaultExpanded(row) : defaultExpanded`.
  Guard the whole effect on `isExpandable`.
- Add `handleToggleExpand(key: string)`: clone the Set, toggle membership, `setExpandedKeys`,
  then `onExpandedChange?.([...next])`.
- Derive `const searchQuery = (quickFilters['__search__'] ?? '').trim();`.
- Pass `expandable={isExpandable}` to `TableHeader`.
- Pass `getChildren`, `childColumns`, `expandedKeys`, `onToggleExpand={handleToggleExpand}`,
  `expandOn`, `searchQuery`, `defaultExpanded` to `TableBody`.
- `npm run typecheck` passes.

---

### Phase 3: Rendering pipeline

#### Task 3.1: TableHeader leading expander column — ⬜ TODO

**Files to create or modify:**
- `packages/flotable/src/FloTable/TableHeader/TableHeader.tsx` — render a leading spacer `<th>`
  when `expandable`.

**References:**
- Existing header `<tr>` and the `selectable` checkbox `<th>` (the new spacer goes **before**
  the checkbox cell, i.e. first child).

**Subtasks:**
- Accept `expandable` from props.
- When `expandable`, render `<th className="flotable__expander-cell--header" aria-hidden="true" />`
  as the first cell in the header row (before the selection checkbox cell).
- `npm run typecheck` passes.

#### Task 3.2: renderCell aggregate branch — ⬜ TODO

**Files to create or modify:**
- `packages/flotable/src/FloTable/fields/renderCell.tsx` — add optional aggregate support.

**References:**
- Existing `renderCell` signature and the `col.render` precedence branch (lines 11–17).

**Subtasks:**
- Add an optional third param: `renderCell<T>(col, row, children?: T[])`.
- At the top, if `col.aggregate && children && children.length > 0`, return
  `col.aggregate(children, row)` (takes precedence over `render`/`type` for parents with children).
- Leave all existing branches untouched; default callers (no 3rd arg) behave exactly as today.
- `npm run typecheck` passes.

#### Task 3.3: TableRow — chevron + animated child rows — ⬜ TODO

**Files to create or modify:**
- `packages/flotable/src/FloTable/TableRow/TableRow.tsx` — render the expander cell, the chevron,
  the aggregate-aware parent cells, and the sibling child-container row.

**References:**
- Existing `TableRow` body (parent `<tr>`, `renderCell(col, row)` map, actions cell).
- `cx` helper. `rowMatchesQuery` (Task 2.1). Nested-table approach from Suggested Solution.

**Subtasks:**
- Accept new props: `getChildren`, `childColumns`, `isExpanded`, `onToggleExpand`, `expandOn`,
  `searchQuery`, `colSpan`, `rowKey`.
- Compute `const children = getChildren?.(row) ?? [];` and `const hasChildren = children.length > 0;`.
- Compute `const childCols = childColumns ?? columns;`.
- Compute search match: `const q = searchQuery ?? ''; const matchingChild = (child) => q !== '' && rowMatchesQuery(child, childCols, q);`
  and `const anyMatch = hasChildren && children.some(matchingChild);`.
- Effective expansion: `const expanded = isExpanded || anyMatch;`.
- Render a leading **expander `<td>`** (only when the table is expandable — i.e. `getChildren`
  defined): if `hasChildren`, a chevron `<button>` (`aria-label`, `aria-expanded={expanded}`,
  `onClick` → `onToggleExpand`, stops propagation); else an empty placeholder cell.
- When `expandOn === 'row'` and `hasChildren`, add `onClick={onToggleExpand}` to the parent `<tr>`
  (but not when the click originates from the actions/checkbox cell — keep it simple: row click
  toggles; action buttons already `stopPropagation` via their own handlers — verify and add
  `stopPropagation` on the checkbox/actions cells if needed).
- Parent data cells: `renderCell(col, row, hasChildren ? children : undefined)` so aggregate
  columns light up only for parents with children.
- After the parent `<tr>`, when `getChildren` is defined **and** `hasChildren`, render a sibling
  container `<tr className="flotable__child-container">` with a single
  `<td colSpan={colSpan} className="flotable__child-cell">` containing:
  - `<div className={cx('flotable__child-collapser', expanded && 'flotable__child-collapser--expanded')}>`
    → `<div className="flotable__child-collapser-inner">` →
    `<table className="flotable__child-table"><tbody>` → one
    `<tr className={cx('flotable__child-row', matchingChild(child) && 'flotable__child-row--match')}>`
    per child → `childCols.map(col => <td className="flotable__child-cell-td">{renderCell(col, child)}</td>)`.
- Wrap the parent `<tr>` + container `<tr>` in a `<Fragment>` (import `Fragment`).
- `npm run typecheck` passes.

#### Task 3.4: TableBody plumbing & colSpan — ⬜ TODO

**Files to create or modify:**
- `packages/flotable/src/FloTable/TableBody/TableBody.tsx` — pass expandable props through, extend
  `colCount`, and switch the row `key` to the stable `rowKey` value.

**References:**
- Existing `colCount` computation (line 27), the `rows.map` block (68–84), `key={index}` (line 72).

**Subtasks:**
- Accept `getChildren`, `childColumns`, `expandedKeys`, `onToggleExpand`, `expandOn`, `searchQuery`,
  `defaultExpanded` from props.
- Compute `const isExpandable = typeof getChildren === 'function';` and add it into `colCount`
  (`+ (isExpandable ? 1 : 0)`), so the empty/error/skeleton `colSpan` stays correct.
- In the map, compute `const key = String(row[rowKey])` (already present) and pass to `TableRow`:
  `getChildren`, `childColumns`, `isExpanded={expandedKeys?.has(key) ?? false}`,
  `onToggleExpand={() => onToggleExpand?.(key)}`, `expandOn`, `searchQuery`, `colSpan={colCount}`,
  `rowKey`, and change `key={index}` → `key={key}` (stable key now matters for animation; keep
  `index` fallback only if `rowKey` value is empty).
- `npm run typecheck` passes.

---

### Phase 4: Styling

#### Task 4.1: Expander, chevron, child-row & animation CSS — ⬜ TODO

**Files to create or modify:**
- `packages/flotable/src/FloTable/TableRow/TableRow.css` — add expander/chevron/child styles.
- (If cleaner) a new `packages/flotable/src/FloTable/TableRow/ChildRows.css` imported by TableRow —
  decide during impl; default to appending to `TableRow.css` to match the one-css-per-component
  convention.

**References:**
- Existing `TableRow.css` (`@layer flotable`, `--flotable-*` vars with fallbacks, `.flotable__row`,
  `.flotable__cell`).

**Subtasks:**
- `.flotable__expander-cell` / `--header`: fixed narrow width (e.g. `width: 2.25rem`), centered.
- `.flotable__expander-btn`: borderless, pointer, padding; chevron via a CSS triangle or an inline
  SVG rotated with `transform: rotate(...)` and `transition: transform 0.2s ease`
  (`--expanded` ⇒ rotated). Zero-dep (no icon lib).
- `.flotable__child-collapser { display: grid; grid-template-rows: 0fr; transition: grid-template-rows var(--flotable-expand-duration, 0.25s) ease; }`
  and `.flotable__child-collapser--expanded { grid-template-rows: 1fr; }`.
- `.flotable__child-collapser-inner { overflow: hidden; }` (required for the 0fr collapse).
- `.flotable__child-container > td { padding: 0; border: 0; }` so the collapser controls spacing.
- `.flotable__child-table { width: 100%; border-collapse: collapse; }` with an **indent**
  (`--flotable-child-indent`, e.g. `padding-left: 2.5rem` on first child cell) and a visually
  distinct background / left border (`--flotable-child-bg`, `--flotable-child-border`).
- `.flotable__child-row--match`: subtle highlight (`--flotable-child-match-bg`).
- `.flotable__row[aria-expanded] { cursor: ... }` only when `expandOn === 'row'` (use a modifier
  class `flotable__row--expandable-click` added in TableRow for that case).
- Keep everything inside `@layer flotable`; every color/size behind a `--flotable-*` var + fallback.
- `npm run build` succeeds (CSS is bundled; confirms no syntax errors).

---

### Phase 5: Keyboard support

#### Task 5.1: Arrow + Enter handling on parent rows — ⬜ TODO

**Files to create or modify:**
- `packages/flotable/src/FloTable/TableRow/TableRow.tsx` — add `tabIndex`, `aria-expanded`,
  `onKeyDown`.

**References:**
- Ticket AC: "Right/Left arrow on a parent row expands/collapses; Enter activates the row's primary
  action." Existing `rowActions` prop (first action = primary).

**Subtasks:**
- When the table is expandable and `hasChildren`, set `tabIndex={0}` and `aria-expanded={expanded}`
  on the parent `<tr>` (and `role="row"` is implicit for `<tr>`).
- Add `onKeyDown`:
  - `ArrowRight` → if collapsed, `onToggleExpand()` (prevent default scroll).
  - `ArrowLeft` → if expanded, `onToggleExpand()`.
  - `Enter` → if `rowActions?.length`, call `rowActions[0].onClick(row)` (respect
    `disabled?.(row)` / `visible?.(row)` — skip if hidden/disabled).
- Ensure key handling does not fire when focus is inside the actions buttons / checkbox (check
  `e.target === e.currentTarget` for the row-level handler).
- `npm run typecheck` + `npm run build` pass.

---

### Phase 6: Documentation & demo

#### Task 6.1: README section — ⬜ TODO

**Files to create or modify:**
- `packages/flotable/README.md` — add an "Expandable rows (parent / child)" section.

**References:**
- Existing README structure (Quick Start, Request Mode, Column Types, Props Reference). Match tone
  and code-fence style.

**Subtasks:**
- Add a runnable TSX example using the product-variants scenario from the ticket: `getChildren`,
  optional `childColumns`, an `aggregate` column (`"N variants"`, price range), `showSearch` to
  demonstrate auto-expand, `expandOn`/`defaultExpanded`.
- Add the new props to the **Common Props** subsection table (`getChildren`, `childColumns`,
  `defaultExpanded`, `onExpandedChange`, `expandOn`, column `aggregate`).

#### Task 6.2: Demo page — ⬜ TODO

**Files to create or modify:**
- `apps/demo/src/app/expandable-rows/page.tsx` — new route.
- `apps/demo/src/components/ExpandableRowsDemo/ExpandableRowsDemo.tsx` (+ a `…DemoData.ts`) — the
  demo component & sample product/variant data.
- `apps/demo/src/components/DemoNav/DemoNav.tsx` — add a nav link.

**References:**
- An existing feature demo for structure/conventions (e.g. `RowActionsDemo`, `FilterModeDemo`,
  `BulkActionsDemo`) and how `DemoNav` lists pages. The demo `applyFilters`/`demoUtils` for data
  mode wiring.

**Subtasks:**
- Build a product-variants dataset (products with `variants[]`, each variant SKU/option/price/stock).
- Render `<FloTable>` in **data mode** with `getChildren`, `childColumns`, an `aggregate` column,
  `showSearch`, and `expandOn` toggled via a small control to showcase both triggers.
- Add the route + nav entry; verify it renders (`npm run dev` in `apps/demo`, manual check).
- (Optional, if time) a second instance in **request mode** to demonstrate parity.
```
