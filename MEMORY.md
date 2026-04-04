# MEMORY.md — FTable Project Memory

Running memory of relevant project context, decisions, and tracking info.

---

## Jira Tracking

| Key | Type | Title | Status | URL |
|-----|------|--------|--------|-----|
| ET-5 | Epic | FTable | To Do | https://fladeed.atlassian.net/browse/ET-5 |

- **Project:** Fladeed Engineering Toolkit (ET)
- **Cloud:** fladeed.atlassian.net
- **All FTable tickets must be children of epic ET-5.**

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

- Table component lives in `src/components/FTable/`
- Field renderers are separate files under `fields/` subdirectory
- Views are plain JSON — no external state lib
- Quick filters = header-inline; Detailed filters = panel/drawer

---

## Open Questions / TODO

- [ ] Decide on persistence strategy for views (localStorage vs. prop-passed handler)
- [ ] Define the public API / props interface for `<FTable />`
- [ ] Decide on virtualization approach for large datasets (must be zero-dependency)
