# Shard 007: Goal Activity domain surface

Source: `Plans/Goal_Runtime_System.md`

Source lines: L177-L206

Source SHA256: `329a6ae8dd18e5dba8be1fab68ffc138578d704d844cec2364a3389d53eea961`

---

## Goal Activity domain surface

Goal is a per-thread Activity domain. It is not a transcript card, it does not scroll away, and it is never duplicated as a message. To-Dos are the sibling Activity domain and are owned by `Plans/ToDo_Runtime.md`.

The Activity-bar item appears only for the current thread and only when an active or retained Goal record exists. Its hover preview is interactive rather than a passive tooltip:

```text
Goal · Running
<two-line objective preview>
[Pause] [Cancel] [edit icon]
```

`Paused` and `Blocked` states substitute `Resume` for `Pause`, and render `Resume` disabled with the owner-supplied reason when the Goal is blocked and the condition has not cleared. The edit icon opens Goal Activity Detail already in edit mode with the objective textarea focused. Clicking the Activity item itself opens the ordinary detail view. No separate `Open` button is required.

Goal Activity Detail contains the objective, one lifecycle control row and the objective history (DL-147, FinalGUISpec F3-593):

```text
Goal
<objective>
[Pause/Resume] [Edit objective]          [Cancel Goal]
Objective history ▾  (n revisions)
```

Edit objective swaps the objective for the text-only objective editor with `[Save] [Cancel edit]`. Cancel Goal stands alone at the far edge of the row, apart from the safe actions. `Objective history` is a compact revision list that opens in place under the footer: revision number, timestamp, `change_source`, and the objective text at that revision. The blocker reason is shown when `blocked_reason_ref` is present. The panel has no route to a separate Goal document and no control that asks the agent for a replacement; an agent-proposed replacement still follows the authority path above when the user asks for one in the chat.

The detail view must not show a title field, phases, tranches, child Goals, budgets, a current action, a next action, a task drawer, a progress bar derived from invented percentages, or separate scope/done-when/constraints fields. Goal progress is visible through To-Dos and through the ordinary transcript, not through a Goal-owned task tracker.

Every control on both surfaces dispatches a registered command from the Goal V2 command section below. Until the central command catalog, event catalog, and production wiring rows adopt those IDs, the controls render disabled with `command_not_registered`; no page-local handler, alias, or fixture may simulate success.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/ToDo_Runtime.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/UI_Command_Catalog.md
