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
- Expansion animates via a pure-CSS grid collapse and is local to the table (preserved scroll
  position). Use `onExpandedChange` to observe the expanded parent keys.
- Global **search** matches child rows too: a matching child auto-expands its parent and is
  highlighted.
- **Sorting** and **pagination** apply to parents; child order is whatever `getChildren` returns.
- **Keyboard:** focus a parent row, then `→` / `←` expand / collapse, and `Enter` triggers the
  row's first available action (`rowActions[0]`).

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

## Props Reference

### Common Props

| Prop | Type | Description |
|------|------|-------------|
| `columns` | `ColumnDef<T>[]` | Column definitions (required) |
| `pageSize` | `number` | Rows per page (default: 10) |
| `filterDefs` | `FilterDef[]` | Explicit filter pill definitions |
| `autoFilters` | `boolean` | Auto-generate filter pills from `filterable` columns |
| `showSearch` | `boolean` | Show a global search input in the filter bar |
| `getChildren` | `(row: T) => C[] \| undefined` | Returns a row's children; enables expandable rows |
| `childColumns` | `ColumnDef<C>[]` | Column layout for child rows (defaults to `columns`) |
| `defaultExpanded` | `boolean \| ((row: T) => boolean)` | Initial expanded state per parent (default `false`) |
| `onExpandedChange` | `(expandedKeys: string[]) => void` | Called with expanded parent keys on toggle |
| `expandOn` | `'chevron' \| 'row'` | What toggles expansion (default `'chevron'`) |
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
