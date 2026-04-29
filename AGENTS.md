# AGENTS.md — FloTable

Instructions for AI agents working on this project.

---

## Project Overview

FloTable is an open-source, ERP-focused table component built with **zero external dependencies**. All functionality must be implemented using only the standard library of the chosen runtime (TypeScript/React built-ins, browser APIs, Node.js built-ins). Do not introduce third-party packages.

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
    FloTable/            # The core table component — published as an npm package
      FloTable.tsx
      FloTable.types.ts
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
Renderers live in `src/components/FloTable/fields/`.

### Views
- A view is a named snapshot of: active filters, sort configuration, and visible columns.
- Views are displayed as tabs above the table.
- Views can be created, renamed, and deleted by the user.
- View state is serializable (plain JSON) — no external state management library.

### Customization & Translation

**Every piece of user-visible text in the component must be customizable.**

FloTable is used in multilingual and multi-locale products. Hardcoded English strings are a bug, not a default. When adding any user-facing label, button text, or status string:

- Expose it as an optional prop with a sensible English default.
- Group related strings into a single `*Labels` prop object (e.g. `paginationLabels`, `rowActionsLabel`) rather than scattering individual string props.
- For strings that embed dynamic values (e.g. "Page 3 of 10"), accept a render function `(…args) => string` so consumers can handle any word order.
- Document the default value explicitly in the JSDoc so consumers know what they are overriding.

Examples of text that **must** be customizable: pagination buttons, column headers (including the Actions column), filter pill labels, empty-state messages, error messages, retry button text, loading indicators.

When reviewing or implementing a feature, always ask: _"Does this render any text the user will see? If yes, is it overridable?"_

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

FloTable is published as an npm package and must be **Tailwind-free**. Do not use Tailwind utility classes anywhere inside `src/components/`. All component styles must be written in plain CSS.

Every component is **self-contained**: a co-located `.css` file lives alongside each `.tsx` file and is imported directly in the component.

```
src/components/FloTable/
  FloTable.tsx
  FloTable.css          # all styles for this component
  FloTable.types.ts
  filters/
    Filters.tsx
    Filters.css
  ...
```

Rules:
- **All component styles go in the co-located `.css` file** — no inline `style` props except for truly dynamic values (e.g. computed widths).
- Use **CSS custom properties** for every visual token (color, spacing, border-radius, font-size). Define defaults with `var(--flotable-token, <fallback>)` so consumers can override without touching source.
- Import the CSS file in the component: `import './FloTable.css'`.
- Do **not** scatter component-specific styles across global or shared stylesheets.
- Global design-system tokens for the demo app live in `src/app/globals.css`. The component itself must not depend on them — use fallback values in `var()` calls instead.
- The `src/app/` demo pages may use any styling approach (plain CSS, inline styles) — but still **no Tailwind**.
- **Never style HTML tags directly** (`th`, `td`, `thead`, `tr`, etc.). Every element that needs styling must have an explicit class. Use BEM-style names: `.flotable__header`, `.flotable__cell`, etc.

### Theme Alias Chains (`--_flotable-*`)

Core color/typography tokens are wired into a private `--_flotable-X` indirection defined in `FloTable.css`. The chain looks like:

```
--_flotable-bg = var(--flotable-bg, var(--background, var(--color-background, var(--mui-palette-background-default, var(--_flotable-bg-default)))))
```

**Rules for sub-component CSS:**

- For the ~15 **aliased core tokens** (bg, color, muted-color, border-color, header-bg, header-hover-bg, row-hover-bg, link-color, danger-color, error-color, focus-ring, border-radius, font-family, sort-active-color, pill-active-color), **always read `var(--_flotable-X)`** — never `var(--flotable-X, fallback)`. The chain definition in `FloTable.css` is the single source of truth.
- For non-aliased tokens (paddings, font-sizes, badge-specific, dropdown-specific, etc.), keep the existing `var(--flotable-X, fallback)` pattern.
- When adding a new core token, extend the chain in `FloTable.css` (chain definition + light default + dark default in the dark mode block) AND its derived non-aliased token defaults if any.
- Dark mode block in `FloTable.css` only swaps the `--_flotable-X-default` values (and re-points non-aliased pill/dropdown/skeleton tokens to derive from core). Do not duplicate or fight this from sub-component CSS.
- Sub-components rendered via portal (e.g. `RowActionsDropdown`) need the chain definition replicated on their root selector since they live outside the `.flotable-root` subtree.

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

### Skill Update Ticket (after every PR)

**After opening a PR for any task, you must create a follow-up Jira ticket** to keep the `flotable` skill up to date.

Rules:
- Parent epic: **ET-1**
- Label: **`flotable-skill`**
- Issue type: **Task**
- The ticket must be **self-contained**: reading it should be enough to update the skill without looking at the commit or PR.

**Required ticket content:**
- A clear summary of what changed in the component (new props, removed props, new behaviour, changed defaults, new components, removed components, etc.).
- The exact file paths that were added, modified, or removed.
- Any new conventions or constraints introduced by the task (e.g., new CSS token names, new field types, new prop shapes).
- Specific instructions on what section(s) of the skill file need to be updated and how (e.g., "Add a new row to the Field Types table for `rating`", "Update the `FilterPill` prop table to include `defaultOpen`").
- A link to the PR for reference.

**Ticket title format:** `[Skill] Update flotable skill — <short description of the feature>`

Example title: `[Skill] Update flotable skill — FilterPill defaultOpen prop`
