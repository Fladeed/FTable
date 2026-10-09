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
- **Table actions** — selection-independent toolbar buttons (e.g. "New product") via `tableActions`, plus a free `toolbarEnd` slot for custom controls
- **Custom renderers** — override any column with a `render` function
- **Two data modes** — controlled (`data` prop) or self-managed (`request` prop for async fetching)
- **Full style control** — CSS custom properties, `classNames` API, and `styles` prop for every table slot
- **Framework-agnostic styling** — ships plain CSS in `@layer flotable`, works with Tailwind, CSS Modules, or vanilla CSS

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

## Expandable Rows (Parent / Child)

Pass `getChildren` to turn any row into an expandable **parent** that reveals inline **child**
rows. A chevron appears only for rows that have children. Children can have their own column
layout (`childColumns`) and a different row type than the parent — `FloTable<Parent, Child>`.
Parent columns can render an **aggregate** of their children. Works in both data and request mode,
and adds zero runtime dependencies.

```tsx
import { FloTable, type ColumnDef } from 'flotable';

interface Variant { id: string; option: string; sku: string; price: number; stock: number; }
interface Product {
  id: string; name: string; price: number; status: string; variants: Variant[];
}

const productColumns: ColumnDef<Product, Variant>[] = [
  { key: 'name', header: 'Name' },
  {
    key: 'variantCount',
    header: 'Variants',
    sortable: false,
    aggregate: (children) => (children.length ? `${children.length} variants` : '—'),
  },
  {
    key: 'price',
    header: 'Price',
    type: 'currency',
    aggregate: (children) => {
      const prices = children.map((v) => v.price);
      const [min, max] = [Math.min(...prices), Math.max(...prices)];
      return min === max ? `$${min}` : `$${min}–$${max}`;
    },
  },
  { key: 'status', header: 'Status', type: 'badge' },
];

const variantColumns: ColumnDef<Variant>[] = [
  { key: 'option', header: 'Option' },
  { key: 'sku', header: 'SKU' },
  { key: 'price', header: 'Price', type: 'currency' },
  { key: 'stock', header: 'Stock', type: 'number' },
];

<FloTable<Product, Variant>
  columns={productColumns}
  childColumns={variantColumns}
  getChildren={(product) => product.variants}   // undefined / [] ⇒ no chevron
  defaultExpanded={false}                        // or (row) => boolean
  expandOn="chevron"                             // or "row"
  showSearch                                     // searching variants auto-expands their parent
  data={products}
  totalRows={products.length}
  page={page}
  onPageChange={setPage}
/>
```

**Behavior**

- The chevron renders only when `getChildren(row)` returns a non-empty array.
- Children are mounted only while their parent is expanded; collapsing animates closed, then
  unmounts them. Opening and closing animate via pure-CSS grid keyframes.
- Request-mode children are cached per parent: collapsing and re-expanding reuses what was already
  loaded. The cache is dropped when the parent row object changes (e.g. after the table refetches).
  Use `onExpandedChange` to observe the expanded parent keys.
- Global **search** matches child rows too: a matching child auto-expands its parent and is
  highlighted.
- **Sorting** and **pagination** apply to parents; child order is whatever `getChildren` returns.
- **Labels:** every expandable-rows string is overridable via `childRowsLabels`
  (`expand`, `collapse`, `empty`, `retry`, `loading`).

### Children: data mode vs request mode

Expanded children render in a **fixed-height scroll box** (a few rows tall, then it scrolls
internally — it doesn't take over the page) whose columns are kept **aligned under the parent
headers**. Children load with **infinite scroll** (`childPageSize` is the batch size
revealed/fetched as you scroll), not a pager:

- **Data mode** — `getChildren(row)` returns the children already in memory; they are revealed in
  batches of `childPageSize` as you scroll the box.
- **Request mode** — `childRequest(row, { page, pageSize })` fetches the first batch the first time
  a parent expands, then the next batch is fetched and appended as you scroll, resolving
  `{ data, totalRows }`. A loading skeleton and error/retry are handled internally. Loaded children
  are cached across collapse / expand, and re-fetched when the parent row object changes (e.g.
  after the table refetches). Use
  `rowHasChildren(row)` to control which parents show a chevron before children load.

The box height is set with the `--flotable-child-scroll-max-height` CSS variable (default ~5 rows).

```tsx
<FloTable<Product, Variant>
  columns={productColumns}
  childColumns={variantColumns}
  childPageSize={5}
  rowHasChildren={(p) => p.variantCount > 0}
  childRequest={async (product, { page, pageSize }) => {
    const res = await fetch(`/api/products/${product.id}/variants?page=${page}&size=${pageSize}`);
    return res.json(); // => { data: Variant[], totalRows: number }
  }}
  data={products}
  totalRows={products.length}
  page={page}
  onPageChange={setPage}
/>
```

> Use either `getChildren` (data mode) or `childRequest` (request mode) — not both. Aggregate
> columns require the children in memory, so they apply to data mode.

## Table Actions

`tableActions` renders buttons at the end of the toolbar, after the filter pills and any inline bulk actions. Use it for the page's main action ("New product", "New refund") and for other actions that do not depend on row selection ("Export", "Refresh").

- Actions never receive row context and stay enabled while rows are selected and the bulk action bar is shown.
- They are pushed to the end side with `margin-inline-start: auto`, so they move to the left under `direction="rtl"`.
- When `tableActions` is non-empty, the toolbar renders even if there is no search, filter pill or bulk action. When it is omitted or empty, nothing changes.
- Works in both data mode and request mode.

```tsx
import { FloTable } from 'flotable';
import type { TableAction } from 'flotable';

const tableActions: TableAction[] = [
  { key: 'new', label: 'New product', icon: <PlusIcon />, variant: 'primary', onClick: () => openCreateDialog() },
  { key: 'export', label: 'Export', onClick: () => exportCsv() },
];

<FloTable columns={columns} request={fetchProducts} showSearch tableActions={tableActions} />;
```

### `toolbarEnd`: custom controls

`toolbarEnd` is a free `ReactNode` slot rendered at the end side of the toolbar, just **before** `tableActions`. Use it for controls that are not plain buttons, such as a period picker that opens a popover or a native `<select>`.

| Use | When |
|-----|------|
| `tableActions` | Plain buttons (label, optional icon, click handler). FloTable styles them and handles a11y. |
| `toolbarEnd` | Anything else: pickers, selects, popovers, segmented controls. You render and style it. |

```tsx
<FloTable
  columns={columns}
  request={fetchRefunds}
  toolbarEnd={<PeriodPicker value={period} onChange={setPeriod} />}
  tableActions={[{ key: 'new', label: 'New refund', variant: 'primary', onClick: openCreate }]}
/>
```

- The toolbar order is: filter bar (grows), inline bulk actions, `toolbarEnd`, `tableActions`. The first end-side group that is present gets `margin-inline-start: auto`, so both groups stay together at the end and mirror under RTL.
- Popovers are safe. Neither the toolbar nor the slot wrapper sets `overflow`, and the wrapper (`.flotable__toolbar-end`) is `position: relative`, so a child's `position: absolute` panel anchors to it and can overlap the table.
- The wrapper is a flex row (`gap: var(--flotable-toolbar-end-gap, 0.5rem)`) aligned with the filter pills (`align-self: center`).
- When set (anything other than `null`, `undefined` or a boolean), the toolbar renders even if nothing else is in it. It is independent of row selection.
- Style the wrapper with `classNames.toolbarEnd` / `styles.toolbarEnd`.

### `TableAction`

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `key` | `string` | — | Unique key (required) |
| `label` | `string` | — | Button text (required). FloTable adds no text of its own, so translate it here |
| `icon` | `ReactNode` | — | Rendered before the label, hidden from assistive tech |
| `onClick` | `() => void` | — | Click handler (required). Receives no arguments |
| `disabled` | `boolean` | `false` | Sets the `disabled` attribute on the button |
| `variant` | `'primary' \| 'default'` | `'default'` | `'primary'` for the page's main action (one per table) |
| `ariaLabel` | `string` | `label` | Accessible name when the label alone is not enough |

### Styling

`classNames` / `styles` slots:

| Slot | Element |
|------|---------|
| `tableActions` | Container `<div>` (`.flotable-table-actions`) |
| `tableAction` | Each `<button>` (`.flotable-table-actions__btn`) |
| `tableActionPrimary` | The `variant: 'primary'` button (`.flotable-table-actions__btn--primary`), applied on top of `tableAction` |
| `toolbarEnd` | The `toolbarEnd` slot wrapper `<div>` (`.flotable__toolbar-end`) |

CSS custom properties:

| Token | Default |
|-------|---------|
| `--flotable-table-action-gap` | `0.5rem` |
| `--flotable-table-action-padding` | `0.375rem 0.75rem` |
| `--flotable-table-action-radius` | `var(--flotable-row-action-radius, 4px)` |
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
| `--flotable-table-action-focus-ring` | `#2563eb` (2px `:focus-visible` outline) |
| `--flotable-toolbar-end-gap` | `0.5rem` (gap between `toolbarEnd` children) |

---

## Theming

FloTable ships with a light palette, a built-in dark palette, and an optional bridge to your design system's CSS variables. Every colour is a CSS custom property, so there are three layers, from "no config" to "full control":

### Layer 1 — Built-in dark mode (zero config)

The table switches to its dark palette when any of these common conventions is present on an ancestor (`<html>`, `<body>` or any wrapper):

- `.dark` (Tailwind `dark:` variant, shadcn/ui)
- `[data-theme="dark"]` (next-themes default, Ant Design, most custom toggles)
- `[data-mode="dark"]`

FloTable never reads `prefers-color-scheme` itself, so a light-only app stays light whatever the OS setting. For OS-driven dark mode, have your theme toggle set one of the selectors above ([next-themes](https://github.com/pacocoursey/next-themes) does this for you). Filter pills, dropdowns, skeletons, badges and child rows derive their dark colours from the core palette, so the whole component flips coherently.

### Layer 2 — Inherit your design system (`inheritTheme`)

Pass `inheritTheme` and the core colour / typography tokens fall back to the well-known CSS variables of popular design systems before FloTable's own defaults:

| FloTable token | shadcn / ui | Tailwind v4 `@theme` | MUI (CSS variables mode) |
|---|---|---|---|
| bg | `--background` | `--color-background` | `--mui-palette-background-default` |
| color | `--foreground` | `--color-foreground` | `--mui-palette-text-primary` |
| muted | `--muted-foreground` | `--color-muted-foreground` | `--mui-palette-text-secondary` |
| border | `--border` | `--color-border` | `--mui-palette-divider` |
| header bg | `--muted` | `--color-muted` | — |
| row hover | `--accent` | `--color-accent` | — |
| primary / link | `--primary` | `--color-primary` | `--mui-palette-primary-main` |
| danger | `--destructive` | `--color-destructive` | `--mui-palette-error-main` |
| focus ring | `--ring` | `--color-ring` | — |
| radius | `--radius` | `--radius` | — |
| font-family | — | `--font-sans` | — |

```tsx
// Inherits the surrounding shadcn / Tailwind tokens — no styles prop needed.
<FloTable inheritTheme columns={columns} data={data} totalRows={data.length} page={1} onPageChange={setPage} />
```

This is opt-in on purpose: the names are generic (an app may define `--border` or `--primary` for unrelated reasons), and shadcn projects on Tailwind v3 store bare HSL channels (`--background: 0 0% 100%`) that are not valid colours on their own.

**Legacy shadcn (HSL channels).** Instead of `inheritTheme`, bridge the tokens explicitly:

```css
.flotable-root {
  --flotable-bg: hsl(var(--background));
  --flotable-color: hsl(var(--foreground));
  --flotable-border-color: hsl(var(--border));
  /* … */
}
```

Newer shadcn (oklch values) and Tailwind v4 `@theme` work with `inheritTheme` as-is.

### Layer 3 — Explicit overrides

A `--flotable-*` token always wins over both the dark palette and inherited tokens, so you can pin any single value without giving up the rest. Set them on any ancestor in CSS, or per instance:

**Via the `styles` prop:**

```tsx
<FloTable
  // ...
  styles={{
    wrapper: {
      '--flotable-bg': '#0f172a',
      '--flotable-color': '#e2e8f0',
      '--flotable-row-hover-bg': '#1e293b',
    },
  }}
/>
```

**Via `classNames` for class-based styling** (e.g. utility frameworks):

```tsx
<FloTable
  // ...
  classNames={{
    root: 'my-table',
    header: 'my-header',
    row: 'my-row',
    cell: 'my-cell',
    pagination: 'my-pagination',
    filterBar: 'my-filters',
  }}
/>
```

### Private tokens (`--_flotable-*`)

Anything prefixed with an underscore (`--_flotable-bg`, `--_flotable-pill-bg-default`, …) is internal plumbing: the resolved value of a public token after the override → inherit → default chain. These names are **not** part of the public API, may change in any release, and must not be set by consumers — always set the un-prefixed `--flotable-*` token instead.

### Tailwind CSS Integration

If your app uses Tailwind, declare the `flotable` layer before your Tailwind import so utility classes passed via `classNames` reliably override component defaults:

```css
/* globals.css */
@layer flotable;         /* lowest priority — component defaults */
@import "tailwindcss"; /* utilities layer beats flotable */
```

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
| `getChildren` | `(row: T) => C[] \| undefined` | Data mode: returns a row's children; enables expandable rows |
| `childRequest` | `(row, { page, pageSize }) => Promise<{ data: C[]; totalRows: number }>` | Request mode: lazily fetch a parent's children |
| `rowHasChildren` | `(row: T) => boolean` | Request mode: chevron visibility before children load |
| `childPageSize` | `number` | Batch size for a parent's children (infinite scroll, default: 5) |
| `childRowKey` | `string` | Child row key field (default: `'id'`) |
| `childColumns` | `ColumnDef<C>[]` | Column layout for child rows (defaults to `columns`) |
| `defaultExpanded` | `boolean \| ((row: T) => boolean)` | Initial expanded state per parent (default `false`) |
| `onExpandedChange` | `(expandedKeys: string[]) => void` | Called with expanded parent keys on toggle |
| `expandOn` | `'chevron' \| 'row'` | What toggles expansion (default `'chevron'`) |
| `childRowsLabels` | `ChildRowsLabels` | Expandable-rows text: `expand` (`'Expand row'`), `collapse` (`'Collapse row'`), `empty` (`'No items'`), `retry` (`'Retry'`), `loading` (`'Loading…'`) |
| `labels` | `FloTableLabels` | Built-in text: `empty` (`'No data'`), `retry` (`'Retry'`), `searchPlaceholder` (`'Search…'`), `search` (`'Search'`), `selectRow` (`'Select row'`), `selectAllRows` (`'Select all rows'`), `moreActions` (`'More actions'`), `closeFilter` (`'Close filter'`), `clearFilter` (`(label) => 'Clear ' + label`), `filterAll` (`'All'`), `booleanTrue` (`'Yes'`), `booleanFalse` (`'No'`) |
| `tableActions` | `TableAction[]` | Selection-independent buttons at the end of the toolbar (see [Table Actions](#table-actions)) |
| `toolbarEnd` | `ReactNode` | Custom controls at the end of the toolbar, before `tableActions` (see [`toolbarEnd`](#toolbarend-custom-controls)) |
| `renderInlineBulkActions` | `(ctx: BulkActionBarContext<T>) => ReactNode` | Custom bulk-action content inline in the toolbar; always receives the selection context. For selection-independent actions use `tableActions` |
| `classNames` | `FloTableClassNames` | Custom CSS classes for each table slot |
| `styles` | `FloTableStyles` | Inline styles / CSS custom properties for each slot |
| `inheritTheme` | `boolean` | Inherit shadcn / Tailwind v4 / MUI CSS variables for the core colour tokens (default `false`) |

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
