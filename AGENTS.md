# AGENTS.md — FTable

Instructions for AI agents working on this project.

---

## Project Overview

FTable is an open-source, ERP-focused table component built with **zero external dependencies**. All functionality must be implemented using only the standard library of the chosen runtime (TypeScript/React built-ins, browser APIs, Node.js built-ins). Do not introduce third-party packages.

---

## Core Constraints

### No External Dependencies
- **Do not install or import any npm packages** beyond the core framework (Next.js / React) and TypeScript itself.
- Do not use utility libraries (lodash, date-fns, clsx, etc.).
- Do not use component libraries (shadcn, radix, headlessui, etc.).
- Do not use styling libraries (tailwind plugins, styled-components, etc.).
- If a utility is needed, implement it inline or in a small helper file.
- Tailwind CSS (already configured with Next.js) is acceptable for base styling utilities.

---

## Architecture

```
src/
  components/
    FTable/            # The core table component — published as an npm package
      FTable.tsx
      FTable.types.ts
      SortIndicator/   # Sort direction indicator component
      filters/         # Quick filters & detailed filters
      views/           # View management (tabs, persistence)
      fields/          # Field renderers by content type
  demo/                # Demo/playground code — NOT part of the package
    Demo.tsx           # The demo component mounted by app/page.tsx
    demoUtils.ts       # Demo-only helpers (e.g. client-side sort simulation)
  hooks/               # Custom hooks (no external state libs)
  utils/               # Pure utility functions
  app/                 # Next.js app directory — entry point only
```

---

## Demo vs Core — Strict Separation

**This boundary is critical and must be enforced on every task.**

`src/components/` is the publishable package. `src/demo/` is the playground.

Rules:
- **`src/components/` must never import from `src/demo/`.**
- **Demo-only logic (e.g. client-side data simulation, mock data) must live in `src/demo/`, never in `src/components/`.**
- `src/app/page.tsx` is a thin entry point — it only mounts `<Demo />` and nothing else.
- When adding a new feature, ask: _"Does this belong in the component (package) or only in the demo?"_ If it only makes sense for local simulation, it goes in `src/demo/`.

Examples of demo-only code:
- `applySorting` — simulates server-side sort locally; real consumers send `sortState` to their API
- Mock/seed data arrays
- Any `useMemo`/`useState` that drives fake API behaviour

---

## Feature Guidelines

### Filtering
- **Quick Filters:** Simple per-column filters accessible directly in the table header. Designed for speed — minimal UI.
- **Detailed Filters:** A panel or drawer with multi-condition filter groups. Supports multiple operators per field type (equals, contains, greater than, etc.).
- Filters are applied client-side by default.

### Sorting
- Support single-column and multi-column sorting.
- Sort state is part of the view configuration.
- Render sort indicators in column headers.

### Field / Column Types
Each column can declare a content type. Supported types should include:
- `text`
- `number`
- `date`
- `boolean`
- `badge` (enum value with a color)
- `currency`
- `link`
Renderers live in `src/components/FTable/fields/`.

### Views
- A view is a named snapshot of: active filters, sort configuration, and visible columns.
- Views are displayed as tabs above the table.
- Views can be created, renamed, and deleted by the user.
- View state is serializable (plain JSON) — no external state management library.

---

## Code Style

- TypeScript strict mode.
- Functional components only.
- Props typed with explicit interfaces (no `any`).
- No default exports from utility/hook files; named exports only.
- File names: `PascalCase` for components, `camelCase` for hooks/utils.
- **Break UI into the most elementary components that make sense.** Each distinct rendering concern (header row, body row, cell, pagination bar, etc.) lives in its own component file. Avoid monolithic components that render multiple independent UI regions.
- **Every component lives in its own named directory.** A component `Foo` must be at `Foo/Foo.tsx` with its styles at `Foo/Foo.css`. Never place multiple component files flat in a shared folder. Grouping folders (e.g. `filters/`) are allowed as parent directories, but each component inside must still have its own subdirectory.

  ```
  filters/
    FilterBar/
      FilterBar.tsx
      FilterBar.css
    FilterPopover/
      FilterPopover.tsx
      FilterPopover.css
  ```

---

## Component Styling

FTable is published as an npm package and must be **Tailwind-free**. Do not use Tailwind utility classes anywhere inside `src/components/`. All component styles must be written in plain CSS.

Every component is **self-contained**: a co-located `.css` file lives alongside each `.tsx` file and is imported directly in the component.

```
src/components/FTable/
  FTable.tsx
  FTable.css          # all styles for this component
  FTable.types.ts
  filters/
    Filters.tsx
    Filters.css
  ...
```

Rules:
- **All component styles go in the co-located `.css` file** — no inline `style` props except for truly dynamic values (e.g. computed widths).
- Use **CSS custom properties** for every visual token (color, spacing, border-radius, font-size). Define defaults with `var(--ftable-token, <fallback>)` so consumers can override without touching source.
- Import the CSS file in the component: `import './FTable.css'`.
- Do **not** scatter component-specific styles across global or shared stylesheets.
- Global design-system tokens for the demo app live in `src/app/globals.css`. The component itself must not depend on them — use fallback values in `var()` calls instead.
- The `src/app/` demo pages may use any styling approach (plain CSS, inline styles) — but still **no Tailwind**.
- **Never style HTML tags directly** (`th`, `td`, `thead`, `tr`, etc.). Every element that needs styling must have an explicit class. Use BEM-style names: `.ftable__header`, `.ftable__cell`, etc.

---

## Project Tracking

All tickets for this project live under the Jira epic **ET-5** in the **Fladeed Engineering Toolkit** project.

When creating or referencing tickets, always link them to ET-5 as the parent epic.

Jira URL: https://fladeed.atlassian.net/browse/ET-5

### Ticket Memory (`MEMORY.md`)

`MEMORY.md` is the **source of truth for all ticket codes** on this project.

- **Always load `MEMORY.md`** at the start of any session or task that touches Jira tickets.
- **When a ticket is created:** add its key, type, title, and URL to the Tickets table in `MEMORY.md`.
- **When a ticket is completed:** update its status to `Done ✓` in `MEMORY.md`.
- Never create or close a ticket without updating `MEMORY.md`.
