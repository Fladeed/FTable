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

---

## Theming

FloTable adapts to your app's theme automatically. There are three layers, from "no config" to "full control":

### Layer 1 — Ecosystem auto-pickup (zero config)

Every core color/typography token resolves through an alias chain that includes the well-known token names from popular design systems:

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
| font-family | — | `--font-sans` | `--mui-typography-fontFamily` |

If your app already defines any of those (e.g. shadcn projects always do), the table picks them up — **no `styles` prop needed**.

```tsx
// Just drop the table in. It'll inherit your app's shadcn / Tailwind tokens.
<FloTable columns={columns} data={data} totalRows={data.length} page={1} onPageChange={setPage} />
```

### Layer 2 — Built-in dark mode

The table flips to dark automatically when any common selector is present on an ancestor:

- `.dark` (Tailwind dark variant)
- `[data-theme="dark"]` (next-themes default, Antd, custom)
- `[data-mode="dark"]`
- OS-level `prefers-color-scheme: dark` (unless explicitly opted out via `[data-theme="light"]` / `.light`)

Works out of the box with [next-themes](https://github.com/pacocoursey/next-themes) and any equivalent toggle. Non-aliased color tokens (filter pills, dropdowns, skeletons, etc.) re-derive from the resolved core tokens, so the whole component swaps coherently.

### Layer 3 — Explicit overrides (escape hatch)

The `--flotable-*` tokens always win over the alias chain, so you can override any specific token without giving up the auto-pickup elsewhere. Two ways:

**Via the `styles` prop** (per-instance):

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

### Tailwind CSS Integration

If your app uses Tailwind, declare the `flotable` layer before your Tailwind import so utility classes passed via `classNames` reliably override component defaults:

```css
/* globals.css */
@layer flotable;         /* lowest priority — component defaults */
@import "tailwindcss"; /* utilities layer beats flotable */
```

### Notes for legacy shadcn (HSL channel format)

If your project still uses the older shadcn convention where tokens are stored as raw HSL channels (e.g. `--background: 0 0% 100%` and you write `hsl(var(--background))`), bridge them with a one-line wrapper:

```css
.flotable-root {
  --flotable-bg: hsl(var(--background));
  --flotable-color: hsl(var(--foreground));
  --flotable-border-color: hsl(var(--border));
  /* … */
}
```

Newer shadcn (oklch values) and Tailwind v4 `@theme` are picked up natively without wrapping.

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
| `classNames` | `FloTableClassNames` | Custom CSS classes for each table slot |
| `styles` | `FloTableStyles` | Inline styles / CSS custom properties for each slot |

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
