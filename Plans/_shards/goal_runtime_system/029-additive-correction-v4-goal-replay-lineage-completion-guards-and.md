# Shard 029: Additive Correction v4 — Goal Replay Lineage, Completion Guards, And Bound Plan Runs (2026-09-03)

Source: `Plans/Goal_Runtime_System.md`

Source lines: L5305-L5398

Source SHA256: `905e3f1889eb2f6aaf3583d278b9d49b80cc69be4f01fecefbcbda7f3887d429`

---

## Additive Correction v4 — Goal Replay Lineage, Completion Guards, And Bound Plan Runs (2026-09-03)

This section applies `PM_Assistant_v2_Additive_Correction_v4` (`GREPLAY-001..012`, and the
Goal side of `PGOAL-003..015`) to this owner. It adds **no visible Goal field**. The Goal the
user sees stays simple text with no title, no phases, no Done-When list, no scope block, no
constraints block, and no attachment list, presented in Activity and never as a thread card.

### GREPLAY-001..003 — Hidden lineage, origin, and replay

A Goal carries durable replay lineage that is never rendered as Goal content:

```text
pm.goal.origin_lineage.v1
  goal_id, goal_revision
  origin_kind                 user_request | agent_created_at_user_request |
                              plan_build | internal_workflow
  source_message_refs[]       the messages the objective came from
  source_context_manifest_ref what context was admitted when it was accepted
  bound_plan_ref              set only for plan_build
  owning_workflow_ref         set only for internal_workflow
```

Origin is recorded, never inferred — a Goal has no title to infer from. Source context is
referenced, never pasted into `objective_text`.

Replay reconstructs the exact accepted objective revision and the admitted context after a
crash, a context compaction, a model switch, or a host transfer. Reconstruction reads durable
records, not chat-window retention, and the objective text is never silently summarised,
re-worded, or "improved" on the way back.

### GREPLAY-004..008 — The host owns `completed`

The host owns the `completed` transition. A model's claim of completion is a **proposal**
evaluated against owner predicates; a provider returning a final message completes nothing.

A Goal cannot complete while:

- a required current To-Do is `pending`, `in_progress`, or `blocked` — checked against the
  current list identity and revision, never against removed historical items;
- admitted work or a bound `PlanRun` is active, unresolved, or recovery-required, including
  background subagents and tools;
- an internal workflow Goal's own completion predicate is unmet. That predicate is consumed
  **by reference** with owner identity and currentness — research closure, ledger coverage,
  PlanUnit compilation, audit closure, WorkNode result — and the workflow's phases are never
  copied into Goal state.

A skipped To-Do counts as resolved only when an explicit accepted skip disposition exists. An
item that merely disappeared is not skipped and cannot satisfy completion.

### GREPLAY-009..010 — Epochs, and the authority of a manual stop

Pause, Cancel, objective revision, bound Plan revision, and run replacement each increment and
fence the relevant continuation epoch. Late schedule, quota, and provider callbacks arriving
against an old epoch are ignored. Timestamp order alone never admits a callback.

A manual Pause or Cancel stays authoritative across host restart, execution windows, Usage
resets, and provider reconnects. No automatic path resumes it without new user authorization,
and a service restart is never read as resume consent.

### GREPLAY-011 — History stays compact

Goal history retains creation, approved text revisions, pause, resume, blocked, completion, and
cancellation, each routeable to its evidence. Phases and runtime topology are never exposed as
Goal fields, and no transcript-style Goal card is created.

### GREPLAY-012 — One continuation authority

Provider-native Goal, plan, or task-loop state stays noncanonical and can never drive
continuation alongside the Puppet Master Goal loop. Where an adapter cannot suppress its native
loop, the adapter discloses the constrained state; two continuation authorities never run at
once. This extends `PROVIDER-001..012` in `Plans/CLI_Bridged_Providers.md`.

### PGOAL Goal-side — Goals bound to a Plan run

A Goal created by `Build as Goal` is an ordinary simple Goal with a `GoalPlanBinding`
(`pm.goal.plan_binding.v1`, owned jointly with `Plans/Assistant_Plan_Runtime.md`). The binding
references the existing thread To-Do list and the existing Deep Plan scoped PlanUnit bundle by
identity; neither is duplicated.

- `cmd.chat.goal.pause` pauses the bound `PlanRun` at a shared safe boundary and fences
  continuation, schedule, and quota callbacks. The Plan's Build control stays `Building…`.
- `cmd.chat.goal.resume` revalidates under the current epoch before resuming. It refuses after a
  manual cancel and refuses against a stale Goal revision.
- `cmd.chat.goal.cancel` cancels the Goal and the bound run, invalidates the schedules and quota
  consent associated with **that execution**, and sets the Plan control to `Canceled`. Unrelated
  scheduled messages in the thread are untouched.
- `cmd.chat.goal.update` keeps direct user editing and approved agent proposals, updates the
  simple objective only, and fences the old epoch. It never edits the bound approved Plan.

Goal-driven Plan execution creates no phases, no tranches, no child Goals, and no Goal-specific
budget, and never enters the Orchestrator. Completing the bound Plan completes the Goal exactly
once; replay of that effect is idempotent. A material Goal/Plan conflict stops new mutation
admission and returns the Plan to `Revise` after a safe stop rather than conforming either
object to the other.
