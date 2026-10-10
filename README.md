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

## Table Actions

`tableActions` renders buttons at the end of the toolbar, after the filter pills and any inline bulk actions. Use it for the page's main action ("New product", "New refund") and for other actions that do not depend on row selection ("Export", "Refresh").

- Actions never receive row context and stay enabled while rows are selected and the bulk action bar is shown.
- They are pushed to the end side with `margin-inline-start: auto`, so they move to the left under `direction="rtl"`.
- Disabled actions use the `disabled` attribute. Use `variant: 'primary'` for at most one action per table.
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

- The toolbar order is: filter bar (grows), inline bulk actions, then an end group holding `toolbarEnd` followed by `tableActions`. The end group (`.flotable-toolbar__end-group`) has `margin-inline-start: auto`, so both stay together at the end, wrap as a unit on narrow screens, and mirror under RTL.
- Popovers are safe. Neither the toolbar nor the slot wrapper sets `overflow`, and the wrapper (`.flotable__toolbar-end`) is `position: relative`, so a child's `position: absolute` panel anchors to it and can overlap the table.
- The wrapper is a flex row (`gap: var(--flotable-toolbar-end-gap, 0.5rem)`) aligned with the filter pills (`align-self: center`).
- When it has visible content, the toolbar renders even if nothing else is in it. `null`, `undefined`, booleans, `''`, `0` and empty fragments or arrays count as empty, so `items.length && <Picker />` is safe. It is independent of row selection.
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
| `--flotable-accent-color` | `#2563eb` (shared accent; the primary button and focus ring fall back to it) |
| `--flotable-accent-hover-color` | `#1d4ed8` (shared accent hover) |
| `--flotable-table-action-gap` | `0.5rem` |
| `--flotable-table-action-icon-gap` | `0.375rem` |
| `--flotable-table-action-padding` | `0.375rem 0.75rem` |
| `--flotable-table-action-radius` | `var(--flotable-row-action-radius, 4px)` |
| `--flotable-table-action-font-size` | `var(--flotable-font-size, 0.875rem)` |
| `--flotable-table-action-font-weight` | `500` |
| `--flotable-table-action-line-height` | `1.25` |
| `--flotable-table-action-color` | `var(--flotable-row-action-color, #374151)` |
| `--flotable-table-action-bg` | `var(--flotable-bg, #ffffff)` |
| `--flotable-table-action-border-color` | `var(--flotable-border-color, #e5e7eb)` |
| `--flotable-table-action-hover-bg` | `var(--flotable-row-action-hover-bg, #f3f4f6)` |
| `--flotable-table-action-hover-color` | `var(--flotable-row-action-hover-color, #111827)` |
| `--flotable-table-action-primary-bg` | `var(--flotable-accent-color, #2563eb)` |
| `--flotable-table-action-primary-color` | `#ffffff` |
| `--flotable-table-action-primary-border-color` | `var(--flotable-table-action-primary-bg)` |
| `--flotable-table-action-primary-hover-bg` | `var(--flotable-accent-hover-color, #1d4ed8)` |
| `--flotable-table-action-focus-ring` | `var(--flotable-accent-color, #2563eb)` (`:focus-visible` outline colour) |
| `--flotable-table-action-focus-ring-width` | `2px` |
| `--flotable-table-action-focus-ring-offset` | `2px` |
| `--flotable-table-action-disabled-opacity` | `0.4` |
| `--flotable-toolbar-end-gap` | `0.5rem` (gap between `toolbarEnd` children) |
| `--flotable-toolbar-end-group-gap` | `0.75rem` (gap between the `toolbarEnd` slot and `tableActions`) |

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
| `tableActions` | `TableAction[]` | Selection-independent buttons at the end of the toolbar (see [Table Actions](#table-actions)) |
| `toolbarEnd` | `ReactNode` | Custom controls at the end of the toolbar, before `tableActions` (see [`toolbarEnd`](#toolbarend-custom-controls)) |
| `renderInlineBulkActions` | `(ctx: BulkActionBarContext<T>) => ReactNode` | Custom bulk-action content inline in the toolbar; always receives the selection context. For selection-independent actions use `tableActions` |
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
