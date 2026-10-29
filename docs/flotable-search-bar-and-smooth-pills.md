# FloTable — toolbar search bar + smoother filter pills

## Overview

Two UX fixes to the FloTable toolbar:

1. The global search (`showSearch`) moves from the left-hand filter bar to the right-hand toolbar
   group, as the **leftmost item** of `.flotable-toolbar__end-group` (before `toolbarEnd` and
   `tableActions`). It becomes a plain search input instead of a pill.
2. Filter pills keep their inline "expand in place" design, but the opening and closing become
   instant and smooth instead of laggy.

## Problem

### Search
- `SearchPill` is a `FilterPill` with a search icon, rendered first inside `FilterBar` (left side).
  It looks out of place next to the table actions, and it takes a click before you can type.
- Its input value is read from `activeFilters` (parent state), so every keystroke makes a round
  trip through `FloTable` state. Every keystroke also calls `onFilterChange` right away, which
  means one `request` call per key in request mode.

### Pills — sources of lag
- `.flotable-filter-pill__field` animates `max-width` 0 → 260px over 450ms (and back over 400ms).
  This changes layout on every frame: every pill to the right shifts and the bar can re-wrap
  during the animation.
- `FilterBar.closeKey` holds the pill in a "closing" state for 400ms (`setTimeout`). Clicks on it
  are ignored during that time (`onClick` is disabled while `isClosing`).
- Bug: opening pill B while pill A is open sets `closingKey = A`, but nothing ever clears it.
  Pill A stays mounted in its collapse animation state until some later close.

### Decisions (made by the user)
- Pills: **inline, but smoother** (not a popover).
- Search position: **start of the right group** → `[filters …] [🔍 Search] [toolbarEnd] [actions]`.
- `SearchPill`: **removed**, replaced by a new exported `SearchInput` component.
- Search debounce: **300ms** (same as live-mode pills). Enter applies immediately.

### Assumptions
- `FilterPill` is a public export. Its `isClosing` prop becomes **optional and ignored**
  (`@deprecated` in JSDoc), so existing consumers still compile. Demo usages are cleaned up.
- When the search input is cleared (× button or emptied by typing), the change is applied
  immediately, without waiting for the debounce.
- When `activeFilters.__search__` changes from outside (view switch, `requestDeps` reset), the
  input shows the new value, unless the user is typing at that moment (pending debounce).
- The search input stays visible even when there are no filter pills, as today.
- New user-visible text: none. The input reuses `labels.searchPlaceholder` (placeholder) and
  `labels.search` (aria-label). The clear button reuses `labels.clearFilter`, called with the
  `labels.search` text.

## Suggested Solution

### SearchInput
New component `filters/SearchInput/SearchInput.tsx` + `.css`: a bordered text input
(`type="search"`) with a leading search icon and a trailing clear (×) button that shows only when
there is a value. It keeps its own `draft` state, so typing never waits for the parent. It calls
`onChange(value)` 300ms after the last keystroke, right away on Enter, and right away on clear.

`FloTable` renders it at the start of `.flotable-toolbar__end-group` when `showSearch` is set. On
change it calls `handleFilterChange({ ...quickFilters, [SEARCH_KEY]: v })`, or removes the key
when `v` is empty. `FilterBar` drops its `showSearch` prop and all `SEARCH_KEY` branches.

Styling follows the pill colour tokens through `--_flotable-*`: border `--_flotable-pill-border-color`,
background `--_flotable-pill-bg`, focus ring `--_flotable-focus-ring`. Height matches
`--flotable-pill-height`. New size tokens: `--flotable-search-width` (default `14rem`),
`--flotable-search-radius` (default `var(--flotable-pill-radius, 6px)`). No new colour tokens.

New hooks for consumers: `classNames.search` / `styles.search` (wrapper) and
`classNames.searchInput` / `styles.searchInput` (the `<input>`).

### Smooth pills
- `FilterBar`: remove `closingKey` and the 400ms `setTimeout`. Closing becomes synchronous:
  commit if needed, then `setOpenKey(null)`. Opening another pill commits the previous one (same
  rule as `closeKey`) and switches `openKey` in the same render. This fixes the stuck-closing bug.
- `FilterPill` / `FilterPillTrigger` / `FilterPillField`: drop all `isClosing` logic. The field
  mounts only while `isOpen`.
- CSS: replace the `max-width` keyframes with a short enter animation that does not change layout:
  `opacity 0→1` + `translateX(-4px → 0)` over 120ms `ease-out`. Closing is instant (the field
  unmounts). Respect `prefers-reduced-motion: reduce` (no animation). The pill gets a subtle
  `:hover` border colour and a `:focus-visible` ring. The input width becomes `field-sizing:
  content` where supported, with `--flotable-pill-input-width` as min/fallback, so text inputs
  don't jump to a fixed 120px.

## Task Checklist

### Phase 1: Tests first [TEST]

#### Task 1.1: SearchInput behaviour tests [30m] — ✅ COMPLETE

**Files to create or modify:**
- `packages/flotable/src/FloTable/filters/SearchInput/SearchInput.test.tsx` — new test file (fails until Task 2.1).

**References:**
- `packages/flotable/src/FloTable/filters/FilterBar/FilterBar.test.tsx` — render/fireEvent style.
- Vitest fake timers (`vi.useFakeTimers()` / `vi.advanceTimersByTime`).

**Subtasks:**
- [x] `SearchInput` with `value=""`: renders a `searchbox` labelled "Search" with placeholder "Search…", always visible (no click needed).
- [x] `SearchInput` with `labels={{ search: 'Rechercher', searchPlaceholder: 'Rechercher…' }}`: the aria-label and placeholder use the given labels.
- [x] Typing "abc": the input shows "abc" right away, and `onChange` is not called before 300ms.
- [x] Typing "abc" then advancing 300ms: `onChange` is called once with `"abc"`.
- [x] Typing "a", "ab", "abc" 100ms apart, then advancing 300ms: `onChange` is called once, with `"abc"`.
- [x] Typing "abc" then pressing Enter: `onChange("abc")` is called right away, and nothing more fires after 300ms.
- [x] `value="foo"`: a clear button is shown; clicking it calls `onChange("")` right away and empties the input.
- [x] `value=""`: no clear button is rendered.
- [x] Re-rendering with `value` changed from `""` to `"bar"` (no pending typing): the input shows "bar".

#### Task 1.2: FloTable search placement tests [20m] — ✅ COMPLETE

**Files to create or modify:**
- `packages/flotable/src/FloTable/FloTable.search.test.tsx` — new test file.

**References:**
- `packages/flotable/src/FloTable/FloTable.requestDeps.test.tsx` — how FloTable is rendered in data/request mode.

**Subtasks:**
- [x] `showSearch` + `tableActions` + `filterDefs`: the searchbox is inside `.flotable-toolbar__end-group`, before `.flotable-table-actions` in DOM order, and not inside `.flotable-filter-bar`.
- [x] `showSearch` + `toolbarEnd`: the searchbox comes before `.flotable__toolbar-end` in DOM order.
- [x] `showSearch` with no filters, actions or toolbarEnd: the toolbar renders and holds only the searchbox.
- [x] Data mode, `showSearch`, `quickFilters={{ status: 'paid' }}`: typing "x" + advancing 300ms calls `onFilterChange({ status: 'paid', __search__: 'x' })` and `onPageChange(1)`.
- [x] Request mode, `showSearch`: typing "abc" one key at a time + advancing 300ms leads to exactly one extra `request` call, with `quickFilters.__search__ === 'abc'`.

#### Task 1.3: FilterBar pill open/close tests [20m] — ✅ COMPLETE

**Files to create or modify:**
- `packages/flotable/src/FloTable/filters/FilterBar/FilterBar.test.tsx` — add a `describe('FilterBar pill open/close')` block.

**References:**
- Existing select-pill tests in the same file.

**Subtasks:**
- [x] Text pill "Name": clicking the trigger shows a textbox right away; pressing Escape removes it right away (no timers advanced).
- [x] Commit mode: open "Name", type "bob", click outside → `onFilterChange({ name: 'bob' })` is called once, and the field is gone right away.
- [x] Two pills "Name" and "Statut": open "Name", then click "Statut" → only one field is in the DOM (the select), and "Name" shows no field.
- [x] Commit mode: open "Name", type "bob", then click "Statut" → `onFilterChange({ name: 'bob' })` is called (switching pills commits the previous one).
- [x] Clicking a pill trigger right after closing it (no timers advanced) opens it again.
- [x] `FilterBar` never renders a searchbox (search no longer lives there).

### Phase 2: Implementation [DEV]

#### Task 2.1: SearchInput component [45m] — ✅ COMPLETE

**Files to create or modify:**
- `packages/flotable/src/FloTable/filters/SearchInput/SearchInput.tsx` — new component.
- `packages/flotable/src/FloTable/filters/SearchInput/SearchInput.css` — new styles.
- `packages/flotable/src/FloTable/FloTable.css` — add `.flotable-search` to the token host selector lists (base, `--inherit`, dark) so the component is themed when used standalone.
- `packages/flotable/src/FloTable/FloTable.types.ts` — add `search` / `searchInput` to `FloTableClassNames` and `FloTableStyles`, with JSDoc; update `labels.search` JSDoc ("search input" instead of "search pill").

**References:**
- `filters/SearchPill/SearchPill.tsx` — search icon SVG to reuse.
- `filters/FilterBar/FilterBar.tsx` — 300ms debounce pattern with `useRef<ReturnType<typeof setTimeout>>`.
- `filters/FilterPill/FilterPill.css` — token usage (`--_flotable-pill-*`, `--_flotable-focus-ring`).

**Subtasks:**
- [ ] Props: `value: string`, `onChange: (value: string) => void`, `debounceMs?: number` (default 300), `classNames`, `styles`, `labels`.
- [ ] State: `draft` (initialised from `value`), and a debounce timer ref. A `useEffect` on `value` sets `draft = value` only when no debounce is pending.
- [ ] `onChange` of the input: set `draft`; if the new value is `''`, clear the timer and call `onChange('')` right away; otherwise (re)start the 300ms timer that calls `onChange(draft)`.
- [ ] `onKeyDown` Enter: clear the timer and call `onChange(draft)` right away.
- [ ] Clear button (shown when `draft !== ''`): clear the timer, set `draft = ''`, call `onChange('')`, focus the input. aria-label: `(labels?.clearFilter ?? defaultClear)(labels?.search ?? 'Search')`.
- [ ] Clear the timer on unmount.
- [ ] Markup: `div.flotable-search` > `svg.flotable-search__icon` + `input.flotable-search__input[type=search]` (`aria-label`, `placeholder`) + optional `button.flotable-search__clear`.
- [ ] CSS: wrapper `inline-flex`, `width: var(--flotable-search-width, 14rem)`, `min-height: var(--flotable-pill-height, 2rem)`, border `1px solid var(--_flotable-pill-border-color)`, bg `var(--_flotable-pill-bg)`, colour `var(--_flotable-pill-color)`, radius `var(--flotable-search-radius, var(--flotable-pill-radius, 6px))`; `:focus-within` → border `var(--_flotable-pill-open-border-color)` + `box-shadow: 0 0 0 3px var(--_flotable-focus-ring)`; hide the native `::-webkit-search-cancel-button`; placeholder `var(--_flotable-pill-placeholder-color)`. On narrow toolbars it shrinks (`min-width: 8rem; flex: 0 1 auto`).

#### Task 2.2: Move search into the toolbar end group [30m] — ✅ COMPLETE

**Files to create or modify:**
- `packages/flotable/src/FloTable/FloTable.tsx` — render `SearchInput` first inside `.flotable-toolbar__end-group`; update the toolbar/end-group render conditions to include `showSearch`.
- `packages/flotable/src/FloTable/filters/FilterBar/FilterBar.tsx` — remove `showSearch` prop, the `SearchPill` render and every `SEARCH_KEY` branch; return `null` when `filterDefs` is empty.
- `packages/flotable/src/FloTable/filters/SearchPill/` — delete the directory.
- `packages/flotable/src/index.ts` — remove the `SearchPill` export, add `export { SearchInput }`.

**References:**
- `FloTable.tsx` `handleFilterChange` and the toolbar block (around L447–L485).

**Subtasks:**
- [ ] In `FloTable`, add `handleSearchChange(v)`: build `next = { ...quickFilters }`, set or delete `next[SEARCH_KEY]`, skip if unchanged, then call `handleFilterChange(next)`.
- [ ] `hasFilterBar = effectiveFilterDefs.length > 0`; new `hasEndGroup = showSearch || hasToolbarEnd || hasTableActions`; the toolbar renders when `hasFilterBar || bulk || inline bar || hasEndGroup`.
- [ ] End-group order: `SearchInput` → `ToolbarEnd` → `TableActions`.
- [ ] `FilterBar`: since search is no longer handled here, `handleValueChange` only has the live/commit branches, and `closeKey` drops the `key !== SEARCH_KEY` check.
- [ ] Run Phase 1 search tests (Tasks 1.1, 1.2) → green.

#### Task 2.3: Smooth pill open/close [45m] — ✅ COMPLETE

**Files to create or modify:**
- `packages/flotable/src/FloTable/filters/FilterBar/FilterBar.tsx` — remove `closingKey` + timeout; synchronous close; switching commits the previous pill.
- `packages/flotable/src/FloTable/filters/FilterPill/FilterPill.tsx` — `isClosing` optional + `@deprecated`, ignored; field rendered only when `isOpen`.
- `packages/flotable/src/FloTable/filters/FilterPill/FilterPillTrigger/FilterPillTrigger.tsx` — remove `isClosing` prop.
- `packages/flotable/src/FloTable/filters/FilterPill/FilterPillField/FilterPillField.tsx` — remove `isClosing` prop and the `--closing` class.
- `packages/flotable/src/FloTable/filters/FilterPill/FilterPillField/FilterPillField.css` — new enter animation, drop `max-width` keyframes, `field-sizing: content` on the input.
- `packages/flotable/src/FloTable/filters/FilterPill/FilterPill.css` — hover border + `:focus-within` ring polish, `transition` on `box-shadow`.

**References:**
- Current `closeKey` / `handlePillClick` in `FilterBar.tsx`.

**Subtasks:**
- [ ] Extract `commitIfChanged(key)` from `closeKey` (commit mode only: compare `activeFilters[key]` vs `localFiltersRef.current[key]`, call `onFilterChange` if different).
- [ ] `closeKey(key)`: `commitIfChanged(key)` then `setOpenKey(null)`, with no timeout.
- [ ] `handlePillClick(key)`: if `openKey === key` → `closeKey(key)`; else if `openKey` → `commitIfChanged(openKey)` then `setOpenKey(key)`; else `setOpenKey(key)`.
- [ ] Remove `closingKey` state and the `isClosing` props passed to `FilterPill`.
- [ ] `FilterPill`: root `onClick` opens when `!isOpen`; `--open` class only when `isOpen`; field only when `isOpen`; clear button when `isActive && !isOpen`.
- [ ] `FilterPillField.css`: `.flotable-filter-pill__field { animation: flotable-pill-field-in 120ms ease-out; }` with keyframes `from { opacity: 0; transform: translateX(-4px); }`; `@media (prefers-reduced-motion: reduce) { animation: none; }`; delete `flotable-pill-expand` / `flotable-pill-collapse` and the `overflow/max-width/opacity` base styles.
- [ ] `.flotable-filter-pill__input`: `field-sizing: content; min-width: var(--flotable-pill-input-width, 120px); max-width: 16rem;`.
- [ ] `FilterPill.css`: `:hover:not(.flotable-filter-pill--open)` → border `var(--_flotable-pill-open-border-color)`; add `box-shadow 0.12s ease` to the transition list.
- [ ] Run Phase 1 pill tests (Task 1.3) + whole suite → green.
- [x] **Revision (user feedback: the 120ms fade felt abrupt, width still jumped):** the field is now always mounted inside `.flotable-filter-pill__field-wrap` (`aria-hidden` + `inert` while closed; focus moved via ref on open). Width animates with `grid-template-columns: 0fr → 1fr` (open 220ms, close 160ms; tokens `--flotable-pill-open-duration` / `--flotable-pill-close-duration`) plus an opacity fade. Open state toggles instantly, so there is no timer and clicks are never blocked. The pill's flex `gap` was removed (spacing moved to the field's `padding-inline-start` and the clear button's margin) so a collapsed field leaves no gap.

#### Task 2.4: Demo cleanup [15m] — ✅ COMPLETE

**Files to create or modify:**
- `apps/demo/src/components/FilterPillDemo/useFilterPill.ts` — drop `isClosing` state and the 400ms timeout; `close()` sets `isOpen=false` right away.
- `apps/demo/src/components/FilterPillDemo/FilterPillDefaultSection/FilterPillDefaultSection.tsx`, `FilterPillCustomValueSection/…`, `FilterPillCustomTriggerSection/…` — remove `isClosing={…}` props.

**References:**
- Memory: keep demos inline and simple.

**Subtasks:**
- [ ] Remove every `isClosing` usage in `apps/demo/src`.
- [ ] `npm run build` in the demo workspace (or the typecheck) passes.

### Phase 3: Docs [DOCS]

#### Task 3.1: README + skill ticket [20m] — ⬜ TODO

**Files to create or modify:**
- `packages/flotable/README.md` — props table (`showSearch` row), `classNames`/`styles` keys, CSS tokens section, mention of `SearchPill` → `SearchInput`.
- `MEMORY.md` — ticket rows.

**Subtasks:**
- [ ] `showSearch` row: "Show a global search input at the start of the right-hand toolbar group (before `toolbarEnd` and `tableActions`). Debounced 300ms; Enter applies immediately."
- [ ] Document `classNames.search`, `classNames.searchInput`, the matching `styles` keys and the `--flotable-search-width` / `--flotable-search-radius` tokens.
- [ ] Note the breaking change: `SearchPill` export removed → use `SearchInput`; `FilterPill.isClosing` deprecated / ignored.
- [ ] After the PR: create the `[Skill] Update flotable skill — toolbar SearchInput + smooth pills` ticket (parent ET-1, label `flotable-skill`) and record it in `MEMORY.md`.

### Phase 4: Pill field styling (added on user feedback) [TEST] + [DEV]

#### Task 4.1: Themed select / number / date fields inside pills [1h30] — ⬜ TODO

**Problem:** the controls inside an open pill are raw browser widgets. The `select` shows the native
arrow and an unstyled option list, which stays light in dark mode. The `number` input shows the native
spin buttons, and the `date` input shows the native calendar icon in the wrong colour scheme.

**Open decision (ask the user before starting):**
- **A — Styled native controls:** `appearance: none` + our own chevron on the `select`, `color-scheme`
  driven by the theme so the native option list and date picker follow light/dark, hidden number
  spinners. Small and accessible for free, but the open option list is still drawn by the OS.
- **B — Custom listbox for `select`:** replace the `<select>` with a button plus a themed `role="listbox"`
  popover (keyboard navigation, type-ahead, `aria-activedescendant`). Fully on-brand in every theme, but
  more code and more accessibility work. Number/date are handled as in A.

**Files to create or modify:**
- `packages/flotable/src/FloTable/filters/FilterPill/FilterPillField/FilterPillField.tsx` / `.css` — field markup and styles.
- `packages/flotable/src/FloTable/FloTable.css` — `color-scheme` on the token hosts (light / dark blocks), and any new colour tokens (e.g. option hover bg) with light + dark defaults.
- (B only) new `FilterPillSelect/FilterPillSelect.tsx` + `.css` under `FilterPill/`.
- `packages/flotable/src/FloTable/filters/FilterBar/FilterBar.test.tsx` — tests.

**Subtasks:** detailed once the decision is made. They will cover at least:
- [ ] Tests first: choosing a select option still filters on the value and shows the label; the "All" option still clears; number/date still commit on Enter.
- [ ] Select: themed chevron, colours from `--_flotable-pill-*`, works in dark mode and with `inheritTheme`.
- [ ] Number: no native spinners, `inputMode="decimal"`, right width.
- [ ] Date: calendar icon and picker follow the light/dark theme.
- [ ] Check the demo `/toolbar-search/` and `/theming` pages in light and dark mode.
