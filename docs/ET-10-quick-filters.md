# ET-10 — Quick Filters (per-column inline header filters)

## Overview

Add inline quick filters to each column header in FloTable. Each column gets a filter input rendered in a second `<tr>` directly below the header label row. Filter state is controlled (owned by the consumer, like `sortState`), enabling real API consumers to send `quickFilters` as query params while the demo simulates filtering client-side.

Jira: https://fladeed.atlassian.net/browse/ET-10

## Problem

FloTable currently has no filtering. The header renders label + sort indicator only. ET-10 requires per-column, inline filter inputs that adapt to the column's field type:

- `text`, `link` → `<input type="text">` (contains match)
- `number`, `currency` → `<input type="number">` (equals match)
- `date` → `<input type="date">` (equals match)
- `boolean` → `<select>` with All / Yes / No
- `badge` → `<input type="text">` (contains match)

## Suggested Solution

Follow the **controlled state pattern** already established by `sortState`:

1. Add `QuickFilterState<T>` to `FloTable.types.ts` — a `Partial<Record<keyof T & string, string>>` where string values are always strings regardless of column type (boolean gets `"true"/"false"/""`, number gets its string representation). This keeps the state serialisable and uniform.
2. Create `QuickFilterRow` in `src/components/FloTable/filters/` — a sibling `<tr>` rendered inside `<thead>`, one `<td>` per column containing the appropriate input.
3. Update `TableHeader` to accept filter props and render `QuickFilterRow` as a second row in `<thead>`.
4. Update `FloTable` to accept `quickFilters` and `onFilterChange` and pass them down.
5. Update the Demo to manage filter state and apply client-side filtering (via a new `applyFilters` helper in `demoUtils`). Filter changes reset the page to 1.

## Task Checklist

### Phase 1: Types

#### Task 1.1: Add QuickFilterState type and update props interfaces — ⬜ TODO

**Files to create or modify:**
- `src/components/FloTable/FloTable.types.ts` — add `QuickFilterState<T>`, update `FloTableProps<T>` and `TableHeaderProps<T>`

**References:**
- Existing `SortState<T>` and `sortState`/`onSortChange` pattern in `FloTable.types.ts`

**Subtasks:**
- Add `export type QuickFilterState<T extends object> = Partial<Record<keyof T & string, string>>` to `FloTable.types.ts`
- Add `quickFilters?: QuickFilterState<T>` to `FloTableProps<T>`
- Add `onFilterChange?: (filters: QuickFilterState<T>) => void` to `FloTableProps<T>`
- Add `quickFilters: QuickFilterState<T>` to `TableHeaderProps<T>`
- Add `onFilterChange: (filters: QuickFilterState<T>) => void` to `TableHeaderProps<T>`

---

### Phase 2: QuickFilterRow component

#### Task 2.1: Create QuickFilterRow component — ⬜ TODO

**Files to create or modify:**
- `src/components/FloTable/filters/QuickFilterRow.tsx` — new component
- `src/components/FloTable/filters/QuickFilterRow.css` — new styles

**References:**
- `TableHeader.tsx` for the `<tr>` / `<th>` structure pattern
- `FloTable.types.ts` for `ColumnDef<T>`, `ColumnType`, `QuickFilterState<T>`
- `TableHeader.css` for existing BEM naming conventions (`flotable__*`)

**Subtasks:**
- Create `QuickFilterRowProps<T extends object>` interface with `columns: ColumnDef<T>[]`, `filters: QuickFilterState<T>`, `onChange: (key: keyof T & string, value: string) => void`
- Implement `QuickFilterRow` — for each column render a `<th>` with the appropriate input element based on `col.type`:
  - `boolean` → `<select>` with options `""` (All), `"true"` (Yes), `"false"` (No)
  - `number` / `currency` → `<input type="number" />`
  - `date` → `<input type="date" />`
  - all others (text, badge, link, undefined) → `<input type="text" />`
- Each input's `value` comes from `filters[col.key] ?? ""` and `onChange` calls the `onChange` prop
- Create `QuickFilterRow.css` with BEM class `.flotable__filter-row`, `.flotable__filter-cell`, `.flotable__filter-input`, `.flotable__filter-select` using `var(--flotable-*)` tokens with fallbacks
- Import `QuickFilterRow.css` in `QuickFilterRow.tsx`

---

### Phase 3: TableHeader integration

#### Task 3.1: Render QuickFilterRow inside TableHeader — ⬜ TODO

**Files to create or modify:**
- `src/components/FloTable/TableHeader/TableHeader.tsx` — add filter row rendering
- `src/components/FloTable/TableHeader/TableHeader.css` — no changes expected (styles live in `QuickFilterRow.css`)

**References:**
- `QuickFilterRow.tsx` just created
- Existing `TableHeader.tsx` structure with `<thead>` containing one `<tr>`

**Subtasks:**
- Import `QuickFilterRow` into `TableHeader.tsx`
- Add `quickFilters` and `onFilterChange` to the destructured `TableHeaderProps<T>` parameters
- Implement `handleFilterChange(key: keyof T & string, value: string)` inside `TableHeader` — builds the updated filter state: if `value` is empty, omit the key from the state object (to keep the state clean); otherwise set it: `{ ...quickFilters, [key]: value }` or delete the key
- Render `<QuickFilterRow columns={columns} filters={quickFilters} onChange={handleFilterChange} />` as a second `<tr>` inside `<thead>` (after the label row)

---

### Phase 4: FloTable integration

#### Task 4.1: Pass filter props through FloTable — ⬜ TODO

**Files to create or modify:**
- `src/components/FloTable/FloTable.tsx` — accept and pass `quickFilters` + `onFilterChange`

**References:**
- Existing `sortState`/`onSortChange` pattern in `FloTable.tsx`

**Subtasks:**
- Destructure `quickFilters = {}` and `onFilterChange` from `FloTableProps<T>` in `FloTable.tsx`
- Pass `quickFilters` and `onFilterChange` to `<TableHeader />`
- When `onFilterChange` fires inside `FloTable` (via the header callback), call `onPageChange(1)` to reset pagination — implement a `handleFilterChange` wrapper in `FloTable.tsx` that calls `onFilterChange` then `onPageChange(1)`

---

### Phase 5: Demo update

#### Task 5.1: Add applyFilters helper to demoUtils — ⬜ TODO

**Files to create or modify:**
- `src/demo/demoUtils.ts` — add `applyFilters` export

**References:**
- `demoUtils.ts` existing `applySorting` helper
- `QuickFilterState<T>` type from `FloTable.types.ts`

**Subtasks:**
- Add `export function applyFilters<T extends object>(data: T[], filters: QuickFilterState<T>): T[]`
- Iterate over each key in `filters`; for each non-empty value, filter rows where `String(row[key]).toLowerCase().includes(filterValue.toLowerCase())` for text-like types, or for `boolean` columns compare `String(row[key]) === filterValue`, or exact match for `number`/`date` columns (use `String(row[key]) === filterValue`)
- Since `applyFilters` doesn't know the column type, implement a **unified approach**: for boolean values use equality, for number/date values use equality, for strings use case-insensitive contains — detect by checking `typeof row[key]`

#### Task 5.2: Wire filter state into Demo — ⬜ TODO

**Files to create or modify:**
- `src/demo/Demo.tsx` — add filter state, wire `applyFilters`, pass props to FloTable

**References:**
- Existing `sortState` / `setSortState` / `applySorting` pattern in `Demo.tsx`
- `applyFilters` just added to `demoUtils.ts`

**Subtasks:**
- Import `applyFilters` from `./demoUtils`
- Import `QuickFilterState` type from `@/components/FloTable/FloTable.types`
- Add `const [filterState, setFilterState] = useState<QuickFilterState<Employee>>({})` 
- Update the `useMemo` for `sortedData` to also apply `applyFilters` first: `applyFilters(ALL_DATA, filterState)` → then sort
- Reset `page` to 1 inside `handleFilterChange`: `setPage(1); setFilterState(f)`  
  (or use `onFilterChange={(f) => { setFilterState(f); setPage(1); }}` inline)
- Pass `quickFilters={filterState}` and `onFilterChange` to `<FloTable />`
