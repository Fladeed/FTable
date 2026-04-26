# ET-81 & ET-82 — Row Actions Fixes

## Overview

Two bugs in the row actions feature need to be fixed together as they both touch the same area of the codebase.

## Problem

**ET-81 — Disabled actions inflate the inline/overflow threshold**

`RowActionsCell` decides between inline rendering (≤ 3 actions) and overflow mode (> 3) using `actions.length`. Disabled actions are counted even though they are never visible to the user (rendered as a disabled/hidden button). A row with 4 actions where 1 is always disabled gets forced into overflow mode unnecessarily.

**ET-82 — Overflow dropdown is clipped by the table boundary**

The `RowActionsDropdown` is rendered with `position: absolute` inside the `RowActionsOverflow` container, which lives inside the `<td>`. The `.flotable-wrapper` has `overflow-x: auto`, creating a scroll context that clips any absolutely-positioned child that paints outside its bounds. When the dropdown is near the bottom or right edge of the table, it gets cut off.

## Suggested Solution

**ET-81:** In `RowActionsCell.tsx`, compute the visible (non-disabled) action count before the threshold check, and use that count instead of `actions.length`.

```tsx
const visibleCount = actions.filter(a => !(a.disabled?.(row) ?? false)).length;
if (visibleCount <= 3) { ... }
```

**ET-82:** Use a React portal (`ReactDOM.createPortal`) to render `RowActionsDropdown` into `document.body`, positioning it with fixed coordinates derived from the trigger button's `getBoundingClientRect()`. This completely decouples the dropdown from the table's overflow context.

The portal approach:
- Reads the trigger button's `getBoundingClientRect()` on open
- Sets `position: fixed` on the dropdown with computed `top`/`left` (or `right` for RTL) values
- Re-positions on `scroll` and `resize` while open so it tracks the trigger

## Task Checklist

### Phase 1: ET-81 — Disabled-action threshold fix

#### Task 1.1: Fix inline/overflow threshold in RowActionsCell [10 min] — ⬜ TODO

**Files to create or modify:**
- [RowActionsCell.tsx](../packages/flotable/src/FloTable/ActionBar/RowActionsCell/RowActionsCell.tsx) — filter disabled actions before the `<= 3` check

**References:**
- [RowActionsCell.tsx:14](../packages/flotable/src/FloTable/ActionBar/RowActionsCell/RowActionsCell.tsx#L14) — current threshold check
- [FloTable.types.ts](../packages/flotable/src/FloTable/FloTable.types.ts) — `RowAction<T>` type with `disabled?: (row: T) => boolean`

**Subtasks:**
- [ ] Derive `visibleCount` by filtering `actions` where `action.disabled?.(row) ?? false` is `false`
- [ ] Replace `actions.length <= 3` with `visibleCount <= 3`

---

### Phase 2: ET-82 — Portal-based dropdown to escape table overflow

#### Task 2.1: Migrate RowActionsDropdown to a fixed-position portal [30 min] — ⬜ TODO

**Files to create or modify:**
- [RowActionsOverflow.tsx](../packages/flotable/src/FloTable/ActionBar/RowActionsCell/RowActionsOverflow/RowActionsOverflow.tsx) — add trigger button ref, compute position, pass to dropdown; re-position on scroll/resize
- [RowActionsDropdown.tsx](../packages/flotable/src/FloTable/ActionBar/RowActionsDropdown/RowActionsDropdown.tsx) — accept `style` prop and render via `ReactDOM.createPortal` into `document.body`
- [RowActionsDropdown.css](../packages/flotable/src/FloTable/ActionBar/RowActionsDropdown/RowActionsDropdown.css) — change `position: absolute` to `position: fixed`; remove `top`/`inset-inline-end` defaults (coordinates come from JS)

**References:**
- [RowActionsOverflow.tsx](../packages/flotable/src/FloTable/ActionBar/RowActionsCell/RowActionsOverflow/RowActionsOverflow.tsx) — current dropdown trigger + open state
- [RowActionsDropdown.css:2-5](../packages/flotable/src/FloTable/ActionBar/RowActionsDropdown/RowActionsDropdown.css#L2) — current `position: absolute` + `top`/`inset-inline-end` rules to replace

**Subtasks:**
- [ ] In `RowActionsOverflow`, add a `ref` on the `⋯` overflow button (`overflowBtnRef`)
- [ ] Add a `position` state (`{ top: number; left: number } | null`) in `RowActionsOverflow`
- [ ] On `setIsOpen(true)`, compute position from `overflowBtnRef.current.getBoundingClientRect()`: set `top` to `rect.bottom + 4`, `left` to `rect.right - 140` (align right edge of dropdown to right edge of button; 140px is `min-width`)
- [ ] Add `scroll` and `resize` event listeners (on `window`) when `isOpen` to recompute position; remove on close
- [ ] Pass `position` as a `style` prop to `RowActionsDropdown`
- [ ] In `RowActionsDropdown`, accept a `style?: React.CSSProperties` prop
- [ ] Wrap the returned JSX with `ReactDOM.createPortal(..., document.body)`
- [ ] In `RowActionsDropdown.css`, change `position: absolute` → `position: fixed`; remove `top` and `inset-inline-end` declarations
- [ ] Verify the dropdown opens correctly and is not clipped at top, bottom, or sides of the table

---

### Phase 3: Commit

One commit covering both fixes:

```
fix(row-actions): exclude disabled actions from threshold; portal-based dropdown
```
