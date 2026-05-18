# ET-112 — FloTable: Responsive Primitives for Mobile

Jira: https://fladeed.atlassian.net/browse/ET-112
Parent epic: [ET-5](https://fladeed.atlassian.net/browse/ET-5)

## Overview

Add responsive primitives to FloTable so consumers (starting with TajirPro web + Capacitor mobile build) get a usable table experience on phone-width screens without rewriting consuming components. This is a prerequisite for TajirPro's mobile-readiness work (TPRO-315) and tracked here because FloTable is an owned library shipped independently.

## Problem

FloTable currently assumes desktop-class widths:

- The table is rendered inside a single `flotable-wrapper` that horizontally scrolls when content overflows — fine on desktop, painful on phones.
- The toolbar (filter bar + bulk bar) is a normal block; it scrolls out of view as the user pans the data rows.
- Active filter pills `flex-wrap` onto multiple rows; on narrow widths the toolbar can grow several lines tall.
- Columns have no priority metadata — every column is always rendered.
- Interactive elements (sort handles, pagination buttons, filter pill triggers, the row-action overflow `⋯`) use compact desktop sizes (28–32px) that fail Apple/Google touch-target guidelines (44×44 minimum).

We need to ship opt-in responsive primitives that fix these gaps without changing default behavior for existing consumers.

### Design decisions (confirmed with user)

| Question | Choice |
|---|---|
| Breakpoint detection | JS via `matchMedia` driven by a `mobileBreakpoint?: number` prop (default `640`). |
| Column priority API | Numeric `priority?: number` on `ColumnDef`. Lower priority hides first when width is constrained. |
| Card / stack view | Auto-derived from columns by default; optional `renderCard?: (row) => ReactNode` for full control. |
| Pill overflow | `ResizeObserver` measures pills inside `FilterBar`; overflowing pills collapse into a `+N more` trigger that opens a portal-anchored popover (mirrors the `RowActionsOverflow` pattern). |
| Infinite scroll | Auto-activates on mobile in request mode only. Sentinel + `IntersectionObserver`. Pagination bar is hidden when active. |

### Assumptions

- The card view is opt-in via a new prop (`mobileVariant?: 'auto' | 'card' | 'table'`, default `'auto'` which means "stay as table"). Existing consumers see no change.
- Pill overflow always runs when `FilterBar` is rendered (no extra prop needed); it's purely a layout improvement, never hides filters from the user.
- 44px touch targets are applied via CSS custom properties that fall back to current desktop sizes; below the breakpoint, the component sets new fallback values on its root element.
- The `priority` API uses the rule: when `useResponsive()` returns `isMobile=true`, columns with `priority` strictly less than `mobileColumnPriority` (new prop, default `2`) are hidden in `TableHeader`/`TableRow` rendering. Columns without `priority` get an implicit `priority = Infinity` (always visible).
- Sticky toolbar uses `position: sticky` on the existing `.flotable-toolbar` element, with `top: 0` and an opaque background. It only sticks within the parent scroll context; consumers are responsible for the outer scroll container.
- Infinite scroll activates only when `isMobile === true` AND the table is in request mode. In data mode, mobile users still see the existing pagination bar (with 44px touch targets). In request mode on desktop, pagination is unchanged.
- When infinite scroll is active: rows accumulate across pages, the `TablePagination` bar is not rendered, and a sentinel element after the last row triggers `request({ page: nextPage, ... })`. On sort / filter / page-size change, accumulated rows are reset and page is set back to 1. When the viewport transitions across the breakpoint (desktop ↔ mobile) the accumulator is also reset to page 1 to avoid mixed states.
- The published version bump is **minor** (0.1.9 → 0.2.0) per the ticket. The version bump and `MEMORY.md` update happen in the final phase. **Publishing to npm is out of scope for this PR** — the user/maintainer triggers `npm publish` separately.

## Suggested Solution

### New public props on `FloTable`

```ts
interface FloTableBaseProps<T> {
  // ...existing props
  /** Below this viewport width (px), responsive primitives activate. Default 640. */
  mobileBreakpoint?: number;
  /**
   * What rendering to use when the viewport is below `mobileBreakpoint`.
   * - 'auto' (default): keep the table layout; only column hiding + sticky toolbar + pill overflow + 44px hit areas activate.
   * - 'card': switch the data rows to a stacked card layout. Toolbar stays.
   * - 'table': force the desktop table layout regardless of width (opt-out).
   */
  mobileVariant?: 'auto' | 'card' | 'table';
  /** Columns with `priority` strictly less than this are hidden on mobile. Default 2. */
  mobileColumnPriority?: number;
  /** When set, fully overrides the auto-generated card layout for a row. */
  renderCard?: (row: T, index: number) => ReactNode;
  /** When true, pins the toolbar (filter bar + bulk bar) to the top of its scroll container. Default false. */
  stickyToolbar?: boolean;
}

interface ColumnDef<T> {
  // ...existing props
  /** Higher = more important. Columns with priority < `mobileColumnPriority` are hidden on mobile. */
  priority?: number;
}
```

All defaults are backward-compatible: with no new props, the table behaves exactly as today.

### New internal pieces

- **`hooks/useMediaBreakpoint.ts`** — tiny hook wrapping `window.matchMedia(`(max-width: ${px}px)`)`. SSR-safe (returns `false` until mounted). Subscribes to `change` and returns the current boolean. Lives under `packages/flotable/src/hooks/`.
- **`FloTable/CardList/CardList.tsx` + `CardList.css`** — renders rows as stacked cards when `mobileVariant: 'card'` is active. Reuses `renderCell` for value rendering. Handles loading skeletons, empty state, error state by delegating to the existing `TableBodySkeleton`/`TableBodyEmpty`/`TableBodyError` components (rendered in card form — see Task 3.4).
- **`FloTable/filters/FilterBarOverflow/FilterBarOverflow.tsx` + `FilterBarOverflow.css`** — measures pill widths with `ResizeObserver`, computes which pills overflow, and renders a `+N more` trigger that opens a portal-positioned popover containing the overflowing pills. Mirrors `RowActionsOverflow`.
- **`FloTable/InfiniteScrollSentinel/InfiniteScrollSentinel.tsx` + `InfiniteScrollSentinel.css`** — wraps an `IntersectionObserver` on a hidden sentinel `<div>`. Props: `{ onLoadMore: () => void; isLoading: boolean; isExhausted: boolean; loadingLabel?: string; }`. Calls `onLoadMore` once per intersection (debounced via the `isLoading` guard). Renders a small in-list loading indicator while fetching.
- **CSS custom properties** for touch sizing: `--flotable-touch-min`, `--flotable-pill-min-height-mobile`, `--flotable-pagination-btn-min-height-mobile`. Default to `44px` on the root element when `useMediaBreakpoint` reports mobile.
- **Toolbar sticky CSS**: a `.flotable-toolbar--sticky` modifier class applied when `stickyToolbar` is true, with `position: sticky; top: 0; z-index: 2; background: var(--flotable-bg, #fff);`.

### Infinite scroll behavior (request mode + mobile)

Internal state changes in `FloTable.tsx`:

- Add `const isInfiniteScroll = isReqMode && isMobile;` derived value.
- Change the request-mode data effect so that:
  - When `internalPage === 1`: replace `internalData` with the response (current behavior).
  - When `internalPage > 1` AND `isInfiniteScroll`: append the response to `internalData`.
  - When `internalPage > 1` AND NOT `isInfiniteScroll`: replace (current behavior — this branch only happens if a consumer drives infinite scroll on desktop, which we don't, but be defensive).
- Add a reset effect: when `internalSortState`, `internalFilters`, `pageSize`, or `isInfiniteScroll` change, reset `internalPage` to 1 and clear `internalData`. (Already true for sort/filter today via `setInternalPage(1)` in handlers; add the same reset when `isInfiniteScroll` flips.)
- Add a guard so the sentinel does not fire while loading or when `internalData.length >= internalTotalRows`.

Rendering: when `isInfiniteScroll`, render `<InfiniteScrollSentinel ... />` after the `<table>` / `<CardList>` and skip `<TablePagination />`.

### Touch-target strategy

Add new CSS custom properties on `.flotable` root that take effect when the responsive hook reports mobile. We do this by adding a `data-flotable-mobile="true"` attribute to the root `<div>`, and writing selectors like `.flotable[data-flotable-mobile="true"] .flotable-pagination__btn { min-height: 44px; min-width: 44px; }`. Consumers can opt out by overriding the CSS variable.

### Files touched

| File | Change |
|---|---|
| `packages/flotable/src/FloTable/FloTable.types.ts` | Add new props on `FloTableBaseProps` + `priority` on `ColumnDef`. |
| `packages/flotable/src/FloTable/FloTable.tsx` | Wire new props, call `useMediaBreakpoint`, filter columns by priority on mobile, switch to `CardList` when `mobileVariant: 'card'`, apply `data-flotable-mobile` attribute, pass `stickyToolbar` down. |
| `packages/flotable/src/FloTable/FloTable.css` | Add toolbar sticky styles, mobile touch-target overrides, root data-attribute scoping. |
| `packages/flotable/src/hooks/useMediaBreakpoint.ts` (new) | Hook. |
| `packages/flotable/src/FloTable/CardList/CardList.tsx` (new) | Card / stack rendering. |
| `packages/flotable/src/FloTable/CardList/CardList.css` (new) | Card styles. |
| `packages/flotable/src/FloTable/filters/FilterBar/FilterBar.tsx` | Replace direct `.map` over `filterDefs` with `FilterBarOverflow`, which still renders `FilterPill`s but conditionally collapses overflow. |
| `packages/flotable/src/FloTable/filters/FilterBar/FilterBar.css` | Tweak to remove `flex-wrap: wrap` when overflow mode is active (so measurements are deterministic). |
| `packages/flotable/src/FloTable/filters/FilterBarOverflow/FilterBarOverflow.tsx` (new) | Overflow detection & popover. |
| `packages/flotable/src/FloTable/filters/FilterBarOverflow/FilterBarOverflow.css` (new) | Trigger button + popover styles. |
| `packages/flotable/src/FloTable/TableHeader/TableHeader.tsx` | Already receives columns; columns are pre-filtered upstream, no logic change. |
| `packages/flotable/src/FloTable/TableBody/TableBody.tsx` | Same — columns pre-filtered upstream. |
| `packages/flotable/src/FloTable/InfiniteScrollSentinel/InfiniteScrollSentinel.tsx` (new) | Sentinel + IntersectionObserver loader. |
| `packages/flotable/src/FloTable/InfiniteScrollSentinel/InfiniteScrollSentinel.css` (new) | Sentinel + loader styles. |
| `packages/flotable/src/FloTable/TablePagination/TablePagination.css` | Apply touch-target sizing under `[data-flotable-mobile]` ancestor. |
| `packages/flotable/src/FloTable/SortIndicator/SortIndicator.css` (possibly) | Ensure header tap area expands on mobile (handled at header-cell padding). |
| `packages/flotable/src/index.ts` | Export `useMediaBreakpoint` if we expose it (decision: yes, as a utility), plus updated types. |
| `packages/flotable/package.json` | Version bump 0.1.9 → 0.2.0. |
| `packages/flotable/README.md` | New "Responsive" section documenting all new props + migration note. |
| `MEMORY.md` | Add ET-112 + the follow-up skill-update ticket row. |
| `apps/demo/src/app/responsive/page.tsx` (new) | Route for the demo page. |
| `apps/demo/src/components/ResponsiveDemo/ResponsiveDemo.tsx` (new) | Demo with card view, sticky toolbar, pill overflow at 360px. |
| `apps/demo/src/components/ResponsiveDemo/ResponsiveDemo.css` (new) | Demo styles. |
| `apps/demo/src/components/ResponsiveDemo/ResponsiveDemoData.ts` (new) | Sample data with enough pills to overflow. |
| `apps/demo/src/components/DemoNav/DemoNav.tsx` | Add `/responsive` link. |

### Out of scope

- `npm publish` (maintainer triggers manually after PR merge).
- Tablet breakpoint (only mobile in this iteration).
- Virtualization for card lists (deferred — already an open question in `MEMORY.md`).
- Drag-to-reorder, swipe actions, pull-to-refresh.
- Changing `RowActionsOverflow`/`BulkActionBar`'s own touch targets beyond setting min-height on mobile (preserve their current behavior on desktop).

## Task Checklist

This is a **purely frontend** task (UI components, styles, presentational React). Per AGENTS.md and the task-planner skill rules, the `[TEST]` phases are skipped. Manual verification happens in the demo app at the end of each `[DEV]` phase.

---

### Phase 1: Core Hook + Type Extensions `[DEV]`

#### Task 1.1: Add `useMediaBreakpoint` hook — ⬜ TODO

**Files to create or modify:**
- `packages/flotable/src/hooks/useMediaBreakpoint.ts` (new)

**References:**
- No existing hooks directory — first file under `packages/flotable/src/hooks/`.
- AGENTS.md: "No external state libs", "TypeScript strict mode", "named exports only".

**Subtasks:**
- Create `packages/flotable/src/hooks/useMediaBreakpoint.ts` exporting `function useMediaBreakpoint(maxWidthPx: number): boolean` as a named export.
- Inside the hook: declare `const [matches, setMatches] = useState(false)` (SSR-safe default).
- In a `useEffect` keyed on `maxWidthPx`: if `typeof window === 'undefined'` return; create `const mql = window.matchMedia(\`(max-width: ${maxWidthPx}px)\`)`; set initial state via `setMatches(mql.matches)`; subscribe to `mql.addEventListener('change', listener)` where `listener = (e) => setMatches(e.matches)`; return cleanup `mql.removeEventListener('change', listener)`.
- Do NOT export from `index.ts` yet (decision: internal-only for now; revisit in Phase 5 if README documents it).

#### Task 1.2: Extend types — add `priority` to `ColumnDef` and new responsive props on `FloTableBaseProps` — ⬜ TODO

**Files to create or modify:**
- `packages/flotable/src/FloTable/FloTable.types.ts`

**References:**
- Existing `ColumnDef<T>` interface (line 65).
- Existing `FloTableBaseProps<T>` interface (line 203).

**Subtasks:**
- Add optional `priority?: number` to `ColumnDef<T>` with JSDoc: "Higher = more important. Columns with `priority` strictly less than `mobileColumnPriority` are hidden on mobile. Defaults to `Infinity` (always visible)."
- Add `mobileBreakpoint?: number` to `FloTableBaseProps<T>` with JSDoc default `640`.
- Add `mobileVariant?: 'auto' | 'card' | 'table'` to `FloTableBaseProps<T>` with JSDoc default `'auto'`.
- Add `mobileColumnPriority?: number` to `FloTableBaseProps<T>` with JSDoc default `2`.
- Add `renderCard?: (row: T, index: number) => ReactNode` to `FloTableBaseProps<T>` with JSDoc explaining it overrides the default card layout.
- Add `stickyToolbar?: boolean` to `FloTableBaseProps<T>` with JSDoc default `false`.
- Add the following new keys to `FloTableClassNames`: `toolbar?: string`, `card?: string`, `cardLabel?: string`, `cardValue?: string`, `filterBarOverflowTrigger?: string`, `filterBarOverflowPopover?: string` — each with a one-line JSDoc.
- Mirror the same keys in `FloTableStyles`.
- Run `pnpm --filter flotable typecheck` (or equivalent — see CONTRIBUTING.md) to confirm no type errors.

---

### Phase 2: Wire Responsive State + Column Priority Filtering `[DEV]`

#### Task 2.1: Use `useMediaBreakpoint` in `FloTable` and expose mobile state to children — ⬜ TODO

**Files to create or modify:**
- `packages/flotable/src/FloTable/FloTable.tsx`

**References:**
- Existing prop destructuring (lines 14–39).
- Existing root `<div>` return at line 220.

**Subtasks:**
- Destructure new props from `props`: `mobileBreakpoint = 640, mobileVariant = 'auto', mobileColumnPriority = 2, renderCard, stickyToolbar = false`.
- Inside the component, call `const isMobile = useMediaBreakpoint(mobileBreakpoint - 1)` (subtract 1 so the breakpoint value itself is treated as desktop).
- Compute `const responsiveColumns = isMobile ? columns.filter(c => (c.priority ?? Infinity) >= mobileColumnPriority) : columns;`.
- Replace every downstream usage of `columns` (in `TableHeader`, `TableBody`, and the card path) with `responsiveColumns`. Note: `pageRowKeys`, `autoFilterDefs`, and other logic that needs the full column list should still reference `columns`.
- On the root `<div>`, add `data-flotable-mobile={isMobile ? 'true' : undefined}` so CSS can scope touch-target overrides.
- Verify in the demo (manual): open any existing demo page, resize to <640px, confirm no behavior change yet (no priorities set yet, no card mode).

#### Task 2.2: Apply `priority` filtering in the demo's existing pages by setting `priority` on demo columns — ⬜ TODO

**Files to create or modify:**
- None in the core package.
- (Demo verification only — no code change to existing demo pages in this task.)

**Subtasks:**
- Reload `/style-customization` and other demo pages, manually set `priority` values on a column in dev tools or temporarily in code, resize browser to 360px, confirm low-priority columns disappear and reappear when crossing 640px.
- Revert any temporary changes.
- This is a sanity-check task; mark complete once verified.

---

### Phase 3: Card / Stack View `[DEV]`

#### Task 3.1: Create `CardList` component skeleton — ⬜ TODO

**Files to create or modify:**
- `packages/flotable/src/FloTable/CardList/CardList.tsx` (new)
- `packages/flotable/src/FloTable/CardList/CardList.css` (new)

**References:**
- `TableBody.tsx` (loading/error/empty branch structure).
- `TableRow.tsx` (renderCell usage).
- `renderCell` at `packages/flotable/src/FloTable/fields/renderCell.tsx`.

**Subtasks:**
- Create `CardList.tsx` exporting `function CardList<T extends object>(props: CardListProps<T>)` — `CardListProps<T>` mirrors `TableBodyProps<T>` plus `renderCard?: (row: T, index: number) => ReactNode`.
- Render outer container `<div className={cx('flotable-card-list', classNames?.body)} style={styles?.body}>`.
- When `isLoading`: render `loadingRowCount` skeleton cards (a `<div className="flotable-card flotable-card--skeleton">` containing placeholder lines, one per column). Reuse the same shimmer animation token as `TableBodySkeleton.css` if defined; otherwise inline a simple skeleton block.
- When `error`: render a single card with the error message and a Retry button calling `onRetry`. Mirror `TableBodyError` props/labels.
- When `rows.length === 0`: render a single card with "No data" empty state, mirroring `TableBodyEmpty`.
- When data is present and `renderCard` is provided: call `renderCard(row, index)` per row, wrapped in `<div className={cx('flotable-card', classNames?.card)} key={key}>`.
- When data is present and no `renderCard`: render the default auto layout — for each row, a `<div className="flotable-card">` containing one `<div className="flotable-card__row">` per visible column with `<span className="flotable-card__label">{col.header}</span><span className="flotable-card__value">{renderCell(col, row)}</span>`.
- Add a leading checkbox row when `selectable` is true (`<div className="flotable-card__row flotable-card__row--select">` with the same `<input type="checkbox">`).
- Add a trailing row for `rowActions` when present — render `<RowActionsCell />` inline (reuse existing component).
- In `CardList.css`: stack layout, padding via `var(--flotable-card-padding, 0.75rem)`, border `var(--flotable-border-color, #e5e7eb)`, radius `var(--flotable-card-radius, 8px)`, gap between cards `var(--flotable-card-gap, 0.5rem)`, label/value row layout `display: flex; justify-content: space-between; gap: 1rem;`, label `font-weight: 600; color: var(--flotable-muted-color, #6b7280);`. Wrap in `@layer flotable { ... }`. Add BEM class names: `.flotable-card`, `.flotable-card__row`, `.flotable-card__label`, `.flotable-card__value`, `.flotable-card--skeleton`.

#### Task 3.2: Switch between table and card rendering in `FloTable.tsx` — ⬜ TODO

**Files to create or modify:**
- `packages/flotable/src/FloTable/FloTable.tsx`

**References:**
- Current `<div className="flotable-wrapper">...<table>...</table></div>` block at lines 249–280.

**Subtasks:**
- Compute `const useCardView = mobileVariant === 'card' && isMobile;` (and respect `mobileVariant === 'table'` as a force-off).
- If `useCardView`: render `<CardList ... />` in place of the `<div className="flotable-wrapper"><table>...</table></div>` block. Pass the same props the existing `TableBody` receives, plus `renderCard`.
- If not `useCardView`: keep the existing table markup unchanged.
- Verify: `mobileVariant` default is `'auto'`, which keeps the table.
- Also verify: when `mobileVariant === 'table'`, the table is rendered even below the breakpoint.

#### Task 3.3: Add demo route + component for card view — ⬜ TODO

**Files to create or modify:**
- `apps/demo/src/app/responsive/page.tsx` (new)
- `apps/demo/src/components/ResponsiveDemo/ResponsiveDemo.tsx` (new)
- `apps/demo/src/components/ResponsiveDemo/ResponsiveDemo.css` (new)
- `apps/demo/src/components/ResponsiveDemo/ResponsiveDemoData.ts` (new)
- `apps/demo/src/components/DemoNav/DemoNav.tsx` (add nav entry)

**References:**
- Existing demo pages (e.g. `apps/demo/src/app/bulk-actions/page.tsx`).
- `DemoNav.tsx` TABS array (line 7).

**Subtasks:**
- Create `ResponsiveDemoData.ts` exporting at least 15 sample rows with ~8 columns (mix of text, badge, currency, date) and ~6 quick filters so pills overflow easily.
- Create `ResponsiveDemo.tsx` rendering three sections (use existing section-class pattern from other demos): (a) auto mode — table layout with column priority, (b) card mode — `mobileVariant="card"`, (c) sticky toolbar — `stickyToolbar` inside a constrained-height scroll container.
- Each section should have a short heading and a paragraph explaining what to resize/scroll.
- Create `ResponsiveDemo.css` with section spacing and a 600px-tall scroll container for the sticky-toolbar section.
- Create `apps/demo/src/app/responsive/page.tsx` rendering `<ResponsiveDemo />` (mirror the structure of `apps/demo/src/app/bulk-actions/page.tsx`).
- Add `{ href: '/responsive', label: 'Responsive' }` to the TABS array in `DemoNav.tsx`.
- Manual verification: `pnpm --filter demo dev` (or equivalent), open `/responsive`, resize to 360px, confirm card view shows label/value pairs, columns honor priority, no console warnings.

---

### Phase 4: Infinite Scroll (request mode + mobile) `[DEV]`

#### Task 4.1: Create `InfiniteScrollSentinel` component — ⬜ TODO

**Files to create or modify:**
- `packages/flotable/src/FloTable/InfiniteScrollSentinel/InfiniteScrollSentinel.tsx` (new)
- `packages/flotable/src/FloTable/InfiniteScrollSentinel/InfiniteScrollSentinel.css` (new)

**References:**
- `RowActionsOverflow.tsx` for the cleanup-effect pattern (observer registration + return cleanup).
- `TableBodySkeleton` for shimmer styles to reuse in the inline loading indicator.

**Subtasks:**
- Create `InfiniteScrollSentinel.tsx` exporting `function InfiniteScrollSentinel(props: InfiniteScrollSentinelProps)` as a named export. Props: `{ onLoadMore: () => void; isLoading: boolean; isExhausted: boolean; loadingLabel?: string; endLabel?: string; classNames?: FloTableClassNames; styles?: FloTableStyles; }`.
- Hold `const sentinelRef = useRef<HTMLDivElement>(null)`. Inside a `useEffect` keyed on `[isLoading, isExhausted, onLoadMore]`: if `isExhausted` return; if `!sentinelRef.current` return; create `const observer = new IntersectionObserver((entries) => { if (entries[0].isIntersecting && !isLoading) onLoadMore(); }, { rootMargin: '200px' })`; observe the sentinel; cleanup with `observer.disconnect()`.
- Render: `<div className="flotable-infinite-scroll">` containing (a) `<div ref={sentinelRef} className="flotable-infinite-scroll__sentinel" aria-hidden="true" />`, (b) when `isLoading` and not `isExhausted`: `<div className="flotable-infinite-scroll__loading" role="status">{loadingLabel ?? 'Loading…'}</div>` with a shimmer or small spinner, (c) when `isExhausted` and not `isLoading`: `<div className="flotable-infinite-scroll__end">{endLabel ?? ''}</div>` (rendered only if endLabel provided, to keep the default silent).
- In `InfiniteScrollSentinel.css` (wrapped in `@layer flotable`): `.flotable-infinite-scroll { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 1rem 0; }`. `.flotable-infinite-scroll__sentinel { width: 100%; height: 1px; }`. `.flotable-infinite-scroll__loading` uses muted-color, font-size from existing pagination token. `.flotable-infinite-scroll__end` uses muted-color.

#### Task 4.2: Wire infinite scroll into `FloTable.tsx` — ⬜ TODO

**Files to create or modify:**
- `packages/flotable/src/FloTable/FloTable.tsx`
- `packages/flotable/src/FloTable/FloTable.types.ts`

**References:**
- Existing request-mode `useEffect` at lines 62–89 (the fetch-on-change effect).
- Existing branch deciding what to render between `<div className="flotable-wrapper">` and `<TablePagination ... />` (lines 249–291).
- Existing `handleSort` / `handleFilterChange` / `handlePageChange` (already reset `internalPage` to 1 on sort/filter).

**Subtasks:**
- In `FloTable.types.ts`, add optional labels to a new `infiniteScrollLabels?: { loading?: string; end?: string; }` prop on `FloTableBaseProps<T>` for translation (per AGENTS.md customization rule).
- In `FloTable.tsx`, destructure the new prop with `infiniteScrollLabels`.
- Add `const isInfiniteScroll = isReqMode && isMobile;` after the `isReqMode` declaration.
- Add `const [isFetchingMore, setIsFetchingMore] = useState(false);` next to the existing loading state. (Distinct from `isLoading` which represents the first-page/empty fetch.)
- Change the request-mode `useEffect` so that:
  - If `internalPage === 1`: keep current behavior — set `isLoading=true`, then on response `setInternalData(result.data)`, `setIsLoading(false)`.
  - If `internalPage > 1` AND `isInfiniteScroll`: set `isFetchingMore=true`, on response `setInternalData(prev => [...prev, ...result.data])`, `setIsFetchingMore(false)`. Keep `setInternalTotalRows(result.totalRows)` so the exhaustion check works.
  - On error in either branch: clear loading flags and set `fetchError` (existing behavior for first-page; for paged-more, surface the error but keep already-loaded rows visible).
- Add a reset effect keyed on `[isInfiniteScroll]`: if it transitions, `setInternalPage(1)` and `setInternalData([])`. (The existing fetch effect will then re-fire with `page=1`.)
- Add a `loadMore` callback: `if (isInfiniteScroll && !isFetchingMore && !isLoading && internalData.length < internalTotalRows) setInternalPage(p => p + 1);`.
- In the JSX, after the table/card markup and before `<TablePagination ... />`: if `isInfiniteScroll`, render `<InfiniteScrollSentinel onLoadMore={loadMore} isLoading={isFetchingMore} isExhausted={internalData.length >= internalTotalRows && !isLoading} loadingLabel={infiniteScrollLabels?.loading} endLabel={infiniteScrollLabels?.end} />` and skip `<TablePagination />`.
- When NOT `isInfiniteScroll`: render `<TablePagination />` exactly as today.
- Edge: when `selectable` is true, the `handlePageChange` clears selection. Make sure `loadMore` does NOT clear selection (selected rows must survive across loaded pages). Only desktop pagination clears.
- Manual verification in `/responsive` demo: in the request-mode section, resize to 360px, scroll to bottom, confirm new rows load, sentinel fires once per scroll-to-bottom, pagination bar is hidden, sort/filter resets to page 1.

#### Task 4.3: Demo — exercise infinite scroll in the responsive page — ⬜ TODO

**Files to create or modify:**
- `apps/demo/src/components/ResponsiveDemo/ResponsiveDemo.tsx`
- `apps/demo/src/components/ResponsiveDemo/ResponsiveDemoData.ts`

**References:**
- The request-mode example from `apps/demo/src/components/ApiDataSourceDemo/ApiDataSourceDemo.tsx`.

**Subtasks:**
- Add a new demo section "Infinite Scroll (mobile + request mode)" to `ResponsiveDemo.tsx` that uses the `request` prop. The request function should `await new Promise(r => setTimeout(r, 400))` to simulate latency, then slice from a large in-memory dataset.
- Generate 75–150 rows in `ResponsiveDemoData.ts` so multiple pages are needed to exhaust.
- Section heading explains: "Resize to mobile to switch from pagination to infinite scroll automatically."
- Manual verification: on mobile width, scroll within the demo, confirm rows append; on desktop width, confirm pagination is back; toggle resize, confirm reset to page 1 with no stale rows.

### Phase 5: Sticky Toolbar + Pill Overflow + Touch Targets `[DEV]`

#### Task 5.1: Wire `stickyToolbar` prop and add CSS — ⬜ TODO

**Files to create or modify:**
- `packages/flotable/src/FloTable/FloTable.tsx`
- `packages/flotable/src/FloTable/FloTable.css`

**References:**
- Existing `.flotable-toolbar` markup in `FloTable.tsx` line 223.
- Existing `.flotable-toolbar` styles in `FloTable.css` lines 12–18.

**Subtasks:**
- In `FloTable.tsx`, change the toolbar wrapper to: `<div className={cx('flotable-toolbar', stickyToolbar && 'flotable-toolbar--sticky', classNames?.toolbar)} style={styles?.toolbar}>`.
- In `FloTable.css`, add inside `@layer flotable`:
  ```
  .flotable-toolbar--sticky {
    position: sticky;
    top: var(--flotable-toolbar-sticky-top, 0);
    z-index: 2;
    background: var(--flotable-bg, #ffffff);
  }
  ```
- Manual verification: in the demo, scroll the data list inside a parent with `overflow: auto`; confirm the toolbar pins to the top.

#### Task 5.2: Create `FilterBarOverflow` component — ⬜ TODO

**Files to create or modify:**
- `packages/flotable/src/FloTable/filters/FilterBarOverflow/FilterBarOverflow.tsx` (new)
- `packages/flotable/src/FloTable/filters/FilterBarOverflow/FilterBarOverflow.css` (new)

**References:**
- `RowActionsOverflow.tsx` — same portal + ResizeObserver pattern.
- `RowActionsDropdown.tsx` — portal popover with `createPortal(document.body)`.

**Subtasks:**
- Define `FilterBarOverflowProps`: `{ children: ReactNode[]; classNames?: FloTableClassNames; styles?: FloTableStyles; moreLabel?: (n: number) => string; }`.
- Inside the component: hold refs `containerRef`, `triggerRef`, `popoverRef`; state `visibleCount` (default `children.length`), `isOpen`, `popoverStyle`.
- On mount and on every container resize (`ResizeObserver`): measure each child's `offsetWidth` (use hidden measurement nodes if needed — see implementation note), measure container width minus the `+N more` trigger reserved width (~80px), and compute the largest `visibleCount` whose total width fits.
- Render: `<div ref={containerRef} className={cx('flotable-filter-bar-overflow', classNames?.filterBar)} style={styles?.filterBar}>`, then the first `visibleCount` children inline, then (if `visibleCount < children.length`) a `<button ref={triggerRef} className={cx('flotable-filter-bar-overflow__trigger', classNames?.filterBarOverflowTrigger)}>{moreLabel?.(hiddenCount) ?? \`+\${hiddenCount} more\`}</button>`.
- When the trigger is clicked, position the popover (same `getBoundingClientRect` math as `RowActionsOverflow.computePosition`) and render via `createPortal` to `document.body` containing the remaining children in a vertical stack.
- Close the popover on outside click / Escape / scroll (mirror `RowActionsOverflow`).
- In `FilterBarOverflow.css` (wrapped in `@layer flotable`): `.flotable-filter-bar-overflow` uses `display: flex; align-items: center; gap: 0.5rem; min-width: 0; flex-wrap: nowrap; overflow: hidden;`. `.flotable-filter-bar-overflow__trigger` matches `.flotable-filter-pill` visual style for consistency. `.flotable-filter-bar-overflow__popover` `position: fixed;` (set by JS), `background: var(--flotable-bg, #fff)`, padding, gap, border-radius, box-shadow.
- Implementation note: to avoid layout thrash, do measurement in two passes — first render all children with `visibility: hidden` to measure, then commit `visibleCount`. Alternatively, render all children, measure, then hide overflow by index. Pick whichever causes fewer flickers.

#### Task 5.3: Integrate `FilterBarOverflow` into `FilterBar` — ⬜ TODO

**Files to create or modify:**
- `packages/flotable/src/FloTable/filters/FilterBar/FilterBar.tsx`
- `packages/flotable/src/FloTable/filters/FilterBar/FilterBar.css`

**References:**
- Current `FilterBar.tsx` lines 107–141 (the render block).
- Current `FilterBar.css`.

**Subtasks:**
- Wrap the inline list of pills (`{showSearch && <SearchPill ... />}` + `{filterDefs.map(... <FilterPill />)}`) inside a `<FilterBarOverflow ...>` rendering them as children. Keep the `barRef` wrapper outer `<div className="flotable-filter-bar">`.
- The search pill is always visible (passed as the first child), so the search input never overflows. Verify by always placing it before the filter pills in the children array.
- Update `FilterBar.css` to remove `flex-wrap: wrap;` (overflow component handles wrapping now) and ensure the bar still aligns vertically with the rest of the toolbar.
- Manual verification: open `/responsive` demo, narrow the window until pills overflow; click `+N more`; confirm the popover opens, scrolls correctly, and clicking a pill inside still toggles its filter.

#### Task 5.4: Apply 44px touch-target sizes on mobile — ⬜ TODO

**Files to create or modify:**
- `packages/flotable/src/FloTable/FloTable.css`
- `packages/flotable/src/FloTable/TablePagination/TablePagination.css`
- `packages/flotable/src/FloTable/filters/FilterPill/FilterPill.css`
- `packages/flotable/src/FloTable/ActionBar/RowActionsCell/RowActionsOverflow/RowActionsOverflow.css`
- `packages/flotable/src/FloTable/TableHeader/TableHeader.css`

**References:**
- Existing CSS custom property pattern across the package.
- `[data-flotable-mobile]` attribute applied in Task 2.1.

**Subtasks:**
- In `FloTable.css`, add inside `@layer flotable`: `.flotable[data-flotable-mobile="true"] { --flotable-touch-min: 44px; }` (the root data attribute lives on the outermost div, but since the table cells live inside `.flotable-wrapper > table.flotable`, the selector must match the outermost div — adjust to `[data-flotable-mobile="true"]` matching the root, no class qualifier). Final selector: `[data-flotable-mobile="true"]`.
- In `TablePagination.css`, change `.flotable-pagination__btn` to add `min-height: var(--flotable-touch-min, auto); min-width: var(--flotable-touch-min, auto);` so it inherits the 44px floor only when mobile is active.
- In `FilterPill.css`, change `min-height: var(--flotable-pill-height, 2rem);` to `min-height: var(--flotable-pill-height, var(--flotable-touch-min, 2rem));` so the touch floor takes over on mobile.
- In `RowActionsOverflow.css`, set `width` / `height` on `.flotable__row-actions-cell__overflow-btn` to use `max(28px, var(--flotable-touch-min, 0px))` (or duplicate with a scoped selector — pick the cleaner option after writing it).
- In `TableHeader.css`, bump `.flotable__header-cell` padding to use `var(--flotable-header-cell-padding-mobile, var(--flotable-cell-padding, 0.625rem 0.875rem))` and scope a larger fallback under `[data-flotable-mobile="true"]`.
- Manual verification: on Chrome devtools mobile emulator, inspect each control and confirm 44×44 hit area.

---

### Phase 6: Docs, Version, Memory `[DOCS]` `[CONFIG]`

#### Task 6.1: Update `packages/flotable/README.md` with responsive section — ⬜ TODO

**Files to create or modify:**
- `packages/flotable/README.md`

**References:**
- Existing "Features" list (line 15).
- Existing "Props Reference" table (line 147).

**Subtasks:**
- Add `**Responsive primitives**` bullet to the Features list.
- Add a new top-level section `## Responsive` (between "Styling & Customization" and "Props Reference") covering:
  - When/how the breakpoint activates (matchMedia, `mobileBreakpoint` prop, default 640).
  - `priority` on `ColumnDef` — explain the rule (`priority < mobileColumnPriority` ⇒ hidden).
  - `mobileVariant` (`auto` / `card` / `table`) with a small code sample showing card mode.
  - `renderCard` example for custom card layouts.
  - `stickyToolbar` example inside a scrolling parent.
  - Filter pill overflow — note it auto-activates and links to the demo.
  - Infinite scroll — explain that on mobile + request mode, pagination is replaced by sentinel-driven infinite scroll automatically. Document the `infiniteScrollLabels` prop for translation.
  - Touch targets — note the 44px CSS variable and how to opt out.
- Add a `## Migration` subsection: "No action required — defaults preserve existing behavior. Opt in by setting `mobileVariant='card'`, `stickyToolbar`, or `priority` on your columns."
- Add the new props rows to the "Common Props" table.

#### Task 6.2: Bump version + update `MEMORY.md` — ⬜ TODO

**Files to create or modify:**
- `packages/flotable/package.json`
- `MEMORY.md`

**References:**
- `package.json` current version `0.1.9`.
- `MEMORY.md` Jira tracking table.

**Subtasks:**
- Update `packages/flotable/package.json` `"version": "0.1.9"` → `"version": "0.2.0"`.
- Add a row to the Jira tracking table in `MEMORY.md`: `| ET-112 | Task | FloTable: responsive primitives for mobile | In Progress | https://fladeed.atlassian.net/browse/ET-112 |`.
- Do NOT run `npm publish` — that's the maintainer's manual step after PR merge.

---

## Post-merge follow-ups (not part of this PR)

- Maintainer runs `npm publish --access public` from `packages/flotable/`.
- Per AGENTS.md "Skill Update Ticket" workflow: open a Jira ticket under epic ET-1 with label `flotable-skill` titled `[Skill] Update flotable skill — responsive primitives` describing all new props (`mobileBreakpoint`, `mobileVariant`, `mobileColumnPriority`, `renderCard`, `stickyToolbar`, `infiniteScrollLabels`, `ColumnDef.priority`), the new `CardList`, `FilterBarOverflow`, and `InfiniteScrollSentinel` components, the new CSS custom property `--flotable-touch-min`, and the auto-mobile infinite-scroll behavior in request mode. Add this row to `MEMORY.md` when created.
- Mark ET-112 as Done in `MEMORY.md`.
