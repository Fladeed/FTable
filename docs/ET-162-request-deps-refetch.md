# ET-162 — Request-mode FloTable: re-fetch when the query inputs change (`requestDeps`)

## Overview

A request-mode FloTable never re-fetches when the consumer's query inputs change. On the
TajirPro Refunds page, a period picker in the table-level actions (`tableActions`) changes the
period, the stats band updates, and the table keeps showing rows for the old period until a full
page reload.

Fix: add an optional `requestDeps` prop. It holds **primitive values only** and is compared
element by element. When any of them changes, FloTable resets to page 1 and fetches exactly once,
keeping the current sort and quick filters. Ships as **flotable 0.3.0** (minor).

Jira: https://fladeed.atlassian.net/browse/ET-162 (Bug, parent ET-5)

## Problem

In [FloTable.tsx](../packages/flotable/src/FloTable/FloTable.tsx), `requestRef.current = props.request`
runs on every render. The fetch effect depends only on
`[isReqMode, internalPage, internalSortState, internalFilters, pageSize, retryCount, fireRequest]`,
so a new `request` is stored but never called until the next page, sort or filter change, or a
`ref.refresh()`.

**What npm 0.2.1 contains.** It was published 2026-10-11 at 00:37 (+0100), five minutes after the
ET-23 merge. A build of current master is **byte-identical** to the 0.2.1 tarball (`index.mjs`,
`index.js`, `index.css`, `index.d.ts`). So 0.2.1 already ships ET-117 (expandable rows), ET-84
(theming and dark mode) and ET-23 (table actions). The 0.3.0 release notes only need to cover this
PR.

### Decisions (settled with the user)

1. **Trigger = `requestDeps` (primitive array), not `request` identity.** Re-fetching on
   identity would loop forever for any consumer who passes an inline arrow: each fetch sets state,
   the re-render creates a new arrow, and that triggers another fetch. Primitives cannot change
   identity without changing value, so `requestDeps` cannot loop, even as an inline array literal.
   The type enforces primitives only:
   `ReadonlyArray<string | number | boolean | null | undefined>`.
2. **Page reset is always on** (not configurable), the same as sort and filter changes today.
3. **Version 0.3.0 (minor).** It was first planned as 0.2.2, then changed to a minor when the boolean
   filter pill became a toggle (a visible UX change). In 0.x, `^0.2.1` does not pull in 0.3.0, so
   consumers upgrade on purpose.
4. **Test tooling:** add `vitest`, `jsdom` and `@testing-library/react` as **devDependencies of
   `packages/flotable` only**. These packages are never bundled, so the published package stays
   zero-dependency. Record the exception in AGENTS.md.

### Assumptions

- A change of `requestDeps` also **clears the row selection** (calling `onSelectionChange([])`),
  the same as a page change does today, because the selected rows belong to the old result set.
- **No fetch on mount** because of `requestDeps`. The existing mount fetch is enough.
- Going from `requestDeps` undefined to an array (or the reverse), or a change in array length,
  counts as a change.
- The `request` used is always the latest one, read from `requestRef`. Consumers keep memoizing
  `request` with the same deps (recommended, not required).
- Expanded child rows (`childRequest` cache) need no work. The cache is keyed by the parent row
  object, and a re-fetch returns new objects.

## Suggested Solution

Use React's "adjust state when a prop changes" pattern during render, so that the page reset and
the re-fetch happen in **one** render and the fetch effect runs **once**:

```ts
const requestDeps = isReqMode ? (props as FloTableRequestProps<T, C>).requestDeps : undefined;
const [prevRequestDeps, setPrevRequestDeps] = useState(requestDeps);
const [requestEpoch, setRequestEpoch] = useState(0);
if (!depsEqual(prevRequestDeps, requestDeps)) {
  setPrevRequestDeps(requestDeps);
  setInternalPage(1);
  setSelectedKeys(new Set());
  setRequestEpoch((e) => e + 1);
}
```

- Add `requestEpoch` to the fetch effect deps. On page 3, the page and the epoch change in the
  same render, so there is one effect run with `page: 1`. On page 1, only the epoch changes, which
  is still one run.
- Call `onSelectionChange([])` from a small effect keyed on `requestEpoch` (skipping 0), because
  render must not call consumer callbacks.
- The stale-response guard already works: the new `fireRequest` increments `requestIdRef`, so the
  old response is dropped when it resolves.
- `depsEqual` is a pure helper in `tableUtils.ts`. It compares both arrays element by element with
  `Object.is`, and treats `undefined` vs an array, or different lengths, as not equal.

Consumer usage (TajirPro):

```tsx
const request = useMemo(() => (p) => api.refunds({ ...p, period, storeId }), [period, storeId]);
<FloTable request={request} requestDeps={[period, storeId]} tableActions={<PeriodPicker … />} />
```

## Task Checklist

### Phase 0: Test tooling `[CONFIG]`

#### Task 0.1: Add Vitest + React Testing Library to packages/flotable [20m] — ✅ COMPLETE

**Files to create or modify:**
- `packages/flotable/package.json`: add devDependencies `vitest`, `jsdom`, `@testing-library/react`, and the scripts `"test": "vitest run"` and `"test:watch": "vitest"`.
- `packages/flotable/vitest.config.ts` (new): `environment: 'jsdom'`, `include: ['src/**/*.test.tsx']`, `css: false`.
- `package.json` (root): add the script `"test": "npm run test --workspace=packages/flotable"`.
- `package-lock.json`: updated by npm.

**References:** `packages/flotable/tsup.config.ts` (entry `src/index.ts` only, so test files are never bundled).

**Subtasks:**
- [ ] Run `npm i -D vitest jsdom @testing-library/react --workspace=packages/flotable`.
- [ ] Create `vitest.config.ts` with the jsdom environment and the `*.test.tsx` include glob.
- [ ] Add the `test` scripts to the package and root `package.json`.
- [ ] Check that `npm pack --dry-run` in `packages/flotable` still lists only `dist/`, `styles.d.ts`, `README.md` and `package.json`, and that `dependencies` is still empty.
- [ ] Check that `npm run typecheck` still passes once test files exist (import `describe/it/expect/vi` from `vitest` explicitly; no globals).

### Phase 1: Failing tests `[TEST]`

#### Task 1.1: Write `requestDeps` re-fetch tests (red) [45m] — ✅ COMPLETE

**Files to create or modify:**
- `packages/flotable/src/FloTable/FloTable.requestDeps.test.tsx` (new).
- `packages/flotable/src/FloTable/tableUtils.test.ts` (new, `depsEqual` only).

**References:** `FloTable.types.ts` (`FloTableRequestFn`, `FloTableHandle`), `FloTable.tsx` (fetch effect, `fireRequest`, `useImperativeHandle`).

**Subtasks** (each test uses a `vi.fn()` request that resolves `{ data, totalRows: 50 }` with `pageSize: 10`, and `render`/`rerender` + `waitFor`):
- [ ] FloTable request mode: mount with `requestDeps={['7d']}`, wait for the first call, then rerender with `requestDeps={['year']}` → the request is called **exactly once more** with `page: 1`, `pageSize: 10`, and the current `sortState` and `quickFilters`.
- [ ] FloTable request mode with `initialSort={{ key: 'amount', direction: 'desc' }}` and `initialQuickFilters={{ __search__: 'abc', status: 'paid' }}`: change `requestDeps` → the new call receives that same `sortState` and `quickFilters` (search text kept).
- [ ] FloTable request mode: rerender with a **new array literal holding the same values** (`['7d']` → `['7d']`) → no additional call.
- [ ] FloTable request mode with a new **inline `request` arrow on every render** and stable `requestDeps`: rerender 5 times → no additional call (loop-proof guarantee).
- [ ] FloTable request mode: go to page 3 by clicking the pagination "next" button twice (call has `page: 3`), then change `requestDeps` → the next and only call has `page: 1`, and the pagination shows page 1.
- [ ] FloTable request mode: the first request (old deps) is a deferred promise; change `requestDeps`; the new request resolves with row "NEW"; then the old one resolves with row "OLD" → "NEW" is rendered and "OLD" is not.
- [ ] FloTable request mode: change `requestDeps` together with a new `request` function → only the **new** function is called.
- [ ] FloTable request mode: `ref.current.refresh()` after rerendering with a new `request` (same deps) → the new function is called with the current page, sort and filters, and the old one is not called again.
- [ ] FloTable request mode with `selectable` and `onSelectionChange` spy: select a row, change `requestDeps` → `onSelectionChange` is called with `[]` and no row checkbox is checked.
- [ ] FloTable request mode without `requestDeps`: rerender with a new `request` → no additional call (backward compatibility with 0.2.1).
- [ ] FloTable data mode: rerender with new `data` → renders the new rows and no fetch occurs (no `request`); `onPageChange` is not called.
- [ ] `depsEqual`: `(undefined, undefined)` → true; `(['a', 1], ['a', 1])` → true; `(['a'], ['b'])` → false; `(['a'], ['a', 'b'])` → false; `(undefined, [])` → false; `([NaN], [NaN])` → true.
- [ ] Run `npm test`: the new FloTable tests fail (no re-fetch), `depsEqual` fails to import, and the backward-compat and data-mode tests pass.

### Phase 2: Implementation `[DEV]`

#### Task 2.1: Add the `requestDeps` prop type [10m] — ✅ COMPLETE

**Files to create or modify:**
- `packages/flotable/src/FloTable/FloTable.types.ts`: add `RequestDeps` and `FloTableRequestProps.requestDeps`, and update the JSDoc for `request`.
- `packages/flotable/src/index.ts`: export the `RequestDeps` type if the other prop types are exported there.

**References:** existing `initialSort` / `initialQuickFilters` JSDoc style in `FloTableRequestProps`.

**Subtasks:**
- [ ] Add `export type RequestDeps = ReadonlyArray<string | number | boolean | null | undefined>;`.
- [ ] Add `requestDeps?: RequestDeps` to `FloTableRequestProps`. The JSDoc must say: values the query depends on (period, store, scope…); when any element changes (compared with `Object.is`), the table resets to page 1, keeps sort and quick filters, clears the selection and calls `request` once; primitives only (convert Dates with `toISOString()`); default `undefined` (no automatic re-fetch, as in 0.2.1).
- [ ] Update the `request` JSDoc: "called on mount, on every sort / filter / pagination change, and whenever `requestDeps` changes. Always the latest `request` is used."

#### Task 2.2: Implement `depsEqual` and the re-fetch in FloTable [30m] — ✅ COMPLETE

**Files to create or modify:**
- `packages/flotable/src/FloTable/tableUtils.ts`: add `depsEqual(a?: RequestDeps, b?: RequestDeps): boolean`.
- `packages/flotable/src/FloTable/FloTable.tsx`: add the render-time deps check, the `requestEpoch` state and dep, and the selection-clear effect.

**References:** `handleSort` / `handleFilterChange` (set state + `setInternalPage(1)` in one batch), `handlePageChange` (selection clearing).

**Subtasks:**
- [ ] `depsEqual`: return `true` if `a === b`; return `false` if exactly one is `undefined` or the lengths differ; otherwise return `every((v, i) => Object.is(v, b[i]))`.
- [ ] In `FloTableImpl`, read `requestDeps` (request mode only) and add `prevRequestDeps` state (initialised to `requestDeps`) and `requestEpoch` state (initialised to `0`).
- [ ] During render, if `!depsEqual(prevRequestDeps, requestDeps)`: call `setPrevRequestDeps(requestDeps)`, `setInternalPage(1)`, `setSelectedKeys(new Set())` and `setRequestEpoch(e => e + 1)`. These are setState calls only; no consumer callbacks run during render.
- [ ] Add `requestEpoch` to the fetch effect's dependency array.
- [ ] Add `useEffect(() => { if (requestEpoch > 0) onSelectionChange?.([]); }, [requestEpoch])`. `onSelectionChange` is read through a ref so that an inline callback does not re-fire the effect.
- [ ] Run `npm test` (all green), `npm run typecheck` and `npm run build`.

### Phase 3: Docs, demo & release `[DOCS]` / `[CONFIG]`

#### Task 3.1: README + AGENTS.md [15m] — ✅ COMPLETE

**Files to create or modify:**
- `packages/flotable/README.md`: add a `requestDeps` row to the request-props table (near line 462) and a short "Re-fetching when your query changes" example (period picker in `tableActions`), stating that it uses primitives only and does not loop.
- `AGENTS.md`: under "No External Dependencies", allow test-only devDependencies (`vitest`, `jsdom`, `@testing-library/react`) in `packages/flotable`, which must never be imported from `src/` non-test files. Add a "Testing" note: `npm test`, with tests colocated as `*.test.tsx`.

**Subtasks:**
- [ ] Add the README prop row: `requestDeps | RequestDeps | Primitive values the query depends on; any change resets to page 1 and re-fetches once`.
- [ ] Add the README example section with the `useMemo` + `requestDeps` snippet.
- [ ] Update AGENTS.md as described above.

#### Task 3.2: Demo: period picker on the API data source page [20m] — ✅ COMPLETE

**Files to create or modify:**
- `apps/demo/src/components/ApiDataSourceDemo/ApiDataSourceDemo.tsx`: add a simple inline `<select>` (for example "Last 7 days / This month / This year") in `tableActions`, filter the mock fetch by it, and pass `requestDeps={[period]}`.

**References:** the existing request-mode section in `ApiDataSourceDemo.tsx`; memory: keep demos inline and simple, with no layout hacks.

**Subtasks:**
- [ ] Add the `period` state and a `useMemo` request depending on it.
- [ ] Pass `requestDeps={[period]}` and render the select via `tableActions`.
- [ ] Check in the browser: go to page 3, switch the period, and confirm that one request is logged, page 1 is shown, and sort and search are kept.

#### Task 3.3: Version bump, PR, skill ticket, publish [20m] — 🚧 IN PROGRESS

**Files to create or modify:**
- `packages/flotable/package.json`: `0.2.1` → `0.3.0`.
- `MEMORY.md`: set ET-162 to Done ✓ after the merge, and add the `[Skill]` ticket row.

**Subtasks:**
- [x] Bump the version to `0.3.0`.
- [x] Push the branch `fix/ET-162-request-deps-refetch` and open a PR to `master` (#25). Release notes: "0.3.0 — adds `requestDeps`; boolean filter pills are one-click toggles; select options accept `{ value, label }`. No other changes vs 0.2.1 (0.2.1 already contains ET-117, ET-84, ET-23)."
- [x] Create `[Skill] Update flotable skill — requestDeps re-fetch contract` under ET-1, with the label `flotable-skill` and the type Task, giving the prop shape, behaviour, changed files and the skill sections to update, plus the PR link. Add it to MEMORY.md.
- [ ] After the merge: run `npm publish` from `packages/flotable` (the `prepublishOnly` script builds it), then check `npm view flotable version` → `0.3.0`. **Ask before publishing.**
- [ ] Mark ET-162 Done in Jira and in MEMORY.md.

### Phase 4: Filter pills — boolean toggle + translatable select options (added to the same PR on request)

#### Task 4.1: Tests (red) [20m] — ✅ COMPLETE

**Files to create or modify:**
- `packages/flotable/src/FloTable/filters/FilterBar/FilterBar.test.tsx` (new).

**Subtasks:**
- [x] Boolean pill: renders a `button[aria-pressed=false]` and no combobox.
- [x] Boolean pill, commit mode: one click → `onFilterChange({ inStock: 'true' })` once, no dropdown.
- [x] Boolean pill, live mode: one click → applied immediately (no 300ms debounce).
- [x] Boolean pill active: `aria-pressed=true`, text is just the label; second click → `onFilterChange({})`.
- [x] Boolean pill with a programmatic `'false'` value: pressed, shows `labels.booleanFalse`.
- [x] Toggling keeps the other active filters.
- [x] Select with `{ value, label }` options: the dropdown shows `labels.filterAll` then the labels.
- [x] Select: choosing an option filters on its value.
- [x] Select, closed and active: shows the option label, not the raw value.
- [x] Select with plain string options: unchanged behaviour.

#### Task 4.2: Implementation [30m] — ✅ COMPLETE

**Files to create or modify:**
- `FloTable.types.ts`: new `FilterOption { value; label }`; `FilterDef.options?: Array<string | FilterOption>`.
- `index.ts`: export `FilterOption`.
- `tableUtils.ts`: `toFilterOption`.
- `filters/FilterPill/FilterPillToggle/FilterPillToggle.tsx` + `.css` (new): the toggle button (`aria-pressed`).
- `filters/FilterPill/FilterPill.tsx`: boolean pills render `FilterPillToggle`, never open, have no clear button, and call `onValueChange(key, active ? '' : 'true')`.
- `filters/FilterPill/FilterPillField/FilterPillField.tsx`: remove the boolean `<select>`; select options use `{ value, label }`.
- `filters/FilterPill/FilterPillTrigger/FilterPillTrigger.tsx`: `formatActiveValue` shows the select option's label.
- `filters/FilterBar/FilterBar.tsx`: `applyNow` (used by boolean pills and clear), which applies immediately in both modes.

#### Task 4.3: Docs & demos [15m] — ✅ COMPLETE

- README: a new "Filter Pills" section (toggle behaviour, `{ value, label }` options, `filterAll`).
- Demo: removed the obsolete `options: ['true', 'false']` and the dropdown-only boolean pill from the custom-value section.
