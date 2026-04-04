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
    FTable/            # The core table component
      FTable.tsx
      FTable.types.ts
      filters/         # Quick filters & detailed filters
      sorting/         # Sorting logic & UI
      views/           # View management (tabs, persistence)
      fields/          # Field renderers by content type
  hooks/               # Custom hooks (no external state libs)
  utils/               # Pure utility functions
  app/                 # Next.js app directory (demo/playground)
```

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

---

## Project Tracking

All tickets for this project live under the Jira epic **ET-5** in the **Fladeed Engineering Toolkit** project.

When creating or referencing tickets, always link them to ET-5 as the parent epic.

Jira URL: https://fladeed.atlassian.net/browse/ET-5
