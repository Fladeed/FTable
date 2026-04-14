# Contributing to FloTable

Thanks for your interest in contributing to FloTable! This guide will help you get set up and understand the project conventions.

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9 (workspaces support)

### Setup

```bash
git clone https://github.com/Fladeed/FloTable.git
cd FloTable
npm install
npm run dev    # starts the demo app at http://localhost:3000
```

The project uses **npm workspaces**:

| Workspace | Path | Description |
|-----------|------|-------------|
| `flotable` | `packages/flotable/` | The published table component |
| `demo` | `apps/demo/` | Next.js demo/playground app |

---

## Project Structure

```
packages/flotable/src/         # The npm package — this is what gets published
  FloTable/                    # Core table component
    fields/                  # Column type renderers (text, number, date, etc.)
    filters/                 # Filter bar components
    SortIndicator/           # Sort direction indicator
    TableBody/               # Body rows, skeleton, empty/error states
    TableHeader/             # Header row
    TablePagination/         # Page controls
    TableRow/                # Individual row

apps/demo/src/               # Demo app — NOT part of the published package
  components/                # Demo page components
  utils/                     # Demo-only utilities
```

---

## Zero-Dependency Policy

FloTable has **zero runtime dependencies**. This is a core design decision, not a guideline.

- **Do not** add any npm packages to `packages/flotable/package.json` `dependencies`.
- **Do not** import from utility libraries (lodash, date-fns, clsx, etc.).
- If you need a utility, implement it in a small helper file under `packages/flotable/src/utils/`.
- `peerDependencies` on React are the only allowed external dependency.
- Dev dependencies for build tooling are acceptable.

---

## Demo vs Core — Strict Boundary

This boundary is critical:

- **`packages/flotable/`** is the publishable package. It must never import from the demo app.
- **`apps/demo/`** is the playground. Demo-only logic (mock data, client-side sort simulation) lives here.
- When adding a feature, ask: _"Does this belong in the component or only in the demo?"_

---

## Code Style

- **TypeScript strict mode** — no `any` types.
- **Functional components only** — no class components.
- **Named exports** from utility/hook files (no default exports).
- **File names:** `PascalCase` for components, `camelCase` for hooks/utils.
- **Every component gets its own directory** with a co-located `.css` file:
  ```
  MyComponent/
    MyComponent.tsx
    MyComponent.css
  ```
- **No Tailwind CSS** in `packages/flotable/`. All styles are plain CSS with CSS custom properties.
- **CSS class naming:** BEM-style with `.flotable__` prefix (e.g., `.flotable__header`, `.flotable__cell`).
- **Never style HTML tags directly** — always use explicit classes.

---

## Development Workflow

1. **Create a branch** from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Make your changes** following the code style above.

3. **Test locally** by running the demo app:
   ```bash
   npm run dev
   ```

4. **Type-check** the package:
   ```bash
   npm run typecheck
   ```

5. **Commit** with a clear, descriptive message:
   ```
   feat: add date range filter support
   fix: correct pagination off-by-one error
   ```

6. **Open a Pull Request** against `main` with:
   - A description of what changed and why
   - Screenshots for UI changes
   - Reference to any related Jira ticket (e.g., ET-XX)

---

## Reporting Issues

Open an issue on GitHub with:

- A clear title describing the problem
- Steps to reproduce
- Expected vs actual behavior
- Browser/OS if relevant

---

## License

By contributing to FloTable, you agree that your contributions will be licensed under the [MIT License](./LICENSE).
