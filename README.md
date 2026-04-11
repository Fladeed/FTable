# FTable

An open-source, zero-dependency table component built for ERP-style use cases.

## Overview

FTable is a highly capable table component designed to handle the complex data display and interaction needs of enterprise resource planning (ERP) applications. It provides a rich set of features out of the box while remaining lightweight and free of external dependencies.

## Features

### Filtering
- **Quick Filters** — Inline, fast-access filters for common column operations
- **Detailed Filters** — Advanced filter panel for complex, multi-condition filtering

### Sorting
- Single and multi-column sorting
- Easy-to-use sort controls per column

### Field Display
- Multiple content types per field (text, number, date, boolean, badge, etc.)
- Configurable styling per column

### Views
- Save useful combinations of filters and sorting as named views
- Views are displayed as tabs for quick switching
- Views persist user-defined configurations

## Styling & Customization

FTable ships plain CSS wrapped in `@layer ftable`. This means:

- **CSS custom properties** — every visual token (`--ftable-border-color`, `--ftable-header-bg`, etc.) can be overridden via the `styles` prop without touching source.
- **`classNames` prop** — pass your own class names to any table slot (wrapper, header, row, cell, pagination, filter pills, etc.) for full structural control.
- **No Tailwind dependency** — the component works in any environment. Tailwind CSS is only used in the demo.

### Tailwind CSS integration

If your app uses Tailwind and you want utility classes passed via `classNames` to reliably override component defaults, declare the `ftable` layer **before** your Tailwind import:

```css
/* globals.css */
@layer ftable;        /* lowest priority — component defaults */
@import "tailwindcss"; /* utilities layer beats ftable */
```

This one line ensures Tailwind's `utilities` layer always wins over `@layer ftable`, so classes like `bg-indigo-50` or `rounded-xl` passed to `classNames` work as expected.

Consumers who do not use Tailwind can ignore this entirely — the layer declaration is optional.

## Design Philosophy

- **No external dependencies** — the entire component is built with vanilla TypeScript/React primitives
- **ERP-first** — designed for dense, data-heavy interfaces common in enterprise applications
- **Open source** — free to use, modify, and contribute to

## Project Tracking

This project is tracked under the **Fladeed Engineering Toolkit** Jira project.

- **Epic:** [ET-5 — FTable](https://fladeed.atlassian.net/browse/ET-5)

## Getting Started

```bash
npm install
npm run dev
```

## Contributing

Contributions are welcome. Please open an issue or PR under the ET-5 epic in the project tracker.
