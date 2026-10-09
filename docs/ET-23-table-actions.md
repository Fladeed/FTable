# ET-23 — Table-level actions in the FloTable toolbar

Jira: https://fladeed.atlassian.net/browse/ET-23 (parent epic ET-5)
Branch: `feat/ET-23-table-actions`

## Overview

TajirPro (the main FloTable consumer) is moving each list page's primary action ("New refund", "New product", ...) out of the page header and into the table toolbar, on the end side next to the filter pills. FloTable needs a first-class slot for actions that do not depend on row selection: a new `tableActions` prop rendered by a new `TableActions` component inside `.flotable-toolbar`.

## Problem

- `renderInlineBulkActions` is the only way to put custom content in the toolbar today. It always receives the selection context, so it reads as a bulk-action slot.
- The toolbar (`.flotable-toolbar`) is only rendered when there is a search pill, a filter pill, built-in bulk actions or an inline bulk renderer. A table with only a "New …" button gets no toolbar at all.

### Assumptions and gaps (please confirm)

1. **Component location.** The old ticket text pointed at `src/components/FTable/ActionBar/ActionBar.tsx`, which no longer matches the repo. The new component goes in the existing `ActionBar/` grouping folder, next to `BulkActionBar/`: `packages/flotable/src/FloTable/ActionBar/TableActions/TableActions.{tsx,css}`.
2. **Empty array = not set.** `tableActions={[]}` is treated the same as omitting the prop: no toolbar is forced and no `TableActions` DOM is rendered. This keeps "no new DOM" true for consumers that build the array conditionally.
3. **"Link it from the demo home like the other pages".** The other demo pages are linked from the sidebar (`DemoNav` `TABS`), not from the home page body. The new page is linked the same way: a "Table Actions" entry in `DemoNav`.
4. **README "token table" does not exist yet.** The CSS Custom Properties section only has a short example. A "Table actions" section is added with its own prop table and a token table listing the new `--flotable-table-action-*` tokens.
5. **README has no `renderInlineBulkActions` section.** The pointer to `tableActions` goes into a new `renderInlineBulkActions` row in the Common Props table. That table also gets a `tableActions` row.
6. **Two identical READMEs.** `README.md` (repo root) and `packages/flotable/README.md` are identical today and there is no copy step in the build. Both are updated with the same text.
7. **Version.** The package is at `0.1.11` on master after `fast bump (#22)`. The patch bump makes it `0.1.12`, done in the same PR as previous features (e.g. #17, #18, #19).
8. **Plan doc.** Past branches committed the plan doc and deleted it later (e.g. `Delete docs/ET-110-…`). This doc is committed on the branch, and you can drop it before merging.
9. **No automated tests.** This is a purely frontend change (a presentational component plus wiring), and the package has no test runner. Per the task-planner rules, there are no `[TEST]` phases. Verification is `npm run typecheck`, `npm run build`, and a manual check of the demo in LTR and RTL.
10. **Possible conflict.** Open PR #20 (ET-112, responsive primitives) touches the toolbar. Whichever lands second needs a small rebase in `FloTable.tsx` / `FloTable.css`.
11. **Translatable strings.** `TableActions` renders no built-in text. Only the consumer's `label` and `ariaLabel` appear, so no new `*Labels` prop is needed.

## Suggested Solution

### Public API (`FloTable.types.ts`)

```ts
/** A table-level action rendered at the end of the toolbar. Independent of row selection. */
export interface TableAction {
  key: string;
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  /** 'primary' for the page's main action (one per table), 'default' otherwise. Defaults to 'default'. */
  variant?: 'primary' | 'default';
  /** Accessible name when the label alone is not enough. Defaults to `label`. */
  ariaLabel?: string;
}
```

- `FloTableBaseProps.tableActions?: TableAction[]` is on the base props, so data mode and request mode both get it.
- New slots `tableActions`, `tableAction` and `tableActionPrimary` are added to `FloTableClassNames` and `FloTableStyles`. They are typed and documented like the `bulkActionBar*` slots.
- `TableAction` is exported from `src/index.ts`.

### Component (`ActionBar/TableActions/TableActions.tsx`)

```tsx
<div class="flotable-table-actions {classNames.tableActions}" style={styles.tableActions}>
  <button type="button"
          class="flotable-table-actions__btn [flotable-table-actions__btn--primary] {classNames.tableAction} [{classNames.tableActionPrimary}]"
          style={{ ...styles.tableAction, ...(primary ? styles.tableActionPrimary : {}) }}
          aria-label={ariaLabel ?? label}
          disabled={disabled}
          onClick={onClick}>
    {icon && <span class="flotable-table-actions__icon" aria-hidden="true">{icon}</span>}
    {label}
  </button>
</div>
```

- `onClick` is called with no arguments, so there is no row or selection context.
- The `disabled` attribute is set only from `action.disabled`. Selection state is never read.
- Class names are combined with the existing `cx` helper. Styles are merged so the primary-specific style wins over the generic style, which matches how `classNames` stack.

### Wiring (`FloTable.tsx`)

- `const hasTableActions = (tableActions?.length ?? 0) > 0;`
- The toolbar condition becomes `(hasFilterBar || (!hasCustomBar && hasBulkActions) || hasInlineBar || hasTableActions)`. When `hasTableActions` is false, the expression and DOM are unchanged.
- `<TableActions …/>` is rendered as the last child of `.flotable-toolbar`, after `renderInlineBulkActions(...)`, and only when `hasTableActions` is true.

### Styling (`TableActions.css`, inside `@layer flotable`)

- `.flotable-toolbar > .flotable-table-actions { flex: 0 0 auto; margin-inline-start: auto; }` goes in `FloTable.css`, next to the existing `.flotable-toolbar > .flotable-bulk-bar` rule. It pushes the actions to the end side in both LTR and RTL.
- New tokens. Each fallback chains to an existing shared token where one exists, so themed tables pick up the theme automatically:

| Token | Fallback |
|---|---|
| `--flotable-table-action-gap` | `0.5rem` |
| `--flotable-table-action-radius` | `var(--flotable-row-action-radius, 4px)` |
| `--flotable-table-action-padding` | `0.375rem 0.75rem` |
| `--flotable-table-action-font-size` | `var(--flotable-font-size, 0.875rem)` |
| `--flotable-table-action-color` | `var(--flotable-row-action-color, #374151)` |
| `--flotable-table-action-bg` | `var(--flotable-bg, #ffffff)` |
| `--flotable-table-action-border-color` | `var(--flotable-border-color, #e5e7eb)` |
| `--flotable-table-action-hover-bg` | `var(--flotable-row-action-hover-bg, #f3f4f6)` |
| `--flotable-table-action-hover-color` | `var(--flotable-row-action-hover-color, #111827)` |
| `--flotable-table-action-primary-bg` | `#2563eb` |
| `--flotable-table-action-primary-color` | `#ffffff` |
| `--flotable-table-action-primary-border-color` | `var(--flotable-table-action-primary-bg, #2563eb)` |
| `--flotable-table-action-primary-hover-bg` | `#1d4ed8` |
| `--flotable-table-action-focus-ring` | `#2563eb` |

- `:focus-visible` adds a 2px outline in `--flotable-table-action-focus-ring` with a 2px offset. `:disabled` sets `opacity: 0.4; cursor: not-allowed` and skips the hover styles, the same as the bulk bar.
- No HTML tag selectors, no Tailwind, no inline styles except the consumer-provided `styles` slots.

### Why this is safe

The change is additive and opt-in. Consumers that do not pass `tableActions` go through exactly the same code paths, render the same toolbar condition and get no new elements. The pattern (component in `ActionBar/`, `classNames`/`styles` slots, `cx`, `@layer flotable`, token fallbacks) mirrors `BulkActionBar`.

## Task Checklist

### Phase 1: [DEV] Component and wiring (package)

#### Task 1.1: Types and public export [10 min] — ⬜ TODO

**Files to create or modify:**
- `packages/flotable/src/FloTable/FloTable.types.ts`: add the `TableAction` interface, the `tableActions` prop on `FloTableBaseProps`, and the three new slots on `FloTableClassNames` and `FloTableStyles`.
- `packages/flotable/src/index.ts`: export the `TableAction` type.

**References:** `BulkAction`, `FloTableClassNames.bulkActionBar*`, `FloTableStyles.bulkActionBar*`.

**Subtasks:**
- [ ] Add the `TableAction` interface (key, label, icon?, onClick: () => void, disabled?: boolean, variant?: 'primary' | 'default', ariaLabel?) with JSDoc on every field, and state the defaults (`variant` defaults to `'default'`, `ariaLabel` defaults to `label`).
- [ ] Add `tableActions?: TableAction[]` to `FloTableBaseProps`, right after `renderInlineBulkActions`. Its JSDoc says the actions render at the end of the toolbar, are independent of selection, and force the toolbar to render.
- [ ] Extend the `renderInlineBulkActions` JSDoc with "For actions that do not depend on selection, use `tableActions`."
- [ ] Add `tableActions` (container `<div>`), `tableAction` (each `<button>`) and `tableActionPrimary` (added to the `variant: 'primary'` button) to `FloTableClassNames`, with JSDoc.
- [ ] Add the same three keys as `FloTableStyleValue` to `FloTableStyles`.
- [ ] Export `TableAction` from `src/index.ts`.

#### Task 1.2: `TableActions` component and CSS [20 min] — ⬜ TODO

**Files to create or modify:**
- `packages/flotable/src/FloTable/ActionBar/TableActions/TableActions.tsx` (new)
- `packages/flotable/src/FloTable/ActionBar/TableActions/TableActions.css` (new)

**References:** `ActionBar/BulkActionBar/BulkActionBar.tsx` and `.css`, `utils/cx.ts`.

**Subtasks:**
- [ ] `TableActions` takes `{ actions: TableAction[]; classNames?: FloTableClassNames; styles?: FloTableStyles }` and is a named export.
- [ ] It renders a container `<div className={cx('flotable-table-actions', classNames?.tableActions)} style={styles?.tableActions}>`.
- [ ] For each action it renders a `<button type="button" key={action.key}>` with:
  - `className={cx('flotable-table-actions__btn', isPrimary && 'flotable-table-actions__btn--primary', classNames?.tableAction, isPrimary && classNames?.tableActionPrimary)}`
  - `style`: `styles?.tableAction` merged with `styles?.tableActionPrimary` when the action is primary, or `undefined` when neither is set
  - `aria-label={action.ariaLabel ?? action.label}`, `disabled={action.disabled ?? false}`, and `onClick={() => action.onClick()}`
- [ ] Render the icon as `<span className="flotable-table-actions__icon" aria-hidden="true">` before the label, and only when `action.icon != null`.
- [ ] Write the CSS inside `@layer flotable` using the token table above: a flex container with `--flotable-table-action-gap` and `flex-wrap: wrap`, default button styles, primary modifier, hover (`:hover:not(:disabled)`), `:focus-visible` outline, `:disabled` dimming, and an icon span that is `inline-flex`. Use BEM classes only.

#### Task 1.3: Wire into `FloTable` [10 min] — ⬜ TODO

**Files to create or modify:**
- `packages/flotable/src/FloTable/FloTable.tsx`: destructure `tableActions`, compute `hasTableActions`, extend the toolbar condition, and render `<TableActions>` last in the toolbar.
- `packages/flotable/src/FloTable/FloTable.css`: add the `.flotable-toolbar > .flotable-table-actions` rule (`flex: 0 0 auto; margin-inline-start: auto;`).

**References:** the existing toolbar block and the `.flotable-toolbar > .flotable-bulk-bar` rule.

**Subtasks:**
- [ ] Add `tableActions` to the props destructure.
- [ ] Add `const hasTableActions = (tableActions?.length ?? 0) > 0;` next to `hasInlineBar`.
- [ ] Append `|| hasTableActions` to the toolbar render condition.
- [ ] Render `{hasTableActions && <TableActions actions={tableActions!} classNames={classNames} styles={styles} />}` after the `renderInlineBulkActions` call.
- [ ] Run `npm run typecheck` and `npm run build` at the root. Both must pass.
- [ ] Byte-for-byte check: with `tableActions` undefined or `[]`, the toolbar condition and children are identical to master. This is verified by reading the diff, since the new branch is fully guarded by `hasTableActions`.

**End of Phase 1:** one commit `feat(ET-23): add tableActions prop and TableActions toolbar component`.

### Phase 2: [DEV] Demo page

#### Task 2.1: `TableActionsDemo` and route [25 min] — ⬜ TODO

**Files to create or modify:**
- `apps/demo/src/app/table-actions/page.tsx` (new): a thin page that mounts `<TableActionsDemo />`.
- `apps/demo/src/components/TableActionsDemo/TableActionsDemo.tsx` and `TableActionsDemo.css` (new): the page shell, title and subtitle, and the shared section styles.
- `apps/demo/src/components/TableActionsDemo/TableActionsDemoData.ts` (new): columns, filter defs, seed rows, and a `useTableState` hook (data-mode simulation using `applySorting` and `applyFilters` from `utils/demoUtils`).
- `apps/demo/src/components/TableActionsDemo/TableActionsSection/TableActionsSection.tsx` (new): one reusable section `{ title, description, direction, withFilters }` that renders a `FloTable` with `tableActions`, plus a feedback line showing the last action clicked.
- `apps/demo/src/components/DemoNav/DemoNav.tsx`: add `{ href: '/table-actions', label: 'Table Actions' }` after "Bulk Actions".

**References:** `BulkActionsDemo` (page shell, section pattern, data hook), `RtlDemo` (RTL sample labels).

**Subtasks:**
- [ ] Define the actions: primary "Add row" with an inline SVG plus icon, which appends a demo row and shows feedback, and a default "Export", which shows feedback.
- [ ] Section 1, LTR with filter pills: `showSearch`, `filterDefs`, `selectable` and `bulkActions`, so you can confirm the actions stay enabled while rows are selected and the BulkActionBar is visible.
- [ ] Section 2, LTR without filter pills: only `tableActions`, which proves the toolbar renders when actions are the only toolbar content.
- [ ] Section 3, RTL with filter pills: `direction="rtl"` with Arabic labels for the actions and pills, so the actions sit on the left (end) side.
- [ ] Section 4, RTL without filter pills.
- [ ] Keep it inline and simple. There are no layout hacks, per the demo style preference.
- [ ] Run `npm run build` at the root (it builds the demo too) and check the page in `npm run dev` in both directions.

**End of Phase 2:** one commit `feat(ET-23): add table-actions demo page`.

### Phase 3: [DOCS] / [CONFIG] README and version

#### Task 3.1: README updates (both copies) [15 min] — ⬜ TODO

**Files to create or modify:**
- `README.md` and `packages/flotable/README.md`, kept identical.

**Subtasks:**
- [ ] Add a `## Table Actions` section after "Column Types". It contains a one-paragraph explanation (end-side toolbar, independent of selection, mirrors in RTL, forces the toolbar), a `TableAction` field table (field, type, default, description), a TSX example with a primary "New product" and a default "Export", the styling slots (`classNames` / `styles` keys `tableActions`, `tableAction`, `tableActionPrimary`), and a token table listing every `--flotable-table-action-*` token with its fallback.
- [ ] In **Props Reference → Common Props**, add a `tableActions` row and a `renderInlineBulkActions` row. The second one's description ends with "For selection-independent actions use `tableActions`."
- [ ] Add `/table-actions` to any demo page list in the README, if one exists.

#### Task 3.2: Version bump [2 min] — ⬜ TODO

**Files to create or modify:**
- `packages/flotable/package.json`: `0.1.11` → `0.1.12`.
- `package-lock.json`: update the workspace entry for `packages/flotable`, if the lockfile records its version.

**Subtasks:**
- [ ] Bump the version and run `npm install --package-lock-only` only if the lockfile carries the workspace version, to keep the lockfile consistent.
- [ ] Run `npm run typecheck` and `npm run build` at the root one last time.

**End of Phase 3:** one commit `docs(ET-23): document tableActions; bump flotable to 0.1.12`.

### Phase 4: Delivery

#### Task 4.1: PR, skill ticket, tarball [15 min] — ⬜ TODO

**Subtasks:**
- [ ] Push `feat/ET-23-table-actions` and open a PR against `master` titled `feat(ET-23): table-level actions in the FloTable toolbar`. The body covers the summary, API, files, the byte-for-byte guarantee and how to test.
- [ ] Create the skill follow-up ticket under ET-1 (Task, label `flotable-skill`) titled `[Skill] Update flotable skill — tableActions prop for toolbar actions`. It must be self-contained: API, files, tokens, slots, which skill sections to update, and the PR link.
- [ ] Add the skill ticket to `MEMORY.md`. ET-23 stays In Progress until the PR is merged.
- [ ] Run `cd packages/flotable && npm run build && npm pack`, check that the `.tgz` is not tracked (add `*.tgz` to `.gitignore` only if you approve), and print its absolute path.
