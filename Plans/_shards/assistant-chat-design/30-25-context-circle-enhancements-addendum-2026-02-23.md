## 25. Context Circle Enhancements (Addendum -- 2026-02-23)

This section extends the context usage ring (section 12) with a "Compact Now" action in the tooltip and a pop-out detailed usage window on click.

### 25.1 "Compact Now" Action in Tooltip

The hover tooltip for the context circle (section 12) is extended with a clickable action line:

**Updated tooltip contents:**

| Line | Content | Behavior |
|------|---------|----------|
| 1 | Tokens Used: {count} | Static text |
| 2 | Context Used: {percent}% | Static text |
| 3 | Cost: ${amount} | Static text (dollars and cents, e.g., $1.23) |
| 4 | **Compact Now** | Clickable link/button text |

**"Compact Now" behavior:**
- Triggers context compaction for the current thread -- same effect as the user-triggered "Compact session" (e.g., /compact or the compaction pipeline from section 17).
- On click: tooltip closes, context circle shows a brief "Compacting..." spinner overlay (200ms minimum display to prevent flash).
- On completion: context circle animates to reflect the new usage percentage. A brief toast notification confirms: "Context compacted: {old_percent}% -> {new_percent}%".
- If compaction is not possible (e.g., already at minimum context, or no messages to compact): show toast "Context already at minimum."
- If compaction fails (error): show toast "Compaction failed: {reason}".

**UICommand:** `cmd.chat.compact_context` with args `{ thread_id }`.

ContractRef: Primitive:UICommand (Plans/Contracts_V0.md#UICommand)

### 25.2 Pop-Out Detailed Usage View

Clicking the context circle opens a **pop-out window** (not just a tab) with detailed thread usage information.

**Pop-out window specification:**

| Property | Value |
|----------|-------|
| Window type | Floating / detachable (per Plans/FinalGUISpec.md section 5 panel detaching semantics) |
| Default size | 400 x 500 px |
| Title | "Usage -- {thread_name}" |
| Behavior | Only one pop-out per thread at a time; clicking the circle again focuses the existing pop-out |
| Close | Window close button (X), or Escape key |
| Position persistence | redb key `context_popout_state:v1:{thread_id}` stores `{ x, y, width, height }` |

**Pop-out content** (same data as the thread Usage tab described in section 12, plus enhancements):

1. **Header**: "Compact Now" button (prominent, top-right). Thread name. Context ring (larger, 48px).

2. **Summary row**: Total tokens, context percentage, total cost -- same as tooltip but larger and more readable.

3. **Token breakdown table**:
   | Category | Tokens | % |
   |----------|--------|---|
   | Input | {count} | {pct} |
   | Output | {count} | {pct} |
   | Reasoning | {count} | {pct} |
   | Cache (read) | {count} | {pct} |

4. **Per-turn table** (scrollable, virtualized):
   | Turn | Role | Platform | Model | Tokens In | Tokens Out | Cost |
   |------|------|----------|-------|-----------|------------|------|
   | 1 | user | -- | -- | {n} | -- | -- |
   | 2 | assistant | Claude | opus | {n} | {n} | $X.XX |
   | ... | ... | ... | ... | ... | ... | ... |

5. **Cost-over-time chart**: small line chart showing cumulative cost over turns.

6. **Link to app-wide Usage**: "View all usage" link at bottom -- navigates to the dedicated Usage page (Plans/usage-feature.md).

ContractRef: ContractName:Plans/FinalGUISpec.md#5, ContractName:Plans/usage-feature.md

### 25.3 Accessibility

**Context circle:**
- The context circle MUST be focusable (Tab key reaches it).
- `accessible-role: "button"`.
- `accessible-label: "Context usage for this thread, {percent}% used"`.
- Enter or Space opens the pop-out detailed view (same as click).
- Tooltip MUST be available to keyboard users: on focus, tooltip appears; "Compact Now" is focusable within the tooltip (Tab key).

**Pop-out window:**
- All elements inside the pop-out MUST be keyboard-navigable.
- The per-turn table MUST support arrow-key navigation.
- The "Compact Now" button and "View all usage" link MUST be focusable.
- The pop-out root container uses an explicit `accessible-role` for a floating dialog/window surface.
- `accessible-label` on pop-out window: "Detailed usage for {thread_name}".
- On open: focus moves to the pop-out window. On close (Escape): focus returns to the context circle.

ContractRef: ContractName:Plans/FinalGUISpec.md#13

### 25.4 UICommand IDs (Context Circle)

| Command ID | Args | Behavior | Events |
|-----------|------|----------|--------|
| `cmd.chat.compact_context` | `{ thread_id: string }` | Trigger context compaction | `context.compaction.started`, `context.compaction.completed` |
| `cmd.chat.open_usage_popout` | `{ thread_id: string }` | Open/focus the usage pop-out window | UI-only (no persisted event) |
| `cmd.chat.close_usage_popout` | `{ thread_id: string }` | Close the usage pop-out window | UI-only (no persisted event) |

ContractRef: Primitive:UICommand (Plans/Contracts_V0.md#UICommand), ContractName:Plans/UI_Command_Catalog.md

### 25.5 References (Section 25)

- Section 12 of this document (original context circle specification)
- Section 17 of this document (compaction pipeline)
- Plans/usage-feature.md section 5 (per-thread usage data)
- Plans/FinalGUISpec.md section 5 (panel detaching / floating windows)
- Plans/FinalGUISpec.md section 13 (accessibility)
- Plans/Contracts_V0.md (UICommand contract)

---

