    # MEMORY.md — FloTable Project Memory

Running memory of relevant project context, decisions, and tracking info.

---

## Jira Tracking

| Key | Type | Title | Status | URL |
|-----|------|--------|--------|-----|
| ET-5 | Epic | FloTable | In Progress | https://fladeed.atlassian.net/browse/ET-5 |
| ET-7 | Task | Core table scaffold | Done ✓ | https://fladeed.atlassian.net/browse/ET-7 |
| ET-8 | Task | Column field renderers (text, number, date, boolean, badge, currency, link) | In Progress | https://fladeed.atlassian.net/browse/ET-8 |
| ET-9 | Task | Single-column sorting with header indicators | Done ✓ | https://fladeed.atlassian.net/browse/ET-9 |
| ET-10 | Task | Quick filters (per-column inline header filters) | Done ✓ | https://fladeed.atlassian.net/browse/ET-10 |
| ET-11 | Task | Detailed filters panel (multi-condition with operators) | To Do | https://fladeed.atlassian.net/browse/ET-11 |
| ET-12 | Task | Views — named tabs with create, rename, and delete | To Do | https://fladeed.atlassian.net/browse/ET-12 |
| ET-13 | Task | Column visibility toggle per view | To Do | https://fladeed.atlassian.net/browse/ET-13 |
| ET-14 | Task | Demo page with sample data | To Do | https://fladeed.atlassian.net/browse/ET-14 |
| ET-15 | Task | Multi-column sorting | To Do | https://fladeed.atlassian.net/browse/ET-15 |
| ET-16 | Task | View persistence via localStorage | To Do | https://fladeed.atlassian.net/browse/ET-16 |
| ET-17 | Task | Remote persistence adapter (pluggable ViewStorageAdapter interface) | To Do | https://fladeed.atlassian.net/browse/ET-17 |
| ET-21 | Task | Custom classNames and styles API for table slots (antd-style) + shadcn demo | Done ✓ | https://fladeed.atlassian.net/browse/ET-21 |
| ET-23 | Task | ActionBar — Table-level actions (independent of row selection) | To Do | https://fladeed.atlassian.net/browse/ET-23 |
| ET-24 | Task | Row selection system (checkboxes, select-all, selectedRows state) | To Do | https://fladeed.atlassian.net/browse/ET-24 |
| ET-25 | Task | ActionBar — Single-row actions (row context menu / inline actions) | To Do | https://fladeed.atlassian.net/browse/ET-25 |
| ET-26 | Task | ActionBar — Bulk actions for selected rows (blocked by ET-24) | To Do | https://fladeed.atlassian.net/browse/ET-26 |
| ET-30 | Task | Tailwind CSS theme demo for style customization page | Done ✓ | https://fladeed.atlassian.net/browse/ET-30 |
| ET-29 | Task | API data source — accept a request prop to fetch data | In Progress | https://fladeed.atlassian.net/browse/ET-29 |
| ET-32 | Task | Add MIT LICENSE file | Done ✓ | https://fladeed.atlassian.net/browse/ET-32 |
| ET-33 | Task | Create CONTRIBUTING.md for open-source contributors | Done ✓ | https://fladeed.atlassian.net/browse/ET-33 |
| ET-34 | Task | Cloudflare Pages deployment config for demo app | Done ✓ | https://fladeed.atlassian.net/browse/ET-34 |
| ET-35 | Task | Rewrite README.md for public release | Done ✓ | https://fladeed.atlassian.net/browse/ET-35 |
| ET-36 | Task | npm package publishing setup for flotable | Done ✓ | https://fladeed.atlassian.net/browse/ET-36 |
| ET-51 | Task | Add "Skill Update Ticket" workflow to AGENTS.md | To Do | https://fladeed.atlassian.net/browse/ET-51 |
| ET-52 | Task | Fix flotable/styles export — add TypeScript type declaration for CSS entry point | To Do | https://fladeed.atlassian.net/browse/ET-52 |
| ET-55 | Task | Debounce search/filter input — trigger request after typing pause, not on every keystroke | To Do | https://fladeed.atlassian.net/browse/ET-55 |
| ET-75 | Bug | Loading spinner stays forever when request function throws a synchronous error | To Do | https://fladeed.atlassian.net/browse/ET-75 |
| ET-76 | Task | RTL support — add `direction` prop to FloTable | Done ✓ | https://fladeed.atlassian.net/browse/ET-76 |
| ET-77 | Enhancement | FloTable request mode: add initialQuickFilters prop | Done ✓ | https://fladeed.atlassian.net/browse/ET-77 |
| ET-78 | Task | FloTable pagination: add optional page number input for direct page navigation | In Progress | https://fladeed.atlassian.net/browse/ET-78 |

- **Project:** Fladeed Engineering Toolkit (ET)
- **Cloud:** fladeed.atlassian.net
- **All FloTable tickets must be children of epic ET-5.**

---

## Key Decisions

| Date | Decision |
|------|----------|
| 2026-04-04 | Zero external dependencies policy established |
| 2026-04-04 | Next.js chosen as the framework for the demo/playground app |
| 2026-04-04 | Views feature scoped to: filters + sort + visible columns, serialized as JSON |
| 2026-04-04 | Field types planned: text, number, date, boolean, badge, currency, link |

---

## Architecture Notes

- Table component lives in `src/components/FloTable/`
- Field renderers are separate files under `fields/` subdirectory
- Views are plain JSON — no external state lib
- Quick filters = header-inline; Detailed filters = panel/drawer

---

## Open Questions / TODO

- [x] Decide on persistence strategy for views → localStorage default (ET-16) + pluggable `ViewStorageAdapter` (ET-17)
- [ ] Define the public API / props interface for `<FloTable />`
- [ ] Decide on virtualization approach for large datasets (must be zero-dependency)
