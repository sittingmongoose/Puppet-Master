# Shard 007: Goal Activity domain surface

Source: `Plans/Goal_Runtime_System.md`

Source lines: L177-L208

Source SHA256: `62576d2ba5cc5495c0ec34c833274975525938d5686d0e4b45924cbb8a0fed2c`

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

Goal Activity Detail contains a text-only objective editor and the lifecycle controls:

```text
Goal
[objective textarea]
[Save] [Cancel edit]

[Pause/Resume] [Cancel Goal]
History ▾
```

`History` is a compact revision list: revision number, timestamp, `change_source`, and the objective text at that revision. The blocker reason is shown when `blocked_reason_ref` is present.

The detail view must not show a title field, phases, tranches, child Goals, budgets, a current action, a next action, a task drawer, a progress bar derived from invented percentages, or separate scope/done-when/constraints fields. Goal progress is visible through To-Dos and through the ordinary transcript, not through a Goal-owned task tracker.

Every control on both surfaces dispatches a registered command from the Goal V2 command section below. Until the central command catalog, event catalog, and production wiring rows adopt those IDs, the controls render disabled with `command_not_registered`; no page-local handler, alias, or fixture may simulate success.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/ToDo_Runtime.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/UI_Command_Catalog.md
