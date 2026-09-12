# Goal Runtime System

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: "Puppet Master" only. This document owns native Goal Mode runtime behavior, not the bootstrap ledger conversation that produced it.
> **PlanProfile:** New Plan Authoring Profile
> **Authority:** Sole canonical owner of the Goal object and the Goal runtime: one text-only `objective_text`, integer `revision`, the `active|paused|blocked|completed` lifecycle plus cancellation receipt semantics, durable host continuation, the direct-edit versus agent-proposal authority split, Goal creation authority, the Goal event family, Goal V1 -> V2 migration, and the read-only Goal projection consumed by the Activity domain. It does not own Goal phases, Goal tranches, child Goals or child-goal topology, Goal-owned workflow budgets, or a Goal-specific planner/evaluator/verifier/adjudicator role cast; those constructs are retired by the 2026-09-03 Assistant redesign and survive only as compatibility/source lineage. It does not own scheduling windows or quota resume, To-Do state, Assistant Plan documents, collaborative workflow runtime, permission/approval hosting, model or account identity, subagent lifecycle, or any workflow's own durable state.

## 0. Scope

The Goal Runtime System is Puppet Master's native durable-continuation mode for long-running, cross-referential, or multi-step work. It is not a prompt-packet workflow, not a D2-style staged handoff, and not a planning-only assistant feature.

A Goal is deliberately small. It is one stable text objective plus a host-owned continuation promise: continue ordinary capable agent execution until this objective is achieved, the user pauses or cancels, or a genuine blocker prevents continuation. Everything else that a long run needs — questions, stages, topics, findings, ledgers, PlanUnits, assignments, checkpoints, tests, evidence, artifacts, retries, schedules, and quotas — stays in the durable state of the workflow that owns it and reaches the Goal-driven agent by reference. The Goal does not absorb that data and does not grow structure to describe it.

Goal is general-purpose and remains extensively used on both sides of the product. User-facing Assistant Chat invokes it for bugs, features, tests-until-pass, refactors, documentation, repository research, migrations, audits/repairs, and planning/doc transfer. Internal Puppet Master workflows invoke the same mechanism for external and internal research, ledger-to-Plans transfer, PlanUnit generation, audit and repair passes, WorkNode preparation, and WorkNode-related execution. Both sides get the same simple Goal record; they differ only in which workflow owns the state supplied by reference and which owner supplies completion evidence. Legacy Chain Wizard transfer references remain compatibility/source-lineage aliases only.

Goal-driven work may self-initiate `websearch`, `webfetch`, `webextract`, `webresearch`, `deep_research`, `webcrawl`, `webmap`, and Site Reader / BrowserAction evidence when current, external, URL, visual, dynamic-page, docs/issues/PR, comparison, research, or deep-research evidence matters. These calls go through the shared PM WebOperation/BrowserAction dispatcher, record `invocation_source` and `agent_reason`, obey the effective permission/no-network/egress policy, and render visible operation, progress, partial, denied, fallback, source, approval, session, or unavailable cards in the owning surface.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Assistant_Plan_Runtime.md, ContractName:Plans/ToDo_Runtime.md, ContractName:Plans/Scheduling_and_Quota_Resume.md, ContractName:Plans/Collaborative_Workflows.md, ContractName:Plans/Planning_Ledger_System.md, ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Plan_To_Node_Compilation.md

## 1. Ownership And Consumers

Goal Runtime owns the Goal record, the Goal revision history, the Goal lifecycle transitions, the continuation decision, blocked-reason identity, cancellation receipt semantics, the Goal event family, and the Goal migration contract.

Goal Runtime owns:

- `GoalRecordV2`: `goal_id`, `project_id`, `thread_id`, `objective_text`, `revision`, `state`, `blocked_reason_ref`, `active_run_ref`, `created_at`, `updated_at`, and `currentness_hash`;
- `GoalRevisionRecord`: the append-only objective history with `change_source` `user_direct|agent_proposed_user_approved`;
- `GoalContinuationRecord`: the per-evaluation continuation decision with `result` `continue|complete|pause|blocked|cancelled` and `user_stop_epoch`;
- the rule that one model response ending is not Goal completion;
- the rule that a manual Stop, Pause, or Cancel defeats every automatic continuation and resume path until the user explicitly resumes;
- the authority split between direct user editing and agent-proposed replacement;
- the six `cmd.chat.goal.*` command contracts in section 8 and the `goal.*` event family in section 10.

Goal Runtime does not own:

- Goal phases, phase boundaries, phase-bound snapshots, tranches, child Goals, parent/child completion authority, Goal-owned workflow budgets, or a Goal-specific planner/evaluator/verifier/adjudicator role cast — all retired, see section 11;
- To-Do identity, hierarchy, or status (`Plans/ToDo_Runtime.md`);
- Assistant Plan documents, Plan revisions, or Build admission (`Plans/Assistant_Plan_Runtime.md`);
- execution windows, wind-down, recurring resume, timezone/DST behavior, or Usage-reset auto-resume (`Plans/Scheduling_and_Quota_Resume.md`);
- Crew, BrainStorm, Review, or Chat Room participant/transcript/artifact runtime (`Plans/Collaborative_Workflows.md`);
- the approval ladder and rule resolution (`Plans/Permissions_System.md`);
- provider, model, and account identity (`Plans/Prompt_Pipeline.md`, `Plans/Models_System.md`, `Plans/Multi-Account.md`);
- subagent spawn, lease, budget, and result settlement lifecycle (`Plans/orchestrator-subagent-integration.md`, GRS-035, GRS-036);
- loop, no-progress, and spend taxonomy (`Plans/Run_Modes.md`, GRS-037);
- ledger records, PlanUnits, generated indexes, WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks (`Plans/Planning_Ledger_System.md`, `Plans/Plan_Document_System.md`, `Plans/Plan_To_Node_Compilation.md`, `Plans/Executor_Protocol.md`).

Assistant Chat renders the Goal Activity domain: the Activity-bar item, the interactive hover preview, and Goal Activity Detail. Goal is never a transcript card. `Plans/assistant-chat-design.md` owns that placement and chrome; this document owns the state and the actions those controls dispatch.

FinalGUISpec owns Settings GUI placement. The two Goal Mode model selectors for worker and verifier/adjudicator roles are retired with the role cast; Goal-driven work uses the ordinary Assistant model/Persona selection owned by `Plans/Models_System.md` and `Plans/Personas.md`.

Planning Ledger, Plan Document, and Plan-To-Node docs remain owners for ledger records, PlanUnits, generated indexes, and the readiness-only compiler boundary. Goal Runtime may consume those contracts for ledger-to-Plans goals, but it does not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.

When a Goal is created by PRD Builder, Planning Wizard, Chain Wizard compatibility flows, or ledger-to-Plans transfer, web/browser evidence is source evidence only until an explicit compile/build phase. Read receipts, extract receipts, citations, browser artifacts, and research closure states may flow into ledger records, PRD source refs, PlanningRun evidence, PlanUnit source lineage, or the owning workflow's receipts, but they do not create implementation work or runtime dispatch by themselves.

Permissions_System owns the global approval ladder and rule resolution. Goal Runtime owns exactly two Goal-specific approval facts: an agent-proposed objective replacement must pass through the existing approval host before it is written, and an internal Goal blocks rather than silently widening when the requested action is outside predeclared authority.

Runtime_Artifacts_Panel owns user-visible runtime-artifact browsing and retention UI. Completion evidence identity belongs to the workflow owner that produced it; Goal Runtime consumes `completion_evidence_refs` and does not restate the evidence.

## Goal V2 record and retired fields

A Goal is one concise text objective plus a lifecycle. There is no title field, no separate summary, no structured decomposition, and no second text field of any kind. The objective prose itself carries the outcome, the finish condition, and the constraints, because a user who wants to change any of those edits one paragraph rather than reconciling five fields.

`GoalRecordV2` is the only active writer schema:

```yaml
schema_id: pm.goal.record.v2
fields:
  goal_id: string
  project_id: string
  thread_id: string
  objective_text: string
  revision: integer
  state: active|paused|blocked|completed
  blocked_reason_ref: string|null
  active_run_ref: string|null
  created_at: timestamp
  updated_at: timestamp
  currentness_hash: string
negative_fields:
  - title
  - phase
  - tranche
  - child_goal_ids
  - goal_budget
  - planner_role
  - verifier_role
  - adjudicator_role
  - separate_done_when
  - separate_scope
  - separate_constraints
  - attachment_manifest
```

`objective_text` is expected to remain concise. GRS-064 implements the existing approximately 4,000-character Goal convention as exactly 4,000 Unicode scalar values; a request that exceeds it is rejected with the existing typed error rather than silently truncated, and the user is shown the limit. `currentness_hash` is the compare-and-swap token for every mutation; a stale projection cannot write. Every body writer uses `owner.goal.body.mutation@1.0.0` under GRS-064/SP-287 shared canonical custody, including metadata, lifecycle and cancellation association; this adds no field to `GoalRecordV2`.

The lifecycle enum is exactly `active | paused | blocked | completed`. `active` means the host may schedule the next turn when the thread is idle and eligible. `paused` means the user stopped continuation. `blocked` means an owner-supplied condition prevents safe progress and names it through `blocked_reason_ref`. `completed` means objective-completion evidence satisfied the continuation check.

Cancellation is not a fifth state. Cancelling writes a `goal.cancelled` event and a minimal cancellation receipt, then removes the Goal from the active projection. A cancelled Goal is not rendered as an enduring status card, and no continuation may fire for it afterwards. History remains readable for audit; the Activity domain simply stops showing it.

Every Goal has zero or one `active_run_ref`. Concurrency between the Goal and its run is resolved by the run owner, not by adding queue structure to the Goal.

`GoalRevisionRecord` is the append-only objective history:

```yaml
schema_id: pm.goal.revision.v2
fields:
  goal_id: string
  revision: integer
  objective_text: string
  change_source: user_direct|agent_proposed_user_approved
  source_message_id: string|null
  approval_id: string|null
  prior_revision_hash: string|null
  revision_hash: string
  created_at: timestamp
```

Only two `change_source` values exist. There is no third path by which a Goal's text changes. Automatic memory, compaction, title generation, summarization, Persona switching, model switching, provider retry, and BSD advice can none of them write `objective_text`. A semantic diff or a predicted To-Do impact is not required for the approval UI, though internal audit may retain `prior_revision_hash` and `revision_hash`.

Relevant attachments and context remain thread-owned. A Goal never carries an attachment manifest, and a Goal never freezes an input snapshot at creation. Where a workflow needs frozen inputs, that workflow owns the freeze under its own contract.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md

## Durable host continuation

Continuation is the entire reason the Goal object exists, and it is host-owned. One model response ending is not completion. When a model turn ends, the host — not the model, and not a prompt instruction telling the model to keep going — reloads canonical Goal state, checks currentness, checks the user stop epoch, evaluates objective-completion evidence supplied by the owning caller, and decides whether to admit another ordinary agent turn.

The evaluation is recorded as a `GoalContinuationRecord`:

```yaml
schema_id: pm.goal.continuation.v2
fields:
  continuation_id: string
  goal_id: string
  goal_revision: integer
  owning_run_id: string
  evaluated_at: timestamp
  result: continue|complete|pause|blocked|cancelled
  completion_evidence_refs: [string]
  blocked_reason_ref: string|null
  next_attempt_ref: string|null
  user_stop_epoch: integer
```

Rules that hold for every continuation evaluation:

- The next turn is an ordinary agent turn with bounded current workflow context. The host does not paste the full thread history forward and does not accumulate a growing Goal prompt; a Goal that has run for two hours sends no more objective text than it did on turn one.
- `result: continue` requires an unfinished objective, an eligible thread, an unchanged stop epoch, and a runnable next attempt. Any one of those failing produces a non-`continue` result with a recorded reason.
- `result: complete` requires `completion_evidence_refs` from the owning caller. A model asserting that it is finished is a proposal; the recorded evidence is what closes the Goal.
- `user_stop_epoch` is captured at evaluation time and compared at dispatch time. A continuation that was decided before a Stop and would dispatch after it is discarded.
- Continuation is idempotent per `(goal_id, goal_revision, owning_run_id, next_attempt_ref)`. A crash-and-restart replays the decision without duplicating a completed effect.
- Continuation survives compaction, restart, model switch, provider switch, and account switch, because the Goal record is durable and the continuation decision is recomputed from it rather than carried in conversation context.

Manual Stop, Pause, and Cancel are authoritative and terminal for automation. They defeat Goal continuation, scheduled resume, Usage-reset resume, execution-window resume, Crew Auto, and provider-native retry until the user explicitly resumes or creates a new schedule. Nothing auto-resumes a manually stopped Goal — not a quota reset, not a window opening, not a successful dependency, not a later approval. This document defers to `Plans/Scheduling_and_Quota_Resume.md` for window and quota mechanics and takes precedence over it on this one point.

Provider quota may put a run into the shared quota wait. That wait belongs to the scheduling/quota owner. It does not mutate `objective_text`, does not create a Goal phase, and does not change `state` on its own; the Goal stays `active` with its run waiting, exactly as the Build control stays `Building…` during a quota pause.

Execution windows may pause and resume the run through `Plans/Scheduling_and_Quota_Resume.md`. Goal Runtime consumes that service and specifies none of its internals here.

ContractRef: ContractName:Plans/Scheduling_and_Quota_Resume.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/Executor_Protocol.md

## Goal change authority

Three authority paths write a Goal, and no other path may.

**Creation.** `/goal`, the Goal control, or an explicit natural-language request such as "make that a goal" creates a Goal through `cmd.chat.goal.start`. The agent may create it on the user's explicit request without a second approval dialog, because the request itself is the approval. What the agent may not do is infer a Goal from a long task, from repeated failures, from a Plan Build, or from a schedule. Absent an explicit request there is no Goal.

**Direct user edit.** The user edits `objective_text` in Goal Activity Detail and presses Save. Save *is* the approved change. There is no confirmation dialog, no agent review of the user's own text, and no material-difference analysis presented back to the user. The edit writes revision `n+1` with `change_source: user_direct` and a `source_message_id` of `null`. A direct edit is permitted in `active`, `paused`, and `blocked`; editing an `active` Goal takes effect at the next continuation boundary rather than mutating a turn already in flight.

**Agent-proposed replacement.** The agent may propose a complete replacement objective only after an explicit user instruction to change the Goal. It dispatches `cmd.chat.goal.propose_update`, which returns an `ApprovalRequest` and writes nothing. The existing approval host shows exactly the current objective, the proposed complete replacement objective, `Approve Change`, and `Cancel`. On approval the accepted text is written through `cmd.chat.goal.update` with `change_source: agent_proposed_user_approved` and the originating `approval_id`. Nothing about the Goal changes before approval, and a denied or expired proposal leaves `revision` and `currentness_hash` untouched.

The system must never silently rewrite, narrow, broaden, summarize, reformat, translate, or "clarify" `objective_text`. An agent that believes the objective is wrong proposes; it does not edit. A rejected silent-rewrite attempt is a typed error, not a quiet no-op, so the attempt is visible in audit.

Pause, Resume, and Cancel are user controls. Resume from `paused` is eligible whenever currentness and permissions still resolve; Resume from `blocked` is eligible only when the owner condition named by `blocked_reason_ref` reports that it has cleared, and the control renders disabled with that reason when it has not.

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/human-in-the-loop.md, ContractName:Plans/assistant-chat-design.md

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

## Internal workflow use of Goal V2

Goal V2 is used extensively inside Puppet Master, not only in Assistant Chat. Internal research, Planning Ledger to Plans transfer, PlanUnit generation, audit and repair sweeps, WorkNode preparation, and execution all run under the same engine, with the same record, the same continuation loop, and the same stop semantics. There is no second internal Goal engine and no internal-only Goal field.

What the internal callers get from Goal is exactly two things: a stable objective that survives compaction, restart, and model change, and a durable host continuation that keeps working the objective until it is complete, paused, blocked, or cancelled. What they do not get, and must not ask for, is a place to store their own workflow state.

Each internal caller keeps its own state under its own owner:

| Caller | Goal supplies | Caller owns |
|---|---|---|
| Internal research | objective, continuation | queries, sources, extracts, citations, dedup, coverage |
| Ledger to Plans transfer | objective, continuation | ledger session, atoms, decisions, corrections, topic coverage, conversion receipts |
| PlanUnit generation | objective, continuation | unit drafts, owner placement, dependency graph, acceptance criteria, validation surfaces |
| Audit and repair | objective, continuation | findings, severity, disposition, repair attempts, re-verification evidence |
| WorkNode preparation | objective, continuation | node seeds, readiness, inputs, compile receipts |
| Execution | objective, continuation | assignments, checkpoints, tests, evidence, artifacts, retries, schedules, quotas |

An internal caller that needs staged progress models the stages in its own records and reports readiness to Goal through completion evidence. It does not add a phase to the Goal, and Goal does not grow a field to hold it. This is the DRY boundary that the retired phase model violated: a Goal phase was a second, weaker copy of a workflow stage that the workflow already owned, and the two drifted.

A Goal may drive several workflows by reference over its life. It holds no queue of them. The active work is whatever `active_run_ref` names, and the run owner resolves ordering, parallelism, and dependency among its own units.

Invisible internal Goals are not rendered in the Assistant Activity bar. They are visible in the surfaces their owning workflow already provides, and they obey the same Stop epoch as user-facing Goals.

ContractRef: ContractName:Plans/Planning_Ledger_System.md, ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Plan_To_Node_Compilation.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/orchestrator-subagent-integration.md

## Retired Goal structure and negative ownership

The following are retired from Goal Runtime. They are not deprecated-but-tolerated; an active Goal V2 record, projection, event, command, or GUI surface that carries any of them is a defect.

- **Goal phases.** No phase list, no `currentPhaseId`, no phase status, no phase exit criterion, no phase-bound evidence, no phase-bound attachment snapshot, no phase stepper, and no phase-derived progress bar.
- **Goal tranches.** No tranche grouping, no tranche budget, no tranche admission.
- **Child Goals.** No child-goal topology, no parent completion authority over children, no child write leases, no subgoal tree display, and no "3 child goals active" projection. Work that used to be a child Goal is either a To-Do under `Plans/ToDo_Runtime.md`, a participant under `Plans/Collaborative_Workflows.md`, or a separate Goal with no parent edge.
- **Goal budgets.** No Goal-owned token, cost, turn, or wall-clock budget. Usage truth belongs to `Plans/usage-feature.md`; quota waiting belongs to `Plans/Scheduling_and_Quota_Resume.md`.
- **Mandatory role cast.** No Goal-specific planner, evaluator, verifier, or adjudicator role is required to run a Goal. Where a workflow genuinely needs a reviewer, that reviewer is a Review run under `Plans/Collaborative_Workflows.md` or a certification step under the workflow's own owner, selected by that owner rather than imposed by Goal.

Goal also does not own, and must not duplicate: To-Do state, Plan documents, ledgers, PlanUnits, WorkNodes, Orchestrator scheduling, schedules and execution windows, quota and reset truth, artifact version and retention, permission grants, Persona or model identity, thread or message lifecycle, or context materialization.

Back Seat Driver is never a required step in a Goal. `Plans/Back_Seat_Driver.md` is read-only advice, and a Goal must complete, pause, block, or cancel identically whether BSD is Off, Auto, On, degraded, or quarantined.

ContractRef: ContractName:Plans/ToDo_Runtime.md, ContractName:Plans/Collaborative_Workflows.md, ContractName:Plans/Back_Seat_Driver.md, ContractName:Plans/usage-feature.md, ContractName:Plans/DRY_Rules.md

## Goal V2 exact commands and required result boundaries

| Command ID | Meaning | Required result boundary |
|---|---|---|
| `cmd.chat.goal.start` | Create one text-only Goal for the thread | Returns `goal_id`, revision 1, `currentness_hash`, and a creation receipt. Creates no phase, child Goal, budget, schedule, Plan, or To-Do. |
| `cmd.chat.goal.update` | Write an approved objective revision | Requires the expected revision and currentness hash, and either a user-authored edit or a resolved `approval_id`. Returns revision `n+1`. Never partially applies. |
| `cmd.chat.goal.propose_update` | Agent requests an objective change | Returns an `ApprovalRequest` and writes nothing. A denied or expired proposal leaves revision and currentness untouched. |
| `cmd.chat.goal.pause` | User pauses continuation | Sets `paused`, latches the stop epoch, and cancels no workflow-owned record. Nothing may auto-resume afterwards. |
| `cmd.chat.goal.resume` | User resumes continuation | Refused while a manual stop is latched or while `blocked_reason_ref` has not cleared; the refusal names the reason. |
| `cmd.chat.goal.cancel` | User ends the Goal | Writes a cancellation receipt, removes the Goal from the active projection, and forbids further continuation. Workflow-owned records remain under their owners. |
| `cmd.chat.goal.open_editor` | Open Goal Activity Detail in edit mode | Navigation only. Opening the editor is not a mutation and cannot change revision or currentness. |

`cmd.chat.goal.start` and `cmd.chat.goal.update` are pre-existing registered command IDs. This wave revises their request and result contracts in place to `GoalStartRequestV2`/`GoalStartResultV2` and `GoalUpdateRequestV2`/`GoalUpdateResultV2`. They keep one registration, one sole future handler, and one wiring identity; no peer row, compatibility spelling, or second handler is minted for them.

Every request carries `schema_id`, `schema_version`, command ID, command instance ID, `project_id`, `thread_id`, `goal_id` where applicable, expected revision, expected `currentness_hash`, actor, permission snapshot, idempotency key, source surface, and return route. Typed errors are `invalid_request`, `goal_not_found`, `stale_goal_revision`, `stale_currentness`, `objective_too_long`, `approval_required`, `approval_not_resolved`, `manual_stop_latched`, `blocked_condition_unresolved`, `command_not_registered`, `permission_denied`, `owner_unavailable`, or `cancelled`. A failure remains a failure: it never advances state, never emits a success-shaped receipt, and never writes a revision.

Until the central command catalog, Event Authority, and production wiring rows close for a given ID, its controls render disabled with `command_not_registered`. No page-local handler, alias, fixture, or toast may simulate success.

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Commands_System.md, ContractName:Plans/Wiring_Matrix.production.json

## Goal V2 events

The required semantic event names are `goal.created`, `goal.updated`, `goal.paused`, `goal.resumed`, `goal.blocked`, `goal.completed`, `goal.cancelled`, and `goal.continuation_evaluated`. All eight require central EventRecord registration and payload schemas before any emission; until then the owning command records only its typed result, receipt, and projection.

Envelopes carry Project, thread, and Goal identity, revision, `currentness_hash`, actor, correlation and causation, idempotency key, and redacted source refs. `goal.updated` carries `change_source` and, for the agent path, `approval_id`. `goal.continuation_evaluated` carries `result`, `user_stop_epoch`, and completion-evidence refs by reference rather than by value.

No event may carry `objective_text` in full where a hash and a revision reference suffice for audit, and no event may carry secrets, tokens, provider credentials, or raw file bodies.

There is deliberately no `goal.phase_*`, `goal.tranche_*`, `goal.child_*`, or `goal.budget_*` event. Registering one would reintroduce retired structure through the event catalog.

ContractRef: ContractName:Plans/Commands_System.md, ContractName:Plans/storage-plan.md

## Goal V1 to V2 migration

Migration reads `pm.goal.record.v1` and writes `pm.goal.record.v2`. It is a one-way structural reduction with explicit custody of what is dropped.

- `objective` maps to `objective_text` unchanged. A V1 record whose objective exceeds the product maximum is quarantined for owner review rather than truncated.
- `title` is dropped. Where a V1 title carried meaning the objective does not, migration does not merge it silently; it records the dropped title in the migration receipt so an owner can decide.
- `phases`, `currentPhaseId`, `tranches`, `subgoals`, `child_goal_ids`, `budget`, and role-cast fields are dropped and recorded in the receipt. Evidence that was attached to a completed phase is re-parented to the workflow owner that produced it, or retained as an immutable historical artifact reference; it is never deleted to make a migration pass.
- V1 status maps as `active → active`, `paused → paused`, `blocked → blocked`, `completed → completed`, and `cancelled → cancelled receipt plus removal from the active projection` (cancellation is not a V2 state).
- Revision history is synthesized as a single revision 1 with `change_source: user_direct` when no V1 revision history exists. Migration never fabricates intermediate revisions.
- In-flight V1 Goals are paused across the migration boundary and require an explicit user resume. Migration never resumes work by itself, and a V1 Goal that was manually stopped stays stopped.

Receipts record before and after hashes, dropped-field custody, quarantined records, and unresolved residual risk. A migration that cannot validate a Project or thread edge quarantines rather than guessing.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Bootstrap_Planning_Migration.md

## Goal V2 verification

Structural tests validate the V2 schema and fixtures, the absence of every retired field, revision monotonicity, compare-and-swap rejection of a stale `currentness_hash`, the two-value `change_source` enum, objective-length rejection, and the four-value lifecycle enum with cancellation modelled as a receipt rather than a state.

Behavioral tests must prove that a Goal continues past a single model response across at least three host-admitted turns; that continuation survives a simulated restart and a compaction without growing the prompt; that a manual Stop, Pause, or Cancel defeats continuation, scheduled resume, Usage-reset resume, execution-window resume, and provider-native retry; that a direct user edit writes revision `n+1` with no approval dialog; that an agent proposal writes nothing before approval and nothing after denial; that an unrequested silent rewrite is refused with a typed error; and that a `complete` result requires recorded completion evidence rather than a model assertion.

Negative tests must prove that no active surface exposes a phase, tranche, child Goal, budget, or mandatory verifier role; that a Goal cannot be inferred without an explicit user request; that a blocked Goal cannot resume until its named condition clears; and that BSD state — Off, Auto, On, degraded, or quarantined — changes no Goal outcome.

Internal-caller tests must prove that a research Goal, a ledger-to-Plans Goal, and a PlanUnit-generation Goal each complete multi-turn work while keeping their own workflow state under their own owners, and that none of them writes a Goal field to hold it.

ContractRef: ContractName:Plans/Automated_Testing_System.md, ContractName:Plans/Progression_Gates.md

## 2. Canonical PlanUnits

### GRS-001 - Native Goal Mode Scope And Retired Prompt Boundary

```yaml
plan_unit_id: GRS-001
unit_type: constraint
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  Goal Mode is a native autonomous execution mode for finished Puppet Master product behavior. It replaces the failed long prompt-packet/D2 handoff approach for long or cross-referential work. It must support arbitrary assistant goals and must not be narrowed to planning-doc transfer, bootstrapped PM Goal Mode, prompt loops, or staged prompt packets under a different name.
gui_related: false
gui_classification_reason: This unit defines runtime/product scope and retired workflow boundaries, not GUI implementation.
depends_on: []
unblocks: []
acceptance_criteria:
  - Goal Runtime docs describe a native autonomous execution system rather than a prompt-packet or D2 slicing workflow.
  - User-facing Goal Mode remains general-purpose for bugs, features, tests-until-pass, refactors, docs, repo research, migrations, audits/repairs, and planning/doc transfer.
  - Bootstrap-only implementation work is not presented as the product foundation.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - manual Goal Runtime owner review
risk_class: product_scope_drift
reasoning_tier: standard
context_scope: goal_runtime_system
implementation_surfaces:
  - Plans/Goal_Runtime_System.md
  - future Goal Mode service
node_compile_hint:
  mode: runtime_scope_contract
  create_worknodes: false
source_lineage:
  - pldg-20260616-001-goal-runtime-system:atom-0002
  - pldg-20260616-001-goal-runtime-system:atom-0003
  - pldg-20260616-001-goal-runtime-system:atom-0004
  - pldg-20260616-001-goal-runtime-system:atom-0005
  - pldg-20260616-001-goal-runtime-system:atom-0081
  - pldg-20260616-001-goal-runtime-system:dec-0002
  - pldg-20260616-001-goal-runtime-system:dec-0004
  - pldg-20260616-001-goal-runtime-system:dec-0005
  - pldg-20260616-001-goal-runtime-system:corr-0001
  - pldg-20260616-001-goal-runtime-system:corr-0002
  - pldg-20260616-001-goal-runtime-system:corr-0004
preserved_exact_tokens:
  - "native autonomous execution mode"
  - "not merely a smarter prompt"
  - "Do not rebuild long staged prompt handoffs under a different name."
  - "Do not implement Goal Mode as only a prompt loop."
  - "Do not limit Goal Mode to planning docs."
  - "No bootstrapped PM Goal Mode required"
  - "bugs, features, tests-until-pass"
negative_constraints:
  - Do not reintroduce old prompt-packet/D2 workflow as the product foundation.
  - Do not document a separate bootstrapped Goal Mode implementation as required for Puppet Master.
  - Do not narrow Assistant Chat Goal Mode to plan-doc tasks.
owner_hints:
  - Plans/Goal_Runtime_System.md
```

### GRS-048 - Goal V2 Record And Retired Field Prohibition

```yaml
plan_unit_id: GRS-048
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  A Goal is one concise text objective plus a lifecycle. GoalRecordV2 (pm.goal.record.v2) carries goal_id, project_id, thread_id, objective_text, revision, state, blocked_reason_ref, active_run_ref, created_at, updated_at, and currentness_hash and nothing else. There is no title, no second text field, no phase, no tranche, no child_goal_ids, no goal_budget, no planner/verifier/adjudicator role field, no separate done_when/scope/constraints, and no attachment manifest. The lifecycle enum is exactly active|paused|blocked|completed; cancellation is a receipt plus removal from the active projection, not a fifth state. currentness_hash is the compare-and-swap token for every mutation, and an objective that exceeds the approximately 4,000-character product maximum is rejected with a typed error rather than truncated. GRS-064/SP-287 supply the concrete scalar limit, semantic codec/currentness recipe and shared owner.goal.body.mutation@1.0.0 custody route without adding a Goal field.
gui_related: true
gui_classification_reason: The record shape decides what the Goal Activity bar and Goal Activity Detail may render, and forbids every retired projection.
depends_on: []
unblocks: [GRS-050, GRS-052]
acceptance_criteria:
  - An active Goal V2 record, projection, event, command, or GUI surface carries none of the negative fields.
  - The lifecycle enum has exactly four values and cancellation is modelled as a receipt.
  - A stale currentness_hash is rejected and cannot write.
  - An oversized objective is rejected with a typed error and the limit is shown.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: retired_goal_structure_reintroduced
reasoning_tier: high
context_scope: goal_runtime_v2_record
implementation_surfaces:
  - Plans/Goal_Runtime_System.md
  - Plans/storage-plan.md
  - Concepts/chat-assistant-concepts/5.6 Pro/goals.js
node_compile_hint:
  mode: goal_v2_record_contract
  create_worknodes: false
source_lineage:
  - pm-assistant-implementation-2026-09-02-recovered:GOAL-001
  - pm-assistant-implementation-2026-09-02-recovered:GOAL-002
  - pm-assistant-implementation-2026-09-02-recovered:02_RUNTIME_AND_STORAGE_CONTRACTS.md#4.1
preserved_exact_tokens:
  - "pm.goal.record.v2"
  - "objective_text"
  - "currentness_hash"
  - "active|paused|blocked|completed"
negative_constraints:
  - Do not add a title, phase, tranche, child Goal, budget, or role field to the Goal record.
  - Do not model cancellation as a lifecycle state.
  - Do not truncate an oversized objective silently.
owner_hints:
  - Plans/Goal_Runtime_System.md
```

### GRS-049 - Retired Goal Role Cast And Model-Role Policy

```yaml
plan_unit_id: GRS-049
unit_type: constraint
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  Goal Runtime no longer requires a planner, evaluator, reducer, verifier, adjudicator, or certifier role to run a Goal, and no longer persists a Goal-owned model-role policy or certification tier. Model and account selection belong to Models System and Multi-Account. Where a workflow genuinely needs review, that review is an explicitly configured Review run under Collaborative Workflows or a certification step owned by the workflow itself, chosen by that owner rather than imposed by Goal. Bounded worker authority, evidence discipline, and proposal-versus-canonical distinctions remain requirements of the executing run owner, not of the Goal record.
gui_related: false
gui_classification_reason: This unit removes runtime role requirements and names their new owners; it defines no user-visible surface.
depends_on: [GRS-048]
unblocks: []
acceptance_criteria:
  - No Goal command, record, event, or projection names a required planner, evaluator, verifier, adjudicator, or certifier role.
  - A Goal completes, pauses, blocks, or cancels identically regardless of whether any reviewer exists.
  - Review remains available as an explicitly configured Collaborative Workflows run.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
risk_class: mandatory_goal_role_cast_reintroduced
reasoning_tier: standard
context_scope: goal_runtime_role_retirement
implementation_surfaces:
  - Plans/Goal_Runtime_System.md
  - Plans/Collaborative_Workflows.md
  - Plans/Models_System.md
node_compile_hint:
  mode: goal_role_retirement
  create_worknodes: false
source_lineage:
  - pm-assistant-implementation-2026-09-02-recovered:GOAL-003
  - pm-assistant-implementation-2026-09-02-recovered:AUTHORITY_AND_PRECEDENCE.md#4
preserved_exact_tokens:
  - "mandatory planner/verifier roles"
negative_constraints:
  - Do not reintroduce a Goal-specific role cast or certification tier.
  - Do not make any Goal outcome depend on a reviewer Goal Runtime does not own.
owner_hints:
  - Plans/Goal_Runtime_System.md
```

### GRS-050 - Durable Host Continuation And Evidence-Gated Completion

```yaml
plan_unit_id: GRS-050
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  Continuation is host-owned and durable. One model response ending is never completion. At each turn boundary the host reloads canonical Goal state, checks currentness, compares the user stop epoch, evaluates owner-supplied completion evidence, and records a GoalContinuationRecord (pm.goal.continuation.v2) with result continue|complete|pause|blocked|cancelled. The next turn is an ordinary agent turn with bounded current workflow context; the host never accumulates a growing Goal prompt. result complete requires completion_evidence_refs supplied by the owning caller -- a model asserting it is finished is a proposal, not a completion. Continuation is idempotent per goal_id, goal_revision, owning_run_id, and next_attempt_ref, and survives compaction, restart, model switch, provider switch, and account switch.
gui_related: false
gui_classification_reason: Continuation is runtime behavior; its only GUI consequence is the Goal state shown in Activity.
depends_on: [GRS-048]
unblocks: [GRS-051]
acceptance_criteria:
  - A Goal continues past a single model response across at least three host-admitted turns.
  - Continuation survives a simulated restart and a compaction without growing the prompt.
  - A complete result without recorded completion evidence is refused.
  - Replay after a crash does not duplicate a completed effect.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future Goal continuation harness
risk_class: goal_completes_on_one_model_response
reasoning_tier: high
context_scope: goal_runtime_continuation
implementation_surfaces:
  - Plans/Goal_Runtime_System.md
  - Plans/Executor_Protocol.md
node_compile_hint:
  mode: goal_continuation_contract
  create_worknodes: false
source_lineage:
  - pm-assistant-implementation-2026-09-02-recovered:GOAL-004
  - pm-assistant-implementation-2026-09-02-recovered:02_RUNTIME_AND_STORAGE_CONTRACTS.md#4.3
preserved_exact_tokens:
  - "pm.goal.continuation.v2"
  - "completion_evidence_refs"
  - "user_stop_epoch"
negative_constraints:
  - Do not treat the end of a model turn as objective completion.
  - Do not carry the continuation decision in conversation context instead of durable state.
  - Do not accumulate objective or history text across turns.
owner_hints:
  - Plans/Goal_Runtime_System.md
```

### GRS-051 - Manual Stop Precedence Over Every Automatic Resume

```yaml
plan_unit_id: GRS-051
unit_type: constraint
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  A manual Stop, Pause, or Cancel is authoritative and terminal for automation. It defeats Goal continuation, scheduled resume, Usage-reset resume, execution-window resume, Crew Auto, and provider-native retry until the user explicitly resumes or creates a new schedule. A continuation decided before a Stop that would dispatch after it is discarded by stop-epoch comparison at dispatch time. Goal Runtime consumes Scheduling and Quota Resume for window and quota mechanics and takes precedence over it on this one point. Quota waiting does not mutate objective_text, does not create a phase, and does not change state by itself; the Goal stays active with its run waiting.
gui_related: true
gui_classification_reason: The Resume control must render disabled with the exact latched-stop reason rather than appearing available.
depends_on: [GRS-050]
unblocks: []
acceptance_criteria:
  - A manually stopped Goal is not resumed by a quota reset, a window opening, a cleared dependency, or a later approval.
  - A continuation decided before a Stop is discarded at dispatch.
  - Quota wait leaves state active and objective_text unchanged.
  - The Resume control names the latched reason when disabled.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: automatic_resume_overrides_user_stop
reasoning_tier: high
context_scope: goal_runtime_stop_precedence
implementation_surfaces:
  - Plans/Goal_Runtime_System.md
  - Plans/Scheduling_and_Quota_Resume.md
  - Plans/usage-feature.md
node_compile_hint:
  mode: goal_stop_precedence
  create_worknodes: false
source_lineage:
  - pm-assistant-implementation-2026-09-02-recovered:GOAL-005
  - pm-assistant-implementation-2026-09-02-recovered:01_IMPLEMENTATION_SPEC.md#1.5
preserved_exact_tokens:
  - "manual_stop_latched"
  - "user_stop_epoch"
negative_constraints:
  - Do not auto-resume a manually stopped Goal for any reason.
  - Do not let a quota wait change Goal state or objective text.
owner_hints:
  - Plans/Goal_Runtime_System.md
```

### GRS-052 - Retired Child Goals And Their Replacement Owners

```yaml
plan_unit_id: GRS-052
unit_type: constraint
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  Child Goals, child-goal topology, parent completion authority over children, child write leases, and subgoal tree display are retired. A Goal has zero or one active_run_ref and no queue of children. Work that was previously a child Goal is either a To-Do under ToDo Runtime, a participant under Collaborative Workflows, or a separate Goal with no parent edge. Write isolation, worktree separation, and scope-conflict detection remain requirements of the executing run and worktree owners. No subagent may resume or advance a Goal; only the host continuation loop admits the next turn.
gui_related: true
gui_classification_reason: This retires the collapsible child-goal display and every child-count projection from the Assistant surface.
depends_on: [GRS-048]
unblocks: []
acceptance_criteria:
  - No Goal record, projection, event, or GUI surface exposes a child Goal, a child count, or a subgoal tree.
  - Bounded parallel work resolves to To-Dos or collaborative participants.
  - A subagent cannot resume or advance a Goal.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
risk_class: child_goal_topology_reintroduced
reasoning_tier: high
context_scope: goal_runtime_child_retirement
implementation_surfaces:
  - Plans/Goal_Runtime_System.md
  - Plans/ToDo_Runtime.md
  - Plans/Collaborative_Workflows.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: goal_child_retirement
  create_worknodes: false
source_lineage:
  - pm-assistant-implementation-2026-09-02-recovered:GOAL-006
  - pm-assistant-implementation-2026-09-02-recovered:AUTHORITY_AND_PRECEDENCE.md#4
preserved_exact_tokens:
  - "child goals"
  - "active_run_ref"
negative_constraints:
  - Do not reintroduce child Goals, child leases, or parent completion authority.
  - Do not let a subagent continue a Goal.
owner_hints:
  - Plans/Goal_Runtime_System.md
```

### GRS-053 - Internal Caller Boundary And Workflow-Owned State

```yaml
plan_unit_id: GRS-053
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  Goal V2 is used extensively inside Puppet Master: internal research, ledger-to-Plans transfer, PlanUnit generation, audit and repair, WorkNode preparation, and execution all run on the same engine, record, continuation loop, and stop semantics. Goal supplies exactly two things to those callers -- a stable objective and durable host continuation. Every caller keeps its own questions, stages, topics, findings, ledgers, PlanUnits, assignments, checkpoints, tests, evidence, artifacts, retries, schedules, and quotas under its own owner. A caller needing staged progress models the stages in its own records and reports readiness through completion evidence; it never adds a phase to the Goal and Goal never grows a field to hold it. Invisible internal Goals are not rendered in the Assistant Activity bar and obey the same stop epoch.
gui_related: false
gui_classification_reason: Internal Goals are not rendered in the Assistant surface; this unit defines a runtime and ownership boundary.
depends_on: [GRS-048, GRS-050]
unblocks: []
acceptance_criteria:
  - A research Goal, a ledger-to-Plans Goal, and a PlanUnit-generation Goal each complete multi-turn work.
  - None of them writes a Goal field to hold workflow state.
  - Internal Goals do not appear in the Assistant Activity bar and honour the stop epoch.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: workflow_state_absorbed_into_goal
reasoning_tier: high
context_scope: goal_runtime_internal_callers
implementation_surfaces:
  - Plans/Goal_Runtime_System.md
  - Plans/Planning_Ledger_System.md
  - Plans/Plan_Document_System.md
  - Plans/Plan_To_Node_Compilation.md
  - Plans/Executor_Protocol.md
node_compile_hint:
  mode: goal_internal_caller_boundary
  create_worknodes: false
source_lineage:
  - pm-assistant-implementation-2026-09-02-recovered:GOAL-007
  - pm-assistant-implementation-2026-09-02-recovered:07_DRY_OWNERSHIP_MAP.md#3
preserved_exact_tokens:
  - "ledger-to-Plans"
  - "WorkNode preparation"
negative_constraints:
  - Do not add a workflow-state field to the Goal record for an internal caller.
  - Do not build a second internal Goal engine.
owner_hints:
  - Plans/Goal_Runtime_System.md
```

### GRS-054 - Goal Change Authority And Two-Path Revision

```yaml
plan_unit_id: GRS-054
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  Exactly two paths write objective_text. A direct user edit in Goal Activity Detail writes revision n+1 with change_source user_direct; Save is the approved change and requires no confirmation dialog, no agent review, and no material-difference analysis. An agent-proposed complete replacement, permitted only after an explicit user instruction to change the Goal, dispatches cmd.chat.goal.propose_update, returns an ApprovalRequest, and writes nothing until the user approves, at which point the accepted text is written with change_source agent_proposed_user_approved and the originating approval_id. The agent may create a Goal on an explicit user request without a second approval, and may never infer one from a long task, repeated failures, a Plan Build, or a schedule. The system must never silently rewrite, narrow, broaden, summarize, reformat, translate, or clarify objective_text; an attempt is a typed error, not a quiet no-op.
gui_related: true
gui_classification_reason: This defines the Goal editor Save behavior and the approval dialog contents for agent proposals.
depends_on: [GRS-048]
unblocks: []
acceptance_criteria:
  - A direct user edit writes revision n+1 with no approval dialog.
  - An agent proposal writes nothing before approval and nothing after denial or expiry.
  - An unrequested silent rewrite is refused with a typed error.
  - No Goal is created without an explicit user request.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
risk_class: silent_goal_rewrite_or_inferred_goal
reasoning_tier: high
context_scope: goal_runtime_change_authority
implementation_surfaces:
  - Plans/Goal_Runtime_System.md
  - Plans/assistant-chat-design.md
  - Plans/Permissions_System.md
node_compile_hint:
  mode: goal_change_authority
  create_worknodes: false
source_lineage:
  - pm-assistant-implementation-2026-09-02-recovered:GOAL-008
  - pm-assistant-implementation-2026-09-02-recovered:GOAL-009
  - pm-assistant-implementation-2026-09-02-recovered:01_IMPLEMENTATION_SPEC.md#4.6
preserved_exact_tokens:
  - "user_direct"
  - "agent_proposed_user_approved"
  - "Approve Change"
negative_constraints:
  - Do not show the user an approval dialog for the user's own edit.
  - Do not let any subsystem write objective_text outside the two paths.
  - Do not infer a Goal from workload or failure.
owner_hints:
  - Plans/Goal_Runtime_System.md
```

### GRS-055 - Goal And To-Dos Are Activity Domains

```yaml
plan_unit_id: GRS-055
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  Goal and To-Dos are Activity domains, not transcript cards. The Activity bar renders a compact Goal projection with state and a truncated objective, and a hover menu offering Pause, Resume, Cancel, and an edit icon that opens Goal Activity Detail in edit mode. Goal Activity Detail shows the full objective, an editable field with Save and Cancel edit, the lifecycle controls, and a compact revision History listing revision number, timestamp, change_source, and the objective text at that revision. The detail view must not show a title field, phases, tranches, child Goals, budgets, a current action, a next action, a task drawer, an invented percentage progress bar, or separate scope, done-when, and constraints fields. Goal progress is visible through To-Dos and the ordinary transcript.
gui_related: true
gui_classification_reason: This unit defines the Goal Activity bar projection, hover menu, and Activity Detail surface.
depends_on: [GRS-048, GRS-054]
unblocks: []
acceptance_criteria:
  - No Goal or To-Do card is rendered in the transcript.
  - The Goal hover menu offers Pause, Resume, Cancel, and edit-to-panel.
  - The detail view exposes none of the retired fields.
  - Every control dispatches a registered command and renders disabled with command_not_registered until registration closes.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - node tests/activity-detail-verify.mjs
risk_class: retired_goal_projection_in_transcript
reasoning_tier: standard
context_scope: goal_runtime_activity_surface
implementation_surfaces:
  - Plans/Goal_Runtime_System.md
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Concepts/chat-assistant-concepts/5.6 Pro/goals.js
node_compile_hint:
  mode: goal_activity_projection
  create_worknodes: false
source_lineage:
  - pm-assistant-implementation-2026-09-02-recovered:GOAL-010
  - pm-assistant-implementation-2026-09-02-recovered:04_GUI_IMPACTS.md#8
preserved_exact_tokens:
  - "Goal Activity Detail"
  - "Pause/Resume"
  - "Cancel Goal"
negative_constraints:
  - Do not render Goal or To-Dos as transcript cards.
  - Do not show a phase stepper, child goal tree, or budget meter.
owner_hints:
  - Plans/Goal_Runtime_System.md
```

### GRS-056 - Goal V1 To V2 Migration With Dropped-Field Custody

```yaml
plan_unit_id: GRS-056
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  Migration reads pm.goal.record.v1 and writes pm.goal.record.v2 as a one-way structural reduction with explicit custody. objective maps to objective_text unchanged and an oversized objective quarantines rather than truncating. title, phases, currentPhaseId, tranches, subgoals, child_goal_ids, budget, and role-cast fields are dropped and recorded in the migration receipt; evidence attached to a completed phase is re-parented to the workflow owner that produced it or retained as an immutable historical artifact reference, never deleted to make a migration pass. V1 cancelled maps to a cancellation receipt plus removal from the active projection because cancellation is not a V2 state. Revision history is synthesized as a single revision 1 with change_source user_direct when none exists; migration never fabricates intermediate revisions. In-flight V1 Goals are paused across the boundary and require an explicit user resume, and a manually stopped V1 Goal stays stopped.
gui_related: false
gui_classification_reason: Migration is a storage and custody operation with no user-visible surface of its own.
depends_on: [GRS-048]
unblocks: []
acceptance_criteria:
  - Every dropped V1 field appears in the migration receipt with its custody disposition.
  - Phase evidence is re-parented or retained, never deleted.
  - Migration pauses in-flight Goals and resumes none of them.
  - A record whose Project or thread edge cannot validate quarantines rather than guessing.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py
  - python3 scripts/pm-plan-index.py validate
risk_class: silent_goal_data_loss_on_migration
reasoning_tier: high
context_scope: goal_runtime_v1_to_v2_migration
implementation_surfaces:
  - Plans/Goal_Runtime_System.md
  - Plans/storage-plan.md
  - Plans/Bootstrap_Planning_Migration.md
node_compile_hint:
  mode: goal_v1_to_v2_migration
  create_worknodes: false
source_lineage:
  - pm-assistant-implementation-2026-09-02-recovered:GOAL-011
  - pm-assistant-implementation-2026-09-02-recovered:02_RUNTIME_AND_STORAGE_CONTRACTS.md#12.1
preserved_exact_tokens:
  - "pm.goal.record.v1"
  - "pm.goal.record.v2"
negative_constraints:
  - Do not delete dropped-field data to make a migration pass.
  - Do not fabricate revision history.
  - Do not resume work during migration.
owner_hints:
  - Plans/Goal_Runtime_System.md
```

## Server command-gap owner closure - Goal handoff family (2026-09-01)

`GoalExecutionHandoffCoordinator` owns one DRY command family in `Plans/goal_handoff_contracts.schema.json`: request, result, error, availability, disabled reason, permission decision, exact-return round trip, and the typed local details action. The six canonical commands and their sole future handlers are:

- `cmd.goal.checkpoint` -> `handlers::goal_handoff::checkpoint`
- `cmd.goal.continue_on_host` -> `handlers::goal_handoff::continue_on_host`
- `cmd.goal.handoff.cancel` -> `handlers::goal_handoff::handoff_cancel`
- `cmd.goal.handoff.retry` -> `handlers::goal_handoff::handoff_retry`
- `cmd.goal.pause` -> `handlers::goal_handoff::pause`
- `cmd.goal.resume_here` -> `handlers::goal_handoff::resume_here`

All six are `handler_unavailable` until central registration, schema binding, the named sole native handler, permission/FileSafe route, production wiring, and receipt-or-admitted-event disposition are current. No fixture or Plan text makes a handler available. Source token `cmd.goal.handoff.open_details` is retained only as the adjudicated spelling for `ui.goal.handoff.open_details`, a typed, bounded, redacted, lazy local projection with no domain handler and no domain EventRecord. Its exact consumers are Goal/Assistant status, Project activity, Goal handoff modal, status bar, and Doctor.

Checkpoint and pause serialize only a durable continuation boundary, source/worktree identity, artifact refs, owner state, generations, and non-secret credential refs; they never freeze, serialize, or migrate a live process. Continue and resume revalidate exact Goal/GoalRun/Project/source location/current Host/target Host, topology, source, worktree, capability, credential, permission, and checkpoint generations. Retry keeps the same idempotent handoff identity but revalidates the typed failure and all currentness inputs. Cancel targets only the exact cancellable handoff operation. Restart converges from the durable handoff journal to resume, rollback, or `recovery_required`; duplicated, stale, or racing requests cannot produce two continuations. Results restore the exact initiating surface, route, focus, and invocation generation or report `caller_unavailable` without redirecting to a convenient fallback. Requests, results, receipts, logs, details projections, and ObservableWork expose no raw secret, protected authentication content, credential value, or unrestricted filesystem path.

### GRS-047 - Goal Handoff Command And Local-Projection Closure

```yaml
plan_unit_id: GRS-047
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  GoalExecutionHandoffCoordinator owns six exact checkpoint, pause, continue, resume, retry, and cancel commands through
  one closed request/result/error/availability/disabled/permission family, plus one presentation-only details action.
  Every command remains handler_unavailable until its named sole native handler and complete central integration exist;
  durable checkpoints transfer reconstructible authority only and never claim live-process migration.
gui_related: true
gui_classification_reason: Goal handoff availability, progress, blockers, details, and exact return are visible across five named GUI consumers.
depends_on: [GRS-019, GRS-043]
unblocks: []
acceptance_criteria:
  - The schema and fixtures cover exactly six canonical command IDs, six sole handlers, and ui.goal.handoff.open_details as a no-domain-handler/no-domain-event local action.
  - Goal/Assistant status, Project activity, Goal handoff modal, status bar, and Doctor consume the same owner projection.
  - Checkpoint, pause, continue, resume, retry, cancel, restart, duplicate, stale-generation, race, permission, FileSafe, secret-redaction, and exact-return cases remain typed and fail closed.
  - No command becomes available from schema, fixture, catalog text, or browser/static evidence alone.
validation_surfaces: [Plans/goal_handoff_contracts.schema.json, Plans/goal_handoff_contract_fixtures.json, focused Server owner-bundle-A validator]
risk_class: goal_handoff_false_migration_or_duplicate_continuation
reasoning_tier: high
context_scope: server_command_gap_goal_handoff
implementation_surfaces: [Plans/Goal_Runtime_System.md, Plans/goal_handoff_contracts.schema.json, future Goal handoff native handler]
node_compile_hint: {mode: goal_handoff_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:server-command-gap-adjudication:rows-77-83]
negative_constraints:
  - Do not serialize or migrate a live process.
  - Do not create a domain handler or EventRecord for ui.goal.handoff.open_details.
  - Do not expose raw secrets, protected authentication content, credential values, or unrestricted paths.
```

### GRS-046 - Frozen Goal Route And Explicit Rebind

```yaml
plan_unit_id: GRS-046
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: A GoalRun freezes its requested and effective provider, model, account, route, Persona, mode, topology, policy generations, and resolver evidence at admission. Replan, provider rotation, fallback, or user route change creates an explicit revisioned rebind with reason, authority/currentness checks, prior/new snapshots, and owner epoch; focus, thread selection, reconnect, compaction, or current Settings never silently retarget an admitted GoalRun.
gui_related: false
depends_on: [GRS-044, MS-137]
unblocks: []
acceptance_criteria:
  - AGT-003 route identity survives context compaction, client loss, reconnect, and current-catalog change.
  - A required route/account cannot silently fall back; permitted changes produce a new immutable binding and reason.
  - Late prior-binding work cannot commit after rebind or owner-epoch change.
validation_surfaces: [Goal route-freeze and rebind fixtures]
risk_class: goal_route_retargeting
reasoning_tier: high
context_scope: frozen_goal_route
implementation_surfaces: [Plans/Goal_Runtime_System.md, Plans/Models_System.md, Plans/Multi-Account.md]
node_compile_hint: {mode: goal_route_binding_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/ACCOUNTABILITY_MATRIX.json#AGT-003
negative_constraints: [Do not retarget a Goal from focus or current settings., Do not commit late prior-binding work.]
```

## Remaining runtime integration addendum (2026-08-13)

`Plans/Shared_Integration_Runtime.md` owns shared connection, synchronization, outbox, resource-governance, operational-awareness, and `ObservableWork` lifecycle seams. Goal Runtime retains Goal/GoalRun lifecycle policy, durable lineage, execution-owner fencing, replan, evidence, and completion truth; Chat and Orchestrator are control/projection consumers.

### Durable Goal, Plan, thread, and agent lineage

A Goal and every GoalRun preserve `goal_id`, Goal revision, parent/child refs, GoalRun/checkpoint refs, owner-defined Plan lineage refs, originating/current thread refs, agent/crew/WorkNode refs where present, correlation/causation, policy/Persona/route snapshots, budget/capacity refs, evidence/blocker/completion refs, and execution-owner epoch across provider rotation, compaction, restart, client reconnect, and client closure. These relationships are never reconstructed from the focused thread, selected Plan, prompt text, or a client-local transcript.

Provider processes, Goals, agents, tests, and approved work are Server/Execution-Host-owned after durable admission. Closing or disconnecting a client changes observation/control connectivity only. One concrete GoalRun has one accepted execution owner/epoch; transfer requires durable disposition, a safe checkpoint, a new fencing epoch, rejection of late prior-owner writes, and recreation or resolution of nonportable local resources. UI focus, server connection, thread selection, and execution ownership are separate. Reconnect consumes shared epoch-fenced cursor replay or snapshot-plus-live-buffer recovery, deduplicated by durable event identity, and cannot duplicate a Goal transition, child spawn, approval, provider attempt, charge, or completion.

Goal Runtime consumes compact typed `OperationalAwarenessService` and `ObservableWork` projections, fetching detail on demand. It never injects raw registries, full transcripts, process tables, secrets, or all active Goal internals into prompts, and no projection replaces lifecycle, evidence, receipt, or certification truth. Selecting another thread or Plan does not retarget, pause, resume, re-parent, or transfer a Goal.

### BSD, conditional rules, and control gaps

Goal Runtime requests BSD evaluation only through the effective BSD policy in `Plans/Run_Modes.md`. Each assignment has independent route, cursor, stable-prefix fingerprint, budget, health, and Usage lineage; input is a redacted bounded delta; output is read-only, may remain silent, and is deterministically deduplicated. BSD never widens Goal, child, tool, file, network, permission, or cross-project authority and never accesses protected `AuthBrowserSession`. Failure, timeout, refusal, quota, or unhealthy route records degraded advice and Usage/diagnostics without blocking primary work.

Prompt Pipeline conditional-rule decisions may add one concise reminder, request a bounded steer/retry, advance ContextEpoch, and emit a receipt. They cannot own deterministic safety, permission decisions, Goal state transitions, certification, or unbounded retry.

Current command evidence materializes Assistant Chat Goal start and update while visible designs also describe pause, resume, stop, clear, edit, and replan. This owner mints no command IDs. Commands/wiring/GUI owners must census and adjudicate reuse versus new registration and close typed payload/result/error, exact Goal identity/revision, disabled reason, handler, event/receipt, `ObservableWork`, recovery, and production wiring. Until then, an affected visible control is disabled or omitted.

### GRS-044 - Durable Server-Owned Goal Lineage

```yaml
plan_unit_id: GRS-044
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  Goal Runtime preserves durable Goal, Plan, thread, child, agent, run, checkpoint, policy, evidence, blocker, receipt, and execution-owner lineage across compaction, restart, disconnect, reconnect, and host transfer. Admitted work remains server-owned; one GoalRun has one accepted owner epoch; shared cursor/snapshot recovery never duplicates an effect.
gui_related: false
gui_classification_reason: Runtime identity, continuation, fencing, and recovery semantics are not visual implementation.
depends_on: [GRS-011, GRS-019, GRS-040]
unblocks: []
acceptance_criteria:
  - Client closure/reconnect preserves Goal execution without duplicate transitions, attempts, charges, or completion.
  - Thread/Plan selection cannot retarget a Goal and transfer rejects late prior-owner writes.
  - OperationalAwarenessService and ObservableWork remain compact projections, not Goal truth.
validation_surfaces: [python3 scripts/pm-plan-index.py validate, future Goal continuation and owner-epoch fixtures]
risk_class: goal_lineage_and_continuation_drift
reasoning_tier: high
context_scope: durable_goal_runtime_lineage
implementation_surfaces: [Plans/Goal_Runtime_System.md, Plans/Shared_Integration_Runtime.md]
node_compile_hint: {mode: durable_goal_lineage_policy, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/02_T3_DURABLE_THREADS_NETWORK_AND_OUTBOX.md
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/05_BSD_TIME_TRAVEL_GOAL_AND_OPERATIONAL_AWARENESS.md
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/reference/02_FULL_THREAD_CURRENT_DECISION_REGISTER.md
preserved_exact_tokens: [goal_id, Plan lineage, owner epoch, ObservableWork]
negative_constraints: [Do not derive Goal authority from focus or transcript., Do not treat disconnect as cancellation., Do not let projections certify completion.]
owner_hints: [Plans/Goal_Runtime_System.md, Plans/Shared_Integration_Runtime.md]
```

### GRS-045 - Bounded Advisory Consumers And Goal Control Fail Closure

```yaml
plan_unit_id: GRS-045
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  Goal Runtime consumes BSD and conditional-rule outputs as bounded read-only attributable advice. Advice can remain silent, cannot widen authority or access AuthBrowserSession, and cannot block primary work on failure. Goal controls without command, handler, event, revision, and production-wiring closure remain disabled or omitted; this owner invents no IDs.
gui_related: true
gui_classification_reason: Visible Goal control availability, advisory projection, and disabled reasons are user-facing behavior.
depends_on: [GRS-014, GRS-021, RM-050]
unblocks: []
acceptance_criteria:
  - Silent, duplicate, timeout, quota, and failure cases preserve primary progress and Usage attribution.
  - Conditional rules cannot perform deterministic safety or Goal transitions.
  - Every visible Goal mutation control is fully wired or visibly unavailable.
validation_surfaces: [python3 scripts/pm-plan-index.py validate, future Goal BSD and command-gap fixtures]
risk_class: advisory_authority_and_goal_command_drift
reasoning_tier: high
context_scope: goal_advisory_and_control_closure
implementation_surfaces: [Plans/Goal_Runtime_System.md, Plans/Run_Modes.md, Plans/Prompt_Pipeline.md, Plans/assistant-chat-design.md]
node_compile_hint: {mode: goal_advisory_consumer_policy, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/05_BSD_TIME_TRAVEL_GOAL_AND_OPERATIONAL_AWARENESS.md
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/09_TEST_MIGRATION_AND_ACCEPTANCE_MATRIX.md
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/reference/ASSISTANT_CHAT_SHARED_CONTRACTS.md
preserved_exact_tokens: [Off, Auto, On, AuthBrowserSession, bounded delta, duplicate suppression]
negative_constraints: [Do not make advice mutation authority., Do not invent Goal command IDs here., Do not present unwired controls as actionable.]
owner_hints: [Plans/Goal_Runtime_System.md, Plans/Run_Modes.md, Plans/UI_Command_Catalog.md, Plans/Wiring_Matrix.production.json]
```

## Ledger Compile Addendum - pldg-20260630-001-feature-intake

This addendum compiles containerized-host Goal Runtime consumption obligations from bootstrap ledger `pldg-20260630-001-feature-intake`. It does not create WorkNodes, NodeSeeds, executable queues, implementation files, runtime dispatch, production build tasks, generated governance artifacts, or a governance seal.

### GRS-032 - Goal Runtime Host Capability Consumption Boundary

```yaml
plan_unit_id: GRS-032
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  Goal Runtime may request, consume, and certify work that depends on containerized-host capability, but it does not
  dispatch host work directly and cannot treat blocked host state as completion evidence. Goals, child goals, and
  verification or repair cycles pass host_capability_ref, host_profile_id, host_assignment_id, execution_unit_context_ref,
  TestRunReceipt refs, host_preflight_receipt, host_execution_receipt, cleanup_retention_receipt, blocked_reason_code, and
  Runtime Artifacts evidence refs through Executor, Automated Testing, Tools, and subagent boundaries. Goal completion
  certification requires lane-appropriate host/test/cleanup receipts, explicit blocker payloads, or approved verification
  exceptions; Runtime Artifacts remains projection and evidence browsing, not receipt truth.
gui_related: false
gui_classification_reason: Goal Runtime host-capability consumption and certification are backend/runtime behavior, not GUI presentation.
depends_on: [EP-109, RM-048, T-166, ATS-019, RAP-042, CV-303]
unblocks: [OSI-431, OP-028, RGV-015]
acceptance_criteria:
  - Goal and child-goal records can carry host_capability_ref, host_assignment_id, execution_unit_context_ref, and receipt refs without owning host mutation.
  - GoalCompletionReceipt certification fails or blocks when required host/test/cleanup evidence is missing.
  - Blocked host outcomes are preserved as blocked != failed and cannot be transformed into success.
  - Runtime Artifacts links are used as evidence projection, not as the authoritative receipt source.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future GoalCompletionReceipt host-evidence fixture
risk_class: goal_runtime_host_certification_drift
reasoning_tier: high
context_scope: goal_runtime_containerized_host_consumption
implementation_surfaces:
  - Plans/Goal_Runtime_System.md
  - future GoalCompletionReceipt and child-goal runtime records
node_compile_hint:
  mode: goal_runtime_host_capability_consumption
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0040
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0044
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0053
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0069
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0078
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0079
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/source_shards/implementation_readiness_hardening_20260701.json#execution_lane_matrix
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/source_shards/subagent_hardening_synthesis_20260701.json#ref-002-testrunreceipt-host-fields
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/source_shards/subagent_hardening_synthesis_20260701.json#ref-003-blocker-taxonomy-projection-boundary
source_atom_ids: [atom-0040, atom-0044, atom-0053, atom-0069, atom-0078, atom-0079]
preserved_exact_tokens:
  - "agent harnesses"
  - "execution_unit_context"
  - "host_assignment_id"
  - "blocked != failed"
  - "GoalCompletionReceipt"
negative_constraints:
  - Do not let Goal Runtime dispatch host work directly.
  - Do not certify completion from a blocked host state.
  - Do not make Runtime Artifacts the receipt authority.
owner_hints:
  - Plans/Goal_Runtime_System.md
  - Plans/orchestrator-subagent-integration.md
  - Plans/Executor_Protocol.md
  - Plans/Automated_Testing_System.md
```

### GRS-002 - One Runtime Engine With Three Product Integrations

```yaml
plan_unit_id: GRS-002
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  Goal Runtime uses one Goal Runtime engine with three product integrations labeled A. invisible, B. Goal mode exposed to the user in chat assistant, and C. orchestration flow: invisible internal goals for product flows, visible user-directed Goal mode in Assistant Chat, and Orchestrator Goal runtime flows that project GoalRun and WorkGraph state while delegating WorkNode readiness, backoff, capacity, and dispatch to Executor. Invisible goals are hands-off for ordinary ambiguity and continue from start to finish unless a hard stop, approval boundary, or true blocker applies. Hard-stop classes include explicit user stop, a forbidden specific action, missing source ledger, missing project plans or inaccessible target artifacts, permissions/file-system failure, unsafe/destructive scope, contradictory goal text, and true infrastructure blocker. Visible goals and Orchestrator goals expose controls and status through their owner surfaces while sharing the same runtime state and lifecycle model.
gui_related: false
gui_classification_reason: This unit defines runtime presentation modes; chat-specific controls are owned by Assistant Chat consumer PlanUnits.
depends_on:
  - GRS-001
unblocks: []
acceptance_criteria:
  - Invisible internal goals, visible Assistant Chat Goal mode, and Orchestrator Goal runtime flows share one lifecycle/state model.
  - The three integrations preserve the labels A. invisible, B. Goal mode exposed to the user in chat assistant, and C. orchestration flow.
  - Invisible goals do not ask row-by-row or ordinary ambiguity questions.
  - Hard stops remain available for authority, safety, missing preconditions, and true blockers.
  - Hard-stop classification preserves explicit user stop, missing source ledger, missing project plans, permissions/file-system failure, unsafe/destructive, and contradictory cases.
  - Orchestrator Goal runtime projections do not replace Executor readiness, backoff, capacity, or dispatch authority.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future Goal Runtime lifecycle tests
risk_class: runtime_split_brain
reasoning_tier: high
context_scope: goal_runtime_system
implementation_surfaces:
  - future Goal Mode service
  - future Planning Wizard
  - Plans/assistant-chat-design.md
  - Plans/Orchestrator_Page.md
  - Plans/Executor_Protocol.md
node_compile_hint:
  mode: shared_goal_runtime
  create_worknodes: false
source_lineage:
  - pldg-20260618-001-prd-planning-wizard:atom-0001
  - pldg-20260618-001-prd-planning-wizard:atom-0002
  - pldg-20260618-001-prd-planning-wizard:atom-0004
  - pldg-20260618-001-prd-planning-wizard:atom-0158
  - pldg-20260618-001-prd-planning-wizard:atom-0159
  - pldg-20260618-001-prd-planning-wizard:atom-0160
  - pldg-20260618-001-prd-planning-wizard:atom-0161
  - pldg-20260616-001-goal-runtime-system:atom-0006
  - pldg-20260616-001-goal-runtime-system:atom-0007
  - pldg-20260616-001-goal-runtime-system:atom-0008
  - pldg-20260616-001-goal-runtime-system:dec-0003
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0003
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0008
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0009
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0013
  - pldg-20260616-002-orchestrator-goal-runtime-flow:dec-0007
preserved_exact_tokens:
  - "same engine"
  - "A. invisible"
  - "B. Goal mode exposed to the user in chat assistant"
  - "C. orchestration flow"
  - "invisible internal goals"
  - "visible assistant-chat goals"
  - "Goal mode exposed to the user in chat assistant"
  - "orchestration flow"
  - "one Goal Runtime engine"
  - "GoalRun"
  - "WorkGraph"
  - "COMPLETELY hands off"
  - "from start to finish"
  - "hard-stop exceptions"
  - "explicit user stop"
  - "missing source ledger"
  - "missing project plans"
  - "permissions/file-system failure"
  - "unsafe/destructive"
  - "contradictory"
negative_constraints:
  - Do not create a separate invisible-goal lifecycle that diverges from visible Goal Mode.
  - Do not ask row-by-row or ordinary ambiguity questions during invisible internal goals.
  - Do not let Orchestrator projections become Executor scheduler truth.
owner_hints:
  - Plans/Goal_Runtime_System.md
  - Plans/assistant-chat-design.md
  - Plans/chain-wizard-flexibility.md
  - Plans/Orchestrator_Page.md
```

### GRS-003 - Invisible Planning Wizard Goal Boundary

```yaml
plan_unit_id: GRS-003
unit_type: constraint
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  Future Planning Wizard and PRD Builder flows use the v2 ledger system conversationally first, preserving exact user intent before any invisible Goal conversion runs. After readiness, invisible Goal Mode may convert the accepted ledger to requirements docs, Plans, or graph-preparation artifacts while the Planning Wizard UI stays minimal with statuses such as Updating plan docs, Building project plan graph, and Reconciling feature requirements. Conversational PRD Builder work is not a default Orchestrator WorkNode; any later Orchestrator handoff is explicit and carries ledger lineage, readiness evidence, and Goal Runtime receipts. Legacy Chain Wizard and Requirements Doc Builder references remain compatibility/source-lineage aliases only.
gui_related: true
gui_classification_reason: This unit includes user-visible Planning Wizard UI minimalism during invisible goals.
depends_on:
  - GRS-002
unblocks: []
acceptance_criteria:
  - Ledger-to-Plans transfer can invoke invisible Goal Runtime without exposing row-by-row decisions.
  - Planning Wizard maintains structured ledger source state before invoking invisible Goal Mode to convert the ledger to the plan docs.
  - PRD Builder uses the ledger system conversationally before invisible Goal conversion.
  - Invisible PRD Builder conversion goals are not default Orchestrator WorkNodes.
  - Minimal Planning Wizard status examples include Updating plan docs, Building project plan graph, and Reconciling feature requirements.
  - Planning Wizard does not re-own Goal Runtime execution semantics.
  - Any Orchestrator handoff from PRD Builder is explicit and preserves ledger lineage, readiness evidence, and receipts.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future Planning Wizard integration review
risk_class: planning_wizard_runtime_drift
reasoning_tier: standard
context_scope: planning_wizard_integration
implementation_surfaces:
  - future Planning Wizard
  - Plans/chain-wizard-flexibility.md
  - Plans/Planning_Ledger_System.md
node_compile_hint:
  mode: invisible_goal_consumer_boundary
  create_worknodes: false
source_lineage:
  - pldg-20260616-001-goal-runtime-system:atom-0013
  - pldg-20260616-001-goal-runtime-system:atom-0014
  - pldg-20260616-001-goal-runtime-system:atom-0015
  - pldg-20260616-001-goal-runtime-system:dec-0011
  - pldg-20260616-001-goal-runtime-system:q-0001
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0004
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0007
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0103
preserved_exact_tokens:
  - "Chain Wizard ledger-to-Plans"
  - "structured ledger"
  - "convert the ledger to the plan docs"
  - "invisible Goal Mode"
  - "Updating plan docs"
  - "Building project plan graph"
  - "Reconciling feature requirements"
  - "Requirements Doc Builder"
  - "ledger system"
  - "conversational"
  - "not a default Orchestrator WorkNode"
  - "exact redesigned Chain Wizard flow"
  - "current Chain Wizard docs are incomplete"
  - "current plans for the chain wizard are wrong/incomplete"
  - "completely redo all that after goal mode is finalized"
negative_constraints:
  - Do not treat current Chain Wizard docs as final Goal Runtime design.
  - Do not turn invisible Planning Wizard execution into a row-by-row user questioning flow.
  - Do not treat conversational ledger capture as a Goal run by default.
  - Do not treat invisible PRD Builder conversion goals as Orchestrator WorkNodes by default.
  - Do not define concrete Planning Wizard UI flow, layout, copy, or screen behavior in Goal Runtime canon; route those details to Planning Wizard and Assistant Chat owner docs.
compatibility_only_notes:
  - Chain Wizard and Requirements Doc Builder are retained in preserved_exact_tokens and source_lineage as historical aliases for Planning Wizard and PRD Builder.
stale_retired_dispositions:
  - Chain Wizard is retired as current product/workflow terminology; current prose uses Planning Wizard.
  - Requirements Doc Builder is retired as current product terminology; current prose uses PRD Builder.
owner_hints:
  - Plans/Goal_Runtime_System.md
  - Plans/Planning_Wizard.md
  - Plans/PRD_Builder.md
  - Plans/chain-wizard-flexibility.md
  - Plans/assistant-chat-design.md
```

### GRS-004 - Whole-Goal Coherence With Sharded Inputs

```yaml
plan_unit_id: GRS-004
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  Goal Runtime must preserve whole-task coherence while operating over sharded ledgers, sharded Plans, document maps, manifests, compact state, and source/target universes. Shard-group focus carries the whole goal summary, current focus, full objective, full source set/source universe, full target set/target universe, inspected scopes, uninspected scopes, hash/version metadata, and owner/consumer coverage; workers may request more context through runtime retrieval for source shards, target docs, code files, logs, images, or tests. Sharding is access, recovery, and verification infrastructure; it is not D2-style workflow slicing and must not become the core execution model.
gui_related: false
gui_classification_reason: Sharded source/context handling is runtime and document infrastructure, not GUI behavior.
depends_on:
  - GRS-001
unblocks: []
acceptance_criteria:
  - Goal Runtime records the source and target universe for each goal.
  - Compact state can resume work without losing whole-goal context.
  - Document maps/manifests expose enough identity to recover exact source shards when needed.
  - Worker context includes the whole goal summary and current focus rather than only a tiny slice.
  - Runtime context requests can fetch additional source shards, target docs, code files, logs, images, and tests.
  - Completion coverage tracks inspected scopes, uninspected scopes, hash/version metadata, and owner/consumer relationships.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future context/resume tests
risk_class: context_fragmentation
reasoning_tier: high
context_scope: repo_and_goal_context
implementation_surfaces:
  - future Goal Mode service
  - Plans/ledgers/v2
  - Plans/.plan_index
node_compile_hint:
  mode: context_and_shard_contract
  create_worknodes: false
source_lineage:
  - pldg-20260616-001-goal-runtime-system:atom-0009
  - pldg-20260616-001-goal-runtime-system:atom-0010
  - pldg-20260616-001-goal-runtime-system:atom-0011
  - pldg-20260616-001-goal-runtime-system:atom-0012
  - pldg-20260616-001-goal-runtime-system:atom-0066
  - pldg-20260616-001-goal-runtime-system:atom-0067
  - pldg-20260616-001-goal-runtime-system:atom-0068
  - pldg-20260616-001-goal-runtime-system:dec-0007
  - pldg-20260616-001-goal-runtime-system:corr-0003
preserved_exact_tokens:
  - "whole-task coherence"
  - "sharded ledgers"
  - "sharded Plans"
  - "document maps"
  - "manifests"
  - "compact-state-first resume"
  - "whole goal summary"
  - "current focus"
  - "request more context"
  - "source shards"
  - "target docs"
  - "code files"
  - "logs"
  - "images"
  - "tests"
  - "source and target universe"
  - "source universe"
  - "target universe"
  - "inspected scopes"
  - "uninspected scopes"
  - "hash"
  - "owner"
  - "consumer"
  - "source_ledger_manifest"
  - "source_ledger_shards"
  - "target_plan_manifest"
  - "target_plan_shards"
  - "project_doc_index"
  - "goal_work_journal"
  - "goal_change_plan"
  - "goal_apply_report"
  - "goal_completion_report"
  - "Sharding is not D2-style workflow slicing"
negative_constraints:
  - Do not let sharding fragment the agent's understanding of the whole goal.
  - Do not recreate D2-style staged workflow slicing through shard boundaries.
  - Do not tell the worker to only process a tiny slice and forget the rest.
owner_hints:
  - Plans/Goal_Runtime_System.md
  - Plans/Planning_Ledger_System.md
  - Plans/Plan_Document_System.md
```

### GRS-005 - Durable Goal State And Event Log

```yaml
plan_unit_id: GRS-005
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  Goal Runtime owns durable execution state for each goal, including objective, lifecycle status, task list, allowed scope, constraints, budgets, attachment manifest, child goals, evidence references, completion receipt, revision, and append-only goal event log. Goal state survives compaction, restarts, and model switches, and optimistic concurrency prevents stale overwrite.
gui_related: false
gui_classification_reason: Durable goal state and event logs are runtime/persistence contracts, not GUI implementation.
depends_on:
  - GRS-002
unblocks: []
acceptance_criteria:
  - A resumed goal can reconstruct objective, constraints, tasks, status, child goals, evidence, and receipt state.
  - Concurrent or stale goal updates are rejected or reconciled through revision checks.
  - Storage substrate remains selectable later without weakening required state fields.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future goal-state persistence tests
risk_class: durable_state_loss
reasoning_tier: high
context_scope: goal_runtime_state
implementation_surfaces:
  - future Goal Mode service
  - future storage layer
node_compile_hint:
  mode: durable_goal_state_contract
  create_worknodes: false
source_lineage:
  - pldg-20260616-001-goal-runtime-system:atom-0031
  - pldg-20260616-001-goal-runtime-system:atom-0032
  - pldg-20260616-001-goal-runtime-system:atom-0033
  - pldg-20260616-001-goal-runtime-system:atom-0034
  - pldg-20260616-001-goal-runtime-system:q-0004
preserved_exact_tokens:
  - "durable execution data"
  - "append-only goal event log"
  - "goal_events.jsonl"
  - "goal_revision"
  - "expected_goal_revision"
  - "compare-and-swap"
  - "acceptance_criteria"
  - "non_goals"
  - "work_queue"
  - "model_policy"
  - "evidence_index"
  - "persisted runtime state"
  - "Optimistic concurrency"
  - "compaction, restarts, model switches"
  - "database tables, project files, or a hybrid"
negative_constraints:
  - Do not let exact persistence substrate deferral remove the durable state contract.
  - Do not allow stale goal state to silently overwrite newer state.
owner_hints:
  - Plans/Goal_Runtime_System.md
```

### GRS-006 - Scheduler Continuation And Revisioned Goal Updates

```yaml
plan_unit_id: GRS-006
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  Goal Runtime, not the worker model alone, drives runtime-driven idle continuation until completion, blocked, stopped, failed, cancelled, or budget-limited. When the thread is idle and eligible, `try_start_turn_if_idle` reloads canonical goal state, checks currentness, budgets, and user preemption, and starts the next bounded turn; this is not model self-recursion. User preemption, constraints, scope changes, and goal updates are revisioned with goal_revision, previous_revision, objective_update, constraint_added, active_subgoals_notified, and stale child goals so the scheduler can pause, re-evaluate impact, cancel or re-scope child goals, and resume from a coherent state.
gui_related: false
gui_classification_reason: Scheduler continuation and revisioning are runtime behavior; visible controls are Assistant Chat consumer behavior.
depends_on:
  - GRS-005
unblocks: []
acceptance_criteria:
  - A running goal can be paused by user instruction before new scheduling work begins.
  - Runtime state records revisions for material goal updates.
  - Scheduler continuation stops only at explicit lifecycle/budget/authority states.
  - "`try_start_turn_if_idle` starts continuation only after canonical-state reload, currentness checks, budget checks, and user preemption checks."
  - Material goal updates preserve goal_revision, previous_revision, objective_update, constraint_added, active_subgoals_notified, and stale child goals.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future scheduler state-machine tests
risk_class: scheduler_drift
reasoning_tier: high
context_scope: goal_runtime_scheduler
implementation_surfaces:
  - future Goal Mode scheduler
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: scheduler_revision_contract
  create_worknodes: false
source_lineage:
  - pldg-20260616-001-goal-runtime-system:atom-0035
  - pldg-20260616-001-goal-runtime-system:atom-0036
  - pldg-20260616-001-goal-runtime-system:atom-0037
preserved_exact_tokens:
  - "Runtime-driven continuation"
  - "runtime-driven idle continuation"
  - "thread is idle"
  - "scheduler"
  - "not model self-recursion"
  - "try_start_turn_if_idle"
  - "User preemption"
  - "constraint updates"
  - "user message pending"
  - "re-steer"
  - "Goal updates are revisioned"
  - "goal_revision"
  - "previous_revision"
  - "objective_update"
  - "constraint_added"
  - "active_subgoals_notified"
  - "stale child goals"
negative_constraints:
  - Do not rely on the worker model's final answer as the scheduler completion source.
  - Do not apply material goal updates as silent mutable prompt text.
  - Do not rely on a model saying "continue" as the only loop mechanism.
owner_hints:
  - Plans/Goal_Runtime_System.md
  - Plans/assistant-chat-design.md
```

### GRS-007 - Goal Replan Event For Material Changes

```yaml
plan_unit_id: GRS-007
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  Material mid-goal user changes create an explicit Goal Replan Event. The runtime pauses scheduling, classifies the interruption as pause/resume, stop/cancel, constraint update, scope expansion, scope reduction, goal replacement, or clarifying instruction, computes impact, updates the visible task list, re-steers or cancels child goals, and then resumes when valid. Trivial clarifications may apply inline; hard constraints apply immediately; forks are reserved for alternate paths or material conflicts.
gui_related: true
gui_classification_reason: The runtime event includes user-visible task-list updates and chat-facing replan feedback.
depends_on:
  - GRS-006
unblocks: []
acceptance_criteria:
  - Material scope and constraint changes produce a durable Goal Replan Event.
  - Hard constraints are applied immediately rather than waiting for a phase boundary.
  - Active and child work is cancelled, re-scoped, forked, or allowed to finish only after impact analysis.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future goal-update/replan tests
risk_class: silent_goal_mutation
reasoning_tier: high
context_scope: goal_runtime_updates
implementation_surfaces:
  - future Goal Mode scheduler
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: goal_replan_event
  create_worknodes: false
source_lineage:
  - pldg-20260616-001-goal-runtime-system:atom-0094
  - pldg-20260616-001-goal-runtime-system:atom-0095
  - pldg-20260616-001-goal-runtime-system:dec-0014
preserved_exact_tokens:
  - "pause / resume"
  - "stop / cancel"
  - "constraint update"
  - "scope expansion"
  - "scope reduction"
  - "goal replacement"
  - "clarifying instruction"
  - "Goal Replan Event"
  - "pauses scheduling"
  - "updates the visible task list"
  - "hard constraints apply immediately"
negative_constraints:
  - Do not silently mutate a running goal for material scope or constraint changes.
  - Do not queue hard constraints until the current phase finishes.
owner_hints:
  - Plans/Goal_Runtime_System.md
  - Plans/assistant-chat-design.md
```

### GRS-008 - Objective Attachments And Phase-Bound Snapshots

```yaml
plan_unit_id: GRS-008
unit_type: requirement
status: superseded
owner_doc: Plans/Goal_Runtime_System.md
superseded_by: GRS-048
canonical_text: >-
  COMPATIBILITY AND SOURCE-LINEAGE ONLY -- NOT ACTIVE CURRENT-PRODUCT TRUTH. Goal objective attachment bundles and phase-bound input freezing are retired: a Goal V2 record carries no attachment manifest and freezes no snapshot, and every freeze is owned by the workflow that needs it. The text below is retained verbatim for lineage and audit and must not be accepted or indexed as active current-product truth. Superseded by GRS-048.
  Goal Runtime preserves oversized objectives, large pasted blocks, image attachments, and remote-session attachments as runtime-readable objective attachment bundles. Objective attachment bundles include goal-objective.md, pasted-text-N.txt, and attachments/manifest.json; local images and remote image URLs must resolve to runtime-readable paths or artifact IDs for local and remote app-server sessions. Objective bundles and referenced attachments freeze at goal creation; read/evaluation inputs freeze at certification or phase boundaries; active editing uses live state while recording start state, checkpoints, diffs, hashes, VCS identity, and test-state identity for replayable evidence.
gui_related: false
gui_classification_reason: Attachment preservation and snapshot identity are runtime/evidence behavior, not visual presentation.
depends_on:
  - GRS-005
unblocks: []
acceptance_criteria:
  - Attachments are materialized to paths or artifact IDs that workers and verifiers can read.
  - Attachment bundles preserve goal-objective.md, pasted-text-N.txt, attachments/manifest.json, runtime-readable paths, local images, and remote image URLs where applicable.
  - Evidence records identify the source state used for each judgment.
  - Coding goals do not pretend the entire repo is static, but certification does not rely on unspecified latest state.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future attachment preservation tests
risk_class: evidence_reproducibility
reasoning_tier: high
context_scope: goal_inputs_and_evidence
implementation_surfaces:
  - future Goal Mode service
  - future runtime artifact storage
  - Plans/Planning_Ledger_System.md
  - Plans/Plan_Document_System.md
node_compile_hint:
  mode: attachment_snapshot_contract
  create_worknodes: false
source_lineage:
  - pldg-20260616-001-goal-runtime-system:atom-0038
  - pldg-20260616-001-goal-runtime-system:atom-0039
  - pldg-20260616-001-goal-runtime-system:atom-0040
  - pldg-20260616-001-goal-runtime-system:atom-0099
  - pldg-20260616-001-goal-runtime-system:atom-0100
  - pldg-20260616-001-goal-runtime-system:dec-0010
  - pldg-20260616-001-goal-runtime-system:dec-0016
  - pldg-20260616-001-goal-runtime-system:corr-0005
preserved_exact_tokens:
  - "oversized text"
  - "large pasted blocks"
  - "image attachments"
  - "remote app-server sessions"
  - "objective attachment bundle"
  - "snapshotted at goal phase boundaries"
  - "Freeze the objective bundle"
  - "Freeze referenced attachments"
  - "Freeze read/evaluation inputs"
  - "VCS commit/diff identity"
  - "goal-objective.md"
  - "pasted-text-N.txt"
  - "attachments/manifest.json"
  - "runtime-readable paths"
  - "local images"
  - "remote image URLs"
negative_constraints:
  - Do not lose attachments when a goal runs in a remote session.
  - Do not truncate or lose large pasted goal content or image inputs.
  - Do not preserve only placeholder tokens for images, large pasted text, or oversized objectives.
  - Do not base certification on an unspecified latest file state.
  - Do not let stale snapshots cause the agent to ignore legitimate current changes.
owner_hints:
  - Plans/Goal_Runtime_System.md
  - Plans/Planning_Ledger_System.md
  - Plans/Plan_Document_System.md
```

### GRS-009 - Worker Role Separation And Bounded Authority

```yaml
plan_unit_id: GRS-009
unit_type: requirement
status: superseded
owner_doc: Plans/Goal_Runtime_System.md
superseded_by: GRS-049
canonical_text: >-
  COMPATIBILITY AND SOURCE-LINEAGE ONLY -- NOT ACTIVE CURRENT-PRODUCT TRUTH. The Goal-specific worker/planner/evaluator/reducer/verifier/adjudicator role separation is retired as a Goal Runtime requirement; bounded authority and evidence discipline now belong to the executing run owner and to Review runs. The text below is retained verbatim for lineage and audit and must not be accepted or indexed as active current-product truth. Superseded by GRS-049.
  Goal Runtime separates worker, planner, evaluator, reducer, verifier, adjudicator, and runtime controller roles. Workers have bounded authority, and weak-worker outputs are proposal only until stronger or deterministic layers verify, merge, route, or complete them. A low quality agent over massive documents may miss a lot, hallucinate issues, or claim no issues, and must never make global completion judgment. Material worker claims carry source_spans, target_spans, and evidence_refs; no-material claims use no_material_items_found with source_span_checked and reason duplicate, nonmaterial, already_covered, or context_only. Unsupported content cannot become canonical plan content or completion evidence. Workers cannot certify global or parent completion by themselves. Risk-triggered verification escalates when worker capability, confidence, scope, evidence, or validation status is insufficient.
gui_related: false
gui_classification_reason: Runtime role separation and safety policy are backend/control-plane behavior.
depends_on:
  - GRS-006
unblocks: []
acceptance_criteria:
  - Worker roles cannot unilaterally mark a goal complete.
  - Runtime policy can route stronger evaluation or adjudication when evidence or risk demands it.
  - No-op or low-change completion claims require coverage evidence.
  - Material and no-material worker claims preserve source_spans, target_spans, evidence_refs, no_material_items_found, source_span_checked, and duplicate/nonmaterial/already_covered/context_only reasons.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future verifier/escalation policy tests
risk_class: weak_worker_false_completion
reasoning_tier: high
context_scope: goal_runtime_safety
implementation_surfaces:
  - future Goal Mode service
  - future model/provider policy layer
node_compile_hint:
  mode: role_separation_policy
  create_worknodes: false
source_lineage:
  - pldg-20260616-001-goal-runtime-system:atom-0041
  - pldg-20260616-001-goal-runtime-system:atom-0042
  - pldg-20260616-001-goal-runtime-system:atom-0043
  - pldg-20260616-001-goal-runtime-system:atom-0044
  - pldg-20260616-001-goal-runtime-system:atom-0045
  - pldg-20260616-001-goal-runtime-system:atom-0046
  - pldg-20260616-001-goal-runtime-system:dec-0006
preserved_exact_tokens:
  - "Low-quality agents cannot certify global completion"
  - "low quality agent"
  - "massive documents"
  - "misses a lot"
  - "hallucinates issues"
  - "no issues"
  - "must never make global completion judgment"
  - "Model role separation"
  - "Workers have bounded authority"
  - "Evidence-backed claims"
  - "Coverage evidence for no-op results"
  - "Risk-triggered verification escalation"
  - "reducer"
  - "runtime controller"
  - "proposal only"
  - "source_spans"
  - "target_spans"
  - "evidence_refs"
  - "no_material_items_found"
  - "source_span_checked"
  - "duplicate"
  - "nonmaterial"
  - "already_covered"
  - "context_only"
  - "unsupported content"
  - "canonical plan content"
negative_constraints:
  - Do not let weak agents certify global completion.
  - Do not rely on worker confidence alone when escalation triggers are present.
  - Do not accept unsupported invented requirements.
owner_hints:
  - Plans/Goal_Runtime_System.md
```

### GRS-010 - Model Role Policy And Certification-Tier Verifier Requirements

```yaml
plan_unit_id: GRS-010
unit_type: requirement
status: superseded
owner_doc: Plans/Goal_Runtime_System.md
superseded_by: GRS-049
canonical_text: >-
  COMPATIBILITY AND SOURCE-LINEAGE ONLY -- NOT ACTIVE CURRENT-PRODUCT TRUTH. Goal-owned model-role policy with mandatory verifier and adjudicator tiers is retired; model selection belongs to Models System and any reviewer is an explicitly configured Review run. The text below is retained verbatim for lineage and audit and must not be accepted or indexed as active current-product truth. Superseded by GRS-049.
  Goal Runtime persists separate model-role policy for worker execution and verifier/adjudicator authority. The role-policy record names worker_default, planner, evaluator, adjudicator, and verifier roles, and escalation inputs include risk_class, failure_count, task type, and provider constraints. Goal Mode must provide native goal support for users will be using other models; lower quality agent paths require stronger evidence gates/escalation and must not assume the newest/biggest/highest quality model. The verifier/adjudicator model may inherit the worker model only when the inherited model satisfies the required policy for the goal's certification tier. Low-risk goals can inherit by default; standard and strong-certification goals use policy-derived verifier/adjudicator requirements; strong-certification goals block, not merely warn, when the requirement cannot be met. Exact provider-specific default tier mappings remain deferred.
gui_related: false
gui_classification_reason: This unit defines runtime/provider model-role policy, not the Settings GUI control.
depends_on:
  - GRS-009
unblocks: []
acceptance_criteria:
  - Runtime configuration supports independent worker and verifier/adjudicator role settings.
  - Role-policy records preserve worker_default, planner, evaluator, adjudicator, verifier, risk_class, failure_count, and provider constraints.
  - Strong-certification goals cannot proceed with an underqualified verifier/adjudicator model.
  - Provider-specific default mappings can be added later without changing the role-policy contract.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future model-role policy tests
risk_class: model_role_policy_drift
reasoning_tier: high
context_scope: goal_runtime_model_policy
implementation_surfaces:
  - future Goal Mode service
  - future Settings model policy storage
  - Plans/FinalGUISpec.md
  - Plans/Models_System.md
  - Plans/Multi-Account.md
node_compile_hint:
  mode: verifier_adjudicator_policy
  create_worknodes: false
source_lineage:
  - pldg-20260616-001-goal-runtime-system:atom-0075
  - pldg-20260616-001-goal-runtime-system:atom-0076
  - pldg-20260616-001-goal-runtime-system:atom-0104
  - pldg-20260616-001-goal-runtime-system:atom-0105
  - pldg-20260616-001-goal-runtime-system:dec-0018
  - pldg-20260616-001-goal-runtime-system:dec-0019
  - pldg-20260616-001-goal-runtime-system:q-0005
preserved_exact_tokens:
  - "Runtime-neutral model support"
  - "worker model"
  - "verifier/adjudicator model"
  - "inherit the worker only when"
  - "goal's certification tier"
  - "Low-risk goals can inherit by default"
  - "must block, not merely warn"
  - "worker_default"
  - "planner"
  - "evaluator"
  - "adjudicator"
  - "verifier"
  - "risk_class"
  - "failure_count"
  - "provider constraints"
  - "users will be using other models"
  - "native goal support"
  - "lower quality agent"
  - "newest/biggest/highest quality model"
negative_constraints:
  - Do not hard-code one provider/model as required for correctness.
  - Do not hard-code Goal Mode correctness to a single model/provider.
  - Do not force verifier/adjudicator work to use the same model setting as ordinary worker execution.
  - Do not treat inheritance as always valid for verifier/adjudicator roles.
owner_hints:
  - Plans/Goal_Runtime_System.md
  - Plans/Models_System.md
  - Plans/Multi-Account.md
```

### GRS-011 - Provider-Neutral Escalation Triggers

```yaml
plan_unit_id: GRS-011
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  Goal Runtime escalates to a stronger verifier, second-pass worker, adjudicator, or stronger policy handling when evidence is incomplete, stale, or non-replayable; child outputs conflict; retries or blockers repeat; strong-certification surfaces are touched; destructive or governance actions are proposed; worker confidence is low; high-density slice or high-signal input produces an empty/weak result; target conflict, large deletion/replacement, or failing tests appear; writes are out of scope; validators fail; or completion claims are unsupported.
gui_related: false
gui_classification_reason: Escalation policy is runtime safety behavior, not GUI implementation.
depends_on:
  - GRS-009
  - GRS-010
unblocks: []
acceptance_criteria:
  - Escalation triggers are evaluated independently of provider-specific model names.
  - Unsupported completion claims cannot pass certification merely because the worker says the goal is done.
  - Validator failures and out-of-scope writes escalate even when worker confidence is high.
  - High-density slices, target conflicts, large deletions/replacements, failing tests, and low-confidence worker output escalate to stronger review.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future escalation policy tests
risk_class: unsupported_completion_claim
reasoning_tier: high
context_scope: goal_runtime_safety
implementation_surfaces:
  - future Goal Mode service
  - future verifier/adjudicator policy layer
node_compile_hint:
  mode: escalation_trigger_policy
  create_worknodes: false
source_lineage:
  - pldg-20260616-001-goal-runtime-system:atom-0046
  - pldg-20260616-001-goal-runtime-system:atom-0106
  - pldg-20260616-001-goal-runtime-system:dec-0020
preserved_exact_tokens:
  - "incomplete/stale/non-replayable evidence"
  - "conflicting child outputs"
  - "repeated retries/blockers"
  - "strong-certification surfaces"
  - "destructive/governance actions"
  - "low worker confidence"
  - "stronger verifier"
  - "second-pass worker"
  - "adjudicator"
  - "high-density slice"
  - "target conflict"
  - "large deletion"
  - "failing tests"
  - "out-of-scope writes"
  - "validator failures"
  - "unsupported completion claims"
negative_constraints:
  - Do not certify completion from unsupported claims.
  - Do not ignore failed validators or out-of-scope writes.
owner_hints:
  - Plans/Goal_Runtime_System.md
```

### GRS-012 - Goal Completion Receipt Authority

```yaml
plan_unit_id: GRS-012
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  Every goal produces a Goal Completion Receipt. Completion is a runtime-certified state, not a worker-model judgment. A worker can propose completion, but the controller/evaluator/certifier decides whether the goal is complete. Required inputs must be inventoried, required work represented or dispositioned, validations run or explicitly skipped with reason, acceptance criteria satisfied, unresolved items explicit, and no required source or target areas left unaccounted for. Ledger-to-Plans completion additionally requires material ledger content represented in live Plans or intentionally captured as open questions or unresolved decisions, conflicts preserved, unsupported inventions absent, and source-to-target evidence present. Receipts separate source evidence, canonical evidence, process evidence, governance evidence, unresolved items, changed artifacts, and validator outcomes.
gui_related: false
gui_classification_reason: Completion receipt authority and evidence classes are runtime/governance behavior.
depends_on:
  - GRS-009
  - GRS-011
unblocks: []
acceptance_criteria:
  - Every goal has a receipt or a stopped/blocked/degraded receipt explaining why completion is not certified normally.
  - Receipts distinguish worker claims from controller/evaluator/certifier decisions.
  - Evidence classes are recorded without treating ledger/source memory as canonical product truth.
  - Goal completion certification verifies that required inputs were inventoried, represented or dispositioned, validations ran, acceptance criteria are satisfied, unresolved items are explicit, and no required source/target areas are unaccounted for.
  - Ledger-to-Plans receipts prove material ledger content in live Plans or explicit open-question/unresolved-decision disposition, conflicts preserved, unsupported inventions absent, and source-to-target evidence.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future completion receipt validators
risk_class: false_completion
reasoning_tier: high
context_scope: goal_completion
implementation_surfaces:
  - future Goal Mode service
  - future runtime evidence storage
node_compile_hint:
  mode: completion_receipt_authority
  create_worknodes: false
source_lineage:
  - pldg-20260616-001-goal-runtime-system:atom-0047
  - pldg-20260616-001-goal-runtime-system:atom-0048
  - pldg-20260616-001-goal-runtime-system:atom-0049
  - pldg-20260616-001-goal-runtime-system:atom-0093
  - pldg-20260616-001-goal-runtime-system:dec-0013
preserved_exact_tokens:
  - "Evidence-based completion certification"
  - "Goal Completion Receipt"
  - "source/canonical/process evidence separation"
  - "worker can propose completion"
  - "controller/evaluator/certifier decides"
  - "runtime-certified state"
  - "not a worker-model judgment"
  - "completion certification"
  - "inventoried"
  - "represented"
  - "dispositioned"
  - "acceptance criteria"
  - "unaccounted for"
  - "material ledger content"
  - "represented in Plans"
  - "open questions"
  - "unresolved decisions"
  - "conflicts preserved"
  - "unsupported inventions absent"
  - "source-to-target evidence"
negative_constraints:
  - Do not let done be only a worker-model judgment.
  - Do not allow a worker or child goal to certify global or parent completion by itself.
  - Do not count source ledger text, scaffold, or process artifacts as canonical live Plans evidence.
owner_hints:
  - Plans/Goal_Runtime_System.md
  - Plans/Planning_Ledger_System.md
  - Plans/Plan_Document_System.md
```

### GRS-013 - Risk-Tiered Completion Certification

```yaml
plan_unit_id: GRS-013
unit_type: validation_criterion
status: superseded
owner_doc: Plans/Goal_Runtime_System.md
superseded_by: GRS-050
canonical_text: >-
  COMPATIBILITY AND SOURCE-LINEAGE ONLY -- NOT ACTIVE CURRENT-PRODUCT TRUTH. Risk-tiered Goal completion certification with an independent verifier role is retired; Goal V2 completes only on completion evidence supplied by the owning caller, with no Goal-imposed certification tier. The text below is retained verbatim for lineage and audit and must not be accepted or indexed as active current-product truth. Superseded by GRS-050.
  Completion certification is tiered by risk and phase. Lightweight read-only or answer-only goals require final answer, addressed objective, known uncertainty, no file mutation, and no hidden blocker. Standard code/doc work requires changed files, task checklist disposition, relevant tests/checks run or skipped with reason, no known unresolved blockers, and respected user constraints. Strong-certification goals require replayable evidence, source-to-target mapping where applicable, independent verifier or verifier role, deterministic validators where available, changed artifact hashes, explicit unresolved/open items, and written completion certificate.
gui_related: false
gui_classification_reason: Certification tiers are runtime/validation policy, not GUI implementation.
depends_on:
  - GRS-012
unblocks: []
acceptance_criteria:
  - File-writing, Plan-writing, code-editing, test-running, migration, destructive, and governance-sensitive goals use stronger certification than read-only goals.
  - Strong-certification receipts include replayable evidence and independent/deterministic verification where available.
  - Standard receipts account for checks, changed files, constraints, and blockers.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future receipt-tier validators
risk_class: certification_underfit
reasoning_tier: high
context_scope: goal_completion
implementation_surfaces:
  - future Goal Mode service
  - future verifier/adjudicator policy layer
node_compile_hint:
  mode: tiered_completion_certification
  create_worknodes: false
source_lineage:
  - pldg-20260616-001-goal-runtime-system:atom-0089
  - pldg-20260616-001-goal-runtime-system:atom-0090
  - pldg-20260616-001-goal-runtime-system:atom-0091
  - pldg-20260616-001-goal-runtime-system:atom-0092
  - pldg-20260616-001-goal-runtime-system:dec-0013
preserved_exact_tokens:
  - "Every goal requires a Goal Completion Receipt"
  - "Lightweight certification"
  - "Standard certification"
  - "Strong certification"
  - "changed files listed"
  - "task checklist completed"
  - "skipped with reason"
  - "replayable evidence"
  - "source-to-target mapping"
  - "deterministic validators"
  - "changed artifact hashes"
  - "completion certificate written"
negative_constraints:
  - Do not certify normal code/doc work without accounting for checks and constraints.
  - Do not mark governance-sensitive or mutation-heavy goals complete without stronger certification.
owner_hints:
  - Plans/Goal_Runtime_System.md
```

### GRS-014 - Verifier Unavailable And Evidence Retention Policy

```yaml
plan_unit_id: GRS-014
unit_type: requirement
status: superseded
owner_doc: Plans/Goal_Runtime_System.md
superseded_by: GRS-050
canonical_text: >-
  COMPATIBILITY AND SOURCE-LINEAGE ONLY -- NOT ACTIVE CURRENT-PRODUCT TRUTH. Verifier and adjudicator availability tiering is retired from Goal Runtime; a Goal never blocks on a Goal-specific reviewer because Goal Runtime no longer requires one. The text below is retained verbatim for lineage and audit and must not be accepted or indexed as active current-product truth. Superseded by GRS-050.
  Verifier/adjudicator unavailable behavior is tiered: low-risk goals may finish with a degraded receipt; standard goals may degrade only when no mutation or required check is affected; strong-certification goals become blocked, not complete. Receipts retain hashes, summaries, changed files, command identities, validator outputs, child receipts, verifier/adjudicator decisions, and source-to-target mappings where relevant. Raw logs are capped, redacted, separately stored, and referenced by hash/path.
gui_related: false
gui_classification_reason: Degraded verification and evidence retention are runtime/evidence policy, not GUI implementation.
depends_on:
  - GRS-013
unblocks: []
acceptance_criteria:
  - Strong-certification goals do not complete when verifier/adjudicator requirements cannot be met.
  - Standard degraded receipts are allowed only when mutation and required checks are unaffected.
  - Raw logs are never stored uncapped or unredacted inside the receipt.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future evidence retention/redaction validators
risk_class: evidence_retention_drift
reasoning_tier: high
context_scope: goal_completion_evidence
implementation_surfaces:
  - future Goal Mode service
  - future runtime artifact storage
  - Plans/Runtime_Artifacts_Panel.md
node_compile_hint:
  mode: verifier_degraded_mode_and_retention
  create_worknodes: false
source_lineage:
  - pldg-20260616-001-goal-runtime-system:atom-0107
  - pldg-20260616-001-goal-runtime-system:atom-0109
  - pldg-20260616-001-goal-runtime-system:dec-0021
  - pldg-20260616-001-goal-runtime-system:dec-0023
preserved_exact_tokens:
  - "low-risk goals may finish with a degraded receipt"
  - "standard goals may degrade only when no mutation or required check is affected"
  - "strong-certification goals become blocked, not complete"
  - "hashes"
  - "summaries"
  - "changed files"
  - "command identities"
  - "validator outputs"
  - "child receipts"
  - "verifier/adjudicator decisions"
  - "source-to-target mappings"
  - "Raw logs"
  - "capped"
  - "redacted"
  - "separately stored"
  - "referenced by hash/path"
negative_constraints:
  - Do not complete strong-certification goals in degraded verifier mode.
  - Do not retain secrets in logs or receipts.
  - Do not store uncapped raw logs inline in completion receipts.
owner_hints:
  - Plans/Goal_Runtime_System.md
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/storage-plan.md
compatibility_only_notes:
  - Plans/Project_Output_Artifacts.md remains a boundary/distinction reference only; it does not own Goal Runtime evidence receipts.
```

### GRS-015 - Progress Fingerprints, Budgets, And Validators

```yaml
plan_unit_id: GRS-015
unit_type: requirement
status: superseded
owner_doc: Plans/Goal_Runtime_System.md
superseded_by: GRS-051
canonical_text: >-
  COMPATIBILITY AND SOURCE-LINEAGE ONLY -- NOT ACTIVE CURRENT-PRODUCT TRUTH. Goal-owned hard budgets and limit gates are retired; no-progress and repeated-blocker detection remains with the executing run owner and quota truth remains with the Usage and scheduling owners. The text below is retained verbatim for lineage and audit and must not be accepted or indexed as active current-product truth. Superseded by GRS-051.
  Goal Runtime uses progress_fingerprint records, blocker_signature, artifact hashes, retry/blocker detection, repeat_count, no-progress continuations, hard budgets, limit statuses, and deterministic validators as first-class gates. Budget and limit gates carry exact fields max_turns, max_tokens, max_wall_time_seconds, max_parallel_agents, budget_limited, and usage_limited. Repeated identical blockers without artifact change route to repair/adjudication rather than infinite retry, and a goal cannot hide repeated non-progress, validator failure, or budget exhaustion behind a normal completion claim.
gui_related: false
gui_classification_reason: Progress, budget, and validator gates are runtime control behavior, not GUI implementation.
depends_on:
  - GRS-012
unblocks: []
acceptance_criteria:
  - Repeated retries or blockers escalate instead of looping silently.
  - Budget and limit statuses are represented distinctly from successful completion.
  - Budget and limit gates expose max_turns, max_tokens, max_wall_time_seconds, max_parallel_agents, budget_limited, and usage_limited.
  - Validators are first-class gates for certification where available.
  - Progress records expose progress_fingerprint, blocker_signature, repeat_count, artifact hashes, and no-progress continuation detection.
  - Repeated identical blockers without artifact change route to repair/adjudication rather than indefinite retry.
  - "Default budget values are explicit: max_turns=25, max_tokens=null (provider/model policy owns the concrete token ceiling), max_wall_time_seconds=7200, and max_parallel_agents=0 unless a parent Goal or user-supplied run policy narrows them."
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future progress-fingerprint and validator-gate tests
risk_class: loop_or_validator_false_completion
reasoning_tier: high
context_scope: goal_runtime_progress
implementation_surfaces:
  - future Goal Mode service
  - future validator registry
node_compile_hint:
  mode: progress_budget_validator_policy
  create_worknodes: false
source_lineage:
  - pldg-20260616-001-goal-runtime-system:atom-0050
  - pldg-20260616-001-goal-runtime-system:atom-0051
  - pldg-20260616-001-goal-runtime-system:atom-0052
preserved_exact_tokens:
  - "Progress fingerprints"
  - "progress_fingerprint"
  - "blocker_signature"
  - "repeat_count"
  - "loop detection"
  - "artifact hashes"
  - "no-progress"
  - "Hard budgets"
  - "limit statuses"
  - "Validators are first-class gates"
  - "max_turns"
  - "max_tokens"
  - "max_wall_time_seconds"
  - "max_parallel_agents"
  - "budget_limited"
  - "usage_limited"
negative_constraints:
  - Do not claim normal completion when validators fail.
  - Do not hide repeated non-progress behind repeated worker attempts.
owner_hints:
  - Plans/Goal_Runtime_System.md
  - Plans/Planning_Ledger_System.md
  - Plans/Plan_Document_System.md
```

### GRS-016 - Parallel Child Goals And Parent Completion Authority

```yaml
plan_unit_id: GRS-016
unit_type: requirement
status: superseded
owner_doc: Plans/Goal_Runtime_System.md
superseded_by: GRS-052
canonical_text: >-
  COMPATIBILITY AND SOURCE-LINEAGE ONLY -- NOT ACTIVE CURRENT-PRODUCT TRUTH. Parallel child Goals and parent completion authority over children are retired; bounded parallel work is now To-Dos under the To-Do Runtime or participants under Collaborative Workflows. The text below is retained verbatim for lineage and audit and must not be accepted or indexed as active current-product truth. Superseded by GRS-052.
  Parent goals may spawn parallel child goals/subagents with dedicated child_goal_id, parent_goal_id, agent_id, objectives, allowed scope, write policy, budgets, task lists, recovery state, stale/re-steer state, result artifacts, and local completion receipts. Subagents are preferred by default for bounded parallel work. "As many as needed" parallel child goals are capped by max_parallel_agents and budget, and remain bounded by write_scope_conflict_detection, worktree isolation, and parent synthesis requirements. Child goals may complete themselves locally, but they cannot complete the parent goal; parent goals own synthesis, merge, final verification, and parent completion certification.
gui_related: false
gui_classification_reason: Child-goal state and authority are runtime orchestration behavior; chat display is an Assistant Chat consumer surface.
depends_on:
  - GRS-006
  - GRS-012
unblocks: []
acceptance_criteria:
  - Child goals have first-class runtime identity and are not hidden implementation details.
  - Parent goal synthesis and completion authority cannot be delegated to a child goal.
  - Parallel execution is bounded by declared scope, budgets, and recovery state.
  - Parallel child goal spawning honors max_parallel_agents, write_scope_conflict_detection, worktree isolation, and parent synthesis requirements.
  - Child-goal state preserves child_goal_id, parent_goal_id, agent_id, allowed_scope, write_policy, result_artifacts, and stale/re-steer state.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future child-goal orchestration tests
risk_class: child_goal_authority_drift
reasoning_tier: high
context_scope: parent_child_goal_runtime
implementation_surfaces:
  - future Goal Mode service
  - future subagent runtime
node_compile_hint:
  mode: parent_child_goal_runtime
  create_worknodes: false
source_lineage:
  - pldg-20260616-001-goal-runtime-system:atom-0053
  - pldg-20260616-001-goal-runtime-system:atom-0054
  - pldg-20260616-001-goal-runtime-system:atom-0055
  - pldg-20260616-001-goal-runtime-system:atom-0056
  - pldg-20260616-001-goal-runtime-system:atom-0057
  - pldg-20260616-001-goal-runtime-system:atom-0058
  - pldg-20260616-001-goal-runtime-system:atom-0096
  - pldg-20260616-001-goal-runtime-system:atom-0098
  - pldg-20260616-001-goal-runtime-system:dec-0009
  - pldg-20260616-001-goal-runtime-system:dec-0015
preserved_exact_tokens:
  - "parallel child goals"
  - "Subagents preferred by default"
  - "Parent/child goal tree"
  - "Parent-only synthesis and merge authority"
  - "first-class runtime objects"
  - "child_goal_id"
  - "parent_goal_id"
  - "agent_id"
  - "allowed_scope"
  - "write_policy"
  - "completion_receipt"
  - "stale/re-steer state"
  - "as many as needed"
  - "max_parallel_agents"
  - "write_scope_conflict_detection"
  - "worktree isolation"
  - "parent synthesis"
  - "Child goals may complete themselves locally"
  - "cannot complete the parent goal"
  - "For this task, write yourself a new goal and spawn agents in parallel - as many as needed to do it better and faster. Split the work into independent pieces, dispatch them concurrently, and synthesize the results as they return. Give each agent its own dedicated /goal."
negative_constraints:
  - Do not hide child agents as untracked implementation details.
  - Do not let a child goal certify, merge, or finish the parent goal independently.
  - Do not launch unlimited agents.
  - Do not allow multiple write agents to edit conflicting scopes without isolation/merge control.
owner_hints:
  - Plans/Goal_Runtime_System.md
  - Plans/assistant-chat-design.md
```

### GRS-017 - Child Goal Write Authority And Single-Writer Leases

```yaml
plan_unit_id: GRS-017
unit_type: constraint
status: superseded
owner_doc: Plans/Goal_Runtime_System.md
superseded_by: GRS-052
canonical_text: >-
  COMPATIBILITY AND SOURCE-LINEAGE ONLY -- NOT ACTIVE CURRENT-PRODUCT TRUTH. Child-goal write authority and single-writer leases are retired together with child Goals; write isolation belongs to the executing run and worktree owners. The text below is retained verbatim for lineage and audit and must not be accepted or indexed as active current-product truth. Superseded by GRS-052.
  Child goals default to read_only or proposal_only. Direct writes require an isolated worktree, explicit non-overlapping scope, or a parent-granted single-writer lease. If two child goals need the same file, the parent goal serializes or isolates the work, and write_scope_conflict_detection runs before writes proceed.
gui_related: false
gui_classification_reason: Write authority and conflict policy are runtime/file orchestration behavior, not GUI implementation.
depends_on:
  - GRS-016
unblocks: []
acceptance_criteria:
  - Parallel child goals do not perform blind concurrent direct writes.
  - Write scopes are isolated, explicitly partitioned, or leased to a single writer by the parent.
  - Parent synthesis handles conflicting child outputs.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future worktree/write-scope conflict tests
risk_class: concurrent_write_conflict
reasoning_tier: high
context_scope: parent_child_goal_runtime
implementation_surfaces:
  - future Goal Mode service
  - future worktree manager
node_compile_hint:
  mode: child_write_authority_policy
  create_worknodes: false
source_lineage:
  - pldg-20260616-001-goal-runtime-system:atom-0055
  - pldg-20260616-001-goal-runtime-system:atom-0101
  - pldg-20260616-001-goal-runtime-system:atom-0102
  - pldg-20260616-001-goal-runtime-system:atom-0110
  - pldg-20260616-001-goal-runtime-system:dec-0017
  - pldg-20260616-001-goal-runtime-system:dec-0024
preserved_exact_tokens:
  - "read_only"
  - "proposal_only"
  - "isolated_worktree"
  - "direct_write_single_owner"
  - "direct_write_partitioned"
  - "parent goal is the default merger/writer"
  - "No blind concurrent writes"
  - "parent-granted single-writer lease"
  - "write_scope_conflict_detection"
negative_constraints:
  - Do not allow blind concurrent direct writes from multiple child goals.
  - Do not default parallel child agents to direct file mutation.
  - Do not allow child direct writes without isolation, partitioning, or a parent-granted lease.
  - Do not allow multiple write agents to edit conflicting scopes without isolation/merge control.
owner_hints:
  - Plans/Goal_Runtime_System.md
```

### GRS-018 - Task Template Catalog And Goal-Type Completion Criteria

```yaml
plan_unit_id: GRS-018
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  Goal Runtime provides a task template catalog for common goal classes: bug_fix, feature_build, test_until_pass, doc_update, repo_research, refactor, migration, audit_and_repair, ledger_to_plan_transfer, governance seal, and future plan_graph_build only after the PlanUnit-to-NodeSeed-to-WorkNode compiler contract exists. Each template carries goal-type completion criteria, validator expectations, evidence requirements, and no-WorkNode boundary where applicable. Bug-fix goals require the bug reproduced or a reason recorded, fix applied, relevant tests pass, and changed files/evidence summarized. Feature-build goals require implementation done within scope, tests added/updated and passing, docs/plans updated when required, and acceptance criteria proved. Test-until-pass goals keep running until the command passes or external/blocking status is classified with logs captured. Doc-update goals require target docs reflect the request, unsupported content absent, source refs/lineage preserved where required, and validators or lint checks pass. Ledger-to-plan transfer goals load compact state and relevant records, inspect sharded source/target docs through runtime retrieval, update live Plans, verify coverage, repair missed/weak areas autonomously, and complete with evidence/certification.
gui_related: false
gui_classification_reason: Goal templates and completion criteria are runtime/task policy, not GUI implementation.
depends_on:
  - GRS-012
  - GRS-015
unblocks: []
acceptance_criteria:
  - Bug-fix, feature-build, test-until-pass, doc-update, audit/repair, and ledger-to-plan transfer goals have explicit completion criteria.
  - Plan graph build remains deferred until the compiler contract defines safe node artifacts.
  - Template metadata does not create executable queues by itself.
  - Bug-fix goals complete only after bug reproduced or reason recorded, fix applied, relevant tests pass, and changed files/evidence summarized.
  - Feature-build goals complete only after implementation done within scope, tests added/updated and pass, docs/plans updated when required, and acceptance criteria proved.
  - Test-until-pass goals continue until command passes or external/blocking condition is classified with logs captured.
  - Doc-update goals complete only when target docs reflect the request, unsupported content is absent, source refs/lineage are preserved where required, and validators or lint checks pass.
  - Ledger-to-plan transfer goals load compact state/relevant records, inspect sharded source/target docs, update live Plans, verify coverage, repair autonomously, and complete with completion certificate.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future template catalog tests
risk_class: goal_template_ambiguity
reasoning_tier: standard
context_scope: goal_runtime_templates
implementation_surfaces:
  - future Goal Mode service
  - Plans/Plan_To_Node_Compilation.md
node_compile_hint:
  mode: goal_template_catalog
  create_worknodes: false
source_lineage:
  - pldg-20260616-001-goal-runtime-system:atom-0059
  - pldg-20260616-001-goal-runtime-system:atom-0060
  - pldg-20260616-001-goal-runtime-system:atom-0061
  - pldg-20260616-001-goal-runtime-system:atom-0062
  - pldg-20260616-001-goal-runtime-system:atom-0063
  - pldg-20260616-001-goal-runtime-system:atom-0064
  - pldg-20260616-001-goal-runtime-system:atom-0065
  - pldg-20260616-001-goal-runtime-system:dec-0005
  - pldg-20260616-001-goal-runtime-system:q-0002
preserved_exact_tokens:
  - "bug_fix"
  - "feature_build"
  - "test_until_pass"
  - "doc_update"
  - "repo_research"
  - "refactor"
  - "migration"
  - "audit_and_repair"
  - "ledger_to_plan_transfer"
  - "ledger-to-plan transfer"
  - "governance seal"
  - "plan_graph_build"
  - "Plan graph build goal deferred"
  - "PlanUnit-to-NodeSeed-to-WorkNode compiler contract"
  - "bug reproduced"
  - "fix applied"
  - "relevant tests pass"
  - "implementation done"
  - "tests added/updated"
  - "tests pass"
  - "docs/plans updated"
  - "test until pass"
  - "command passes"
  - "external/blocking"
  - "logs captured"
  - "source refs"
  - "lineage"
  - "validators"
  - "lint checks"
  - "compact state"
  - "relevant records"
  - "sharded source/target docs"
  - "update live Plans"
  - "verify coverage"
  - "repair autonomously"
  - "completion certificate"
negative_constraints:
  - Do not create NodeSeeds or WorkNodes until Plans/Plan_To_Node_Compilation.md defines the compiler contract.
  - Do not treat a task template as an executable queue.
owner_hints:
  - Plans/Goal_Runtime_System.md
  - Plans/Plan_To_Node_Compilation.md
```

### GRS-019 - Autonomous Recovery And Exact Blockers

```yaml
plan_unit_id: GRS-019
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  Goal Runtime handles ordinary ambiguity and large-work recovery autonomously by preserving open questions, conflicts, or unplaced requirements in appropriate docs/artifacts, selecting a safe canonical destination when policy is clear, retrying, inspecting, replanning, spawning verifier/subagents, escalating model tier, narrowing scope, running repair gates, rolling back isolated changes when appropriate, and recording precise blockers when it cannot proceed. Large, cross-referential, ambiguous-in-ordinary-ways, or many-shard tasks do not route to manual decision merely because they are large. Blocked status must store and display blocker_class, cause, affected scope, last attempted recovery, why autonomous recovery cannot continue safely, and next safe action rather than a generic failure label.
gui_related: true
gui_classification_reason: Exact blocker status is a user-visible goal status surface as well as runtime state.
depends_on:
  - GRS-006
  - GRS-015
unblocks: []
acceptance_criteria:
  - Ordinary large-work ambiguity does not become a manual decision request by default.
  - Recovery actions are recorded as goal events or receipt evidence.
  - Blocked states expose exact blocker causes for user and verifier review.
  - Ordinary ambiguity can be preserved as open questions, conflicts, or unplaced requirements with safe canonical destination evidence.
  - Recovery actions include retry, replan, spawn verifier/subagents, escalate model tier, narrow scope, repair gates, and isolated rollback where safe.
  - Blocked states record blocker_class, cause, affected scope, last attempted recovery, why autonomous recovery cannot continue safely, and next safe action.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future recovery/blocker-state tests
risk_class: hidden_blocker
reasoning_tier: high
context_scope: goal_runtime_recovery
implementation_surfaces:
  - future Goal Mode service
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: autonomous_recovery_and_blockers
  create_worknodes: false
source_lineage:
  - pldg-20260616-001-goal-runtime-system:atom-0069
  - pldg-20260616-001-goal-runtime-system:atom-0070
  - pldg-20260616-001-goal-runtime-system:atom-0071
  - pldg-20260616-001-goal-runtime-system:atom-0072
preserved_exact_tokens:
  - "Autonomous ambiguity handling"
  - "ordinary ambiguity"
  - "open questions"
  - "conflicts"
  - "unplaced requirements"
  - "safe canonical destination"
  - "Autonomous recovery actions"
  - "retry"
  - "replan"
  - "spawn verifier"
  - "escalate model tier"
  - "repair gates"
  - "roll back"
  - "precise blockers"
  - "No manual decision for ordinary large work"
  - "do not route to manual decision just because the task count is large"
  - "large"
  - "cross-referential"
  - "many shards"
  - "Blocked status carries exact blocker"
  - "blocker_class"
  - "affected scope"
  - "last attempted recovery"
  - "next safe action"
negative_constraints:
  - Do not ask the user for ordinary invisible-goal ambiguity.
  - Do not hide an unresolved blocker behind a successful completion receipt.
owner_hints:
  - Plans/Goal_Runtime_System.md
  - Plans/assistant-chat-design.md
```

### GRS-020 - Approval Boundaries For High-Risk Goal Actions

```yaml
plan_unit_id: GRS-020
unit_type: constraint
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  Goal Runtime requires explicit user approval for destructive actions, governance seal, broad writes outside declared scope, external paid/network side effects, production-affecting actions, data deletion/migration, dependency/license/security-policy changes, and credential/secrets touching. Invisible internal goals use predeclared authority and block when outside it.
gui_related: false
gui_classification_reason: Approval authority boundaries are runtime/permission policy, not GUI layout or presentation.
depends_on:
  - GRS-011
  - GRS-012
unblocks: []
acceptance_criteria:
  - High-risk goal actions request explicit user approval before execution.
  - Invisible/internal goals cannot exceed predeclared authority.
  - Approval boundaries are enforced even when a child goal or worker requests the action.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future permission/approval policy tests
risk_class: authority_boundary_violation
reasoning_tier: high
context_scope: goal_runtime_permissions
implementation_surfaces:
  - future Goal Mode service
  - Plans/Permissions_System.md
node_compile_hint:
  mode: goal_approval_boundary_policy
  create_worknodes: false
source_lineage:
  - pldg-20260616-001-goal-runtime-system:atom-0108
  - pldg-20260616-001-goal-runtime-system:dec-0022
preserved_exact_tokens:
  - "explicit user approval"
  - "destructive actions"
  - "governance seal"
  - "broad writes outside declared scope"
  - "external paid/network side effects"
  - "production-affecting actions"
  - "data deletion/migration"
  - "dependency/license/security-policy changes"
  - "credential/secrets touching"
  - "Invisible internal goals"
  - "predeclared authority"
  - "block when outside it"
negative_constraints:
  - Do not proceed with high-risk operations without explicit approval.
  - Do not let invisible internal goals exceed predeclared authority.
owner_hints:
  - Plans/Goal_Runtime_System.md
  - Plans/Permissions_System.md
```

### GRS-021 - Goal Compile Acceptance And Governance Boundary

```yaml
plan_unit_id: GRS-021
unit_type: validation_criterion
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  Goal Runtime compilation from this ledger creates a new Goal Runtime owner doc plus consumer PlanUnits only. During ordinary ledger planning, plan drafting, and ledger compile, agents must not update Plans/.plan_index, Spec Lock, generated shards, evidence bundles, plan_graph, auto_decisions, WorkNodes, NodeSeeds, executable queues, final node manifests, product implementation files, Rust/Slint app scaffolds, legacy Iced app files, production build tasks, or final node queues. A separate explicit PlanUnit index phase may regenerate allowed Plans/.plan_index/** outputs after live Plans docs are stable. If Plans or Plans/.plan_index change, governance_status remains pending_seal until a separate explicit governance seal phase; that seal may refresh governance artifacts without changing product behavior or creating node/build artifacts.
gui_related: false
gui_classification_reason: Compile and governance boundaries are planning/governance behavior, not GUI implementation.
depends_on:
  - GRS-001
unblocks: []
acceptance_criteria:
  - Canonical Goal Runtime behavior is represented in live non-pipeline Plans docs.
  - Ledger planning, plan drafting, and ledger compile do not update Plans/.plan_index, generated indexes, shards, evidence, Spec Lock, graph, or decisions.
  - Allowed PlanUnit index outputs may be regenerated only in a separate explicit PlanUnit index phase after live Plans docs are stable; seal-phase governance artifacts are not touched until explicit seal.
  - Compile reports changed files, PlanUnits, atom dispositions, validators, and pre-seal pending seal status.
validation_surfaces:
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260616-001-goal-runtime-system
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plans-verify.py run-gates
  - python3 scripts/pm-shard-plans.py --check
  - python3 scripts/pm-plans-verify.py validate-auto-decisions
  - python3 scripts/pm-plans-verify.py verify-spec-lock
  - python3 scripts/pm-plans-verify.py validate-evidence
  - git diff --check
risk_class: governance_boundary
reasoning_tier: high
context_scope: ledger_to_plans_compile
implementation_surfaces:
  - Plans/Goal_Runtime_System.md
  - Plans/00-plans-index.md
  - Plans/.plan_index
node_compile_hint:
  mode: compile_governance_boundary
  create_worknodes: false
source_lineage:
  - pldg-20260616-001-goal-runtime-system:atom-0080
  - pldg-20260616-001-goal-runtime-system:atom-0082
  - pldg-20260616-001-goal-runtime-system:atom-0083
  - pldg-20260616-001-goal-runtime-system:atom-0084
  - pldg-20260616-001-goal-runtime-system:dec-0012
preserved_exact_tokens:
  - "Create new Goal Runtime System plan doc"
  - "Goal Runtime PlanUnit coverage areas"
  - "Do not create generated governance artifacts during ledger planning"
  - "Goal Mode compile acceptance"
  - "WorkNodes"
  - "NodeSeeds"
  - "Spec_Lock"
  - "shards"
  - "evidence bundles"
  - "plan_graph"
  - "auto_decisions"
negative_constraints:
  - Do not create WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, or production build tasks during this compile.
  - Do not update Spec_Lock, generated shards, evidence, plan_graph, or auto_decisions during the pre-seal compile phase.
owner_hints:
  - Plans/Goal_Runtime_System.md
```

### GRS-022 - Goal Runtime Risk Register

```yaml
plan_unit_id: GRS-022
unit_type: risk
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  The primary Goal Runtime risks are false completion by weak agents, hidden work without user control, and invisible/internal flows interrupting the user for ordinary blockers. Runtime certification, visible control surfaces, exact blocker states, autonomous recovery, and explicit authority boundaries mitigate these risks.
gui_related: true
gui_classification_reason: This risk register includes hidden-work/user-control UX risk and visible control mitigation.
depends_on:
  - GRS-009
  - GRS-012
  - GRS-019
  - GRS-020
unblocks: []
acceptance_criteria:
  - False completion risk is mitigated through runtime-certified receipts and verifier/adjudicator policy.
  - Hidden work risk is mitigated through visible Assistant Chat controls and evidence disclosure.
  - Internal-flow interruption risk is mitigated through autonomous recovery and exact hard-stop boundaries.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - manual Goal Runtime risk review
risk_class: goal_runtime_product_risk
reasoning_tier: high
context_scope: goal_runtime_system
implementation_surfaces:
  - Plans/Goal_Runtime_System.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: goal_runtime_risk_register
  create_worknodes: false
source_lineage:
  - pldg-20260616-001-goal-runtime-system:atom-0085
  - pldg-20260616-001-goal-runtime-system:atom-0086
  - pldg-20260616-001-goal-runtime-system:atom-0087
preserved_exact_tokens:
  - "Main product risk: false completion by weak agents"
  - "Main UX risk: hidden work without control"
  - "Main internal-flow risk: user interruption for ordinary blockers"
negative_constraints:
  - Do not make invisible work impossible to inspect or stop when it affects the user.
  - Do not route ordinary invisible-goal ambiguity to the user by default.
owner_hints:
  - Plans/Goal_Runtime_System.md
  - Plans/assistant-chat-design.md
```

### GRS-023 - Reference Patterns Are Lineage, Not Canonical Owners

```yaml
plan_unit_id: GRS-023
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  Codex implementation patterns, attachment behavior references, and competitor evaluator/judge-loop lessons are source-lineage and implementation research inputs only. Exact lineage tokens retained include /goal now preserves oversized text, large pasted blocks, and image attachments, rust-v0.140.0, #27508, #27509, #27510, runtime.rs, tool.rs, spec.rs, steering.rs, continuation.md, thread_goal.rs, goal_menu.rs, goal_status.rs, thread_goal_processor.rs, Codex, Claude Code, Hermes, OpenClaw, OpenCode, PI, separate evaluator, judge loop, and core-owned session goals. These tokens may guide Goal Runtime implementation, but they remain lineage/research and do not override Puppet Master-owned runtime, evidence, model-role, or completion contracts.
gui_related: false
gui_classification_reason: Research/source-lineage disposition is not GUI implementation.
depends_on:
  - GRS-001
unblocks: []
acceptance_criteria:
  - External or comparative references remain cited as lineage or implementation research.
  - Puppet Master-owned PlanUnits remain the canonical behavior source.
  - External file names, PR numbers, and competitor/runtime names remain source-lineage tokens rather than Puppet Master behavior.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - manual source-lineage review
risk_class: external_reference_overreach
reasoning_tier: standard
context_scope: goal_runtime_source_lineage
implementation_surfaces:
  - Plans/Goal_Runtime_System.md
node_compile_hint:
  mode: source_lineage_reference_disposition
  create_worknodes: false
source_lineage:
  - pldg-20260616-001-goal-runtime-system:atom-0040
  - pldg-20260616-001-goal-runtime-system:atom-0073
  - pldg-20260616-001-goal-runtime-system:atom-0074
preserved_exact_tokens:
  - "Codex v0.140 attachment behavior reference"
  - "Codex implementation patterns to inspect"
  - "Evaluator and judge-loop lessons"
  - "/goal now preserves oversized text, large pasted blocks, and image attachments"
  - "rust-v0.140.0"
  - "#27508"
  - "#27509"
  - "#27510"
  - "runtime.rs"
  - "tool.rs"
  - "spec.rs"
  - "steering.rs"
  - "continuation.md"
  - "thread_goal.rs"
  - "goal_menu.rs"
  - "goal_status.rs"
  - "thread_goal_processor.rs"
  - "Claude Code"
  - "Hermes"
  - "OpenClaw"
  - "OpenCode"
  - "PI"
  - "separate evaluator"
  - "judge loop"
  - "core-owned session goals"
negative_constraints:
  - Do not make competitor or external implementation references canonical Puppet Master behavior.
  - Do not rely only on marker-based completion or host-specific stop hooks.
owner_hints:
  - Plans/Goal_Runtime_System.md
```

### GRS-024 - Legacy Chain Wizard Compatibility And Plan Graph Runtime Boundary

```yaml
plan_unit_id: GRS-024
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  Current Planning Wizard flow semantics are owned by Plans/Planning_Wizard.md, and legacy Chain Wizard compatibility remains source-lineage-only unless a separate compatibility owner explicitly implements an import/display bridge. Goal Runtime may define invisible ledger-to-Plans execution and a plan_graph_build template that consumes the accepted Plan_To_Node_Compilation compiler contract, but Goal Runtime plan/index/governance phases still must not create NodeSeeds, WorkNodes, executable queues, final node manifests, or production build tasks. Runtime PlanCompile may create runtime artifacts only through the Plan_To_Node_Compilation compiler, Executor intake, activation, and completion certification chain.
gui_related: false
gui_classification_reason: Legacy compatibility/source-lineage and runtime compiler boundary design is not a GUI implementation requirement.
depends_on:
  - GRS-003
  - GRS-018
  - PNC-007
unblocks: []
acceptance_criteria:
  - Current Planning Wizard flow semantics route to Plans/Planning_Wizard.md.
  - Legacy Chain Wizard compatibility is source-lineage-only and is not required by accepted runtime flow.
  - Plan graph build consumes the accepted Plan_To_Node_Compilation compiler contract without letting Goal Runtime bypass Executor intake.
  - No node artifacts are produced by Goal Runtime documentation, index, or governance phases.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Plans/.plan_index/node_readiness_report.json
risk_class: legacy_compiler_boundary
reasoning_tier: high
context_scope: chain_wizard_and_compiler
implementation_surfaces:
  - Plans/Goal_Runtime_System.md
  - Plans/Plan_To_Node_Compilation.md
  - Plans/chain-wizard-flexibility.md
node_compile_hint:
  mode: legacy_chain_wizard_source_lineage_runtime_boundary
  create_worknodes: false
source_lineage:
  - pldg-20260616-001-goal-runtime-system:atom-0015
  - pldg-20260616-001-goal-runtime-system:atom-0016
  - pldg-20260616-001-goal-runtime-system:atom-0065
  - pldg-20260616-001-goal-runtime-system:q-0001
  - pldg-20260616-001-goal-runtime-system:q-0002
preserved_exact_tokens:
  - "Plan graph goals come after compiler contract"
  - "Plan graph build"
  - "exact redesigned Chain Wizard flow"
  - "PlanUnit-to-NodeSeed-to-WorkNode compiler contract"
negative_constraints:
  - Do not make legacy Chain Wizard compatibility a dependency for accepted runtime flow.
  - Do not let Goal Runtime bypass Plan_To_Node_Compilation, Executor intake, activation, or completion certification.
owner_hints:
  - Plans/Goal_Runtime_System.md
  - Plans/Plan_To_Node_Compilation.md
  - Plans/chain-wizard-flexibility.md
```

### GRS-025 - Goal UI Styling, Persistence Substrate, And Provider Defaults

```yaml
plan_unit_id: GRS-025
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  Goal chip/status/task-drawer styling, persistence substrate, and provider-specific model-role tier mappings are required implementation-bound decisions for the Goal Runtime product surface. The Goal implementation plan must bind each choice to named owner docs, durable state records, provider-policy records, validation surfaces, and acceptance evidence before production readiness can be certified. The accepted runtime contract requires functional Assistant Chat controls, durable goal state, separate worker and verifier/adjudicator policy surfaces, and certification-tier verifier requirements; unresolved styling, persistence, or provider defaults must block certification rather than remain as unbound implementation gaps.
gui_related: true
gui_classification_reason: This requirement includes final visual styling, iconography, and layout for Goal UI surfaces.
depends_on:
  - GRS-005
  - GRS-007
  - GRS-010
unblocks: []
acceptance_criteria:
- Goal visual styling binds to owner-doc UI contracts before certification.
- Persistence substrate selection binds to durable state and event-log contracts before certification.
- Provider defaults bind to separate worker/verifier-adjudicator policy and strong-certification blocking rules before certification.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - UI design, persistence, and provider-policy reviews
risk_class: implementation_binding_drift
reasoning_tier: standard
context_scope: goal_runtime_implementation_bindings
implementation_surfaces:
  - Plans/Goal_Runtime_System.md
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: goal_runtime_implementation_bindings
  create_worknodes: false
source_lineage:
  - pldg-20260616-001-goal-runtime-system:atom-0017
  - pldg-20260616-001-goal-runtime-system:atom-0031
  - pldg-20260616-001-goal-runtime-system:atom-0104
  - pldg-20260616-001-goal-runtime-system:atom-0105
  - pldg-20260616-001-goal-runtime-system:q-0003
  - pldg-20260616-001-goal-runtime-system:q-0004
  - pldg-20260616-001-goal-runtime-system:q-0005
preserved_exact_tokens:
  - "final visual styling, iconography, and exact layout"
  - "database tables, project files, or a hybrid"
  - "default model-role tier mappings"
  - "worker, planner, evaluator, verifier, and adjudicator"
negative_constraints:
  - Do not treat deferred styling as absence of required Goal controls.
  - Do not hard-code provider-specific model defaults as canonical correctness requirements in this compile.
owner_hints:
  - Plans/Goal_Runtime_System.md
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

## 3. Contracts, Schemas, Events, Or Data Shapes

Goal Runtime requires these data-shape families:

- Goal state: `goal_id`, `parent_goal_id`, `status`, `objective`, `acceptance_criteria`, `non_goals`, `allowed_scope`, constraints, budget, `work_queue`, task list, `model_policy`, attachment manifest, child goals, `evidence_index`, evidence references, completion receipt, `goal_revision`, and recovery state.
- Goal event log: append-only events using the Contracts_V0 registered names `goal.created`, `goal.scheduled`, `goal.progressed`, `goal.tool_check_recorded`, `goal.updated`, `goal.replanned`, `goal.child_status_changed`, `goal.evidence_captured`, `goal.verification_decided`, `goal.receipt_recorded`, `goal.completed`, `goal.degraded`, `goal.stopped`, `goal.blocked`, and `goal.cancelled`, plus Orchestrator GoalRun projections from `goal_run.started`, `goal_run.replanned`, `goal_run.blocked`, `goal_run.certified`, `goal_run.cancelled`, and `goal_run.stopped`. Exactly `goal.child_status_changed` (GRS-060/CV-334), `goal.degraded` (GRS-061/CV-335), and `goal.scheduled` (GRS-062/CV-336) are historical-only and admit no current writes under their individual owner rulings. Historical records preserve original custody and cannot rebuild retired current Goal states or child topology.
- Goal update event fields: `goal_revision`, `previous_revision`, `objective_update`, `constraint_added`, `active_subgoals_notified`, and stale child goals.
- Goal Completion Receipt: tier, changed files/artifacts, checklist disposition, checks run/skipped, evidence refs, validator outputs, child receipts, verifier/adjudicator decision, unresolved/open items, degraded-mode reason, and source-to-target mapping when applicable.
- Child goal state: `child_goal_id`, `parent_goal_id`, `agent_id`, `status`, `objective`, `allowed_scope`, `write_policy`, `budget`, `task_list`, `result_artifacts`, `completion_receipt`, stale/re-steer state, and `recovery_state`.
- Progress state: `progress_fingerprint`, `blocker_signature`, artifact hashes, retry count, `repeat_count`, and no-progress continuation markers.
- Write authority: canonical `write_mode` enum values are `read_only`, `proposal_only`, `isolated_worktree`, `direct_write_single_owner`, `direct_write_partitioned`, and `leased_writer`. The phrase "parent-granted single-writer lease" is a human-readable description of `leased_writer`, not a separate enum value.

### Goal and GoalRun payload minima

Every persisted Goal Runtime event carries the shared runtime envelope from `Contracts_V0`: `event_name`, payload `schema_version`, `occurred_at_utc`, `project_id`, `thread_id?`, `goal_id`, `parent_goal_id?`, `goal_revision`, `expected_goal_revision?` when compare-and-swap applies, `actor_ref`, `execution_role`, requested/effective provider refs, requested/effective model refs, requested/effective account refs, `correlation_id`, `causation_event_ref?`, `idempotency_key?`, `evidence_refs[]`, `artifact_refs[]`, `approval_refs[]?`, and `block_refs[]?`.

Event-specific minima:

| Event | Additional minimum payload |
| --- | --- |
| `goal.created` | `objective`, `acceptance_criteria[]`, `non_goals[]`, `allowed_scope`, `constraints[]`, `budget`, `attachment_refs[]`, `model_policy`, `agent_control_envelope_ref`, `agent_control_envelope_hash` |
| `goal.scheduled` | `scheduler_reason`, `eligible_at_utc`, `queue_id?`, `priority`, `budget_snapshot_ref`, `next_action` |
| `goal.progressed` | `progress_fingerprint`, `task_delta`, `status_before`, `status_after`, `artifact_hashes[]`, `repeat_count?`, `no_progress_marker?` |
| `goal.tool_check_recorded` | `tool_call_id`, `tool_name`, `check_kind`, `check_result`, `policy_decision`, `output_ref?`, `log_ref?` |
| `goal.updated` | `previous_revision`, `new_revision`, `objective_delta?`, `scope_delta?`, `constraint_delta?`, `budget_delta?`, `active_child_goal_ids[]`, `stale_child_goal_ids[]` |
| `goal.replanned` | `interruption_class`, `impact_summary`, `affected_child_goal_ids[]`, `affected_worknode_refs[]`, `child_decisions[]`, `remaining_evidence_refs[]`, `new_revision`, `next_action` |
| `goal.child_status_changed` | `child_goal_id`, `child_agent_lease_id?`, `previous_status`, `next_status`, `result_ref?`, `receipt_ref?`, `parent_action_required?` |
| `goal.evidence_captured` | `evidence_ref`, `evidence_kind`, `source_spans[]`, `content_hash`, `snapshot_ref?`, `currentness_state`, `redaction_profile`, `retention_policy_ref?` |
| `goal.verification_decided` | `audit_cycle_id?`, `verification_cycle_id?`, `decision`, `verifier_ref`, `adjudicator_ref?`, `finding_refs[]`, `closure_refs[]`, `unresolved_risk_refs[]` |
| `goal.receipt_recorded` | `receipt_id`, `receipt_kind`, `certification_tier`, `validator_outputs[]`, `child_receipt_refs[]`, `worknode_receipt_refs[]`, `certifier_decision` |
| `goal.completed` | `completion_receipt_ref`, `acceptance_criteria_disposition[]`, `changed_artifact_refs[]`, `validator_outputs[]`, `final_certifier_decision` |
| `goal.degraded` | `degraded_reason`, `affected_scope`, `exception_refs[]?`, `approval_refs[]?`, `residual_risk_refs[]`, `allowed_actions[]` |
| `goal.stopped` | `stop_reason_code`, `safe_point_ref?`, `interruption_boundary`, `child_settlement_refs[]`, `tool_settlement_refs[]`, `resumable` |
| `goal.blocked` | `blocker_class`, `blocked_reason_code`, `cause`, `affected_scope`, `last_recovery_attempt_ref?`, `autonomous_recovery_stop_reason`, `next_safe_action`, `allowed_action_ids[]` |
| `goal.cancelled` | `cancel_reason`, `mutation_started`, `cancellation_scope`, `settlement_refs[]`, `rollback_refs[]?` |
| `goal_run.started` | `goal_run_id`, `workgraph_ref`, `activation_receipt_ref`, `active_worknode_request_refs[]`, `write_mode`, `certification_tier` |
| `goal_run.replanned` | `goal_run_id`, `previous_workgraph_ref`, `new_workgraph_ref`, `replan_generation`, `affected_worknode_refs[]`, `cancelled_or_resteered_refs[]`, `next_action` |
| `goal_run.blocked` | `goal_run_id`, `blocked_reason_code`, `blocked_scope`, `allowed_action_ids[]`, `preserved_work_refs[]`, `block_receipt_ref` |
| `goal_run.certified` | `goal_run_id`, `certification_receipt_ref`, `validator_outputs[]`, `worknode_receipt_refs[]`, `unresolved_risk_refs[]`, `final_certifier_decision` |
| `goal_run.cancelled` | `goal_run_id`, `cancel_reason`, `mutation_started`, `settlement_refs[]`, `rollback_refs[]?` |
| `goal_run.stopped` | `goal_run_id`, `stop_reason_code`, `safe_point_ref?`, `child_settlement_refs[]`, `resumable` |

Runtime records:

| Record | Spec-level minimum |
| --- | --- |
| `LoopBreakerRegistry` | `registry_id`, `schema_version`, families `identical_tool_failure`, `empty_assistant`, `no_tool_progress`, `repeated_edit_miss`, `compaction_no_gain`, `context_overflow_replay`, `MCP_resource_missing`, `first_event_timeout`, `transport_idle`, `reasoning_no_action`, `subagent_same_read`, and `spend_anomaly`; each family has `fingerprint_fields[]`, `max_count`, `observation_window`, `terminal_action`, and `user_facing_reason`. |
| `AgentControlEnvelope` | `envelope_id`, `schema_version`, `autonomy_mode`, `write_surface`, provider/model/effort policy refs, tool/MCP permission ceiling, context/token budgets, loop budgets, wall-clock budgets, terminal/browser/device authority, child-spawn policy, cancellation/steering policy, progress heartbeat policy, and receipt refs. |
| `CertificationReceipt` | `receipt_id`, `schema_version`, `goal_id`, `goal_run_id?`, `certification_tier`, acceptance-criteria disposition, changed artifact refs, validator outputs, child/worknode receipt refs, authority checks, unresolved risks, certifier identity, and final decision. |
| `ChildAgentLease` | `lease_id`, `schema_version`, `parent_goal_id`, `child_goal_id?`, `agent_id`, `allowed_phase`, `read_write_mode`, `max_depth`, `delegation_depth`, `cannot_resume_parent_goal`, `terminal_return_channel`, budget ceiling, and settlement requirement. |
| `WorkNodeRequests` | `request_set_id`, `schema_version`, `goal_run_id`, active required request refs, optional request refs, accepted/deferred/excluded disposition, readiness snapshot, activation transaction ref, and reason for any mixed result. |
| `AuditCycle` | `audit_cycle_id`, `schema_version`, `goal_id`, `target_ref`, `cycle_index`, auditor refs, scope refs, finding refs, closure refs, validator outputs, status, and next action. |
| `AuditFinding` | `finding_id`, `schema_version`, `audit_cycle_id`, `finding_family`, severity, target refs, evidence refs, root_cause_key?, repeated_signature_count?, proposed repair refs, status, and owner refs. |
| `AuditClosure` | `closure_id`, `schema_version`, `finding_id`, `audit_cycle_id`, repair evidence refs, validation outputs, residual risks, reopen conditions, closed_by_ref, and closure decision. |

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Permissions_System.md

These data-shape bullets are Goal Runtime feature-local constraints; adjacent owner docs carry the shared envelope, concrete event-name registry, persistence, replay, projection, retention, and approval-scope registration needed for cross-owner routing. Concrete cross-owner Goal event names and payload minima are registered in `Plans/Contracts_V0.md` and persisted/replayed through `Plans/storage-plan.md`. `Plans/Goal_Runtime_System.md` remains the semantic owner for Goal Runtime behavior.

### Known-37 Goal Runtime v2 owner materialization (EA-DEV-K37-001)

Status: `STATICALLY_MATERIALIZED` for this canonical owner prose and its schema-decidable common-definition source. Transition, side-effect, replay, authority, currentness, provider/tool, persistence, gate, runtime, certification, and buildability behavior is `NON_EXECUTABLE_UNDER_THIS_TRANSACTION` unless an unchanged pre-existing read-only check demonstrably covers the clause. The legacy aggregate `Plans/goal_runtime_events.schema.json` remains reader-only input; new writes select exactly one self-contained v2 root per event at `Plans/event_payloads/goal_runtime/*.schema.json#`.

Payload schema authority: under `Plans/Decision_Log.md#DL-039`, the exact 21 v2 row schemas listed in the machine-oriented materialization table below (`EA-UND-0001-GOAL..EA-UND-0021-GOAL`) are `AUTHORITATIVE_PAYLOAD_SCHEMA` as of 2026-09-11, owned by `Plans/Goal_Runtime_System.md`. This promotion replaces their former candidate/draft authority restriction; it changes no schema validation rule and establishes no registry admission, per-family Event Authority depth, executable behavior, certification, or buildability. The existing `NON_EXECUTABLE_UNDER_THIS_TRANSACTION` boundary, central registration prerequisite for emission, reader-only legacy handling, and Goal V2 retirement boundaries remain in force.

ContractRef: ContractName:Plans/Decision_Log.md, ContractName:Plans/Goal_Runtime_System.md#GRS-041

#### Goal Runtime v2 common schema-definition source

##### 3.1 JSON Schema construction

All 21 row schema files use `"$schema": "https://json-schema.org/draft/2020-12/schema"` and are self-contained validation roots. Each row file:

1. has the row `$id` from Section 6;
2. declares `type:object`, the complete common root `properties` and `required` list, `additionalProperties:false`, and `unevaluatedProperties:false`;
3. embeds every common definition named below under its own `$defs` and uses only local `#/$defs/...` references;
4. constrains `event_name` to the row const;
5. constrains `schema_version` to the row schema ID;
6. defines the local non-root target `#/$defs/event_payload` as `type:object` with `additionalProperties:false`, preserves every approved row field/domain/branch from Section 8, and points root `payload` to it.

Exact common `$defs` identities are:

`non_empty_string`, `non_empty_ref`, `ref_array`, `non_empty_ref_array`, `utc_date_time`, `sha256_hex`, `execution_role`, `goal_status`, `goal_run_status`, `scope`, `budget`, `model_policy`, `constraint`, `delta`, `source_span`, `validator_output`, `criterion_disposition`, `task_delta`, `artifact_hash`, `no_progress_marker`, and `child_decision`.

This subsection owns machine-copyable canonical JSON values for the common root property schemas, common required list, and the definition body for every name above. Each of the 21 row files contains a mechanically identical local copy of every common definition body: the JCS value of a common `$defs` member must be byte-identical across all rows and to the owner value. No schema may duplicate one of those definitions under another name. Event-local defs are limited to `event_payload` and an event-specific conditional helper if the branch cannot be expressed inline. The row consts, `event_payload`, and those approved conditional helpers are the only per-row specializations.

The following closed JSON value is the machine-copyable canonical source for the shared common `$defs` bodies. Its JCS value must equal the shared common-definition value in every approved row root:

```json
{
  "artifact_hash": {
    "additionalProperties": false,
    "properties": {
      "artifact_ref": {
        "$ref": "#/$defs/non_empty_ref"
      },
      "sha256": {
        "$ref": "#/$defs/sha256_hex"
      }
    },
    "required": [
      "artifact_ref",
      "sha256"
    ],
    "type": "object"
  },
  "budget": {
    "additionalProperties": false,
    "properties": {
      "max_parallel_agents": {
        "minimum": 0,
        "type": "integer"
      },
      "max_tokens": {
        "anyOf": [
          {
            "minimum": 1,
            "type": "integer"
          },
          {
            "type": "null"
          }
        ]
      },
      "max_turns": {
        "minimum": 1,
        "type": "integer"
      },
      "max_wall_time_seconds": {
        "minimum": 1,
        "type": "integer"
      }
    },
    "required": [
      "max_turns",
      "max_tokens",
      "max_wall_time_seconds",
      "max_parallel_agents"
    ],
    "type": "object"
  },
  "child_decision": {
    "additionalProperties": false,
    "oneOf": [
      {
        "properties": {
          "decision": {
            "const": "resteer"
          }
        },
        "required": [
          "decision",
          "new_scope"
        ]
      },
      {
        "not": {
          "required": [
            "new_scope"
          ]
        },
        "properties": {
          "decision": {
            "enum": [
              "continue",
              "pause",
              "cancel"
            ]
          }
        },
        "required": [
          "decision"
        ]
      }
    ],
    "properties": {
      "child_goal_id": {
        "$ref": "#/$defs/non_empty_ref"
      },
      "decision": {
        "enum": [
          "continue",
          "pause",
          "cancel",
          "resteer"
        ],
        "type": "string"
      },
      "new_scope": {
        "$ref": "#/$defs/scope"
      },
      "reason": {
        "$ref": "#/$defs/non_empty_string"
      }
    },
    "required": [
      "child_goal_id",
      "decision",
      "reason"
    ],
    "type": "object"
  },
  "constraint": {
    "additionalProperties": false,
    "properties": {
      "constraint_id": {
        "$ref": "#/$defs/non_empty_ref"
      },
      "kind": {
        "enum": [
          "positive",
          "negative",
          "authority",
          "compatibility",
          "safety"
        ],
        "type": "string"
      },
      "statement": {
        "$ref": "#/$defs/non_empty_string"
      }
    },
    "required": [
      "constraint_id",
      "kind",
      "statement"
    ],
    "type": "object"
  },
  "criterion_disposition": {
    "additionalProperties": false,
    "oneOf": [
      {
        "properties": {
          "disposition": {
            "const": "satisfied"
          },
          "evidence_refs": {
            "$ref": "#/$defs/non_empty_ref_array"
          }
        },
        "required": [
          "disposition"
        ]
      },
      {
        "properties": {
          "disposition": {
            "enum": [
              "unsatisfied",
              "not_applicable",
              "deferred"
            ]
          }
        },
        "required": [
          "disposition",
          "reason"
        ]
      }
    ],
    "properties": {
      "criterion_id": {
        "$ref": "#/$defs/non_empty_ref"
      },
      "disposition": {
        "enum": [
          "satisfied",
          "unsatisfied",
          "not_applicable",
          "deferred"
        ],
        "type": "string"
      },
      "evidence_refs": {
        "$ref": "#/$defs/ref_array"
      },
      "reason": {
        "$ref": "#/$defs/non_empty_string"
      }
    },
    "required": [
      "criterion_id",
      "disposition",
      "evidence_refs"
    ],
    "type": "object"
  },
  "delta": {
    "additionalProperties": false,
    "oneOf": [
      {
        "properties": {
          "op": {
            "enum": [
              "clear",
              "remove"
            ]
          }
        },
        "required": [
          "op",
          "before_hash"
        ]
      },
      {
        "properties": {
          "op": {
            "enum": [
              "set",
              "add"
            ]
          }
        },
        "required": [
          "op",
          "after_hash"
        ]
      },
      {
        "properties": {
          "op": {
            "const": "replace"
          }
        },
        "required": [
          "op",
          "before_hash",
          "after_hash"
        ]
      }
    ],
    "properties": {
      "after_hash": {
        "$ref": "#/$defs/sha256_hex"
      },
      "before_hash": {
        "$ref": "#/$defs/sha256_hex"
      },
      "op": {
        "enum": [
          "set",
          "clear",
          "add",
          "remove",
          "replace"
        ],
        "type": "string"
      },
      "path": {
        "minLength": 1,
        "pattern": "^(?:/(?:[^~/]|~0|~1)*)+$",
        "type": "string"
      }
    },
    "required": [
      "op",
      "path"
    ],
    "type": "object"
  },
  "execution_role": {
    "enum": [
      "user",
      "worker",
      "planner",
      "evaluator",
      "reducer",
      "verifier",
      "adjudicator",
      "runtime_controller"
    ],
    "type": "string"
  },
  "goal_run_status": {
    "enum": [
      "ready",
      "running",
      "provisional_success",
      "verifying",
      "failed_verification",
      "repairing",
      "certified",
      "failed",
      "blocked",
      "cancelled",
      "stopped"
    ],
    "type": "string"
  },
  "goal_status": {
    "enum": [
      "created",
      "scheduled",
      "running",
      "paused",
      "replanning",
      "verifying",
      "repairing",
      "degraded",
      "blocked",
      "stopped",
      "budget_limited",
      "usage_limited",
      "failed",
      "cancelled",
      "completed"
    ],
    "type": "string"
  },
  "model_policy": {
    "additionalProperties": false,
    "properties": {
      "adjudicator_policy_ref": {
        "$ref": "#/$defs/non_empty_ref"
      },
      "evaluator_policy_ref": {
        "$ref": "#/$defs/non_empty_ref"
      },
      "inheritance": {
        "enum": [
          "inherit_parent",
          "override_within_ceiling"
        ],
        "type": "string"
      },
      "planner_policy_ref": {
        "$ref": "#/$defs/non_empty_ref"
      },
      "verifier_policy_ref": {
        "$ref": "#/$defs/non_empty_ref"
      },
      "worker_policy_ref": {
        "$ref": "#/$defs/non_empty_ref"
      }
    },
    "required": [
      "worker_policy_ref",
      "inheritance"
    ],
    "type": "object"
  },
  "no_progress_marker": {
    "additionalProperties": false,
    "properties": {
      "blocker_signature": {
        "$ref": "#/$defs/non_empty_string"
      },
      "continuation_count": {
        "minimum": 2,
        "type": "integer"
      },
      "unchanged_artifact_hashes": {
        "items": {
          "$ref": "#/$defs/artifact_hash"
        },
        "type": "array"
      }
    },
    "required": [
      "blocker_signature",
      "unchanged_artifact_hashes",
      "continuation_count"
    ],
    "type": "object"
  },
  "non_empty_ref": {
    "minLength": 1,
    "type": "string"
  },
  "non_empty_ref_array": {
    "items": {
      "$ref": "#/$defs/non_empty_ref"
    },
    "minItems": 1,
    "type": "array",
    "uniqueItems": true
  },
  "non_empty_string": {
    "minLength": 1,
    "type": "string"
  },
  "ref_array": {
    "items": {
      "$ref": "#/$defs/non_empty_ref"
    },
    "type": "array",
    "uniqueItems": true
  },
  "scope": {
    "additionalProperties": false,
    "allOf": [
      {
        "if": {
          "properties": {
            "scope_kind": {
              "const": "external_read_only"
            }
          },
          "required": [
            "scope_kind"
          ]
        },
        "then": {
          "properties": {
            "write_allowed": {
              "const": false
            }
          }
        }
      }
    ],
    "properties": {
      "exclude_refs": {
        "$ref": "#/$defs/ref_array"
      },
      "include_refs": {
        "$ref": "#/$defs/ref_array"
      },
      "scope_kind": {
        "enum": [
          "repository",
          "plan_corpus",
          "project",
          "external_read_only"
        ],
        "type": "string"
      },
      "write_allowed": {
        "type": "boolean"
      }
    },
    "required": [
      "scope_kind",
      "include_refs",
      "exclude_refs",
      "write_allowed"
    ],
    "type": "object"
  },
  "sha256_hex": {
    "pattern": "^[0-9a-f]{64}$",
    "type": "string"
  },
  "source_span": {
    "additionalProperties": false,
    "oneOf": [
      {
        "$comment": "Owner predicate retained in prose: end_line >= start_line.",
        "not": {
          "anyOf": [
            {
              "required": [
                "json_pointer"
              ]
            },
            {
              "required": [
                "fragment"
              ]
            }
          ]
        },
        "properties": {
          "locator_kind": {
            "const": "line_range"
          }
        },
        "required": [
          "locator_kind",
          "start_line",
          "end_line"
        ]
      },
      {
        "not": {
          "anyOf": [
            {
              "required": [
                "start_line"
              ]
            },
            {
              "required": [
                "end_line"
              ]
            },
            {
              "required": [
                "fragment"
              ]
            }
          ]
        },
        "properties": {
          "locator_kind": {
            "const": "json_pointer"
          }
        },
        "required": [
          "locator_kind",
          "json_pointer"
        ]
      },
      {
        "not": {
          "anyOf": [
            {
              "required": [
                "start_line"
              ]
            },
            {
              "required": [
                "end_line"
              ]
            },
            {
              "required": [
                "json_pointer"
              ]
            }
          ]
        },
        "properties": {
          "locator_kind": {
            "const": "artifact_fragment"
          }
        },
        "required": [
          "locator_kind",
          "fragment"
        ]
      }
    ],
    "properties": {
      "end_line": {
        "minimum": 1,
        "type": "integer"
      },
      "fragment": {
        "$ref": "#/$defs/non_empty_string"
      },
      "json_pointer": {
        "minLength": 1,
        "pattern": "^(?:/(?:[^~/]|~0|~1)*)+$",
        "type": "string"
      },
      "locator_kind": {
        "enum": [
          "line_range",
          "json_pointer",
          "artifact_fragment"
        ],
        "type": "string"
      },
      "source_ref": {
        "$ref": "#/$defs/non_empty_ref"
      },
      "start_line": {
        "minimum": 1,
        "type": "integer"
      }
    },
    "required": [
      "source_ref",
      "locator_kind"
    ],
    "type": "object"
  },
  "task_delta": {
    "$comment": "Owner predicate retained in prose: membership is disjoint across the four arrays.",
    "additionalProperties": false,
    "anyOf": [
      {
        "properties": {
          "added_task_ids": {
            "$ref": "#/$defs/non_empty_ref_array"
          }
        }
      },
      {
        "properties": {
          "updated_task_ids": {
            "$ref": "#/$defs/non_empty_ref_array"
          }
        }
      },
      {
        "properties": {
          "completed_task_ids": {
            "$ref": "#/$defs/non_empty_ref_array"
          }
        }
      },
      {
        "properties": {
          "removed_task_ids": {
            "$ref": "#/$defs/non_empty_ref_array"
          }
        }
      }
    ],
    "properties": {
      "added_task_ids": {
        "$ref": "#/$defs/ref_array"
      },
      "completed_task_ids": {
        "$ref": "#/$defs/ref_array"
      },
      "removed_task_ids": {
        "$ref": "#/$defs/ref_array"
      },
      "updated_task_ids": {
        "$ref": "#/$defs/ref_array"
      }
    },
    "required": [
      "added_task_ids",
      "updated_task_ids",
      "completed_task_ids",
      "removed_task_ids"
    ],
    "type": "object"
  },
  "utc_date_time": {
    "format": "date-time",
    "type": "string"
  },
  "validator_output": {
    "$comment": "A certified-success row refines skipped outputs to require waiver_ref.",
    "additionalProperties": false,
    "oneOf": [
      {
        "properties": {
          "outcome": {
            "const": "passed"
          }
        },
        "required": [
          "outcome",
          "evidence_ref"
        ]
      },
      {
        "properties": {
          "outcome": {
            "enum": [
              "failed",
              "blocked",
              "skipped"
            ]
          }
        },
        "required": [
          "outcome",
          "reason_code"
        ]
      }
    ],
    "properties": {
      "evidence_ref": {
        "$ref": "#/$defs/non_empty_ref"
      },
      "outcome": {
        "enum": [
          "passed",
          "failed",
          "blocked",
          "skipped"
        ],
        "type": "string"
      },
      "reason_code": {
        "$ref": "#/$defs/non_empty_string"
      },
      "validator_id": {
        "$ref": "#/$defs/non_empty_ref"
      },
      "waiver_ref": {
        "$ref": "#/$defs/non_empty_ref"
      }
    },
    "required": [
      "validator_id",
      "outcome"
    ],
    "type": "object"
  }
}
```

This local-only construction removes the external-resolution dependency and preserves valid local non-root pointers; it does not claim broader compatibility with every pre-existing checker. In particular, the existing Goal membership/depth check recognizes the legacy aggregate payload path rather than these approved per-row paths. It may therefore fail or leave some oracles non-executable when run read-only after materialization. That check is outside this transaction and MUST NOT be edited here; no result beyond local payload resolution may be inferred from it.

##### 3.2 Common fields

Every field not listed here or in the row payload is forbidden. All strings have `minLength:1`; all ref arrays use `uniqueItems:true`; arrays permit zero items unless the reusable type or row branch says `minItems:1`.

| Field | Exact type / constraint | Presence and branch |
| --- | --- | --- |
| `event_name` | string const equal to row event | required |
| `schema_version` | string const equal to row schema ID | required |
| `occurred_at_utc` | RFC 3339 `date-time` string | required |
| `project_id` | non-empty string | required; equals outer `project_id` |
| `thread_id` | non-empty string | optional; absent iff outer `thread_id=null`, otherwise equals outer |
| `goal_id` | non-empty string | required |
| `parent_goal_id` | non-empty string | optional; absent is distinct from null |
| `goal_revision` | integer, minimum 1 | required; `D-CAS-01` |
| `expected_goal_revision` | integer, minimum 1 | forbidden on `goal.created`; required on all other rows |
| `actor_ref` | non-empty ref | required; equals outer `actor_ref` |
| `execution_role` | `D-ROLE-01` enum | required |
| `requested_provider_ref`, `effective_provider_ref` | non-empty opaque refs | both required; equality is allowed and still records requested/effective split |
| `requested_model_ref`, `effective_model_ref` | non-empty opaque refs | both required; equality is allowed |
| `requested_account_ref`, `effective_account_ref` | non-empty opaque refs | both required; each equals its outer counterpart |
| `correlation_id` | non-empty string | required; equals outer `correlation_id` |
| `causation_event_ref` | non-empty ref | optional; if present equals outer `causation_event_id`; root event omits it and outer uses null |
| `idempotency_key` | non-empty string | optional; if present equals outer `idempotency_key`; producer still MUST supply the outer key from Section 7 |
| `evidence_refs`, `artifact_refs` | arrays of unique non-empty refs | required |
| `approval_refs`, `block_refs` | arrays of unique non-empty refs | optional; if present `minItems:1`; singular `approval_ref` / `block_ref` forbidden |
| `payload` | row `#/$defs/event_payload` | required and closed |

##### 3.3 Outer EventRecord join

For all new rows, outer `schema_id="pm.event.v0"`, `schema_version="2.0.0"`, `scope_kind="project"`, `project_id` is non-empty, `event_type=payload.event_name`, `payload_schema_id=payload.schema_version=row schema ID`, and `payload_ref=null` when the payload is inline. `run_id=payload.payload.goal_run_id` for the six GoalRun rows and is null for the 15 Goal rows unless a separate Contracts-owned relation applies. `node_id` and `attempt_id` stay contract-owned nullable values; this matrix does not invent them. Outer `event_id` is app-root globally unique. Outer `idempotency_key` is always required by EventRecord even though the mirrored inner key is optional.

Authority order for validation is:

1. EventRecord envelope (`Contracts_V0` and `event_record.schema.json`);
2. registered row schema ID and root;
3. Goal Runtime common and row payload rules in this matrix;
4. foreign referenced-record owner validation for refs actually dereferenced;
5. Storage append/dedupe/materialization with no semantic substitution.

A contradiction at steps 1-4 appends nothing. Storage may not pick a value to resolve it.

#### 4. Closed lifecycle/value states

##### 4.1 Goal state

`GoalStatus = created | scheduled | running | paused | replanning | verifying | repairing | degraded | blocked | stopped | budget_limited | usage_limited | failed | cancelled | completed`

- Terminal: `failed`, `cancelled`, `completed`.
- Mutation-fenced until explicit admission: `blocked`, `stopped`, `budget_limited`, `usage_limited`.
- `degraded` is not success and is not terminal; completion still requires a valid completion event and receipt.
- `replanning` is an atomic transient state used only while applying `goal.replanned`; its committed successor comes from the event's `next_action`.
- Unknown or case-variant values are invalid, not aliases.

##### 4.2 GoalRun state

`GoalRunStatus = ready | running | provisional_success | verifying | failed_verification | repairing | certified | failed | blocked | cancelled | stopped`

`certified`, `failed`, and `cancelled` are terminal. `blocked` and `stopped` are fenced, resumable only through a new revision and valid `goal_run.replanned` admission. Worker or WorkNode success produces `provisional_success`, never `certified`.

##### 4.3 Activation state

`ActivationState = activation_pending | records_materialized | entrypoints_queued | start_event_pending | active | cancelled_before_mutation`

The only successful path is the listed order. `goal_run.started` commits `start_event_pending -> active` atomically with `GoalRunStatus ready -> running`. Any failed precondition before append commits `cancelled_before_mutation`, emits no `goal_run.started`, schedules no work, and charges no usage.

#### 5. Closed domains and reusable exact shapes

##### 5.1 Enums

| Domain | Exact values |
| --- | --- |
| `ExecutionRole` | `user`, `worker`, `planner`, `evaluator`, `reducer`, `verifier`, `adjudicator`, `runtime_controller` |
| `CertificationTier` | `lightweight`, `standard`, `strong` |
| `WriteMode` | `read_only`, `proposal_only`, `patch_only`, `isolated_worktree`, `leased_writer`, `parent_writer` |
| `VerificationDecision` | `passed`, `failed`, `blocked` |
| `FinalCertifierDecision` | `certified`, `certified_with_approved_exception`, `rejected`, `blocked` |
| `CurrentnessState` | `current`, `stale`, `superseded`, `unknown` |
| `RedactionProfile` | `no_secrets`, `redacted`, `secret_refs_only` |
| `Priority` | `low`, `normal`, `high`, `critical` |
| `SchedulerReason` | `created`, `resumed`, `replanned`, `repair_cycle`, `dependency_cleared`, `capacity_available` |
| `NextAction` | `dispatch`, `await_dependency`, `await_approval`, `continue_running`, `begin_verification`, `repair`, `replan`, `resume`, `remain_paused`, `remain_blocked`, `stop`, `cancel`, `complete` |
| `InterruptionClass` | `pause_resume`, `stop_cancel`, `constraint_update`, `scope_expansion`, `scope_reduction`, `goal_replacement`, `clarifying_instruction` |
| `CheckKind` | `permission`, `precondition`, `policy`, `tool_availability`, `input_integrity`, `postcondition` |
| `CheckResult` | `passed`, `failed`, `blocked`, `unknown` |
| `PolicyDecision` | `allow`, `deny`, `approval_required`, `not_applicable` |
| `EvidenceKind` | `canonical_evidence`, `source_evidence`, `process_evidence`, `governance_evidence`, `validator_output`, `artifact_snapshot`, `log_excerpt` |
| `ReceiptKind` | `goal_completion`, `goal_degraded`, `goal_stopped`, `goal_blocked`, `goal_run_certification`, `verification`, `worknode`, `child_goal` |
| `CancelReason` | `user_cancelled`, `superseded`, `parent_cancelled`, `scope_removed`, `authority_revoked`, `activation_aborted`, `unrecoverable_blocker` |
| `StopReasonCode` | `user_stopped`, `forbidden_action`, `missing_source_ledger`, `missing_plans_or_target`, `permission_or_filesystem_failure`, `unsafe_or_destructive_scope`, `contradictory_goal`, `infrastructure_blocker`, `budget_exhausted`, `verification_terminal_failure` |
| `BlockerClass` | `authority`, `dependency`, `input`, `integrity`, `permission`, `resource`, `recovery`, `verification`, `writer_conflict` |
| `BlockedReasonCode` | `approval_required`, `permission_denied`, `missing_source_ledger`, `missing_plans_or_target`, `permission_or_filesystem_failure`, `unsafe_or_destructive_scope`, `contradictory_goal`, `infrastructure_blocker`, `budget_exhausted`, `usage_exhausted`, `verification_terminal_failure`, `verifier_unavailable`, `storage_viewer`, `storage_blocked`, `storage_root_unavailable`, `storage_root_mismatch`, `storage_integrity_unknown`, `storage_recovery_in_progress`, `storage_recovery_unavailable`, `restore_refused`, `restore_failed`, `restore_recovery_required`, `dedupe_unavailable`, `idempotency_conflict`, `revision_conflict`, `authority_boundary`, `child_settlement_incomplete`, `external_dependency_unavailable` |
| `ActionId` | `retry_same_action`, `replan`, `narrow_scope`, `request_approval`, `change_model`, `change_account`, `retry_storage`, `restore_from_mandatory_backup`, `abandon_preserved_work`, `resolve_owner_conflict`, `cancel_goal`, `stop_goal`, `resume_after_revalidation` |
| `CriterionDisposition` | `satisfied`, `unsatisfied`, `not_applicable`, `deferred` |
| `ValidatorOutcome` | `passed`, `failed`, `blocked`, `skipped` |
| `SettlementState` | `not_started`, `preserved`, `committed`, `rolled_back`, `abandoned`, `failed` |
| `ChildDecisionValue` | `continue`, `pause`, `cancel`, `resteer` |
| `ReplanDisposition` | `cancelled`, `resteered` |

`VerificationCycle.status` may share `passed | failed | blocked`, but it never determines `goal.verification_decided.decision` without a valid Goal event. Foreign enums are not widened by this table.

##### 5.2 Shapes

The following objects are `additionalProperties:false`; required fields are all listed. Optional fields are explicitly marked `?` and may be absent but not null.

| Shape | Exact fields and constraints |
| --- | --- |
| `Scope` | `{scope_kind: repository|plan_corpus|project|external_read_only, include_refs: ref_array, exclude_refs: ref_array, write_allowed: boolean}`; `external_read_only` requires `write_allowed=false`. |
| `Budget` | `{max_turns: integer>=1, max_tokens: integer>=1|null, max_wall_time_seconds: integer>=1, max_parallel_agents: integer>=0}`. |
| `ModelPolicy` | `{worker_policy_ref: ref, planner_policy_ref?: ref, evaluator_policy_ref?: ref, verifier_policy_ref?: ref, adjudicator_policy_ref?: ref, inheritance: inherit_parent|override_within_ceiling}`. Refs are resolved by Models/Multi-Account owners. |
| `Constraint` | `{constraint_id: ref, kind: positive|negative|authority|compatibility|safety, statement: non-empty string}`. |
| `Delta` | `{op: set|clear|add|remove|replace, path: non-empty JSON Pointer, before_hash?: sha256, after_hash?: sha256}`; `clear|remove` requires `before_hash`; `set|add` requires `after_hash`; `replace` requires both. |
| `TaskDelta` | `{added_task_ids: ref_array, updated_task_ids: ref_array, completed_task_ids: ref_array, removed_task_ids: ref_array}`; union must be non-empty and members disjoint. |
| `ArtifactHash` | `{artifact_ref: ref, sha256: lowercase 64-hex}`. |
| `NoProgressMarker` | `{blocker_signature: non-empty string, unchanged_artifact_hashes: array<ArtifactHash>, continuation_count: integer>=2}`. |
| `SourceSpan` | `{source_ref: ref, locator_kind: line_range|json_pointer|artifact_fragment, start_line?: integer>=1, end_line?: integer>=1, json_pointer?: non-empty string, fragment?: non-empty string}`; exactly the locator fields for the selected kind are present and `end_line>=start_line`. |
| `ValidatorOutput` | `{validator_id: ref, outcome: ValidatorOutcome, evidence_ref?: ref, reason_code?: non-empty string, waiver_ref?: ref}`; `passed` requires `evidence_ref`; `failed|blocked` requires `reason_code`; `skipped` requires `reason_code`, and certified success additionally requires `waiver_ref`. |
| `CriterionDispositionRecord` | `{criterion_id: ref, disposition: CriterionDisposition, evidence_refs: ref_array, reason?: non-empty string}`; `satisfied` requires non-empty evidence; all other dispositions require `reason`. |
| `ChildDecision` | `{child_goal_id: ref, decision: ChildDecisionValue, reason: non-empty string, new_scope?: Scope}`; `new_scope` is required only for `resteer` and forbidden otherwise. |
| `SettlementRecord` | `{subject_ref: ref, settlement_state: SettlementState, receipt_ref?: ref}`; `committed|rolled_back|abandoned` requires `receipt_ref`. Fields named `*_settlement_refs` point to these owner records and do not embed them. |
| `AcceptanceCriteria` | array of `{criterion_id: ref, statement: non-empty string}`, `minItems:1`, unique by `criterion_id`. |

Hashes are SHA-256 over canonical bytes defined by the owning artifact contract. This matrix chooses only the lowercase 64-hex wire representation, not the foreign canonicalization algorithm.

#### 6. Machine-oriented 21-row materialization table

Every row uses family revision `2.0.0`, registry `scope_policy=project_only`, payload root pointer `#`, event payload pointer `#/$defs/event_payload`, registry redaction `{mode:"reject_unhandled_secrets",transform_id:null,transform_version:null}`, and replay `dedupe_by_idempotency_key`. `identity` supplies the ordered event-semantic tuple appended after the common identity tuple in Section 7.

| Obligation | Event / alias | Family ID | Row schema ID | Row path | Ordered semantic identity |
| --- | --- | --- | --- | --- | --- |
| `EA-UND-0001-GOAL` | `goal.blocked` | `event-family-goal-blocked` | `pm.goal_runtime_event.goal_blocked.schema.v2` | `Plans/event_payloads/goal_runtime/goal_blocked.schema.json` | `blocker_class,blocked_reason_code,cause.cause_code,affected_scope.scope_kind` |
| `EA-UND-0002-GOAL` | `goal.cancelled` | `event-family-goal-cancelled` | `pm.goal_runtime_event.goal_cancelled.schema.v2` | `Plans/event_payloads/goal_runtime/goal_cancelled.schema.json` | `cancel_reason,cancellation_scope.scope_kind,mutation_started` |
| `EA-UND-0003-GOAL` | `goal.child_status_changed` | `event-family-goal-child-status-changed` | `pm.goal_runtime_event.goal_child_status_changed.schema.v2` | `Plans/event_payloads/goal_runtime/goal_child_status_changed.schema.json` | `child_goal_id,previous_status,next_status` |
| `EA-UND-0004-GOAL` | `goal.completed` | `event-family-goal-completed` | `pm.goal_runtime_event.goal_completed.schema.v2` | `Plans/event_payloads/goal_runtime/goal_completed.schema.json` | `completion_receipt_ref,final_certifier_decision` |
| `EA-UND-0005-GOAL` | `goal.created` | `event-family-goal-created` | `pm.goal_runtime_event.goal_created.schema.v2` | `Plans/event_payloads/goal_runtime/goal_created.schema.json` | `goal_id,goal_revision,agent_control_envelope_hash` |
| `EA-UND-0006-GOAL` | `goal.degraded` | `event-family-goal-degraded` | `pm.goal_runtime_event.goal_degraded.schema.v2` | `Plans/event_payloads/goal_runtime/goal_degraded.schema.json` | `degraded_reason,affected_scope.scope_kind` |
| `EA-UND-0007-GOAL` | `goal.evidence_captured` | `event-family-goal-evidence-captured` | `pm.goal_runtime_event.goal_evidence_captured.schema.v2` | `Plans/event_payloads/goal_runtime/goal_evidence_captured.schema.json` | `evidence_ref,evidence_kind,content_hash` |
| `EA-UND-0008-GOAL` | `goal.progressed` | `event-family-goal-progressed` | `pm.goal_runtime_event.goal_progressed.schema.v2` | `Plans/event_payloads/goal_runtime/goal_progressed.schema.json` | `progress_fingerprint,status_before,status_after` |
| `EA-UND-0009-GOAL` | `goal.receipt_recorded` | `event-family-goal-receipt-recorded` | `pm.goal_runtime_event.goal_receipt_recorded.schema.v2` | `Plans/event_payloads/goal_runtime/goal_receipt_recorded.schema.json` | `receipt_id,receipt_kind,certifier_decision` |
| `EA-UND-0010-GOAL` | `goal.replanned` | `event-family-goal-replanned` | `pm.goal_runtime_event.goal_replanned.schema.v2` | `Plans/event_payloads/goal_runtime/goal_replanned.schema.json` | `interruption_class,new_revision,next_action` |
| `EA-UND-0011-GOAL` | `goal.scheduled` | `event-family-goal-scheduled` | `pm.goal_runtime_event.goal_scheduled.schema.v2` | `Plans/event_payloads/goal_runtime/goal_scheduled.schema.json` | `scheduler_reason,eligible_at_utc,queue_id-or-empty,next_action` |
| `EA-UND-0012-GOAL` | `goal.stopped` | `event-family-goal-stopped` | `pm.goal_runtime_event.goal_stopped.schema.v2` | `Plans/event_payloads/goal_runtime/goal_stopped.schema.json` | `stop_reason_code,interruption_boundary,resumable` |
| `EA-UND-0013-GOAL` | `goal.tool_check_recorded` | `event-family-goal-tool-check-recorded` | `pm.goal_runtime_event.goal_tool_check_recorded.schema.v2` | `Plans/event_payloads/goal_runtime/goal_tool_check_recorded.schema.json` | `tool_call_id,check_kind,check_result,policy_decision` |
| `EA-UND-0014-GOAL` | `goal.updated` | `event-family-goal-updated` | `pm.goal_runtime_event.goal_updated.schema.v2` | `Plans/event_payloads/goal_runtime/goal_updated.schema.json` | `previous_revision,new_revision` |
| `EA-UND-0015-GOAL` | `goal.verification_decided` | `event-family-goal-verification-decided` | `pm.goal_runtime_event.goal_verification_decided.schema.v2` | `Plans/event_payloads/goal_runtime/goal_verification_decided.schema.json` | `verification_cycle_id-or-audit_cycle_id,decision,verifier_ref` |
| `EA-UND-0016-GOAL` | `goal_run.blocked` | `event-family-goal-run-blocked` | `pm.goal_runtime_event.goal_run_blocked.schema.v2` | `Plans/event_payloads/goal_runtime/goal_run_blocked.schema.json` | `goal_run_id,blocked_reason_code,block_receipt_ref` |
| `EA-UND-0017-GOAL` | `goal_run.cancelled` | `event-family-goal-run-cancelled` | `pm.goal_runtime_event.goal_run_cancelled.schema.v2` | `Plans/event_payloads/goal_runtime/goal_run_cancelled.schema.json` | `goal_run_id,cancel_reason,mutation_started` |
| `EA-UND-0018-GOAL` | `goal_run.certified` | `event-family-goal-run-certified` | `pm.goal_runtime_event.goal_run_certified.schema.v2` | `Plans/event_payloads/goal_runtime/goal_run_certified.schema.json` | `goal_run_id,certification_receipt_ref,final_certifier_decision` |
| `EA-UND-0019-GOAL` | `goal_run.replanned` | `event-family-goal-run-replanned` | `pm.goal_runtime_event.goal_run_replanned.schema.v2` | `Plans/event_payloads/goal_runtime/goal_run_replanned.schema.json` | `goal_run_id,replan_generation,new_workgraph_ref,next_action` |
| `EA-UND-0020-GOAL` | `goal_run.started`; legacy alias `GoalRunStarted` | `event-family-goal-run-started` | `pm.goal_runtime_event.goal_run_started.schema.v2` | `Plans/event_payloads/goal_runtime/goal_run_started.schema.json` | `goal_run_id,workgraph_ref,activation_receipt_ref` |
| `EA-UND-0021-GOAL` | `goal_run.stopped` | `event-family-goal-run-stopped` | `pm.goal_runtime_event.goal_run_stopped.schema.v2` | `Plans/event_payloads/goal_runtime/goal_run_stopped.schema.json` | `goal_run_id,stop_reason_code,resumable` |

`GoalRunStarted` normalizes only to `goal_run.started` before registry dispatch and retains original alias evidence. `BuildStarted` is not an alias and is rejected. No other aliases are admitted.

#### 7. Replay, idempotency, and redaction

##### 7.1 Exact idempotency construction

For each new write, the producer computes:

```text
idempotency_key =
  "pm.goal-runtime-event.v2:" +
  lower_hex(sha256(JCS([
    "pm.goal-runtime-event-idempotency.v2",
    scope_partition,
    event_name,
    project_id,
    goal_id,
    goal_revision,
    ...ordered_row_semantic_identity
  ])))
```

`JCS` means RFC 8785 JSON canonicalization. `scope_partition` is the reversible Storage-owned partition resolved from the exact `project_id`; this matrix does not create a second partition algorithm. Optional identity positions use the literal empty string when absent, never null. The inner `idempotency_key`, when present, must byte-equal the outer key.

The lifetime identity domain is `(scope_partition,event_type,idempotency_key)`:

- first valid append stores one EventRecord and applies one legal transition;
- same identity and same EventRecord application-data digest returns the original `event_id`, receipt, sequence, and transition result without a second append or side effect;
- same identity with a different digest returns `idempotency_conflict`, appends nothing, and applies no transition;
- stale or unavailable dedupe state must catch up through the verified log tail; if that cannot be proven, return `dedupe_unavailable`, append nothing, expose no intended state, schedule nothing, and certify nothing;
- a different idempotency key does not bypass CAS: stale `expected_goal_revision` returns `revision_conflict` and appends nothing.

Replay of a valid v2 event may rebuild only registered disposable projections. Replay never re-emits an event, repeats a provider/tool call, grants permission, schedules work, charges usage, changes a canonical receipt, or clears a recovery/permission block. Unknown schema ID, unknown enum, wrong const, illegal state edge, failed identity join, unresolved conditional, or unhandled secret is quarantined without checkpoint advance.

##### 7.2 Redaction

Raw passwords, tokens, credentials, API keys, OAuth values, local-machine secrets, or secret-bearing tool output are forbidden in every common or row field. Secret material is represented only by an owner-issued opaque ref. `redacted` requires the owning evidence/receipt record to preserve the redaction reason and provenance; `secret_refs_only` permits only opaque secret references and non-secret metadata. Registry transforms remain null because the writer must reject unhandled secrets before append rather than rely on a post-write transform.

#### 8. Per-row exact payload and transition matrix

Notation: `R{}` fields are required, `O{}` are optional-but-non-null, `F{}` are forbidden, `[]` is an array, `ref` is a non-empty opaque ref, `text` is a non-empty string, `u32` is an integer `>=0`, and `u32+` is an integer `>=1`. Every row inherits Section 3 and `D-CAS-01`. Every row payload is closed.

##### `EA-UND-0001-GOAL` — `goal.blocked` (`D-R01`)

- Fields: `R{blocker_class:BlockerClass, blocked_reason_code:BlockedReasonCode, cause:{cause_code:BlockedReasonCode,detail_ref?:ref}, affected_scope:Scope, autonomous_recovery_stop_reason:text, next_safe_action:ActionId, allowed_action_ids:ActionId[]}`; `O{last_recovery_attempt_ref:ref}`. `allowed_action_ids` is non-empty, unique, and contains `next_safe_action`.
- Branches: permission outcomes require `blocker_class=permission`, at least one `block_ref`, and preserve the permission-owned evidence ref; Storage/recovery outcomes require `blocker_class=integrity|recovery`, exact recovery evidence in `evidence_refs`, and may offer only actions valid for that owner. `retry_storage` is an admission probe, never repair or auto-resume. `try_anyway`, `force_open`, generic `salvage`, and generic `repair` are forbidden action values.
- Transition: any nonterminal Goal state except `replanning` -> `blocked`; `blocked -> blocked` is legal only for a new revision with changed blocker evidence, action set, or recovery attempt. No transition may promote unknown recovery truth to degraded or completed.
- Basis: `C-GRS-MIN`, `C-GRS-LIFE`, `D-DOMAIN-01`, `D-R01`.

##### `EA-UND-0002-GOAL` — `goal.cancelled` (`D-R02`)

- Fields: `R{cancel_reason:CancelReason, mutation_started:boolean, cancellation_scope:Scope, settlement_refs:ref[]}`; `O{rollback_refs:ref[]}`.
- Branches: `mutation_started=false` requires empty `settlement_refs` and forbids `rollback_refs`; `mutation_started=true` requires non-empty `settlement_refs`, while `rollback_refs`, if present, is non-empty. Cancellation never asserts rollback success merely because refs exist; the referenced settlement records carry outcomes.
- Transition: any nonterminal Goal state, including `blocked` or `stopped`, -> `cancelled`; terminal source states are illegal. Append commits only after required child/tool/write settlements are durable.
- Basis: `C-GRS-MIN`, `C-GRS-LIFE`, `D-DOMAIN-01`, `D-R02`.

##### `EA-UND-0003-GOAL` — `goal.child_status_changed` (`D-R03`)

Historical interpretation only under GRS-060: the following original fields and transitions preserve source semantics without admitting a current child Goal writer, topology or state transition. DL-039 schema authority is unchanged.

- Fields: `R{child_goal_id:ref, previous_status:GoalStatus, next_status:GoalStatus}`; `O{child_agent_lease_id:ref,result_ref:ref,receipt_ref:ref,parent_action_required:boolean}`.
- Branches: `previous_status != next_status`; `next_status=completed` requires `receipt_ref`; `next_status=failed|blocked|degraded` requires `result_ref` or `receipt_ref`; `parent_action_required` defaults by absence to false. The child cannot set the parent complete.
- Transition: parent state is preserved (`S -> S`) for any nonterminal parent state. A separate parent `goal.replanned`, `goal.blocked`, `goal.verification_decided`, or `goal.completed` event is required for parent-state change. A child transition must itself be legal under the Goal state table.
- Basis: `C-GRS-MIN`, `C-GRS-LIFE` (`GRS-016`), `D-STATE-01`, `D-R03`.

##### `EA-UND-0004-GOAL` — `goal.completed` (`D-R04`)

- Fields: `R{completion_receipt_ref:ref, acceptance_criteria_disposition:CriterionDispositionRecord[], changed_artifact_refs:ref[], validator_outputs:ValidatorOutput[], final_certifier_decision:FinalCertifierDecision}`.
- Branches: dispositions are non-empty and cover each goal criterion exactly once; only `satisfied|not_applicable` are admitted; `unsatisfied|deferred` are forbidden. Decision is `certified|certified_with_approved_exception`; `rejected|blocked` are forbidden. `certified` permits no failed/blocked validator and permits skipped only with `waiver_ref`; `certified_with_approved_exception` additionally requires non-empty `approval_refs` and exception evidence. The canonical completion receipt must already exist and validate; projections or worker claims cannot substitute.
- Transition: `verifying -> completed`; `degraded -> completed` only for `certified_with_approved_exception`; all other sources are illegal. Atomic projection may follow only receipt and event durability.
- Basis: `C-GRS-MIN`, `C-GRS-LIFE` (`GRS-012..014`, `GRS-042`), `D-R04`.

##### `EA-UND-0005-GOAL` — `goal.created` (`D-R05`)

- Fields: `R{objective:text, acceptance_criteria:AcceptanceCriteria, non_goals:text[], allowed_scope:Scope, constraints:Constraint[], budget:Budget, attachment_refs:ref[], model_policy:ModelPolicy, agent_control_envelope_ref:ref, agent_control_envelope_hash:sha256}`; `F{expected_goal_revision}`.
- Branches: `goal_revision=1`; no prior Goal with `goal_id` may exist; `agent_control_envelope_hash` must verify the referenced immutable envelope; `allowed_scope.write_allowed=true` requires authority evidence in `approval_refs` or the referenced envelope. `non_goals`, `constraints`, and `attachment_refs` may be empty.
- Transition: pseudo-state `absent -> created`. Any extant Goal, tombstone, or unresolved canonical identity conflict rejects the append.
- Basis: `C-GRS-MIN`, `C-GRS-LIFE` (`GRS-001..005`, `GRS-035`), `D-CAS-01`, `D-R05`.

##### `EA-UND-0006-GOAL` — `goal.degraded` (`D-R06`)

Historical interpretation only under GRS-061: the following exact fields, branches and state edges preserve original semantics but admit no current Goal writer or transition. DL-039 schema authority is unchanged.

- Fields: `R{degraded_reason:verifier_unavailable|optional_check_unavailable|evidence_incomplete|canonical_gap|recovery_provenance|provider_fallback|partial_scope, affected_scope:Scope, residual_risk_refs:ref[], allowed_actions:ActionId[]}`; `O{exception_refs:ref[],approval_refs:ref[]}`.
- Branches: `residual_risk_refs` and `allowed_actions` are non-empty. Strong certification cannot degrade for unavailable verifier or a required check and must use `goal.blocked`. Standard may degrade only when no mutation or required check is affected. Any exception requires non-empty `exception_refs`; risk acceptance requires non-empty payload `approval_refs`, which must be a subset of common `approval_refs`.
- Transition: `created|scheduled|running|paused|verifying|repairing -> degraded`; `degraded -> degraded` requires changed risk/currentness evidence. `blocked`, `stopped`, limit, and terminal states cannot silently degrade.
- Basis: `C-GRS-MIN`, `C-GRS-LIFE` (`GRS-013..014`, `GRS-042`), `D-R06`.

##### `EA-UND-0007-GOAL` — `goal.evidence_captured` (`D-R07`)

- Fields: `R{evidence_ref:ref,evidence_kind:EvidenceKind,source_spans:SourceSpan[],content_hash:sha256,currentness_state:CurrentnessState,redaction_profile:RedactionProfile}`; `O{snapshot_ref:ref,retention_policy_ref:ref}`.
- Branches: `source_spans` is non-empty except `evidence_kind=validator_output`, where a validator-owned evidence ref is sufficient; `artifact_snapshot` requires `snapshot_ref`; `redaction_profile` must equal the outer profile. `retention_policy_ref` is an opaque optional ref only: this matrix selects no retention ID, default, fallback, or branch.
- Transition: preserves any nonterminal Goal state. `currentness_state=unknown` may be recorded but cannot satisfy verification or completion. Evidence captured after a terminal state is rejected rather than mutating certified history.
- Basis: `C-GRS-MIN`, `C-GRS-LIFE` (`GRS-008..012`, Case L), `D-REDACT-01`, `D-R07`.

##### `EA-UND-0008-GOAL` — `goal.progressed` (`D-R08`)

- Fields: `R{progress_fingerprint:sha256,task_delta:TaskDelta,status_before:GoalStatus,status_after:GoalStatus,artifact_hashes:ArtifactHash[]}`; `O{repeat_count:u32+,no_progress_marker:NoProgressMarker}`.
- Branches: allowed pairs are `scheduled->running`, `running->running`, `repairing->repairing`, and `repairing->verifying`. `status_before` must equal current state and `status_after` the committed successor. `repeat_count` absent means first observation; value `>=2` requires `no_progress_marker` with matching continuation count. Presence of `no_progress_marker` requires `repeat_count>=2`. A repeated fingerprint cannot hide unchanged artifacts.
- Transition: exactly the declared allowed pair. A blocked, stopped, failed, cancelled, or completed result requires its named event, not `goal.progressed`.
- Basis: `C-GRS-MIN`, `C-GRS-LIFE` (`GRS-006`, `GRS-015`), `D-R08`.

##### `EA-UND-0009-GOAL` — `goal.receipt_recorded` (`D-R09`)

- Fields: `R{receipt_id:ref,receipt_kind:ReceiptKind,certification_tier:CertificationTier,validator_outputs:ValidatorOutput[],child_receipt_refs:ref[],worknode_receipt_refs:ref[],certifier_decision:FinalCertifierDecision}`.
- Branches: referenced receipt must exist and validate before append. `certifier_decision=certified` permits no failed/blocked output; `certified_with_approved_exception` requires approval and residual-risk evidence; `rejected|blocked` requires a reason/evidence ref and cannot be treated as completion. Child/worknode receipt refs may be empty but are complete for the receipt's declared dependency set.
- Transition: preserves `running|verifying|repairing|degraded|blocked`; terminal states and `created|scheduled|paused|stopped` reject the event. Recording a receipt changes the evidence index only; it does not certify the Goal.
- Basis: `C-GRS-MIN`, `C-GRS-LIFE` (`GRS-012..014`, `GRS-026..027`, `GRS-042`), `D-R09`.

##### `EA-UND-0010-GOAL` — `goal.replanned` (`D-R10`)

- Fields: `R{interruption_class:InterruptionClass,impact_summary:text,affected_child_goal_ids:ref[],affected_worknode_refs:ref[],child_decisions:ChildDecision[],remaining_evidence_refs:ref[],new_revision:u32+,next_action:NextAction}`.
- Branches: `new_revision=goal_revision`; each affected child appears exactly once in `child_decisions`, and no unlisted child decision is present. Remaining evidence must be revalidated current. Allowed `next_action` is `continue_running|remain_paused|remain_blocked|stop|cancel|begin_verification|repair`; other `NextAction` values are forbidden for this row.
- Transition: current `scheduled|running|paused|repairing|degraded|blocked|stopped -> replanning ->` committed successor: `continue_running=>running`, `remain_paused=>paused`, `remain_blocked=>blocked`, `stop=>stopped`, `cancel=>cancelled`, `begin_verification=>verifying`, `repair=>repairing`. Terminal and limit sources are illegal.
- Basis: `C-GRS-MIN`, `C-GRS-LIFE` (`GRS-007`, `GRS-016`, `GRS-026`), `D-R10`.

##### `EA-UND-0011-GOAL` — `goal.scheduled` (`D-R11`)

Historical interpretation only under GRS-062: the exact following fields, branches and transition preserve original semantics without current writer, dispatch or scheduled Goal-state admission. Current run scheduling remains with its actual owners. DL-039 schema authority is unchanged.

- Fields: `R{scheduler_reason:SchedulerReason,eligible_at_utc:date-time,priority:Priority,budget_snapshot_ref:ref,next_action:NextAction}`; `O{queue_id:ref}`.
- Branches: allowed `next_action` is `dispatch|await_dependency|await_approval`; `dispatch` requires `eligible_at_utc<=append observed_at_utc`, `queue_id`, writer-capable storage, current permission evidence, resolved recovery truth, and remaining budget. Waiting actions may omit `queue_id` and do not dispatch.
- Transition: `created|paused|blocked|stopped -> scheduled`; blocked/stopped sources additionally require explicit owner-admitted recovery/revalidation evidence. Limit and terminal sources are illegal.
- Basis: `C-GRS-MIN`, `C-GRS-LIFE` (`GRS-006`, `GRS-015`, `GRS-043`), `D-R11`.

##### `EA-UND-0012-GOAL` — `goal.stopped` (`D-R12`)

- Fields: `R{stop_reason_code:StopReasonCode,interruption_boundary:before_mutation|at_safe_point|after_mutation_before_settlement|after_settlement,child_settlement_refs:ref[],tool_settlement_refs:ref[],resumable:boolean}`; `O{safe_point_ref:ref}`.
- Branches: `resumable=true` requires `safe_point_ref`, settled child/tool refs, and current recovery/authority evidence. `before_mutation` requires empty settlement arrays and forbids `safe_point_ref`. `after_mutation_before_settlement` requires `resumable=false` and non-empty settlement evidence describing the incomplete boundary. `at_safe_point|after_settlement` may be resumable only after owner validation.
- Transition: any nonterminal active or fenced state except `replanning` -> `stopped`; `stopped -> stopped` requires a materially new settlement/recovery boundary. Stop is not cancellation or completion.
- Basis: `C-GRS-MIN`, `C-GRS-LIFE` (`GRS-002`, `GRS-015`, `GRS-034`, `GRS-043`), `D-R12`.

##### `EA-UND-0013-GOAL` — `goal.tool_check_recorded` (`D-R13`)

- Fields: `R{tool_call_id:ref,tool_name:text,check_kind:CheckKind,check_result:CheckResult,policy_decision:PolicyDecision}`; `O{output_ref:ref,log_ref:ref}`.
- Branches: `passed` with `allow|not_applicable` requires `output_ref` or `log_ref`; `failed|blocked|unknown` requires `log_ref`; `approval_required` requires a common approval/block ref and cannot have `check_result=passed`; `deny` cannot have `check_result=passed`. Tool output is always by ref, never embedded.
- Transition: preserves `scheduled|running|verifying|repairing|degraded|blocked`; a state-changing consequence requires a subsequent named event. Terminal states reject the append.
- Basis: `C-GRS-MIN`, `C-GRS-LIFE` (`GRS-009..011`, `GRS-020`), `D-REDACT-01`, `D-R13`.

##### `EA-UND-0014-GOAL` — `goal.updated` (`D-R14`)

- Fields: `R{previous_revision:u32+,new_revision:u32+,active_child_goal_ids:ref[],stale_child_goal_ids:ref[]}`; `O{objective_delta:Delta,scope_delta:Delta,constraint_delta:Delta,budget_delta:Delta}`.
- Branches: `previous_revision=expected_goal_revision`, `new_revision=goal_revision=previous_revision+1`; at least one delta is present; active and stale child sets are disjoint. A material scope/constraint/objective change requiring work invalidation must be followed by `goal.replanned`; this event alone does not steer child work.
- Transition: preserves `created|scheduled|running|paused|repairing|degraded|blocked|stopped`; `verifying`, limits, and terminal states reject updates. If stale children are non-empty, dependent dispatch stays fenced pending replan.
- Basis: `C-GRS-MIN`, `C-GRS-LIFE` (`GRS-006..007`, `GRS-016`), `D-R14`.

##### `EA-UND-0015-GOAL` — `goal.verification_decided` (`D-R15`)

- Fields: `R{decision:VerificationDecision,verifier_ref:ref,finding_refs:ref[],closure_refs:ref[],unresolved_risk_refs:ref[]}`; `O{audit_cycle_id:ref,verification_cycle_id:ref,adjudicator_ref:ref}`.
- Branches: at least one cycle ID is present. `passed` requires empty findings and unresolved risks plus non-empty closure/evidence proof; `failed` requires non-empty findings; `blocked` requires non-empty unresolved risks and block refs. Strong-tier third repeated failure requires `adjudicator_ref`; a VerificationCycle status never creates this decision implicitly.
- Transition: `running|repairing -> verifying` on `passed`; `verifying|repairing -> repairing` on `failed`; `running|verifying|repairing -> blocked` on `blocked`. `passed` does not complete the Goal; `goal.completed` remains required.
- Basis: `C-GRS-MIN`, `C-GRS-LIFE` (`GRS-012..015`, `GRS-027`), `D-R15`.

##### `EA-UND-0016-GOAL` — `goal_run.blocked` (`D-R16`)

- Fields: `R{goal_run_id:ref,blocked_reason_code:BlockedReasonCode,blocked_scope:Scope,allowed_action_ids:ActionId[],preserved_work_refs:ref[],block_receipt_ref:ref}`.
- Branches: allowed actions are non-empty and owner-valid; permission/recovery branches carry the same restrictions as `D-R01`. `preserved_work_refs` may be empty only when no mutation began. Block receipt must exist before append.
- Transition: `ready|running|provisional_success|verifying|failed_verification|repairing -> blocked`; `blocked -> blocked` requires new evidence/action/recovery revision. Certified/failed/cancelled/stopped sources are illegal.
- Basis: `C-GRS-MIN`, `C-GRS-LIFE` (`GRS-026..027`, `GRS-043`), `D-R16`.

##### `EA-UND-0017-GOAL` — `goal_run.cancelled` (`D-R17`)

- Fields: `R{goal_run_id:ref,cancel_reason:CancelReason,mutation_started:boolean,settlement_refs:ref[]}`; `O{rollback_refs:ref[]}`.
- Branches: identical mutation/settlement branch to `D-R02`. `activation_aborted` requires `mutation_started=false` and ActivationState `cancelled_before_mutation`.
- Transition: any nonterminal GoalRun state, including `blocked|stopped`, -> `cancelled`; terminal sources are illegal. Settlement is durable before append.
- Basis: `C-GRS-MIN`, `C-GRS-LIFE` (`GRS-026`, `GRS-031`, `GRS-034`), `D-R17`.

##### `EA-UND-0018-GOAL` — `goal_run.certified` (`D-R18`)

- Fields: `R{goal_run_id:ref,certification_receipt_ref:ref,validator_outputs:ValidatorOutput[],worknode_receipt_refs:ref[],unresolved_risk_refs:ref[],final_certifier_decision:FinalCertifierDecision}`.
- Branches: decision is only `certified|certified_with_approved_exception`. `certified` requires empty unresolved risks and no failed/blocked validators; skipped validators require waivers. Exception certification requires non-empty unresolved risks, approval refs, and receipt-recorded exception authority. All required WorkNode receipts must be present; worker success alone is insufficient.
- Transition: `provisional_success|verifying -> certified`; all other sources are illegal. Receipt durability precedes event append, and projection follows append.
- Basis: `C-GRS-MIN`, `C-GRS-LIFE` (`GRS-026..027`, `GRS-030`, `GRS-042`), `D-R18`.

##### `EA-UND-0019-GOAL` — `goal_run.replanned` (`D-R19`)

- Fields: `R{goal_run_id:ref,previous_workgraph_ref:ref,new_workgraph_ref:ref,replan_generation:u32+,affected_worknode_refs:ref[],cancelled_or_resteered_refs:ref[],next_action:NextAction}`.
- Branches: workgraph refs differ; generation is previous generation + 1; each affected WorkNode has exactly one referenced `cancelled|resteered` disposition record. Allowed action is `continue_running|repair|remain_blocked|stop|cancel|begin_verification`.
- Transition: `running|provisional_success|verifying|failed_verification|repairing|blocked|stopped ->` successor by action: `continue_running=>running`, `repair=>repairing`, `remain_blocked=>blocked`, `stop=>stopped`, `cancel=>cancelled`, `begin_verification=>verifying`. `ready` and terminal sources are illegal.
- Basis: `C-GRS-MIN`, `C-GRS-LIFE` (`GRS-026..027`), `D-R19`.

##### `EA-UND-0020-GOAL` — `goal_run.started` (`D-R20`)

- Fields: `R{goal_run_id:ref,workgraph_ref:ref,activation_receipt_ref:ref,active_worknode_request_refs:ref[],write_mode:WriteMode,certification_tier:CertificationTier}`.
- Branches: active requests are non-empty and exactly the required accepted request set; activation receipt proves records materialized, entrypoints queued, permission/write authority, provider/model/account resolution, budget, parallelism policy, and writer-capable storage. `read_only|proposal_only` cannot activate mutation WorkNodes. Alias handling is Section 6; `BuildStarted` is forbidden.
- Transition: ActivationState `start_event_pending -> active` and GoalRun `ready -> running` in one append/commit. Any failed guard goes to `cancelled_before_mutation` with no started event, work dispatch, provider call, or usage charge.
- Basis: `C-GRS-MIN`, `C-GRS-LIFE` (`GRS-026`, `GRS-031`), `D-R20`.

##### `EA-UND-0021-GOAL` — `goal_run.stopped` (`D-R21`)

- Fields: `R{goal_run_id:ref,stop_reason_code:StopReasonCode,child_settlement_refs:ref[],resumable:boolean}`; `O{safe_point_ref:ref}`.
- Branches: `resumable=true` requires `safe_point_ref`, all child settlements, current storage/restore/permission evidence, and no unresolved mutation fence. `resumable=false` forbids future resume without a distinct replan that proves changed admission conditions.
- Transition: `ready|running|provisional_success|verifying|failed_verification|repairing|blocked -> stopped`; `stopped -> stopped` requires new settlement/recovery evidence. Certified/failed/cancelled sources are illegal.
- Basis: `C-GRS-MIN`, `C-GRS-LIFE` (`GRS-026`, `GRS-034`, `GRS-043`), `D-R21`.

#### Goal Runtime v2 event acceptance oracles

These 21 positive/negative pairs are normative oracle prose, not executable artifacts. They are carried into this named non-generated owner subsection and mirrored as consumer expectations at the Goal Runtime event-contract anchor in `Plans/Automated_Testing_System.md`. The self-contained row schemas make their structural clauses machine-decidable, but this transaction does not produce executable inputs or modify any checker. Any transition, side-effect, replay, authority, or currentness clause not already covered by a pre-existing read-only check is honestly `NON_EXECUTABLE_UNDER_THIS_TRANSACTION`.

Each positive oracle describes validation of the outer EventRecord, exact row schema ID/root, common joins, row branch, current state/revision, idempotency behavior, and resulting projection. Each negative oracle requires: schema failure or named failure result, zero append, zero checkpoint advance, zero state transition, zero downstream side effect, and no receipt/certification promotion.

| Obligation | Positive oracle | Negative oracle |
| --- | --- | --- |
| `EA-UND-0001-GOAL` | Append a permission block with exact permission evidence, ordered action IDs containing `request_approval`, and matching CAS; projection becomes `blocked` and exposes the exact cause/safe action. | Reject unknown blocker/reason/action, missing cause/scope, action set not containing next action, generic `try_anyway`, or block from a terminal state. |
| `EA-UND-0002-GOAL` | Cancel a running mutated Goal only after referenced settlements are durable; projection becomes terminal `cancelled`. | Reject `mutation_started=false` with rollback refs, true with empty settlement refs, missing cancellation scope, or cancellation of terminal Goal. |
| `EA-UND-0003-GOAL` | Record a child `running->completed` edge with receipt ref; parent revision advances while parent status remains unchanged. | Reject equal/unknown child states, completed child without receipt, illegal child edge, or any attempt to set parent completion in this payload. |
| `EA-UND-0004-GOAL` | From `verifying`, validate canonical completion receipt, exhaustive satisfied/not-applicable criteria, passing/waived validators, then commit `completed`. | Reject missing/corrupt receipt, unsatisfied/deferred criterion, failed/blocked/unwaived skipped validator, worker claim, projection substitute, or wrong source state. |
| `EA-UND-0005-GOAL` | Create previously absent Goal at revision 1 with verified control-envelope hash, non-empty criteria, exact scope/budget/model policy; projection is `created`. | Reject expected revision, revision other than 1, duplicate Goal ID, hash mismatch, null optional, unknown enum, or write scope without authority evidence. |
| `EA-UND-0006-GOAL` | Record a standard-tier no-mutation optional-check degradation with risks/actions and exception evidence; projection is `degraded`, not success. | Reject empty risks/actions, strong-tier required-check degradation, missing exception/approval proof, degradation from a fenced/terminal state, or any completion claim. |
| `EA-UND-0007-GOAL` | Capture current source evidence with valid span/hash and matching outer/inner redaction; evidence index advances while state is preserved. | Reject wrong hash syntax, invalid locator branch, artifact snapshot without snapshot ref, raw secret, redaction mismatch, unknown currentness used as proof, or any retention value invented by fallback. |
| `EA-UND-0008-GOAL` | Append `scheduled->running` with a non-empty task delta and artifact hashes; second identical fingerprint includes repeat count/marker and remains visible. | Reject disallowed state pair, empty task delta, repeat>=2 without marker, marker with repeat<2, stale status_before, or use of progressed to claim blocked/completed. |
| `EA-UND-0009-GOAL` | Record a validated verification or completion receipt with complete child/WorkNode refs and passing outputs; state remains unchanged. | Reject missing receipt, invalid certifier enum, certified decision with failed output, exception without approval, incomplete declared dependency receipts, or treating receipt-recorded as Goal completion. |
| `EA-UND-0010-GOAL` | Replan running Goal for scope reduction, decide every affected child, preserve only revalidated evidence, and commit `running` at the new revision. | Reject new revision mismatch, missing/extra child decision, unknown interruption/action, stale evidence, terminal/limit source, or child steering without referenced disposition. |
| `EA-UND-0011-GOAL` | Schedule a created Goal with `dispatch`, due eligibility, queue, budget snapshot, writer storage, current permission, and resolved recovery truth. | Reject dispatch without queue/due time/admission evidence, unknown priority/reason/action, stale CAS, viewer/blocked storage, unknown recovery, or scheduling a terminal Goal. |
| `EA-UND-0012-GOAL` | Stop a running Goal at a validated safe point after durable child/tool settlement, with `resumable=true`; projection is fenced `stopped`. | Reject resumable without safe point, before-mutation with settlements, unsettled after-mutation as resumable, unknown stop reason/boundary, or treating stop as cancellation/completion. |
| `EA-UND-0013-GOAL` | Record a permission check `blocked/approval_required` by output/log refs and block evidence; state is preserved pending named block event. | Reject embedded tool output/secret, failed/unknown without log, approval-required without evidence, deny+passed, unknown check enum, or direct state mutation. |
| `EA-UND-0014-GOAL` | Apply one exact scope delta with previous/new revision relation, mark affected child stale, and fence dispatch pending replan. | Reject zero deltas, revision mismatch, child in active and stale sets, malformed delta branch, update during verifying/terminal, or implicit child re-steer. |
| `EA-UND-0015-GOAL` | Record passed verification with cycle ID, verifier, closures, no findings/risks; projection is `verifying` and still awaits completion event. | Reject no cycle ID, passed with findings/risks, failed without finding, blocked without risk/block evidence, third repeated strong failure without adjudicator, or implicit completion. |
| `EA-UND-0016-GOAL` | Block a running GoalRun with validated block receipt, preserved work, exact scope and owner-valid action set; projection becomes `blocked`. | Reject missing receipt, empty actions, invalid recovery action, preserved mutation omitted, blocked update with no new evidence, or block from terminal/stopped run. |
| `EA-UND-0017-GOAL` | Cancel a running mutated GoalRun after durable settlement/rollback evidence; projection becomes terminal `cancelled`. | Reject activation-aborted with mutation, false mutation with refs, true mutation without settlement, terminal source, or settlement self-report without referenced record. |
| `EA-UND-0018-GOAL` | From `verifying`, validate certification receipt, complete WorkNode receipts, passing/waived validators, empty risks, and commit `certified`. | Reject worker/projection claim, missing receipt, incomplete WorkNode refs, certified with risks, exception without risk+approval, failed validator, or wrong source state. |
| `EA-UND-0019-GOAL` | Replan failed-verification run to a distinct WorkGraph, increment generation, disposition every affected node, and commit `repairing`. | Reject same graph refs, skipped generation, unpaired affected node, unknown disposition/action, ready/terminal source, or WorkNode dispatch from this event itself. |
| `EA-UND-0020-GOAL` | At `start_event_pending`, validate activation receipt and exact accepted active requests, append once, then atomically expose `active/running`. Alias `GoalRunStarted` normalizes with evidence. | Reject partial/mixed required set, mutation requests under read-only mode, missing authority/identity/budget/storage proof, `BuildStarted`, duplicate with different digest, or any pre-append dispatch/charge. |
| `EA-UND-0021-GOAL` | Stop a running GoalRun with settled children and validated safe point; projection becomes fenced resumable `stopped`. | Reject resumable without safe point/current admission evidence, unsettled child work, unknown reason, terminal source, or silent resume without new valid replan revision. |

##### 10. Common failure, degraded, unknown, and authority behavior

The following outcomes apply to every row and are acceptance requirements, not implementation suggestions. They are carried into the same named non-generated `Plans/Goal_Runtime_System.md` owner oracle subsection and `Plans/Automated_Testing_System.md` consumer anchor as Section 9. They remain `NON_EXECUTABLE_UNDER_THIS_TRANSACTION` except for clauses demonstrably exercised by an unchanged pre-existing check run read-only after materialization:

| Condition | Exact outcome |
| --- | --- |
| Wrong/missing row schema ID, wrong event const, extra property, null in non-null field, unknown enum, malformed conditional branch | Reject validation; append nothing. |
| Outer/inner project, account, actor, correlation, causation, event type, schema, run, or optional thread join conflict | Reject `identity_mismatch`; append nothing. |
| Missing foreign ref or referenced record fails its owner schema/currentness check | Reject `unresolved_reference`; append nothing. |
| Stale `expected_goal_revision` | Return `revision_conflict`; append and projection unchanged. |
| Duplicate same identity/digest | Return original durable result; no second append/transition/side effect. |
| Duplicate same identity/different digest | Return `idempotency_conflict`; append and projection unchanged. |
| Dedupe proof unavailable | Return `dedupe_unavailable`; append nothing, schedule nothing, certify nothing. |
| Unknown event/schema/version or unsupported EventRecord reader | Quarantine/refuse live projection without checkpoint advance; no best-effort history. |
| Raw or unhandled secret | Reject before append; no redaction transform is used to legitimize the write. |
| Illegal lifecycle edge or terminal-state mutation | Reject `illegal_transition`; append nothing. |
| Storage `viewer` | Frozen historical read only at one proven high-water mark; no producer, scheduler, projector writer, receipt writer, permission action, provider call, or durable/external mutation. |
| Storage/root/integrity/recovery truth unknown | Goal/GoalRun is blocked or remains unknown; no mutation/certification. A disposable survivor projection may be `degraded` only with explicit recovery provenance and never as receipt authority. |
| Permission denial/approval required | Named `goal.blocked`/`goal_run.blocked`, exact permission evidence and actions; never failed or complete; approval cannot widen a Storage/FileSafe block. |
| Verifier unavailable | Lightweight may degrade with receipt/evidence; standard only if no mutation/required check affected; strong blocks. Never silently certifies. |
| Unknown consequential choice outside `EA-DEV-K37-001` | Record `SAME_CLASS_BLOCKER` and stop before choosing. |

State replay must be deterministic: applying the same admitted event sequence from the same checkpoint yields byte-equivalent disposable Goal and GoalRun projections. A projector advances its checkpoint only after all events through that sequence validate and apply atomically. Quarantined or failed rows stop advancement at the preceding valid event.

##### Materialization nonclaims

This owner repair does not create or execute fixtures, oracle artifacts, checker changes, generators, shards, gates, runtime, or certification. Schema-decidable closure is static contract materialization only; no behavioral oracle is claimed passed. Retention assignment remains Storage-owned rather than Goal semantic ownership. Under owner-complete and materialized `EA-DEV-K37-002`, all 21 Goal and GoalRun registry rows carry exactly one approved closed structured `retention_policy_ref` with exactly `registry_schema_id`, `policy_id`, and `policy_version`, resolving to exactly one current Storage catalog record. A missing, unresolved, multiply resolved, stale-version, or unknown ref rejects; no event-name or prefix inference, default, or fallback supplies an assignment. Exact row-specific assignments remain authoritative in the live registry and Storage owner surfaces and are not duplicated or re-owned here.

## 4. Integration Surfaces

- Assistant Chat consumes Goal Runtime for visible activation, status, task tracker, pause/resume/stop/clear/update controls, evidence/activity display, completion reports, and child-goal expansion.
- Final GUI consumes Goal Runtime for Settings placement of worker and verifier/adjudicator model selectors.
- Planning Ledger and Plan Document systems provide source-lineage and PlanUnit contracts for ledger-to-Plans goals.
- Plan_To_Node_Compilation owns the accepted compiler boundary for plan graph build goals and prevents PlanUnit indexing from creating NodeSeed/WorkNode artifacts.
- Permissions_System resolves global approval policy; Goal Runtime invokes approval for high-risk goal actions.
- Runtime_Artifacts_Panel and storage owners consume Goal Runtime evidence and receipt identities for browsing, retention, and redaction.
- Models_System and Multi-Account own concrete requested/effective model and account resolution for Goal Runtime roles; provider-specific docs may contribute existing provider capability/model discovery surfaces, but exact Goal Runtime provider-default tier mappings remain deferred unless later promoted through a provider-specific hook.

## 5. Validation And Acceptance

Goal Runtime implementation is acceptable only when:

- all Goal Runtime PlanUnits include `gui_related: true|false`;
- invisible internal goals, visible Assistant Chat goals, and Orchestrator Goal runtime flows share one lifecycle/state model;
- every goal produces a completion, degraded, stopped, or blocked receipt;
- strong-certification goals block when verifier/adjudicator requirements cannot be met;
- material mid-goal changes produce Goal Replan Events;
- child goals are first-class runtime objects but cannot complete the parent;
- child direct writes require isolation, partitioning, or a parent-granted single-writer lease;
- evidence is replayable for standard/strong tiers and raw logs are capped/redacted;
- seal-phase governance validation uses the complete GRS-021 validator suite before accepting the sealed Goal Runtime packet;
- WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, and final node queues are absent from Goal Runtime plan/index/governance phases; runtime PlanCompile and Executor may materialize runtime artifacts only through the accepted compiler, intake, activation, and certification chain.

## 6. Plan-To-Node Readiness

Current readiness from Plans/.plan_index remains index-only. Goal Runtime PlanUnits expose runtime contracts, risk, validation surfaces, dependencies, and `gui_related` metadata for compiler analysis. They do not create executable build tasks during documentation, index generation, or governance repair.

Node-readiness depends on `Plans/Plan_To_Node_Compilation.md` for compiler completeness and on Executor/Goal Runtime receipts for runtime certification. Index generation still reports that no NodeSeeds, WorkNodes, executable queues, final node manifests, production build tasks, or final node queues were created by the index phase.

## 7. Deferred, Retired, Compatibility, And Non-Goals

Deferred:

- exact legacy Chain Wizard compatibility flow after native Goal Mode exists;
- final visual styling, iconography, and exact layout for Goal chip/status/task drawer;
- provider-specific default model-role tier mappings.

Retired or non-goal:

- old prompt-packet/D2 workflow as product foundation;
- a bootstrapped PM Goal Mode implementation for current bootstrap work;
- treating Goal Mode as only a prompt loop or planning-doc transfer tool;
- creating WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, or production build tasks in this compile;
- updating Spec Lock, generated shards, evidence bundles, plan_graph, or auto_decisions during the pre-seal compile phase.

Compatibility:

- current Chain Wizard docs are incomplete legacy/source-lineage context for this feature;
- Codex and competitor references are source-lineage/research inputs only.

## 8. Source Lineage And Governance

Primary source lineage:

- `Plans/ledgers/v2/pldg-20260616-001-goal-runtime-system/records/design_atoms.jsonl`
- `Plans/ledgers/v2/pldg-20260616-001-goal-runtime-system/records/decisions.jsonl`
- `Plans/ledgers/v2/pldg-20260616-001-goal-runtime-system/records/questions.jsonl`
- `Plans/ledgers/v2/pldg-20260616-001-goal-runtime-system/records/corrections.jsonl`
- `Plans/ledgers/v2/pldg-20260616-001-goal-runtime-system/state/current.json`
- `Plans/ledgers/v2/pldg-20260616-001-goal-runtime-system/state/open_items.json`

Owner adjudication:

- `Plans/Goal_Runtime_System.md` owns runtime/control-plane behavior and evidence/completion policy.
- `Plans/assistant-chat-design.md` owns chat-facing Goal UI and thread behavior.
- `Plans/FinalGUISpec.md` owns Settings GUI placement for model selectors.
- `Plans/Planning_Ledger_System.md`, `Plans/Plan_Document_System.md`, and `Plans/Plan_To_Node_Compilation.md` remain owners for ledger, PlanUnit, and node-readiness mechanics.

The pre-seal compile phase leaves live Plans and `Plans/.plan_index/**` changes at `pending_seal` until an explicit governance seal. This Goal Runtime ledger has since been sealed through that separate governance phase; future ordinary ledger writing, plan drafting, PlanUnit indexing, and pre-seal compile work still must not touch generated governance artifacts.

## Ledger Compile Addendum - pldg-20260616-002

### GRS-026 - Orchestrator GoalRun Runtime Envelope

```yaml
plan_unit_id: GRS-026
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  Goal Runtime is the durable objective, authority, child-work, evidence, repair, and certification envelope for Orchestrator GoalRuns. It governs GoalRun phase, scope, write authority, child goals and SubagentWaves, evidence expectations, completion criteria, replan events, blockers, receipts, and final certification while Orchestrator owns user-visible projections and Executor owns scheduler truth. The lifecycle sequence preserves GoalRun → WorkGraph → WorkNode execution → VerificationCycle → repair loop → receipt → certification without changing Executor dispatch ownership. Replan records preserve affected WorkNodes, cancelled or re-steered child work, remaining valid evidence, new revision, and next action without replacing the existing Goal Replan Event owner policy. GoalRun write authority consumes write_mode values read_only, proposal_only, patch_only, isolated_worktree, leased_writer, and parent_writer through Permissions and Worktree owners rather than re-owning permission enforcement.
gui_related: false
gui_classification_reason: Runtime authority, state, receipts, and certification behavior are orchestration/control-plane behavior, not visual presentation.
depends_on: [GRS-002, GRS-005, GRS-012, GRS-016, GRS-017, OP-020, EP-097]
unblocks: [OP-022, OSI-428, EP-098, CV-288]
acceptance_criteria:
  - Orchestrator GoalRuns use Goal Runtime as the control envelope without replacing Orchestrator projections.
  - The GoalRun lifecycle preserves GoalRun → WorkGraph → WorkNode execution → VerificationCycle → repair loop → receipt → certification.
  - Executor/runtime scheduler remains the canonical owner for readiness, blocked overlays, retry/backoff, capacity, wakeups, and dispatch.
  - GoalRun completion requires receipt-backed certification rather than worker, subagent, or WorkNode success alone.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260616-002-orchestrator-goal-runtime-flow
risk_class: orchestrator_runtime_authority_drift
reasoning_tier: high
context_scope: orchestrator_goal_runtime
implementation_surfaces: [Plans/Goal_Runtime_System.md, Plans/Orchestrator_Page.md, Plans/Executor_Protocol.md, Plans/Contracts_V0.md, Plans/storage-plan.md, Plans/Permissions_System.md, Plans/WorktreeGitImprovement.md]
node_compile_hint: {mode: orchestrator_goal_runtime_envelope, create_worknodes: false}
source_lineage:
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0002
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0003
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0006
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0008
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0009
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0011
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0013
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0021
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0022
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0036
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0039
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0040
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0047
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0048
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0089
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0095
  - pldg-20260616-002-orchestrator-goal-runtime-flow:dec-0001
  - pldg-20260616-002-orchestrator-goal-runtime-flow:dec-0006
  - pldg-20260616-002-orchestrator-goal-runtime-flow:dec-0007
preserved_exact_tokens:
  - "Goal Runtime"
  - "Orchestrator"
  - "control envelope"
  - "GoalRun"
  - "WorkGraph"
  - "WorkNode"
  - "SubagentWave"
  - "GoalCompletionReceipt"
  - "Completion requires receipt-backed certification"
  - "isolated_worktree"
  - "GoalRun → WorkGraph → WorkNode execution → VerificationCycle → repair loop → receipt → certification"
  - "affected WorkNodes"
  - "cancelled"
  - "re-steered"
  - "remaining valid evidence"
  - "new revision"
  - "next action"
negative_constraints:
  - Do not make Goal Runtime replace Orchestrator UI/projections or Executor scheduler truth.
  - Do not dispatch graph nodes directly from Goal Runtime when Executor scheduling truth exists.
  - Do not mark tasks or goals complete only because a worker reports success.
owner_hints: [Plans/Goal_Runtime_System.md, Plans/Orchestrator_Page.md, Plans/Executor_Protocol.md, Plans/Contracts_V0.md, Plans/storage-plan.md, Plans/Permissions_System.md, Plans/WorktreeGitImprovement.md]
```

### GRS-027 - Verification Repair Loop And Certification Policy

```yaml
plan_unit_id: GRS-027
unit_type: requirement
status: superseded
owner_doc: Plans/Goal_Runtime_System.md
superseded_by: GRS-053
canonical_text: >-
  COMPATIBILITY AND SOURCE-LINEAGE ONLY -- NOT ACTIVE CURRENT-PRODUCT TRUTH. The Goal-owned verification and repair loop with a mandatory certifier role cast is retired from Goal Runtime; custody moves to the Orchestrator and Executor owners, which keep the VerificationCycle, receipt, and repair-strategy semantics under their own contracts. The text below is retained verbatim for lineage and audit and must not be accepted or indexed as active current-product truth. Superseded by GRS-053.
  Orchestrator GoalRuns treat execution success as provisional. VerificationCycle failures create typed VerificationFinding records, findings, and DefectBundles, repair WorkNodes or repair subgoals run under bounded authority, and verification reruns against the affected target plus regression scope until zero findings remain or a true blocker or authority boundary is reached. Runtime policy consumes the contract-owned VerificationCycle example shape with verification_cycle_id, target_ref, attempt, status failed | passed | blocked, findings, defect_signatures, finding type, failing check, affected artifact/path/span, root_cause_key, repeated_signature_count, prior repair strategies, repair_strategy, and next_required_action without re-owning the schema. VerificationReceipt records verifier identity, findings, defect signatures, passed/failed/skipped validator outputs, repair-cycle refs, and regression checks. WorkNodeReceipt records executor identity, input refs, output refs, changed artifacts, validators run, evidence refs, and unresolved risks. GoalCompletionReceipt records child receipts, WorkNode receipts, changed artifacts, validator outcomes, authority checks, and final certifier decision. Repair strategy values include patch, replan, split_node, merge_node, widen_context, rollback, escalate_capability_lane, assign_specialist_subagents, manual_decision, and authority_blocked. Acceptance checks require acceptance criteria, live evidence, tests, diffs, validator outputs, canonical evidence, source evidence, process evidence, and governance evidence. Controller, planner, executor, reviewer, verifier, adjudicator, certifier, root_cause, and replan roles remain distinct when verifying or certifying repair loops. Validator failure, verifier unavailable, and repair budget exhaustion produce blocked or degraded outcomes rather than certified complete. Two consecutive failed verification cycles with the same defect signature force strategy adjustment, and the third failed cycle escalates to a high-end adjudicator or root_cause replan.
gui_related: false
gui_classification_reason: Verification, repair, receipts, and certification policy are runtime/governance behavior, not GUI implementation.
depends_on: [GRS-010, GRS-012, GRS-013, GRS-014, GRS-019]
unblocks: [OP-022, EP-098, CV-288, RAP-027]
acceptance_criteria:
  - A failed VerificationCycle cannot become a done-with-issues completion state.
  - Verification reruns after every repair before a WorkNode, child goal, or GoalRun is certified.
  - Runtime verification policy consumes the contract-owned VerificationCycle example shape, preserving attempt, failed | passed | blocked, typed VerificationFinding details, finding type, failing check, affected artifact/path/span, root_cause_key, repeated_signature_count, prior repair strategies, next_required_action, and defect_signatures without re-owning schema.
  - Repeated defect signatures trigger strategy adjustment after two consecutive failed verification cycles and high-end adjudication/root_cause replan on the third failed cycle.
  - VerificationReceipt, WorkNodeReceipt, and GoalCompletionReceipt preserve verifier/executor/certifier identity, changed artifacts, validator outcomes, evidence refs, unresolved risks, authority checks, and repair-cycle refs.
  - Repair strategy and evidence taxonomy values remain explicit rather than compressed into generic retry language.
  - Cost controls may reduce exploratory fanout but cannot disable required verification, receipts, independent review, or certification gates.
  - Validator failure, verifier unavailable, and repair budget exhaustion cannot be certified complete as normal success.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future Goal Runtime verification-loop tests
risk_class: false_completion
reasoning_tier: high
context_scope: orchestrator_verification_repair
implementation_surfaces: [Plans/Goal_Runtime_System.md, Plans/Executor_Protocol.md, Plans/Runtime_Artifacts_Panel.md, Plans/Contracts_V0.md, Plans/storage-plan.md, Plans/Permissions_System.md, Plans/WorktreeGitImprovement.md]
node_compile_hint: {mode: verification_repair_loop_policy, create_worknodes: false}
source_lineage:
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0019
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0020
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0021
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0022
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0035
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0036
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0038
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0043
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0044
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0045
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0046
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0049
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0050
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0051
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0052
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0053
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0054
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0055
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0065
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0066
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0067
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0090
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0092
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0094
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0100
  - pldg-20260616-002-orchestrator-goal-runtime-flow:dec-0008
  - pldg-20260616-002-orchestrator-goal-runtime-flow:dec-0024
preserved_exact_tokens:
  - "verify again"
  - "keep doing that flow until it stops finding issues"
  - "zero findings remain"
  - "VerificationReceipt"
  - "WorkNodeReceipt"
  - "GoalCompletionReceipt"
  - "passed/failed/skipped"
  - "repair-cycle refs"
  - "regression checks"
  - "executor identity"
  - "input refs"
  - "output refs"
  - "changed artifacts"
  - "validators run"
  - "evidence refs"
  - "unresolved risks"
  - "validator outcomes"
  - "authority checks"
  - "final certifier decision"
  - "VerificationFinding"
  - "DefectBundle"
  - "RepairWorkNode"
  - "finding type"
  - "failing check"
  - "affected artifact/path/span"
  - "root_cause_key"
  - "prior repair strategies"
  - "defect signature"
  - "two consecutive failed verification cycles"
  - "two repeats"
  - "third failed cycle"
  - "high-end adjudicator"
  - "root_cause"
  - "patch"
  - "replan"
  - "split_node"
  - "merge_node"
  - "widen_context"
  - "rollback"
  - "escalate_capability_lane"
  - "assign_specialist_subagents"
  - "manual_decision"
  - "authority_blocked"
  - "attempt"
  - "failed | passed | blocked"
  - "defect_signatures"
  - "controller"
  - "planner"
  - "reviewer"
  - "validator failure"
  - "verifier unavailable"
  - "budget exhaustion"
  - "blocked"
  - "degraded"
  - "certified complete"
negative_constraints:
  - Do not allow a failed verification to become a done-with-issues state.
  - Do not reduce audit/verification strictness to save cost.
  - Do not keep applying the same low-end patch indefinitely.
owner_hints: [Plans/Goal_Runtime_System.md, Plans/Executor_Protocol.md, Plans/Runtime_Artifacts_Panel.md, Plans/Contracts_V0.md, Plans/storage-plan.md, Plans/Permissions_System.md, Plans/WorktreeGitImprovement.md, Plans/Progression_Gates.md]
```

## Ledger Compile Addendum - pldg-20260617-001-plans-to-code-handoff

### GRS-028 - Planning Wizard Approval To PlanCompile Boundary

```yaml
plan_unit_id: GRS-028
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  Future native Planning Wizard approval may emit a PlanApproved event that invisibly starts native PlanCompile, creates a PlanCompileRun, and projects progress in Orchestrator only after a later enablement PlanUnit accepts that runtime launch. Until then, current bootstrap and design_only v1 PlanCompile records remain design-only and disabled; this disabled boundary does not disable the finished-product native_runtime branch once runtime_enablement_ref and runtime_policy_snapshot_ref exist. Planning Wizard, Plan Compiler supervision, PRD Builder structured conversion, and ledger-to-Plans conversion use Overseer Model semantics, while Auditor Model owns the Auditor audit-to-repair verification loop that repeats audit, bounded repair, and re-audit until completion is certified or a critical block or authority boundary stops the loop.
  Future native launch remains invisible to the user only after explicit enablement, and new records, prompts, and plan updates must use Planning Wizard terminology. Do not introduce new references or meta-comments using retired Chain Wizard or Plan Wizard names as active terminology.
gui_related: false
gui_classification_reason: Trigger and model-role boundary are runtime behavior; Orchestrator owns visible projection.
depends_on: [GRS-002, PNC-010, MS-110]
unblocks: [OP-023, F3-396]
acceptance_criteria:
  - Current bootstrap and design_only v1 PlanCompile launch remains disabled until explicit enablement.
  - Planning Wizard approval is the future trigger source, not this compile's runtime action.
  - Overseer and Auditor model roles are consumed from Models_System.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - future Goal Runtime PlanApproved integration review
risk_class: premature_runtime_launch
reasoning_tier: high
context_scope: planning_wizard_plancompile_trigger
implementation_surfaces: [Plans/Goal_Runtime_System.md, Plans/Plan_To_Node_Compilation.md, Plans/Models_System.md, Plans/Orchestrator_Page.md]
node_compile_hint: {mode: future_planning_wizard_plancompile_trigger, create_worknodes: false}
source_lineage:
  - pldg-20260617-001-plans-to-code-handoff:atom-0008
  - pldg-20260617-001-plans-to-code-handoff:atom-0009
  - pldg-20260617-001-plans-to-code-handoff:atom-0020
  - pldg-20260617-001-plans-to-code-handoff:atom-0022
  - pldg-20260617-001-plans-to-code-handoff:dec-0004
  - pldg-20260617-001-plans-to-code-handoff:dec-0008
  - pldg-20260617-001-plans-to-code-handoff:dec-0028
preserved_exact_tokens:
  - "Planning Wizard"
  - "Plan Wizard"
  - "PlanApproved event"
  - "PlanCompileRun"
  - "invisible to the user"
  - "Overseer Model"
  - "Auditor Model"
  - "Auditor audit-to-repair loop"
  - "critical block"
negative_constraints:
  - Do not enable this automatic launch yet.
  - Do not introduce new references using retired Chain Wizard or Plan Wizard names as active terminology.
compatibility_only_notes:
  - Pre-rename Plan Wizard tokens may remain in source_lineage, preserved_exact_tokens, historical migration notes, and compatibility aliases only.
stale_retired_dispositions:
  - Plan Wizard is retired as active product/runtime/compile terminology; current prose, PlanUnits, commands, events, prompts, and index rows use Planning Wizard.
owner_hints:
  - Plans/Goal_Runtime_System.md
  - Plans/Plan_To_Node_Compilation.md
  - Plans/Orchestrator_Page.md
```

### GRS-029 - Hands-Off Autonomy And HITL Boundary

```yaml
plan_unit_id: GRS-029
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  Plans-to-code execution defaults to hands-off autonomy. User escalation is last-resort for critical authority blockers: missing credentials or secrets, billing/payment/legal/license acceptance, unsafe destructive operation, irreversible external side effect, unrecoverable environment failure, true product decision with no inferable answer, or security-sensitive approval. HITL is an explicit setting or mode that can add configured package, seam, or critical checkpoints without becoming required for correctness. Default runtime repair routes ordinary uncertainty through Auditor, Overseer, graph/work/model/source-control/test-harness repair, and high-effort repair before asking the user.
  Configured checkpoints are HITL-only additions, while default escalation remains limited to credentials/secrets, billing/payment/legal/license acceptance, unsafe destructive operation, irreversible external side effect, and security-sensitive approval. Internal repair escalation uses Overseer review and High-Effort Worker routing before user escalation when evidence permits.
gui_related: false
gui_classification_reason: Autonomy, HITL, and escalation policy are runtime/permission behavior.
depends_on: [GRS-027, PS-116, HITL-036]
unblocks: [EP-102, GRS-030, OP-024]
acceptance_criteria:
  - Default mode is hands-off with critical-only user escalation.
  - HITL checkpoints are explicit opt-in behavior, not required correctness gates.
  - Ordinary row-level uncertainty is resolved internally when evidence allows.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - future autonomy and HITL mode review
risk_class: unnecessary_user_escalation
reasoning_tier: high
context_scope: plans_to_code_autonomy
implementation_surfaces: [Plans/Goal_Runtime_System.md, Plans/Permissions_System.md, Plans/human-in-the-loop.md, Plans/Executor_Protocol.md]
node_compile_hint: {mode: autonomy_hitl_policy, create_worknodes: false}
source_lineage:
  - pldg-20260617-001-plans-to-code-handoff:atom-0044
  - pldg-20260617-001-plans-to-code-handoff:atom-0045
  - pldg-20260617-001-plans-to-code-handoff:atom-0046
  - pldg-20260617-001-plans-to-code-handoff:dec-0019
  - pldg-20260617-001-plans-to-code-handoff:dec-0020
  - pldg-20260617-001-plans-to-code-handoff:corr-0009
preserved_exact_tokens:
  - "HITL"
  - "hands-off"
  - "critical authority blockers"
  - "configured checkpoints"
  - "Overseer review"
  - "High-Effort Worker"
  - "credentials/secrets"
  - "billing/payment/legal/license"
  - "unsafe destructive operation"
  - "irreversible external side effect"
  - "security-sensitive approval"
negative_constraints:
  - Do not ask the user for ordinary row-level uncertainty in default mode.
  - Do not route default failures to user decision before Overseer/Auditor/internal repair paths are exhausted.
owner_hints:
  - Plans/Goal_Runtime_System.md
  - Plans/Permissions_System.md
  - Plans/Executor_Protocol.md
```

### GRS-030 - Plans-To-Code Goal Completion Certification

```yaml
plan_unit_id: GRS-030
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  Plans-to-code completion requires a GoalCompletionReceipt. Code complete means all WorkNodes are terminal with valid receipts, all required automated tests passed or are explicitly dispositioned, all source-control receipts are valid, rollback and safe-point requirements are satisfied, Auditor passed, no active blockers remain, no stale Plan/WorkGraph/currentness mismatch remains, final source state is clean or intentionally preserved, and final summary/evidence is written. GoalCompletionReceipt fields include rollback_requirements_satisfied, safe_point_requirements_satisfied, no_stale_plan_workgraph_currentness_mismatch, final_source_state, final_summary_ref, child_receipt_refs, worknode_receipt_refs, changed_artifact_refs, validator_outcomes, authority_check_refs, source_control_receipt_refs, test_receipt_refs, model_resolution_receipt_refs, unresolved_risks, and evidence_layers. Worker says done is insufficient; completion must preserve source evidence, canonical Plan evidence, process evidence, governance evidence, test evidence, source-control evidence, and completion receipts as separate truth layers.
  GoalCompletionReceipt certification requires the exact code-complete evidence that all WorkNodes terminal, all automated tests passed or were dispositioned, and no active blockers remain. Plans to code completion is an artifact-backed handoff where Auditor verifies before final certification.
gui_related: false
gui_classification_reason: Completion certification and evidence truth-layer policy are runtime/governance behavior.
depends_on: [GRS-027, GRS-029, EP-103, ATS-004]
unblocks: [RAP-029, CV-289, OP-024]
acceptance_criteria:
  - GoalCompletionReceipt proves code-complete status from objective receipt criteria.
  - Test, source-control, Auditor, blocker, currentness, and final evidence states are checked before completion.
  - Evidence truth layers remain separate and auditable.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - python3 scripts/pm-plans-verify.py validate-plans-to-code-handoff-schema
risk_class: false_completion
reasoning_tier: high
context_scope: plans_to_code_completion
implementation_surfaces: [Plans/Goal_Runtime_System.md, Plans/Executor_Protocol.md, Plans/Project_Output_Artifacts.md, Plans/Runtime_Artifacts_Panel.md, Plans/plans_to_code_handoff.schema.json]
node_compile_hint: {mode: goal_completion_certification, create_worknodes: false}
source_lineage:
  - pldg-20260617-001-plans-to-code-handoff:atom-0043
  - pldg-20260617-001-plans-to-code-handoff:atom-0055
  - pldg-20260617-001-plans-to-code-handoff:atom-0060
  - pldg-20260617-001-plans-to-code-handoff:dec-0018
  - pldg-20260617-001-plans-to-code-handoff:dec-0023
preserved_exact_tokens:
  - "GoalCompletionReceipt"
  - "code complete"
  - "all WorkNodes terminal"
  - "all automated tests passed"
  - "no active blockers"
  - "source evidence"
  - "canonical evidence"
  - "process evidence"
  - "governance evidence"
  - "test evidence"
  - "source-control evidence"
  - "Plans to code completion"
  - "artifact-backed handoff"
  - "Auditor verifies"
  - "final certification"
negative_constraints:
  - Do not accept worker says done as code completion.
owner_hints:
  - Plans/Goal_Runtime_System.md
  - Plans/Executor_Protocol.md
  - Plans/Project_Output_Artifacts.md
```

ContractRef: ContractName:Plans/Goal_Runtime_System.md, ContractName:Plans/Plan_To_Node_Compilation.md, ContractName:Plans/Models_System.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Project_Output_Artifacts.md


## Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260618-001-prd-planning-wizard` into this existing owner or consumer doc. It does not create WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks.

### GRS-031 - Approve And Build Launch, Parallel Enforcement, And Atomic Activation

```yaml
plan_unit_id: GRS-031
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: 'Approve And Build first validates a compare-and-swap approval boundary over the PlanningRun revision, topic map version, immutable pack identity, pack version, pack hash, project-context snapshot hash, PlanUnit index hash, acceptance-unit index hash, testing policy hash, and final audit/closure hash shown in final review. It then atomically writes the immutable pack, approval_cas_receipt, user approval receipt, and PlanApproved transactional-outbox event so approval cannot be committed without a recoverable downstream trigger. PlanApproved uses a deterministic idempotency key derived from project_id, pack_id, pack version, pack hash, and approval CAS inputs; duplicate delivery returns the existing PlanCompileRun rather than creating another run. In the finished-product native runtime contract, ordinary Approve And Build flow immediately creates or resumes exactly one PlanCompileRun and returns its identity synchronously before projection reconciliation; optional HITL checkpoints are policy exceptions, not the default. During the current bootstrap ledger-to-Plans lane, this remains product-runtime canon and does not launch PlanCompile. For broad stages the controller computes a bounded worklist and mandatory minimum parallel assignments, launches read-only subagents, records assignment and completion receipts, and rejects certification when required parallel work is absent. A required broad stage may reduce scope or block with a typed runtime-capability
  error, but it may not silently substitute one broad agent for mandatory parallel analysis or review. Activation requires all required active-scope WorkNodeRequests to be accepted together; optional work must be explicitly excluded or deferred before activation, and a mixed result cannot silently start a partial build. After provisioning acceptance, one activation transaction creates or binds the GoalRun in activating state, installs the certified WorkGraph revision, materializes all WorkNodes, queues runnable entrypoints, records the activation receipt, and writes GoalRunStarted or BuildStarted through a transactional outbox. Orchestrator may show launch and provisioning progress before activation, but it marks the build running and exposes runnable WorkNodes only after the atomic activation commit and durable start receipt. Activation persists activation_pending, records_materialized, entrypoints_queued, start_event_pending, active, and cancelled_before_mutation
  states; retries resume idempotently, duplicate commands return the existing GoalRun, and cancellation routes according to whether mutation began. Planning Wizard uses current Goal Runtime and Auditor-based AuditCycle, AuditFinding, RepairAttempt, AuditClosure, and CertificationReceipt records rather than superseded experimental workflow machinery. The final audit controller must launch multiple bounded read-only specialist agents in parallel for distinct defect families, persist assignments and results, reduce findings, run bounded repairs, and re-audit until all findings are durably closed or a true typed blocker remains. Audit and repair subagents inspect, classify, compare, and propose; the Planning Run controller or assigned canonical artifact owner performs serialized writes, updates closures, and issues certification. Classify gaps as auto_resolvable, safe_default_with_assumption, defer_to_plan_compile, defer_to_worknode_system, requires_user_policy_decision,
  requires_user_risk_acceptance, requires_external_credential, or true infrastructure/runtime blocker.'
gui_related: true
gui_classification_reason: Includes user-visible GUI/workspace/command/projection behavior.
depends_on: []
unblocks: []
acceptance_criteria:
- The live owner doc preserves every source atom listed in source_atom_ids without treating the ledger as canonical product prose.
- Exact tokens, negative constraints, owner hints, and accepted corrections remain available to future audits through this PlanUnit.
- No WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks are created by this compile.
- Approve And Build records an approval CAS receipt and fails closed when final-review currentness inputs drift.
- The PlanCompileRun identity is created or returned synchronously; projection identity reconciliation cannot be the source of run identity truth.
- "`cmd.runtime.approve` consumes canonical approval/currentness inputs, records UICommandResponse and approval/dispatch receipt refs, and emits only canonical runtime events or explicit receipts, never `runtime.command_applied`."
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard
risk_class: stale_or_forbidden_behavior
reasoning_tier: high
context_scope: ledger_to_plans_compile
implementation_surfaces:
- Plans/Goal_Runtime_System.md
- Plans/Contracts_V0.md
- Plans/Planning_Wizard.md
- Plans/Plan_To_Node_Compilation.md
- Plans/Executor_Protocol.md
- Plans/Orchestrator_Page.md
- Plans/human-in-the-loop.md
node_compile_hint:
  mode: canonical_planunit_from_bootstrap_ledger
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260618-001-prd-planning-wizard:atom-0104
- pldg-20260618-001-prd-planning-wizard:atom-0105
- pldg-20260618-001-prd-planning-wizard:atom-0106
- pldg-20260618-001-prd-planning-wizard:atom-0114
- pldg-20260618-001-prd-planning-wizard:atom-0115
- pldg-20260618-001-prd-planning-wizard:atom-0120
- pldg-20260618-001-prd-planning-wizard:atom-0125
- pldg-20260618-001-prd-planning-wizard:atom-0126
- pldg-20260618-001-prd-planning-wizard:atom-0127
- pldg-20260618-001-prd-planning-wizard:atom-0130
- pldg-20260618-001-prd-planning-wizard:atom-0133
- pldg-20260618-001-prd-planning-wizard:atom-0135
- pldg-20260618-001-prd-planning-wizard:atom-0143
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/06-approve-build-plan-compile-worknodes.md#SRC-COMPILE
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/07-audit-readiness-and-safety.md#SRC-AUDIT
source_atom_ids:
- atom-0104
- atom-0105
- atom-0106
- atom-0114
- atom-0115
- atom-0120
- atom-0125
- atom-0126
- atom-0127
- atom-0130
- atom-0133
- atom-0135
- atom-0143
decision_refs:
- dec-0021
- dec-0023
- dec-0025
- dec-0026
correction_refs:
- corr-0008
- corr-0009
preserved_exact_tokens:
- PlanApproved
- approval_cas_receipt
- transactional outbox
- idempotency_key
- project_id
- pack_hash
- PlanningRun revision
- topic map version
- project-context snapshot hash
- automatic_after_approval
- PlanCompileRun
- minimum_parallel_assignments
- assignment receipt
- completion receipt
- parallelism_required
- runtime-capability blocker
- all required active-scope
- mixed
- GoalRunStarted
- BuildStarted
- activation transaction
- activation commit
- running
- activation_pending
- records_materialized
- entrypoints_queued
- cancelled_before_mutation
- AuditCycle
- AuditFinding
- RepairAttempt
- AuditClosure
- CertificationReceipt
- multiple bounded read-only specialist agents in parallel
- durably closed
- sole writer
- serialized writes
- auto_resolvable
- safe_default_with_assumption
- requires_user_risk_acceptance
negative_constraints:
- Do not require a redundant ordinary Start Build confirmation after Approve And Build.
- Do not approve stale final-review inputs or defer PlanCompileRun identity creation to projection reconciliation.
- Do not accept agent self-report as proof that required parallel subagents were used.
- Do not silently degrade a mandatory parallel stage to one agent.
- Do not start a partially accepted required WorkGraph.
- Do not make superseded experimental pipeline artifacts part of the product audit architecture.
- Do not certify a broad final audit performed by one agent when parallel specialist review is required.
- Do not allow parallel repair subagents to race canonical Plan writes.
owner_hints:
- Plans/Contracts_V0.md
- Plans/Goal_Runtime_System.md
- Plans/Planning_Wizard.md
- Plans/Plan_To_Node_Compilation.md
- Plans/Executor_Protocol.md
- Plans/Orchestrator_Page.md
- Plans/human-in-the-loop.md
```

## Ledger Compile Addendum - pldg-20260703-001-feature-intake

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260703-001-feature-intake` into this owner doc. The ledger remains source/planning memory; these PlanUnits are the live canonical evidence. This compile does not create WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or a governance seal.

### GRS-033 - P1-AGENT-FOCUS-WATCHDOG

```yaml
plan_unit_id: GRS-033
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  P1-AGENT-FOCUS-WATCHDOG (P1) is compiled as canonical Puppet Master intent for Agent focus/progress watchdog for GUI: Add AgentProgressHeartbeat event and Focus/Attention state for GoalRuns and terminal-bound agents. The preserved PM gap/delta is: Need GUI-visible per-agent watchdog: last action, last terminal snapshot, expected next check, stalled state, and user steering. The observed external-repo signal remains source-lineage evidence: Warp issue list includes agent loses focus/stops work; Codex goal docs recommend compact progress reports with current checkpoint/verified/remains/blocked; Cline has repeating tasks/stuck thinking reports.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Long-running shell command exposes next-check countdown and manual snapshot trigger.
- Agent stalled/no-heartbeat surfaces as attention_required without losing terminal session.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Long-running shell command exposes next-check countdown and manual snapshot trigger.
- Agent stalled/no-heartbeat surfaces as attention_required without losing terminal session.
risk_class: p1_agent_control_subagents_hardening
reasoning_tier: standard
context_scope: agent_control_subagents
implementation_surfaces:
- Plans/Goal_Runtime_System.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: p1_agent_focus_watchdog
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0021
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0021
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0017/P1-AGENT-FOCUS-WATCHDOG@line=17
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0017/P1-AGENT-FOCUS-WATCHDOG
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_external_repo_action_backlog_2026-07-03.jsonl:17
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md:833-1329
source_atom_ids:
- atom-0021
external_atom_id: extrepo-20260703-0017
source_row_id: P1-AGENT-FOCUS-WATCHDOG
priority: P1
finding_family: Agent focus/progress watchdog for GUI
source_repos:
- warpdotdev/warp
- cline/cline
- openai/codex
target_docs:
- Plans/Goal_Runtime_System.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/Section15_MVP_Promoted_Features_Spec.md
owner_hints:
- Plans/Goal_Runtime_System.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/Section15_MVP_Promoted_Features_Spec.md
preserved_exact_tokens:
- extrepo-20260703-0017
- P1-AGENT-FOCUS-WATCHDOG
- P1
- Agent focus/progress watchdog for GUI
- warpdotdev/warp
- cline/cline
- openai/codex
negative_constraints: []
observed_signal: Warp issue list includes agent loses focus/stops work; Codex goal docs recommend compact progress reports with current checkpoint/verified/remains/blocked; Cline has repeating tasks/stuck thinking reports.
pm_current_coverage: PM has Goal Runtime and closure registry concepts, but terminal/dev-loop progress integration can be stronger.
pm_gap_or_delta: 'Need GUI-visible per-agent watchdog: last action, last terminal snapshot, expected next check, stalled state, and user steering.'
proposal_or_recommendation: Add AgentProgressHeartbeat event and Focus/Attention state for GoalRuns and terminal-bound agents.
compile_disposition: create_new_planunit
```

### GRS-034 - P1-INTERRUPT-CANCEL-SETTLEMENT

```yaml
plan_unit_id: GRS-034
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  P1-INTERRUPT-CANCEL-SETTLEMENT (P1) is compiled as canonical Puppet Master intent for User stop/interrupt halts active agent and tools safely: Imported external-repo finding extrepo-20260703-0028 / P1-INTERRUPT-CANCEL-SETTLEMENT (P1). The preserved PM gap/delta is: Define cancellation propagation and settlement: provider stream, subprocess, MCP call, browser/device, child run; no conversion to success/failure; history interruption boundary. The observed external-repo signal remains source-lineage evidence: Agent Zero issue requests stop/interrupt for active chat/tool calls without container restart and with history preserved; OpenCode v2 includes sessions.interrupt and Effect interruption.
gui_related: true
gui_classification_reason: Target docs include GUI/UI command or user-visible surfaces; mixed work is conservatively GUI-related.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Stop active MCP call leaves partial/cancelled result
- Stop provider stream does not replay unfinished assistant/tool turn
- UI returns idle with preserved history
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Stop active MCP call leaves partial/cancelled result
- Stop provider stream does not replay unfinished assistant/tool turn
- UI returns idle with preserved history
risk_class: p1_mcp_tools_and_tool_settlement_hardening
reasoning_tier: standard
context_scope: mcp_tools_and_tool_settlement
implementation_surfaces:
- Plans/Goal_Runtime_System.md
- Plans/Tools.md
- Plans/Executor_Protocol.md
- Plans/assistant-chat-design.md
node_compile_hint:
  mode: p1_interrupt_cancel_settlement
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0032
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0032
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0028/P1-INTERRUPT-CANCEL-SETTLEMENT@line=28
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0028/P1-INTERRUPT-CANCEL-SETTLEMENT
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_second_pass_delta_backlog_2026-07-03.jsonl:8
source_atom_ids:
- atom-0032
external_atom_id: extrepo-20260703-0028
source_row_id: P1-INTERRUPT-CANCEL-SETTLEMENT
priority: P1
finding_family: User stop/interrupt halts active agent and tools safely
source_repos:
- agent0ai/agent-zero
- anomalyco/opencode
target_docs:
- Plans/Goal_Runtime_System.md
- Plans/Tools.md
- Plans/Executor_Protocol.md
- Plans/assistant-chat-design.md
owner_hints:
- Plans/Goal_Runtime_System.md
- Plans/Tools.md
- Plans/Executor_Protocol.md
- Plans/assistant-chat-design.md
preserved_exact_tokens:
- extrepo-20260703-0028
- P1-INTERRUPT-CANCEL-SETTLEMENT
- P1
- User stop/interrupt halts active agent and tools safely
- agent0ai/agent-zero
- anomalyco/opencode
negative_constraints: []
observed_signal: Agent Zero issue requests stop/interrupt for active chat/tool calls without container restart and with history preserved; OpenCode v2 includes sessions.interrupt and Effect interruption.
pm_current_coverage: Tools has cancelled normalized outcome and terminal/session actions exist.
pm_gap_or_delta: 'Define cancellation propagation and settlement: provider stream, subprocess, MCP call, browser/device, child run; no conversion to success/failure; history interruption boundary.'
compile_disposition: create_new_planunit
```

### GRS-035 - P0-AGENT-CONTROL-PLANE-ENVELOPE

```yaml
plan_unit_id: GRS-035
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  P0-AGENT-CONTROL-PLANE-ENVELOPE (P0) is compiled as canonical Puppet Master intent for Agent control / autonomy / effort / resource envelope: Define AgentControlEnvelope with autonomy_mode, write_surface, provider/model/effort policy, tool/MCP permission ceiling, context/token budgets, loop budgets, wall-clock budgets, terminal/browser/device authority, child-spawn policy, cancellation/steering semantics, progress heartbeat, and receipt refs. The preserved PM gap/delta is: Controls are strong but scattered. PM needs one runtime envelope every main agent, subagent, delegated thread, background goal, terminal-bound task, browser/device session, and provider attempt must carry. The observed external-repo signal remains source-lineage evidence: Repeated failures cluster around agents/subagents inheriting wrong model or reasoning effort, running in circles, spending uncontrolled budget, or continuing after transport/tool failure. OpenCode and Codex show model/effort propagation confusion; Cline
  and Agent Zero show loop/spend/resource failures; Warp/Codex show UI/runtime stall modes.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Every child run persists AgentControlEnvelope before first provider/tool call.
- GUI can show requested/effective autonomy, model, effort, budgets, and authority.
- A child/subagent cannot exceed parent ceiling even if model/tool output requests it.
- Completion receipts include envelope hash and final budget state.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Every child run persists AgentControlEnvelope before first provider/tool call.
- GUI can show requested/effective autonomy, model, effort, budgets, and authority.
- A child/subagent cannot exceed parent ceiling even if model/tool output requests it.
- Completion receipts include envelope hash and final budget state.
risk_class: p0_agent_control_subagents_hardening
reasoning_tier: high
context_scope: agent_control_subagents
implementation_surfaces:
- Plans/Goal_Runtime_System.md
- Plans/Models_System.md
- Plans/Executor_Protocol.md
- Plans/Tools.md
- Plans/FinalGUISpec.md
- Plans/storage-plan.md
node_compile_hint:
  mode: p0_agent_control_plane_envelope
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0059
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0059
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0055/P0-AGENT-CONTROL-PLANE-ENVELOPE@line=55
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0055/P0-AGENT-CONTROL-PLANE-ENVELOPE
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_missed_domains_backlog_2026-07-03.jsonl:1
source_atom_ids:
- atom-0059
external_atom_id: extrepo-20260703-0055
source_row_id: P0-AGENT-CONTROL-PLANE-ENVELOPE
priority: P0
finding_family: Agent control / autonomy / effort / resource envelope
source_repos:
- OpenCode
- Cline
- Agent Zero
- Pi
- Codex
- Warp
target_docs:
- Plans/Goal_Runtime_System.md
- Plans/Models_System.md
- Plans/Executor_Protocol.md
- Plans/Tools.md
- Plans/FinalGUISpec.md
- Plans/storage-plan.md
owner_hints:
- Plans/Goal_Runtime_System.md
- Plans/Models_System.md
- Plans/Executor_Protocol.md
- Plans/Tools.md
- Plans/FinalGUISpec.md
- Plans/storage-plan.md
preserved_exact_tokens:
- extrepo-20260703-0055
- P0-AGENT-CONTROL-PLANE-ENVELOPE
- P0
- Agent control / autonomy / effort / resource envelope
- OpenCode
- Cline
- Agent Zero
- Pi
- Codex
- Warp
negative_constraints: []
observed_signal: Repeated failures cluster around agents/subagents inheriting wrong model or reasoning effort, running in circles, spending uncontrolled budget, or continuing after transport/tool failure. OpenCode and Codex show model/effort propagation confusion; Cline and Agent Zero show loop/spend/resource failures; Warp/Codex show UI/runtime stall modes.
pm_current_coverage: PM already has Goal Runtime role-policy, progress fingerprints, hard budgets, parent/child goals, verification repair loop, provider/model requested/effective identity, and approval boundaries.
pm_gap_or_delta: Controls are strong but scattered. PM needs one runtime envelope every main agent, subagent, delegated thread, background goal, terminal-bound task, browser/device session, and provider attempt must carry.
proposal_or_recommendation: Define AgentControlEnvelope with autonomy_mode, write_surface, provider/model/effort policy, tool/MCP permission ceiling, context/token budgets, loop budgets, wall-clock budgets, terminal/browser/device authority, child-spawn policy, cancellation/steering semantics, progress heartbeat, and receipt refs.
compile_disposition: create_new_planunit
```

### GRS-036 - P0-SUBAGENT-EXECUTION-CONTRACT

```yaml
plan_unit_id: GRS-036
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  P0-SUBAGENT-EXECUTION-CONTRACT (P0) is compiled as canonical Puppet Master intent for Subagent lifecycle, model/effort config, and result authority: Define SubagentExecutionContract and SubagentResultEnvelope. Child result is advisory unless marked allowed_to_write=false/true under parent policy; parent remains the only canonical writer where required. Include per-child model/effort settlement, context slice hash, tool ceiling, timeout, wait_agent/cancel semantics, and orphan reaper. The preserved PM gap/delta is: PM needs a single child execution lifecycle independent of prompt packets: spawn, admitted context, first event, heartbeat, partial result, await, cancellation, orphan reap, result settlement, and parent completion gating. The observed external-repo signal remains source-lineage evidence: Codex and OpenCode expose custom/subagent model and reasoning config gaps; Cline temporarily disabled/stabilized subagents in the SDK migration and has loop reports; Agent Zero release notes
  show child chats/parallel tools and non-destructive await timeouts.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- A child can use a different allowed model/effort only if settlement proves it.
- Parent cannot certify complete until all required child results are settled or explicitly waived.
- Orphan helpers/processes are reaped on session close/crash/restart.
- Subagent loops trip per-child and aggregate budgets.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- A child can use a different allowed model/effort only if settlement proves it.
- Parent cannot certify complete until all required child results are settled or explicitly waived.
- Orphan helpers/processes are reaped on session close/crash/restart.
- Subagent loops trip per-child and aggregate budgets.
risk_class: p0_provider_capability_and_metadata_hardening
reasoning_tier: high
context_scope: provider_capability_and_metadata
implementation_surfaces:
- Plans/Goal_Runtime_System.md
- Plans/Tools.md
- Plans/Executor_Protocol.md
- Plans/storage-plan.md
- Plans/FinalGUISpec.md
node_compile_hint:
  mode: p0_subagent_execution_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0061
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0061
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0057/P0-SUBAGENT-EXECUTION-CONTRACT@line=57
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0057/P0-SUBAGENT-EXECUTION-CONTRACT
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_missed_domains_backlog_2026-07-03.jsonl:3
source_atom_ids:
- atom-0061
external_atom_id: extrepo-20260703-0057
source_row_id: P0-SUBAGENT-EXECUTION-CONTRACT
priority: P0
finding_family: Subagent lifecycle, model/effort config, and result authority
source_repos:
- Codex
- OpenCode
- Cline
- Agent Zero
target_docs:
- Plans/Goal_Runtime_System.md
- Plans/Tools.md
- Plans/Executor_Protocol.md
- Plans/storage-plan.md
- Plans/FinalGUISpec.md
owner_hints:
- Plans/Goal_Runtime_System.md
- Plans/Tools.md
- Plans/Executor_Protocol.md
- Plans/storage-plan.md
- Plans/FinalGUISpec.md
preserved_exact_tokens:
- extrepo-20260703-0057
- P0-SUBAGENT-EXECUTION-CONTRACT
- P0
- Subagent lifecycle, model/effort config, and result authority
- Codex
- OpenCode
- Cline
- Agent Zero
negative_constraints: []
observed_signal: Codex and OpenCode expose custom/subagent model and reasoning config gaps; Cline temporarily disabled/stabilized subagents in the SDK migration and has loop reports; Agent Zero release notes show child chats/parallel tools and non-destructive await timeouts.
pm_current_coverage: PM has parent/child goal runtime policy, canonical child run identity for subagents, and prompt-packet subagent hard gates.
pm_gap_or_delta: 'PM needs a single child execution lifecycle independent of prompt packets: spawn, admitted context, first event, heartbeat, partial result, await, cancellation, orphan reap, result settlement, and parent completion gating.'
proposal_or_recommendation: Define SubagentExecutionContract and SubagentResultEnvelope. Child result is advisory unless marked allowed_to_write=false/true under parent policy; parent remains the only canonical writer where required. Include per-child model/effort settlement, context slice hash, tool ceiling, timeout, wait_agent/cancel semantics, and orphan reaper.
compile_disposition: create_new_planunit
```

### GRS-037 - P0-LOOP-BREAKER-TAXONOMY

```yaml
plan_unit_id: GRS-037
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  P0-LOOP-BREAKER-TAXONOMY (P0) is compiled as canonical Puppet Master intent for Looping / no-progress / spend control: Add LoopBreakerRegistry with typed families: identical_tool_failure, empty_assistant, no_tool_progress, repeated_edit_miss, compaction_no_gain, context_overflow_replay, MCP_resource_missing, first_event_timeout, transport_idle, reasoning_no_action, subagent_same_read, and spend_anomaly. Each family has fingerprint, max_count, required observation window, terminal action, and user-facing reason. The preserved PM gap/delta is: The same simple identical-failure triple will not catch compaction loops, empty assistant loops, tool-result loops, failed edit loops, prompt-cache churn, first-event hangs, no-progress reasoning, and repeated subagent file-read loops. The observed external-repo signal remains source-lineage evidence: OpenCode reports empty assistant loops, MCP resource-list spend loops, compaction loops, truncated tool-call repair loops, failed edit loops, and thinking-only
  loops. Cline reports truncated tool-call and no-match loops. Agent Zero reports monologue/tool loops. Pi reports hung tools/transport first-event hangs.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Fixtures for each loop family stop within bounded attempts.
- Spend/quota caps terminate even when model output appears syntactically successful.
- Compaction can run once or configured bounded times but cannot self-loop indefinitely.
- GUI shows stopped_for_loop with fingerprint and last safe point.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Fixtures for each loop family stop within bounded attempts.
- Spend/quota caps terminate even when model output appears syntactically successful.
- Compaction can run once or configured bounded times but cannot self-loop indefinitely.
- GUI shows stopped_for_loop with fingerprint and last safe point.
risk_class: p0_agent_control_subagents_hardening
reasoning_tier: high
context_scope: agent_control_subagents
implementation_surfaces:
- Plans/Goal_Runtime_System.md
- Plans/Executor_Protocol.md
- Plans/Tools.md
- Plans/Provider_OpenCode.md
- Plans/FinalGUISpec.md
node_compile_hint:
  mode: p0_loop_breaker_taxonomy
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0062
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0062
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0058/P0-LOOP-BREAKER-TAXONOMY@line=58
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0058/P0-LOOP-BREAKER-TAXONOMY
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_missed_domains_backlog_2026-07-03.jsonl:4
source_atom_ids:
- atom-0062
external_atom_id: extrepo-20260703-0058
source_row_id: P0-LOOP-BREAKER-TAXONOMY
priority: P0
finding_family: Looping / no-progress / spend control
source_repos:
- OpenCode
- Cline
- Agent Zero
- Pi
- Codex
target_docs:
- Plans/Executor_Protocol.md
- Plans/Goal_Runtime_System.md
- Plans/Tools.md
- Plans/Provider_OpenCode.md
- Plans/FinalGUISpec.md
owner_hints:
- Plans/Executor_Protocol.md
- Plans/Goal_Runtime_System.md
- Plans/Tools.md
- Plans/Provider_OpenCode.md
- Plans/FinalGUISpec.md
preserved_exact_tokens:
- extrepo-20260703-0058
- P0-LOOP-BREAKER-TAXONOMY
- P0
- Looping / no-progress / spend control
- OpenCode
- Cline
- Agent Zero
- Pi
- Codex
negative_constraints: []
observed_signal: OpenCode reports empty assistant loops, MCP resource-list spend loops, compaction loops, truncated tool-call repair loops, failed edit loops, and thinking-only loops. Cline reports truncated tool-call and no-match loops. Agent Zero reports monologue/tool loops. Pi reports hung tools/transport first-event hangs.
pm_current_coverage: Executor has doom-loop guard and Goal Runtime has progress fingerprints, budgets, and verification repair loop.
pm_gap_or_delta: The same simple identical-failure triple will not catch compaction loops, empty assistant loops, tool-result loops, failed edit loops, prompt-cache churn, first-event hangs, no-progress reasoning, and repeated subagent file-read loops.
proposal_or_recommendation: 'Add LoopBreakerRegistry with typed families: identical_tool_failure, empty_assistant, no_tool_progress, repeated_edit_miss, compaction_no_gain, context_overflow_replay, MCP_resource_missing, first_event_timeout, transport_idle, reasoning_no_action, subagent_same_read, and spend_anomaly. Each family has fingerprint, max_count, required observation window, terminal action, and user-facing reason.'
compile_disposition: create_new_planunit
```

### GRS-038 - P0-GOAL-SCOPE-SUBAGENT-ISOLATION

```yaml
plan_unit_id: GRS-038
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  P0-GOAL-SCOPE-SUBAGENT-ISOLATION (P0) is compiled as canonical Puppet Master intent for Goal/subagent identity leakage and rogue continuation: Imported external-repo finding extrepo-20260703-0075 / P0-GOAL-SCOPE-SUBAGENT-ISOLATION (P0). The preserved PM gap/delta is: AgentControlEnvelope covered authority, but not enough about inheritable goal identity, child-agent leases, or proving that a child cannot resume/advance the parent goal. The observed external-repo signal remains source-lineage evidence: Codex issue #25472 reports subagents reactivating a long-running goal and behaving like the main thread. | Codex changelog has multiple goal/subagent/session persistence and terminal-subagent error propagation fixes. | PM already has subagent hard gates, but needs runtime-level goal leases rather than prompt-only role instructions.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Every subagent receives a ChildAgentLease with parent_goal_id, allowed_phase, read/write mode, max_depth, cannot_resume_parent_goal=true, and terminal return channel.
- A child/subagent cannot spawn further agents unless its lease explicitly grants delegation_depth > 0.
- Parent sees child terminal errors as typed failed outcomes, never empty successful completion.
- Subagent cache/context lineage is separate from parent stable-prefix/cache lineage unless explicitly linked by a receipt.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Every subagent receives a ChildAgentLease with parent_goal_id, allowed_phase, read/write mode, max_depth, cannot_resume_parent_goal=true, and terminal return channel.
- A child/subagent cannot spawn further agents unless its lease explicitly grants delegation_depth > 0.
- Parent sees child terminal errors as typed failed outcomes, never empty successful completion.
- Subagent cache/context lineage is separate from parent stable-prefix/cache lineage unless explicitly linked by a receipt.
risk_class: p0_agent_control_subagents_hardening
reasoning_tier: high
context_scope: agent_control_subagents
implementation_surfaces:
- Plans/Goal_Runtime_System.md
node_compile_hint:
  mode: p0_goal_scope_subagent_isolation
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0079
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0079
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0075/P0-GOAL-SCOPE-SUBAGENT-ISOLATION@line=75
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0075/P0-GOAL-SCOPE-SUBAGENT-ISOLATION
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_final_external_repo_closure_backlog_2026-07-03.jsonl:2
source_atom_ids:
- atom-0079
external_atom_id: extrepo-20260703-0075
source_row_id: P0-GOAL-SCOPE-SUBAGENT-ISOLATION
priority: P0
finding_family: Goal/subagent identity leakage and rogue continuation
target_docs:
- Goal_Runtime_System.md
- orchestrator-subagent-integration.md
- Orchestrator_Page.md
- Contracts_V0.md
- FinalGUISpec.md
owner_hints:
- Goal_Runtime_System.md
- orchestrator-subagent-integration.md
- Orchestrator_Page.md
- Contracts_V0.md
- FinalGUISpec.md
preserved_exact_tokens:
- extrepo-20260703-0075
- P0-GOAL-SCOPE-SUBAGENT-ISOLATION
- P0
- Goal/subagent identity leakage and rogue continuation
negative_constraints: []
observed_signal: 'Codex issue #25472 reports subagents reactivating a long-running goal and behaving like the main thread. | Codex changelog has multiple goal/subagent/session persistence and terminal-subagent error propagation fixes. | PM already has subagent hard gates, but needs runtime-level goal leases rather than prompt-only role instructions.'
pm_gap_or_delta: AgentControlEnvelope covered authority, but not enough about inheritable goal identity, child-agent leases, or proving that a child cannot resume/advance the parent goal.
relationship_to_prior_reports: Sharpens AgentControlEnvelope and SubagentExecutionContract into an isolation primitive.
compile_disposition: create_new_planunit
```

### GRS-039 - P1-EXTERNAL-AGENT-HANDOFF-IMPORT

```yaml
plan_unit_id: GRS-039
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  P1-EXTERNAL-AGENT-HANDOFF-IMPORT (P1) is compiled as canonical Puppet Master intent for Third-party agent import, continuation, and session provenance: Imported external-repo finding extrepo-20260703-0085 / P1-EXTERNAL-AGENT-HANDOFF-IMPORT (P1). The preserved PM gap/delta is: MCP/import config provenance was covered, but PM should also treat external agent sessions as imported runtimes with provenance and continuation contracts. The observed external-repo signal remains source-lineage evidence: Warp supports third-party CLI agents, custom routers, local continuation when a cloud run is interrupted, and structured CLI-agent notifications. | Codex changelog records external agent import results and Claude Code import support. | Cline/OpenCode configs and MCP ecosystems encourage cross-tool state/config reuse.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Imported external-agent session has source tool/version, authority surface, context lineage, credential handling, cwd/worktree, terminal/session transcript, and continuation mode.
- Cloud-to-local or local-to-cloud continuation changes authority/cache/tool/session epoch and must be displayed.
- External agent output/tool requests enter PM as untrusted until settled by PM receipts.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Imported external-agent session has source tool/version, authority surface, context lineage, credential handling, cwd/worktree, terminal/session transcript, and continuation mode.
- Cloud-to-local or local-to-cloud continuation changes authority/cache/tool/session epoch and must be displayed.
- External agent output/tool requests enter PM as untrusted until settled by PM receipts.
risk_class: p1_agent_control_subagents_hardening
reasoning_tier: standard
context_scope: agent_control_subagents
implementation_surfaces:
- Plans/Goal_Runtime_System.md
node_compile_hint:
  mode: p1_external_agent_handoff_import
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0089
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0089
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0085/P1-EXTERNAL-AGENT-HANDOFF-IMPORT@line=85
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0085/P1-EXTERNAL-AGENT-HANDOFF-IMPORT
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_final_external_repo_closure_backlog_2026-07-03.jsonl:12
source_atom_ids:
- atom-0089
external_atom_id: extrepo-20260703-0085
source_row_id: P1-EXTERNAL-AGENT-HANDOFF-IMPORT
priority: P1
finding_family: Third-party agent import, continuation, and session provenance
target_docs:
- Goal_Runtime_System.md
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Provider_OpenCode.md
- MCP_Integration.md
- FinalGUISpec.md
owner_hints:
- Goal_Runtime_System.md
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Provider_OpenCode.md
- MCP_Integration.md
- FinalGUISpec.md
preserved_exact_tokens:
- extrepo-20260703-0085
- P1-EXTERNAL-AGENT-HANDOFF-IMPORT
- P1
- Third-party agent import, continuation, and session provenance
negative_constraints: []
observed_signal: Warp supports third-party CLI agents, custom routers, local continuation when a cloud run is interrupted, and structured CLI-agent notifications. | Codex changelog records external agent import results and Claude Code import support. | Cline/OpenCode configs and MCP ecosystems encourage cross-tool state/config reuse.
pm_gap_or_delta: MCP/import config provenance was covered, but PM should also treat external agent sessions as imported runtimes with provenance and continuation contracts.
relationship_to_prior_reports: Extends external config provenance into full session handoff.
compile_disposition: create_new_planunit
```

### GRS-040 - GRS-040

```yaml
plan_unit_id: GRS-040
unit_type: constraint
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  External agent sessions, MCP config imports, and handoff packets enter PM as untrusted provenance/evidence until settled by PM receipts. Imported sessions do not become native PM authority or bypass Goal, Tool, or Permission ownership.
gui_related: false
gui_classification_reason: Backend/orchestration import guardrail; not itself GUI implementation work.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- atom-0121 source details remain traceable through source_lineage and preserved source fields.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
risk_class: import_guardrail_compile
reasoning_tier: standard
context_scope: import_guardrail
implementation_surfaces:
- Plans/Goal_Runtime_System.md
node_compile_hint:
  mode: atom_0121
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0121
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0121
- subagent:019f297e-fcd6-71f1-a6f2-e410e13a3c38
source_atom_ids:
- atom-0121
owner_hints:
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/parallel_agent_synthesis_20260703.json
preserved_exact_tokens:
- untrusted provenance/evidence
- Imported sessions do not become native PM authority
- External agent sessions enter as untrusted provenance
negative_constraints:
- Do not let imported external sessions bypass Goal/Tool/Permission ownership.
compile_disposition: create_new_planunit
```

### GRS-041 - FABLE Goal Runtime Event Payload Closure

```yaml
plan_unit_id: GRS-041
unit_type: schema_contract
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  Goal Runtime enumerates the shared envelope and event-specific payload minima for
  all canonical goal and goal_run events, and defines the spec-level runtime
  records LoopBreakerRegistry, AgentControlEnvelope, CertificationReceipt,
  ChildAgentLease, WorkNodeRequests, AuditCycle, AuditFinding, and AuditClosure.
  The closure preserves Goal Runtime as the semantic owner while consuming
  Contracts_V0 for cross-surface field names, storage-plan for persistence and
  replay, Executor for WorkNode scheduling and safe-point behavior, and
  Permissions/Models/Multi-Account owners for authority and requested/effective
  identity.
gui_related: false
gui_classification_reason: This unit defines backend Goal Runtime event payload and record semantics, not visual presentation.
depends_on: [GRS-005, GRS-026, GRS-035, GRS-036, GRS-037, GRS-038, CV-287, CV-288, CV-313, EP-098, PNC-013]
unblocks: []
acceptance_criteria:
  - >-
    Exactly 21 current local v2 row schemas exist at the approved Section 6 paths
    and `$id` values; each is a self-contained Draft 2020-12 root with only local
    `#/$defs/...` references, exact row const discriminators, closed root/common
    objects and event payload, and no external schema dependency.
  - >-
    Exactly one canonical common-definition source exists in this owner document,
    and the JCS value of every shared common `$defs` member equals its local copy in
    all 21 approved roots.
  - >-
    Exactly 21 registry rows point one-to-one to those roots with family revision
    `2.0.0`, payload root pointer `#`, event payload pointer
    `#/$defs/event_payload`, the approved semantic identities and replay/redaction
    settings, and the sole admitted legacy alias `GoalRunStarted` only for
    `goal_run.started`; `BuildStarted` and every other alias are rejected.
  - >-
    New v1 writes fail; valid `pm.goal_runtime_events.schema.v1` input remains
    reader-only, enters only the registered legacy normalizer and
    `projector_replay_only`, and cannot emit, mutate, schedule, approve, charge,
    write a receipt, or certify.
  - >-
    Every common and row field has its exact type, presence, absent-versus-null,
    extra-field, closed-enum, conditional-branch, identity-join, revision/CAS,
    lifecycle-state, transition, completion/certification authority, permission,
    recovery, viewer, and redaction rule encoded in the row schema where
    schema-decidable and named in owner/consumer oracle prose.
  - >-
    All 21 obligations `EA-UND-0001-GOAL..EA-UND-0021-GOAL` have one positive and
    one no-append negative oracle, for exactly 42 row oracles, covering every legal
    lifecycle edge and every forbidden source, branch, or edge.
  - >-
    The 15 common Section 10 outcomes and deterministic replay are carried as
    owner and consumer acceptance requirements, including duplicate-same,
    duplicate-conflict, stale revision, dedupe unavailable, replay-only, raw
    secret, outer/inner conflict, unknown schema or enum, unsupported reader,
    illegal transition, completion/certification authority, recovery/viewer,
    permission, verifier-unavailable, and same-class-blocker behavior.
  - >-
    Schema-decidable clauses may be checked read-only, but transition, side-effect,
    replay, authority, currentness, provider/tool, and persistence behavior remains
    `NON_EXECUTABLE_UNDER_THIS_TRANSACTION` unless an unchanged pre-existing check
    demonstrably covers it; no executable oracle artifact, runtime result,
    certification, gate, or buildability proof is claimed.
  - >-
    All 21 Goal and GoalRun registry rows carry the exact approved Storage-owned
    closed structured `retention_policy_ref` with exactly `registry_schema_id`,
    `policy_id`, and `policy_version`, resolving to exactly one current Storage
    catalog record. A missing, unresolved, multiply resolved, stale-version, or
    unknown ref rejects; no event-name or prefix inference, default, or fallback
    supplies an assignment. Exact row-specific assignments remain authoritative
    in the live registry and Storage owner surfaces and are not duplicated or
    re-owned by Goal Runtime.
  - >-
    Goal Runtime owner propagation and the named Contracts, registry, row-schema,
    Storage, and Automated Testing consumer propagation are complete before any
    generator or gate phase begins; existing checks may then run read-only and must
    report exact coverage and failures without widening mutation scope.
  - >-
    The exact 21 v2 row schemas listed for EA-UND-0001-GOAL through
    EA-UND-0021-GOAL carry authoritative payload-schema status under DL-039
    through this owner. Their validation structure and behavior/depth boundaries
    are unchanged; authority promotion does not admit events, certify depth,
    enable emission, or restore retired Goal constructs.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-implementation-readiness
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: fable_goal_runtime_event_payload_drift
reasoning_tier: high
context_scope: contract_runtime_core_repair
implementation_surfaces:
  - Plans/Goal_Runtime_System.md
  - Plans/Contracts_V0.md
  - Plans/Executor_Protocol.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: goal_runtime_event_payload_closure
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/Decision_Log.md#DL-039
  - fablereport.md
  - Plans/.audits/fable-20260706/P0_P1_REPAIR_PLAN.md
  - Plans/.audits/fable-20260706/buildability_repair_registry.jsonl
source_atom_ids: []
preserved_exact_tokens:
  - "`goal.created`"
  - "`goal.scheduled`"
  - "`goal.progressed`"
  - "`goal.tool_check_recorded`"
  - "`goal.updated`"
  - "`goal.replanned`"
  - "`goal.child_status_changed`"
  - "`goal.evidence_captured`"
  - "`goal.verification_decided`"
  - "`goal.receipt_recorded`"
  - "`goal.completed`"
  - "`goal.degraded`"
  - "`goal.stopped`"
  - "`goal.blocked`"
  - "`goal.cancelled`"
  - "`goal_run.started`"
  - "`goal_run.replanned`"
  - "`goal_run.blocked`"
  - "`goal_run.certified`"
  - "`goal_run.cancelled`"
  - "`goal_run.stopped`"
  - "`LoopBreakerRegistry`"
  - "`AgentControlEnvelope`"
  - "`CertificationReceipt`"
  - "`ChildAgentLease`"
  - "`WorkNodeRequests`"
  - "`AuditCycle`"
  - "`AuditFinding`"
  - "`AuditClosure`"
negative_constraints:
  - Do not treat event payload closure as runtime certification harness or implementation readiness proof.
  - Do not re-own Executor scheduling, storage replay, permission enforcement, or provider/model/account resolution.
owner_hints:
  - Plans/Goal_Runtime_System.md
  - Plans/Contracts_V0.md
  - Plans/Executor_Protocol.md
```

## Case L Durable Goal Recovery Consumer Addendum - 2026-07-17

This addendum propagates approved Case L finding `L-003` and the settled cross-owner EventRecord, storage, exact-restore, retention, viewer/root, and permission consequences into Goal Runtime. Authority comes from `PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/CASE_L_APPROVAL_2026-07-17.md`, which approves Bundles A-F without exception. Goal Runtime owns goal lifecycle, recovery posture, and completion truth; it consumes Contracts for EventRecord/restore enums, storage for persistence/recovery/access mode, FileSafe/SCM/Executor for exact-replace and attempt admission, and Permissions for authority. It does not create peer storage algorithms, keys, restore outcomes, permission rules, runtime implementation, WorkNodes, NodeSeeds, executable queues, generated governance artifacts, build tasks, or completeness evidence.

### Canonical goal receipt recovery and false-success prohibition

The materialized `goal_receipt.v1:{project_id}:{receipt_id}` family is canonical non-rebuildable redb authority and uses the approved `restore_from_mandatory_backup` recovery disposition. Append-only goal/goal-run events and disposable `goal_state`, blocked, child, evidence, and run projections remain replay sources for those projections; they are not an alternate completion receipt. Earlier wording that a goal receipt itself is a disposable projection or may be reconstructed from events is superseded for Case L.

Goal Runtime therefore distinguishes these aftermaths without inventing success:

- a validated receipt and continuous canonical event lineage may resume or display its exact recorded lifecycle after normal currentness and authority checks;
- while receipt/canonical-event recovery is in progress or its truth is not yet established, completion and resumability are unknown, no new mutation-capable scheduling begins, and no projection is promoted to receipt authority;
- a projection rebuilt to the current survivor set remains degraded in its completeness/health when canonical history has a proven or possible gap; its receipt/evidence views carry recovery provenance and residual risk. This is derived-view quality, not a fifth GoalRecordV2 state or authority to emit `goal.degraded`; GRS-061 preserves the exact event for historical interpretation only;
- missing, corrupt, quarantined, or unrecoverable canonical goal receipt data remains `goal.blocked` for completion/certification and names the affected receipt/family, storage recovery state, last verified backup boundary, known loss window, last recovery attempt, and next safe action;
- canonical history loss that is unknown or may include mutation-authorizing, approval, safe-point, receipt, verification, or completion events blocks mutation and certification rather than using a degraded receipt as a success substitute.

Restoring a mandatory backup never synthesizes a newer completion. Goal Runtime reloads the restored receipt and event boundary, invalidates projections beyond that boundary, marks post-backup writes as the disclosed loss window, reconciles child/attempt/receipt refs, and reruns revision, authority, evidence, and certification checks before any resume. If the required backup is unavailable, Goal Runtime cannot reconstruct a `GoalCompletionReceipt` from worker claims, UI state, Runtime Artifacts, cached projections, or surviving ordinary goal events.

Goal receipt, completion, degraded, stopped, blocked, recovery, evidence, and certification records retain indefinitely under the storage-owned authority policy. Open blocked/recovery, preserved-run, audit, certification, evidence, legal-hold, and referenced safe-point/restore-transaction anchors compose by union. Goal completion, archive, process exit, model switch, permission refresh, or ordinary age never clears those anchors.

### EventRecord 2.0 scope, idempotency, and replay consumption

Every new canonical `goal.*` and `goal_run.*` event is project-scoped EventRecord `2.0.0` with `scope_kind = project` and a non-empty `project_id`. Goal Runtime never uses an application sentinel. Application-scoped storage/root/lock/recovery events that affect many goals remain `scope_kind = application`, `project_id = null`; Goal Runtime references their event/recovery IDs and proven affected project/goal refs from payload evidence instead of republishing them as fake project events.

Goal history inspection of an EventRecord `2.0.0` root requires a reader that validates `2.0.0`; an unsupported reader refuses the live Goal view with `unsupported_schema_version` rather than projecting partial or best-effort history. Goal event routing consumes the storage-owned key `event_record_index.v2:{scope_partition}:{sequence_id_20}:{event_id}` with the registered reversible project partition. Goal Runtime does not derive this key from the selected project, omit `event_id`, or treat the index as lifecycle/receipt authority.

Goal producers preserve app-root-global `event_id`, lifetime idempotency within `(scope_partition, event_type, idempotency_key)`, and the selected replay policy. A stale/absent dedupe accelerator catches up through the verified seglog tail or the goal append fails `dedupe_unavailable`. In that state Goal Runtime does not expose the intended transition, schedule dependent work, or certify a completion from in-memory state. A legacy value normalized as `projector_replay_only` may rebuild disposable goal projections and atomically advance their checkpoint only; it cannot schedule a turn, mint/update a goal receipt, approve/deny, dispatch a child/WorkNode, charge usage, emit another event, or create completion.

### Storage access, exact-restore, recovery hold, and permission admission

Goal Runtime consumes storage `storage_access_mode = writer | viewer | blocked`, `storage_mode_reason`, `storage_instance_id`, `root_generation`, and redacted continuity/fallback evidence. A compatible viewer may show frozen historical Goal state at one high-water mark, but starts no scheduler, goal continuation, child work, projector/checkpoint writer, receipt writer, provider call, approval action, or other durable/runtime/external mutation. Viewer promotion is never automatic; after storage full revalidation and writer admission, Goal Runtime still reloads canonical state, compares revisions, reconciles interrupted work, verifies receipts/anchors, and obtains current permission evidence before resume. Newer-store metadata diagnostics do not expose live Goal viewer mode. Root mismatch, root unavailable, fallback divergence, or untrustworthy snapshot produces a visible blocked/recovery posture, never an empty/new Goal history.

Goal recovery surfaces do not invent a generic verify, repair, salvage, force-open, or `try_anyway` command. `Retry storage` is only the storage-owned admission probe; it does not repair bytes, reconstruct a receipt, or auto-resume a blocked goal.

Safe-point restore and Chat-revert consequences are consumed exactly. `restored_clean` or `restore_skipped` may satisfy a baseline only with owner equality proof and a durable baseline receipt. `restore_refused` and `restore_failed` do not satisfy the target. `restore_recovery_required` retains the mutation fence and blocked episode. `restored_with_conflicts` is invalid for exact-replace admission. `recovery_unavailable` preserves local work and recovery anchors and permits only explicit abandon, replan, or owner-verified recovery. No goal retry, timer, model switch, viewer promotion, or child result may silently clear that state.

Permission denial and approval-required outcomes remain `goal.blocked`, not failed or complete, and preserve the permission-owned `blocked_family`, `blocked_reason_code`, `permission_snapshot_id?`, approval scope/target refs, ordered `allowed_action_ids[]`, and `executed: false`. A permission approval cannot widen a storage/FileSafe block. A recovered/resumed mutation-capable attempt receives a fresh permission snapshot when policy, project, target, account, runtime identity, storage mode, or prior snapshot currentness changed; historical snapshots remain immutable evidence.

ContractRef: ContractName:Plans/Contracts_V0.md#EventRecord, ContractName:Plans/storage-plan.md#Case-L-durable-state-owner-canon, ContractName:Plans/FileSafe.md#Case-L-Exact-Restore-Repair-Addendum, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/Permissions_System.md

### GRS-042 - Case L Canonical Goal Receipt Recovery Truth

```yaml
plan_unit_id: GRS-042
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: |-
  goal_receipt is canonical non-rebuildable redb authority recovered from mandatory verified backup, while goal-state and goal-run projections remain disposable. Missing, corrupt, quarantined, continuity-uncertain, or unrecoverable receipt/event authority cannot be reconstructed into success: recovery-in-progress is unknown, survivor projections remain degraded with provenance, and completion or mutation-authorizing uncertainty remains blocked until verified recovery.

  Degraded survivor projection means derived-view quality/provenance, not GoalRecordV2.state or an active goal.degraded producer; GRS-061 governs the exact historical event. Existing canonical-loss mutation/completion fences remain unchanged.
gui_related: true
gui_classification_reason: Recovery availability, derived-view quality, provenance and safe-next-action disclosure are user-visible; degraded is not a fifth GoalRecordV2 state.
depends_on: [GRS-005, GRS-012, GRS-019, SP-235, SP-236, SP-237]
unblocks: []
acceptance_criteria:
  - Per-family corruption/deletion fixtures never reconstruct a GoalCompletionReceipt from events, worker claims, artifacts, or projections.
  - Recovery from a verified backup invalidates post-boundary projections, discloses the loss window, and reruns currentness, authority, evidence, and certification checks.
  - Unknown receipt/event truth schedules no mutation and certifies no completion.
  - A current survivor projection with a canonical gap retains degraded projection quality or owner-blocked recovery, with integrity/recovery provenance; this does not add a GoalRecordV2 state or emit goal.degraded.
  - Unavailable mandatory backup leaves completion blocked and names the exact affected family, recovery state, boundary, and next safe action.
  - Goal/receipt/recovery/evidence/certification anchors survive ordinary completion, archive, exit, age, model switch, and permission refresh.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future Case L per-family goal receipt corruption, backup restore, continuity, and false-success fixtures
risk_class: goal_runtime_false_success_after_canonical_loss
reasoning_tier: high
context_scope: case_l_goal_receipt_recovery
implementation_surfaces:
  - Plans/Goal_Runtime_System.md
  - Plans/storage_value_registry.json
node_compile_hint:
  mode: case_l_goal_receipt_recovery_consumer
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Case-L:L-003
  - Case-L:PD-L-01
  - Case-L:PD-L-02
  - Case-L:PD-L-03
  - PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/planning/CONSUMER_PROPAGATION_MAP.md
negative_constraints:
  - Do not treat a canonical goal receipt as a disposable projection.
  - Do not certify completion from surviving projections or ordinary events when receipt authority is missing or uncertain.
owner_hints:
  - Plans/Goal_Runtime_System.md
```

### GRS-043 - Case L Goal Event And Recovery Admission

```yaml
plan_unit_id: GRS-043
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: |-
  Goal Runtime emits project-scoped EventRecord 2.0 goal and goal-run events, preserves global event identity and scoped lifetime idempotency, fails closed on dedupe_unavailable, and limits replay-only compatibility input to disposable projection effects. Scheduler admission additionally requires storage writer and continuity truth, resolved exact-restore or recovery-hold state, and current permission evidence; viewer, root, integrity, restore-recovery, and permission blockers cannot become failure or completion.

  The admission and recovery safeguards do not authorize goal.scheduled: GRS-062/CV-336 make that exact row historical-only. Current run scheduling still applies every actual storage/permission/recovery/stop-epoch gate, while SP-280 reads cannot dispatch or mutate.
gui_related: true
gui_classification_reason: Goal blocked, historical viewer, recovery, permission, and resume states are visible control-plane behavior.
depends_on: [GRS-006, GRS-019, GRS-020, CV-317, CV-318, CV-320, SP-239, SP-240, SP-241, SP-242]
unblocks: []
acceptance_criteria:
  - Goal and GoalRun events validate only with project scope and non-empty project identity; app storage events remain app scoped.
  - A reader lacking EventRecord 2.0 validation refuses Goal-history inspection, and routing consumes the full storage-owned v2 scope, sequence, and event lookup key.
  - Duplicate/idempotency conflicts or dedupe_unavailable append no transition and enable no dependent scheduling or certification.
  - projector_replay_only input changes no canonical receipt, scheduler, permission, child, usage, or external state.
  - Viewer/root/integrity fixtures expose historical or blocked posture and start no goal continuation or writer-capable subsystem.
  - Exact-replace recovery-required or recovery-unavailable fixtures retain fencing, local work, and anchors until an explicit owner terminal action.
  - Permission denial stays blocked with exact payload and a later resume revalidates current permission evidence.
  - Goal recovery exposes no generic storage repair, salvage, force-open, or try-anyway path, and Retry storage cannot auto-resume a blocked goal.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future EventRecord goal scope/dedupe/replay and Goal Runtime storage/restore/permission admission fixtures
risk_class: goal_runtime_replay_or_recovery_admission_bypass
reasoning_tier: high
context_scope: case_l_goal_runtime_admission
implementation_surfaces:
  - Plans/Goal_Runtime_System.md
node_compile_hint:
  mode: case_l_goal_runtime_admission_consumer
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Case-L:L-006
  - Case-L:L-010
  - Case-L:L-013
  - Case-L:L-014
  - Case-L:L-018
  - Case-L:L-020
  - Case-L:EVT-01..EVT-07
  - Case-L:PD-RSP-01..PD-RSP-09
negative_constraints:
  - Do not use application sentinel project identity for goal events.
  - Do not let viewer promotion, retry, timer, model switch, or child completion clear storage, restore, recovery, or permission blockers.
  - Do not infer completion from UI or Runtime Artifacts projections.
owner_hints:
  - Plans/Goal_Runtime_System.md
```

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

Replay reloads the exact accepted objective revision and its admitted source references after a
crash, a context compaction, a model switch, or a host transfer through GRS-064/SP-287. It reads
durable accepted records under DL-047's bound-thread lifetime, not transient chat-window context.
Dereferencing the admitted source context additionally requires that source owner's current
authority and retained bytes; a ref cannot recreate purged source content. The saved objective
is never silently summarised, re-worded, or "improved" on the way back, and compaction alone
does not purge it. Thread deletion hides and purges it under DL-047 rather than making replay
a path to restore deleted text.

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

## Working Notebook Authority Boundary Addendum (2026-09-05)

Packet `PM-WNC-2026-09-05-v1`. Notebook content never writes Goal state: `objective_text`, revision, state, budgets, and completion are changed only by the two `change_source` owners already defined, and a note, capsule, or checkpoint reference cannot complete, cancel, pause, or edit a Goal. Notes MAY reference Goal revisions read-only. Fresh context-window continuation stays Goal continuation: a transition re-checks the current `user_stop_epoch` immediately before final dispatch (evaluate-time and dispatch-time comparison per the continuation contract), a Stop between admission and dispatch discards the stale continuation, and a fresh window never creates a new Goal, resets Goal state, or adds any phase, tranche, or child-Goal structure — the retired-fields list and the "no workflow state in the Goal" boundary are unchanged.

```yaml
plan_unit_id: GRS-057
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: "Working Notebook content cannot write objective_text, Goal state, budgets, or completion; notes may reference Goal revisions read-only. Fresh-window continuation is Goal continuation under the existing continuation contract: the current user_stop_epoch is captured at evaluation and re-checked at final dispatch, a Stop between admission and dispatch discards the stale continuation, and a fresh window never creates a new Goal, resets Goal state, or reintroduces retired phases/tranches/child Goals."
gui_related: false
gui_classification_reason: Goal authority semantics are runtime behavior, not GUI work.
depends_on: [GRS-051, PP-085]
unblocks: []
acceptance_criteria:
  - A stale continuation note never overrides current objective_text or state.
  - Stop between admission and dispatch wins over pending fresh-window continuation.
  - No new Goal fields or topology appear.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: authority_bypass
reasoning_tier: high
context_scope: goal_runtime
implementation_surfaces: [Plans/Goal_Runtime_System.md, Plans/Prompt_Pipeline.md, Plans/Working_Notebook.md]
node_compile_hint: {mode: runtime_contract_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_packet:PM-WNC-2026-09-05-v1:WNC-I03
  - source_packet:PM-WNC-2026-09-05-v1:WNC-C09
  - source_packet:PM-WNC-2026-09-05-v1:WNC-A32
  - source_packet:PM-WNC-2026-09-05-v1:WNC-A42
preserved_exact_tokens: ["user_stop_epoch", "objective_text", "retired fields"]
negative_constraints:
  - Do not add Goal phases, tranches, child Goals, or a Goal-owned notebook.
  - Do not let note text edit an approved objective or completion state.
owner_hints: [Plans/Goal_Runtime_System.md, Plans/Prompt_Pipeline.md]
```

ContractRef: ContractName:Plans/Goal_Runtime_System.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Working_Notebook.md

## Cumulative v3 Goal Activity Detail and Plan Binding Specification (2026-09-07)

This section incorporates the cumulative Goal V2 Activity Detail presentation, concise information
hierarchy, and bound PlanRun synchronization in accordance with APR-059 and retained v2 contracts.

### 18. Goal Activity Detail Presentation and Bound Plan Synchronization (APR-059)

- **Concise Hierarchy and Objective Control:** Goal Activity Detail presents a focused, compact view:
  1. *Objective Headline:* Current approved goal objective with inline Edit affordance.
  2. *Inline Edit Controls:* Save and Cancel controls appearing only when editing the objective text.
  3. *Lifecycle Status and Action Row:* Clear primary status badge and quiet action buttons: Pause,
     Resume, and Cancel.
  4. *Revision History:* Chronological log of objective revisions and lifecycle state transitions.
  5. *Bound Plan Linking:* Direct clickable route link to the bound Plan; Plan Details links back to
     the Goal.
- **Surface Invariants:** No Goal thread card is rendered in the chat transcript. The objective text
  is never duplicated as a Plan card section. Goal and To-Dos reside strictly in the Activity panel,
  preserving hover and pinned detail controls.
- **Reference-Layout Supersession (USER-REFERENCE-LAYOUT-ROLLBACK-20260908):** Per user correction
  USER-REFERENCE-LAYOUT-ROLLBACK-20260908, Goal Activity Detail presentation restores native card and
  panel hierarchy rather than reference-derived forced flat-row CSS, strictly preserving Simple Goal
  objective editing, lifecycle actions (Pause, Resume, Cancel), revision history, and bidirectional PlanRun links.

```yaml
plan_unit_id: GRS-058
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  Goal Activity Detail projects a concise hierarchy featuring objective headline, inline Edit/Save/Cancel
  controls, lifecycle actions (Pause, Resume, Cancel), revision history, and direct bidirectional links
  to the bound PlanRun. Goal state remains strictly in Activity without transcript cards or duplicated
  objective sections on Plan cards.
gui_related: true
gui_classification_reason: Governs Goal Activity Detail presentation, objective editing, and bound Plan navigation.
depends_on: [GRS-057]
unblocks: []
acceptance_criteria:
  - Goal Activity Detail shows objective, inline editing, lifecycle buttons, and revision history.
  - Bidirectional links connect Goal Activity Detail and the bound Plan.
  - No Goal transcript cards are created; objective is not duplicated on Plan cards.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: goal_surface_duplication_or_hierarchy_drift
reasoning_tier: standard
context_scope: goal_ui_projection
implementation_surfaces:
  - Plans/Goal_Runtime_System.md
  - Plans/FinalGUISpec.md
  - Plans/Assistant_Plan_Runtime.md
node_compile_hint:
  mode: goal_ui_specification
  create_worknodes: false
source_lineage:
  - APR-059
preserved_exact_tokens:
  - "Goal Activity Detail"
  - "inline edit"
  - "bidirectional links"
negative_constraints:
  - Do not render Goal state as a transcript card.
  - Do not duplicate Goal objective text inside the Plan card.
owner_hints:
  - Plans/Goal_Runtime_System.md
```

ContractRef: ContractName:Plans/Goal_Runtime_System.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Assistant_Plan_Runtime.md

### GRS-060 - Historical child-status event disposition

```yaml
plan_unit_id: GRS-060
unit_type: constraint
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: Current Goal Runtime admits no goal.child_status_changed producer because child Goals
  and child topology are retired. Existing authoritative schema and D-R03 rules validate genuine historical
  observations only; the exact Storage adapter cannot supply current GoalRecordV2 state, parent completion,
  child projection, continuation or work allocation.
gui_related: true
gui_classification_reason: 'Historical data and active Goal presentation must remain distinct: these rules
  constrain visible lifecycle states, child topology, recovery quality and actionable controls.'
split_recommended: false
depends_on:
- GRS-052
- DL-039
- DL-045
unblocks: []
acceptance_criteria:
- No command, host continuation, subagent callback, retry, migration upgrader or parent transition may
  append goal.child_status_changed, and no To-Do, workflow participant or separate Goal is translated
  into it.
- D-R03 historical original identities, legal transitions, evidence refs and absence-means-false parent_action_required
  semantics are preserved without modifying bytes or executing the old state machine.
- Only the exact read-only Storage adapter exposes one historical record and validity disposition; it
  creates no child tree/card/GUI and active Goal views cannot ingest it as lifecycle or completion authority.
- Reader withdrawal disables interpretation while preserving original registered source and retention;
  it admits no replacement writer and decides no sibling event disposition.
validation_surfaces:
- Plans/goal_child_status_history_contract_fixtures.json
- Plans/event_payloads/goal_runtime/goal_child_status_changed.schema.json
- Plans/event_family_registry.json
- Plans/storage_value_registry.json
risk_class: retired_goal_child_writer_reintroduction
reasoning_tier: high
context_scope: goal_child_status_historical_event
implementation_surfaces:
- Plans/Goal_Runtime_System.md
node_compile_hint:
  mode: goal_child_status_history_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-039
- Plans/Decision_Log.md#DL-045
- Plans/Goal_Runtime_System.md#GRS-052
preserved_exact_tokens:
- goal.child_status_changed
- pm.goal_runtime_event.goal_child_status_changed.schema.v2
- RP-AUTHORITY-INDEFINITE
- none_required
- projector_replay_only
negative_constraints:
- No event/schema/registry/physical/policy mutation, sibling disposition, new child topology, To-Do translation,
  runtime proof, WorkNode/readiness admission or governance seal.
- No current append success from historical dedupe, guessed source custody, unresolved generic checkpoint,
  read-triggered write or fabricated historical default.
owner_hints:
- Plans/Goal_Runtime_System.md
- Plans/Contracts_V0.md
- Plans/storage-plan.md
- Plans/Runtime_Artifacts_Panel.md
```

For exactly `goal.child_status_changed`, current Goal scope and the retirement of child Goals control emission. There is no active producer, command, host continuation, subagent callback, retry, migration upgrader or parent transition authorized to append this event. Registration and DL-039's authoritative v2 schema preserve validation and custody of genuine historical records; they do not restore child topology. No To-Do, Collaborative Workflow participant or separate Goal is translated into this event. The existing family membership, version, schema bytes and retention assignment remain unchanged.

D-R03 is historical interpretation only for this row. Preserve its original child identity, previous/next historical statuses, optional lease/result/receipt refs and the absence-means-false `parent_action_required` interpretation. Do not insert that optional default into stored bytes. Completed requires the original receipt ref; failed/blocked/degraded requires result or receipt ref. A child cannot complete its parent; historical parent state was preserved, and legal historical child transition/revision/reference predicates remain diagnostic validity requirements. Missing historical predecessor/receipt evidence is unresolved validation, never proof of current completion. These historical predicates neither instantiate a GoalRecordV2 nor execute an old state machine.

The sole family-specific consumer binding is the new Storage-owned read adapter `storage.goal_child_status_history_read.v1@1.0.0` in SP-271, used by the existing read-only EventRecord inspection path. It exposes one exact historical source record and validation disposition per lookup, without a tree, actionable child card or new GUI. Active Goal views never ingest the record as lifecycle state, completion, budget, work allocation or continuation evidence.

This exact-row qualification applies to the older event-log list, D-R03, v2 matrix and schema-authority prose wherever they could be read as current writer/projection admission. Other rows retain their own unresolved/adjudicated owner disposition. Withdrawal of this adapter disables interpretation only; it does not delete historical source or admit a replacement writer.

ContractRef: ContractName:Plans/Goal_Runtime_System.md#0-scope, ContractName:Plans/Decision_Log.md#DL-039, ContractName:Plans/storage-plan.md#SP-271, ContractName:Plans/Contracts_V0.md#CV-334

### GRS-061 - Historical Goal degradation and current projection quality

```yaml
unit_type: requirement
status: accepted
gui_related: true
gui_classification_reason: 'Historical data and active Goal presentation must remain distinct: these rules
  constrain visible lifecycle states, child topology, recovery quality and actionable controls.'
split_recommended: false
unblocks: []
reasoning_tier: high
context_scope: goal_degraded_exact_family_historical_contract
validation_surfaces:
- Plans/goal_degraded_history_contract_fixtures.json
- Plans/event_payloads/goal_runtime/goal_degraded.schema.json
- Plans/goal_runtime_events.schema.json
- Plans/storage_value_registry.json
- python3 scripts/pm-plan-index.py validate
- Native exact-family retirement/read/recovery/action-spy oracles remain NOT_RUN.
node_compile_hint:
  mode: goal_degraded_historical_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-039
- Plans/Goal_Runtime_System.md#GRS-048
- Plans/Goal_Runtime_System.md#GRS-049
- Plans/Goal_Runtime_System.md#GRS-014
- EA-UND-0006-GOAL:D-R06
- Plans/Decision_Log.md#DL-045
source_atom_ids: []
negative_constraints:
- No blanket21 retirement, registry/schema/retention mutation, alias, new current producer, active Goal
  state, role/tier, phase/tranche/child/budget, To-Do or GoalRun translation.
- No native/runtime/readiness/gate/seal proof, canonical receipt reconstruction, automatic recovery/continuation,
  notification, Usage, approval or hold effect.
owner_hints:
- Plans/Goal_Runtime_System.md
- Plans/storage-plan.md
- Plans/Contracts_V0.md
plan_unit_id: GRS-061
owner_doc: Plans/Goal_Runtime_System.md
depends_on:
- GRS-048
- GRS-049
- GRS-050
- GRS-042
risk_class: retired_goal_degradation_reintroduced
implementation_surfaces:
- Plans/Goal_Runtime_System.md
canonical_text: 'The exact registered family `goal.degraded` is historical-only. This disposition follows
  GRS-048''s exclusive four-state GoalRecordV2 contract, D-R06''s explicit transition into the incompatible
  `degraded` Goal state, GRS-049''s retirement of Goal-owned certification tiers/role casts, and GRS-014''s
  explicit superseded status. It does not follow merely from absence in the eight-name Goal V2 list. DL-039
  preserves the existing authoritative `pm.goal_runtime_event.goal_degraded.schema.v2` validation root;
  schema promotion does not restore a retired lifecycle transition. The event stays registered with unchanged
  schema bytes, family revision, scope and retention. This ruling applies only to this exact event; it
  does not retire the other twenty roots.


  There is no current producer, Goal host callback, verifier callback, provider-fallback callback, storage-recovery
  callback, command, retry or upgrader authorized to append `goal.degraded`. No current Goal transitions
  into `degraded`, and no current record acquires a certification tier, structured scope, role cast, phase,
  tranche, child or budget to make this payload fit. Do not translate the event into a To-Do, Collaborative
  Workflow participant, GoalRun transition or substitute event. Current Goal state and continuation remain
  with GRS-048/050 and existing actual owner conditions.


  Historical D-R06 semantics remain intact for interpretation of genuine original bytes. Preserve exactly
  the seven degradation reasons, original affected_scope, residual_risk_refs, allowed_actions, exception
  refs, approval refs, revisions, actor and provider/model/account identities. Risks/actions were nonempty;
  exceptions and risk acceptance required their original evidence and approval-subset joins. The original
  state edge was created|scheduled|running|paused|verifying|repairing to degraded, with degraded-to-degraded
  requiring changed risk/currentness evidence; blocked/stopped/limit/terminal states could not silently
  degrade. The original strong/standard tier predicates remain historical diagnostics under their original
  contract, not requirements for a current Goal. A missing historical predecessor, tier, exception or
  approval proof is unresolved historical semantic validation, never a new Goal block on a missing verifier
  or an inferred completed receipt. Schema-valid historical bytes alone do not prove those referenced
  facts.


  Current GRS-042 recovery safeguards remain: canonical receipts are non-rebuildable, possible canonical
  gaps retain explicit provenance, and unresolved mutation/completion authority remains fenced until existing
  owner recovery. The word degraded in a survivor view describes the quality/completeness of that derived
  view, not a fifth GoalRecordV2 state and not authority to emit `goal.degraded`. Receipt/evidence views
  may retain their existing recovery provenance without running D-R06. Unknown authority cannot be laundered
  into completion. This qualification does not invent a new health field, enum, physical family or notification,
  and does not remove current integrity disclosure.


  The sole new family-specific read binding is `storage.goal_degraded_history_read.v1@1.0.0` in SP-277,
  over the existing read-only validated EventRecord inspection path. It returns one exact historical record
  with its validation/provenance disposition. Historical allowed_actions are displayed as original data
  only and never wired as live controls. The lookup cannot mutate GoalRecordV2, receipt, evidence/goal-state
  projection, continuation, approval, budget or recovery state. Withdrawal disables interpretation while
  preserving original source/receipt custody; it admits no replacement writer.'
acceptance_criteria:
- Exact GRS048 plus D-R06 transition and explicit GRS014/049 retirement establish this one historical-only
  event; omission from the eight-name list is not the proof.
- No current Goal producer/command/callback can emit goal.degraded or add degraded as a fifth state, while
  the authoritative schema and family membership remain unchanged.
- Historical reasons, scope, risks, actions, exception/approval evidence and state/revision predicates
  remain interpretable as original data; unresolved history cannot impose retired current verifier/tier
  policy.
- GRS042 projection quality/provenance and canonical-loss mutation/completion fences remain intact without
  active event/state admission.
- Original allowed_actions never dispatch; no Goal/To-Do/GoalRun transformation or sibling retirement
  is inferred.
preserved_exact_tokens:
- goal.degraded
- pm.goal_runtime_event.goal_degraded.schema.v2
- active|paused|blocked|completed
- D-R06
- GRS-042
- RP-AUTHORITY-INDEFINITE
```

ContractRef: ContractName:Plans/Goal_Runtime_System.md#GRS-061, ContractName:Plans/Contracts_V0.md#CV-335, ContractName:Plans/storage-plan.md#SP-277, ContractName:Plans/Decision_Log.md#DL-039

### GRS-062 - Exact historical Goal scheduling contract

```yaml
unit_type: requirement
status: accepted
gui_related: true
gui_classification_reason: 'Historical data and active Goal presentation must remain distinct: these rules
  constrain visible lifecycle states, child topology, recovery quality and actionable controls.'
split_recommended: false
unblocks: []
reasoning_tier: high
context_scope: goal_scheduled_exact_family_historical_contract
validation_surfaces:
- Plans/goal_scheduled_history_contract_fixtures.json
- Plans/event_payloads/goal_runtime/goal_scheduled.schema.json
- Plans/goal_runtime_events.schema.json
- Plans/storage_value_registry.json
- python3 scripts/pm-plan-index.py validate
- Native exact-family historical-read and scheduling action-spy oracles remain NOT_RUN.
node_compile_hint:
  mode: goal_scheduled_historical_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-039
- Plans/Decision_Log.md#DL-045
- Plans/Goal_Runtime_System.md#GRS-048
- Plans/Goal_Runtime_System.md#GRS-050
- Plans/Goal_Runtime_System.md#GRS-051
- Plans/Scheduling_and_Quota_Resume.md
- EA-UND-0011-GOAL:D-R11
source_atom_ids: []
negative_constraints:
- No sibling disposition, registry/schema/retention mutation, alias, current producer, scheduled Goal
  state, Goal budget, child/phase/role, or GoalRun/To-Do/Plan conversion.
- No native/readiness/seal proof, canonical receipt reconstruction, timer/queue/dispatch/Usage/approval/hold/epoch
  effect, or shared-checkpoint waiver.
owner_hints:
- Plans/Goal_Runtime_System.md
- Plans/Scheduling_and_Quota_Resume.md
- Plans/storage-plan.md
- Plans/Contracts_V0.md
plan_unit_id: GRS-062
owner_doc: Plans/Goal_Runtime_System.md
depends_on:
- GRS-048
- GRS-050
- GRS-051
- GRS-042
- GRS-043
risk_class: retired_scheduled_goal_state_reintroduced
implementation_surfaces:
- Plans/Goal_Runtime_System.md
canonical_text: 'The exact existing `goal.scheduled` EventRecord has historical-only disposition and zero
  current writers. This follows the positive semantic conflict between D-R11''s required transition `created|paused|blocked|stopped
  -> scheduled` and GRS-048''s exclusive active GoalRecordV2 writer with exactly `active|paused|blocked|completed`.
  The destination scheduled is not an active Goal state. The row''s mandatory historical budget_snapshot_ref
  cannot authorize restoration of Goal-owned budgets. GRS-048/050/051 and Scheduling_and_Quota_Resume
  instead place eligibility, quota waiting, execution windows and resume with the actual run and Scheduling
  owner. Omission from the eight-name current event list is not sufficient evidence and is not the basis
  for this ruling. DL-039''s authoritative promotion of all twenty-one payload schemas remains intact;
  this exact registered row, version, original schema bytes and historical minima remain unchanged. No
  other event''s disposition is inferred.


  Current Goal hosts may still schedule eligible turns and consume the existing Scheduling service. That
  ordinary use of the word schedule does not mean entering the historical scheduled Goal state or appending
  goal.scheduled. An active Goal with its run waiting for quota remains active. A quota reset, window
  opening, dependency clearance, approval arrival or provider retry cannot override a manual Stop/Pause/Cancel;
  the existing user_stop_epoch and dispatch-time revalidation remain mandatory. GRS-050 evidence-gated
  continuation/completion and actual permission/recovery/owner blocks remain unchanged. This unit grants
  no admission to Scheduling''s separately named events or commands and invents no alias or translation
  to a scheduled message, ExecutionSchedule, GoalRun, To-Do, Plan or Collaborative Workflow object.


  No current producer, host callback, timer, recovery callback, command, retry or upgrader may append
  this exact event, even when its unchanged v2 schema validates, an old idempotency key matches, a run
  is eligible, or original next_action is dispatch. It cannot add scheduled, queue structure, Goal budget,
  phase, child or role fields to the active Goal. Current scheduling remains under its real owner conditions,
  not a backward conversion into the retired transition.


  Historical interpretation preserves all six scheduler_reason values (created, resumed, replanned, repair_cycle,
  dependency_cleared, capacity_available), four priority values (low, normal, high, critical), original
  eligible_at_utc, budget_snapshot_ref, optional queue_id and next_action. D-R11 allowed dispatch, await_dependency
  and await_approval only. Original dispatch required queue_id, eligibility at or before the original
  append observation, writer-capable storage, permission evidence, resolved recovery truth and remaining
  budget. Waiting did not dispatch and could omit queue_id. Historical blocked/stopped sources required
  explicit owner-admitted recovery/revalidation evidence; limit and terminal sources were illegal. Revision/CAS,
  actor/account/envelope and original idempotency identity joins remain historical diagnostics. Missing
  original prerequisite evidence is explicitly unresolved historical validation, not guessed validity,
  a newly issued schedule, or a requirement to manufacture a current Goal budget.


  Historical next_action and scheduler_reason are original data only. Inspecting dispatch cannot enqueue,
  create a timer, dispatch a turn, consume budget/quota, approve, resume, mutate an epoch, write a receipt,
  or change a Goal/GoalRun/To-Do state. The sole new exact-family read adapter is storage.goal_scheduled_history_read.v1@1.0.0
  under SP-280. It returns one provenance-validated original record, without projection or durable effect.
  Current canonical receipt non-rebuildability, degraded survivor-view quality/provenance and recovery/false-completion
  fences under GRS-042/043 remain in force; this disposition does not undo the separate child-status or
  degraded qualifications. Missing canonical authority stays fenced under the real owner. Withdrawal disables
  interpretation, preserves original custody, and grants no replacement producer.'
acceptance_criteria:
- Exact D-R11 destination conflicts with exclusive GRS048 current lifecycle; no omission or sibling inference
  establishes disposition.
- All21 authoritative schema roots and this existing registered family remain unchanged with zero current
  goal.scheduled writes.
- Current run scheduling, quota/window eligibility and stop-epoch precedence remain with their actual
  owners.
- Original six reasons, four priorities, three actions, eligibility/queue/budget/recovery/CAS predicates
  remain historical data and diagnostics, with unresolved original proof disclosed.
- Historical dispatch has no timer/queue/turn/approval/Usage/epoch/state effect and does not recreate
  Goal budget or remove recovery provenance.
preserved_exact_tokens:
- goal.scheduled
- pm.goal_runtime_event.goal_scheduled.schema.v2
- D-R11
- active|paused|blocked|completed
- user_stop_epoch
- RP-AUTHORITY-INDEFINITE
- RP-EVENT-INDEX-SOURCE
- none_required
- storage.goal_scheduled_history_read.v1
```

ContractRef: ContractName:Plans/Goal_Runtime_System.md#GRS-062, ContractName:Plans/Contracts_V0.md#CV-336, ContractName:Plans/storage-plan.md#SP-280, ContractName:Plans/Scheduling_and_Quota_Resume.md, ContractName:Plans/Decision_Log.md#DL-045


## Goal body currentness and history

GRS-064 owns accepted Goal body/revision/origin semantics, their local canonical codec and hash recipes, and the shared native body mutation/read interfaces. SP-287 owns the five physical families, versioned storage envelopes, transaction/backup/deletion mechanics and physical admission. DL-047 governs content lifetime. This is the shared body prerequisite for already specified Goal behavior under DL-045; each Goal event and staged producer still needs its own complete original input, action, SIR, event and receipt contract. It does not close all twenty-one Goal events or confer Workflow certification/exception semantics.

### Exact semantic records and hidden custody

`Plans/goal_body_custody.schema.json#/$defs/body` preserves the exact eleven-field `GoalRecordV2` (`pm.goal.record.v2`); `#/$defs/revision` preserves the exact nine-field `GoalRevisionRecord` (`pm.goal.revision.v2`); `#/$defs/origin` preserves the seven existing hidden `pm.goal.origin_lineage.v1` fields. No schema/retention/guard property is inserted into those semantic records. The separate SP-287 physical envelopes carry storage version metadata outside `record` and do not become visible or semantic Goal fields.

The Goal remains text, not a title, phase, plan, child tree, budget, attachment manifest or role cast. Its lifecycle stays exactly `active | paused | blocked | completed`. Cancellation associates the original cancellation receipt and removes the active projection; it is never a fifth state. Existing registered command boundaries and actual completion predicates remain unchanged.

`origin_kind` is exactly `user_request | agent_created_at_user_request | plan_build | internal_workflow`. Record the actual accepted origin and source-message/context refs; never infer them from objective text. `plan_build` requires its genuine `bound_plan_ref`; `internal_workflow` requires its genuine `owning_workflow_ref`; non-applicable refs are null. This minimal accepted replay lineage does not revive the older route/child/agent graph and does not freeze or retain referenced bodies under a new policy.

`#/$defs/control` is hidden `pm.goal.body_control.v1`: it joins actual Storage instance, Project/thread/Goal, current body key and semantic byte hash, current ordinary revision/currentness, latest accepted objective revision/hash/origin key, monotonic `control_epoch`, optional original `cancellation_receipt_ref` and one optional pending reservation. It authenticates physical joins and serializes access; the body still supplies currentness. It is not a Goal field, workflow queue or second lifecycle.

`#/$defs/receipt` is `pm.goal.body_mutation_receipt.v1`, the content-free original body-transaction result. It records operation/intent identity, original owner/authority refs, original prior/current revision and currentness, accepted objective revision/hash when written, and original commit time. It proves only a body commit. It is not an `AppendReceipt`, SIR `CommandOutcomeRecord`, `UICommandResponse`, cancellation/completion/certification receipt or generic command replay substitute. Those independently owned contracts remain required where the actual caller requires them.

### Exact Goal codec and semantic hashes

The local qualification `pm.goal.canonical_json.v1` uses the existing registry encoding `json_canonical` without adding or redefining a global encoding enum. Encode UTF-8 JSON with ASCII property names in ascending order, compact `,` and `:` separators and no insignificant whitespace. Arrays preserve order. Strings preserve exact Unicode scalar values and whitespace without normalization, trimming, case folding or translation. Escape quote and backslash; use the JSON short escapes `\b`, `\f`, `\n`, `\r`, `\t` for those control characters and lowercase four-hex-digit `\u00xx` for the remaining U+0000–U+001F controls. Other scalar characters remain literal UTF-8. Booleans/null are lowercase JSON literals. Integer values use exact canonical decimal spelling, with no leading zeroes, plus sign, fractional part, exponent or negative zero. Schema constraints still apply to each integer field. Integers are mathematically exact with no binary64 rounding or additional fixed-width ceiling.

Reject duplicate keys, extra fields, malformed UTF-8, surrogate code points, non-integer numbers and noncanonical serialized alternatives. Decoding includes exact canonical re-encoding equality; syntactically valid but differently escaped/ordered/spaced bytes are not this codec. All property names in these closed records are ASCII. This restricted codec is not general JCS, MessagePack or an alternate EventRecord digest.

Use lowercase SHA-256 for the following NEW Goal semantic hashes. Domain suffix `\n` below denotes one actual LF byte, not the two literal characters backslash and n:

| Value | Exact hash input |
|---|---|
| `currentness_hash` | UTF-8 `pm.goal.currentness.v1` plus LF, then canonical JSON of the other ten semantic body fields, excluding only `currentness_hash`. |
| `revision_hash` | UTF-8 `pm.goal.objective_revision.v1` plus LF, then canonical JSON of the other eight semantic revision fields, excluding only `revision_hash`. |
| Control `body_sha256` | Complete canonical JSON semantic body bytes, including `currentness_hash`, without a domain prefix. |
| Pending `intent_sha256` | UTF-8 `pm.goal.body_intent.v1` plus LF, then canonical JSON of every pending field except `intent_sha256`, including full afterimage, actual origin/authority and captured owner/stop/CAS facts. |
| Start `intent_sha256` | UTF-8 `pm.goal.body_start.v1` plus LF, then canonical JSON of exactly `{body, revision, origin}` containing the original accepted semantic records. |

These recipes target semantic `record` bytes, never the enclosing physical storage wrapper. Physical wrapper bytes/schema/version/origin are separately verified by SP-287. Pending intent is immutable for one reservation; recovery cannot refresh its captured fields under the same digest. Existing EventRecord/producer/receipt digest recipes remain unchanged. Pre-existing currentness/revision strings need explicit codec migration/adoption; readers do not reinterpret them as the new hashes.

The objective writer limit is exactly 4,000 Unicode scalar values, implementing the existing approximately 4,000-character convention. Preserve every accepted scalar and whitespace; overflow uses existing `objective_too_long`, never truncation. Surrogates reject. An oversized source record quarantines for owner review during migration. The existing field type remains string; this contract adds no nonempty-text requirement.

### One shared native mutation owner

`owner.goal.body.mutation@1.0.0` is the only native body mutation interface. Start, direct/approved objective update, metadata/lifecycle change, `active_run_ref`, cancellation custody, receipt association and any later GoalRun completion integration use the same exact Goal key, native Goal Runtime owner predicates and Storage transaction/lock. No public arbitrary write-JSON interface exists. A per-run expected revision, caller guard or process-local mutex cannot substitute for the shared body/control CAS. Every existing writer path must be explicitly adopted or remain disabled before activation.

Start authenticates existing explicit creation authority, exact original text/source origin, actual Project/thread ownership and visibility, current owner/registration/install/backup posture and ordinary writer authority. It atomically inserts semantic body revision 1, accepted objective revision 1, actual origin revision 1, hidden control and original narrow body receipt with absent-key CAS. Existing global Goal identity rules remain with the Goal owner; a foreign existing key is never overwritten. Start's narrow body commit does not alone establish success for a command requiring its separate creation receipt or event.

Update authenticates the current canonical body/control and complete accepted-history head/origin; exact expected ordinary revision/currentness; actual owner/permission/stop/deletion facts; no cancellation; and no conflicting reservation. Per-operation lifecycle or caller evidence predicates remain mandatory. The writer cannot change `goal_id`, `project_id`, `thread_id` or `created_at`; `updated_at` cannot precede creation or the prior update.

A direct Goal Activity Detail Save is the original accepted change, has `change_source = user_direct`, `source_message_id = null`, `approval_id = null`, and requires no second dialog. It is permitted in active, paused or blocked; completed rejects. An active Goal uses accepted replacement text only at its next continuation boundary, without mutating a turn already in flight. Initial creation may preserve its actual originating message and does not use the direct-edit null rule to erase genuine creation lineage.

An agent proposal requires the existing explicit user instruction to change the Goal and stays read-only until the approval host resolves a still-valid approval bound to this exact Goal, prior revision/currentness and exact proposed text. Request, denial, expiry or stale approval is not acceptance. Approved acceptance carries `agent_proposed_user_approved`, genuine nonnull `approval_id` and actual source-message evidence. Memory, compaction, model/Persona/provider changes, summaries and BSD advice have no body-writing authority.

### Accepted history and ordinary revision gaps

Every body mutation increments the single ordinary revision `n -> n+1`. An accepted objective write adds exactly one immutable objective revision at `n+1` and its exact corresponding admitted origin. Revision text equals the new body text; `change_source`, source-message/approval IDs and original accepted lineage come from actual source/Goal-owner evidence. A missing accepted lineage fences the write. Neither serializer nor body writer fabricates refs or copies old origin as a generic replacement template.

`prior_revision_hash` points to the latest accepted objective revision, even when metadata changes created ordinary revision gaps. Metadata-only updates preserve objective text, latest accepted objective revision/hash and all existing history/origin bytes, writing no fake objective revision or third change source. For example, ordinary body revision 4 can have latest accepted objective revision 2; the next accepted objective write is revision 5 pointing to revision 2's hash. Reading history never fills 3 or 4 with invented objective changes.

Initial accepted history is revision 1 with null predecessor. Later accepted members form a complete ordered chain with strictly increasing ordinary revisions, nondecreasing acceptance times and no duplicate/missing accepted member. Control identifies the current accepted head; current body objective equals that head's exact text. Each origin is bound to its actual accepted revision; no extra or foreign origin is adopted. Prior accepted records remain byte-identical.

### Durable reservation and final commit

For a separately staged producer, the same control carries one closed `#/$defs/pending`: `operation_id`, `owner_ref`, `owner_epoch`, `operation_kind`, `expected_revision`, `expected_currentness_hash`, `expected_stop_epoch`, `intent_sha256`, `after_record`, `accepted_revision`, `origin`, `original_change_authority_ref`, `external_authority_ref`. `operation_kind` is exactly `objective_update | metadata_update`. Objective update has both accepted revision and origin plus the actual original change-authority ref; metadata has neither and null change-authority ref. The producer's genuine external authority ref is separate; a direct atomic body write uses null. Proposed text/afterimage in a pending row is not current body or accepted history.

The separately staged producer must independently retain its complete original input/result/event authority before relying on this reservation. A reference's spelling does not prove that authority. Validate all before/after/approval/scope/identity predicates at admission. Reserve under native maintenance/shared Goal CAS, incrementing `control_epoch` while preserving the current body/history. A second owner/operation cannot overwrite it. Same operation plus identical intent resolves the same reservation or original receipt; changed intent conflicts.

Terminal commit captures the entire actual reserved control preimage, including nonnull pending and its `control_epoch`, then compares that whole preimage immediately before writing. It does not compare the older empty control or only `operation_id`. Recheck the complete original Goal-owner accepted-change/lineage predicate, still-valid approval where required, independently resolved external producer predicate, cancellation, owner/stop epochs, shared body/control CAS and all current Storage/access/deletion facts at the final write boundary. Atomically commit after-record, optional accepted revision/origin, updated control with reservation cleared and the original narrow body receipt.

Before reserve, a crash has no effect. After reserve, complete pending identity/afterimage and original accepted lineage survive. After commit, replay returns the original body receipt without reapplying. Unknown external effects stay pending/fenced until the exact producer resolves them; timeout or missing acknowledgement is not rollback authority. No partial body/history/control/receipt publication is allowed.

On restart, the original Goal owner may explicitly resolve captured original acceptance facts from genuinely admitted pending canonical control: exact original change-authority ref, revision/source metadata, origin, frozen afterimage and original CAS. This uses that pending row's authenticated native admission, not a recreated UI message or a new grant inferred from text. It does not itself accept history, emit an event or commit. Current approval, Goal state, owner/cancellation/stop, external effects, current access/Storage facts and whole pending preimage must still pass. Missing/foreign/unadmitted pending custody cannot use this recovery route. Late revocation/disappearance during an in-flight commit rejects; the writer does not silently invoke recovery inside that commit to replace lost authority.

### Stop, cancellation and external result boundaries

Manual Stop/Pause/Cancel retains priority. The genuine host stop epoch is independently durable and invalidates continuation dispatch immediately even while a reservation exists; body reservation cannot suppress Stop. A stale captured stop epoch is never refreshed into success. Resolving evidence association cannot itself resume or complete the Goal. A continuation/completion effect rechecks the latest stop epoch and its owning caller's completion evidence.

Pure body CAS requires neither a pre-existing first `AppendReceipt` nor SIR result: its narrow body receipt is part of the same atomic transaction. A producer whose own protocol requires an external receipt must independently prove it before terminal body commit. This shared reservation does not resolve that producer's unknown-effect protocol, return a UI success on its behalf or certify completion.

A reservation may clear through its owner only after proving no irreversible dependent effect needs reconciliation. Clearing is not event or receipt rollback. After authentic confirmed no-effect rollback, the producer's durable resolution terminates that original operation; retries resolve the original disposition and cannot reuse its identity for a fresh mutation. A new authorized operation after coherent restore/resolution has a new identity and revalidates current authority. Missing body receipt, empty slot or timestamp alone never proves rollback.

Cancellation uses the original Goal cancellation receipt under the shared fence and records its reference in control. The body keeps its four-state schema, accepted history remains readable while the thread is retained, and future continuation is prohibited. Cancellation is not thread deletion and creates no synthetic paused/cancelled state or fabricated cancellation receipt.

### Current body/history and independent receipt readers

The exact readers are `reader.goal.body@1.0.0`, `reader.goal.objective_history@1.0.0` and `reader.goal.body_mutation_receipt@1.0.0`. These are canonical native readers, not EventRecord projectors or checkpoints. They use SP-287 actual selected Storage/family/version/migration/backup origin and coherent physical snapshots, then validate these semantic record/hash/chain joins. Current body/history additionally require current Project/thread permissions and deletion/hold/owner/stop fences. At one final held disclosure/commit boundary, recheck semantic source currentness/bytes, selected physical row origin/bytes and every covered owner fact, or prove a native lease spanning all of them still valid. Separate earlier checks and a generic snapshot token are insufficient. The same joint final native boundary also covers physical synchronization/admission, backup capture/restore, tombstone filtering and physical purge under their actual owner predicates. Receipt-only audit covers its own current audit and receipt-custody facts without requiring ordinary body visibility.

Current read returns the old committed body while pending, with a separate pending/unavailable mutation disposition; it never publishes the afterimage as current. An ordinary viewer posture may permit reads, but a changed posture invalidates a captured lease and mutation always needs current writer admission. Later accepted-history reads do not reacquire original commands, old admission snapshots, source generations or original approval, and do not rerun an action. Current authorization to disclose differs from original acceptance. Native selected-store/origin authentication cannot be replaced by guessed/repaired matching hashes.

The independent receipt reader accepts exactly `#/$defs/receipt_read_request`: its reader binding plus Storage instance, Project, Goal, operation and intent identity. It resolves the admitted immutable canonical receipt at its exact physical key, validates original schema/codec/hash/origin and current app/Project/audit permission. It does not require a present body or ordinary thread visibility; thread deletion never waives those audit permissions. Before disclosure, recheck receipt identity/bytes and current receipt registration/install/migration/backup/access facts or their covering lease. A later body commit cannot re-seal a changed old receipt. After lawful body purge the receipt returns original body-commit facts only, no current availability claim or objective/history bytes, and creates no body hold.

Event traversal remains separately gated by that exact family's adopted SP-278 full source/currentness/checkpoint binding. These readers neither borrow another Goal/GoalRun checkpoint nor imply event traversal coverage. Workflow `accepted` never aliases `certified_with_approved_exception`; body transaction evidence supplies no certification exception.

### Lifetime, recovery and activation

DL-047 retains current body, all accepted objective revisions, minimal origin and control/pending text while their exact bound thread remains retained, including archived threads. Compaction, restart and model changes do not purge them. Deleting the thread immediately hides body content and purges active and backup copies under SP-287's exact 24-hour/30-day limits and valid-hold exceptions. A hold delays physical purge without restoring ordinary visibility. Cancellation alone does not delete the thread. Source-message/context/attachment/Plan/To-Do/workflow refs retain their independent lifetimes and cannot reconstruct purged content.

Body/control/history/origin are canonical non-rebuildable custody with coherent mandatory backup. Missing/corrupt members, broken chain, lost pending custody or origin mismatch fences dependent mutation and discloses owner recovery failure. Authorized coherent restore preserves the actual original instance's surviving complete current/history/origin/pending unit, replays current deletion tombstones before visibility and rechecks owner/stop predicates before continuation. Neither transcript summaries, old runtime lineage, EventRecords nor content-free receipts can recreate a missing objective. Proved lawful thread purge means terminal content-unavailable, not permission to restore deleted text.

Activation requires all exact physical family/schema/codec graph edges, protected backup, migration exclusion, verify-before-stamp and terminal MigrationReceipt round trip. Existing labels or absent rows do not prove installation. Read pre-existing semantic V2 through its actual admitted original codec/owner and preserve it losslessly before installing new keys/hashes; retain old hashes as migration evidence instead of reinterpreting them. Unsupported formats stay fenced. Every writer route is adopted or disabled before use of the shared API.

V1 migration retains existing GRS-056 rules: objective unchanged, dropped structure accounted for, in-flight paused/manual-stop posture preserved, cancellation receipt distinct, invalid Project/thread edge quarantined. Only the already authorized single revision 1 may be synthesized where no history exists; no intermediate revisions, approvals or lineage may be invented. If historical acceptance/source lineage cannot be proved, preserve original evidence and disclose unresolved migration. Body migration adds no third change source and does not widen certification.

### GRS-064 - Shared Goal Body Currentness And Accepted History

```yaml
plan_unit_id: GRS-064
unit_type: schema_contract
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  Preserve the exact eleven-field GoalRecordV2, nine-field objective revision and seven-field
  accepted origin. The Goal body currentness and history contract defines the exact local
  canonical JSON semantic hashes, concrete scalar limit, single ordinary revision/history
  chain and owner.goal.body.mutation@1.0.0 shared body/control transaction. Original accepted
  source authority, current approval/owner/stop/access facts and whole reserved control gate
  terminal writes. Independent current body/history and content-free receipt readers use
  actual canonical origin; original receipt audit survives lawful body purge without
  recreating text. SP-287 supplies separate physical wrappers/custody and DL-047 lifetime.
  No sibling Goal event or Workflow certification closure follows from this prerequisite.
gui_related: true
gui_classification_reason: Preserves exact accepted Goal text, direct Save/approval behavior and authorized history visibility through deletion and recovery.
depends_on: [GRS-048, GRS-050, GRS-051, GRS-054, GRS-056, DL-045, DL-047]
unblocks: []
acceptance_criteria:
  - Semantic 11/9/7 records and four-state Goal remain exact; hidden control and physical wrappers add no Goal fields.
  - Every body writer uses shared ordinary revision/currentness and whole-control CAS; metadata creates no fake objective revision.
  - Direct Save has null message/approval IDs, completed rejects editing, and approved proposals require exact current owner/approval/lineage.
  - Pending recovery preserves original accepted intent without raw-source reconstruction and never waives current approval/stop/external/access fences.
  - Stop defeats continuation immediately despite reservation; pure body receipt grants no event, SIR or completion success.
  - Current and audit readers authenticate canonical origin and final current facts; deleted text is never recreated from receipt/reference evidence.
validation_surfaces:
  - Plans/goal_body_custody.schema.json
  - Plans/goal_body_custody_fixtures.json
  - reports/event-authority-20260911/step-08-goal-body-validation.md
risk_class: goal_body_currentness_accepted_history_or_receipt_authority_escape
reasoning_tier: high
context_scope: shared_goal_body_history_custody_only
implementation_surfaces:
  - Plans/Goal_Runtime_System.md
  - Plans/goal_body_custody.schema.json
  - Plans/storage-plan.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/Goal_Runtime_System.md#GRS-048
  - Plans/Goal_Runtime_System.md#GRS-054
  - Plans/Goal_Runtime_System.md#GRS-056
  - Plans/Decision_Log.md#DL-045
  - Plans/Decision_Log.md#DL-047
negative_constraints:
  - No Goal title/phase/child/budget/role fields, fifth state, inferred Goal, fabricated accepted lineage or certification exception.
  - No automatic Goal event adoption/depth, native proof, WorkNode, NodeSeed, readiness or governance seal.
```

The exact schema/static transaction evidence and native obligations are recorded in `reports/event-authority-20260911/step-08-goal-body-validation.md`. Supplied model origin seals, owner/approval observations, rollback sets and transaction captures are test adapters, not new durable authority services. Actual global writer adoption, native canonical origin/authentication, shared CAS/stop priority, coherent restore/tombstone replay and 24-hour/30-day purge enforcement remain `NOT_RUN`; no runtime/depth/readiness/seal claim follows.

ContractRef: ContractName:Plans/Goal_Runtime_System.md#GRS-064, ContractName:Plans/storage-plan.md#SP-287, ContractName:Plans/goal_body_custody.schema.json, ContractName:Plans/Decision_Log.md#DL-047, ContractName:Plans/Decision_Log.md#DL-045

## Original Standard certification receipt

GRS-065 defines the minimal original Standard certification prerequisite under DL-045. SP-289 owns its same-family physical custody and explicit role/version installation; CV-340 owns exact schemas and hash bytes. The original current Plans-to-Code `goal_completion_receipt` remains unchanged at `Plans/plans_to_code_handoff.schema.json#/$defs/goal_completion_receipt`. This is the selected Standard source route, not a new Workflow lifecycle or a claim that every certification/exception producer is installed.

### Original issuer and complete decision

The actual owning Workflow controller or assigned canonical artifact owner issues the original typed decision. The existing Planning Run/final audit controller allocation in Planning Wizard remains authoritative; workers, auditors and receipt panels cannot promote their own result to certification. Source identity is its actual resolved ref and schema, not a hardcoded fixture location or a caller permission boolean. The schema and owner/target authorization, current source/workgraph revision and original issuance time must be authenticated before receipt custody.

Resolve the original Workflow's complete required WorkNode, child, validator and acceptance-criterion sets independently from the original workgraph/owner records. Require exact Project/Goal/GoalRun/receipt identity and scope, source ref, original certifier authority for that target, original tier and graph revision/hash. Each required WorkNode receipt validates against the original canonical `worknode_completion_receipt`, names the expected WorkNode and is complete without unresolved findings. Each required child receipt binds the original parent and required child Goal/GoalRun and successful result. Each validator's actual source record validates against `validator_outcome`, joins its expected source ref/ID, passed status and evidence; every required criterion has satisfied disposition and evidence. Missing/extra/duplicate/foreign/failed records reject.

The original Workflow's eight booleans (`all_worknodes_terminal`, `all_tests_passed_or_dispositioned`, `source_control_receipts_valid`, `no_active_blockers`, `rollback_requirements_satisfied`, `safe_point_requirements_satisfied`, `no_stale_plan_workgraph_currentness_mismatch`, `auditor_passed`) are actually true, with valid original referenced source/runtime/admission evidence; setting flags in a supplied object is insufficient. Its final source state is `clean` or `intentionally_preserved`, decision is `certified`, and unresolved risks are empty. Actual original authority checks bind the certifier and GoalRun, and original issuance/observation chronology is valid without rewriting timestamp spelling or precision.

The original typed receipt retains the exact source/graph/authority hashes and refs, acceptance dispositions, changed artifacts, validator outputs and their source bindings, complete child/WorkNode requirements, certifier identity, original time and decision. Independently project those complete fields from the actual original owner records before copy/serialization. Compare the issuer return and full pending Storage row against that projection, and include actual origin evidence as well as source values in the final complete owner guard. A correct detached receipt hash never substitutes for actual owner authorization or canonical origin.

### Standard scope and truthful exceptions

The newly bound route is exactly `certification_tier = standard`, `final_certifier_decision = certified`, truthful label `certified`, no unresolved risks or exception approvals, and passing validators. The existing D-R18 branch `certified_with_approved_exception`, approval/residual-risk evidence and truthful `completed_with_approved_verification_exception` remain semantically preserved in CV-340. They are excluded from this Standard writer. An approved testing restriction or incomplete-item disposition alone supplies neither an original final Workflow decision nor an automated pass. The selected Plans-to-Code source has no exception decision; the exact original exception/waiver owner route remains separately unbound. This prerequisite does not invent it, widen the source enum or revoke D-R18's already specified distinction.

The broad generic v1 receipt grammar and all original kinds/tiers keep their own meaning. A string `accepted`, a receipt kind, worker success, a body mutation receipt, a projected state or an event observation is not the original Standard receipt. Actual original receipt durability precedes D-R18's eventual `provisional_success|verifying -> certified` GoalRun transition/event; projection follows append. This prerequisite performs neither transition nor event append.

### Body, event and retained disclosure boundaries

The four-state text-first Goal remains under GRS-064; Workflow GoalRun status is separate. Each future event producer must explicitly compose the actual body/control/history/origin, current access/deletion/cancellation/stop/owner state, source Workflow decision, original input, exact event and shared first-AppendReceipt authority. It must use the shared body CAS/reservation interface and complete final joint guard, not a parallel Goal mutation engine. D-R09 evidence association still requires a pre-existing receipt and changes evidence only. No Goal objective/state/revision/history is changed by this receipt-only prerequisite, and no current state is inferred from retired Goal states.

After genuine admission, SP-289's retained reader returns exact original content-free certification metadata from actual canonical custody without reacquiring disposed original Workflow controls or deleted Goal text. Current permission to disclose and native row origin remain required; original permission to issue is retained as evidence, not current action permission. Existing generic views may read the exact compatibility component without claiming Standard proof. Receipt loss cannot be repaired into success from raw events or generic accepted markers. DL-047 body/content lifetime and the existing receipt authority lifetime remain separate; refs create no new content hold.

The fixtures establish bounded original-source and retained-read relationships only. Supplied Workflow/graph/child/validator owner envelopes are test seams, not new durable source families, native authorization services or original-source retention requirements. The initial fixture's generic-shaped component does not prove native absence of its same-key destination. Native original issuance/authentication, actual Standard role installation, complete validator/runtime gates, durability, event producer and GoalRun/body publication remain NOT_RUN; see `reports/event-authority-20260911/step-08-certified-custody-validation.md`.

### GRS-065 - Original Standard Workflow Certification Decision

```yaml
plan_unit_id: GRS-065
unit_type: schema_contract
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  Original Standard certification comes from the actual owning Workflow controller or assigned
  canonical artifact owner and complete independently resolved source, target authority, workgraph,
  validator, child, WorkNode and acceptance evidence. The Original Standard certification receipt
  contract preserves its immutable decision and truthful labels through SP-289 custody, keeps
  existing generic receipts and exception semantics separate, and grants no Goal/body/event action.
gui_related: false
gui_classification_reason: Defines internal original certification metadata, custody and owner interfaces; no GUI presentation is specified.
depends_on: [GRS-042, GRS-064, CV-288, CV-340, DL-045]
unblocks: []
acceptance_criteria:
  - "The actual original source and certifier/target/scope/revision/time evidence independently establish every required dependency and Standard final decision."
  - "Original issuer/Storage outputs exactly match actual complete source projection and remain guarded through final current owner/origin checks."
  - "Generic accepted markers, worker success and body receipts never substitute for original Standard certification."
  - "D-R18 exception/waiver semantics stay distinct and unavailable through this Standard route; no new policy or source enum is granted."
  - "Receipt disclosure preserves original metadata after lawful source/body disposal and grants no current action, event proof or Goal/GoalRun transition."
validation_surfaces:
  - Plans/goal_certification_custody.schema.json
  - Plans/goal_certification_custody_fixtures.json
  - Plans/goal_receipt_version_routes.json
  - reports/event-authority-20260911/step-08-certified-custody-validation.md
risk_class: false_certification_or_lost_original_decision_authority
reasoning_tier: high
context_scope: original_standard_workflow_certification
implementation_surfaces:
  - Plans/Goal_Runtime_System.md
  - Plans/storage_value_registry.json
node_compile_hint:
  mode: original_standard_workflow_certification
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - reports/event-authority-20260911/step-08-certified-custody-checks.json
negative_constraints:
  - Do not infer certification from an accepted marker, worker success, body receipt, event or projection.
  - Do not claim native installation, event/body publication, exception authority or complete event depth from this prerequisite.
owner_hints:
  - Plans/Goal_Runtime_System.md
  - Plans/storage-plan.md
  - Plans/Contracts_V0.md
```
