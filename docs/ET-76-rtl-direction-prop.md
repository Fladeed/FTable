# ET-76 — RTL support: `direction` prop for FloTable

## Overview

Add bidirectional text support to FloTable by introducing a `direction` prop
(`"ltr" | "rtl"`). Setting `direction="rtl"` makes the table layout flip correctly for
right-to-left languages (Arabic, Hebrew, Persian) using the browser-native `dir`
attribute and CSS logical properties — no new dependencies.

## Problem

FloTable has no `direction` prop. Several CSS rules use physical directional properties
(`text-align: left`, `right: 0`, `margin-left`) that do not respond to `dir="rtl"`. The
fix must leave all existing LTR behaviour unchanged.

## Suggested Solution

1. Add `direction?: 'ltr' | 'rtl'` to `FloTableBaseProps` (defaults to `'ltr'`).
2. Set `dir={direction}` on the root `<div>` wrapper in `FloTable.tsx`. The browser then
   propagates direction to all descendants automatically.
3. Replace each physical directional CSS value with its logical equivalent so the layout
   mirrors correctly without per-direction overrides:

| File | Property | Change |
|---|---|---|
| `TableHeader.css` | `text-align: left` | → `text-align: start` |
| `RowActionsDropdown.css` | `right: 0` | → `inset-inline-end: 0` |
| `RowActionsDropdown.css` | `text-align: left` | → `text-align: start` |
| `FilterPillClear.css` | `margin-left: 0.125rem` | → `margin-inline-start: 0.125rem` |
| `FilterPillField.css` | `margin-left: 0.125rem` (×2) | → `margin-inline-start: 0.125rem` |

4. Add a dedicated RTL demo page to the demo app.

## Task Checklist

### Phase 1: DEV

#### Task 1.1: Add `direction` prop to `FloTableBaseProps` [5 min] — ⬜ TODO

**Files to create or modify:**
- `packages/flotable/src/FloTable/FloTable.types.ts` — add prop to `FloTableBaseProps`

**References:**
- `FloTableBaseProps` interface at line 149
- `filterMode` prop as a style guide for union-string optional props

**Subtasks:**
- [ ] Add `direction?: 'ltr' | 'rtl'` to `FloTableBaseProps` (after the `styles` prop at line 172).

---

#### Task 1.2: Wire `direction` into the root element [5 min] — ⬜ TODO

**Files to create or modify:**
- `packages/flotable/src/FloTable/FloTable.tsx` — destructure prop, add `dir` attribute to root div

**References:**
- `FloTable.tsx:14-25` — destructuring block
- `FloTable.tsx:148` — root `<div>` element

**Subtasks:**
- [ ] Destructure `direction` from `props` in the destructuring block (alongside `styles`).
- [ ] Add `dir={direction}` to the root `<div>` at line 148.

---

#### Task 1.3: Replace physical CSS properties with logical equivalents [10 min] — ⬜ TODO

**Files to create or modify:**
- `packages/flotable/src/FloTable/TableHeader/TableHeader.css` — header cell text alignment
- `packages/flotable/src/FloTable/ActionBar/RowActionsDropdown/RowActionsDropdown.css` — dropdown position + item text alignment
- `packages/flotable/src/FloTable/filters/FilterPill/FilterPillClear/FilterPillClear.css` — clear button margin
- `packages/flotable/src/FloTable/filters/FilterPill/FilterPillField/FilterPillField.css` — close button margin

**References:**
- MDN CSS Logical Properties spec; existing logical property usage in the codebase (none yet — this task introduces them)

**Subtasks:**
- [ ] `TableHeader.css:8` — change `text-align: left` to `text-align: start`.
- [ ] `RowActionsDropdown.css:4` — change `right: 0` to `inset-inline-end: 0`.
- [ ] `RowActionsDropdown.css:23` — change `text-align: left` to `text-align: start`.
- [ ] `FilterPillClear.css:9` — change `margin-left: 0.125rem` to `margin-inline-start: 0.125rem`.
- [ ] `FilterPillField.css:56` — change `margin-left: 0.125rem` (on `.flotable-filter-pill__close`) to `margin-inline-start: 0.125rem`.

---

#### Task 1.4: Add RTL demo page [15 min] — ⬜ TODO

**Files to create or modify:**
- `apps/demo/src/components/RtlDemo/RtlDemo.tsx` — new demo component (create)
- `apps/demo/src/app/rtl-support/page.tsx` — new Next.js route (create)
- `apps/demo/src/app/layout.tsx` or equivalent nav component — add nav link

**References:**
- `apps/demo/src/components/ApiDataSourceDemo/ApiDataSourceDemo.tsx` — component structure to follow
- `apps/demo/src/app/api-data-source/page.tsx` — page file pattern
- Existing nav to find where to add the link

**Subtasks:**
- [ ] Create `RtlDemo.tsx` with two `<FloTable>` instances side-by-side or stacked: one `direction="ltr"` and one `direction="rtl"`, both using the same data (can reuse `ALL_PRODUCTS` from `ApiDataSourceDemo` or a small inline dataset).
- [ ] Add `autoFilters={true}`, `showSearch={true}`, and `rowActions` with at least one action so all directional sub-components are visible.
- [ ] Create `apps/demo/src/app/rtl-support/page.tsx` that renders `<RtlDemo />`.
- [ ] Add a "RTL Support" link to the demo navigation.
