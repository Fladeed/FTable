# FloTable

[![npm version](https://img.shields.io/npm/v/flotable.svg)](https://www.npmjs.com/package/flotable)
[![license](https://img.shields.io/npm/l/flotable.svg)](./LICENSE)
[![zero dependencies](https://img.shields.io/badge/dependencies-0-brightgreen.svg)]()

An open-source, **zero-dependency** table component built for ERP-style applications. Handles sorting, filtering, pagination, and rich column types out of the box — with full style customization and no runtime baggage.

**[Live Demo](https://flotable.fladeed.com)**

---

## Features

- **Zero runtime dependencies** — only React as a peer dependency
- **7 built-in column types** — text, number, date, boolean, badge, currency, link
- **Quick filters** — inline per-column filter pills in the header
- **Sorting** — single-column sorting with visual indicators
- **Pagination** — built-in page controls with configurable page size
- **Custom renderers** — override any column with a `render` function
- **Two data modes** — controlled (`data` prop) or self-managed (`request` prop for async fetching)
- **Full style control** — CSS custom properties, `classNames` API, and `styles` prop for every table slot
- **Framework-agnostic styling** — ships plain CSS in `@layer flotable`, works with Tailwind, CSS Modules, or vanilla CSS
- **Responsive primitives** — opt-in column priority, card view, sticky toolbar, mobile filters sheet, infinite scroll, and 44 px touch targets

---

## Installation

```bash
npm install flotable
```

FloTable requires **React 18+** as a peer dependency.

---

## Quick Start

```tsx
import { FloTable } from 'flotable';
import 'flotable/dist/flotable.css';

const columns = [
  { key: 'name',   header: 'Name',   type: 'text' as const },
  { key: 'email',  header: 'Email',  type: 'text' as const },
  { key: 'role',   header: 'Role',   type: 'badge' as const, badgeColors: { Admin: '#e0f2fe', User: '#f0fdf4' } },
  { key: 'salary', header: 'Salary', type: 'currency' as const, currency: 'USD' },
];

const data = [
  { name: 'Alice', email: 'alice@example.com', role: 'Admin', salary: 95000 },
  { name: 'Bob',   email: 'bob@example.com',   role: 'User',  salary: 72000 },
];

function App() {
  return (
    <FloTable
      columns={columns}
      data={data}
      totalRows={data.length}
      page={1}
      onPageChange={(p) => console.log('Page:', p)}
    />
  );
}
```

### Request Mode (Async Data Fetching)

```tsx
<FloTable
  columns={columns}
  pageSize={20}
  request={async ({ page, pageSize, sortState, quickFilters }) => {
    const res = await fetch(`/api/users?page=${page}&size=${pageSize}`);
    const json = await res.json();
    return { data: json.rows, totalRows: json.total };
  }}
/>
```

---

## Column Types

| Type | Description | Extra Props |
|------|-------------|-------------|
| `text` | Plain text | — |
| `number` | Formatted number | `locale` |
| `date` | Formatted date string | `locale` |
| `boolean` | Checkmark / cross icon | — |
| `badge` | Colored pill for enum values | `badgeColors` |
| `currency` | Formatted money value | `currency`, `locale` |
| `link` | Clickable URL | — |

Any column can use a custom `render` function to override the default renderer.

---

## Styling & Customization

FloTable ships plain CSS wrapped in `@layer flotable`. Every visual token uses a CSS custom property with a fallback, so you can theme the entire table without touching source files.

### CSS Custom Properties

Override tokens on the root element or via the `styles` prop:

```css
.my-table {
  --flotable-border-color: #e5e7eb;
  --flotable-header-bg: #f9fafb;
  --flotable-row-hover-bg: #f3f4f6;
  --flotable-font-size: 14px;
}
```

### classNames API

Pass custom class names to any table slot:

```tsx
<FloTable
  classNames={{
    root: 'my-table',
    header: 'my-header',
    row: 'my-row',
    cell: 'my-cell',
    pagination: 'my-pagination',
    filterBar: 'my-filters',
  }}
  // ...
/>
```

### Tailwind CSS Integration

If your app uses Tailwind, declare the `flotable` layer before your Tailwind import so utility classes passed via `classNames` reliably override component defaults:

```css
/* globals.css */
@layer flotable;         /* lowest priority — component defaults */
@import "tailwindcss"; /* utilities layer beats flotable */
```

---

## Responsive

FloTable ships a set of **opt-in** primitives that make a single table component usable on phone-width screens without rewriting your data layer or layout. All defaults are backward-compatible — set no props and behavior is unchanged.

### Breakpoint

At or below `mobileBreakpoint` (default `640` px), the table sets `data-flotable-mobile="true"` on its root and activates the responsive features below. Detection is done via `window.matchMedia` and is SSR-safe.

```tsx
<FloTable mobileBreakpoint={768} ... />
```

### Column priority

Declare a numeric `priority` per column; columns with `priority` strictly less than the table's `mobileColumnPriority` (default `2`) are hidden on mobile. Columns without `priority` are treated as `Infinity` (always visible).

```tsx
const columns = [
  { key: 'id',       header: 'ID',       type: 'number',   priority: 3 },
  { key: 'name',     header: 'Name',     type: 'text',     priority: 3 },
  { key: 'status',   header: 'Status',   type: 'badge',    priority: 2 },
  { key: 'channel',  header: 'Channel',  type: 'text',     priority: 1 }, // hidden on mobile
];

<FloTable columns={columns} mobileColumnPriority={2} ... />
```

### Card view

Set `mobileVariant="card"` to switch the data rows to a stacked card layout on mobile. Each card is auto-derived from the (priority-filtered) columns as a list of `header: value` rows. Pass `renderCard` for full control.

```tsx
<FloTable mobileVariant="card" ... />

<FloTable
  mobileVariant="card"
  renderCard={(row) => <MyCustomCard row={row} />}
  ...
/>
```

`mobileVariant="table"` forces the desktop table layout even below the breakpoint (opt-out).

#### Optional view toggle

Pass `showViewToggle` to render an icon button in the toolbar that flips between table and card view at any width. The initial view follows `mobileVariant` + the current viewport; once the user clicks the toggle, their choice overrides automatic switching.

```tsx
<FloTable
  showViewToggle
  // optionally swap icons
  tableViewIcon={<MyRowsIcon />}
  cardViewIcon={<MyCardsIcon />}
  viewToggleLabels={{ showTable: 'Voir en tableau', showCard: 'Voir en cartes' }}
  // or replace the button entirely
  renderViewToggle={({ view, onToggle, label }) => (
    <MyButton aria-label={label} onClick={onToggle}>
      {view === 'card' ? '☰' : '▤'}
    </MyButton>
  )}
  ...
/>
```

### Sticky toolbar

`stickyToolbar` pins the toolbar (filter bar + bulk-action bar) to the top of the nearest scrolling parent via `position: sticky`.

```tsx
<div style={{ height: 600, overflow: 'auto' }}>
  <FloTable stickyToolbar ... />
</div>
```

Override the offset with `--flotable-toolbar-sticky-top` (defaults to `0`).

### Mobile filters sheet

On mobile, the inline filter-pill row is replaced by a single "Filters" trigger button (funnel icon + active count badge). Clicking it opens a portal-rendered bottom-sheet modal containing all filter fields as a vertical form. This is always on when `isMobile` is true and `filterDefs.length > 0` — no extra prop needed.

Customize:

```tsx
<FloTable
  // swap the funnel icon for any ReactNode
  mobileFilterIcon={<MyFilterIcon />}
  // or replace the trigger button entirely
  renderMobileFilterTrigger={({ activeCount, onOpen, label }) => (
    <MyButton onClick={onOpen}>
      {label} {activeCount > 0 && <Badge>{activeCount}</Badge>}
    </MyButton>
  )}
  ...
/>
```

### Infinite scroll

In `request` mode, mobile pagination is automatically replaced by sentinel-driven infinite scroll. Rows accumulate as the user scrolls; sort / filter / `pageSize` changes (and crossing the breakpoint) reset to page 1. The `request` function is called the same way — only the rendered UI changes.

```tsx
<FloTable
  request={async ({ page, pageSize, sortState, quickFilters }) => {
    /* same as before */
  }}
  infiniteScrollLabels={{ loading: 'Loading more…', end: 'No more rows.' }}
  // optional: replace the inline loading / end indicators
  renderInfiniteScrollLoading={() => <MySpinner />}
  renderInfiniteScrollEnd={() => <span>End of list</span>}
  ...
/>
```

### Touch targets

When `data-flotable-mobile="true"` is active, the root sets `--flotable-touch-min: 44px`. Pagination buttons, filter pills, the row-actions overflow button, and sortable header cells all pick up a 44 px minimum hit area. Opt out by overriding the variable in your own CSS or via the `styles` prop:

```css
.my-table { --flotable-touch-min: auto; }
```

### Customization slots

Every new element exposes a `classNames` and `styles` slot. See the props reference for the full list (`toolbar`, `card`, `cardLabel`, `cardValue`, `cardSelectRow`, `cardActionsRow`, `mobileFilterButton`, `mobileFilterSheet`, `mobileFilterIcon`, `mobileFilterCount`, `mobileFilterBackdrop`, `mobileFilterHeader`, `mobileFilterClearAll`, `mobileFilterClose`, `mobileFilterBody`, `mobileFilterRow`, `mobileFilterRowLabel`, `mobileFilterInput`, `mobileFilterFooter`, `mobileFilterDone`, `infiniteScroll`, `infiniteScrollLoading`, `infiniteScrollSpinner`, `infiniteScrollEnd`, `viewToggle`).

### Migration

No action required. With no responsive props set, FloTable behaves exactly as before. Opt in feature-by-feature.

---

## Props Reference

### Common Props

| Prop | Type | Description |
|------|------|-------------|
| `columns` | `ColumnDef<T>[]` | Column definitions (required) |
| `pageSize` | `number` | Rows per page (default: 10) |
| `filterDefs` | `FilterDef[]` | Explicit filter pill definitions |
| `autoFilters` | `boolean` | Auto-generate filter pills from `filterable` columns |
| `showSearch` | `boolean` | Show a global search input in the filter bar |
| `classNames` | `FloTableClassNames` | Custom CSS classes for each table slot |
| `styles` | `FloTableStyles` | Inline styles / CSS custom properties for each slot |
| `mobileBreakpoint` | `number` | Viewport width (px) at or below which responsive primitives activate. Default `640`. |
| `mobileVariant` | `'auto' \| 'card' \| 'table'` | Mobile rendering mode. `'auto'` keeps the table, `'card'` switches to cards, `'table'` opts out. Default `'auto'`. |
| `mobileColumnPriority` | `number` | Columns with `priority` strictly less than this are hidden on mobile. Default `2`. |
| `renderCard` | `(row, index) => ReactNode` | Custom card renderer for `mobileVariant: 'card'`. |
| `stickyToolbar` | `boolean` | Pin the toolbar to the top of its scroll container. Default `false`. |
| `mobileFilterIcon` | `ReactNode` | Swap the default funnel icon inside the mobile filters trigger. |
| `renderMobileFilterTrigger` | `(ctx) => ReactNode` | Fully replace the mobile filters trigger button. |
| `infiniteScrollLabels` | `{ loading?: string; end?: string }` | Translate the loading / end-of-list strings shown during infinite scroll. |
| `renderInfiniteScrollLoading` | `() => ReactNode` | Replace the inline loader rendered while the next infinite-scroll page loads. |
| `renderInfiniteScrollEnd` | `() => ReactNode` | Replace the end-of-list indicator rendered after the last row. |
| `showViewToggle` | `boolean` | Render a toolbar button that lets the user flip between table and card view. Default `false`. |
| `tableViewIcon` | `ReactNode` | Swap the default "rows" icon shown on the view toggle when current view is card. |
| `cardViewIcon` | `ReactNode` | Swap the default "cards" icon shown on the view toggle when current view is table. |
| `viewToggleLabels` | `{ showTable?: string; showCard?: string }` | Translate the view-toggle aria-label / tooltip. |
| `renderViewToggle` | `(ctx) => ReactNode` | Fully replace the view-toggle button. |

### Data Mode Props

| Prop | Type | Description |
|------|------|-------------|
| `data` | `T[]` | Current page rows |
| `totalRows` | `number` | Total row count across all pages |
| `page` | `number` | Active page (1-based) |
| `onPageChange` | `(page: number) => void` | Page navigation callback |
| `sortState` | `SortState<T> \| null` | Current sort state |
| `onSortChange` | `(sort: SortState<T> \| null) => void` | Sort change callback |
| `quickFilters` | `QuickFilterState` | Active filter values |
| `onFilterChange` | `(filters: QuickFilterState) => void` | Filter change callback |

### Request Mode Props

| Prop | Type | Description |
|------|------|-------------|
| `request` | `FloTableRequestFn<T>` | Async function called on mount and on every state change |

---

## Project Structure

```
packages/flotable/     # The published npm package
apps/demo/           # Next.js demo app (not published)
```

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for setup instructions, code style rules, and the PR workflow.

---

## License

[MIT](./LICENSE) — Copyright (c) 2026 Fladeed
