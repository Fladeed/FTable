## Overview

Fix a bug in FloTable where row action items inside the overflow `⋯` dropdown never fire their `onClick` handler. This affects any consumer with more than 3 `rowActions` per row. Reported from TajirPro (`feat/TPRO-287-quick-adjustment`) where a 5-action row (view / edit / quick_adjustment / delete / restore) had everything past the first two inline actions effectively dead.

## Problem

`RowActionsOverflow` renders the dropdown menu through `createPortal(..., document.body)` (see `RowActionsDropdown.tsx:45–76`), but its outside-click handler (`RowActionsOverflow.tsx:32–41`) only checks `containerRef`, which wraps the inline cell + the overflow button — **not** the portal root.

Click sequence on a dropdown item:

1. `mousedown` fires on the menuitem `<button>` (inside the portal — outside `containerRef`).
2. Outside-click handler runs → `setIsOpen(false)`.
3. React unmounts the dropdown before the menuitem's `click` event lands.
4. The button is gone, so its `onClick={() => { action.onClick(row); onClose(); }}` never runs.

Inline (first two) actions still work because they live inside `containerRef`. Only items inside the portal-rendered dropdown are broken.

**Assumptions:**

- Keyboard activation of menu items (Enter/Space → `click`) is not affected by this bug (no `mousedown` on a foreign target precedes it). We will not change keyboard handling.
- No visual / styling changes are requested; this is a behavior-only fix.

## Suggested Solution

Apply the reporter's recommended **Option 1**: track the portal root as a second ref and treat clicks inside *either* the inline container or the portal root as inside.

Concretely:

- `RowActionsDropdown` accepts a forwarded ref (or, simpler, exposes its portal-root element via a callback ref prop) so the parent can detect clicks inside it.
- `RowActionsOverflow` keeps `containerRef` (inline cell + overflow button) and adds `dropdownRef` (the portal `<div role="menu">`). The outside-click handler closes only when the target is outside both.

This is the most robust and idiomatic fix for portaled menus, and it does not depend on event-ordering quirks (unlike Option 2: switching to `click`) or per-item handlers (Option 3: `stopPropagation` on each item). It also avoids regressing keyboard / focus behavior.

## Task Checklist

### Phase 1: Fix portal-aware outside-click handling

#### Task 1.1: Expose the dropdown's portal root element to the parent [10m] — ⬜ TODO

**Files to create or modify:**

- `packages/flotable/src/FloTable/ActionBar/RowActionsDropdown/RowActionsDropdown.tsx` — accept an optional `dropdownRef` prop (a `React.Ref<HTMLDivElement>`) and attach it to the portal's root `<div role="menu">`.

**References:**

- `packages/flotable/src/FloTable/ActionBar/RowActionsDropdown/RowActionsDropdown.tsx:45–46` (current `<div role="menu">` element where the ref must land)
- `packages/flotable/src/FloTable/ActionBar/RowActionsCell/RowActionsOverflow/RowActionsOverflow.tsx:17` (existing pattern for typed `useRef<HTMLDivElement>(null)`)

**Subtasks:**

- In `RowActionsDropdownProps<T>`, add an optional field `dropdownRef?: React.Ref<HTMLDivElement>` (import the `Ref` type from `react`).
- Destructure `dropdownRef` from props in the `RowActionsDropdown` component signature.
- Attach `ref={dropdownRef}` on the portal's root `<div role="menu" className="flotable__row-actions-dropdown" style={style}>`.
- Confirm no other props/types change — the prop is optional, so existing call sites stay valid.

#### Task 1.2: Track the portal in `RowActionsOverflow` outside-click logic [15m] — ⬜ TODO

**Files to create or modify:**

- `packages/flotable/src/FloTable/ActionBar/RowActionsCell/RowActionsOverflow/RowActionsOverflow.tsx` — add `dropdownRef`, pass it down, and treat clicks inside it as inside.

**References:**

- `packages/flotable/src/FloTable/ActionBar/RowActionsCell/RowActionsOverflow/RowActionsOverflow.tsx:32–41` (current outside-click `useEffect` that needs the second-ref check)
- `packages/flotable/src/FloTable/ActionBar/RowActionsCell/RowActionsOverflow/RowActionsOverflow.tsx:95–102` (current `<RowActionsDropdown ... />` call site to wire `dropdownRef` through)

**Subtasks:**

- Add `const dropdownRef = useRef<HTMLDivElement>(null);` alongside the existing `containerRef` and `overflowBtnRef`.
- In the outside-click `useEffect`, change the guard from `if (containerRef.current && !containerRef.current.contains(e.target as Node))` to additionally bail out when `dropdownRef.current?.contains(e.target as Node)` is true. Final logic: close only when the target is outside **both** `containerRef` and `dropdownRef`.
- Pass `dropdownRef={dropdownRef}` to `<RowActionsDropdown ... />` in the render block.
- Leave `mousedown` as the listener — switching events is out of scope and per the ticket's Option 2 analysis is fragile across React versions.
- Verify the `useEffect` dependency array stays `[isOpen]` (no new deps introduced — refs are stable).

#### Task 1.3: Add a visual proof demo section for the overflow click fix [25m] — ⬜ TODO

**Files to create or modify:**

- `apps/demo/src/components/RowActionsDemo/RowActionsOverflowClickProofSection/RowActionsOverflowClickProofSection.tsx` *(new)* — a dedicated demo section using `ActionsTable` with 5 actions that maintains an in-memory tally of how many times each action's `onClick` fired, rendered as a visible per-action counter list. This makes the ET-110 regression observable at a glance.
- `apps/demo/src/components/RowActionsDemo/RowActionsDemo.tsx` — render the new section after `RowActionsOverflowSection`.

**References:**

- `apps/demo/src/components/RowActionsDemo/RowActionsOverflowSection/RowActionsOverflowSection.tsx` (pattern for an overflow-cell section using `ActionsTable`)
- `apps/demo/src/components/RowActionsDemo/ActionsTable/ActionsTable.tsx:23–26` (how it wraps each action's `onClick` to call the passed `onAction` — we'll reuse this and pass our own `onAction`)
- `apps/demo/src/components/RowActionsDemo/RowActionsDemo.tsx:22–26` (existing feedback banner pattern — for visual styling consistency, reuse `.row-actions-demo__feedback` and `.row-actions-demo__section` classes)
- `apps/demo/src/components/RowActionsDemo/RowActionsDemoData.tsx` (`Employee`, `IconEdit`, `IconView`, etc.)

**Subtasks:**

- Create the new file with a `RowActionsOverflowClickProofSection` component that takes no props.
- Inside, hold a `useState<Record<string, number>>({})` keyed by action `key`, defaulting each declared action to `0`.
- Define a 5-entry `ACTIONS` array (`edit`, `view`, `duplicate`, `archive`, `delete`) mirroring the existing overflow section's setup; their `onClick` will be replaced by `ActionsTable.boundActions`.
- Render `<ActionsTable rowActions={ACTIONS} onAction={...} />`, where `onAction` parses the action label out of the message and increments the matching counter. Simpler alternative: derive the counter directly inside this section by passing a custom callback — since `ActionsTable` calls `onAction(`${label}: ${row.name}`)`, increment based on the leading label substring before `:`.
- Below the table, render a list with each action's label and current click count (e.g. `Edit — 3`). Highlight any counter > 0 in green to make success obvious.
- Add the section title `Overflow click regression proof (ET-110)` and a short description: clicking any of the 5 menu items in the overflow dropdown should increment its counter. Before the fix, only the first two inline actions advance their counters.
- Import and render `<RowActionsOverflowClickProofSection />` in `RowActionsDemo.tsx` after `<RowActionsOverflowSection ... />`.
- No new dependencies; use existing CSS classes for visual consistency.

#### Task 1.4: Manually verify the fix in the demo app [15m] — ⬜ TODO

**Files to create or modify:**

- None — verification only.

**References:**

- `apps/demo/src/components/RowActionsDemo/RowActionsOverflowSection/RowActionsOverflowSection.tsx` (demo section that exercises the overflow path)
- Root `package.json:7` (`dev` script: `npm run dev --workspace=apps/demo`)

**Subtasks:**

- Run `npm run typecheck` at the repo root and confirm zero errors.
- Run `npm run build --workspace=packages/flotable` so the demo (which imports the built package) picks up the fix.
- Run `npm run dev` and open the demo app in a browser.
- Open the RowActions overflow demo section, click the `⋯` button on a row, and click each item in the dropdown. Confirm each item's `onClick` fires (the "Action triggered" banner updates) and the dropdown closes once after the action runs.
- In the new Click Proof section, click each of the 5 overflow items and confirm each counter increments by exactly 1 per click.
- Re-confirm the first two inline actions still work and that clicking outside the dropdown still closes it.
- Re-confirm Escape and ArrowUp/ArrowDown keyboard behavior is unchanged.

### Phase 2: Track the fix in project memory

#### Task 2.1: Add ET-110 to `MEMORY.md` Jira tracking table [5m] — ⬜ TODO

**Files to create or modify:**

- `MEMORY.md` — append a new row to the Jira Tracking table for ET-110.

**References:**

- `MEMORY.md` Jira Tracking table (existing pattern; previous bug entry: ET-75 row)

**Subtasks:**

- Add a row: `| ET-110 | Bug | RowActionsOverflow dropdown items never fire onClick (portal vs. outside-click handler race) | Done ✓ | https://fladeed.atlassian.net/browse/ET-110 |` after the existing ET-109 row.
- Do not modify the rest of the file.
