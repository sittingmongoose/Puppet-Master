# Scheduling and Quota Resume

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: "Puppet Master" only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.
> **PlanProfile:** New Plan Authoring Profile
> **Authority:** Canonical sole owner of scheduled message snapshots, exact-version scheduled Plan builds, recurring execution windows, wind-down and safe pause, timezone/DST/missed-time policy, quota wait and reset truth, quota auto-resume consent, the shared eligibility evaluation, the automation precedence order, and server-owned timers and their recovery. It does not own the work being scheduled, provider quota facts, Usage totals, Plan or Goal semantics, composer state, or physical storage.

## 0. Scope

### Scope

Two capabilities live here because they share one mechanism: deciding whether some already-defined work may run *now*.

**Scheduling** answers "run this at a chosen time". **Quota resume** answers "run this again when the provider's usage window reopens". Both revalidate the same eligibility surface before dispatch, both are server-owned so they survive client closure, and both are outranked by the same manual controls.

This owner exists so that no caller invents its own timer. Goal Runtime, Assistant Plan Runtime, Collaborative Workflows, and the Assistant composer all *consume* this service. None of them owns a schedule, a window, a wind-down, a reset time, or a resume decision.

Scheduling and Quota Resume owns:

- `ScheduledMessageSnapshot` — the frozen composer dispatch;
- `ExecutionSchedule` — one-time and recurring windows bound to an exact target;
- `QuotaResumeConsent` — the user's opt-in to automatic resume plus the reset truth it was based on;
- wind-down semantics and the safe-pause boundary;
- IANA timezone handling, DST policy, and missed-time policy;
- the shared eligibility predicate and the precedence order;
- idempotency, currentness revalidation, and restart recovery for timers.

It does not own:

- the message, Plan, Goal, Crew run, or agent run being scheduled;
- provider quota facts, limits, or Usage totals (`Plans/usage-feature.md`);
- provider or account health (`Plans/Models_System.md`, `Plans/Multi-Account.md`);
- permissions (`Plans/Permissions_System.md`);
- attachment custody or availability (`Plans/FileSafe.md`, `Plans/FileManager.md`);
- composer buffer or destination state (`Plans/assistant-chat-design.md`);
- storage keys, replay, retention, or projector checkpoints (`Plans/storage-plan.md`).

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/usage-feature.md, ContractName:Plans/Goal_Runtime_System.md, ContractName:Plans/Assistant_Plan_Runtime.md, ContractName:Plans/Collaborative_Workflows.md

## 1. Ownership And Consumers

### Precedence — the rule everything else defers to

From highest to lowest:

1. user Cancel or Stop;
2. user manual Pause;
3. owner safety, permission, or recovery block;
4. inactive execution window;
5. quota unavailable;
6. scheduled eligibility;
7. Goal, Plan, or Crew automatic continuation.

An automatic mechanism may never clear a higher-priority state. Concretely: a quota reset does not resume manually stopped work; a window opening does not resume manually stopped work; a schedule firing does not resume manually stopped work; a cleared dependency does not resume manually stopped work; and a provider-native retry does not resume manually stopped work.

Manual Stop, Pause, and Cancel latch a monotonically increasing `user_stop_epoch`. Every eligibility evaluation captures the epoch it was computed against and compares it again at dispatch. A dispatch decided before a manual stop and delivered after it is discarded rather than executed. Only an explicit user resume, or a new schedule the user creates, clears the latch.

This precedence is normative for every consumer. Where any other document appears to permit automatic resume over a manual stop, this document wins.

ContractRef: ContractName:Plans/Goal_Runtime_System.md, ContractName:Plans/Executor_Protocol.md

### Settings boundary

Settings stores the defaults; this owner stores the operational records. The defaults are `assistant.scheduling.wind_down_minutes` (10), `assistant.scheduling.missed_dispatch_policy` (`hold`), `assistant.scheduling.default_grace_minutes` (30), `assistant.scheduling.resume_next_window` (true), `assistant.usage.auto_resume_default` (false), and `assistant.scheduling.dst_policy` (`preserve_local_wall_clock`).

A default is read at creation time and copied into the record. Changing a default afterwards never retroactively alters an existing schedule or consent. These keys require Settings inventory census and registration through `Plans/Settings_System.md` and `Plans/settings_inventory.json`; naming them here fixes ownership and does not claim registration.

ContractRef: ContractName:Plans/Settings_System.md

## 2. Canonical PlanUnits

### SQR-001 - Manual Stop Precedence Over Every Automatic Mechanism

```yaml
plan_unit_id: SQR-001
unit_type: constraint
status: accepted
owner_doc: Plans/Scheduling_and_Quota_Resume.md
canonical_text: >-
  Automation precedence from highest to lowest is user Cancel or Stop, user manual Pause, owner safety/permission/recovery block, inactive execution window, quota unavailable, scheduled eligibility, and Goal/Plan/Crew automatic continuation. An automatic mechanism may never clear a higher-priority state. Manual Stop, Pause, and Cancel latch a monotonically increasing user_stop_epoch; every eligibility evaluation captures the epoch it was computed against and compares it again at dispatch, and a dispatch decided before a manual stop and delivered after it is discarded. Only an explicit user resume or a new user-created schedule clears the latch. This precedence is normative for every consumer and wins over any other document that appears to permit automatic resume over a manual stop.
gui_related: true
gui_classification_reason: Resume controls must render disabled with the latched-stop reason rather than appearing available.
depends_on: []
unblocks: [SQR-005, SQR-006]
acceptance_criteria:
  - A quota reset, window opening, cleared dependency, schedule firing, or provider retry does not resume manually stopped work.
  - A dispatch decided before a stop and delivered after it is discarded.
  - Only an explicit user action clears the latch.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - node tests/scheduling-verify.mjs
risk_class: automatic_resume_overrides_user_stop
reasoning_tier: high
context_scope: scheduling_precedence
implementation_surfaces:
  - Plans/Scheduling_and_Quota_Resume.md
  - Plans/Goal_Runtime_System.md
  - Plans/Assistant_Plan_Runtime.md
  - Plans/Collaborative_Workflows.md
node_compile_hint:
  mode: scheduling_precedence_contract
  create_worknodes: false
source_lineage:
  - pm-assistant-implementation-2026-09-02-recovered:SCHED-001
  - pm-assistant-implementation-2026-09-02-recovered:01_IMPLEMENTATION_SPEC.md#15.5
preserved_exact_tokens:
  - "user_stop_epoch"
  - "manual_stop_latched"
negative_constraints:
  - Do not let any automatic mechanism clear a manual stop.
  - Do not evaluate eligibility once and dispatch without re-checking the stop epoch.
owner_hints:
  - Plans/Scheduling_and_Quota_Resume.md
```

### SQR-002 - Scheduled Message Exact Snapshot And Wand Placement

```yaml
plan_unit_id: SQR-002
unit_type: requirement
status: accepted
owner_doc: Plans/Scheduling_and_Quota_Resume.md
canonical_text: >-
  Schedule Message lives in the wand menu and freezes a ScheduledMessageSnapshot carrying thread, destination, exact text, exact attachments, the selected runtime/model/account snapshot, scheduled time, IANA timezone, local wall time, missed policy, grace, state, and expected thread currentness. Before dispatch the service revalidates destination, attachment availability, project and worktree, permissions, and the selected route, and never silently sends to a different destination, model, or account; where the recorded route is unavailable the dispatch holds and surfaces the substitution the user would have to accept. Missed-time behavior is the user's choice of hold, next_available, or cancel_after_grace, defaulting to hold with a thirty-minute grace.
gui_related: true
gui_classification_reason: This unit places the control in the wand and defines the schedule modal's fields and summary.
depends_on: [SQR-001]
unblocks: []
acceptance_criteria:
  - The scheduled message sends the exact frozen text, attachments, destination, and route.
  - An unavailable route holds the dispatch instead of substituting.
  - Missed-time policy behaves as chosen.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - node tests/scheduling-verify.mjs
risk_class: silent_destination_or_route_substitution
reasoning_tier: high
context_scope: scheduled_message_snapshot
implementation_surfaces:
  - Plans/Scheduling_and_Quota_Resume.md
  - Plans/assistant-chat-design.md
  - Concepts/chat-assistant-concepts/5.6 Pro/scheduling.js
node_compile_hint:
  mode: scheduled_message_contract
  create_worknodes: false
source_lineage:
  - pm-assistant-implementation-2026-09-02-recovered:SCHED-002
  - pm-assistant-implementation-2026-09-02-recovered:02_RUNTIME_AND_STORAGE_CONTRACTS.md#2.3
preserved_exact_tokens:
  - "pm.chat.scheduled_message_snapshot.v1"
  - "Schedule Message"
negative_constraints:
  - Do not re-derive the message at dispatch time.
  - Do not substitute destination, model, or account silently.
owner_hints:
  - Plans/Scheduling_and_Quota_Resume.md
```

### SQR-003 - Exact-Version Scheduled Build And Revision Invalidation

```yaml
plan_unit_id: SQR-003
unit_type: requirement
status: accepted
owner_doc: Plans/Scheduling_and_Quota_Resume.md
canonical_text: >-
  Build At binds the exact plan_id, plan_version, and content hash through exact_target_version and exact_target_hash and never binds the current Plan. A Plan revision invalidates the pending schedule, which moves to invalidated with invalidated_reason naming the version change and requires an explicit update or reschedule; building a newer version than the user scheduled, or silently rebinding to the newest version, is a defect. Repeated schedules against one target are execution windows for the same run, not repeated duplicate builds, and idempotency keyed on schedule_id, target_id, exact_target_hash, and occurrence_start prevents double dispatch from a restart, a duplicate timer fire, or a clock adjustment. Build With Crew schedules identically because the crew configuration is part of the target, not the schedule.
gui_related: true
gui_classification_reason: The Plan card must show an invalidated schedule and require an explicit reschedule rather than silently rebinding.
depends_on: [SQR-001]
unblocks: [SQR-004]
acceptance_criteria:
  - A Plan revision invalidates the pending build schedule with a reason.
  - A nightly window produces one resumed run, not duplicate builds.
  - A duplicate timer fire returns the original result.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - node tests/scheduling-verify.mjs
risk_class: wrong_plan_version_built_or_duplicate_nightly_build
reasoning_tier: high
context_scope: scheduled_plan_build
implementation_surfaces:
  - Plans/Scheduling_and_Quota_Resume.md
  - Plans/Assistant_Plan_Runtime.md
node_compile_hint:
  mode: exact_version_scheduled_build
  create_worknodes: false
source_lineage:
  - pm-assistant-implementation-2026-09-02-recovered:SCHED-003
  - pm-assistant-implementation-2026-09-02-recovered:01_IMPLEMENTATION_SPEC.md#15.2
preserved_exact_tokens:
  - "exact_target_hash"
  - "invalidated"
negative_constraints:
  - Do not rebind a schedule to a newer Plan version.
  - Do not produce one build per window occurrence.
owner_hints:
  - Plans/Scheduling_and_Quota_Resume.md
```

### SQR-004 - Execution Windows, Wind-Down, And DST Policy

```yaml
plan_unit_id: SQR-004
unit_type: requirement
status: accepted
owner_doc: Plans/Scheduling_and_Quota_Resume.md
canonical_text: >-
  ExecutionSchedule supports one-time and recurring windows with start time, optional pause time, wind-down duration, days of week, IANA timezone, DST policy, and auto-resume-next-window, and applies to Agent work, Goal-driven work, Plan and Deep Plan builds, and Crew runs. Wind-down is not a pause: at pause time minus wind_down_seconds the service stops admitting large or non-checkpointable new work, lets the current bounded atomic operation reach a safe point, persists state and To-Do work bindings, and only then pauses; interrupting an atomic operation mid-write is a defect. DST policy defaults to preserve_local_wall_clock, a spring-forward gap resolves to the first valid instant after the gap, a fall-back repetition fires once on the first occurrence with idempotency preventing the second, and timezone is stored as an IANA name rather than a fixed offset.
gui_related: true
gui_classification_reason: The schedule surface summarizes the window, timezone, next occurrence, and any DST resolution in plain language.
depends_on: [SQR-003]
unblocks: []
acceptance_criteria:
  - Wind-down reaches a safe point and persists To-Do work bindings before pausing.
  - A spring-forward gap and a fall-back repetition each produce exactly one dispatch.
  - The summary never shows a next occurrence it cannot compute.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - node tests/scheduling-verify.mjs
risk_class: unsafe_pause_or_dst_double_fire
reasoning_tier: high
context_scope: execution_windows
implementation_surfaces:
  - Plans/Scheduling_and_Quota_Resume.md
  - Plans/Executor_Protocol.md
  - Concepts/chat-assistant-concepts/5.6 Pro/scheduling.js
node_compile_hint:
  mode: execution_window_contract
  create_worknodes: false
source_lineage:
  - pm-assistant-implementation-2026-09-02-recovered:SCHED-004
  - pm-assistant-implementation-2026-09-02-recovered:01_IMPLEMENTATION_SPEC.md#15.3
preserved_exact_tokens:
  - "pm.execution.schedule.v1"
  - "wind_down_seconds"
  - "preserve_local_wall_clock"
negative_constraints:
  - Do not pause mid-atomic-operation.
  - Do not store a fixed offset in place of an IANA timezone.
owner_hints:
  - Plans/Scheduling_and_Quota_Resume.md
```

### SQR-005 - Quota Reset Truth And Opt-In Auto-Resume Consent

```yaml
plan_unit_id: SQR-005
unit_type: requirement
status: accepted
owner_doc: Plans/Scheduling_and_Quota_Resume.md
canonical_text: >-
  When provider usage is exhausted the Assistant shows a compact strip below the working area naming the paused reason, the reset time, and the reset truth as provider_reported, locally_inferred, user_supplied, or unknown, plus an opt-in checkbox to resume automatically when usage is available. A locally inferred estimate is labelled as inferred with a confidence, an unknown reset says unknown and offers the user a field to supply an expected time, and no confident exact countdown is displayed that the service does not have. Consent is recorded as QuotaResumeConsent scoped to run, provider, and account, is not a global setting, and defaults to false. A quota wait does not change Goal state and does not change the Plan Build control label: the Goal stays active with its run waiting and the Plan stays Building.
gui_related: true
gui_classification_reason: This unit is the exact rendering contract for the quota wait strip and its checkbox.
depends_on: [SQR-001]
unblocks: [SQR-006]
acceptance_criteria:
  - Reset truth and its source are always shown together.
  - An unknown reset is never rendered as a confident countdown.
  - Auto-resume is off by default and scoped to run, provider, and account.
  - A quota wait leaves Goal state and the Build control label unchanged.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - node tests/scheduling-verify.mjs
risk_class: fabricated_reset_time_or_global_auto_resume
reasoning_tier: high
context_scope: quota_wait_and_consent
implementation_surfaces:
  - Plans/Scheduling_and_Quota_Resume.md
  - Plans/usage-feature.md
  - Concepts/chat-assistant-concepts/5.6 Pro/scheduling.js
node_compile_hint:
  mode: quota_resume_consent_contract
  create_worknodes: false
source_lineage:
  - pm-assistant-implementation-2026-09-02-recovered:SCHED-005
  - pm-assistant-implementation-2026-09-02-recovered:01_IMPLEMENTATION_SPEC.md#15.4
preserved_exact_tokens:
  - "pm.runtime.quota_resume_consent.v1"
  - "provider_reported"
  - "locally_inferred"
  - "user_supplied"
  - "unknown"
negative_constraints:
  - Do not display a false exact countdown.
  - Do not make auto-resume a global default-on setting.
owner_hints:
  - Plans/Scheduling_and_Quota_Resume.md
```

### SQR-006 - Shared Eligibility Revalidation Before Every Dispatch

```yaml
plan_unit_id: SQR-006
unit_type: requirement
status: accepted
owner_doc: Plans/Scheduling_and_Quota_Resume.md
canonical_text: >-
  One eligibility predicate governs scheduled messages, scheduled builds, window resume, and quota resume. Every clause must hold: consent or schedule active, target run existing and unfinished, no latched manual pause or cancel with a matching user_stop_epoch, an open execution window or none applicable, healthy provider and account as recorded, a current target by exact Plan version and hash or exact message snapshot and thread currentness, no permission/safety/recovery block, required tools/MCP/skills available as recorded, and a resolvable project and worktree. Evaluation happens twice -- once to decide and once immediately before dispatch -- and any clause failing at the second check aborts the dispatch and records the exact failed clause. Resume applies to unfinished work only and never replays a completed side effect. An aborted dispatch is visible, never silent.
gui_related: true
gui_classification_reason: The exact failed clause must be surfaced to the user so the blocked automation is actionable.
depends_on: [SQR-001, SQR-005]
unblocks: []
acceptance_criteria:
  - Eligibility is evaluated twice and re-checked immediately before dispatch.
  - A resume never replays work committed before the pause.
  - An aborted dispatch names the exact failed clause and is visible.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - node tests/scheduling-verify.mjs
risk_class: stale_eligibility_or_replayed_side_effect
reasoning_tier: high
context_scope: scheduling_eligibility
implementation_surfaces:
  - Plans/Scheduling_and_Quota_Resume.md
  - Plans/Permissions_System.md
  - Plans/Tools.md
node_compile_hint:
  mode: scheduling_eligibility_predicate
  create_worknodes: false
source_lineage:
  - pm-assistant-implementation-2026-09-02-recovered:SCHED-006
  - pm-assistant-implementation-2026-09-02-recovered:02_RUNTIME_AND_STORAGE_CONTRACTS.md#9.2
preserved_exact_tokens:
  - "revalidate"
  - "unfinished work only"
negative_constraints:
  - Do not dispatch on a stale eligibility decision.
  - Do not replay a completed side effect on resume.
  - Do not abort a dispatch silently.
owner_hints:
  - Plans/Scheduling_and_Quota_Resume.md
```

### SQR-007 - Server-Owned Timers, Idempotency, And Restart Recovery

```yaml
plan_unit_id: SQR-007
unit_type: requirement
status: accepted
owner_doc: Plans/Scheduling_and_Quota_Resume.md
canonical_text: >-
  Timers are server-owned: closing the client, switching threads, switching projects, or reloading neither cancels a schedule nor fires one early, and no client-side timer constitutes a schedule. Every dispatch carries an idempotency key derived from schedule identity, target identity, exact target hash, and occurrence start, so a duplicate timer fire, a restart during dispatch, or a clock adjustment returns the original result rather than executing twice. On restart the service reloads active schedules and consents, recomputes the next occurrence from the stored IANA timezone and DST policy, and applies the missed policy to occurrences that passed while it was down without firing a backlog burst -- hold holds, next_available collapses the backlog to one dispatch, and cancel_after_grace expires what is past its grace. A schedule whose target was deleted, cancelled, or invalidated moves to invalidated with a reason and is not retried.
gui_related: false
gui_classification_reason: Timer ownership and recovery are server behavior; the GUI only reflects the resulting schedule state.
depends_on: [SQR-004]
unblocks: []
acceptance_criteria:
  - A client close or reload neither cancels nor early-fires a schedule.
  - A duplicate fire or restart-during-dispatch returns the original result.
  - Restart applies the missed policy without a backlog burst.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - node tests/scheduling-verify.mjs
risk_class: client_owned_timer_or_duplicate_dispatch
reasoning_tier: high
context_scope: scheduling_server_ownership
implementation_surfaces:
  - Plans/Scheduling_and_Quota_Resume.md
  - Plans/Server_System.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: scheduling_timer_ownership
  create_worknodes: false
source_lineage:
  - pm-assistant-implementation-2026-09-02-recovered:SCHED-007
  - pm-assistant-implementation-2026-09-02-recovered:02_RUNTIME_AND_STORAGE_CONTRACTS.md#13
preserved_exact_tokens:
  - "idempotency"
  - "missed_policy"
negative_constraints:
  - Do not implement a schedule as a client-side timer.
  - Do not fire a burst of missed occurrences on restart.
owner_hints:
  - Plans/Scheduling_and_Quota_Resume.md
```

## 3. Contracts, Schemas, Events, Or Data Shapes

### Schedule Message

`Schedule Message` lives in the **wand** menu — not in the mode menu, and not in the composer tools row.

Scheduling freezes a `ScheduledMessageSnapshot`:

```yaml
schema_id: pm.chat.scheduled_message_snapshot.v1
fields:
  scheduled_dispatch_id: string
  project_id: string
  thread_id: string
  destination_ref: ComposerDestination
  text_blob_ref: string
  attachment_refs: [AttachmentRef]
  requested_runtime_snapshot_ref: string
  scheduled_at_utc: timestamp
  timezone: IANA string
  local_wall_time: string
  missed_policy: hold|next_available|cancel_after_grace
  grace_seconds: integer|null
  state: scheduled|held|dispatched|cancelled|failed|expired
  expected_thread_currentness: string
  revision: integer
```

The snapshot freezes thread and destination, the exact text, the exact attachments, and the selected runtime, model, and account. It is an exact snapshot, not a re-derivation: a message scheduled at noon sends the text that existed at noon.

Before dispatch the service revalidates destination, attachment availability, project and worktree, permissions, and the selected route. A failure to revalidate is a held or failed dispatch that names the reason. The service must never silently send to a different destination, a different model, or a different account than the snapshot recorded. Where the recorded route is no longer available, the dispatch holds and surfaces the substitution the user would have to accept, rather than substituting on their behalf.

Missed-time behavior is the user's choice at schedule time: `hold` keeps the dispatch pending until the user acts; `next_available` sends at the next opportunity; `cancel_after_grace` expires the dispatch after `grace_seconds`. The default missed policy is `hold` and the default grace is thirty minutes, both configurable through Settings.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FileSafe.md, ContractName:Plans/Permissions_System.md

### Build At and exact-version binding

`Build At…` is a Plan card action owned in its UI placement by `Plans/Assistant_Plan_Runtime.md` and in its scheduling semantics by this document.

A scheduled Plan build binds the exact `plan_id`, `plan_version`, and content hash through `exact_target_version` and `exact_target_hash`. It does not bind "the current Plan".

A revision **invalidates** the pending schedule. The schedule moves to `invalidated` with `invalidated_reason` naming the version change, and it requires an explicit update or reschedule. Building a newer Plan than the user scheduled is a defect, and silently rebinding to the newest version is the same defect with better manners.

Repeated schedules against one target are **execution windows for the same run**, not repeated duplicate builds. A nightly window that opens five times does not produce five builds of the same Plan version; it produces one run that is admitted, paused at wind-down, and resumed in the next window. Idempotency is keyed on `(schedule_id, target_id, exact_target_hash, occurrence_start)` so that a restart, a duplicate timer fire, or a clock adjustment cannot double-dispatch.

`Build With Crew` and an ordinary build schedule identically; the crew configuration is part of the target, not part of the schedule.

ContractRef: ContractName:Plans/Assistant_Plan_Runtime.md, ContractName:Plans/Collaborative_Workflows.md

### Execution windows

`ExecutionSchedule` covers both one-time and recurring windows:

```yaml
schema_id: pm.execution.schedule.v1
fields:
  schedule_id: string
  project_id: string
  target_kind: scheduled_message|assistant_plan_run|crew_run|goal_run|agent_run
  target_id: string
  exact_target_version: integer|null
  exact_target_hash: string|null
  schedule_kind: one_time|recurring_window
  timezone: IANA string
  local_start: string
  local_pause: string|null
  days_of_week: [integer]
  wind_down_seconds: integer
  missed_policy: hold|next_available|cancel_after_grace
  auto_resume_next_window: boolean
  state: active|paused|cancelled|completed|invalidated
  revision: integer
  invalidated_reason: string|null
```

A window has a start time, an optional pause time, a wind-down duration, days of week, an IANA timezone, a DST policy, and an auto-resume-next-window flag. Windows apply to Agent work, Goal-driven work, Plan and Deep Plan builds, and Crew runs alike.

**Wind-down** is the important part and is not the same as a pause. At `local_pause` minus `wind_down_seconds`, the service stops admitting large or non-checkpointable new work, lets the current bounded atomic operation reach a safe point, persists state and To-Do work bindings, and only then pauses. A pause that interrupts an atomic operation mid-write is a defect. The default wind-down is ten minutes, configurable through Settings.

**DST policy** defaults to `preserve_local_wall_clock`: a window declared for 22:00 local opens at 22:00 local on both sides of a transition. A spring-forward gap that removes the declared local time resolves to the first valid instant after the gap; a fall-back repetition that duplicates the declared local time fires once, on the first occurrence, and the idempotency key prevents the second. Timezone is stored as an IANA name, never as a fixed offset, so a rule change is picked up rather than baked in.

The GUI summarizes the effective schedule in plain language, including the timezone and the next occurrence in the user's local time, and shows the DST resolution when one applies. It never displays a confident next-occurrence time it cannot compute.

ContractRef: ContractName:Plans/Settings_System.md, ContractName:Plans/Executor_Protocol.md

### Quota wait, reset truth, and consent

When provider usage is exhausted, the run enters a shared quota wait. The Assistant shows a compact status strip below the working and activity area:

```text
Paused · Provider Usage exhausted
Reset: <time> · Provider reported / locally inferred / user supplied / unknown
[ ] Resume automatically when Usage is available
```

`reset_truth` is one of `provider_reported`, `locally_inferred`, `user_supplied`, or `unknown`, and it is always shown next to the time. A locally inferred estimate is labelled as inferred and carries a confidence; an unknown reset says unknown and offers the user a field to enter an expected reset time. The service must never display a confident exact countdown it does not have, and must never present an inference as a provider fact.

The auto-resume checkbox is **opt-in** and is recorded as `QuotaResumeConsent`:

```yaml
schema_id: pm.runtime.quota_resume_consent.v1
fields:
  consent_id: string
  run_id: string
  provider_id: string
  account_id: string
  enabled: boolean
  reset_time: timestamp|null
  reset_truth: provider_reported|locally_inferred|user_supplied|unknown
  confidence: number|null
  execution_schedule_id: string|null
  user_stop_epoch: integer
  created_at: timestamp
  updated_at: timestamp
```

Consent is scoped to a run, a provider, and an account. It is not a global setting that silently applies to future unrelated work, and the application default (`assistant.usage.auto_resume_default`) is `false`.

A quota wait does not change the Goal `state` and does not change the Plan Build control's label: a Goal stays `active` with its run waiting, and a Plan stays `Building…`. The wait belongs to the run, not to the objective or the document.

ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/Models_System.md, ContractName:Plans/Multi-Account.md

### Shared eligibility evaluation

One predicate governs every automatic dispatch — scheduled message, scheduled build, window resume, and quota resume. Every clause must hold:

- consent or schedule is `enabled`/`active`;
- the target run still exists and is unfinished;
- no manual pause or cancel is latched, and `user_stop_epoch` matches the epoch the decision was computed against;
- the execution window is currently open, or none applies;
- provider and account are healthy and selected as recorded;
- the target is current — exact Plan version and hash, or exact message snapshot and thread currentness;
- no permission, safety, or recovery block is active;
- required tools, MCP servers, and skills are available as recorded;
- the project and worktree still resolve.

Evaluation happens twice: once to decide, once immediately before dispatch. Any clause failing at the second check aborts the dispatch and records the exact failed clause. Resume applies to unfinished work only and never replays a completed side effect; work already committed before the pause is not redone.

An aborted dispatch is visible, not silent. It records which clause failed so the user can act on it.

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Tools.md, ContractName:Plans/MCP_Integration.md

### Exact commands and required result boundaries

| Command ID | Meaning | Required result boundary |
|---|---|---|
| `cmd.chat.schedule_message` | Freeze and schedule the composer's exact text and attachments from the wand | Returns `scheduled_dispatch_id` and the frozen snapshot ref. Creates no Goal, Plan, or To-Do. |
| `cmd.chat.schedule_message.update` | Update a pending scheduled message | Rebinds the exact snapshot under the expected revision; refused once dispatch has started. |
| `cmd.chat.schedule_message.cancel` | Cancel a pending scheduled message | Terminal; the snapshot is retained for audit and never dispatched. |
| `cmd.chat.plan.schedule_build` | Bind an execution schedule to an exact Plan version and hash | Returns `schedule_id` with `exact_target_version` and `exact_target_hash` set; a later Plan revision invalidates it. |
| `cmd.execution_window.create` | Create a one-time or recurring execution window | Returns `schedule_id`; creating a window admits no work by itself. |
| `cmd.execution_window.update` | Update an execution window | Never silently changes an in-flight run's admission; a narrowed window takes effect at the next wind-down boundary. |
| `cmd.execution_window.cancel` | Cancel an execution window | Work already admitted continues under its own owner; cancelling a window is not a Stop. |
| `cmd.runtime.quota_resume.set` | Record opt-in consent to resume when quota resets | Requires a known `reset_truth` value; consent is scoped to run, provider, and account and is defeated by a latched manual stop. |

Every request carries `schema_id`, `schema_version`, command ID, command instance ID, `project_id`, target identity, expected revision, expected target hash where applicable, actor, permission snapshot, idempotency key, source surface, and return route. Typed errors are `invalid_request`, `schedule_not_found`, `stale_schedule_revision`, `target_not_found`, `target_version_changed`, `dispatch_already_started`, `manual_stop_latched`, `window_inactive`, `quota_unavailable`, `reset_truth_unknown`, `route_unavailable`, `command_not_registered`, `permission_denied`, `owner_unavailable`, or `cancelled`.

Until the central command catalog, Event Authority, and production wiring rows close for a given ID, its controls render disabled with `command_not_registered`. No page-local handler, alias, fixture, timer, or toast may simulate success.

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Commands_System.md

### Events

The required semantic event names are `scheduled_dispatch.created`, `scheduled_dispatch.updated`, `scheduled_dispatch.cancelled`, `scheduled_dispatch.dispatched`, `scheduled_dispatch.held`, `scheduled_dispatch.failed`, `execution_window.created`, `execution_window.updated`, `execution_window.invalidated`, `runtime.quota_wait_started`, `runtime.quota_resume_consent_changed`, and `runtime.quota_resume_attempted`. All twelve require central EventRecord registration and payload schemas before emission.

`scheduled_dispatch.dispatched` carries the idempotency key and the revalidation result so a duplicate is provably a duplicate. `runtime.quota_resume_attempted` carries the eligibility outcome including the exact failed clause when the attempt was refused, because a refused resume is the case an operator most needs to see. `execution_window.invalidated` carries `invalidated_reason`.

No event fabricates a reset time. Where `reset_truth` is `unknown`, the event says unknown.

ContractRef: ContractName:Plans/Commands_System.md, ContractName:Plans/usage-feature.md

## 4. Integration Surfaces

### Server ownership, idempotency, and recovery

Timers are server-owned. Closing the client, switching threads, switching projects, or reloading does not cancel a schedule and does not fire one early. There is no client-side `setTimeout` that constitutes a schedule.

Every dispatch carries an idempotency key derived from the schedule identity, the target identity, the exact target hash, and the occurrence start. A duplicate timer fire, a restart during dispatch, or a clock adjustment returns the original result rather than executing twice.

On restart the service reloads active schedules and consents, recomputes the next occurrence from the stored IANA timezone and DST policy, and applies the missed policy to any occurrence that passed while it was down. It never fires a burst of missed occurrences: `hold` holds, `next_available` collapses the backlog to one dispatch, and `cancel_after_grace` expires what is past its grace.

A schedule whose target has been deleted, cancelled, or invalidated moves to `invalidated` with a reason and is not retried.

ContractRef: ContractName:Plans/Server_System.md, ContractName:Plans/storage-plan.md

## 5. Validation And Acceptance

### Verification

Structural tests validate all three schemas and fixtures, the enum values, the IANA timezone requirement, exact-target binding, and the invalidation reason on revision change.

Behavioral tests must prove that a scheduled message sends the exact frozen text, attachments, destination, and route, and holds rather than substituting when the route is unavailable; that a Plan revision invalidates a pending build schedule instead of building the newer version; that a recurring nightly window produces one run resumed across occurrences rather than duplicate builds; that wind-down reaches a safe point and persists To-Do work bindings before pausing; that a spring-forward gap and a fall-back repetition each resolve to exactly one dispatch; that a restart recomputes occurrences and applies the missed policy without firing a backlog burst; and that a duplicate timer fire returns the original result.

Negative tests must prove that a manual Stop, Pause, or Cancel defeats quota resume, window resume, scheduled dispatch, and Crew Auto; that a dispatch decided before a stop and delivered after it is discarded; that an unknown reset time is never rendered as a confident countdown; that auto-resume is off by default and scoped to run, provider, and account; that a resume never replays a completed side effect; and that an aborted dispatch names the exact eligibility clause that failed.

ContractRef: ContractName:Plans/Automated_Testing_System.md, ContractName:Plans/Progression_Gates.md

## 6. Plan-To-Node Readiness

This document authorizes no WorkNodes, NodeSeeds, executable queues, runtime dispatch, or implementation files. Timers are server-owned and no client-side timer constitutes a schedule. Every command in this document remains `handler_unavailable` until the central catalog, Event Authority, storage registration, and production wiring close.

## 7. Deferred, Retired, Compatibility, And Non-Goals

The following are retired or explicitly out of scope for this owner.

Client-owned schedule timers are retired: a `setTimeout` in a rendered surface is not a schedule, does not survive a reload, and must not be presented as one. Automatic resume that overrides a manual stop is retired outright under section 1; there is no configuration, provider behavior, or convenience path that reinstates it. Rebinding a pending scheduled build to whatever Plan revision happens to be current is retired in favour of explicit invalidation.

Provider quota facts, usage totals, and reset semantics are deferred to `Plans/usage-feature.md`; this document consumes reset truth and never computes or infers a provider limit of its own. Goal phases and Goal-owned budgets are retired under `Plans/Goal_Runtime_System.md`, and no scheduling record may reintroduce them under a different name. Per-participant scheduling inside a collaborative run is not in scope: the run is the schedulable target and `Plans/Collaborative_Workflows.md` owns what happens inside it.

Compatibility: a legacy one-shot scheduled action without a timezone is migrated by attaching the Project's recorded timezone and marking the record as migrated, and a legacy record whose target cannot be resolved is quarantined with a reason rather than dispatched against a guess.

## 8. Source Lineage And Governance

This document was compiled from the approved Puppet Master Assistant redesign packet `pm-assistant-implementation-2026-09-02-recovered`, whose captured conversation decisions are the controlling authority, followed by `Concepts/chat-assistant-concepts/5.6 Pro/Chat updates.md` and then older `Plans/**`. Registration is recorded in `Plans/00-plans-index.md` under the 2026-09-03 entry and routed in `Plans/Crosswalk.md`. Generated governance is refreshed by its owner scripts after live owner documents stabilize and is never hand-edited to make a gate pass.

## Additive Correction v4 — Plan Build Topology And Scheduled-Message Projection (2026-09-03)

This section applies `PM_Assistant_v2_Additive_Correction_v4` (`PSCHED-001..014`,
`SMSG-001..018`, and the scheduling side of `PGOAL-008/015`, `PFAIL-006/010`, `BSTALE-007`,
`FOLDER-005`) to this owner. Execution windows, Usage-reset resume, and manual-stop precedence
stay exactly as specified above.

### PSCHED-001..003 — One frozen topology, and nothing runs until dispatch

`Plan Build At` stores exactly one execution topology: `agent`, `goal_driven`, or `crew`.
Dispatch executes the stored topology and cannot choose a different one; topology is never
inferred from the composer mode in effect at dispatch time.

```text
pm.schedule.plan_topology_snapshot.v1
  schedule_id, assistant_plan_id, plan_version, plan_hash,
  execution_topology, collaboration_definition_ref, eligibility_policy
```

A `crew` scheduled build freezes the validated `CollaborationDefinition`, the requested and
effective assignments, the permission ceiling, and the limits **at schedule commit**, so
dispatch needs no unattended modal and never silently adopts whatever the Crew defaults happen to
be later.

A scheduled build creates no `PlanRun`, Goal, `CrewRun`, To-Do work binding, and no provider
attempt until the first eligible dispatch is admitted. The schedule is durable; execution has not
started; scheduled work is not counted as active work.

### PSCHED-004, PSCHED-007 — What is revalidated at dispatch

At dispatch the scheduler revalidates the exact Plan version, hash, and currentness; the topology
configuration; project and worktree; permissions; provider, account, and model; tools; the
execution window; and quota. Any unmet predicate yields `Held` or `Failed` **with a reason**.
The Plan, topology, account, and model are never silently altered.

Provider, model, or account unavailability at dispatch follows the stored fallback policy. Absent
an explicit stored fallback the build is `Held` or `Failed` rather than substituted; requested
and effective identity stay visible. No hidden modal opens and no alternative route is chosen for
the user.

### PSCHED-005..006, PSCHED-009..012, PFAIL-010 — Invalidation, revision, recurrence, and edits

An immediate `Build` of the same Plan version atomically invalidates its pending schedule before
admitting the run, so no later duplicate dispatch is possible and timer ownership is never
ambiguous.

A Plan revision invalidates schedules bound to older versions. The schedule card identifies the
stale Plan version and the user explicitly updates or recreates it; automatic retargeting is
prohibited.

Recurring windows resume **one** existing unfinished run. After completion or cancellation no
later recurrence creates a new run; run identity stays stable across nightly windows and a
completed build is never restarted each night.

Cancelling the Plan or its bound Goal or Crew invalidates only the schedules and quota consent
associated with **that execution**, keyed exactly. A thread's unrelated scheduled messages are
never cleared.

Editing a schedule uses expected revision and currentness and cannot mutate a schedule after
dispatch has started. A stale update is refused rather than raced against timer dispatch.

### PGOAL-015 — A goal-driven schedule creates its Goal at dispatch, not at commit

A scheduled build whose stored topology is `goal_driven` freezes that topology at
schedule commit and creates the Goal only when the scheduled dispatch is admitted.
While only a future schedule exists there is no active Goal, no `PlanRun` and no
`GoalPlanBinding` — the schedule is durable, the execution has not started, and
Goal continuation does not begin before the scheduled time.

### PSCHED-008 — Two timers are a conjunction

When an execution window and a Usage reset both apply, work resumes only when **every**
eligibility predicate is true. A Usage reset that lands outside the window waits for the next
window. Neither timer overrides the other.

### PSCHED-011, PSCHED-013..014 — Presentation and idempotency domains

Before scheduled start the Plan card keeps `Build` as the primary label and shows schedule and
window state as secondary information; `Build Now` stays explicit where it is allowed.
`Scheduled` is never a primary Plan status label.

A failed crew, goal, or agent schedule admission retains the exact schedule record and its reason
for repair or cancellation, with no partial runtime records: no orphan Goal, Crew, or `PlanRun`
exists, and `Building…` is not reported before run admission.

Schedule idempotency and first-dispatch idempotency are distinct domains with independent tests:
repeated schedule creation returns one schedule, and repeated timer delivery admits one run.
Wall-clock time is never the sole deduplication key.

### CDRY-008 — Scheduled messages mint no new commands

The projection reuses the existing `cmd.chat.schedule_message`,
`cmd.chat.schedule_message.update` and `cmd.chat.schedule_message.cancel`; every card
action maps onto one of those three. Dispatch is
`internal.scheduler.dispatch_scheduled_message`, an internal scheduler action with its
own idempotency domain — not a second user command, and not a state-set command. No
`schedule_message.state.set` exists.

### SMSG-001..003 — The scheduled-message card

After a successful durable commit, one `ScheduledMessageProjection` renders in the source thread.
No card exists before the durable schedule result, and a schedule is never represented only as a
toast.

```text
pm.schedule.message_projection.v1
  scheduled_message_id, thread_id, destination_ref, state,
  scheduled_at, timezone, text_preview, attachment_count,
  requested_model_ref, dispatched_message_id,
  held_reason, failure_reason, currentness_hash
```

Visible states are `Scheduled`, `Held`, `Sent`, `Canceled`, `Failed`, and `Expired`, mapped from
owner state with no local inference. Each state carries truthful actions and reasons. Building
and Goal statuses are never used for messages.

The card shows the exact time, the IANA timezone, the destination, a short text preview, the
attachment count, the requested model or route, and the availability of Edit and Cancel.
Technical hashes stay in Details, and secret attachment paths are never exposed.

### SMSG-004..006 — Composer safety, edit races, and dispatch

Scheduling clears the source `ComposerBuffer` only **after** a durable schedule commit. A failure
preserves text, attachments, browser references, destination, cursor, and selection, so a retry
needs no reconstruction. Optimistic clearing on button press is prohibited.

Edit and Cancel use expected revision and currentness and cannot race an in-progress dispatch;
stale edits fail closed and a `Sent` schedule is never mutated.

At dispatch, Puppet Master inserts the actual user message at the real dispatch time, moves the
card to `Sent`, and links the schedule and message identities. Replay returns the same dispatched
message ID. Transcript order is never backdated to schedule-creation time.

### SMSG-007..011 — Exact snapshots and no silent fallback

Scheduled attachments freeze exact immutable attachment and artifact versions at schedule commit,
and dispatch retrieves that same hash and version. Nothing resolves "latest" later.

```text
pm.schedule.attachment_snapshot.v1
  scheduled_message_id, attachment_id, artifact_version, content_hash,
  folder_manifest_hash, snapshot_ref, availability
```

A live project file or folder reference stores its exact scheduled hash or manifest. If that
retained version is unavailable at dispatch the schedule holds or fails and the card names the
reference that became unavailable. Current project bytes are never substituted.

A live `BrowserElementContext` or selector cannot be scheduled. The schedule flow either converts
it to a frozen screenshot, crop, or DOM snapshot that is valid independently of the live page, or
refuses. No future live DOM node is located automatically.

A collaborative destination is bound to an exact run or room identity. If it ended or
disappeared, the stored hold-or-fail policy applies; the message never falls back to the
Assistant or to another participant, and the destination error stays repairable.

An explicit model or account selection never silently falls back. `Default` may re-resolve only
under its recorded resolver policy with requested-versus-effective disclosure, and the dispatch
result records the route truth. Provider substitution is never hidden.

### SMSG-012..018 — History, retry, multiplicity, and where scheduling lives

`Sent` cards remain in history and link to the dispatched message. Cancellation, expiry, and
failure retain their immutable audit records; hiding a card never deletes schedule evidence, and
history survives restart and search.

A `Failed` or `Held` schedule may be edited and retried through the existing update and create
semantics. Each new dispatch attempt has a unique identity and the historical failed attempt is
preserved rather than overwritten.

Multiple scheduled messages in one thread keep independent IDs and timers and order
deterministically by actual dispatch time. The same wall-clock time does not merge them, and
deduplication by text and time is prohibited.

Manually sending similar composer text neither cancels nor modifies a schedule. Schedule identity
stays explicit and intent is never inferred from text equality.

Cancelling a Goal, `PlanRun`, `CrewRun`, or Agent execution invalidates the associated execution
windows and quota-resume consent but not unrelated scheduled user messages; association keys
distinguish message schedules from run schedules and thread-wide clearing is prohibited.

The scheduled-message projection rebuilds after restart from owner records and exposes `Held` and
`Failed` currentness without client timers. Closing the client neither cancels nor duplicates a
schedule, and browser local storage is never authoritative.

`Schedule Message` stays in the Assistant wand menu, which opens the exact scheduling modal. The
thread card is the later lifecycle projection, not a second creation entry point, and scheduling
is not moved into extra non-wand chrome.

## Continuation Revalidation Addendum (2026-09-05)

Packet `PM-WNC-2026-09-05-v1`. Notebook checkpoints and fresh-window continuity change nothing about scheduled/resumed build revalidation: at dispatch, the scheduler revalidates the exact bound Plan version/hash, currentness, topology, permissions, account, model, tools, window, and quota exactly as before, and captures/compares the current `user_stop_epoch`. A notebook checkpoint or resume capsule is continuation aid, never a dispatch qualification: quota reset, schedule re-fire, provider retry, or notebook work never auto-resumes work after a manual Stop, and a fresh window cannot rebinding a scheduled build to a different Plan revision.

```yaml
plan_unit_id: SQR-008
unit_type: requirement
status: accepted
owner_doc: Plans/Scheduling_and_Quota_Resume.md
canonical_text: "Scheduled and resumed builds revalidate everything they revalidate today regardless of notebook/checkpoint continuity: exact Plan version/hash, currentness, topology, permissions, account, model, tools, window, quota, and the two-point user_stop_epoch comparison. Notebook checkpoints are continuation aids, never dispatch qualifications, and quota reset, schedule re-fire, provider retry, or notebook work never auto-resumes Stop-cancelled work."
gui_related: false
gui_classification_reason: Scheduling revalidation is runtime behavior, not GUI work.
depends_on: [SQR-001, PP-085]
unblocks: []
acceptance_criteria:
  - Stop between admission and dispatch discards stale continuation and blocks auto-resume.
  - A new window cannot select a different approved Plan revision for a scheduled build.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: auto_resume_after_stop
reasoning_tier: standard
context_scope: scheduling
implementation_surfaces: [Plans/Scheduling_and_Quota_Resume.md, Plans/Prompt_Pipeline.md, Plans/Assistant_Plan_Runtime.md]
node_compile_hint: {mode: runtime_contract_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_packet:PM-WNC-2026-09-05-v1:WNC-C09
  - source_packet:PM-WNC-2026-09-05-v1:WNC-I04
  - source_packet:PM-WNC-2026-09-05-v1:WNC-A32
preserved_exact_tokens: ["user_stop_epoch", "dispatch qualification", "exact Plan version/hash"]
negative_constraints:
  - Do not auto-resume Stop-cancelled work from notebook or quota events.
owner_hints: [Plans/Scheduling_and_Quota_Resume.md]
```

ContractRef: ContractName:Plans/Scheduling_and_Quota_Resume.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Goal_Runtime_System.md
