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
2. user manual Pause, including independent Project SQR-018 and app/Server SQR-020 Pause all automations latches;
3. owner safety, permission, or recovery block;
4. inactive execution window;
5. quota unavailable;
6. scheduled eligibility;
7. Goal, Plan, or Crew automatic continuation.

An automatic mechanism may never clear a higher-priority state. Concretely: a quota reset does not resume manually stopped work; a window opening does not resume manually stopped work; a schedule firing does not resume manually stopped work; a cleared dependency does not resume manually stopped work; and a provider-native retry does not resume manually stopped work.

Manual Stop, Pause, and Cancel latch a monotonically increasing `user_stop_epoch`. Every eligibility evaluation captures the epoch it was computed against and compares it again at dispatch. A dispatch decided before a manual stop and delivered after it is discarded rather than executed. Only an explicit user resume, or a new schedule the user creates, clears the latch.

Pause all automations uses SQR-018's unchanged Project record/epoch or SQR-020's distinct app/Server record/epoch. Only the user clears the selected scope with cmd.runtime.automation_pause.set; no new schedule, YOLO, reconnect, conversion, quota reset, window or continuation clears it. Both decision and final dispatch compare the scope and target Stop epochs; missing canonical scope custody blocks. Direct user work keeps the existing one-dispatch exception and all other gates without clearing the latch.

This precedence is normative for every consumer. Where any other document appears to permit automatic resume over a manual stop, this document wins.

ContractRef: ContractName:Plans/Goal_Runtime_System.md, ContractName:Plans/Executor_Protocol.md

### Settings boundary

Settings stores the defaults; this owner stores the operational records. The defaults are `assistant.scheduling.wind_down_minutes` (10), `assistant.scheduling.missed_dispatch_policy` (`hold`), `assistant.scheduling.default_grace_minutes` (30), `assistant.scheduling.resume_next_window` (true), `assistant.usage.auto_resume_default` (false), and `assistant.scheduling.dst_policy` (`preserve_local_wall_clock`).

A default is read at creation time and copied into the record. Changing a default afterwards never retroactively alters an existing schedule or consent. The scheduling sheets, the scheduled-message cards and the Schedule Manager show these values with the display labels fixed in SQR-017 ("Ask me first", "Keep going next time", "Wrap-up time" and the rest); a label never renames a key or a stored value, and how the Settings rows label these defaults belongs to the Settings owner, not to this document. These keys require Settings inventory census and registration through `Plans/Settings_System.md` and `Plans/settings_inventory.json`; naming them here fixes ownership and does not claim registration.

ContractRef: ContractName:Plans/Settings_System.md

## 2. Canonical PlanUnits

### SQR-001 - Manual Stop Precedence Over Every Automatic Mechanism

```yaml
plan_unit_id: SQR-001
unit_type: constraint
status: accepted
owner_doc: Plans/Scheduling_and_Quota_Resume.md
canonical_text: >-
  Automation precedence remains user Cancel/Stop, user manual Pause, safety/permission/recovery block,
  inactive window, quota unavailable, eligibility and Goal/Plan/Crew continuation. Each run
  Stop/Pause/Cancel latches its user_stop_epoch; app SQR-020 and Project SQR-018 pause have independent
  canonical scope epochs. Decision and dispatch compare both target and applicable scope epochs,
  discarding pre-Stop decisions. Only explicit permitted user resume/new-user-schedule clears a target
  latch, never scope pause; only the person turning off that exact scope pause clears it. A new schedule,
  YOLO, timer/window/quota/reconnect or conversion cannot clear scope pause. manual_stop_latched remains
  the per-run refusal; project_automation_paused/application_automation_paused identify scope holds and
  missing canonical custody refuses as unavailable. Direct user work keeps only the existing
  single-dispatch exception and every other guard.
gui_related: true
gui_classification_reason: Resume controls must render disabled with the latched-stop reason rather than appearing available.
depends_on: []
unblocks: [SQR-005, SQR-006, SQR-018]
acceptance_criteria:
  - "Both target and applicable app/Project scope Stop epochs are checked at decision and dispatch."
  - "No automatic mechanism, new schedule or conversion clears scope pause."
  - "User-only clear affects that scope only; a no-op is idempotent and fires no backlog."
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
  - "pm-assistant-implementation-2026-09-02-recovered:SCHED-001"
  - "pm-assistant-implementation-2026-09-02-recovered:01_IMPLEMENTATION_SPEC.md#15.5"
  - "projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#lane-c"
  - "projects-refresh-20261030/pass2/NOPROJECT-PROPOSAL.md#approved-2026-11-03"
  - "Jared, 2026-11-03: Plan mode and scheduled tasks are also available in no project. It's only planning wizard/prd builder/orchestrator that isn't."
preserved_exact_tokens:
  - "user_stop_epoch"
  - "manual_stop_latched"
  - "cmd.runtime.automation_pause.set"
negative_constraints:
  - Do not let any automatic mechanism clear a manual stop.
  - Do not evaluate eligibility once and dispatch without re-checking the stop epoch.
  - Do not let a new schedule, a quota reset, a window opening or an automatic continuation clear the project-wide automation pause.
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
  Schedule Message freezes the actual sheet text/attachments/destination and selected
  runtime/model/account route in ScheduledMessageSnapshot with explicit source scope, real
  thread/Server/Computer, scheduled time, local wall time, IANA timezone, missed policy/grace/state and
  expected currentness. App editions have null Project; a Project target keeps its exact identity. Before
  dispatch revalidate actual target/roots/history where relevant, permissions, owner writer/Stop/pause,
  input availability and selected route. Never substitute destination/model/account/mode.
  hold/next_available/cancel_after_grace retain hold default and thirty-minute grace. A schedule
  acknowledges only durable snapshot commit and never starts a run at creation.
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
node_compile_hint:
  mode: scheduled_message_contract
  create_worknodes: false
source_lineage:
  - "Concepts/chat-assistant-concepts/5.6 Pro/scheduling.js (5.6 Pro prototype; behaviour reference only)"
  - "pm-assistant-implementation-2026-09-02-recovered:SCHED-002"
  - "pm-assistant-implementation-2026-09-02-recovered:02_RUNTIME_AND_STORAGE_CONTRACTS.md#2.3"
  - "projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#lane-c"
  - "projects-refresh-20261030/pass2/NOPROJECT-PROPOSAL.md#approved-2026-11-03"
  - "Jared, 2026-11-03: Plan mode and scheduled tasks are also available in no project. It's only planning wizard/prd builder/orchestrator that isn't."
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
  Build At binds the exact plan_id, plan_version, and content hash through exact_target_version and
  exact_target_hash and never binds the current Plan. A Plan revision invalidates the pending schedule,
  which moves to invalidated with invalidated_reason naming the version change and requires an explicit
  update or reschedule; building a newer version than the user scheduled, or silently rebinding to the
  newest version, is a defect. Repeated schedules against one target are execution windows for the same
  run, not repeated duplicate builds, and idempotency keyed on schedule_id, target_id, exact_target_hash,
  and occurrence_start prevents double dispatch from a restart, a duplicate timer fire, or a clock
  adjustment. Build With Crew schedules identically because the crew configuration is part of the target,
  not the schedule. Application exact-target editions use SQR-019 with null Project and fixed Computer;
  conversion requires an explicit exact target-map replacement/rebind and never silently latest. A
  recurring occurrence resumes the same unfinished run.
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
  - "pm-assistant-implementation-2026-09-02-recovered:SCHED-003"
  - "pm-assistant-implementation-2026-09-02-recovered:01_IMPLEMENTATION_SPEC.md#15.2"
  - "projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#lane-c"
  - "projects-refresh-20261030/pass2/NOPROJECT-PROPOSAL.md#approved-2026-11-03"
  - "Jared, 2026-11-03: Plan mode and scheduled tasks are also available in no project. It's only planning wizard/prd builder/orchestrator that isn't."
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
  ExecutionSchedule supports one-time and recurring windows with start time, optional pause time,
  wind-down duration, days of week, IANA timezone, DST policy, and auto-resume-next-window, and applies to
  Agent work, Goal-driven work, Plan and Deep Plan builds, and Crew runs. Wind-down is not a pause: at
  pause time minus wind_down_seconds the service stops admitting large or non-checkpointable new work,
  lets the current bounded atomic operation reach a safe point, persists state and To-Do work bindings,
  and only then pauses; interrupting an atomic operation mid-write is a defect. DST policy defaults to
  preserve_local_wall_clock, a spring-forward gap resolves to the first valid instant after the gap, a
  fall-back repetition fires once on the first occurrence with idempotency preventing the second, and
  timezone is stored as an IANA name rather than a fixed offset. Application Agent/Goal/Crew/Plan tasks
  consume these same windows, IANA/DST and safe wind-down rules on their owning Computer, under both
  target and app scope Stop epochs; no client timer or missed backlog burst is added.
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
node_compile_hint:
  mode: execution_window_contract
  create_worknodes: false
source_lineage:
  - "Concepts/chat-assistant-concepts/5.6 Pro/scheduling.js (5.6 Pro prototype; behaviour reference only)"
  - "pm-assistant-implementation-2026-09-02-recovered:SCHED-004"
  - "pm-assistant-implementation-2026-09-02-recovered:01_IMPLEMENTATION_SPEC.md#15.3"
  - "projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#lane-c"
  - "projects-refresh-20261030/pass2/NOPROJECT-PROPOSAL.md#approved-2026-11-03"
  - "Jared, 2026-11-03: Plan mode and scheduled tasks are also available in no project. It's only planning wizard/prd builder/orchestrator that isn't."
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
  When provider usage is exhausted the Assistant shows a compact strip below the working area naming the
  paused reason, the reset time, and the reset truth as provider_reported, locally_inferred,
  user_supplied, or unknown, plus an opt-in checkbox to resume automatically when usage is available. A
  locally inferred estimate is labelled as inferred with a confidence, an unknown reset says unknown and
  offers the user a field to supply an expected time, and no confident exact countdown is displayed that
  the service does not have. Consent is recorded as QuotaResumeConsent scoped to run, provider, and
  account, is not a global setting, and defaults to false. A quota wait does not change Goal state and
  does not change the Plan Build control label: the Goal stays active with its run waiting and the Plan
  stays Building. App QuotaResumeConsent binds the actual run/provider/account/Server and scoped
  stop/pause state, never Settings or current visible chat. Unknown reset and the saved missed hold remain
  holds even in YOLO.
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
node_compile_hint:
  mode: quota_resume_consent_contract
  create_worknodes: false
source_lineage:
  - "Concepts/chat-assistant-concepts/5.6 Pro/scheduling.js (5.6 Pro prototype; behaviour reference only)"
  - "pm-assistant-implementation-2026-09-02-recovered:SCHED-005"
  - "pm-assistant-implementation-2026-09-02-recovered:01_IMPLEMENTATION_SPEC.md#15.4"
  - "projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#lane-c"
  - "projects-refresh-20261030/pass2/NOPROJECT-PROPOSAL.md#approved-2026-11-03"
  - "Jared, 2026-11-03: Plan mode and scheduled tasks are also available in no project. It's only planning wizard/prd builder/orchestrator that isn't."
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
  One eligibility predicate governs scheduled messages/builds, window/quota resume and app/Project
  continuations. It requires active schedule/consent, authentic target and exact frozen
  input/version/hash, eligible unstarted or unfinished work, no cancel/latched target Stop, applicable
  app/Project pause off with both stop epochs current, open window if applicable, recorded healthy
  route/provider/account, current tools/MCP/skills, actual Computer/roots and any intrinsically required
  repository/Project, current permission/safety/recovery and storage writer. No Project is valid for an
  app target; a dangling real Project/target is not. Decide and re-check immediately before dispatch,
  recording each failed clause and no silent substitution. Missing pause custody blocks; app/project hold
  reasons stay distinct. User Send now from the accepted reschedule_to now update exempts just that one
  dispatch from the scope pause clause, keeps the switch on and every other predicate intact. Completion
  is never replayed as work.
gui_related: true
gui_classification_reason: The exact failed clause must be surfaced to the user so the blocked automation is actionable.
depends_on: [SQR-001, SQR-005]
unblocks: [SQR-016, SQR-018]
acceptance_criteria:
  - "A valid app future message/build needs no fabricated Project or pre-existing PlanRun."
  - "All actual target, permission, root, writer, tool, quota, window and Stop/pause checks run twice."
  - "Racing Stop/cancel/conversion prevents late dispatch; Send now keeps only its explicit single-dispatch exception."
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
  - "pm-assistant-implementation-2026-09-02-recovered:SCHED-006"
  - "pm-assistant-implementation-2026-09-02-recovered:02_RUNTIME_AND_STORAGE_CONTRACTS.md#9.2"
  - "projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#lane-c"
  - "projects-refresh-20261030/pass2/NOPROJECT-PROPOSAL.md#approved-2026-11-03"
  - "Jared, 2026-11-03: Plan mode and scheduled tasks are also available in no project. It's only planning wizard/prd builder/orchestrator that isn't."
preserved_exact_tokens:
  - "revalidate"
  - "unfinished work only"
  - "project_automation_paused"
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
  Timers are server-owned: closing the client, switching threads, switching projects, or reloading neither
  cancels a schedule nor fires one early, and no client-side timer constitutes a schedule. Every dispatch
  carries an idempotency key derived from schedule identity, target identity, exact target hash, and
  occurrence start, so a duplicate timer fire, a restart during dispatch, or a clock adjustment returns
  the original result rather than executing twice. On restart the service reloads active schedules and
  consents, recomputes the next occurrence from the stored IANA timezone and DST policy, and applies the
  missed policy to occurrences that passed while it was down without firing a backlog burst -- hold holds,
  next_available collapses the backlog to one dispatch, and cancel_after_grace expires what is past its
  grace. A schedule whose target was deleted, cancelled, or invalidated moves to invalidated with a reason
  and is not retried. App timers remain on the chat/task Server and actual Computer, not the viewing
  device. Owner outage displays last-loaded not-answering state; restart checks canonical custody,
  occurrence identity, Stop and saved missed policy without failover or claiming a run happened.
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
  - "pm-assistant-implementation-2026-09-02-recovered:SCHED-007"
  - "pm-assistant-implementation-2026-09-02-recovered:02_RUNTIME_AND_STORAGE_CONTRACTS.md#13"
  - "projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#lane-c"
  - "projects-refresh-20261030/pass2/NOPROJECT-PROPOSAL.md#approved-2026-11-03"
  - "Jared, 2026-11-03: Plan mode and scheduled tasks are also available in no project. It's only planning wizard/prd builder/orchestrator that isn't."
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

`Schedule Message` lives in the **wand** menu — not in the mode menu, and not in the composer tools row. The wand row only opens the Schedule Message sheet; the sheet's text starts as the composer's exact text and stays editable, and the sheet's primary action is the one commit (SQR-013).

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

Missed-time behavior is the user's choice at schedule time: `hold` keeps the dispatch pending until the user acts; `next_available` sends at the next opportunity; `cancel_after_grace` expires the dispatch after `grace_seconds`. The default missed policy is `hold` and the default grace is thirty minutes, both configurable through Settings. A message sheet labels the three values "Ask me first", "Send as soon as I'm back" and "Skip it if it's more than N min late", where N is the recorded grace in minutes; the per-surface labels are fixed in SQR-017.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FileSafe.md, ContractName:Plans/Permissions_System.md

### Build At and exact-version binding

`Build At…` is a Plan card action owned in its UI placement by `Plans/Assistant_Plan_Runtime.md` and in its scheduling semantics by this document.

A scheduled Plan build binds the exact `plan_id`, `plan_version`, and content hash through `exact_target_version` and `exact_target_hash`. It does not bind "the current Plan".

A Build At commit is one command. The window specification (one time or a recurring slot, days, start, stop, wind-down, next-window resume, missed policy, grace and timezone) rides inside the `AssistantPlanScheduleRequest` of `cmd.chat.plan.schedule_build`, and the owner creates the exact-version binding and its `ExecutionSchedule` in one transaction. The surface never dispatches `cmd.execution_window.create` beside it, so no half-created schedule can exist.

A revision **invalidates** the pending schedule. The schedule moves to `invalidated` with `invalidated_reason` naming the version change, and it requires an explicit update or reschedule. The Plan card's "Schedule needs update" line offers that explicit step: "Use V<n>" (for example "Use V3") is `cmd.chat.plan.schedule_build` against the new version's exact hash, the user's click is the explicit reschedule, and the invalidated schedule stays as its audit record; Cancel schedule is `cmd.execution_window.cancel` by the `schedule_id` that `cmd.chat.plan.schedule_build` returned. Building a newer Plan than the user scheduled is a defect, and silently rebinding to the newest version is the same defect with better manners.

Repeated schedules against one target are **execution windows for the same run**, not repeated duplicate builds. A nightly window that opens five times does not produce five builds of the same Plan version; it produces one run that is admitted, paused at wind-down, and resumed in the next window. Idempotency is keyed on `(schedule_id, target_id, exact_target_hash, occurrence_start)` so that a restart, a duplicate timer fire, or a clock adjustment cannot double-dispatch.

`Build With Crew` and an ordinary build schedule identically; the crew configuration is part of the target, not part of the schedule.

The Plan card's schedule line, the Build At sheet's contract and the overnight receipt are specified in SQR-015 and SQR-016.

ContractRef: ContractName:Plans/Assistant_Plan_Runtime.md, ContractName:Plans/Collaborative_Workflows.md

### Execution windows

`ExecutionSchedule` covers both one-time and recurring windows. A Build At commit persists the grace the user chose as `grace_seconds` in the versioned `pm.execution.schedule.v2` successor (DL-138); a v1 schedule read during migration receives the previously effective default grace without changing its original audit record. The custody schema, resource digest and storage registry must advance together before v2 writes are admitted:

```yaml
schema_id: pm.execution.schedule.v2
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
  grace_seconds: integer|null
  auto_resume_next_window: boolean
  state: active|paused|cancelled|completed|invalidated
  revision: integer
  invalidated_reason: string|null
```

A window has a start time, an optional pause time, a wind-down duration, days of week, an IANA timezone, a DST policy, and an auto-resume-next-window flag. Windows apply to Agent work, Goal-driven work, Plan and Deep Plan builds, and Crew runs alike.

**Wind-down** is the important part and is not the same as a pause. At `local_pause` minus `wind_down_seconds`, the service stops admitting large or non-checkpointable new work, lets the current bounded atomic operation reach a safe point, persists state and To-Do work bindings, and only then pauses. A pause that interrupts an atomic operation mid-write is a defect. The default wind-down is ten minutes, configurable through Settings.

**DST policy** defaults to `preserve_local_wall_clock`: a window declared for 22:00 local opens at 22:00 local on both sides of a transition. A spring-forward gap that removes the declared local time resolves to the first valid instant after the gap; a fall-back repetition that duplicates the declared local time fires once, on the first occurrence, and the idempotency key prevents the second. Timezone is stored as an IANA name, never as a fixed offset, so a rule change is picked up rather than baked in.

The GUI summarizes the effective schedule in plain language, including the timezone and the next occurrence in the user's local time, and shows the DST resolution when one applies. It never displays a confident next-occurrence time it cannot compute. The stored `grace_seconds` is the exact value the Build At sheet read back, including after restart; the default applies only when the user did not choose one.

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
- "Pause all automations" is off for the target's project, and the project's `user_stop_epoch` matches the epoch the decision was computed against (SQR-018, DL-136); when this clause fails the recorded failed clause is `project_automation_paused`. The clause does not apply to the one dispatch of a Send now, the accepted `cmd.chat.schedule_message.update` with `reschedule_to: "now"` that records the user as its actor; that dispatch is user-started, every other clause still holds, and the switch stays on;
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
| `cmd.chat.schedule_message` | Freeze and schedule the exact text and attachments of the Schedule Message sheet, which the wand opens prefilled from the composer | Precondition `schedule_text_not_empty`: the sheet's own text must not be empty, whatever the composer holds. Returns `scheduled_dispatch_id` and the frozen snapshot ref. The composer buffer clears only after the durable commit, and only when the scheduled text came from it. Creates no Goal, Plan, or To-Do. |
| `cmd.chat.schedule_message.update` | Update a `scheduled` or `held` message: Edit, Edit and send, Reschedule, and Send now | Rebinds the exact snapshot under the expected revision; refused once dispatch has started. Send now on a `held` message, including one held because it was missed, is this update with `reschedule_to: "now"`, never a new command. |
| `cmd.chat.schedule_message.cancel` | Cancel a pending scheduled message | Terminal; the snapshot is retained for audit and never dispatched. |
| `cmd.chat.plan.schedule_build` | Bind an execution schedule to an exact Plan version and hash; the window specification rides inside `AssistantPlanScheduleRequest` | Creates the binding and its `ExecutionSchedule` in one transaction and returns `schedule_id` with `exact_target_version` and `exact_target_hash` set; a later Plan revision invalidates it. Use V<n> on an invalidated schedule is this command against the new version's exact hash, an explicit reschedule. |
| `cmd.execution_window.create` | Create a one-time or recurring execution window | Returns `schedule_id`; creating a window admits no work by itself. Never dispatched beside `cmd.chat.plan.schedule_build` for one Build At commit. |
| `cmd.execution_window.update` | Update an execution window | Never silently changes an in-flight run's admission; a narrowed window takes effect at the next wind-down boundary. |
| `cmd.execution_window.cancel` | Cancel an execution window, including Cancel schedule on a Plan card or in the Schedule Manager | Targets the `schedule_id` that `cmd.chat.plan.schedule_build` returned; there is no `schedule_build.cancel`. Work already admitted continues under its own owner; cancelling a window is not a Stop. |
| `cmd.runtime.quota_resume.set` | Record opt-in consent to resume when quota resets | Requires a known `reset_truth` value; consent is scoped to run, provider, and account and is defeated by a latched manual stop. |
| `cmd.runtime.automation_pause.set` | Same pause command, explicit Project or application/Server target (SQR-018/020) | `paused` true advances only the named scope epoch on a real change; user-only false clears that scope, never per-run Stop. Application target has null Project and exact Server, not a missing-as-off cache. Return original scope record/revision/epoch/actor/time; no-op returns it unchanged. No schedule/consent invalidation, auto-dispatch, Settings write or agent clear. |

Each scheduled-message/task/window/consent request carries `schema_id`, `schema_version`, command ID, command instance ID, explicit scope, `project_id` (present null for app), exact Server/Computer/thread/roots, target identity, expected revision, expected target hash where applicable, actor, permission snapshot, idempotency key, source surface, and return route. The source surfaces are `schedule_sheet` (the Schedule Message sheet), `plan_schedule` (the Build At sheet), `scheduled_message_card`, `schedule_manager` and `plan_card`. The wand row and the Plan card's `Build At…` button only open their sheets and are not source surfaces of these commands. Typed errors are `invalid_request`, `schedule_not_found`, `stale_schedule_revision`, `target_not_found`, `target_version_changed`, `dispatch_already_started`, `manual_stop_latched`, `window_inactive`, `quota_unavailable`, `reset_truth_unknown`, `route_unavailable`, `command_not_registered`, `permission_denied`, `owner_unavailable`, or `cancelled`. App editions add application_automation_paused and app_automation_pause_unavailable without changing original Project result codecs; new runtime routes remain handler_unavailable until admitted. The application pause request is the separate Server-level CV-368 ApplicationAutomationPauseSetRequestV1: exact actual Server/application scope, desired paused value, user authority, operation/idempotency and return commitments; it requires no fake thread/Host/roots and no expected_revision. Its internal whole-value CAS, accepted/rejected current-pause branches and unavailable/null-pause branch follow SQR-020/CV-368/SP-352; absence is never off.

Until the central command catalog, Event Authority, and production wiring rows close for a given ID, its controls render disabled with `command_not_registered`. No page-local handler, alias, fixture, timer, or toast may simulate success.

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Commands_System.md

### Events

The required semantic event names are `scheduled_dispatch.created`, `scheduled_dispatch.updated`, `scheduled_dispatch.cancelled`, `scheduled_dispatch.dispatched`, `scheduled_dispatch.held`, `scheduled_dispatch.failed`, `execution_window.created`, `execution_window.updated`, `execution_window.invalidated`, `runtime.quota_wait_started`, `runtime.quota_resume_consent_changed`, `runtime.quota_resume_attempted`, and `runtime.automation_pause_changed`. All thirteen require central EventRecord registration and payload schemas before emission.

`runtime.automation_pause_changed` is emitted once for each change of the project-wide "Pause all automations" switch made by `cmd.runtime.automation_pause.set` (SQR-018, DL-136), never for a request that sets the value the switch already has, and carries `project_id`, `paused`, the project's `user_stop_epoch`, the actor and the time. A scheduled message whose send time arrives while the switch is on emits `scheduled_dispatch.held` with the failed clause `project_automation_paused`, and a refused quota resume emits `runtime.quota_resume_attempted` with that clause; the switch adds no other event.

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

Negative tests must prove that a manual Stop, Pause, or Cancel defeats quota resume, window resume, scheduled dispatch, and Crew Auto; that a dispatch decided before a stop and delivered after it is discarded; that an unknown reset time is never rendered as a confident countdown; that auto-resume is off by default and scoped to run, provider, and account; that a resume never replays a completed side effect; and that an aborted dispatch names the exact eligibility clause that failed. They must also prove, for the project-wide "Pause all automations" switch (SQR-018), that while it is on no scheduled send or scheduled build in the project dispatches, except the one message of a Send now the user sends, which leaves the switch on; that a quota reset, a window opening, a schedule time, an automatic continuation or a newly created schedule does not clear it; that a dispatch decided before it was turned on and delivered after is discarded; and that turning it off releases no per-run latch and fires no backlog burst (ATS-064).

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
action maps onto one of those three or onto navigation. Edit, Edit and send and Reschedule are
`cmd.chat.schedule_message.update`; Send now on a `held` message is the same update with
`reschedule_to: "now"`; Cancel is `cmd.chat.schedule_message.cancel` with the expected revision and
currentness; Go to message is `cmd.chat.open_thread` with `route_target: message`; Details only
discloses. The full mapping is SQR-013. Dispatch is
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
owner state with no local inference. A message missed while Puppet Master was closed under the
`hold` policy is `Held` with a missed reason, never a seventh state. Each state carries truthful
actions and reasons, and every form begins its visible sentence with its state word. `Scheduled`
renders as a future bubble at its transcript position, `Held` as a decision bubble, and `Sent`,
`Canceled`, `Failed` and `Expired` as one-line receipts; the state is shown as a glyph and the
word, never as a badge (SQR-012). Building and Goal statuses are never used for messages.

The pending forms show the exact time, the IANA timezone, the destination, a short text preview,
the attachment count, the requested model or route, and the availability of Edit and Cancel.
Receipts keep the time and zone in their details. Technical hashes stay in Details, and secret
attachment paths are never exposed.

### SMSG-004..006 — Composer safety, edit races, and dispatch

Scheduling clears the source `ComposerBuffer` only **after** a durable schedule commit. A failure
preserves text, attachments, browser references, destination, cursor, and selection, so a retry
needs no reconstruction. Optimistic clearing on button press is prohibited.

Amended 2026-10-31 (DL-270): a schedule create, update, cancel or Build At commit is a receipt the UI
waits on, so it is a barrier-class event under SP-336 and is acknowledged only after a full flush. The
composer is cleared and the card shown only after that flush. Ordinary schedule-fire bookkeeping stays
in ordinary commit groups.

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

Amended 2026-10-31 (DL-270): the frozen attachment versions (`snapshot_ref`) and the scheduled text
(`text_blob_ref`) are payload-store references under SP-337. The schedule record counts as a live
reference from schedule commit until dispatch, cancel or expiry, so payload garbage collection and
deduplication never release them while the schedule is pending; backups and holds are honoured as SP-337
states. The independent-lifetimes clause for scheduled-message and attachment content still applies after
release.

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
schedule, and browser local storage is never authoritative. Every countdown and clock ring on a
card, in the dock or in the Schedule Manager derives from the owner's `scheduled_at` and
server-owned time; a client tick may repaint it, never decide it.

`Schedule Message` stays in the Assistant wand menu, which opens the exact scheduling modal. The
thread card is the later lifecycle projection, not a second creation entry point, and scheduling
is not moved into extra non-wand chrome. The dock lines of SQR-012 are attention items whose Show
only reveals the card; they are not a scheduling entry point.

## Continuation Revalidation Addendum (2026-09-05)

Packet `PM-WNC-2026-09-05-v1`. Notebook checkpoints and fresh-window continuity change nothing about scheduled/resumed build revalidation: at dispatch, the scheduler revalidates the exact bound Plan version/hash, currentness, topology, permissions, account, model, tools, window, and quota exactly as before, and captures/compares the current `user_stop_epoch`. A notebook checkpoint or resume capsule is continuation aid, never a dispatch qualification: quota reset, schedule re-fire, provider retry, or notebook work never auto-resumes work after a manual Stop, and a fresh window cannot rebinding a scheduled build to a different Plan revision.

```yaml
plan_unit_id: SQR-008
unit_type: requirement
status: accepted
owner_doc: Plans/Scheduling_and_Quota_Resume.md
canonical_text: >-
  Scheduled and resumed builds revalidate everything they revalidate today regardless of
  notebook/checkpoint continuity: exact Plan version/hash, currentness, topology, permissions, account,
  model, tools, window, quota, and the two-point user_stop_epoch comparison. Notebook checkpoints are
  continuation aids, never dispatch qualifications, and quota reset, schedule re-fire, provider retry, or
  notebook work never auto-resumes Stop-cancelled work. The same two-point checks bind app
  target/Computer/roots and app scope pause; a notebook, conversion or copied consent never authorizes
  dispatch or clears Stop.
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
  - "source_packet:PM-WNC-2026-09-05-v1:WNC-C09"
  - "source_packet:PM-WNC-2026-09-05-v1:WNC-I04"
  - "source_packet:PM-WNC-2026-09-05-v1:WNC-A32"
  - "projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#lane-c"
  - "projects-refresh-20261030/pass2/NOPROJECT-PROPOSAL.md#approved-2026-11-03"
  - "Jared, 2026-11-03: Plan mode and scheduled tasks are also available in no project. It's only planning wizard/prd builder/orchestrator that isn't."
preserved_exact_tokens: ["user_stop_epoch", "dispatch qualification", "exact Plan version/hash"]
negative_constraints:
  - Do not auto-resume Stop-cancelled work from notebook or quota events.
owner_hints: [Plans/Scheduling_and_Quota_Resume.md]
```

ContractRef: ContractName:Plans/Scheduling_and_Quota_Resume.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Goal_Runtime_System.md

## Cumulative v3 Schedule Manager Redesign and Atomic Mutation Specification (2026-09-07)

This section incorporates the cumulative Schedule Manager architectural redesign, scheduled message
lifecycle card grammar, and atomic schedule mutation rules in accordance with APR-019, APR-027,
APR-028, and APR-043.

### 11. Schedule Manager Four-Category Architecture (APR-027)

- **Categorical Separation:** The unified Schedule Manager surface rejects flat list presentations
  and organizes all scheduled items into four distinct, dedicated categories:
  1. *Scheduled Messages:* User-scheduled chat prompts, follow-ups, and thread-targeted messages.
  2. *Execution & Build Windows:* Scheduled plan builds, batch runs, and recurring maintenance windows.
  3. *Resume & Safety Policy:* Quota pause auto-resume settings, circuit breakers, grace periods,
     and DST handling.
  4. *Events & Automation:* System event listeners, webhook dispatches, and periodic cron routines.
- **Filtering and Scope:** Scheduled Messages, Execution & Build Windows, and Events & Automation
  each provide independent status filtering, execution time sorting, and search filtering without
  cross-category state confusion. The status filter keeps the stored values Active, Paused,
  Completed, Failed and Expired, adds the values Held and Canceled, and offers All for no filter;
  its display labels are Waiting, Paused, Needs you, Done or sent, Didn't send, Skipped, and
  Canceled, one per stored value, mapped in SQR-014. Resume & Safety Policy is a policy tab, not a list, and has nothing to filter.

### 12. Scheduled-Message Card Grammar and State Separation (APR-028)

- **Card Lifecycle States:** Scheduled messages project clear visual separation between active and
  historical states:
  1. *Active/Pending Cards:* `Scheduled` is a future bubble and `Held` a decision bubble, each led
     by a glyph and its state word (no status badge), disclosing destination target, exact dispatch
     time, IANA timezone, attachment count, requested route/model, and active Edit / Cancel actions.
  2. *Quiet Historical Receipts:* Sent, Canceled, Expired, and Failed records render as one-line
     receipts that begin with the state word. A `Sent` receipt links directly to the dispatched
     message in thread history and does not repeat the message text.
- **Privacy and Secrets Protection:** Sensitive attachment file system paths, authentication tokens,
  and cryptographic payload hashes are relegated strictly to the More Details disclosure panel and
  never rendered in the primary card summary.

### 13. Atomic Schedule Mutation and Future-Time Validation (APR-019, APR-043)

- **Atomic Schedule Mutation (APR-043):** Editing an existing pending schedule updates the existing
  record in place under the same schedule identity (`schedule_id`), incrementing its revision number.
  Edits never spawn duplicate or orphaned schedules.
- **Time and Timezone Validation:** The scheduling date-time picker enforces future time validation
  calculated in the destination target's IANA timezone. Past timestamps or invalid timezone offsets
  are rejected before admission.
- **Safe Invalidation Precedence (APR-019):** Explicit schedule cancellation immediately dispatches
  invalidation to the active scheduler timer. Immediate manual execution (e.g., clicking "Build" on a
  scheduled plan) invalidates and removes the pending schedule before launching the run, leaving
  unrelated schedules undisturbed.

```yaml
plan_unit_id: SQR-009
unit_type: requirement
status: accepted
owner_doc: Plans/Scheduling_and_Quota_Resume.md
canonical_text: >-
  The Schedule Manager organizes schedules into four distinct categories: Scheduled Messages, Execution &
  Build Windows, Resume & Safety Policy, and Events & Automation. Scheduled messages render editable
  pending cards with destination, exact time, IANA timezone, attachments, route, and actions, while
  sent/canceled/expired items render as quiet receipts without exposing secret paths in summaries. App
  rows show No project and named Computer alongside Project rows with exact coverage; the same four tabs
  serve both and no empty list implies no schedules everywhere.
gui_related: true
gui_classification_reason: Governs Schedule Manager layout categorization and scheduled message card presentation.
depends_on: [SQR-008]
unblocks: [SQR-010]
acceptance_criteria:
  - Schedule Manager presents four distinct categorical views, never a flat mixed list.
  - Pending cards display destination, time, timezone, attachments, route, and Edit/Cancel controls.
  - Historical states render as quiet receipts; secrets remain in Details.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: schedule_surface_flattening_or_secret_leakage
reasoning_tier: standard
context_scope: schedule_manager_ui
implementation_surfaces:
  - Plans/Scheduling_and_Quota_Resume.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: schedule_manager_specification
  create_worknodes: false
source_lineage:
  - "APR-027"
  - "APR-028"
  - "projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#lane-c"
  - "projects-refresh-20261030/pass2/NOPROJECT-PROPOSAL.md#approved-2026-11-03"
  - "Jared, 2026-11-03: Plan mode and scheduled tasks are also available in no project. It's only planning wizard/prd builder/orchestrator that isn't."
preserved_exact_tokens:
  - "Scheduled Messages"
  - "Execution & Build Windows"
  - "Resume & Safety Policy"
  - "Events & Automation"
negative_constraints:
  - Do not merge all schedule kinds into a single flat list.
  - Do not expose secret attachment paths in scheduled message cards.
owner_hints:
  - Plans/Scheduling_and_Quota_Resume.md
```

ContractRef: ContractName:Plans/Scheduling_and_Quota_Resume.md, ContractName:Plans/FinalGUISpec.md

```yaml
plan_unit_id: SQR-010
unit_type: requirement
status: accepted
owner_doc: Plans/Scheduling_and_Quota_Resume.md
canonical_text: >-
  Schedule edits mutate existing pending schedules atomically with revision incrementation without
  orphaning. The time picker enforces future-time validation in destination IANA timezones. Canceled
  schedules are invalidated immediately; triggering immediate Build on a scheduled plan invalidates its
  pending schedule before execution without disturbing unrelated schedules. App pending edits/cancel use
  explicit scope/currentness and immutable frozen targets; N25 fences source admission and makes a named
  replacement/rebind, preserving source history and holds.
gui_related: false
gui_classification_reason: Governs atomic schedule mutation, timezone validation, and invalidation precedence.
depends_on: [SQR-009]
unblocks: []
acceptance_criteria:
  - Schedule edits mutate existing record with revision increment without creating duplicates.
  - Time picker strictly prevents past-time submission in destination IANA timezone.
  - Cancellation or immediate execution cleanly invalidates pending schedules.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: schedule_mutation_duplication_or_stale_dispatch
reasoning_tier: high
context_scope: schedule_mutation_lifecycle
implementation_surfaces:
  - Plans/Scheduling_and_Quota_Resume.md
  - Plans/Assistant_Plan_Runtime.md
node_compile_hint:
  mode: schedule_mutation_specification
  create_worknodes: false
source_lineage:
  - "APR-019"
  - "APR-043"
  - "projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#lane-c"
  - "projects-refresh-20261030/pass2/NOPROJECT-PROPOSAL.md#approved-2026-11-03"
  - "Jared, 2026-11-03: Plan mode and scheduled tasks are also available in no project. It's only planning wizard/prd builder/orchestrator that isn't."
preserved_exact_tokens:
  - "atomic mutation"
  - "IANA timezone"
  - "invalidation precedence"
negative_constraints:
  - Do not spawn orphan schedules when editing pending schedules.
  - Do not dispatch a canceled or superseded schedule.
owner_hints:
  - Plans/Scheduling_and_Quota_Resume.md
```

ContractRef: ContractName:Plans/Scheduling_and_Quota_Resume.md, ContractName:Plans/Assistant_Plan_Runtime.md

### SQR-011 - Original run-specific cancellation and complete scheduler custody

SQR-011 supplies the existing Scheduling owner participant in APR-017's original joint cancellation, using the full `ExecutionSchedule`, `QuotaResumeConsent`, `ScheduleRunBinding`, `ScheduleExpected`, `ConsentExpected`, `ScheduleQuotaEffect` and original source-origin contracts in `Plans/assistant_plan_cancel_custody.schema.json`. It does not add a scheduler service or widen consent to an account, thread or future Run.

Under the existing Scheduling owner's native server transaction and all-writer exclusion, select every schedule/window and quota consent associated with exactly this execution. ScheduleRunBinding is the explicit original scheduling correlation required by canonical exact association keys: it maps an actual schedule to its admitted PlanRun and frozen target/version/hash. It is created/updated by the actual scheduler in the same original admission that binds the schedule, not by cancellation or by a scan heuristic. It does not map Goals to Plans. Existing pre-run future schedules create no Goal or PlanRun; this profile does not create a ScheduleRunBinding for those until actual scheduled admission binds the run. Unrelated scheduled messages are excluded by their original target kind and never mutated.

Complete selection comes from the actual authoritative scheduler records and original correlations under the same native ownership fence, including disabled/terminal rows and in-flight original writes for this execution. It is not a caller-supplied list, a UI snapshot or an optional reverse index. The native selection attestation names the exact original source read operation and semantic hash of the whole ordered schedule/binding and consent arrays. Complete physical source keys are sorted by exact UTF-8 bytes; duplicate source identities, omitted originals, an unaccounted target mapping or a pending writer outside this fence refuse the route. A zero-cardinality set is proved by the native complete selection, not by omitted fields. Quota consent run_id/provider/account identities remain exact; account-wide or thread-wide consent is never selected.

Every timer registration, schedule update, quota-consent writer, Plan-run admission/retry/resume and owner completion/callback that could race this selection must participate in the same applicable original owner exclusion and current Stop checks. This is placement within the existing owners, not a new coordinator service. C-source confirms that these exact source contracts/owners can be enlisted before the bound route is admitted. GRS-076 supplies the bound source adoption; actual native entry, representation and current authority remain mandatory.

Every selected active or paused schedule changes only to invalidated, its original revision +1 and the actual original Scheduling cancellation reason for this execution. Preserve all other native fields, including full target/version/hash, local time, timezone, DST policy and existing schedule policy. Already cancelled, completed or invalidated rows remain whole-byte identical, including their full historical invalidated_reason, source_revision and origin. ScheduleRunBinding remains identical. The compact ScheduleEffect stores only null for an actual null resulting reason, otherwise lowercase SHA-256 of the resulting full original reason's exact scalar UTF-8 bytes with no normalization. Derive that commitment before Stop; it is not a future text slot and never replaces the full native reason.

Every selected enabled quota consent changes only enabled=false and updated_at to the genuine original Scheduling commit time. Preserve run/provider/account/consent/schedule identity, reset source/truth/time/confidence and original user_stop_epoch. Already disabled consent remains whole-byte identical. The current effective host Stop separately invalidates old eligibility; the consent's recorded prior epoch is not rewritten to manufacture currentness.

All changed native wrappers advance source_revision exactly once; unchanged rows retain exact wrapper and origin bytes. Original Plan/Scheduler/Storage participants publish their entire joined change/effect/result set in one transaction, including a genuine empty-set ScheduleQuotaEffect when selection proves no members. The Scheduler entry returns the complete `CommitResult` success `CommitAdmission` or exact `NotSettled`; it cannot release a partial successful receipt or manufacture bound_plan_settled while the Plan participant waits. A post-Stop refusal preserves the Stop and real earlier effects.

At preparation and final mutation, all server timers, schedule admissions/updates, consent writers, Plan retry/resume/completion and callback writers participate in the exact current owner exclusion. Existing eligibility clauses run at decision and immediately before dispatch against current full original schedule/consent/correlation, Run state/epoch, target currentness and real Stop. Window opening, quota reset, fresh context and old timer delivery cannot resume this cancelled Run. No unrelated scheduled message is cancelled. Unknown effects remain with their original reconciliation owner. Current effect reads require the complete actual selected after-state; SP-307 retirement or a later legitimate source change can make that route unavailable without erasing original retained receipts.

Full schedules and consents have the explicit SP-306 source-authority classifications. The full schedule reason is preserved; classifying compact reason digests as content-free does not redact the scheduling instruction. Runtime, transcript, provider response, scheduled-message and attachment content retain their own independent lifetimes.

Every independently callable original participant captures complete authentic inputs, native participant/root/registration/operation/currentness/permission/deletion/hold sources, all beforeimages and the independently derived full permissible output before any returning helper. After all returning parsers, builders, codecs, resolvers, copies and comparators, it repeats one pure full-native and whole-candidate predicate with no helper, callback, logger or async gap to its own commit or passive disclosure. The outer publisher also checks the complete joined result. Original readback precedes dependent publication. Shape, detached hashes, matching names and serialized leases do not authenticate authority. Refusal preserves every genuine prior effect and unrelated original member.

This is a source-contract integration. Native installation, original issuer authentication, all-writer enrollment, safe-stop/callback exclusion, exact codec execution, redb atomicity/fsync/crash behavior, source/result replay, backup/restore and Janitor execution remain NOT_RUN. No new public command, event, Goal state, WorkNode, NodeSeed, readiness admission, event-depth pass or governance seal follows.

```yaml
plan_unit_id: SQR-011
unit_type: schema_contract
status: accepted
owner_doc: Plans/Scheduling_and_Quota_Resume.md
canonical_text: >-
  Original run-specific cancellation and complete scheduler custody. The native Scheduling owner proves
  the complete exact Run-associated selection, including disabled/terminal rows, authentic empty sets and
  all in-flight writers. The complete app sibling covers scheduled messages, windows, consents,
  correlations and in-flight writers under SQR-019; original Project source/cancel codecs stay exact.
  Conversion cannot reconstruct accepted source or drop genuine partial Stop/cancel effects.
gui_related: false
gui_classification_reason: Defines original owner, schema, storage or verification contracts.
split_recommended: false
depends_on:
- SQR-010
- SP-306
unblocks: []
acceptance_criteria:
- The native Scheduling owner proves the complete exact Run-associated selection, including disabled/terminal
  rows, authentic empty sets and all in-flight writers.
- Only active/paused schedules and enabled consents receive the specified deltas; all full source fields
  and existing terminal reasons remain exact.
- The Scheduler returns the whole joint result or exact NotSettled and never publishes a partial successful
  invalidation receipt.
- Eligibility, source ownership and current Stop/Run epoch are rechecked after helpers at every actual
  dispatch/effect boundary.
validation_surfaces:
- Plans/assistant_plan_cancel_custody.schema.json
- Plans/assistant_plan_cancel_contracts/owner-field-map.json
- Plans/assistant_plan_cancel_contracts/semantic-obligations.json
risk_class: goal_cancellation_original_authority_or_effect_loss
reasoning_tier: high
context_scope: sqr_011_bound_plan_custody
implementation_surfaces:
- Plans/Scheduling_and_Quota_Resume.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-039"
  - "Plans/Decision_Log.md#DL-045"
  - "Plans/Decision_Log.md#DL-047"
  - "projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#lane-c"
  - "projects-refresh-20261030/pass2/NOPROJECT-PROPOSAL.md#approved-2026-11-03"
  - "Jared, 2026-11-03: Plan mode and scheduled tasks are also available in no project. It's only planning wizard/prd builder/orchestrator that isn't."
negative_constraints:
- No public command, event, Goal or Plan lifecycle expansion, peer owner or fabricated original effect.
- No native field redaction, numeric coercion, new retention policy, full runtime archive or automatic
  deployed migration.
- No model/native execution, WorkNode/NodeSeed/readiness admission or governance seal.
```

Amended 2026-11-05 (DG-OWN-C, DL-045): Exactly goal.cancelled adopts M1-M9/W2 and SQR-1130 complete actual schedule/consent/correlation/pending/callback mapping. The complete new contract is `Plans/goal_own_c_contracts/protocol.md`; full inherited-root executable coverage remains required. Native execution stays NOT_RUN.


## Wand Modules Redesign Addendum (2026-09-27)

This addendum compiles the scheduling lines of the wand-modules redesign (ledger
`pldg-20260927-003-wand-scheduling`) from the design spec frozen at
`/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md`
(SHA-256 `dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de`), sections 8.7 to 8.9 and 8.15,
and register lines B-SQR-01 to B-SQR-07 of
`/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md`
(SHA-256 `71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493`). It carries the contract, not the
concept: no concept class, key, harness hook or browser-storage rule becomes canon. The transcript families and
the accent budget are ACD-469's and the shared dock is `Plans/assistant-chat-design.md`'s; this owner supplies
content to them and redefines neither. The scheduling defaults stay Settings-owned (section 1). The project-wide
"Pause all automations" switch (B-SQR-05) is compiled in SQR-018 from the owner's answer on decision card p12,
recorded as DL-136.

### SQR-012 - Scheduled-Message Card Grammar And Scheduling Dock Lines

A scheduled message has one card in its source thread, and its form follows the owner state. `Scheduled` is a
future bubble at its transcript position: right-aligned like the message it will become, outlined as not yet
sent, holding the exact text, with a dateline that begins with the word Scheduled and gives the send time in the
schedule's own timezone and the time remaining, a clock ring that fills over the real remaining time, and one
fine line naming the destination, the attachment count, the requested model or route and the zone with its IANA
name. `Held` is a decision bubble: a warm whole-surface tint whose sentence begins with Held and names the exact
reason, including "missed at <time>" for a message missed under the `hold` policy. `Sent`, `Canceled`, `Failed`
and `Expired` are one-line receipts that begin with their state word; a `Sent` receipt gives the send time and
when it was scheduled, links to the dispatched message and does not repeat the text, and the dispatched user
message carries a "Sent on schedule" mark linked to its schedule. The state always reads as a glyph and the word,
never as a status badge. Under ACD-469's family map the `Scheduled` and `Held` forms present in the Time family
and the four receipts as Ledger lines. Within the Time family the card's internals are owned here (DL-138): the time
shown is the schedule's own local time, and the card carries no separate ticket or stub, so ACD-469's "ticket
with a time block" does not describe the scheduled-message card's internals.

Scheduling contributes attention items to the shared dock above the composer and nothing else. While any
message in the thread is `Held`, one needs-you line reads "1 scheduled message needs you" (or the count) with
Show. While any message in the thread is `Scheduled`, one line of the lowest priority reads "Coming up", the
next send time, a short preview and "+N more", with Show. Both are derived from the scheduled-message
projection, carry the schedule identity, and Show only reveals the card. Scheduling adds no second strip, no
second quota strip and no checkbox; the quota wait strip in section 3 stays the one quota surface.

```yaml
plan_unit_id: SQR-012
unit_type: requirement
status: accepted
owner_doc: Plans/Scheduling_and_Quota_Resume.md
canonical_text: >-
  A scheduled message has one card in its source thread whose form follows owner state. Scheduled is a
  future bubble at its transcript position with a dateline that begins with Scheduled, gives the send time
  in the schedule's own timezone and the time remaining, a clock ring over the real remaining time, and a
  fine line naming destination, attachment count, requested model or route, and zone with IANA name. Held
  is a decision bubble whose sentence begins with Held and names the exact reason, including a missed time
  under the hold policy. Sent, Canceled, Failed and Expired are one-line receipts that begin with their
  state word; a Sent receipt links to the dispatched message without repeating the text. States read as a
  glyph and the word, never a badge. Under ACD-469's family map Scheduled and Held present in the Time
  family and the receipts as Ledger lines; the card's internals are owned here and carry no ticket or
  stub. ACD-469's Time-family ticket phrase does not describe those internals (DL-138). Scheduling
  contributes to the shared dock only one needs-you line while a message in the thread is Held and one
  lowest-priority Coming up line with the next send time, a preview and +N more; Show only reveals the
  card, and no second strip, quota strip or checkbox is added. PC3 (2026-10-29): the six Scheduled owner
  states map as follows: Scheduled → pending/sleep; Held → waiting/wonder; Sent → complete/happy; Canceled
  → skipped/sleep; Failed → failed/oops; Expired → skipped/sleep. Keep owner labels and cadence.
  Dependency-wait is a build/work state, not a seventh Scheduled state. With Status faces off show the
  same key’s catalog mark; cancel still uses the Schedule Manager’s existing command, and Processes reads
  the schedule snapshot without owning dispatch. The same card/dock/receipt shows app No project and named
  Computer with the schedule's stored time/zone/target. Host outage is unavailable evidence, not a
  fabricated terminal state or a seventh schedule lifecycle.
gui_related: true
gui_classification_reason: Defines the in-chat forms of a scheduled message and the dock lines scheduling supplies.
depends_on:
- SQR-002
- SQR-007
- SQR-009
- ACD-469
unblocks:
- SQR-013
- SQR-018
acceptance_criteria:
- Each of the six owner states renders in its form, and every form's visible sentence begins with its state
  word.
- A message missed under the hold policy renders as Held with its missed reason, never as a seventh state.
- No form renders the state as a badge, and a Sent receipt does not repeat the message text.
- The scheduled-message card uses its own-zone time and no separate ticket or stub inside the Time family.
- The dock carries at most one needs-you line and one Coming up line from scheduling, and Show dispatches no
  command.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
risk_class: scheduled_message_state_misread
reasoning_tier: standard
context_scope: scheduled_message_card
implementation_surfaces:
- Plans/Scheduling_and_Quota_Resume.md
- Plans/assistant-chat-design.md
- Plans/FinalGUISpec.md
node_compile_hint:
  mode: owner_presentation_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md#8.7 (SHA-256 dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md B-SQR-01, B-SQR-02 (SHA-256 71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493)"
  - "Plans/Decision_Log.md DL-138; /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-followups-20260929/ANSWERS-20260929.md sha256:345247dfb965fa19ae2f68847125c5b6cafe26126a56bb5b80242e88d3fa9d5c question 6"
  - "projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#lane-c"
  - "projects-refresh-20261030/pass2/NOPROJECT-PROPOSAL.md#approved-2026-11-03"
  - "Jared, 2026-11-03: Plan mode and scheduled tasks are also available in no project. It's only planning wizard/prd builder/orchestrator that isn't."
preserved_exact_tokens:
- Scheduled
- Held
- Sent
- Canceled
- Failed
- Expired
- future bubble
- decision bubble
- Coming up
- ticket
negative_constraints:
- Do not render a scheduled-message state as a badge or without its state word.
- Do not add a seventh visible state for a missed message.
- Do not add a second scheduling strip, quota strip or checkbox above the composer.
owner_hints:
- Plans/Scheduling_and_Quota_Resume.md
```

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FinalGUISpec.md

### SQR-013 - Card And Sheet Actions Map Onto The Existing Commands

Every scheduling control is an existing command, navigation or a disclosure. The Schedule Message sheet's primary
is `cmd.chat.schedule_message` with precondition `schedule_text_not_empty`: the sheet has its own editable text,
prefilled from the composer, so an empty composer does not block it; the composer buffer clears only after the
durable commit and only when the scheduled text came from it. On the card and in the Schedule Manager, Edit,
Edit and send and Reschedule are `cmd.chat.schedule_message.update`; Edit refuses with its typed reason, printed
as a sentence, once dispatch has started. Send now on a `Held` message, including a missed one, is the same
update with `reschedule_to: "now"`. Cancel is `cmd.chat.schedule_message.cancel` with the expected revision and
currentness. Go to message and Open message are `cmd.chat.open_thread` with `route_target: message`. Details only
disclose; the Schedule Message and Build At sheets, the scheduled-message card and its record, and the Schedule Manager show no Technical details
(DL-148).

The Build At sheet's primary is one `cmd.chat.plan.schedule_build` whose `AssistantPlanScheduleRequest` carries
the window specification; the owner creates the binding and its `ExecutionSchedule` atomically, and the surface
never pairs it with `cmd.execution_window.create`. A Crew chosen in the sheet is frozen into that request's
topology (PSCHED-001..003). Use V<n> on an invalidated schedule is `cmd.chat.plan.schedule_build` against the new
version's exact hash, an explicit reschedule that leaves the invalidated schedule as its audit record. Cancel
schedule is `cmd.execution_window.cancel` by the returned `schedule_id`, and editing a build schedule is
`cmd.execution_window.update`. Cancel schedule on the Plan card is an admitted `plan_card` producer of
`cmd.execution_window.cancel` (DL-138). The source surfaces are `schedule_sheet`, `plan_schedule`,
`scheduled_message_card`, `schedule_manager` and `plan_card`, registered in the command catalog; the wand row and
the Plan card's `Build At…` only open their sheets.

```yaml
plan_unit_id: SQR-013
unit_type: requirement
status: accepted
owner_doc: Plans/Scheduling_and_Quota_Resume.md
canonical_text: >-
  Every scheduling control is an existing command, navigation or a disclosure. Schedule Message commits
  through cmd.chat.schedule_message with precondition schedule_text_not_empty, and the composer clears
  only after the durable commit and only when the text came from it. Edit, Edit and send and Reschedule
  are cmd.chat.schedule_message.update, refused with a printed typed reason once dispatch started; Send
  now on a Held message is that update with reschedule_to now; Cancel is cmd.chat.schedule_message.cancel
  with expected revision and currentness; Go to message is cmd.chat.open_thread with route_target message.
  Build At commits one cmd.chat.plan.schedule_build whose AssistantPlanScheduleRequest carries the window
  specification, created atomically and never paired with cmd.execution_window.create; Use V<n> is
  schedule_build against the new version's exact hash as an explicit reschedule; Cancel schedule is
  cmd.execution_window.cancel by the returned schedule_id; editing a build is cmd.execution_window.update.
  Source surfaces are schedule_sheet, plan_schedule, scheduled_message_card, schedule_manager and
  plan_card; the Plan card's Cancel schedule is an admitted plan_card producer of
  cmd.execution_window.cancel (DL-138). These same commands gain explicit app variants, actual sheet
  text/attachments and current target/Computer/permission/Stop joins under SQR-019. Build At remains one
  atomic schedule_build/window write; no second command or scheduler is added.
gui_related: true
gui_classification_reason: Binds every scheduling button on the sheet, card, manager and Plan card to its command.
depends_on: [SQR-002, SQR-003, SQR-010, SQR-012]
unblocks: []
acceptance_criteria:
  - "Scheduling a message with an empty composer and non-empty sheet text succeeds; an empty sheet text is refused."
  - "Send now dispatches cmd.chat.schedule_message.update with reschedule_to now, and no new command id exists for it."
  - "One Build At commit dispatches exactly one command and leaves either a complete schedule or none."
  - "Use V<n> never rebinds silently: it is a user-dispatched schedule_build against the new exact hash, and the old schedule stays invalidated."
  - "Cancel schedule on the Plan card dispatches cmd.execution_window.cancel from plan_card."
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
risk_class: scheduling_action_command_drift
reasoning_tier: high
context_scope: scheduling_command_mapping
implementation_surfaces:
  - Plans/Scheduling_and_Quota_Resume.md
  - Plans/UI_Command_Catalog.md
  - Plans/Commands_System.md
node_compile_hint:
  mode: owner_command_mapping
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md#8.15 and #8.7 G-21 (SHA-256 dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md B-SQR-03 (SHA-256 71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493)"
  - "Plans/Decision_Log.md DL-138; /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-followups-20260929/ANSWERS-20260929.md sha256:345247dfb965fa19ae2f68847125c5b6cafe26126a56bb5b80242e88d3fa9d5c question 8"
  - "projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#lane-c"
  - "projects-refresh-20261030/pass2/NOPROJECT-PROPOSAL.md#approved-2026-11-03"
  - "Jared, 2026-11-03: Plan mode and scheduled tasks are also available in no project. It's only planning wizard/prd builder/orchestrator that isn't."
preserved_exact_tokens:
  - "schedule_text_not_empty"
  - "reschedule_to"
  - "AssistantPlanScheduleRequest"
  - "cmd.chat.schedule_message.update"
  - "cmd.execution_window.cancel"
  - "plan_card"
  - "scheduled_message_card"
  - "schedule_manager"
negative_constraints:
  - Do not mint a new command for Send now, Reschedule or Use V<n>.
  - Do not dispatch cmd.execution_window.create beside cmd.chat.plan.schedule_build for one Build At commit.
  - Do not clear the composer before the durable schedule commit.
owner_hints:
  - Plans/Scheduling_and_Quota_Resume.md
```

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Commands_System.md

### SQR-014 - Schedule Manager Status Labels, Agenda Groups And Focused Record

The Schedule Manager keeps its four canonical tabs (SQR-009). Scheduled Messages reads as an agenda grouped
Needs you, Tonight, Tomorrow, Later and Past, by the owner's scheduled time in the viewer's timezone (the group for
the rest of the current day reads Today before evening); `Held` records sit in Needs you and terminal records in
Past as single lines. A row gives the time, the first line of the text, the destination, the state word with its
sentence, and its actions, and each schedule identity has exactly one row. A 48-hour overview above the tabs
draws scheduled messages and build slots from the same projection. Scheduled Messages, Execution & Build Windows
and Events & Automation each have a search field, a status filter and a sort; Resume & Safety Policy is a policy
tab, not a list, and has nothing to filter.

The status filter keeps the stored values Active, Paused, Completed, Failed and Expired that APR-027 named, adds
two values, Held and Canceled, and keeps All for no filter. Each label names one stored value and maps onto owner
states: All (every record), Waiting (Active: `scheduled` messages and `active` windows), Paused (Paused: `paused`
windows), Needs you (Held: `held` messages and `invalidated` build schedules), Done or sent (Completed:
`dispatched` messages and `completed` windows), Didn't send (Failed: `failed`), Skipped (Expired: `expired`), and
Canceled (Canceled: `cancelled`). A label never renames a stored value. Selecting a record opens its focused view in the same
sheet: the record's full sentence, its time track and its actions, with a way back to the full list.

```yaml
plan_unit_id: SQR-014
unit_type: requirement
status: accepted
owner_doc: Plans/Scheduling_and_Quota_Resume.md
canonical_text: >-
  The Schedule Manager keeps its four canonical tabs. Scheduled Messages is an agenda grouped Needs you,
  Tonight, Tomorrow, Later and Past by owner scheduled time in the viewer's timezone, with Held in Needs
  you, terminal records in Past, and exactly one row per schedule identity. Scheduled Messages, Execution
  & Build Windows and Events & Automation each have search, status filter and sort; Resume & Safety Policy
  is a policy tab, not a list. The status filter keeps the stored values Active, Paused, Completed, Failed
  and Expired, adds Held and Canceled, and keeps All for no filter; its labels Waiting, Paused, Needs you
  (held messages and invalidated build schedules), Done or sent, Didn't send, Skipped and Canceled each
  name one stored value and map onto owner states. Selecting a record opens a focused view in the same
  sheet with its full sentence, time track and actions. PC3 (2026-10-29): the six Scheduled owner states
  map as follows: Scheduled → pending/sleep; Held → waiting/wonder; Sent → complete/happy; Canceled →
  skipped/sleep; Failed → failed/oops; Expired → skipped/sleep. Keep owner labels and cadence.
  Dependency-wait is a build/work state, not a seventh Scheduled state. With Status faces off show the
  same key’s catalog mark; cancel still uses the Schedule Manager’s existing command, and Processes reads
  the schedule snapshot without owning dispatch. Scope filters and empty/filtered lists disclose actual
  app/Project/Computer coverage; app items retain one row per schedule identity and the same owner-only
  statuses.
gui_related: true
gui_classification_reason: Defines the Schedule Manager's grouping, filter labels and focused view.
depends_on:
- SQR-009
unblocks:
- SQR-018
acceptance_criteria:
- Every filter label names one stored value and maps to owner states as listed; Active, Paused, Completed,
  Failed and Expired keep their stored values, and Held and Canceled are the only values added.
- Each schedule identity appears in exactly one row under any filter and query.
- Resume & Safety Policy shows no search, status filter or sort.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
risk_class: schedule_manager_label_state_drift
reasoning_tier: standard
context_scope: schedule_manager_ui
implementation_surfaces:
- Plans/Scheduling_and_Quota_Resume.md
- Plans/FinalGUISpec.md
node_compile_hint:
  mode: owner_presentation_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md#8.9 (SHA-256 dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md B-SQR-04 (SHA-256 71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493)"
  - "projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#lane-c"
  - "projects-refresh-20261030/pass2/NOPROJECT-PROPOSAL.md#approved-2026-11-03"
  - "Jared, 2026-11-03: Plan mode and scheduled tasks are also available in no project. It's only planning wizard/prd builder/orchestrator that isn't."
preserved_exact_tokens:
- Waiting
- Needs you
- Done or sent
- Didn't send
- Skipped
- Tonight
- Tomorrow
- Later
- Past
negative_constraints:
- Do not change the stored status filter values to match the labels.
- Do not render Resume & Safety Policy as a filterable list.
owner_hints:
- Plans/Scheduling_and_Quota_Resume.md
```

ContractRef: ContractName:Plans/FinalGUISpec.md

### SQR-015 - Build At Sheet And The Plan Card Schedule Line

The Build At sheet binds the exact Plan version it names and commits through SQR-013. It offers One time or
Nightly time slot (`schedule_kind` `one_time` or `recurring_window`), the days as words, the start and stop
times, Keep going next time, Wrap-up time, the timezone, who builds it (`execution_topology`: "The assistant
builds it", "As a Goal", whose Goal is created only when the build starts, or "A Crew"), and what to do if the
slot is missed. A value the sheet shows is the value it records: when the missed policy is `cancel_after_grace`
the minutes shown are recorded as the schedule's `grace_seconds`. The read-back sentence and any DST line are
computed from the real start, stop and wind-down. The sheet names the exact Plan version it binds, and the Plan's id,
version and hash are in the Plan's Details (FinalGUISpec PDET-001), not in a Technical details disclosure on the
sheet (DL-148).

The Plan card's schedule line is secondary information beside the Build control; its placement belongs to
`Plans/Assistant_Plan_Runtime.md` and its content to this owner. Before a run it gives the cadence, the slot and
the next occurrence with a thin night ribbon (the slot, a now tick and the step progress); during an open slot
it reads "Building now" with the wrap-up time. Every other state leads with its canon token: `Outside execution
window` with when it continues, `Paused` for a build the user paused, `Waiting for Usage` with the reset time and
its reset truth (no countdown when the reset is unknown), and `Schedule needs update` for a schedule a revision
invalidated, with Use V<n> and Cancel schedule. A schedule invalidated with no newer version to rebind to (Build ran
the bound version now, or the bound execution ended) leads with `Schedule ended` and says why ("you started this build
now, so the schedule won't start a second one."), with no Use V<n> (DL-156). That wording is the owner's approved decision of 2026-10-09 (DL-157). Its layout is FinalGUISpec F3-607. The line never replaces the Build control's `Building…`, and `Scheduled` is
never a primary Plan status (PSCHED-011).

```yaml
plan_unit_id: SQR-015
unit_type: requirement
status: accepted
owner_doc: Plans/Scheduling_and_Quota_Resume.md
canonical_text: >-
  The Build At sheet binds the exact Plan version it names and commits through SQR-013, offering
  schedule_kind, days, start and stop, Keep going next time, Wrap-up time, timezone, execution_topology
  and the missed policy. A value the sheet shows is the value it records; under cancel_after_grace the
  shown minutes are recorded as grace_seconds in pm.execution.schedule.v2 and survive reload (DL-138). The
  read-back and DST line are computed from the real start, stop and wind-down; the sheet names the exact
  Plan version it binds, and the Plan's id, version and hash are in the Plan's Details, not in Technical
  details on the sheet (DL-148). The Plan card schedule line is secondary information whose placement is
  Assistant Plan Runtime's and whose content is this owner's: cadence, slot, next occurrence and a night
  ribbon before a run, Building now with the wrap-up time during a slot, and otherwise a lead canon token
  of Outside execution window, Paused, Waiting for Usage (with reset truth, no countdown when unknown),
  Schedule needs update with Use V<n> and Cancel schedule for a schedule a revision invalidated, or
  Schedule ended, with no Use V<n>, for a schedule invalidated with no newer version to rebind to
  (DL-156), its wording after Build being Schedule ended · you started this build now, so the schedule
  won't start a second one., approved by the owner on 2026-10-09 (DL-157); its layout is F3-607. It never
  replaces the Build control's Building… and Scheduled is never a primary Plan status. No-project Build At
  shows the exact Plan and fixed Computer, commits no run and uses SQR-019 current app
  permission/roots/pause. N25 maps exact revisions explicitly and carries time/holds, never latest or
  copied execution consent.
gui_related: true
gui_classification_reason: Defines the Build At sheet's recorded values and the Plan card schedule line's states.
depends_on: [SQR-003, SQR-004, SQR-005, SQR-013]
unblocks: [SQR-016, SQR-018]
acceptance_criteria:
  - "Every value shown on the Build At sheet, including the grace minutes, equals the value recorded on the schedule."
  - "The chosen grace_seconds survives restart in pm.execution.schedule.v2; a v1 read uses the previously effective default."
  - "Each secondary state of the schedule line begins with Outside execution window, Paused, Waiting for Usage, Schedule needs update or Schedule ended."
  - "A schedule invalidated with no newer version never offers Use V<n>."
  - "After Build on a scheduled Plan the line reads Schedule ended · you started this build now, so the schedule won't start a second one. (DL-157)."
  - "The Build control keeps Building… while the schedule line shows any secondary state."
  - "An unknown reset renders no countdown on the schedule line."
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
risk_class: scheduled_build_display_value_drift
reasoning_tier: standard
context_scope: build_at_surfaces
implementation_surfaces:
  - Plans/Scheduling_and_Quota_Resume.md
  - Plans/Assistant_Plan_Runtime.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: owner_presentation_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md#8.8 (SHA-256 dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md B-SQR-06 (SHA-256 71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493)"
  - "Plans/Decision_Log.md DL-138; /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-followups-20260929/ANSWERS-20260929.md sha256:345247dfb965fa19ae2f68847125c5b6cafe26126a56bb5b80242e88d3fa9d5c question 7"
  - "Plans/Decision_Log.md#DL-156 (Schedule ended, 2026-10-09)"
  - "Plans/Decision_Log.md#DL-157 (the Schedule ended wording approved by the owner, 2026-10-09)"
  - "projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#lane-c"
  - "projects-refresh-20261030/pass2/NOPROJECT-PROPOSAL.md#approved-2026-11-03"
  - "Jared, 2026-11-03: Plan mode and scheduled tasks are also available in no project. It's only planning wizard/prd builder/orchestrator that isn't."
preserved_exact_tokens:
  - "Outside execution window"
  - "Waiting for Usage"
  - "Paused"
  - "Schedule needs update"
  - "Schedule ended"
  - "pm.execution.schedule.v2"
  - "Building…"
  - "grace_seconds"
negative_constraints:
  - Do not show a Build At value that the schedule does not record.
  - Do not let the schedule line replace the Build control label or show Scheduled as a Plan status.
owner_hints:
  - Plans/Scheduling_and_Quota_Resume.md
```

ContractRef: ContractName:Plans/Assistant_Plan_Runtime.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Decision_Log.md#DL-157

### SQR-016 - Occurrence Summary, Overnight Receipt, Night Journal And Away Digest

Each window occurrence of a scheduled build has one occurrence summary, written by this owner once when the
occurrence closes (paused at wind-down, completed, cancelled or held) and keyed by `schedule_id` and occurrence
start, so a replay or restart returns the same summary. It is a projection: rebuilt from this owner's schedule
and dispatch records and from the run's step progress and pause facts as its owner reports them. It records the
occurrence's real bounds, the steps built of the total, how the occurrence ended, and the outcomes of scheduled
messages in the same thread during it. The `ExecutionOccurrenceSummary` projection contract is keyed by
`schedule_id` and `occurrence_start` and requires `actual_start`, `actual_end`, `steps_built`, `steps_total`,
`end_reason`, `execution_started`, and `scheduled_message_outcomes` with exact message identities and outcomes
(DL-138). `execution_started` states whether any build work started in this occurrence. When true, it joins
saved schedule and dispatch records to the exact `plan_run_id`, approved Plan version/hash, and durable work,
To-Do mapping and adherence facts used by `AssistantPlanProgressProjector` (APR-011). `steps_built` counts
distinct approved `plan_step_id` values completed in the occurrence, never skipped steps or raw To-Do count;
`steps_total` is the bound Plan total. Real bounds and close reason come from dispatch and safe-pause or terminal
facts. When a closed occurrence was held before any build work started, the summary instead uses retained
Scheduling eligibility/hold and closure facts for that exact occurrence and the bound approved Plan. It records
`execution_started: false`, `end_reason: held`, `steps_built: 0`, and explicit null `actual_start` and `actual_end`;
`plan_run_id` is null if no PlanRun was admitted, or identifies the already-existing run if this was a held
continuation window. `steps_total` still comes from the bound Plan and same-thread message outcomes still come
from Scheduling records. No run is created for the summary and no execution timestamps are invented. An explicit
not-started fact is distinct from missing history: without the retained hold/closure facts, or without required
run facts for an occurrence that did start, the summary remains unavailable rather than guessing.

Three surfaces read it and none writes it. The overnight receipt is one Ledger-family receipt in the Plan's
thread per occurrence ("Overnight: built 2 of 5 steps (10:00 PM–1:52 AM, paused safely) · sent 1 scheduled
message · 1 message needs you · Open"), whose Open focuses the record in the Schedule Manager; it is not a Plan
status, never changes the Build control, and is not itself a needs-you item. The night journal lists the
summaries in the build's Schedule Manager row ("Night 1: built 2 of 5 steps · paused safely at 1:52 AM"). The
"since you were last here" digest is a query over the same records for outcomes after an instant the consuming
surface supplies; this owner stores no per-user last-seen marker. No new command or event name is introduced.

```yaml
plan_unit_id: SQR-016
unit_type: requirement
status: accepted
owner_doc: Plans/Scheduling_and_Quota_Resume.md
canonical_text: >-
  Each window occurrence of a scheduled build has one occurrence summary, written by this owner once when
  the occurrence closes and keyed by schedule_id and occurrence start so replay returns the same summary.
  It is a projection rebuilt from schedule and dispatch records and the run owner's reported step progress
  and pause facts, recording real bounds, steps built of total, how the occurrence ended, and same-thread
  scheduled message outcomes. ExecutionOccurrenceSummary requires schedule_id, occurrence_start,
  actual_start, actual_end, steps_built, steps_total, end_reason, execution_started and
  scheduled_message_outcomes with exact identities (DL-138). When execution_started is true, it joins the
  exact plan_run_id and approved Plan version/hash to durable work, To-Do and adherence facts used by
  AssistantPlanProgressProjector (APR-011); steps_built counts distinct approved plan_step_id completions
  in that occurrence. A closed occurrence held before any build work starts uses retained Scheduling
  eligibility/hold and closure facts for that occurrence and the bound Plan: execution_started is false,
  end_reason is held, steps_built is 0, and actual_start and actual_end are null. plan_run_id is null when
  no run was admitted, or names the existing run for a held continuation window. steps_total is always the
  bound Plan total. The summary creates no run and invents no execution bounds; missing historical facts
  remain unavailable, distinct from a recorded not-started outcome. The overnight receipt is one
  Ledger-family receipt per occurrence in the Plan's thread whose Open focuses the Schedule Manager
  record; it is not a Plan status, never changes the Build control, and is not a needs-you item. The night
  journal lists the summaries in the build's manager row. The since you were last here digest queries the
  same records after an instant the consuming surface supplies; this owner stores no per-user marker. No
  new command or event name is introduced. App occurrence summaries use the exact
  schedule/target/scope/Computer and remain projections of real accepted eligibility/dispatch/run facts.
  Conversion retains source occurrence history without duplicate dispatch, Usage or invented execution
  bounds.
gui_related: true
gui_classification_reason: Defines the overnight receipt, the night journal and the away digest as projections of one summary.
depends_on: [SQR-004, SQR-006, SQR-007, SQR-015]
unblocks: []
acceptance_criteria:
  - "One occurrence produces exactly one summary and at most one overnight receipt, across replay and restart."
  - "A closed occurrence held before execution has execution_started false, end_reason held, zero built steps and null execution bounds; no admitted run means a null plan_run_id."
  - "ExecutionOccurrenceSummary fails closed when required Scheduling hold/closure facts or started-run step, pause or close facts are unavailable."
  - "steps_built excludes skipped steps and raw To-Do counts; steps_total comes from the bound approved Plan."
  - "The overnight receipt, the night journal and the away digest agree because they read the same summary."
  - "No overnight receipt changes a Plan status or the Build control label."
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
risk_class: duplicate_or_divergent_occurrence_reporting
reasoning_tier: standard
context_scope: scheduled_build_projections
implementation_surfaces:
  - Plans/Scheduling_and_Quota_Resume.md
  - Plans/Assistant_Plan_Runtime.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: owner_projection_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md#8.8 and #8.9 (SHA-256 dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md B-SQR-06 (SHA-256 71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493)"
  - "Plans/Decision_Log.md DL-138; /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-followups-20260929/ANSWERS-20260929.md sha256:345247dfb965fa19ae2f68847125c5b6cafe26126a56bb5b80242e88d3fa9d5c question 7"
  - "projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#lane-c"
  - "projects-refresh-20261030/pass2/NOPROJECT-PROPOSAL.md#approved-2026-11-03"
  - "Jared, 2026-11-03: Plan mode and scheduled tasks are also available in no project. It's only planning wizard/prd builder/orchestrator that isn't."
preserved_exact_tokens:
  - "ExecutionOccurrenceSummary"
  - "execution_started"
  - "AssistantPlanProgressProjector"
  - "steps_built"
  - "steps_total"
  - "occurrence summary"
  - "overnight receipt"
  - "night journal"
  - "since you were last here"
negative_constraints:
  - Do not write more than one overnight receipt for one occurrence.
  - Do not present an occurrence outcome as a Plan status.
  - Do not store a per-user last-seen marker in this owner.
owner_hints:
  - Plans/Scheduling_and_Quota_Resume.md
```

ContractRef: ContractName:Plans/Assistant_Plan_Runtime.md, ContractName:Plans/assistant-chat-design.md

### SQR-017 - Display Labels For Missed Policy, Next-Window Resume And Wind-Down

The surfaces label the stored values as follows, and a label never renames a value, a field or a Settings key.
The missed policy's menu is titled "If it's missed" on the Schedule Message sheet and "If the slot is missed" on
the Build At sheet. For a message, `hold` reads "Ask me first", `next_available` "Send as soon as I'm back" and
`cancel_after_grace` "Skip it if it's more than N min late". For a build, `hold` reads "Ask me first",
`next_available` "Build at the next chance" and `cancel_after_grace` "Skip it if it's more than N min late". N is
the recorded grace in minutes. `auto_resume_next_window`, defaulted from `resume_next_window`, reads "Keep going
next time" ("Unfinished work continues in the next slot."). `wind_down_seconds`, defaulted from
`wind_down_minutes`, reads "Wrap-up time" ("Stop starting new tasks this many minutes before the end, so nothing
is cut off mid-way."). Timezone choices list the device zone first, as the default, then the others, each with
its IANA name; UTC is offered as "UTC" and is never the default.

```yaml
plan_unit_id: SQR-017
unit_type: requirement
status: accepted
owner_doc: Plans/Scheduling_and_Quota_Resume.md
canonical_text: >-
  Display labels never rename a stored value, field or Settings key. The missed-policy menu is titled If
  it's missed for a message and If the slot is missed for a build. For a message hold reads Ask me first,
  next_available Send as soon as I'm back, and cancel_after_grace Skip it if it's more than N min late;
  for a build hold reads Ask me first, next_available Build at the next chance, and cancel_after_grace
  Skip it if it's more than N min late, where N is the recorded grace in minutes. auto_resume_next_window,
  defaulted from resume_next_window, reads Keep going next time; wind_down_seconds, defaulted from
  wind_down_minutes, reads Wrap-up time. Timezone choices list the device zone first as the default, each
  with its IANA name, and UTC is never the default. Identical labels/default choices apply to app
  schedules on their fixed owning Computer; conversion preserves saved timezone/DST/grace/missed policy,
  and Ask me first remains a hold in YOLO.
gui_related: true
gui_classification_reason: Fixes the words the scheduling sheets show for stored scheduling values.
depends_on: [SQR-002, SQR-004]
unblocks: []
acceptance_criteria:
  - "Each missed-policy value shows its per-surface label, and the stored value is unchanged."
  - "The grace minutes in a Skip label equal the recorded grace."
  - "The default timezone choice is the device zone, not UTC."
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
risk_class: scheduling_label_value_drift
reasoning_tier: standard
context_scope: scheduling_display_labels
implementation_surfaces:
  - Plans/Scheduling_and_Quota_Resume.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: owner_presentation_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md#8.7 and #8.8 G-33 (SHA-256 dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md B-SQR-07 (SHA-256 71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493)"
  - "projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#lane-c"
  - "projects-refresh-20261030/pass2/NOPROJECT-PROPOSAL.md#approved-2026-11-03"
  - "Jared, 2026-11-03: Plan mode and scheduled tasks are also available in no project. It's only planning wizard/prd builder/orchestrator that isn't."
preserved_exact_tokens:
  - "Ask me first"
  - "Send as soon as I'm back"
  - "Build at the next chance"
  - "Keep going next time"
  - "Wrap-up time"
  - "resume_next_window"
  - "cancel_after_grace"
negative_constraints:
  - Do not rename a stored scheduling value or Settings key to match its label.
  - Do not default the timezone to UTC.
owner_hints:
  - Plans/Scheduling_and_Quota_Resume.md
```

ContractRef: ContractName:Plans/Scheduling_and_Quota_Resume.md, ContractName:Plans/Settings_System.md

### SQR-018 - Project-Wide Pause All Automations

"Pause all automations" is one project-wide switch that stops every scheduled send and scheduled build in the
project until the user turns it back on (DL-136, decision card p12, register line B-SQR-05). One command sets and
clears it: `cmd.runtime.automation_pause.set`, project-scoped, whose payload `paused` is true or false. The switch
lives in the Schedule Manager's Resume & Safety Policy tab, which is where the Build At sheet's promise "Pause all
automations always wins." points. Its state is a project-scoped operational record owned here, holding the
`project_id`, `paused`, the project's `user_stop_epoch`, who changed it, when, and a revision. It is never a
Settings value, and no Settings default seeds it. The Storage companion registers the project-scoped key
`project_automation_pause.v1:{hex(storage_instance_id)}:{hex(project_id)}` and the
`pm.runtime.project_automation_pause.v1` value with the storage registry under SP-323 before a durable write is claimed (DL-138). Until then the typed record remains a
contract shape, not a registered physical writer.

The switch is a user manual stop at project scope and ranks with user manual Pause in the section 1 precedence.
Turning it on advances the project's `user_stop_epoch` the way Manual Stop advances a run's. Every eligibility
evaluation for a target in the project captures that epoch beside the target's own and compares both again at
dispatch, so a dispatch decided before the switch was turned on and delivered after it is discarded. While it is
on, the one eligibility predicate (SQR-006) fails for every scheduled message, scheduled build, window resume and
quota resume in the project, with the failed clause `project_automation_paused`. A scheduled build that is already
running when the switch is turned on stops admitting new work and pauses at its next safe point, the boundary that
wind-down uses (SQR-004), never in the middle of an atomic operation. A message whose dispatch had already started
completes. Turning the switch on cancels nothing, invalidates no schedule, disables no quota consent and changes no
per-run latch; it only holds them.

Only the user clears the switch, by sending the command with `paused` false; a request from any other actor is
refused with `permission_denied`. No automatic mechanism clears or bypasses it: not a quota reset, a window
opening, a schedule time, a cleared dependency, a provider retry, or a Goal, Plan or Crew automatic continuation.
Creating a new schedule while the switch is on does not clear it; the new schedule is recorded and waits like the
others. Work the user starts directly is not an automation and is not blocked: Send, Build, an explicit user
resume of one run, and Send now on a held message still act, and each acts on that one item and leaves the switch
on. The dispatch of a Send now is exempt from the `project_automation_paused` clause because the accepted
`cmd.chat.schedule_message.update` with `reschedule_to: "now"` records the user as its actor (SQR-006); every other
clause still holds. A request that sets the
value the switch already has returns the record unchanged and does not advance the epoch again.

Turning the switch off clears only the project latch. It releases no per-run manual Pause, Stop or Cancel, and it
dispatches nothing by itself. Every item it held is evaluated again by the one predicate. An occurrence that came
due while the switch was on is a missed occurrence and follows its recorded missed policy once, as after a
restart (section 4), so no backlog burst fires. A message whose send time arrived while the switch was on is
stored `held` whatever its missed policy, and at switch-off the owner applies that policy to it: under `hold` it
stays `held` for the user and its sentence names the missed time instead of the switch; under `next_available`,
and under `cancel_after_grace` while it is still within its grace, it returns to `scheduled` for immediate
dispatch and dispatches once through both eligibility checks; under `cancel_after_grace` past its grace it moves
to `expired`. Once the switch is off no item keeps the reason "Pause all automations is on". A scheduled build
that the switch paused is resumed by the scheduler only when the predicate passes again after switch-off, and
never replays work it had already committed.

The reason is visible on every item the switch holds. On the Resume & Safety Policy tab the switch reads "Pause
all automations" with "Off: scheduled things start on time." when it is off, and "Paused by you at <time>" with
"Turn back on" when it is on; "Turn back on" sends the command with `paused` false. While it is on, every
scheduled-message card, Schedule Manager row and Plan card schedule line in the project that it holds names the
reason "Pause all automations is on". A message held at its send time is `Held` and its sentence begins with Held
and names that reason (SQR-012); a build it holds has a schedule line that begins with `Paused` (SQR-015); and the
manager rows keep the labels of SQR-014. No stored state value is added: a message held at its send time is
`held`, a run the switch pauses is `paused`, and stored schedule states are unchanged. A changed value reserves
`runtime.automation_pause_changed` (section 3, Events), but its EventRecord is not emitted while Event Authority
registration is open; the result records `missing_event_registration` without treating its receipt as an event
(DL-138). The Schedule Manager is the only candidate command producer; its wiring exclusion remains until the
command's exact owner, handler and production wiring are admitted. ATS-064 names planned runtime scheduling
checks, not an executed test result.

```yaml
plan_unit_id: SQR-018
unit_type: requirement
status: accepted
owner_doc: Plans/Scheduling_and_Quota_Resume.md
canonical_text: >-
  Pause all automations is one project-wide switch that stops every scheduled send and scheduled build in
  the project until the user turns it back on (DL-136, DL-138). cmd.runtime.automation_pause.set,
  project-scoped with payload paused true or false, sets and clears it from the Schedule Manager's Resume
  & Safety Policy tab; its state is a project-scoped operational record owned here and never a Settings
  value, with pending Storage key project_automation_pause.v1:{hex(storage_instance_id)}:{hex(project_id)}
  for pm.runtime.project_automation_pause.v1 (SP-323). It is a user manual stop at project scope that
  ranks with user manual Pause: turning it on advances the project's user_stop_epoch the way Manual Stop
  does, every evaluation compares the project's epoch as well as the target's, and while it is on the one
  eligibility predicate fails for every scheduled message, scheduled build, window resume and quota resume
  in the project with the failed clause project_automation_paused. A running scheduled build pauses at its
  next safe point, never mid-atomic-operation, and a dispatch already started completes. It cancels,
  invalidates and disables nothing and changes no per-run latch. Only the user clears it, by sending
  paused false; no quota reset, window opening, schedule time, cleared dependency, provider retry, Goal,
  Plan or Crew continuation, or newly created schedule clears or bypasses it. Work the user starts
  directly is not blocked and leaves the switch on: Send, Build, an explicit user resume of one run, and
  Send now, whose single dispatch is exempt from project_automation_paused because its accepted update
  records the user as actor. Turning it off releases no per-run latch and dispatches nothing by itself;
  each occurrence that came due while it was on follows its recorded missed policy once, with no backlog
  burst: a message it held stays held naming its missed time under hold, returns to scheduled and
  dispatches once under next_available or within the grace of cancel_after_grace, and expires past that
  grace, and no item keeps the switch's reason once it is off. Every item it holds names the reason Pause
  all automations is on, the switch reads Paused by you at a time with Turn back on, or Off: scheduled
  things start on time. A changed value reserves runtime.automation_pause_changed, but EventRecord
  emission is disabled with missing_event_registration until Event Authority admits that family; a receipt
  is not an event (DL-138). This Project operational record/key/epoch remains unchanged. SQR-020
  separately admits the application variant of the same command for all no-project chats on one real
  Server; absence of an app record is not off and a move does not clear either scope latch.
gui_related: true
gui_classification_reason: Defines the Resume & Safety Policy switch and the reason every held scheduled item shows.
depends_on: [SQR-001, SQR-004, SQR-006, SQR-012, SQR-014, SQR-015]
unblocks: [ATS-064]
acceptance_criteria:
  - "While Pause all automations is on, no scheduled send, scheduled build, window resume or quota resume in the project dispatches, and each refusal records project_automation_paused."
  - "A Send now the user sends while the switch is on dispatches that one message, and the switch stays on."
  - "A dispatch decided before the switch was turned on and delivered after it is discarded."
  - "A quota reset, window opening, schedule time, automatic continuation or newly created schedule leaves the switch on."
  - "Only a user request with paused false clears it; any other actor is refused with permission_denied."
  - "Turning it off releases no per-run latch, and each occurrence that came due while it was on follows its recorded missed policy with no backlog burst."
  - "At switch-off a message it held stays held naming its missed time under hold, dispatches once under next_available or within its grace, and expires past its grace."
  - "Every item the switch holds shows the reason Pause all automations is on."
  - "Before Event Authority admission, no runtime.automation_pause_changed EventRecord is emitted and the result reports missing_event_registration."
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - node tests/scheduling-verify.mjs
risk_class: automatic_resume_overrides_user_stop
reasoning_tier: high
context_scope: scheduling_precedence
implementation_surfaces:
  - Plans/Scheduling_and_Quota_Resume.md
  - Plans/Assistant_Plan_Runtime.md
  - Plans/UI_Command_Catalog.md
  - Plans/Automated_Testing_System.md
node_compile_hint:
  mode: scheduling_precedence_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-136"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/ANSWERS-20260927-final.json p12 (SHA-256 33d13386f28fc5f667fd1df85ba9cb70eefff7eb43c92723e14cefa08237aaf5)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md B-SQR-05 (SHA-256 71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md#8.8 and #8.9 (SHA-256 dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de)"
  - "Plans/Decision_Log.md DL-138; /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-followups-20260929/ANSWERS-20260929.md sha256:345247dfb965fa19ae2f68847125c5b6cafe26126a56bb5b80242e88d3fa9d5c question 9"
  - "projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#lane-c"
  - "projects-refresh-20261030/pass2/NOPROJECT-PROPOSAL.md#approved-2026-11-03"
  - "Jared, 2026-11-03: Plan mode and scheduled tasks are also available in no project. It's only planning wizard/prd builder/orchestrator that isn't."
preserved_exact_tokens:
  - "Pause all automations"
  - "cmd.runtime.automation_pause.set"
  - "project_automation_paused"
  - "runtime.automation_pause_changed"
  - "user_stop_epoch"
  - "Pause all automations is on"
  - "Paused by you at"
  - "Turn back on"
  - "Off: scheduled things start on time."
  - "project_automation_pause.v1:{hex(storage_instance_id)}:{hex(project_id)}"
  - "missing_event_registration"
negative_constraints:
  - Do not let any automatic mechanism, or a newly created schedule, clear or bypass the project pause.
  - Do not store the project pause as a Settings value.
  - Do not cancel, invalidate or disable a schedule or consent because the project pause was turned on.
  - Do not fire a backlog of occurrences when the project pause is turned off.
  - Do not interrupt an atomic operation to honour the project pause.
owner_hints:
  - Plans/Scheduling_and_Quota_Resume.md
```

ContractRef: ContractName:Plans/Scheduling_and_Quota_Resume.md, ContractName:Plans/Decision_Log.md#DL-136, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Assistant_Plan_Runtime.md, UICommand:cmd.runtime.automation_pause.set

### SQR-019 - Application Schedules Exact Targets And Server Timers

```yaml
plan_unit_id: SQR-019
unit_type: requirement
status: accepted
owner_doc: Plans/Scheduling_and_Quota_Resume.md
canonical_text: Scheduled messages and tasks/windows work in app scope using the one Scheduling owner, with project_id=null
  and exact thread/Server/Computer/roots/target bindings. ScheduledMessageSnapshot freezes the sheet's actual text,
  attachments, destination and selected requested/effective execution route/model/account; ExecutionSchedule target_kind
  remains scheduled_message|assistant_plan_run|crew_run|goal_run|agent_run and freezes exact target version/hash/topology/Crew
  configuration. Scope-aware sibling editions also cover QuotaResumeConsent, ScheduleRunBinding, occurrence summary,
  original cancel/effect/source custody and durable timer/dedupe records; old Project editions remain exact. Commit
  acknowledges only durable stored authority and starts no future run/provider attempt. The timer remains on the
  task's owning Server through client closure or Project focus changes, never fails over to the viewing device or
  another Computer. One-time/recurring windows retain IANA timezone/DST gap/repeat behavior, wind-down/safe pause,
  quota reset truth, run/account-specific opt-in consent, Stop precedence, missed policy and occurrence idempotency.
  On owner restart reload canonical records and apply hold/next_available/cancel_after_grace once without backlog
  burst; offline alone proves neither success nor failure. Both decision and final dispatch revalidate actual scope/Computer/roots,
  exact target/input, fresh permissions/capability/account/tools/storage writer, task and scope Stop epochs and
  app/project pause. Unknown reset stays unknown; a saved Ask me first hold remains a hold in YOLO. Build At is
  cmd.chat.plan.schedule_build with its window committed atomically, never paired with cmd.execution_window.create.
  Plan revision invalidates old schedules; no latest-version or account/model/mode substitution. User-only Send
  now retains every gate except the existing pause exception and does not clear that pause. N25 conversion fences
  source timers, settles any admitted dispatch, retires old pending authority and explicitly offers destination
  replacement/rebind against the exact revision map or frozen message. Carry content/timezone/grace/missed/hold/per-run
  Stop as facts, re-admit consent/roots/authority and target pause, and retain source occurrences/results. No occurrence
  dispatches in both scopes. goal.scheduled remains historical-only. CV-366/368 select app.schedule_dispatch.v1
  and its complete OriginalScheduleDispatchSource, exact schedule/message/window/consent/binding/occurrence editions;
  SP-352 owns durable timers, dedupe, source/cancel/result custody and counterpart policy binding. Missing physical/source/policy/native
  adoption is unavailable. CV-367/SP-350 require a disposition for every pending schedule, independently retained
  source occurrences and exact fresh destination re-admission, never replay dispatch.
gui_related: true
gui_classification_reason: Defines user-visible availability, controls, preview, scope or outcome.
depends_on:
- ACD-508
- SIR-055
- PS-145
unblocks: []
acceptance_criteria:
- App message create/edit/cancel/Send now and Agent/Goal/Crew/Plan windows succeed against exact stored inputs.
- DST gap/repeat, offline/restart/duplicate timer, unknown quota and both Stop epochs produce one dispatch or exact
  hold.
- Conversion/fire/revision/cancel races preserve one target/timer authority and original results; held work stays
  held.
validation_surfaces:
- scripts/pm-projects-refresh-contracts.py
- scripts/pm-assistant-contract-check.py
- scripts/pm-plan-index.py
risk_class: scope_authority_and_custody
reasoning_tier: high
context_scope: application_and_project_workflows
implementation_surfaces:
- Plans/Scheduling_and_Quota_Resume.md
node_compile_hint:
  mode: contract_specification
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- projects-refresh-20261030/pass2/NOPROJECT-PROPOSAL.md#N22; scheduled-tasks; N24-N25
- projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#lane-c
- 'Jared, 2026-11-03: Plan mode and scheduled tasks are also available in no project. It''s only planning wizard/prd
  builder/orchestrator that isn''t.'
- projects-refresh-20261030/pass2/plans-edit-requests/Fc-requests.md#fc-c02
preserved_exact_tokens:
- project_id=null
- ScheduledMessageSnapshot
- ExecutionSchedule
- QuotaResumeConsent
- ScheduleRunBinding
- target_kind
- scheduled_message|assistant_plan_run|crew_run|goal_run|agent_run
- cmd.chat.plan.schedule_build
- cmd.execution_window.create
- N25
- goal.scheduled
negative_constraints:
- No second scheduler/client timer, fake Project, implicit rebind, source-consent authority transfer or missed backlog
  burst.
- Never revive goal.scheduled, relax historical exact custody, auto-clear pause or borrow visible-chat YOLO.
owner_hints:
- Plans/Scheduling_and_Quota_Resume.md
```

ContractRef: ContractName:Plans/Scheduling_and_Quota_Resume.md#SQR-019, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md#CV-366, ContractName:Plans/Contracts_V0.md#CV-368, ContractName:Plans/storage-plan.md#SP-352

### SQR-020 - Application Pause All Automations And Independent Epoch

```yaml
plan_unit_id: SQR-020
unit_type: requirement
status: accepted
owner_doc: Plans/Scheduling_and_Quota_Resume.md
canonical_text: Pause all automations has an explicit application variant of cmd.runtime.automation_pause.set for
  Chats with no project on [computer]. The actual app/Server-owned operational record has a real original birth,
  paused state and monotonically increasing user_stop_epoch; it is not a Settings value, Everywhere default, Project
  record or missing-as-off cache. The unchanged Project variant retains its own record/epoch. Turning app pause
  on advances its epoch and holds app scheduled messages/builds, window/quota resumes and automatic Goal/Plan/Crew
  continuations; a running scheduled build pauses at the next safe boundary, never mid-atomic write. Admission compares
  scope and target epochs at decision and again at dispatch. Missing canonical pause custody blocks with app_automation_pause_unavailable;
  an active app latch records application_automation_paused. Only the person sends paused=false to clear it; YOLO,
  timer/window/quota/reconnect/default changes, new schedules and conversion cannot. Direct user Send/Build/resume/Send
  now keeps the existing single-dispatch exception and all other guards without clearing the latch. Turning it off
  clears no per-run Stop and fires no backlog; each item re-evaluates its saved missed policy. Source app pause
  remains for other app chats at conversion; carried holds/per-run Stop persist and the destination Project pause
  independently applies, with no automatic resume. The GUI uses one scoped label and existing Schedule Manager/History/attention
  owners. runtime.automation_pause_changed stays non-emitting with missing_event_registration until its exact app
  payload/scope/append/read/retention contract is separately admitted; a receipt never claims event emission. CV-368
  owns ApplicationAutomationPauseSetRequestV1/ResultV1 and the exact ten-field ApplicationAutomationPauseRecord;
  SP-352 owns application_automation_pause.v1:{hex(storage_instance_id)}:{hex(server_id)} and original app.application_pause.v1
  source custody. This is one Server-wide app record with no required thread, Host/root execution envelope or synthetic
  Project. The desired-value request has no expected_revision or toggle/inherit operation; the owner uses internal
  whole-value CAS. Only false-to-true increments epoch, once; a same-value no-op and true-to-false do not. A genuinely
  never-born record may begin revision 0/epoch 0/off only under actual Storage/Server birth proof and writer lease.
  Missing later custody returns app_automation_pause_unavailable with null pause/projection and no side effects;
  it never presents off. Accepted/rejected branches carry authentic current pause. This source/record/backup graph
  is separate from the unchanged Project pause edition and stays unavailable until admitted.
gui_related: true
gui_classification_reason: Defines user-visible availability, controls, preview, scope or outcome.
depends_on:
- SQR-018
- SQR-019
unblocks: []
acceptance_criteria:
- App and Project pause/epochs cannot affect or clear each other through null/focus/default routing.
- User-only clear, duplicate/no-op requests, Stop races and missing custody have exact typed outcomes.
- Direct user action exception performs one eligible dispatch and leaves pause on; conversion/resume/timer never
  clears it.
validation_surfaces:
- scripts/pm-projects-refresh-contracts.py
- scripts/pm-assistant-contract-check.py
- scripts/pm-plan-index.py
risk_class: scope_authority_and_custody
reasoning_tier: high
context_scope: application_and_project_workflows
implementation_surfaces:
- Plans/Scheduling_and_Quota_Resume.md
node_compile_hint:
  mode: contract_specification
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- projects-refresh-20261030/pass2/NOPROJECT-PROPOSAL.md#N22; app-schedule-pause; N25
- projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#lane-c
- 'Jared, 2026-11-03: Plan mode and scheduled tasks are also available in no project. It''s only planning wizard/prd
  builder/orchestrator that isn''t.'
- projects-refresh-20261030/pass2/plans-edit-requests/Fc-requests.md#fc-c01
preserved_exact_tokens:
- Pause all automations
- cmd.runtime.automation_pause.set
- Chats with no project on [computer]
- user_stop_epoch
- app_automation_pause_unavailable
- application_automation_paused
- paused=false
- runtime.automation_pause_changed
- missing_event_registration
negative_constraints:
- No new Settings preference, competing scheduler, automatic clear, missing-as-off or unregistered event.
owner_hints:
- Plans/Scheduling_and_Quota_Resume.md
```

ContractRef: ContractName:Plans/Scheduling_and_Quota_Resume.md#SQR-020, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md#CV-368, ContractName:Plans/storage-plan.md#SP-352

## DG-OWN-C original source and boundary contracts (2026-11-05)

### SQR-1130 - Goal cancellation migration of schedules consent and callbacks

```yaml
plan_unit_id: SQR-1130
unit_type: owner_boundary
status: accepted
owner_doc: Plans/Scheduling_and_Quota_Resume.md
canonical_text: Newly authored owner contract under DL-045. For exactly goal.cancelled, M2-M9 adopts SQR-011
  complete actual execution schedules, quota consents, ScheduleRunBinding and pending original admissions/timers/callbacks
  under real all-writer exclusion. Preserve actual source revisions, original stop epochs, exact Run/provider/account
  targets and effect receipts. Genuine empty selection is owner-proved; omission and unavailable correlations
  never mean empty. Migration invalidates no schedule or consent and grants no dispatch or resume.
gui_related: false
gui_classification_reason: Defines original source custody, identity, recovery or testing boundaries without
  changing visual presentation.
depends_on:
- SQR-011
- SP-1131
unblocks: []
acceptance_criteria:
- Independently acquire complete original owner sources before helpers and recheck complete sources and entire
  candidate after the last helper at each own effect or disclosure.
- Preserve genuine earlier effects, original receipts and immutable replay; missing or unknown authority stays
  unavailable.
- Use exact own-family source, scope, selected schema realm and existing retention; no registry admission,
  native runtime or governance proof.
validation_surfaces:
- scripts/pm_goal_own_c_oracles.py
- Plans/goal_own_c_contracts/protocol.md
risk_class: forged_original_authority_or_lost_pending_effect
reasoning_tier: high
context_scope: dg_own_c_20261105
implementation_surfaces:
- Plans/Scheduling_and_Quota_Resume.md
- Plans/goal_own_c_contracts/contracts.schema.json
- Plans/goal_own_c_contracts/protocol.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/DG-sol/REVIEW-cycle3.md#work-the-drafting-lead-can-assign-under-dl-045
negative_constraints:
- No new approval policy, cancellation lifecycle, retention/deletion policy or application goal_run.stopped
  edition.
- No source capability, runtime installation, full oracle PASS, Event Authority or WorkNode from a test adapter.
```

The complete newly authored contract is `Plans/goal_own_c_contracts/protocol.md` (Goal cancellation migration of schedules consent and callbacks). Its schema roots are `Plans/goal_own_c_contracts/contracts.schema.json`; complete original source roots and methods remain selected in their original banks.

ContractRef: ContractName:Plans/goal_own_c_contracts/protocol.md, ContractName:Plans/goal_own_c_contracts/contracts.schema.json

## SQR-1555 — `execution_window.created`: newly authored owner contract, prepared without admission

```yaml
plan_unit_id: SQR-1555
unit_type: interface_contract
status: accepted
owner_doc: Plans/Scheduling_and_Quota_Resume.md
canonical_text: 'For exactly execution_window.created@1.0.0, the adjacent twelve-criterion contract binds the already
  specified fact: A cmd.execution_window.create or the atomic cmd.chat.plan.schedule_build transaction creates one
  exact ExecutionSchedule. Build At never emits a second create command. Window creation alone starts no work. Newly
  authored technical bindings follow deck-1 4b A (DL-411) and the documented exact-family search. Registry membership
  stays absent; criterion 12 remains PARTIAL until phase 2.'
gui_related: false
gui_classification_reason: Persisted semantic facts and source/recovery contracts only; existing presentation owners
  remain authoritative.
depends_on:
- SQR-003
- SQR-004
- SQR-007
- SQR-019
unblocks: []
acceptance_criteria:
- This exact family stays prepared without admission and retains each original owner boundary.
- Closed payload, authentic original source joins, receipt custody and read-only recovery satisfy the adjacent family-specific
  contract.
- Phase 2 must implement and prove every planned guard before criterion 12 can pass.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- reports/event-authority-20261105/W3H-oracle-plan.json
risk_class: event_source_identity_or_replay_drift
reasoning_tier: high
context_scope: event_authority_w3h_phase1
implementation_surfaces:
- Plans/Scheduling_and_Quota_Resume.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- E-CARDS-1 4b A (DL-411); exact original answer and deck SHA-256 in reports/event-authority-20261105/W3H.md
- reports/event-authority-20261105/W3H-search-evidence.json
preserved_exact_tokens:
- execution_window.created
- prepared_without_admission
negative_constraints:
- No event admission, registry family append, Decision Log mutation, new feature or changed deletion rule.
- No local numeric/timestamp codec or proof machinery; adopt reviewed shared foundations in phase 2.
owner_hints:
- Plans/Scheduling_and_Quota_Resume.md
```

1. **Membership/version.** `execution_window.created@1.0.0` is a candidate only, with no registry append, admission record or native writer. All current paths return `missing_event_registration` until this exact family/source edition is admitted; siblings grant nothing.
2. **Owner.** This unit owns the semantic fact: A cmd.execution_window.create or the atomic cmd.chat.plan.schedule_build transaction creates one exact ExecutionSchedule. Build At never emits a second create command. Window creation alone starts no work. Reuse SQR-003, SQR-004, SQR-007, SQR-019; payload binding is CV-1555, persistence is SP-1555.
3. **Producer.** Sole producer `SchedulingService::execution_window_created` calls `storage.w3h.execution_window_created.append.v1@1.0.0`. Source is SQR-003/004/007 ExecutionSchedule original operation and source record; original SP-306 v1/v2 Project custody or SQR-019/SP-352 exact application source. The source adapter methods `prepare_execution_window_created`, `commit_execution_window_created`, `resolve_execution_window_created_original` are newly authored interfaces of that owner, not installed handlers. Verify actual before/after source identity, genuine original receipt/result and permissions before committing the existing owner effect plus its publication journal atomically; save the exact semantic envelope and payload once. Drain the pending event via ordinary Storage append, explicitly adopting SP-286/CV-339 first-AppendReceipt **full-value v2** custody and SP-336/347 durability classes; then CAS prepared→appended→settled using the exact prior whole journal value. Domain success acknowledgement waits for the original body result and first event receipt; dependent dispatch/terminal publication waits for required receipts. A crash after body commit preserves the body and pending publication, never rolls it back or repeats the domain effect. The missing-registration gate acts before new event preparation and confers no native authority on existing result-only paths.
4. **Payload.** `Plans/event_payloads/w3h/execution_window_created.schema.json#/$defs/payload` is this family’s closed 1.0.0 schema. Every source field is compared to the genuine original owner result, not a caller-supplied matching snapshot. Required source refs resolve to exact original typed records/results at one consistent snapshot; a ref, hash or all-true assertion alone proves no acceptance. Current numeric/format rules come from EventRecord/CV-317, original source owners and the reviewed shared number/time foundation at phase 2; no new numeric limit or timestamp grammar is authored here. No objective/message/To-Do/compose/env-file body or secret is copied.
5. **Scope/identity.** Scope is `application_or_project`. `project_id`, actual Server and thread match the original source and EventRecord; absent Project means explicit application only where an app source is selected, never dangling Project or current focus. For the app pause source thread remains null and no fake thread/Computer/roots request is required. The original owner allocates one lifetime-unique immutable effect ID from its genuine accepted operation, with the declared component `execution_window.created` and exact `schedule_id` included before issuance. That frozen ID is `owner_operation_id`; batch/list operations allocate a separate component for each item. It survives retry and is never reminted from a timer or callback. Project key is `w3h@1:{hex(UTF8(owner_operation_id))}`. Application key, only for the explicitly selected app source, is exactly CV-366 `application@1:{hex(server_id)}:{hex(owner_operation_id)}`; no suffix is appended. Event ID is `w3h@1:{hex(UTF8(storage_instance_id))}:{hex(UTF8(owner_operation_id))}:{hex(UTF8(event_type))}`. Hex is lowercase byte-preserving encoding, not hashing or normalization. Storage’s partition is `app` or `project~{base64url_no_pad(UTF8(project_id))}`; the scoped dedupe tuple remains (scope_partition,event_type,idempotency_key). Fields already present in the envelope are adopted by reference to Contracts_V0.md#EventRecord, never replaced by a local envelope.
6. **Replay/idempotency.** Freeze `replay_policy=dedupe_by_idempotency_key` and Contracts’ exact producer-semantic digest over only its named caller fields. Current write/retry refuses `projector_replay_only` as `replay_only_not_appendable` before success. Same identity/same digest resolves the original complete event and first receipt via `storage.first_append_receipt.resolve.v2`, even after current source state advances; changed digest conflicts, unavailable authoritative dedupe returns `dedupe_unavailable` with no new effect. Do not compare Storage sequence/timestamps as caller semantics. Missing delivered work after confirmed older restore stays unavailable; a new event ID never reconstructs a missing original operation. Event replay cannot rerun commands, timers, Compose, turns, effects, Usage charges or notifications.
7. **Retention.** Bind this exact event to `RP-AUTHORITY-INDEFINITE@1.0.0`, approved deck-1 Card 1 `G18` (DL-401). No TTL or count cap. For Project entries only explicit Delete Puppet Master project data removes this audit history under existing holds; Remove project from list, deleting a described object or deleting its chat does not. Application records retain the existing app-root custody/deletion rules, never a fabricated Project. Disk pressure refuses new records. Referenced bodies retain their own policies and access; this content-free event grants no longer retention or access to them. The canonical publication journal adopts this same `RP-AUTHORITY-INDEFINITE@1.0.0` assignment and all original pending/result/backup/hold dependencies under `SP-1555`; it is never a disposable index or independently expiring copy. SP-286 receipt custody keeps its own policy.
8. **Redaction/custody.** Use `secret_refs_only` for current events; verify all refs with the original owner’s access and no-secret rules. The sole native adapter must prove actual original issuance, full scope/key/source joins and complete before/after facts, not a copied source view. Storage owns canonical seglog, publication journal, first receipt/full-value proof and a coherent backup/restore closure with pending owner effect/result; restore fences unresolved origin or tombstone state. Reads recheck current permission/deletion while authenticating original admission/recipe/receipt. They may show a valid retained fact after its live object changes or is gone, with unavailable linked body disclosed; they never reconstruct the body or require current state to equal a historical state. Unavailable or invalid source custody returns typed refusal, never fabricated empty success.
9. **Transitions.** A cmd.execution_window.create or the atomic cmd.chat.plan.schedule_build transaction creates one exact ExecutionSchedule. Build At never emits a second create command. Window creation alone starts no work. Extra family-specific predicates: schedule_target: exact target identity/version/hash agrees with genuine schedule; schedule_revision: original expected revision agrees and actual change is committed; window_policy: IANA zone, DST first occurrence, saved missed policy/grace and safe wind-down remain original; window_effect: original result proves created; creating/updating never dispatches work. False/no-op/rejected results emit no successful mutation fact. Compound owner changes preserve all required facts and canonical visibility atomically; no partly admitted subset claims to be complete. Cross-owner original records remain owned by their respective source owners.
10. **Consumers/checkpoints.** The exact read-only operating consumer is `storage.w3h.execution_window_created.recovery_read.v1@1.0.0`, called by `SchedulingService` for existing original-result/restart inspection; it never reconstructs or changes canonical domain state from events. It explicitly adopts SP-278 and `reader.storage.event_record_index@1.0.0`: resolve CURRENT, authentic root/generation/anchor/frontier/dataset and complete source selection in one live transaction, authenticate the complete captured range and every matching source/payload, then filter exact partition+`execution_window.created`. Unsupported/corrupt/missing source is unavailable, never skipped as empty. SP-278 alone owns the generic checkpoint’s whole-value CAS, monotonic frontier and rebuild. This read-only family owns **no projector, projection or independent durable checkpoint** (`checkpoint_disposition=none_required`): zero durable reader effects. Any persisted SP-278 token remains its nine durable fields (DL-076); join the transaction’s live redb_snapshot_id only in memory and revalidate the complete live token after every helper immediately before disclosure. Empty verified range, zero matching events and missing coverage are distinct. Reader withdrawal fences interpretation. No current continuation/dispatch authority comes from this history read.
11. **Compatibility/withdrawal.** No alias, automatic legacy converter or historical emission is asserted for this newly prepared family. Preserve actual old admitted shapes and original recipes only when authenticated original issuance selects them; schema/version/recipe/source substitution or unknown selection refuses. Unsupported future versions never mutate. Writer withdrawal first cuts off this exact family/source edition under append lock, fences new prepares and append drains, and preserves pending accepted effects as unresolved custody. Exact retained-result lookup is read-only and needs authorized retained admission. Reader withdrawal stops interpretation and generic-index filtered reads for this family; it never deletes source or dedupe/receipt custody. Generic-index rebuilding excludes withdrawn interpretation and carries truthful coverage; re-enablement needs explicit reviewed version/source adoption, not a replay alias. Current live guards do not retroactively invalidate otherwise valid retained originals.
12. **Oracles.** `execution_window.created` has its own positive, schema, source, identity, retry, receipt, retention/access, transition, token and withdrawal plan in `reports/event-authority-20261105/W3H-oracle-plan.json`. Every planned negative starts from a valid case and changes one input invariant, with all unrelated derived values recomputed. No oracle implementation or guard-removal proof is claimed in phase 1: criterion 12 **PARTIAL**, native **NOT_RUN**. Phase 2 adopts the reviewed shared numeric/time helper and shared guard-isolation tool before Sol/Astra review.

ContractRef: ContractName:Plans/Contracts_V0.md#EventRecord, ContractName:Plans/Contracts_V0.md#CV-1555, ContractName:Plans/storage-plan.md#SP-1555, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286

## SQR-1556 — `execution_window.invalidated`: newly authored owner contract, prepared without admission

```yaml
plan_unit_id: SQR-1556
unit_type: interface_contract
status: accepted
owner_doc: Plans/Scheduling_and_Quota_Resume.md
canonical_text: 'For exactly execution_window.invalidated@1.0.0, the adjacent twelve-criterion contract binds the
  already specified fact: The Scheduling owner records its existing target-deleted, target-cancelled, target-already-invalidated
  or exact-version-change invalidation result, preserving the exact original nonempty invalidated_reason without
  a local reason-code translation. The invalidated record retains its exact former target and reason; it never binds
  latest or retries a dead target. This is the window-side fact distinct from Assistant Plan’s version-change fact.
  Newly authored technical bindings follow deck-1 4b A (DL-411) and the documented exact-family search. Registry
  membership stays absent; criterion 12 remains PARTIAL until phase 2.'
gui_related: false
gui_classification_reason: Persisted semantic facts and source/recovery contracts only; existing presentation owners
  remain authoritative.
depends_on:
- SQR-003
- SQR-004
- SQR-007
- SQR-019
unblocks: []
acceptance_criteria:
- This exact family stays prepared without admission and retains each original owner boundary.
- Closed payload, authentic original source joins, receipt custody and read-only recovery satisfy the adjacent family-specific
  contract.
- Phase 2 must implement and prove every planned guard before criterion 12 can pass.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- reports/event-authority-20261105/W3H-oracle-plan.json
risk_class: event_source_identity_or_replay_drift
reasoning_tier: high
context_scope: event_authority_w3h_phase1
implementation_surfaces:
- Plans/Scheduling_and_Quota_Resume.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- E-CARDS-1 4b A (DL-411); exact original answer and deck SHA-256 in reports/event-authority-20261105/W3H.md
- reports/event-authority-20261105/W3H-search-evidence.json
preserved_exact_tokens:
- execution_window.invalidated
- prepared_without_admission
negative_constraints:
- No event admission, registry family append, Decision Log mutation, new feature or changed deletion rule.
- No local numeric/timestamp codec or proof machinery; adopt reviewed shared foundations in phase 2.
owner_hints:
- Plans/Scheduling_and_Quota_Resume.md
```

1. **Membership/version.** `execution_window.invalidated@1.0.0` is a candidate only, with no registry append, admission record or native writer. All current paths return `missing_event_registration` until this exact family/source edition is admitted; siblings grant nothing.
2. **Owner.** This unit owns the semantic fact: The Scheduling owner records its existing target-deleted, target-cancelled, target-already-invalidated or exact-version-change invalidation result, preserving the exact original nonempty invalidated_reason without a local reason-code translation. The invalidated record retains its exact former target and reason; it never binds latest or retries a dead target. This is the window-side fact distinct from Assistant Plan’s version-change fact. Reuse SQR-003, SQR-004, SQR-007, SQR-019; payload binding is CV-1556, persistence is SP-1556.
3. **Producer.** Sole producer `SchedulingService::execution_window_invalidated` calls `storage.w3h.execution_window_invalidated.append.v1@1.0.0`. Source is SQR-003/004/007 ExecutionSchedule original operation and source record; original SP-306 v1/v2 Project custody or SQR-019/SP-352 exact application source. The source adapter methods `prepare_execution_window_invalidated`, `commit_execution_window_invalidated`, `resolve_execution_window_invalidated_original` are newly authored interfaces of that owner, not installed handlers. Verify actual before/after source identity, genuine original receipt/result and permissions before committing the existing owner effect plus its publication journal atomically; save the exact semantic envelope and payload once. Drain the pending event via ordinary Storage append, explicitly adopting SP-286/CV-339 first-AppendReceipt **full-value v2** custody and SP-336/347 durability classes; then CAS prepared→appended→settled using the exact prior whole journal value. Domain success acknowledgement waits for the original body result and first event receipt; dependent dispatch/terminal publication waits for required receipts. A crash after body commit preserves the body and pending publication, never rolls it back or repeats the domain effect. The missing-registration gate acts before new event preparation and confers no native authority on existing result-only paths.
4. **Payload.** `Plans/event_payloads/w3h/execution_window_invalidated.schema.json#/$defs/payload` is this family’s closed 1.0.0 schema. Every source field is compared to the genuine original owner result, not a caller-supplied matching snapshot. Required source refs resolve to exact original typed records/results at one consistent snapshot; a ref, hash or all-true assertion alone proves no acceptance. Current numeric/format rules come from EventRecord/CV-317, original source owners and the reviewed shared number/time foundation at phase 2; no new numeric limit or timestamp grammar is authored here. No objective/message/To-Do/compose/env-file body or secret is copied.
5. **Scope/identity.** Scope is `application_or_project`. `project_id`, actual Server and thread match the original source and EventRecord; absent Project means explicit application only where an app source is selected, never dangling Project or current focus. For the app pause source thread remains null and no fake thread/Computer/roots request is required. The original owner allocates one lifetime-unique immutable effect ID from its genuine accepted operation, with the declared component `execution_window.invalidated` and exact `schedule_id` included before issuance. That frozen ID is `owner_operation_id`; batch/list operations allocate a separate component for each item. It survives retry and is never reminted from a timer or callback. Project key is `w3h@1:{hex(UTF8(owner_operation_id))}`. Application key, only for the explicitly selected app source, is exactly CV-366 `application@1:{hex(server_id)}:{hex(owner_operation_id)}`; no suffix is appended. Event ID is `w3h@1:{hex(UTF8(storage_instance_id))}:{hex(UTF8(owner_operation_id))}:{hex(UTF8(event_type))}`. Hex is lowercase byte-preserving encoding, not hashing or normalization. Storage’s partition is `app` or `project~{base64url_no_pad(UTF8(project_id))}`; the scoped dedupe tuple remains (scope_partition,event_type,idempotency_key). Fields already present in the envelope are adopted by reference to Contracts_V0.md#EventRecord, never replaced by a local envelope.
6. **Replay/idempotency.** Freeze `replay_policy=dedupe_by_idempotency_key` and Contracts’ exact producer-semantic digest over only its named caller fields. Current write/retry refuses `projector_replay_only` as `replay_only_not_appendable` before success. Same identity/same digest resolves the original complete event and first receipt via `storage.first_append_receipt.resolve.v2`, even after current source state advances; changed digest conflicts, unavailable authoritative dedupe returns `dedupe_unavailable` with no new effect. Do not compare Storage sequence/timestamps as caller semantics. Missing delivered work after confirmed older restore stays unavailable; a new event ID never reconstructs a missing original operation. Event replay cannot rerun commands, timers, Compose, turns, effects, Usage charges or notifications.
7. **Retention.** Bind this exact event to `RP-AUTHORITY-INDEFINITE@1.0.0`, approved deck-1 Card 1 `G18` (DL-401). No TTL or count cap. For Project entries only explicit Delete Puppet Master project data removes this audit history under existing holds; Remove project from list, deleting a described object or deleting its chat does not. Application records retain the existing app-root custody/deletion rules, never a fabricated Project. Disk pressure refuses new records. Referenced bodies retain their own policies and access; this content-free event grants no longer retention or access to them. The canonical publication journal adopts this same `RP-AUTHORITY-INDEFINITE@1.0.0` assignment and all original pending/result/backup/hold dependencies under `SP-1556`; it is never a disposable index or independently expiring copy. SP-286 receipt custody keeps its own policy.
8. **Redaction/custody.** Use `secret_refs_only` for current events; verify all refs with the original owner’s access and no-secret rules. The sole native adapter must prove actual original issuance, full scope/key/source joins and complete before/after facts, not a copied source view. Storage owns canonical seglog, publication journal, first receipt/full-value proof and a coherent backup/restore closure with pending owner effect/result; restore fences unresolved origin or tombstone state. Reads recheck current permission/deletion while authenticating original admission/recipe/receipt. They may show a valid retained fact after its live object changes or is gone, with unavailable linked body disclosed; they never reconstruct the body or require current state to equal a historical state. Unavailable or invalid source custody returns typed refusal, never fabricated empty success.
9. **Transitions.** The Scheduling owner records its existing target-deleted, target-cancelled, target-already-invalidated or exact-version-change invalidation result, preserving the exact original nonempty invalidated_reason without a local reason-code translation. The invalidated record retains its exact former target and reason; it never binds latest or retries a dead target. This is the window-side fact distinct from Assistant Plan’s version-change fact. Extra family-specific predicates: schedule_target: exact target identity/version/hash agrees with genuine schedule; schedule_revision: original expected revision agrees and actual change is committed; window_policy: IANA zone, DST first occurrence, saved missed policy/grace and safe wind-down remain original; window_effect: original result proves invalidated; creating/updating never dispatches work. False/no-op/rejected results emit no successful mutation fact. Compound owner changes preserve all required facts and canonical visibility atomically; no partly admitted subset claims to be complete. Cross-owner original records remain owned by their respective source owners.
10. **Consumers/checkpoints.** The exact read-only operating consumer is `storage.w3h.execution_window_invalidated.recovery_read.v1@1.0.0`, called by `SchedulingService` for existing original-result/restart inspection; it never reconstructs or changes canonical domain state from events. It explicitly adopts SP-278 and `reader.storage.event_record_index@1.0.0`: resolve CURRENT, authentic root/generation/anchor/frontier/dataset and complete source selection in one live transaction, authenticate the complete captured range and every matching source/payload, then filter exact partition+`execution_window.invalidated`. Unsupported/corrupt/missing source is unavailable, never skipped as empty. SP-278 alone owns the generic checkpoint’s whole-value CAS, monotonic frontier and rebuild. This read-only family owns **no projector, projection or independent durable checkpoint** (`checkpoint_disposition=none_required`): zero durable reader effects. Any persisted SP-278 token remains its nine durable fields (DL-076); join the transaction’s live redb_snapshot_id only in memory and revalidate the complete live token after every helper immediately before disclosure. Empty verified range, zero matching events and missing coverage are distinct. Reader withdrawal fences interpretation. No current continuation/dispatch authority comes from this history read.
11. **Compatibility/withdrawal.** No alias, automatic legacy converter or historical emission is asserted for this newly prepared family. Preserve actual old admitted shapes and original recipes only when authenticated original issuance selects them; schema/version/recipe/source substitution or unknown selection refuses. Unsupported future versions never mutate. Writer withdrawal first cuts off this exact family/source edition under append lock, fences new prepares and append drains, and preserves pending accepted effects as unresolved custody. Exact retained-result lookup is read-only and needs authorized retained admission. Reader withdrawal stops interpretation and generic-index filtered reads for this family; it never deletes source or dedupe/receipt custody. Generic-index rebuilding excludes withdrawn interpretation and carries truthful coverage; re-enablement needs explicit reviewed version/source adoption, not a replay alias. Current live guards do not retroactively invalidate otherwise valid retained originals.
12. **Oracles.** `execution_window.invalidated` has its own positive, schema, source, identity, retry, receipt, retention/access, transition, token and withdrawal plan in `reports/event-authority-20261105/W3H-oracle-plan.json`. Every planned negative starts from a valid case and changes one input invariant, with all unrelated derived values recomputed. No oracle implementation or guard-removal proof is claimed in phase 1: criterion 12 **PARTIAL**, native **NOT_RUN**. Phase 2 adopts the reviewed shared numeric/time helper and shared guard-isolation tool before Sol/Astra review.

ContractRef: ContractName:Plans/Contracts_V0.md#EventRecord, ContractName:Plans/Contracts_V0.md#CV-1556, ContractName:Plans/storage-plan.md#SP-1556, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286

## SQR-1557 — `execution_window.updated`: newly authored owner contract, prepared without admission

```yaml
plan_unit_id: SQR-1557
unit_type: interface_contract
status: accepted
owner_doc: Plans/Scheduling_and_Quota_Resume.md
canonical_text: 'For exactly execution_window.updated@1.0.0, the adjacent twelve-criterion contract binds the already
  specified fact: An accepted cmd.execution_window.update changes the original schedule against its expected revision.
  Narrowing an in-flight window takes effect at the next safe wind-down boundary; it never interrupts an atomic
  write or silently changes admission. Newly authored technical bindings follow deck-1 4b A (DL-411) and the documented
  exact-family search. Registry membership stays absent; criterion 12 remains PARTIAL until phase 2.'
gui_related: false
gui_classification_reason: Persisted semantic facts and source/recovery contracts only; existing presentation owners
  remain authoritative.
depends_on:
- SQR-003
- SQR-004
- SQR-007
- SQR-019
unblocks: []
acceptance_criteria:
- This exact family stays prepared without admission and retains each original owner boundary.
- Closed payload, authentic original source joins, receipt custody and read-only recovery satisfy the adjacent family-specific
  contract.
- Phase 2 must implement and prove every planned guard before criterion 12 can pass.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- reports/event-authority-20261105/W3H-oracle-plan.json
risk_class: event_source_identity_or_replay_drift
reasoning_tier: high
context_scope: event_authority_w3h_phase1
implementation_surfaces:
- Plans/Scheduling_and_Quota_Resume.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- E-CARDS-1 4b A (DL-411); exact original answer and deck SHA-256 in reports/event-authority-20261105/W3H.md
- reports/event-authority-20261105/W3H-search-evidence.json
preserved_exact_tokens:
- execution_window.updated
- prepared_without_admission
negative_constraints:
- No event admission, registry family append, Decision Log mutation, new feature or changed deletion rule.
- No local numeric/timestamp codec or proof machinery; adopt reviewed shared foundations in phase 2.
owner_hints:
- Plans/Scheduling_and_Quota_Resume.md
```

1. **Membership/version.** `execution_window.updated@1.0.0` is a candidate only, with no registry append, admission record or native writer. All current paths return `missing_event_registration` until this exact family/source edition is admitted; siblings grant nothing.
2. **Owner.** This unit owns the semantic fact: An accepted cmd.execution_window.update changes the original schedule against its expected revision. Narrowing an in-flight window takes effect at the next safe wind-down boundary; it never interrupts an atomic write or silently changes admission. Reuse SQR-003, SQR-004, SQR-007, SQR-019; payload binding is CV-1557, persistence is SP-1557.
3. **Producer.** Sole producer `SchedulingService::execution_window_updated` calls `storage.w3h.execution_window_updated.append.v1@1.0.0`. Source is SQR-003/004/007 ExecutionSchedule original operation and source record; original SP-306 v1/v2 Project custody or SQR-019/SP-352 exact application source. The source adapter methods `prepare_execution_window_updated`, `commit_execution_window_updated`, `resolve_execution_window_updated_original` are newly authored interfaces of that owner, not installed handlers. Verify actual before/after source identity, genuine original receipt/result and permissions before committing the existing owner effect plus its publication journal atomically; save the exact semantic envelope and payload once. Drain the pending event via ordinary Storage append, explicitly adopting SP-286/CV-339 first-AppendReceipt **full-value v2** custody and SP-336/347 durability classes; then CAS prepared→appended→settled using the exact prior whole journal value. Domain success acknowledgement waits for the original body result and first event receipt; dependent dispatch/terminal publication waits for required receipts. A crash after body commit preserves the body and pending publication, never rolls it back or repeats the domain effect. The missing-registration gate acts before new event preparation and confers no native authority on existing result-only paths.
4. **Payload.** `Plans/event_payloads/w3h/execution_window_updated.schema.json#/$defs/payload` is this family’s closed 1.0.0 schema. Every source field is compared to the genuine original owner result, not a caller-supplied matching snapshot. Required source refs resolve to exact original typed records/results at one consistent snapshot; a ref, hash or all-true assertion alone proves no acceptance. Current numeric/format rules come from EventRecord/CV-317, original source owners and the reviewed shared number/time foundation at phase 2; no new numeric limit or timestamp grammar is authored here. No objective/message/To-Do/compose/env-file body or secret is copied.
5. **Scope/identity.** Scope is `application_or_project`. `project_id`, actual Server and thread match the original source and EventRecord; absent Project means explicit application only where an app source is selected, never dangling Project or current focus. For the app pause source thread remains null and no fake thread/Computer/roots request is required. The original owner allocates one lifetime-unique immutable effect ID from its genuine accepted operation, with the declared component `execution_window.updated` and exact `schedule_id` included before issuance. That frozen ID is `owner_operation_id`; batch/list operations allocate a separate component for each item. It survives retry and is never reminted from a timer or callback. Project key is `w3h@1:{hex(UTF8(owner_operation_id))}`. Application key, only for the explicitly selected app source, is exactly CV-366 `application@1:{hex(server_id)}:{hex(owner_operation_id)}`; no suffix is appended. Event ID is `w3h@1:{hex(UTF8(storage_instance_id))}:{hex(UTF8(owner_operation_id))}:{hex(UTF8(event_type))}`. Hex is lowercase byte-preserving encoding, not hashing or normalization. Storage’s partition is `app` or `project~{base64url_no_pad(UTF8(project_id))}`; the scoped dedupe tuple remains (scope_partition,event_type,idempotency_key). Fields already present in the envelope are adopted by reference to Contracts_V0.md#EventRecord, never replaced by a local envelope.
6. **Replay/idempotency.** Freeze `replay_policy=dedupe_by_idempotency_key` and Contracts’ exact producer-semantic digest over only its named caller fields. Current write/retry refuses `projector_replay_only` as `replay_only_not_appendable` before success. Same identity/same digest resolves the original complete event and first receipt via `storage.first_append_receipt.resolve.v2`, even after current source state advances; changed digest conflicts, unavailable authoritative dedupe returns `dedupe_unavailable` with no new effect. Do not compare Storage sequence/timestamps as caller semantics. Missing delivered work after confirmed older restore stays unavailable; a new event ID never reconstructs a missing original operation. Event replay cannot rerun commands, timers, Compose, turns, effects, Usage charges or notifications.
7. **Retention.** Bind this exact event to `RP-AUTHORITY-INDEFINITE@1.0.0`, approved deck-1 Card 1 `G18` (DL-401). No TTL or count cap. For Project entries only explicit Delete Puppet Master project data removes this audit history under existing holds; Remove project from list, deleting a described object or deleting its chat does not. Application records retain the existing app-root custody/deletion rules, never a fabricated Project. Disk pressure refuses new records. Referenced bodies retain their own policies and access; this content-free event grants no longer retention or access to them. The canonical publication journal adopts this same `RP-AUTHORITY-INDEFINITE@1.0.0` assignment and all original pending/result/backup/hold dependencies under `SP-1557`; it is never a disposable index or independently expiring copy. SP-286 receipt custody keeps its own policy.
8. **Redaction/custody.** Use `secret_refs_only` for current events; verify all refs with the original owner’s access and no-secret rules. The sole native adapter must prove actual original issuance, full scope/key/source joins and complete before/after facts, not a copied source view. Storage owns canonical seglog, publication journal, first receipt/full-value proof and a coherent backup/restore closure with pending owner effect/result; restore fences unresolved origin or tombstone state. Reads recheck current permission/deletion while authenticating original admission/recipe/receipt. They may show a valid retained fact after its live object changes or is gone, with unavailable linked body disclosed; they never reconstruct the body or require current state to equal a historical state. Unavailable or invalid source custody returns typed refusal, never fabricated empty success.
9. **Transitions.** An accepted cmd.execution_window.update changes the original schedule against its expected revision. Narrowing an in-flight window takes effect at the next safe wind-down boundary; it never interrupts an atomic write or silently changes admission. Extra family-specific predicates: schedule_target: exact target identity/version/hash agrees with genuine schedule; schedule_revision: original expected revision agrees and actual change is committed; window_policy: IANA zone, DST first occurrence, saved missed policy/grace and safe wind-down remain original; window_effect: original result proves updated; creating/updating never dispatches work. False/no-op/rejected results emit no successful mutation fact. Compound owner changes preserve all required facts and canonical visibility atomically; no partly admitted subset claims to be complete. Cross-owner original records remain owned by their respective source owners.
10. **Consumers/checkpoints.** The exact read-only operating consumer is `storage.w3h.execution_window_updated.recovery_read.v1@1.0.0`, called by `SchedulingService` for existing original-result/restart inspection; it never reconstructs or changes canonical domain state from events. It explicitly adopts SP-278 and `reader.storage.event_record_index@1.0.0`: resolve CURRENT, authentic root/generation/anchor/frontier/dataset and complete source selection in one live transaction, authenticate the complete captured range and every matching source/payload, then filter exact partition+`execution_window.updated`. Unsupported/corrupt/missing source is unavailable, never skipped as empty. SP-278 alone owns the generic checkpoint’s whole-value CAS, monotonic frontier and rebuild. This read-only family owns **no projector, projection or independent durable checkpoint** (`checkpoint_disposition=none_required`): zero durable reader effects. Any persisted SP-278 token remains its nine durable fields (DL-076); join the transaction’s live redb_snapshot_id only in memory and revalidate the complete live token after every helper immediately before disclosure. Empty verified range, zero matching events and missing coverage are distinct. Reader withdrawal fences interpretation. No current continuation/dispatch authority comes from this history read.
11. **Compatibility/withdrawal.** No alias, automatic legacy converter or historical emission is asserted for this newly prepared family. Preserve actual old admitted shapes and original recipes only when authenticated original issuance selects them; schema/version/recipe/source substitution or unknown selection refuses. Unsupported future versions never mutate. Writer withdrawal first cuts off this exact family/source edition under append lock, fences new prepares and append drains, and preserves pending accepted effects as unresolved custody. Exact retained-result lookup is read-only and needs authorized retained admission. Reader withdrawal stops interpretation and generic-index filtered reads for this family; it never deletes source or dedupe/receipt custody. Generic-index rebuilding excludes withdrawn interpretation and carries truthful coverage; re-enablement needs explicit reviewed version/source adoption, not a replay alias. Current live guards do not retroactively invalidate otherwise valid retained originals.
12. **Oracles.** `execution_window.updated` has its own positive, schema, source, identity, retry, receipt, retention/access, transition, token and withdrawal plan in `reports/event-authority-20261105/W3H-oracle-plan.json`. Every planned negative starts from a valid case and changes one input invariant, with all unrelated derived values recomputed. No oracle implementation or guard-removal proof is claimed in phase 1: criterion 12 **PARTIAL**, native **NOT_RUN**. Phase 2 adopts the reviewed shared numeric/time helper and shared guard-isolation tool before Sol/Astra review.

ContractRef: ContractName:Plans/Contracts_V0.md#EventRecord, ContractName:Plans/Contracts_V0.md#CV-1557, ContractName:Plans/storage-plan.md#SP-1557, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286

## SQR-1566 — `runtime.quota_resume_attempted`: newly authored owner contract, prepared without admission

```yaml
plan_unit_id: SQR-1566
unit_type: interface_contract
status: accepted
owner_doc: Plans/Scheduling_and_Quota_Resume.md
canonical_text: 'For exactly runtime.quota_resume_attempted@1.0.0, the adjacent twelve-criterion contract binds
  the already specified fact: The server Scheduling owner records each genuine quota-resume eligibility decision,
  including refusal and its exact failed clauses; this is an attempt, never an assertion that work ran. Revalidate
  SQR-006 at decision and final dispatch; a pre-Stop decision delivered afterwards refuses. Accepted eligibility
  resumes only the same unfinished binding and never redoes committed work. Newly authored technical bindings follow
  deck-1 4b A (DL-411) and the documented exact-family search. Registry membership stays absent; criterion 12 remains
  PARTIAL until phase 2.'
gui_related: false
gui_classification_reason: Persisted semantic facts and source/recovery contracts only; existing presentation owners
  remain authoritative.
depends_on:
- SQR-005
- SQR-006
- SQR-019
unblocks: []
acceptance_criteria:
- This exact family stays prepared without admission and retains each original owner boundary.
- Closed payload, authentic original source joins, receipt custody and read-only recovery satisfy the adjacent family-specific
  contract.
- Phase 2 must implement and prove every planned guard before criterion 12 can pass.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- reports/event-authority-20261105/W3H-oracle-plan.json
risk_class: event_source_identity_or_replay_drift
reasoning_tier: high
context_scope: event_authority_w3h_phase1
implementation_surfaces:
- Plans/Scheduling_and_Quota_Resume.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- E-CARDS-1 4b A (DL-411); exact original answer and deck SHA-256 in reports/event-authority-20261105/W3H.md
- reports/event-authority-20261105/W3H-search-evidence.json
preserved_exact_tokens:
- runtime.quota_resume_attempted
- prepared_without_admission
negative_constraints:
- No event admission, registry family append, Decision Log mutation, new feature or changed deletion rule.
- No local numeric/timestamp codec or proof machinery; adopt reviewed shared foundations in phase 2.
owner_hints:
- Plans/Scheduling_and_Quota_Resume.md
```

1. **Membership/version.** `runtime.quota_resume_attempted@1.0.0` is a candidate only, with no registry append, admission record or native writer. All current paths return `missing_event_registration` until this exact family/source edition is admitted; siblings grant nothing.
2. **Owner.** This unit owns the semantic fact: The server Scheduling owner records each genuine quota-resume eligibility decision, including refusal and its exact failed clauses; this is an attempt, never an assertion that work ran. Revalidate SQR-006 at decision and final dispatch; a pre-Stop decision delivered afterwards refuses. Accepted eligibility resumes only the same unfinished binding and never redoes committed work. Reuse SQR-005, SQR-006, SQR-019; payload binding is CV-1566, persistence is SP-1566.
3. **Producer.** Sole producer `SchedulingService::quota_resume_attempted` calls `storage.w3h.runtime_quota_resume_attempted.append.v1@1.0.0`. Source is SQR-005/006 original quota wait, QuotaResumeConsent or eligibility decision receipt, actual provider/account and actual run owner; SP-306 Project or SQR-019/SP-352 application source. The source adapter methods `prepare_runtime_quota_resume_attempted`, `commit_runtime_quota_resume_attempted`, `resolve_runtime_quota_resume_attempted_original` are newly authored interfaces of that owner, not installed handlers. Verify actual before/after source identity, genuine original receipt/result and permissions before committing the existing owner effect plus its publication journal atomically; save the exact semantic envelope and payload once. Drain the pending event via ordinary Storage append, explicitly adopting SP-286/CV-339 first-AppendReceipt **full-value v2** custody and SP-336/347 durability classes; then CAS prepared→appended→settled using the exact prior whole journal value. Domain success acknowledgement waits for the original body result and first event receipt; dependent dispatch/terminal publication waits for required receipts. A crash after body commit preserves the body and pending publication, never rolls it back or repeats the domain effect. The missing-registration gate acts before new event preparation and confers no native authority on existing result-only paths.
4. **Payload.** `Plans/event_payloads/w3h/runtime_quota_resume_attempted.schema.json#/$defs/payload` is this family’s closed 1.0.0 schema. Every source field is compared to the genuine original owner result, not a caller-supplied matching snapshot. Required source refs resolve to exact original typed records/results at one consistent snapshot; a ref, hash or all-true assertion alone proves no acceptance. Current numeric/format rules come from EventRecord/CV-317, original source owners and the reviewed shared number/time foundation at phase 2; no new numeric limit or timestamp grammar is authored here. No objective/message/To-Do/compose/env-file body or secret is copied.
5. **Scope/identity.** Scope is `application_or_project`. `project_id`, actual Server and thread match the original source and EventRecord; absent Project means explicit application only where an app source is selected, never dangling Project or current focus. For the app pause source thread remains null and no fake thread/Computer/roots request is required. The original owner allocates one lifetime-unique immutable effect ID from its genuine accepted operation, with the declared component `runtime.quota_resume_attempted` and exact `run_id` included before issuance. That frozen ID is `owner_operation_id`; batch/list operations allocate a separate component for each item. It survives retry and is never reminted from a timer or callback. Project key is `w3h@1:{hex(UTF8(owner_operation_id))}`. Application key, only for the explicitly selected app source, is exactly CV-366 `application@1:{hex(server_id)}:{hex(owner_operation_id)}`; no suffix is appended. Event ID is `w3h@1:{hex(UTF8(storage_instance_id))}:{hex(UTF8(owner_operation_id))}:{hex(UTF8(event_type))}`. Hex is lowercase byte-preserving encoding, not hashing or normalization. Storage’s partition is `app` or `project~{base64url_no_pad(UTF8(project_id))}`; the scoped dedupe tuple remains (scope_partition,event_type,idempotency_key). Fields already present in the envelope are adopted by reference to Contracts_V0.md#EventRecord, never replaced by a local envelope.
6. **Replay/idempotency.** Freeze `replay_policy=dedupe_by_idempotency_key` and Contracts’ exact producer-semantic digest over only its named caller fields. Current write/retry refuses `projector_replay_only` as `replay_only_not_appendable` before success. Same identity/same digest resolves the original complete event and first receipt via `storage.first_append_receipt.resolve.v2`, even after current source state advances; changed digest conflicts, unavailable authoritative dedupe returns `dedupe_unavailable` with no new effect. Do not compare Storage sequence/timestamps as caller semantics. Missing delivered work after confirmed older restore stays unavailable; a new event ID never reconstructs a missing original operation. Event replay cannot rerun commands, timers, Compose, turns, effects, Usage charges or notifications.
7. **Retention.** Bind this exact event to `RP-AUTHORITY-INDEFINITE@1.0.0`, approved deck-1 Card 1 `G18` (DL-401). No TTL or count cap. For Project entries only explicit Delete Puppet Master project data removes this audit history under existing holds; Remove project from list, deleting a described object or deleting its chat does not. Application records retain the existing app-root custody/deletion rules, never a fabricated Project. Disk pressure refuses new records. Referenced bodies retain their own policies and access; this content-free event grants no longer retention or access to them. The canonical publication journal adopts this same `RP-AUTHORITY-INDEFINITE@1.0.0` assignment and all original pending/result/backup/hold dependencies under `SP-1566`; it is never a disposable index or independently expiring copy. SP-286 receipt custody keeps its own policy.
8. **Redaction/custody.** Use `secret_refs_only` for current events; verify all refs with the original owner’s access and no-secret rules. The sole native adapter must prove actual original issuance, full scope/key/source joins and complete before/after facts, not a copied source view. Storage owns canonical seglog, publication journal, first receipt/full-value proof and a coherent backup/restore closure with pending owner effect/result; restore fences unresolved origin or tombstone state. Reads recheck current permission/deletion while authenticating original admission/recipe/receipt. They may show a valid retained fact after its live object changes or is gone, with unavailable linked body disclosed; they never reconstruct the body or require current state to equal a historical state. Unavailable or invalid source custody returns typed refusal, never fabricated empty success.
9. **Transitions.** The server Scheduling owner records each genuine quota-resume eligibility decision, including refusal and its exact failed clauses; this is an attempt, never an assertion that work ran. Revalidate SQR-006 at decision and final dispatch; a pre-Stop decision delivered afterwards refuses. Accepted eligibility resumes only the same unfinished binding and never redoes committed work. Extra family-specific predicates: quota_route: run/provider/account and actual selected route agree; quota_truth: reset truth matches the actual provider/inference/user/unknown source; quota_effect: original source proves quota_resume_attempted; quota_precedence: manual Stop and selected app/Project pause are never cleared by quota; quota_state: Goal/Plan/To-Do semantics stay unchanged by the wait itself. False/no-op/rejected results emit no successful mutation fact. Compound owner changes preserve all required facts and canonical visibility atomically; no partly admitted subset claims to be complete. Cross-owner original records remain owned by their respective source owners.
10. **Consumers/checkpoints.** The exact read-only operating consumer is `storage.w3h.runtime_quota_resume_attempted.recovery_read.v1@1.0.0`, called by `SchedulingService` for existing original-result/restart inspection; it never reconstructs or changes canonical domain state from events. It explicitly adopts SP-278 and `reader.storage.event_record_index@1.0.0`: resolve CURRENT, authentic root/generation/anchor/frontier/dataset and complete source selection in one live transaction, authenticate the complete captured range and every matching source/payload, then filter exact partition+`runtime.quota_resume_attempted`. Unsupported/corrupt/missing source is unavailable, never skipped as empty. SP-278 alone owns the generic checkpoint’s whole-value CAS, monotonic frontier and rebuild. This read-only family owns **no projector, projection or independent durable checkpoint** (`checkpoint_disposition=none_required`): zero durable reader effects. Any persisted SP-278 token remains its nine durable fields (DL-076); join the transaction’s live redb_snapshot_id only in memory and revalidate the complete live token after every helper immediately before disclosure. Empty verified range, zero matching events and missing coverage are distinct. Reader withdrawal fences interpretation. No current continuation/dispatch authority comes from this history read.
11. **Compatibility/withdrawal.** No alias, automatic legacy converter or historical emission is asserted for this newly prepared family. Preserve actual old admitted shapes and original recipes only when authenticated original issuance selects them; schema/version/recipe/source substitution or unknown selection refuses. Unsupported future versions never mutate. Writer withdrawal first cuts off this exact family/source edition under append lock, fences new prepares and append drains, and preserves pending accepted effects as unresolved custody. Exact retained-result lookup is read-only and needs authorized retained admission. Reader withdrawal stops interpretation and generic-index filtered reads for this family; it never deletes source or dedupe/receipt custody. Generic-index rebuilding excludes withdrawn interpretation and carries truthful coverage; re-enablement needs explicit reviewed version/source adoption, not a replay alias. Current live guards do not retroactively invalidate otherwise valid retained originals.
12. **Oracles.** `runtime.quota_resume_attempted` has its own positive, schema, source, identity, retry, receipt, retention/access, transition, token and withdrawal plan in `reports/event-authority-20261105/W3H-oracle-plan.json`. Every planned negative starts from a valid case and changes one input invariant, with all unrelated derived values recomputed. No oracle implementation or guard-removal proof is claimed in phase 1: criterion 12 **PARTIAL**, native **NOT_RUN**. Phase 2 adopts the reviewed shared numeric/time helper and shared guard-isolation tool before Sol/Astra review.

ContractRef: ContractName:Plans/Contracts_V0.md#EventRecord, ContractName:Plans/Contracts_V0.md#CV-1566, ContractName:Plans/storage-plan.md#SP-1566, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286

## SQR-1567 — `runtime.quota_resume_consent_changed`: newly authored owner contract, prepared without admission

```yaml
plan_unit_id: SQR-1567
unit_type: interface_contract
status: accepted
owner_doc: Plans/Scheduling_and_Quota_Resume.md
canonical_text: 'For exactly runtime.quota_resume_consent_changed@1.0.0, the adjacent twelve-criterion contract
  binds the already specified fact: cmd.runtime.quota_resume.set commits the actual opt-in consent change scoped
  to run/provider/account; enabled defaults false only at genuine creation, never by a new global Settings write.
  Record exact reset truth and source; unchanged consent is no change. Stop/pause remains higher priority and consent
  never clears it. Newly authored technical bindings follow deck-1 4b A (DL-411) and the documented exact-family
  search. Registry membership stays absent; criterion 12 remains PARTIAL until phase 2.'
gui_related: false
gui_classification_reason: Persisted semantic facts and source/recovery contracts only; existing presentation owners
  remain authoritative.
depends_on:
- SQR-005
- SQR-006
- SQR-019
unblocks: []
acceptance_criteria:
- This exact family stays prepared without admission and retains each original owner boundary.
- Closed payload, authentic original source joins, receipt custody and read-only recovery satisfy the adjacent family-specific
  contract.
- Phase 2 must implement and prove every planned guard before criterion 12 can pass.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- reports/event-authority-20261105/W3H-oracle-plan.json
risk_class: event_source_identity_or_replay_drift
reasoning_tier: high
context_scope: event_authority_w3h_phase1
implementation_surfaces:
- Plans/Scheduling_and_Quota_Resume.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- E-CARDS-1 4b A (DL-411); exact original answer and deck SHA-256 in reports/event-authority-20261105/W3H.md
- reports/event-authority-20261105/W3H-search-evidence.json
preserved_exact_tokens:
- runtime.quota_resume_consent_changed
- prepared_without_admission
negative_constraints:
- No event admission, registry family append, Decision Log mutation, new feature or changed deletion rule.
- No local numeric/timestamp codec or proof machinery; adopt reviewed shared foundations in phase 2.
owner_hints:
- Plans/Scheduling_and_Quota_Resume.md
```

1. **Membership/version.** `runtime.quota_resume_consent_changed@1.0.0` is a candidate only, with no registry append, admission record or native writer. All current paths return `missing_event_registration` until this exact family/source edition is admitted; siblings grant nothing.
2. **Owner.** This unit owns the semantic fact: cmd.runtime.quota_resume.set commits the actual opt-in consent change scoped to run/provider/account; enabled defaults false only at genuine creation, never by a new global Settings write. Record exact reset truth and source; unchanged consent is no change. Stop/pause remains higher priority and consent never clears it. Reuse SQR-005, SQR-006, SQR-019; payload binding is CV-1567, persistence is SP-1567.
3. **Producer.** Sole producer `SchedulingService::quota_resume_consent_changed` calls `storage.w3h.runtime_quota_resume_consent_changed.append.v1@1.0.0`. Source is SQR-005/006 original quota wait, QuotaResumeConsent or eligibility decision receipt, actual provider/account and actual run owner; SP-306 Project or SQR-019/SP-352 application source. The source adapter methods `prepare_runtime_quota_resume_consent_changed`, `commit_runtime_quota_resume_consent_changed`, `resolve_runtime_quota_resume_consent_changed_original` are newly authored interfaces of that owner, not installed handlers. Verify actual before/after source identity, genuine original receipt/result and permissions before committing the existing owner effect plus its publication journal atomically; save the exact semantic envelope and payload once. Drain the pending event via ordinary Storage append, explicitly adopting SP-286/CV-339 first-AppendReceipt **full-value v2** custody and SP-336/347 durability classes; then CAS prepared→appended→settled using the exact prior whole journal value. Domain success acknowledgement waits for the original body result and first event receipt; dependent dispatch/terminal publication waits for required receipts. A crash after body commit preserves the body and pending publication, never rolls it back or repeats the domain effect. The missing-registration gate acts before new event preparation and confers no native authority on existing result-only paths.
4. **Payload.** `Plans/event_payloads/w3h/runtime_quota_resume_consent_changed.schema.json#/$defs/payload` is this family’s closed 1.0.0 schema. Every source field is compared to the genuine original owner result, not a caller-supplied matching snapshot. Required source refs resolve to exact original typed records/results at one consistent snapshot; a ref, hash or all-true assertion alone proves no acceptance. Current numeric/format rules come from EventRecord/CV-317, original source owners and the reviewed shared number/time foundation at phase 2; no new numeric limit or timestamp grammar is authored here. No objective/message/To-Do/compose/env-file body or secret is copied.
5. **Scope/identity.** Scope is `application_or_project`. `project_id`, actual Server and thread match the original source and EventRecord; absent Project means explicit application only where an app source is selected, never dangling Project or current focus. For the app pause source thread remains null and no fake thread/Computer/roots request is required. The original owner allocates one lifetime-unique immutable effect ID from its genuine accepted operation, with the declared component `runtime.quota_resume_consent_changed` and exact `run_id` included before issuance. That frozen ID is `owner_operation_id`; batch/list operations allocate a separate component for each item. It survives retry and is never reminted from a timer or callback. Project key is `w3h@1:{hex(UTF8(owner_operation_id))}`. Application key, only for the explicitly selected app source, is exactly CV-366 `application@1:{hex(server_id)}:{hex(owner_operation_id)}`; no suffix is appended. Event ID is `w3h@1:{hex(UTF8(storage_instance_id))}:{hex(UTF8(owner_operation_id))}:{hex(UTF8(event_type))}`. Hex is lowercase byte-preserving encoding, not hashing or normalization. Storage’s partition is `app` or `project~{base64url_no_pad(UTF8(project_id))}`; the scoped dedupe tuple remains (scope_partition,event_type,idempotency_key). Fields already present in the envelope are adopted by reference to Contracts_V0.md#EventRecord, never replaced by a local envelope.
6. **Replay/idempotency.** Freeze `replay_policy=dedupe_by_idempotency_key` and Contracts’ exact producer-semantic digest over only its named caller fields. Current write/retry refuses `projector_replay_only` as `replay_only_not_appendable` before success. Same identity/same digest resolves the original complete event and first receipt via `storage.first_append_receipt.resolve.v2`, even after current source state advances; changed digest conflicts, unavailable authoritative dedupe returns `dedupe_unavailable` with no new effect. Do not compare Storage sequence/timestamps as caller semantics. Missing delivered work after confirmed older restore stays unavailable; a new event ID never reconstructs a missing original operation. Event replay cannot rerun commands, timers, Compose, turns, effects, Usage charges or notifications.
7. **Retention.** Bind this exact event to `RP-AUTHORITY-INDEFINITE@1.0.0`, approved deck-1 Card 1 `G18` (DL-401). No TTL or count cap. For Project entries only explicit Delete Puppet Master project data removes this audit history under existing holds; Remove project from list, deleting a described object or deleting its chat does not. Application records retain the existing app-root custody/deletion rules, never a fabricated Project. Disk pressure refuses new records. Referenced bodies retain their own policies and access; this content-free event grants no longer retention or access to them. The canonical publication journal adopts this same `RP-AUTHORITY-INDEFINITE@1.0.0` assignment and all original pending/result/backup/hold dependencies under `SP-1567`; it is never a disposable index or independently expiring copy. SP-286 receipt custody keeps its own policy.
8. **Redaction/custody.** Use `secret_refs_only` for current events; verify all refs with the original owner’s access and no-secret rules. The sole native adapter must prove actual original issuance, full scope/key/source joins and complete before/after facts, not a copied source view. Storage owns canonical seglog, publication journal, first receipt/full-value proof and a coherent backup/restore closure with pending owner effect/result; restore fences unresolved origin or tombstone state. Reads recheck current permission/deletion while authenticating original admission/recipe/receipt. They may show a valid retained fact after its live object changes or is gone, with unavailable linked body disclosed; they never reconstruct the body or require current state to equal a historical state. Unavailable or invalid source custody returns typed refusal, never fabricated empty success.
9. **Transitions.** cmd.runtime.quota_resume.set commits the actual opt-in consent change scoped to run/provider/account; enabled defaults false only at genuine creation, never by a new global Settings write. Record exact reset truth and source; unchanged consent is no change. Stop/pause remains higher priority and consent never clears it. Extra family-specific predicates: quota_route: run/provider/account and actual selected route agree; quota_truth: reset truth matches the actual provider/inference/user/unknown source; quota_effect: original source proves quota_resume_consent_changed; quota_precedence: manual Stop and selected app/Project pause are never cleared by quota; quota_state: Goal/Plan/To-Do semantics stay unchanged by the wait itself. False/no-op/rejected results emit no successful mutation fact. Compound owner changes preserve all required facts and canonical visibility atomically; no partly admitted subset claims to be complete. Cross-owner original records remain owned by their respective source owners.
10. **Consumers/checkpoints.** The exact read-only operating consumer is `storage.w3h.runtime_quota_resume_consent_changed.recovery_read.v1@1.0.0`, called by `SchedulingService` for existing original-result/restart inspection; it never reconstructs or changes canonical domain state from events. It explicitly adopts SP-278 and `reader.storage.event_record_index@1.0.0`: resolve CURRENT, authentic root/generation/anchor/frontier/dataset and complete source selection in one live transaction, authenticate the complete captured range and every matching source/payload, then filter exact partition+`runtime.quota_resume_consent_changed`. Unsupported/corrupt/missing source is unavailable, never skipped as empty. SP-278 alone owns the generic checkpoint’s whole-value CAS, monotonic frontier and rebuild. This read-only family owns **no projector, projection or independent durable checkpoint** (`checkpoint_disposition=none_required`): zero durable reader effects. Any persisted SP-278 token remains its nine durable fields (DL-076); join the transaction’s live redb_snapshot_id only in memory and revalidate the complete live token after every helper immediately before disclosure. Empty verified range, zero matching events and missing coverage are distinct. Reader withdrawal fences interpretation. No current continuation/dispatch authority comes from this history read.
11. **Compatibility/withdrawal.** No alias, automatic legacy converter or historical emission is asserted for this newly prepared family. Preserve actual old admitted shapes and original recipes only when authenticated original issuance selects them; schema/version/recipe/source substitution or unknown selection refuses. Unsupported future versions never mutate. Writer withdrawal first cuts off this exact family/source edition under append lock, fences new prepares and append drains, and preserves pending accepted effects as unresolved custody. Exact retained-result lookup is read-only and needs authorized retained admission. Reader withdrawal stops interpretation and generic-index filtered reads for this family; it never deletes source or dedupe/receipt custody. Generic-index rebuilding excludes withdrawn interpretation and carries truthful coverage; re-enablement needs explicit reviewed version/source adoption, not a replay alias. Current live guards do not retroactively invalidate otherwise valid retained originals.
12. **Oracles.** `runtime.quota_resume_consent_changed` has its own positive, schema, source, identity, retry, receipt, retention/access, transition, token and withdrawal plan in `reports/event-authority-20261105/W3H-oracle-plan.json`. Every planned negative starts from a valid case and changes one input invariant, with all unrelated derived values recomputed. No oracle implementation or guard-removal proof is claimed in phase 1: criterion 12 **PARTIAL**, native **NOT_RUN**. Phase 2 adopts the reviewed shared numeric/time helper and shared guard-isolation tool before Sol/Astra review.

ContractRef: ContractName:Plans/Contracts_V0.md#EventRecord, ContractName:Plans/Contracts_V0.md#CV-1567, ContractName:Plans/storage-plan.md#SP-1567, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286

## SQR-1568 — `runtime.quota_wait_started`: newly authored owner contract, prepared without admission

```yaml
plan_unit_id: SQR-1568
unit_type: interface_contract
status: accepted
owner_doc: Plans/Scheduling_and_Quota_Resume.md
canonical_text: 'For exactly runtime.quota_wait_started@1.0.0, the adjacent twelve-criterion contract binds the
  already specified fact: Provider usage exhaustion places an existing unfinished run into the shared quota wait.
  Record the genuine run wait entry and reset truth; unknown stays unknown and a local estimate never becomes provider
  fact. Goal remains active and Plan remains Building; there is no Goal/To-Do blocked transition merely because
  of quota. Newly authored technical bindings follow deck-1 4b A (DL-411) and the documented exact-family search.
  Registry membership stays absent; criterion 12 remains PARTIAL until phase 2.'
gui_related: false
gui_classification_reason: Persisted semantic facts and source/recovery contracts only; existing presentation owners
  remain authoritative.
depends_on:
- SQR-005
- SQR-006
- SQR-019
unblocks: []
acceptance_criteria:
- This exact family stays prepared without admission and retains each original owner boundary.
- Closed payload, authentic original source joins, receipt custody and read-only recovery satisfy the adjacent family-specific
  contract.
- Phase 2 must implement and prove every planned guard before criterion 12 can pass.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- reports/event-authority-20261105/W3H-oracle-plan.json
risk_class: event_source_identity_or_replay_drift
reasoning_tier: high
context_scope: event_authority_w3h_phase1
implementation_surfaces:
- Plans/Scheduling_and_Quota_Resume.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- E-CARDS-1 4b A (DL-411); exact original answer and deck SHA-256 in reports/event-authority-20261105/W3H.md
- reports/event-authority-20261105/W3H-search-evidence.json
preserved_exact_tokens:
- runtime.quota_wait_started
- prepared_without_admission
negative_constraints:
- No event admission, registry family append, Decision Log mutation, new feature or changed deletion rule.
- No local numeric/timestamp codec or proof machinery; adopt reviewed shared foundations in phase 2.
owner_hints:
- Plans/Scheduling_and_Quota_Resume.md
```

1. **Membership/version.** `runtime.quota_wait_started@1.0.0` is a candidate only, with no registry append, admission record or native writer. All current paths return `missing_event_registration` until this exact family/source edition is admitted; siblings grant nothing.
2. **Owner.** This unit owns the semantic fact: Provider usage exhaustion places an existing unfinished run into the shared quota wait. Record the genuine run wait entry and reset truth; unknown stays unknown and a local estimate never becomes provider fact. Goal remains active and Plan remains Building; there is no Goal/To-Do blocked transition merely because of quota. Reuse SQR-005, SQR-006, SQR-019; payload binding is CV-1568, persistence is SP-1568.
3. **Producer.** Sole producer `SchedulingService::quota_wait_started` calls `storage.w3h.runtime_quota_wait_started.append.v1@1.0.0`. Source is SQR-005/006 original quota wait, QuotaResumeConsent or eligibility decision receipt, actual provider/account and actual run owner; SP-306 Project or SQR-019/SP-352 application source. The source adapter methods `prepare_runtime_quota_wait_started`, `commit_runtime_quota_wait_started`, `resolve_runtime_quota_wait_started_original` are newly authored interfaces of that owner, not installed handlers. Verify actual before/after source identity, genuine original receipt/result and permissions before committing the existing owner effect plus its publication journal atomically; save the exact semantic envelope and payload once. Drain the pending event via ordinary Storage append, explicitly adopting SP-286/CV-339 first-AppendReceipt **full-value v2** custody and SP-336/347 durability classes; then CAS prepared→appended→settled using the exact prior whole journal value. Domain success acknowledgement waits for the original body result and first event receipt; dependent dispatch/terminal publication waits for required receipts. A crash after body commit preserves the body and pending publication, never rolls it back or repeats the domain effect. The missing-registration gate acts before new event preparation and confers no native authority on existing result-only paths.
4. **Payload.** `Plans/event_payloads/w3h/runtime_quota_wait_started.schema.json#/$defs/payload` is this family’s closed 1.0.0 schema. Every source field is compared to the genuine original owner result, not a caller-supplied matching snapshot. Required source refs resolve to exact original typed records/results at one consistent snapshot; a ref, hash or all-true assertion alone proves no acceptance. Current numeric/format rules come from EventRecord/CV-317, original source owners and the reviewed shared number/time foundation at phase 2; no new numeric limit or timestamp grammar is authored here. No objective/message/To-Do/compose/env-file body or secret is copied.
5. **Scope/identity.** Scope is `application_or_project`. `project_id`, actual Server and thread match the original source and EventRecord; absent Project means explicit application only where an app source is selected, never dangling Project or current focus. For the app pause source thread remains null and no fake thread/Computer/roots request is required. The original owner allocates one lifetime-unique immutable effect ID from its genuine accepted operation, with the declared component `runtime.quota_wait_started` and exact `run_id` included before issuance. That frozen ID is `owner_operation_id`; batch/list operations allocate a separate component for each item. It survives retry and is never reminted from a timer or callback. Project key is `w3h@1:{hex(UTF8(owner_operation_id))}`. Application key, only for the explicitly selected app source, is exactly CV-366 `application@1:{hex(server_id)}:{hex(owner_operation_id)}`; no suffix is appended. Event ID is `w3h@1:{hex(UTF8(storage_instance_id))}:{hex(UTF8(owner_operation_id))}:{hex(UTF8(event_type))}`. Hex is lowercase byte-preserving encoding, not hashing or normalization. Storage’s partition is `app` or `project~{base64url_no_pad(UTF8(project_id))}`; the scoped dedupe tuple remains (scope_partition,event_type,idempotency_key). Fields already present in the envelope are adopted by reference to Contracts_V0.md#EventRecord, never replaced by a local envelope.
6. **Replay/idempotency.** Freeze `replay_policy=dedupe_by_idempotency_key` and Contracts’ exact producer-semantic digest over only its named caller fields. Current write/retry refuses `projector_replay_only` as `replay_only_not_appendable` before success. Same identity/same digest resolves the original complete event and first receipt via `storage.first_append_receipt.resolve.v2`, even after current source state advances; changed digest conflicts, unavailable authoritative dedupe returns `dedupe_unavailable` with no new effect. Do not compare Storage sequence/timestamps as caller semantics. Missing delivered work after confirmed older restore stays unavailable; a new event ID never reconstructs a missing original operation. Event replay cannot rerun commands, timers, Compose, turns, effects, Usage charges or notifications.
7. **Retention.** Bind this exact event to `RP-AUTHORITY-INDEFINITE@1.0.0`, approved deck-1 Card 1 `G18` (DL-401). No TTL or count cap. For Project entries only explicit Delete Puppet Master project data removes this audit history under existing holds; Remove project from list, deleting a described object or deleting its chat does not. Application records retain the existing app-root custody/deletion rules, never a fabricated Project. Disk pressure refuses new records. Referenced bodies retain their own policies and access; this content-free event grants no longer retention or access to them. The canonical publication journal adopts this same `RP-AUTHORITY-INDEFINITE@1.0.0` assignment and all original pending/result/backup/hold dependencies under `SP-1568`; it is never a disposable index or independently expiring copy. SP-286 receipt custody keeps its own policy.
8. **Redaction/custody.** Use `secret_refs_only` for current events; verify all refs with the original owner’s access and no-secret rules. The sole native adapter must prove actual original issuance, full scope/key/source joins and complete before/after facts, not a copied source view. Storage owns canonical seglog, publication journal, first receipt/full-value proof and a coherent backup/restore closure with pending owner effect/result; restore fences unresolved origin or tombstone state. Reads recheck current permission/deletion while authenticating original admission/recipe/receipt. They may show a valid retained fact after its live object changes or is gone, with unavailable linked body disclosed; they never reconstruct the body or require current state to equal a historical state. Unavailable or invalid source custody returns typed refusal, never fabricated empty success.
9. **Transitions.** Provider usage exhaustion places an existing unfinished run into the shared quota wait. Record the genuine run wait entry and reset truth; unknown stays unknown and a local estimate never becomes provider fact. Goal remains active and Plan remains Building; there is no Goal/To-Do blocked transition merely because of quota. Extra family-specific predicates: quota_route: run/provider/account and actual selected route agree; quota_truth: reset truth matches the actual provider/inference/user/unknown source; quota_effect: original source proves quota_wait_started; quota_precedence: manual Stop and selected app/Project pause are never cleared by quota; quota_state: Goal/Plan/To-Do semantics stay unchanged by the wait itself. False/no-op/rejected results emit no successful mutation fact. Compound owner changes preserve all required facts and canonical visibility atomically; no partly admitted subset claims to be complete. Cross-owner original records remain owned by their respective source owners.
10. **Consumers/checkpoints.** The exact read-only operating consumer is `storage.w3h.runtime_quota_wait_started.recovery_read.v1@1.0.0`, called by `SchedulingService` for existing original-result/restart inspection; it never reconstructs or changes canonical domain state from events. It explicitly adopts SP-278 and `reader.storage.event_record_index@1.0.0`: resolve CURRENT, authentic root/generation/anchor/frontier/dataset and complete source selection in one live transaction, authenticate the complete captured range and every matching source/payload, then filter exact partition+`runtime.quota_wait_started`. Unsupported/corrupt/missing source is unavailable, never skipped as empty. SP-278 alone owns the generic checkpoint’s whole-value CAS, monotonic frontier and rebuild. This read-only family owns **no projector, projection or independent durable checkpoint** (`checkpoint_disposition=none_required`): zero durable reader effects. Any persisted SP-278 token remains its nine durable fields (DL-076); join the transaction’s live redb_snapshot_id only in memory and revalidate the complete live token after every helper immediately before disclosure. Empty verified range, zero matching events and missing coverage are distinct. Reader withdrawal fences interpretation. No current continuation/dispatch authority comes from this history read.
11. **Compatibility/withdrawal.** No alias, automatic legacy converter or historical emission is asserted for this newly prepared family. Preserve actual old admitted shapes and original recipes only when authenticated original issuance selects them; schema/version/recipe/source substitution or unknown selection refuses. Unsupported future versions never mutate. Writer withdrawal first cuts off this exact family/source edition under append lock, fences new prepares and append drains, and preserves pending accepted effects as unresolved custody. Exact retained-result lookup is read-only and needs authorized retained admission. Reader withdrawal stops interpretation and generic-index filtered reads for this family; it never deletes source or dedupe/receipt custody. Generic-index rebuilding excludes withdrawn interpretation and carries truthful coverage; re-enablement needs explicit reviewed version/source adoption, not a replay alias. Current live guards do not retroactively invalidate otherwise valid retained originals.
12. **Oracles.** `runtime.quota_wait_started` has its own positive, schema, source, identity, retry, receipt, retention/access, transition, token and withdrawal plan in `reports/event-authority-20261105/W3H-oracle-plan.json`. Every planned negative starts from a valid case and changes one input invariant, with all unrelated derived values recomputed. No oracle implementation or guard-removal proof is claimed in phase 1: criterion 12 **PARTIAL**, native **NOT_RUN**. Phase 2 adopts the reviewed shared numeric/time helper and shared guard-isolation tool before Sol/Astra review.

ContractRef: ContractName:Plans/Contracts_V0.md#EventRecord, ContractName:Plans/Contracts_V0.md#CV-1568, ContractName:Plans/storage-plan.md#SP-1568, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286

## SQR-1569 — `scheduled_dispatch.cancelled`: newly authored owner contract, prepared without admission

```yaml
plan_unit_id: SQR-1569
unit_type: interface_contract
status: accepted
owner_doc: Plans/Scheduling_and_Quota_Resume.md
canonical_text: 'For exactly scheduled_dispatch.cancelled@1.0.0, the adjacent twelve-criterion contract binds the
  already specified fact: cmd.chat.schedule_message.cancel makes a pending scheduled/held dispatch cancelled; retain
  the snapshot for audit and never dispatch it. Cancellation is terminal for that pending snapshot; it is not a
  Stop command for already admitted work. Newly authored technical bindings follow deck-1 4b A (DL-411) and the
  documented exact-family search. Registry membership stays absent; criterion 12 remains PARTIAL until phase 2.'
gui_related: false
gui_classification_reason: Persisted semantic facts and source/recovery contracts only; existing presentation owners
  remain authoritative.
depends_on:
- SQR-002
- SQR-006
- SQR-007
- SQR-019
unblocks: []
acceptance_criteria:
- This exact family stays prepared without admission and retains each original owner boundary.
- Closed payload, authentic original source joins, receipt custody and read-only recovery satisfy the adjacent family-specific
  contract.
- Phase 2 must implement and prove every planned guard before criterion 12 can pass.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- reports/event-authority-20261105/W3H-oracle-plan.json
risk_class: event_source_identity_or_replay_drift
reasoning_tier: high
context_scope: event_authority_w3h_phase1
implementation_surfaces:
- Plans/Scheduling_and_Quota_Resume.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- E-CARDS-1 4b A (DL-411); exact original answer and deck SHA-256 in reports/event-authority-20261105/W3H.md
- reports/event-authority-20261105/W3H-search-evidence.json
preserved_exact_tokens:
- scheduled_dispatch.cancelled
- prepared_without_admission
negative_constraints:
- No event admission, registry family append, Decision Log mutation, new feature or changed deletion rule.
- No local numeric/timestamp codec or proof machinery; adopt reviewed shared foundations in phase 2.
owner_hints:
- Plans/Scheduling_and_Quota_Resume.md
```

1. **Membership/version.** `scheduled_dispatch.cancelled@1.0.0` is a candidate only, with no registry append, admission record or native writer. All current paths return `missing_event_registration` until this exact family/source edition is admitted; siblings grant nothing.
2. **Owner.** This unit owns the semantic fact: cmd.chat.schedule_message.cancel makes a pending scheduled/held dispatch cancelled; retain the snapshot for audit and never dispatch it. Cancellation is terminal for that pending snapshot; it is not a Stop command for already admitted work. Reuse SQR-002, SQR-006, SQR-007, SQR-019; payload binding is CV-1569, persistence is SP-1569.
3. **Producer.** Sole producer `SchedulingService::scheduled_dispatch_cancelled` calls `storage.w3h.scheduled_dispatch_cancelled.append.v1@1.0.0`. Source is SQR-002/006/007 exact ScheduledMessageSnapshot and its original cancelled source receipt; selected original Project custody or SQR-019/SP-352 application source. The source adapter methods `prepare_scheduled_dispatch_cancelled`, `commit_scheduled_dispatch_cancelled`, `resolve_scheduled_dispatch_cancelled_original` are newly authored interfaces of that owner, not installed handlers. Verify actual before/after source identity, genuine original receipt/result and permissions before committing the existing owner effect plus its publication journal atomically; save the exact semantic envelope and payload once. Drain the pending event via ordinary Storage append, explicitly adopting SP-286/CV-339 first-AppendReceipt **full-value v2** custody and SP-336/347 durability classes; then CAS prepared→appended→settled using the exact prior whole journal value. Domain success acknowledgement waits for the original body result and first event receipt; dependent dispatch/terminal publication waits for required receipts. A crash after body commit preserves the body and pending publication, never rolls it back or repeats the domain effect. The missing-registration gate acts before new event preparation and confers no native authority on existing result-only paths.
4. **Payload.** `Plans/event_payloads/w3h/scheduled_dispatch_cancelled.schema.json#/$defs/payload` is this family’s closed 1.0.0 schema. Every source field is compared to the genuine original owner result, not a caller-supplied matching snapshot. Required source refs resolve to exact original typed records/results at one consistent snapshot; a ref, hash or all-true assertion alone proves no acceptance. Current numeric/format rules come from EventRecord/CV-317, original source owners and the reviewed shared number/time foundation at phase 2; no new numeric limit or timestamp grammar is authored here. No objective/message/To-Do/compose/env-file body or secret is copied.
5. **Scope/identity.** Scope is `application_or_project`. `project_id`, actual Server and thread match the original source and EventRecord; absent Project means explicit application only where an app source is selected, never dangling Project or current focus. For the app pause source thread remains null and no fake thread/Computer/roots request is required. The original owner allocates one lifetime-unique immutable effect ID from its genuine accepted operation, with the declared component `scheduled_dispatch.cancelled` and exact `scheduled_dispatch_id` included before issuance. That frozen ID is `owner_operation_id`; batch/list operations allocate a separate component for each item. It survives retry and is never reminted from a timer or callback. Project key is `w3h@1:{hex(UTF8(owner_operation_id))}`. Application key, only for the explicitly selected app source, is exactly CV-366 `application@1:{hex(server_id)}:{hex(owner_operation_id)}`; no suffix is appended. Event ID is `w3h@1:{hex(UTF8(storage_instance_id))}:{hex(UTF8(owner_operation_id))}:{hex(UTF8(event_type))}`. Hex is lowercase byte-preserving encoding, not hashing or normalization. Storage’s partition is `app` or `project~{base64url_no_pad(UTF8(project_id))}`; the scoped dedupe tuple remains (scope_partition,event_type,idempotency_key). Fields already present in the envelope are adopted by reference to Contracts_V0.md#EventRecord, never replaced by a local envelope.
6. **Replay/idempotency.** Freeze `replay_policy=dedupe_by_idempotency_key` and Contracts’ exact producer-semantic digest over only its named caller fields. Current write/retry refuses `projector_replay_only` as `replay_only_not_appendable` before success. Same identity/same digest resolves the original complete event and first receipt via `storage.first_append_receipt.resolve.v2`, even after current source state advances; changed digest conflicts, unavailable authoritative dedupe returns `dedupe_unavailable` with no new effect. Do not compare Storage sequence/timestamps as caller semantics. Missing delivered work after confirmed older restore stays unavailable; a new event ID never reconstructs a missing original operation. Event replay cannot rerun commands, timers, Compose, turns, effects, Usage charges or notifications.
7. **Retention.** Bind this exact event to `RP-AUTHORITY-INDEFINITE@1.0.0`, approved deck-1 Card 1 `G18` (DL-401). No TTL or count cap. For Project entries only explicit Delete Puppet Master project data removes this audit history under existing holds; Remove project from list, deleting a described object or deleting its chat does not. Application records retain the existing app-root custody/deletion rules, never a fabricated Project. Disk pressure refuses new records. Referenced bodies retain their own policies and access; this content-free event grants no longer retention or access to them. The canonical publication journal adopts this same `RP-AUTHORITY-INDEFINITE@1.0.0` assignment and all original pending/result/backup/hold dependencies under `SP-1569`; it is never a disposable index or independently expiring copy. SP-286 receipt custody keeps its own policy.
8. **Redaction/custody.** Use `secret_refs_only` for current events; verify all refs with the original owner’s access and no-secret rules. The sole native adapter must prove actual original issuance, full scope/key/source joins and complete before/after facts, not a copied source view. Storage owns canonical seglog, publication journal, first receipt/full-value proof and a coherent backup/restore closure with pending owner effect/result; restore fences unresolved origin or tombstone state. Reads recheck current permission/deletion while authenticating original admission/recipe/receipt. They may show a valid retained fact after its live object changes or is gone, with unavailable linked body disclosed; they never reconstruct the body or require current state to equal a historical state. Unavailable or invalid source custody returns typed refusal, never fabricated empty success.
9. **Transitions.** cmd.chat.schedule_message.cancel makes a pending scheduled/held dispatch cancelled; retain the snapshot for audit and never dispatch it. Cancellation is terminal for that pending snapshot; it is not a Stop command for already admitted work. Extra family-specific predicates: snapshot_exact: text/attachment/destination/runtime/model/account snapshot is exact, no re-derivation; dispatch_state: original state and expected revision permit cancelled; dispatch_effect: source receipt proves cancelled rather than request acceptance; dispatch_precedence: Stop/pause and both eligibility checks govern any send; no bypass from replay; dispatch_missed: server occurrence, IANA/DST and recorded hold/next_available/cancel_after_grace apply with no backlog burst. False/no-op/rejected results emit no successful mutation fact. Compound owner changes preserve all required facts and canonical visibility atomically; no partly admitted subset claims to be complete. Cross-owner original records remain owned by their respective source owners.
10. **Consumers/checkpoints.** The exact read-only operating consumer is `storage.w3h.scheduled_dispatch_cancelled.recovery_read.v1@1.0.0`, called by `SchedulingService` for existing original-result/restart inspection; it never reconstructs or changes canonical domain state from events. It explicitly adopts SP-278 and `reader.storage.event_record_index@1.0.0`: resolve CURRENT, authentic root/generation/anchor/frontier/dataset and complete source selection in one live transaction, authenticate the complete captured range and every matching source/payload, then filter exact partition+`scheduled_dispatch.cancelled`. Unsupported/corrupt/missing source is unavailable, never skipped as empty. SP-278 alone owns the generic checkpoint’s whole-value CAS, monotonic frontier and rebuild. This read-only family owns **no projector, projection or independent durable checkpoint** (`checkpoint_disposition=none_required`): zero durable reader effects. Any persisted SP-278 token remains its nine durable fields (DL-076); join the transaction’s live redb_snapshot_id only in memory and revalidate the complete live token after every helper immediately before disclosure. Empty verified range, zero matching events and missing coverage are distinct. Reader withdrawal fences interpretation. No current continuation/dispatch authority comes from this history read.
11. **Compatibility/withdrawal.** No alias, automatic legacy converter or historical emission is asserted for this newly prepared family. Preserve actual old admitted shapes and original recipes only when authenticated original issuance selects them; schema/version/recipe/source substitution or unknown selection refuses. Unsupported future versions never mutate. Writer withdrawal first cuts off this exact family/source edition under append lock, fences new prepares and append drains, and preserves pending accepted effects as unresolved custody. Exact retained-result lookup is read-only and needs authorized retained admission. Reader withdrawal stops interpretation and generic-index filtered reads for this family; it never deletes source or dedupe/receipt custody. Generic-index rebuilding excludes withdrawn interpretation and carries truthful coverage; re-enablement needs explicit reviewed version/source adoption, not a replay alias. Current live guards do not retroactively invalidate otherwise valid retained originals.
12. **Oracles.** `scheduled_dispatch.cancelled` has its own positive, schema, source, identity, retry, receipt, retention/access, transition, token and withdrawal plan in `reports/event-authority-20261105/W3H-oracle-plan.json`. Every planned negative starts from a valid case and changes one input invariant, with all unrelated derived values recomputed. No oracle implementation or guard-removal proof is claimed in phase 1: criterion 12 **PARTIAL**, native **NOT_RUN**. Phase 2 adopts the reviewed shared numeric/time helper and shared guard-isolation tool before Sol/Astra review.

ContractRef: ContractName:Plans/Contracts_V0.md#EventRecord, ContractName:Plans/Contracts_V0.md#CV-1569, ContractName:Plans/storage-plan.md#SP-1569, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286

## SQR-1570 — `scheduled_dispatch.created`: newly authored owner contract, prepared without admission

```yaml
plan_unit_id: SQR-1570
unit_type: interface_contract
status: accepted
owner_doc: Plans/Scheduling_and_Quota_Resume.md
canonical_text: 'For exactly scheduled_dispatch.created@1.0.0, the adjacent twelve-criterion contract binds the
  already specified fact: cmd.chat.schedule_message freezes exactly the Schedule Message sheet’s text, attachments,
  destination and chosen runtime/model/account route in one durable snapshot. Empty sheet text fails regardless
  of composer text. Commit acknowledges the snapshot and starts no run, Goal, Plan or To-Do. Newly authored technical
  bindings follow deck-1 4b A (DL-411) and the documented exact-family search. Registry membership stays absent;
  criterion 12 remains PARTIAL until phase 2.'
gui_related: false
gui_classification_reason: Persisted semantic facts and source/recovery contracts only; existing presentation owners
  remain authoritative.
depends_on:
- SQR-002
- SQR-006
- SQR-007
- SQR-019
unblocks: []
acceptance_criteria:
- This exact family stays prepared without admission and retains each original owner boundary.
- Closed payload, authentic original source joins, receipt custody and read-only recovery satisfy the adjacent family-specific
  contract.
- Phase 2 must implement and prove every planned guard before criterion 12 can pass.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- reports/event-authority-20261105/W3H-oracle-plan.json
risk_class: event_source_identity_or_replay_drift
reasoning_tier: high
context_scope: event_authority_w3h_phase1
implementation_surfaces:
- Plans/Scheduling_and_Quota_Resume.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- E-CARDS-1 4b A (DL-411); exact original answer and deck SHA-256 in reports/event-authority-20261105/W3H.md
- reports/event-authority-20261105/W3H-search-evidence.json
preserved_exact_tokens:
- scheduled_dispatch.created
- prepared_without_admission
negative_constraints:
- No event admission, registry family append, Decision Log mutation, new feature or changed deletion rule.
- No local numeric/timestamp codec or proof machinery; adopt reviewed shared foundations in phase 2.
owner_hints:
- Plans/Scheduling_and_Quota_Resume.md
```

1. **Membership/version.** `scheduled_dispatch.created@1.0.0` is a candidate only, with no registry append, admission record or native writer. All current paths return `missing_event_registration` until this exact family/source edition is admitted; siblings grant nothing.
2. **Owner.** This unit owns the semantic fact: cmd.chat.schedule_message freezes exactly the Schedule Message sheet’s text, attachments, destination and chosen runtime/model/account route in one durable snapshot. Empty sheet text fails regardless of composer text. Commit acknowledges the snapshot and starts no run, Goal, Plan or To-Do. Reuse SQR-002, SQR-006, SQR-007, SQR-019; payload binding is CV-1570, persistence is SP-1570.
3. **Producer.** Sole producer `SchedulingService::scheduled_dispatch_created` calls `storage.w3h.scheduled_dispatch_created.append.v1@1.0.0`. Source is SQR-002/006/007 exact ScheduledMessageSnapshot and its original created source receipt; selected original Project custody or SQR-019/SP-352 application source. The source adapter methods `prepare_scheduled_dispatch_created`, `commit_scheduled_dispatch_created`, `resolve_scheduled_dispatch_created_original` are newly authored interfaces of that owner, not installed handlers. Verify actual before/after source identity, genuine original receipt/result and permissions before committing the existing owner effect plus its publication journal atomically; save the exact semantic envelope and payload once. Drain the pending event via ordinary Storage append, explicitly adopting SP-286/CV-339 first-AppendReceipt **full-value v2** custody and SP-336/347 durability classes; then CAS prepared→appended→settled using the exact prior whole journal value. Domain success acknowledgement waits for the original body result and first event receipt; dependent dispatch/terminal publication waits for required receipts. A crash after body commit preserves the body and pending publication, never rolls it back or repeats the domain effect. The missing-registration gate acts before new event preparation and confers no native authority on existing result-only paths.
4. **Payload.** `Plans/event_payloads/w3h/scheduled_dispatch_created.schema.json#/$defs/payload` is this family’s closed 1.0.0 schema. Every source field is compared to the genuine original owner result, not a caller-supplied matching snapshot. Required source refs resolve to exact original typed records/results at one consistent snapshot; a ref, hash or all-true assertion alone proves no acceptance. Current numeric/format rules come from EventRecord/CV-317, original source owners and the reviewed shared number/time foundation at phase 2; no new numeric limit or timestamp grammar is authored here. No objective/message/To-Do/compose/env-file body or secret is copied.
5. **Scope/identity.** Scope is `application_or_project`. `project_id`, actual Server and thread match the original source and EventRecord; absent Project means explicit application only where an app source is selected, never dangling Project or current focus. For the app pause source thread remains null and no fake thread/Computer/roots request is required. The original owner allocates one lifetime-unique immutable effect ID from its genuine accepted operation, with the declared component `scheduled_dispatch.created` and exact `scheduled_dispatch_id` included before issuance. That frozen ID is `owner_operation_id`; batch/list operations allocate a separate component for each item. It survives retry and is never reminted from a timer or callback. Project key is `w3h@1:{hex(UTF8(owner_operation_id))}`. Application key, only for the explicitly selected app source, is exactly CV-366 `application@1:{hex(server_id)}:{hex(owner_operation_id)}`; no suffix is appended. Event ID is `w3h@1:{hex(UTF8(storage_instance_id))}:{hex(UTF8(owner_operation_id))}:{hex(UTF8(event_type))}`. Hex is lowercase byte-preserving encoding, not hashing or normalization. Storage’s partition is `app` or `project~{base64url_no_pad(UTF8(project_id))}`; the scoped dedupe tuple remains (scope_partition,event_type,idempotency_key). Fields already present in the envelope are adopted by reference to Contracts_V0.md#EventRecord, never replaced by a local envelope.
6. **Replay/idempotency.** Freeze `replay_policy=dedupe_by_idempotency_key` and Contracts’ exact producer-semantic digest over only its named caller fields. Current write/retry refuses `projector_replay_only` as `replay_only_not_appendable` before success. Same identity/same digest resolves the original complete event and first receipt via `storage.first_append_receipt.resolve.v2`, even after current source state advances; changed digest conflicts, unavailable authoritative dedupe returns `dedupe_unavailable` with no new effect. Do not compare Storage sequence/timestamps as caller semantics. Missing delivered work after confirmed older restore stays unavailable; a new event ID never reconstructs a missing original operation. Event replay cannot rerun commands, timers, Compose, turns, effects, Usage charges or notifications.
7. **Retention.** Bind this exact event to `RP-AUTHORITY-INDEFINITE@1.0.0`, approved deck-1 Card 1 `G18` (DL-401). No TTL or count cap. For Project entries only explicit Delete Puppet Master project data removes this audit history under existing holds; Remove project from list, deleting a described object or deleting its chat does not. Application records retain the existing app-root custody/deletion rules, never a fabricated Project. Disk pressure refuses new records. Referenced bodies retain their own policies and access; this content-free event grants no longer retention or access to them. The canonical publication journal adopts this same `RP-AUTHORITY-INDEFINITE@1.0.0` assignment and all original pending/result/backup/hold dependencies under `SP-1570`; it is never a disposable index or independently expiring copy. SP-286 receipt custody keeps its own policy.
8. **Redaction/custody.** Use `secret_refs_only` for current events; verify all refs with the original owner’s access and no-secret rules. The sole native adapter must prove actual original issuance, full scope/key/source joins and complete before/after facts, not a copied source view. Storage owns canonical seglog, publication journal, first receipt/full-value proof and a coherent backup/restore closure with pending owner effect/result; restore fences unresolved origin or tombstone state. Reads recheck current permission/deletion while authenticating original admission/recipe/receipt. They may show a valid retained fact after its live object changes or is gone, with unavailable linked body disclosed; they never reconstruct the body or require current state to equal a historical state. Unavailable or invalid source custody returns typed refusal, never fabricated empty success.
9. **Transitions.** cmd.chat.schedule_message freezes exactly the Schedule Message sheet’s text, attachments, destination and chosen runtime/model/account route in one durable snapshot. Empty sheet text fails regardless of composer text. Commit acknowledges the snapshot and starts no run, Goal, Plan or To-Do. Extra family-specific predicates: snapshot_exact: text/attachment/destination/runtime/model/account snapshot is exact, no re-derivation; dispatch_state: original state and expected revision permit created; dispatch_effect: source receipt proves created rather than request acceptance; dispatch_precedence: Stop/pause and both eligibility checks govern any send; no bypass from replay; dispatch_missed: server occurrence, IANA/DST and recorded hold/next_available/cancel_after_grace apply with no backlog burst. False/no-op/rejected results emit no successful mutation fact. Compound owner changes preserve all required facts and canonical visibility atomically; no partly admitted subset claims to be complete. Cross-owner original records remain owned by their respective source owners.
10. **Consumers/checkpoints.** The exact read-only operating consumer is `storage.w3h.scheduled_dispatch_created.recovery_read.v1@1.0.0`, called by `SchedulingService` for existing original-result/restart inspection; it never reconstructs or changes canonical domain state from events. It explicitly adopts SP-278 and `reader.storage.event_record_index@1.0.0`: resolve CURRENT, authentic root/generation/anchor/frontier/dataset and complete source selection in one live transaction, authenticate the complete captured range and every matching source/payload, then filter exact partition+`scheduled_dispatch.created`. Unsupported/corrupt/missing source is unavailable, never skipped as empty. SP-278 alone owns the generic checkpoint’s whole-value CAS, monotonic frontier and rebuild. This read-only family owns **no projector, projection or independent durable checkpoint** (`checkpoint_disposition=none_required`): zero durable reader effects. Any persisted SP-278 token remains its nine durable fields (DL-076); join the transaction’s live redb_snapshot_id only in memory and revalidate the complete live token after every helper immediately before disclosure. Empty verified range, zero matching events and missing coverage are distinct. Reader withdrawal fences interpretation. No current continuation/dispatch authority comes from this history read.
11. **Compatibility/withdrawal.** No alias, automatic legacy converter or historical emission is asserted for this newly prepared family. Preserve actual old admitted shapes and original recipes only when authenticated original issuance selects them; schema/version/recipe/source substitution or unknown selection refuses. Unsupported future versions never mutate. Writer withdrawal first cuts off this exact family/source edition under append lock, fences new prepares and append drains, and preserves pending accepted effects as unresolved custody. Exact retained-result lookup is read-only and needs authorized retained admission. Reader withdrawal stops interpretation and generic-index filtered reads for this family; it never deletes source or dedupe/receipt custody. Generic-index rebuilding excludes withdrawn interpretation and carries truthful coverage; re-enablement needs explicit reviewed version/source adoption, not a replay alias. Current live guards do not retroactively invalidate otherwise valid retained originals.
12. **Oracles.** `scheduled_dispatch.created` has its own positive, schema, source, identity, retry, receipt, retention/access, transition, token and withdrawal plan in `reports/event-authority-20261105/W3H-oracle-plan.json`. Every planned negative starts from a valid case and changes one input invariant, with all unrelated derived values recomputed. No oracle implementation or guard-removal proof is claimed in phase 1: criterion 12 **PARTIAL**, native **NOT_RUN**. Phase 2 adopts the reviewed shared numeric/time helper and shared guard-isolation tool before Sol/Astra review.

ContractRef: ContractName:Plans/Contracts_V0.md#EventRecord, ContractName:Plans/Contracts_V0.md#CV-1570, ContractName:Plans/storage-plan.md#SP-1570, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286

## SQR-1571 — `scheduled_dispatch.dispatched`: newly authored owner contract, prepared without admission

```yaml
plan_unit_id: SQR-1571
unit_type: interface_contract
status: accepted
owner_doc: Plans/Scheduling_and_Quota_Resume.md
canonical_text: 'For exactly scheduled_dispatch.dispatched@1.0.0, the adjacent twelve-criterion contract binds the
  already specified fact: The server timer/explicit Send now path records the original successful owner dispatch
  receipt after both eligibility checks and exact snapshot admission. Carry the original dispatch idempotency identity
  and revalidation result. It proves dispatch, never response/build completion. Duplicate timer or restart returns
  the original result without sending again. Newly authored technical bindings follow deck-1 4b A (DL-411) and the
  documented exact-family search. Registry membership stays absent; criterion 12 remains PARTIAL until phase 2.'
gui_related: false
gui_classification_reason: Persisted semantic facts and source/recovery contracts only; existing presentation owners
  remain authoritative.
depends_on:
- SQR-002
- SQR-006
- SQR-007
- SQR-019
unblocks: []
acceptance_criteria:
- This exact family stays prepared without admission and retains each original owner boundary.
- Closed payload, authentic original source joins, receipt custody and read-only recovery satisfy the adjacent family-specific
  contract.
- Phase 2 must implement and prove every planned guard before criterion 12 can pass.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- reports/event-authority-20261105/W3H-oracle-plan.json
risk_class: event_source_identity_or_replay_drift
reasoning_tier: high
context_scope: event_authority_w3h_phase1
implementation_surfaces:
- Plans/Scheduling_and_Quota_Resume.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- E-CARDS-1 4b A (DL-411); exact original answer and deck SHA-256 in reports/event-authority-20261105/W3H.md
- reports/event-authority-20261105/W3H-search-evidence.json
preserved_exact_tokens:
- scheduled_dispatch.dispatched
- prepared_without_admission
negative_constraints:
- No event admission, registry family append, Decision Log mutation, new feature or changed deletion rule.
- No local numeric/timestamp codec or proof machinery; adopt reviewed shared foundations in phase 2.
owner_hints:
- Plans/Scheduling_and_Quota_Resume.md
```

1. **Membership/version.** `scheduled_dispatch.dispatched@1.0.0` is a candidate only, with no registry append, admission record or native writer. All current paths return `missing_event_registration` until this exact family/source edition is admitted; siblings grant nothing.
2. **Owner.** This unit owns the semantic fact: The server timer/explicit Send now path records the original successful owner dispatch receipt after both eligibility checks and exact snapshot admission. Carry the original dispatch idempotency identity and revalidation result. It proves dispatch, never response/build completion. Duplicate timer or restart returns the original result without sending again. Reuse SQR-002, SQR-006, SQR-007, SQR-019; payload binding is CV-1571, persistence is SP-1571.
3. **Producer.** Sole producer `SchedulingService::scheduled_dispatch_dispatched` calls `storage.w3h.scheduled_dispatch_dispatched.append.v1@1.0.0`. Source is SQR-002/006/007 exact ScheduledMessageSnapshot and its original dispatched source receipt; selected original Project custody or SQR-019/SP-352 application source. The source adapter methods `prepare_scheduled_dispatch_dispatched`, `commit_scheduled_dispatch_dispatched`, `resolve_scheduled_dispatch_dispatched_original` are newly authored interfaces of that owner, not installed handlers. Verify actual before/after source identity, genuine original receipt/result and permissions before committing the existing owner effect plus its publication journal atomically; save the exact semantic envelope and payload once. Drain the pending event via ordinary Storage append, explicitly adopting SP-286/CV-339 first-AppendReceipt **full-value v2** custody and SP-336/347 durability classes; then CAS prepared→appended→settled using the exact prior whole journal value. Domain success acknowledgement waits for the original body result and first event receipt; dependent dispatch/terminal publication waits for required receipts. A crash after body commit preserves the body and pending publication, never rolls it back or repeats the domain effect. The missing-registration gate acts before new event preparation and confers no native authority on existing result-only paths.
4. **Payload.** `Plans/event_payloads/w3h/scheduled_dispatch_dispatched.schema.json#/$defs/payload` is this family’s closed 1.0.0 schema. Every source field is compared to the genuine original owner result, not a caller-supplied matching snapshot. Required source refs resolve to exact original typed records/results at one consistent snapshot; a ref, hash or all-true assertion alone proves no acceptance. Current numeric/format rules come from EventRecord/CV-317, original source owners and the reviewed shared number/time foundation at phase 2; no new numeric limit or timestamp grammar is authored here. No objective/message/To-Do/compose/env-file body or secret is copied.
5. **Scope/identity.** Scope is `application_or_project`. `project_id`, actual Server and thread match the original source and EventRecord; absent Project means explicit application only where an app source is selected, never dangling Project or current focus. For the app pause source thread remains null and no fake thread/Computer/roots request is required. The original owner allocates one lifetime-unique immutable effect ID from its genuine accepted operation, with the declared component `scheduled_dispatch.dispatched` and exact `scheduled_dispatch_id` included before issuance. That frozen ID is `owner_operation_id`; batch/list operations allocate a separate component for each item. It survives retry and is never reminted from a timer or callback. Project key is `w3h@1:{hex(UTF8(owner_operation_id))}`. Application key, only for the explicitly selected app source, is exactly CV-366 `application@1:{hex(server_id)}:{hex(owner_operation_id)}`; no suffix is appended. Event ID is `w3h@1:{hex(UTF8(storage_instance_id))}:{hex(UTF8(owner_operation_id))}:{hex(UTF8(event_type))}`. Hex is lowercase byte-preserving encoding, not hashing or normalization. Storage’s partition is `app` or `project~{base64url_no_pad(UTF8(project_id))}`; the scoped dedupe tuple remains (scope_partition,event_type,idempotency_key). Fields already present in the envelope are adopted by reference to Contracts_V0.md#EventRecord, never replaced by a local envelope.
6. **Replay/idempotency.** Freeze `replay_policy=dedupe_by_idempotency_key` and Contracts’ exact producer-semantic digest over only its named caller fields. Current write/retry refuses `projector_replay_only` as `replay_only_not_appendable` before success. Same identity/same digest resolves the original complete event and first receipt via `storage.first_append_receipt.resolve.v2`, even after current source state advances; changed digest conflicts, unavailable authoritative dedupe returns `dedupe_unavailable` with no new effect. Do not compare Storage sequence/timestamps as caller semantics. Missing delivered work after confirmed older restore stays unavailable; a new event ID never reconstructs a missing original operation. Event replay cannot rerun commands, timers, Compose, turns, effects, Usage charges or notifications.
7. **Retention.** Bind this exact event to `RP-AUTHORITY-INDEFINITE@1.0.0`, approved deck-1 Card 1 `G18` (DL-401). No TTL or count cap. For Project entries only explicit Delete Puppet Master project data removes this audit history under existing holds; Remove project from list, deleting a described object or deleting its chat does not. Application records retain the existing app-root custody/deletion rules, never a fabricated Project. Disk pressure refuses new records. Referenced bodies retain their own policies and access; this content-free event grants no longer retention or access to them. The canonical publication journal adopts this same `RP-AUTHORITY-INDEFINITE@1.0.0` assignment and all original pending/result/backup/hold dependencies under `SP-1571`; it is never a disposable index or independently expiring copy. SP-286 receipt custody keeps its own policy.
8. **Redaction/custody.** Use `secret_refs_only` for current events; verify all refs with the original owner’s access and no-secret rules. The sole native adapter must prove actual original issuance, full scope/key/source joins and complete before/after facts, not a copied source view. Storage owns canonical seglog, publication journal, first receipt/full-value proof and a coherent backup/restore closure with pending owner effect/result; restore fences unresolved origin or tombstone state. Reads recheck current permission/deletion while authenticating original admission/recipe/receipt. They may show a valid retained fact after its live object changes or is gone, with unavailable linked body disclosed; they never reconstruct the body or require current state to equal a historical state. Unavailable or invalid source custody returns typed refusal, never fabricated empty success.
9. **Transitions.** The server timer/explicit Send now path records the original successful owner dispatch receipt after both eligibility checks and exact snapshot admission. Carry the original dispatch idempotency identity and revalidation result. It proves dispatch, never response/build completion. Duplicate timer or restart returns the original result without sending again. Extra family-specific predicates: snapshot_exact: text/attachment/destination/runtime/model/account snapshot is exact, no re-derivation; dispatch_state: original state and expected revision permit dispatched; dispatch_effect: source receipt proves dispatched rather than request acceptance; dispatch_precedence: Stop/pause and both eligibility checks govern any send; no bypass from replay; dispatch_missed: server occurrence, IANA/DST and recorded hold/next_available/cancel_after_grace apply with no backlog burst. False/no-op/rejected results emit no successful mutation fact. Compound owner changes preserve all required facts and canonical visibility atomically; no partly admitted subset claims to be complete. Cross-owner original records remain owned by their respective source owners.
10. **Consumers/checkpoints.** The exact read-only operating consumer is `storage.w3h.scheduled_dispatch_dispatched.recovery_read.v1@1.0.0`, called by `SchedulingService` for existing original-result/restart inspection; it never reconstructs or changes canonical domain state from events. It explicitly adopts SP-278 and `reader.storage.event_record_index@1.0.0`: resolve CURRENT, authentic root/generation/anchor/frontier/dataset and complete source selection in one live transaction, authenticate the complete captured range and every matching source/payload, then filter exact partition+`scheduled_dispatch.dispatched`. Unsupported/corrupt/missing source is unavailable, never skipped as empty. SP-278 alone owns the generic checkpoint’s whole-value CAS, monotonic frontier and rebuild. This read-only family owns **no projector, projection or independent durable checkpoint** (`checkpoint_disposition=none_required`): zero durable reader effects. Any persisted SP-278 token remains its nine durable fields (DL-076); join the transaction’s live redb_snapshot_id only in memory and revalidate the complete live token after every helper immediately before disclosure. Empty verified range, zero matching events and missing coverage are distinct. Reader withdrawal fences interpretation. No current continuation/dispatch authority comes from this history read.
11. **Compatibility/withdrawal.** No alias, automatic legacy converter or historical emission is asserted for this newly prepared family. Preserve actual old admitted shapes and original recipes only when authenticated original issuance selects them; schema/version/recipe/source substitution or unknown selection refuses. Unsupported future versions never mutate. Writer withdrawal first cuts off this exact family/source edition under append lock, fences new prepares and append drains, and preserves pending accepted effects as unresolved custody. Exact retained-result lookup is read-only and needs authorized retained admission. Reader withdrawal stops interpretation and generic-index filtered reads for this family; it never deletes source or dedupe/receipt custody. Generic-index rebuilding excludes withdrawn interpretation and carries truthful coverage; re-enablement needs explicit reviewed version/source adoption, not a replay alias. Current live guards do not retroactively invalidate otherwise valid retained originals.
12. **Oracles.** `scheduled_dispatch.dispatched` has its own positive, schema, source, identity, retry, receipt, retention/access, transition, token and withdrawal plan in `reports/event-authority-20261105/W3H-oracle-plan.json`. Every planned negative starts from a valid case and changes one input invariant, with all unrelated derived values recomputed. No oracle implementation or guard-removal proof is claimed in phase 1: criterion 12 **PARTIAL**, native **NOT_RUN**. Phase 2 adopts the reviewed shared numeric/time helper and shared guard-isolation tool before Sol/Astra review.

ContractRef: ContractName:Plans/Contracts_V0.md#EventRecord, ContractName:Plans/Contracts_V0.md#CV-1571, ContractName:Plans/storage-plan.md#SP-1571, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286

## SQR-1572 — `scheduled_dispatch.failed`: newly authored owner contract, prepared without admission

```yaml
plan_unit_id: SQR-1572
unit_type: interface_contract
status: accepted
owner_doc: Plans/Scheduling_and_Quota_Resume.md
canonical_text: 'For exactly scheduled_dispatch.failed@1.0.0, the adjacent twelve-criterion contract binds the already
  specified fact: The server Scheduling owner records a genuine failed dispatch result with its original typed failure/reason.
  It never records ordinary hold as failure, success exit code as failure, or success-shaped run admission for a
  refused operation. Missing or uncertain original outcome is unavailable and never a fresh send. Newly authored
  technical bindings follow deck-1 4b A (DL-411) and the documented exact-family search. Registry membership stays
  absent; criterion 12 remains PARTIAL until phase 2.'
gui_related: false
gui_classification_reason: Persisted semantic facts and source/recovery contracts only; existing presentation owners
  remain authoritative.
depends_on:
- SQR-002
- SQR-006
- SQR-007
- SQR-019
unblocks: []
acceptance_criteria:
- This exact family stays prepared without admission and retains each original owner boundary.
- Closed payload, authentic original source joins, receipt custody and read-only recovery satisfy the adjacent family-specific
  contract.
- Phase 2 must implement and prove every planned guard before criterion 12 can pass.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- reports/event-authority-20261105/W3H-oracle-plan.json
risk_class: event_source_identity_or_replay_drift
reasoning_tier: high
context_scope: event_authority_w3h_phase1
implementation_surfaces:
- Plans/Scheduling_and_Quota_Resume.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- E-CARDS-1 4b A (DL-411); exact original answer and deck SHA-256 in reports/event-authority-20261105/W3H.md
- reports/event-authority-20261105/W3H-search-evidence.json
preserved_exact_tokens:
- scheduled_dispatch.failed
- prepared_without_admission
negative_constraints:
- No event admission, registry family append, Decision Log mutation, new feature or changed deletion rule.
- No local numeric/timestamp codec or proof machinery; adopt reviewed shared foundations in phase 2.
owner_hints:
- Plans/Scheduling_and_Quota_Resume.md
```

1. **Membership/version.** `scheduled_dispatch.failed@1.0.0` is a candidate only, with no registry append, admission record or native writer. All current paths return `missing_event_registration` until this exact family/source edition is admitted; siblings grant nothing.
2. **Owner.** This unit owns the semantic fact: The server Scheduling owner records a genuine failed dispatch result with its original typed failure/reason. It never records ordinary hold as failure, success exit code as failure, or success-shaped run admission for a refused operation. Missing or uncertain original outcome is unavailable and never a fresh send. Reuse SQR-002, SQR-006, SQR-007, SQR-019; payload binding is CV-1572, persistence is SP-1572.
3. **Producer.** Sole producer `SchedulingService::scheduled_dispatch_failed` calls `storage.w3h.scheduled_dispatch_failed.append.v1@1.0.0`. Source is SQR-002/006/007 exact ScheduledMessageSnapshot and its original failed source receipt; selected original Project custody or SQR-019/SP-352 application source. The source adapter methods `prepare_scheduled_dispatch_failed`, `commit_scheduled_dispatch_failed`, `resolve_scheduled_dispatch_failed_original` are newly authored interfaces of that owner, not installed handlers. Verify actual before/after source identity, genuine original receipt/result and permissions before committing the existing owner effect plus its publication journal atomically; save the exact semantic envelope and payload once. Drain the pending event via ordinary Storage append, explicitly adopting SP-286/CV-339 first-AppendReceipt **full-value v2** custody and SP-336/347 durability classes; then CAS prepared→appended→settled using the exact prior whole journal value. Domain success acknowledgement waits for the original body result and first event receipt; dependent dispatch/terminal publication waits for required receipts. A crash after body commit preserves the body and pending publication, never rolls it back or repeats the domain effect. The missing-registration gate acts before new event preparation and confers no native authority on existing result-only paths.
4. **Payload.** `Plans/event_payloads/w3h/scheduled_dispatch_failed.schema.json#/$defs/payload` is this family’s closed 1.0.0 schema. Every source field is compared to the genuine original owner result, not a caller-supplied matching snapshot. Required source refs resolve to exact original typed records/results at one consistent snapshot; a ref, hash or all-true assertion alone proves no acceptance. Current numeric/format rules come from EventRecord/CV-317, original source owners and the reviewed shared number/time foundation at phase 2; no new numeric limit or timestamp grammar is authored here. No objective/message/To-Do/compose/env-file body or secret is copied.
5. **Scope/identity.** Scope is `application_or_project`. `project_id`, actual Server and thread match the original source and EventRecord; absent Project means explicit application only where an app source is selected, never dangling Project or current focus. For the app pause source thread remains null and no fake thread/Computer/roots request is required. The original owner allocates one lifetime-unique immutable effect ID from its genuine accepted operation, with the declared component `scheduled_dispatch.failed` and exact `scheduled_dispatch_id` included before issuance. That frozen ID is `owner_operation_id`; batch/list operations allocate a separate component for each item. It survives retry and is never reminted from a timer or callback. Project key is `w3h@1:{hex(UTF8(owner_operation_id))}`. Application key, only for the explicitly selected app source, is exactly CV-366 `application@1:{hex(server_id)}:{hex(owner_operation_id)}`; no suffix is appended. Event ID is `w3h@1:{hex(UTF8(storage_instance_id))}:{hex(UTF8(owner_operation_id))}:{hex(UTF8(event_type))}`. Hex is lowercase byte-preserving encoding, not hashing or normalization. Storage’s partition is `app` or `project~{base64url_no_pad(UTF8(project_id))}`; the scoped dedupe tuple remains (scope_partition,event_type,idempotency_key). Fields already present in the envelope are adopted by reference to Contracts_V0.md#EventRecord, never replaced by a local envelope.
6. **Replay/idempotency.** Freeze `replay_policy=dedupe_by_idempotency_key` and Contracts’ exact producer-semantic digest over only its named caller fields. Current write/retry refuses `projector_replay_only` as `replay_only_not_appendable` before success. Same identity/same digest resolves the original complete event and first receipt via `storage.first_append_receipt.resolve.v2`, even after current source state advances; changed digest conflicts, unavailable authoritative dedupe returns `dedupe_unavailable` with no new effect. Do not compare Storage sequence/timestamps as caller semantics. Missing delivered work after confirmed older restore stays unavailable; a new event ID never reconstructs a missing original operation. Event replay cannot rerun commands, timers, Compose, turns, effects, Usage charges or notifications.
7. **Retention.** Bind this exact event to `RP-AUTHORITY-INDEFINITE@1.0.0`, approved deck-1 Card 1 `G18` (DL-401). No TTL or count cap. For Project entries only explicit Delete Puppet Master project data removes this audit history under existing holds; Remove project from list, deleting a described object or deleting its chat does not. Application records retain the existing app-root custody/deletion rules, never a fabricated Project. Disk pressure refuses new records. Referenced bodies retain their own policies and access; this content-free event grants no longer retention or access to them. The canonical publication journal adopts this same `RP-AUTHORITY-INDEFINITE@1.0.0` assignment and all original pending/result/backup/hold dependencies under `SP-1572`; it is never a disposable index or independently expiring copy. SP-286 receipt custody keeps its own policy.
8. **Redaction/custody.** Use `secret_refs_only` for current events; verify all refs with the original owner’s access and no-secret rules. The sole native adapter must prove actual original issuance, full scope/key/source joins and complete before/after facts, not a copied source view. Storage owns canonical seglog, publication journal, first receipt/full-value proof and a coherent backup/restore closure with pending owner effect/result; restore fences unresolved origin or tombstone state. Reads recheck current permission/deletion while authenticating original admission/recipe/receipt. They may show a valid retained fact after its live object changes or is gone, with unavailable linked body disclosed; they never reconstruct the body or require current state to equal a historical state. Unavailable or invalid source custody returns typed refusal, never fabricated empty success.
9. **Transitions.** The server Scheduling owner records a genuine failed dispatch result with its original typed failure/reason. It never records ordinary hold as failure, success exit code as failure, or success-shaped run admission for a refused operation. Missing or uncertain original outcome is unavailable and never a fresh send. Extra family-specific predicates: snapshot_exact: text/attachment/destination/runtime/model/account snapshot is exact, no re-derivation; dispatch_state: original state and expected revision permit failed; dispatch_effect: source receipt proves failed rather than request acceptance; dispatch_precedence: Stop/pause and both eligibility checks govern any send; no bypass from replay; dispatch_missed: server occurrence, IANA/DST and recorded hold/next_available/cancel_after_grace apply with no backlog burst. False/no-op/rejected results emit no successful mutation fact. Compound owner changes preserve all required facts and canonical visibility atomically; no partly admitted subset claims to be complete. Cross-owner original records remain owned by their respective source owners.
10. **Consumers/checkpoints.** The exact read-only operating consumer is `storage.w3h.scheduled_dispatch_failed.recovery_read.v1@1.0.0`, called by `SchedulingService` for existing original-result/restart inspection; it never reconstructs or changes canonical domain state from events. It explicitly adopts SP-278 and `reader.storage.event_record_index@1.0.0`: resolve CURRENT, authentic root/generation/anchor/frontier/dataset and complete source selection in one live transaction, authenticate the complete captured range and every matching source/payload, then filter exact partition+`scheduled_dispatch.failed`. Unsupported/corrupt/missing source is unavailable, never skipped as empty. SP-278 alone owns the generic checkpoint’s whole-value CAS, monotonic frontier and rebuild. This read-only family owns **no projector, projection or independent durable checkpoint** (`checkpoint_disposition=none_required`): zero durable reader effects. Any persisted SP-278 token remains its nine durable fields (DL-076); join the transaction’s live redb_snapshot_id only in memory and revalidate the complete live token after every helper immediately before disclosure. Empty verified range, zero matching events and missing coverage are distinct. Reader withdrawal fences interpretation. No current continuation/dispatch authority comes from this history read.
11. **Compatibility/withdrawal.** No alias, automatic legacy converter or historical emission is asserted for this newly prepared family. Preserve actual old admitted shapes and original recipes only when authenticated original issuance selects them; schema/version/recipe/source substitution or unknown selection refuses. Unsupported future versions never mutate. Writer withdrawal first cuts off this exact family/source edition under append lock, fences new prepares and append drains, and preserves pending accepted effects as unresolved custody. Exact retained-result lookup is read-only and needs authorized retained admission. Reader withdrawal stops interpretation and generic-index filtered reads for this family; it never deletes source or dedupe/receipt custody. Generic-index rebuilding excludes withdrawn interpretation and carries truthful coverage; re-enablement needs explicit reviewed version/source adoption, not a replay alias. Current live guards do not retroactively invalidate otherwise valid retained originals.
12. **Oracles.** `scheduled_dispatch.failed` has its own positive, schema, source, identity, retry, receipt, retention/access, transition, token and withdrawal plan in `reports/event-authority-20261105/W3H-oracle-plan.json`. Every planned negative starts from a valid case and changes one input invariant, with all unrelated derived values recomputed. No oracle implementation or guard-removal proof is claimed in phase 1: criterion 12 **PARTIAL**, native **NOT_RUN**. Phase 2 adopts the reviewed shared numeric/time helper and shared guard-isolation tool before Sol/Astra review.

ContractRef: ContractName:Plans/Contracts_V0.md#EventRecord, ContractName:Plans/Contracts_V0.md#CV-1572, ContractName:Plans/storage-plan.md#SP-1572, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286

## SQR-1573 — `scheduled_dispatch.held`: newly authored owner contract, prepared without admission

```yaml
plan_unit_id: SQR-1573
unit_type: interface_contract
status: accepted
owner_doc: Plans/Scheduling_and_Quota_Resume.md
canonical_text: 'For exactly scheduled_dispatch.held@1.0.0, the adjacent twelve-criterion contract binds the already
  specified fact: The server Scheduling owner records entry into held with the exact failed clause or saved missed-time
  hold decision. The pending exact snapshot stays unchanged. Project/application pause remains distinct and unknown
  custody is unavailable, never off. Re-observing the same hold is no new change. Newly authored technical bindings
  follow deck-1 4b A (DL-411) and the documented exact-family search. Registry membership stays absent; criterion
  12 remains PARTIAL until phase 2.'
gui_related: false
gui_classification_reason: Persisted semantic facts and source/recovery contracts only; existing presentation owners
  remain authoritative.
depends_on:
- SQR-002
- SQR-006
- SQR-007
- SQR-019
unblocks: []
acceptance_criteria:
- This exact family stays prepared without admission and retains each original owner boundary.
- Closed payload, authentic original source joins, receipt custody and read-only recovery satisfy the adjacent family-specific
  contract.
- Phase 2 must implement and prove every planned guard before criterion 12 can pass.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- reports/event-authority-20261105/W3H-oracle-plan.json
risk_class: event_source_identity_or_replay_drift
reasoning_tier: high
context_scope: event_authority_w3h_phase1
implementation_surfaces:
- Plans/Scheduling_and_Quota_Resume.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- E-CARDS-1 4b A (DL-411); exact original answer and deck SHA-256 in reports/event-authority-20261105/W3H.md
- reports/event-authority-20261105/W3H-search-evidence.json
preserved_exact_tokens:
- scheduled_dispatch.held
- prepared_without_admission
negative_constraints:
- No event admission, registry family append, Decision Log mutation, new feature or changed deletion rule.
- No local numeric/timestamp codec or proof machinery; adopt reviewed shared foundations in phase 2.
owner_hints:
- Plans/Scheduling_and_Quota_Resume.md
```

1. **Membership/version.** `scheduled_dispatch.held@1.0.0` is a candidate only, with no registry append, admission record or native writer. All current paths return `missing_event_registration` until this exact family/source edition is admitted; siblings grant nothing.
2. **Owner.** This unit owns the semantic fact: The server Scheduling owner records entry into held with the exact failed clause or saved missed-time hold decision. The pending exact snapshot stays unchanged. Project/application pause remains distinct and unknown custody is unavailable, never off. Re-observing the same hold is no new change. Reuse SQR-002, SQR-006, SQR-007, SQR-019; payload binding is CV-1573, persistence is SP-1573.
3. **Producer.** Sole producer `SchedulingService::scheduled_dispatch_held` calls `storage.w3h.scheduled_dispatch_held.append.v1@1.0.0`. Source is SQR-002/006/007 exact ScheduledMessageSnapshot and its original held source receipt; selected original Project custody or SQR-019/SP-352 application source. The source adapter methods `prepare_scheduled_dispatch_held`, `commit_scheduled_dispatch_held`, `resolve_scheduled_dispatch_held_original` are newly authored interfaces of that owner, not installed handlers. Verify actual before/after source identity, genuine original receipt/result and permissions before committing the existing owner effect plus its publication journal atomically; save the exact semantic envelope and payload once. Drain the pending event via ordinary Storage append, explicitly adopting SP-286/CV-339 first-AppendReceipt **full-value v2** custody and SP-336/347 durability classes; then CAS prepared→appended→settled using the exact prior whole journal value. Domain success acknowledgement waits for the original body result and first event receipt; dependent dispatch/terminal publication waits for required receipts. A crash after body commit preserves the body and pending publication, never rolls it back or repeats the domain effect. The missing-registration gate acts before new event preparation and confers no native authority on existing result-only paths.
4. **Payload.** `Plans/event_payloads/w3h/scheduled_dispatch_held.schema.json#/$defs/payload` is this family’s closed 1.0.0 schema. Every source field is compared to the genuine original owner result, not a caller-supplied matching snapshot. Required source refs resolve to exact original typed records/results at one consistent snapshot; a ref, hash or all-true assertion alone proves no acceptance. Current numeric/format rules come from EventRecord/CV-317, original source owners and the reviewed shared number/time foundation at phase 2; no new numeric limit or timestamp grammar is authored here. No objective/message/To-Do/compose/env-file body or secret is copied.
5. **Scope/identity.** Scope is `application_or_project`. `project_id`, actual Server and thread match the original source and EventRecord; absent Project means explicit application only where an app source is selected, never dangling Project or current focus. For the app pause source thread remains null and no fake thread/Computer/roots request is required. The original owner allocates one lifetime-unique immutable effect ID from its genuine accepted operation, with the declared component `scheduled_dispatch.held` and exact `scheduled_dispatch_id` included before issuance. That frozen ID is `owner_operation_id`; batch/list operations allocate a separate component for each item. It survives retry and is never reminted from a timer or callback. Project key is `w3h@1:{hex(UTF8(owner_operation_id))}`. Application key, only for the explicitly selected app source, is exactly CV-366 `application@1:{hex(server_id)}:{hex(owner_operation_id)}`; no suffix is appended. Event ID is `w3h@1:{hex(UTF8(storage_instance_id))}:{hex(UTF8(owner_operation_id))}:{hex(UTF8(event_type))}`. Hex is lowercase byte-preserving encoding, not hashing or normalization. Storage’s partition is `app` or `project~{base64url_no_pad(UTF8(project_id))}`; the scoped dedupe tuple remains (scope_partition,event_type,idempotency_key). Fields already present in the envelope are adopted by reference to Contracts_V0.md#EventRecord, never replaced by a local envelope.
6. **Replay/idempotency.** Freeze `replay_policy=dedupe_by_idempotency_key` and Contracts’ exact producer-semantic digest over only its named caller fields. Current write/retry refuses `projector_replay_only` as `replay_only_not_appendable` before success. Same identity/same digest resolves the original complete event and first receipt via `storage.first_append_receipt.resolve.v2`, even after current source state advances; changed digest conflicts, unavailable authoritative dedupe returns `dedupe_unavailable` with no new effect. Do not compare Storage sequence/timestamps as caller semantics. Missing delivered work after confirmed older restore stays unavailable; a new event ID never reconstructs a missing original operation. Event replay cannot rerun commands, timers, Compose, turns, effects, Usage charges or notifications.
7. **Retention.** Bind this exact event to `RP-AUTHORITY-INDEFINITE@1.0.0`, approved deck-1 Card 1 `G18` (DL-401). No TTL or count cap. For Project entries only explicit Delete Puppet Master project data removes this audit history under existing holds; Remove project from list, deleting a described object or deleting its chat does not. Application records retain the existing app-root custody/deletion rules, never a fabricated Project. Disk pressure refuses new records. Referenced bodies retain their own policies and access; this content-free event grants no longer retention or access to them. The canonical publication journal adopts this same `RP-AUTHORITY-INDEFINITE@1.0.0` assignment and all original pending/result/backup/hold dependencies under `SP-1573`; it is never a disposable index or independently expiring copy. SP-286 receipt custody keeps its own policy.
8. **Redaction/custody.** Use `secret_refs_only` for current events; verify all refs with the original owner’s access and no-secret rules. The sole native adapter must prove actual original issuance, full scope/key/source joins and complete before/after facts, not a copied source view. Storage owns canonical seglog, publication journal, first receipt/full-value proof and a coherent backup/restore closure with pending owner effect/result; restore fences unresolved origin or tombstone state. Reads recheck current permission/deletion while authenticating original admission/recipe/receipt. They may show a valid retained fact after its live object changes or is gone, with unavailable linked body disclosed; they never reconstruct the body or require current state to equal a historical state. Unavailable or invalid source custody returns typed refusal, never fabricated empty success.
9. **Transitions.** The server Scheduling owner records entry into held with the exact failed clause or saved missed-time hold decision. The pending exact snapshot stays unchanged. Project/application pause remains distinct and unknown custody is unavailable, never off. Re-observing the same hold is no new change. Extra family-specific predicates: snapshot_exact: text/attachment/destination/runtime/model/account snapshot is exact, no re-derivation; dispatch_state: original state and expected revision permit held; dispatch_effect: source receipt proves held rather than request acceptance; dispatch_precedence: Stop/pause and both eligibility checks govern any send; no bypass from replay; dispatch_missed: server occurrence, IANA/DST and recorded hold/next_available/cancel_after_grace apply with no backlog burst. False/no-op/rejected results emit no successful mutation fact. Compound owner changes preserve all required facts and canonical visibility atomically; no partly admitted subset claims to be complete. Cross-owner original records remain owned by their respective source owners.
10. **Consumers/checkpoints.** The exact read-only operating consumer is `storage.w3h.scheduled_dispatch_held.recovery_read.v1@1.0.0`, called by `SchedulingService` for existing original-result/restart inspection; it never reconstructs or changes canonical domain state from events. It explicitly adopts SP-278 and `reader.storage.event_record_index@1.0.0`: resolve CURRENT, authentic root/generation/anchor/frontier/dataset and complete source selection in one live transaction, authenticate the complete captured range and every matching source/payload, then filter exact partition+`scheduled_dispatch.held`. Unsupported/corrupt/missing source is unavailable, never skipped as empty. SP-278 alone owns the generic checkpoint’s whole-value CAS, monotonic frontier and rebuild. This read-only family owns **no projector, projection or independent durable checkpoint** (`checkpoint_disposition=none_required`): zero durable reader effects. Any persisted SP-278 token remains its nine durable fields (DL-076); join the transaction’s live redb_snapshot_id only in memory and revalidate the complete live token after every helper immediately before disclosure. Empty verified range, zero matching events and missing coverage are distinct. Reader withdrawal fences interpretation. No current continuation/dispatch authority comes from this history read.
11. **Compatibility/withdrawal.** No alias, automatic legacy converter or historical emission is asserted for this newly prepared family. Preserve actual old admitted shapes and original recipes only when authenticated original issuance selects them; schema/version/recipe/source substitution or unknown selection refuses. Unsupported future versions never mutate. Writer withdrawal first cuts off this exact family/source edition under append lock, fences new prepares and append drains, and preserves pending accepted effects as unresolved custody. Exact retained-result lookup is read-only and needs authorized retained admission. Reader withdrawal stops interpretation and generic-index filtered reads for this family; it never deletes source or dedupe/receipt custody. Generic-index rebuilding excludes withdrawn interpretation and carries truthful coverage; re-enablement needs explicit reviewed version/source adoption, not a replay alias. Current live guards do not retroactively invalidate otherwise valid retained originals.
12. **Oracles.** `scheduled_dispatch.held` has its own positive, schema, source, identity, retry, receipt, retention/access, transition, token and withdrawal plan in `reports/event-authority-20261105/W3H-oracle-plan.json`. Every planned negative starts from a valid case and changes one input invariant, with all unrelated derived values recomputed. No oracle implementation or guard-removal proof is claimed in phase 1: criterion 12 **PARTIAL**, native **NOT_RUN**. Phase 2 adopts the reviewed shared numeric/time helper and shared guard-isolation tool before Sol/Astra review.

ContractRef: ContractName:Plans/Contracts_V0.md#EventRecord, ContractName:Plans/Contracts_V0.md#CV-1573, ContractName:Plans/storage-plan.md#SP-1573, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286

## SQR-1574 — `scheduled_dispatch.updated`: newly authored owner contract, prepared without admission

```yaml
plan_unit_id: SQR-1574
unit_type: interface_contract
status: accepted
owner_doc: Plans/Scheduling_and_Quota_Resume.md
canonical_text: 'For exactly scheduled_dispatch.updated@1.0.0, the adjacent twelve-criterion contract binds the
  already specified fact: cmd.chat.schedule_message.update commits an actual revision of a scheduled or held message
  before dispatch starts. Edit/send/reschedule and Send now reuse this command. Send now is reschedule_to now for
  this one user dispatch only; scope pause remains on and every other predicate still applies. No implicit destination
  or route substitution. Newly authored technical bindings follow deck-1 4b A (DL-411) and the documented exact-family
  search. Registry membership stays absent; criterion 12 remains PARTIAL until phase 2.'
gui_related: false
gui_classification_reason: Persisted semantic facts and source/recovery contracts only; existing presentation owners
  remain authoritative.
depends_on:
- SQR-002
- SQR-006
- SQR-007
- SQR-019
unblocks: []
acceptance_criteria:
- This exact family stays prepared without admission and retains each original owner boundary.
- Closed payload, authentic original source joins, receipt custody and read-only recovery satisfy the adjacent family-specific
  contract.
- Phase 2 must implement and prove every planned guard before criterion 12 can pass.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- reports/event-authority-20261105/W3H-oracle-plan.json
risk_class: event_source_identity_or_replay_drift
reasoning_tier: high
context_scope: event_authority_w3h_phase1
implementation_surfaces:
- Plans/Scheduling_and_Quota_Resume.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- E-CARDS-1 4b A (DL-411); exact original answer and deck SHA-256 in reports/event-authority-20261105/W3H.md
- reports/event-authority-20261105/W3H-search-evidence.json
preserved_exact_tokens:
- scheduled_dispatch.updated
- prepared_without_admission
negative_constraints:
- No event admission, registry family append, Decision Log mutation, new feature or changed deletion rule.
- No local numeric/timestamp codec or proof machinery; adopt reviewed shared foundations in phase 2.
owner_hints:
- Plans/Scheduling_and_Quota_Resume.md
```

1. **Membership/version.** `scheduled_dispatch.updated@1.0.0` is a candidate only, with no registry append, admission record or native writer. All current paths return `missing_event_registration` until this exact family/source edition is admitted; siblings grant nothing.
2. **Owner.** This unit owns the semantic fact: cmd.chat.schedule_message.update commits an actual revision of a scheduled or held message before dispatch starts. Edit/send/reschedule and Send now reuse this command. Send now is reschedule_to now for this one user dispatch only; scope pause remains on and every other predicate still applies. No implicit destination or route substitution. Reuse SQR-002, SQR-006, SQR-007, SQR-019; payload binding is CV-1574, persistence is SP-1574.
3. **Producer.** Sole producer `SchedulingService::scheduled_dispatch_updated` calls `storage.w3h.scheduled_dispatch_updated.append.v1@1.0.0`. Source is SQR-002/006/007 exact ScheduledMessageSnapshot and its original updated source receipt; selected original Project custody or SQR-019/SP-352 application source. The source adapter methods `prepare_scheduled_dispatch_updated`, `commit_scheduled_dispatch_updated`, `resolve_scheduled_dispatch_updated_original` are newly authored interfaces of that owner, not installed handlers. Verify actual before/after source identity, genuine original receipt/result and permissions before committing the existing owner effect plus its publication journal atomically; save the exact semantic envelope and payload once. Drain the pending event via ordinary Storage append, explicitly adopting SP-286/CV-339 first-AppendReceipt **full-value v2** custody and SP-336/347 durability classes; then CAS prepared→appended→settled using the exact prior whole journal value. Domain success acknowledgement waits for the original body result and first event receipt; dependent dispatch/terminal publication waits for required receipts. A crash after body commit preserves the body and pending publication, never rolls it back or repeats the domain effect. The missing-registration gate acts before new event preparation and confers no native authority on existing result-only paths.
4. **Payload.** `Plans/event_payloads/w3h/scheduled_dispatch_updated.schema.json#/$defs/payload` is this family’s closed 1.0.0 schema. Every source field is compared to the genuine original owner result, not a caller-supplied matching snapshot. Required source refs resolve to exact original typed records/results at one consistent snapshot; a ref, hash or all-true assertion alone proves no acceptance. Current numeric/format rules come from EventRecord/CV-317, original source owners and the reviewed shared number/time foundation at phase 2; no new numeric limit or timestamp grammar is authored here. No objective/message/To-Do/compose/env-file body or secret is copied.
5. **Scope/identity.** Scope is `application_or_project`. `project_id`, actual Server and thread match the original source and EventRecord; absent Project means explicit application only where an app source is selected, never dangling Project or current focus. For the app pause source thread remains null and no fake thread/Computer/roots request is required. The original owner allocates one lifetime-unique immutable effect ID from its genuine accepted operation, with the declared component `scheduled_dispatch.updated` and exact `scheduled_dispatch_id` included before issuance. That frozen ID is `owner_operation_id`; batch/list operations allocate a separate component for each item. It survives retry and is never reminted from a timer or callback. Project key is `w3h@1:{hex(UTF8(owner_operation_id))}`. Application key, only for the explicitly selected app source, is exactly CV-366 `application@1:{hex(server_id)}:{hex(owner_operation_id)}`; no suffix is appended. Event ID is `w3h@1:{hex(UTF8(storage_instance_id))}:{hex(UTF8(owner_operation_id))}:{hex(UTF8(event_type))}`. Hex is lowercase byte-preserving encoding, not hashing or normalization. Storage’s partition is `app` or `project~{base64url_no_pad(UTF8(project_id))}`; the scoped dedupe tuple remains (scope_partition,event_type,idempotency_key). Fields already present in the envelope are adopted by reference to Contracts_V0.md#EventRecord, never replaced by a local envelope.
6. **Replay/idempotency.** Freeze `replay_policy=dedupe_by_idempotency_key` and Contracts’ exact producer-semantic digest over only its named caller fields. Current write/retry refuses `projector_replay_only` as `replay_only_not_appendable` before success. Same identity/same digest resolves the original complete event and first receipt via `storage.first_append_receipt.resolve.v2`, even after current source state advances; changed digest conflicts, unavailable authoritative dedupe returns `dedupe_unavailable` with no new effect. Do not compare Storage sequence/timestamps as caller semantics. Missing delivered work after confirmed older restore stays unavailable; a new event ID never reconstructs a missing original operation. Event replay cannot rerun commands, timers, Compose, turns, effects, Usage charges or notifications.
7. **Retention.** Bind this exact event to `RP-AUTHORITY-INDEFINITE@1.0.0`, approved deck-1 Card 1 `G18` (DL-401). No TTL or count cap. For Project entries only explicit Delete Puppet Master project data removes this audit history under existing holds; Remove project from list, deleting a described object or deleting its chat does not. Application records retain the existing app-root custody/deletion rules, never a fabricated Project. Disk pressure refuses new records. Referenced bodies retain their own policies and access; this content-free event grants no longer retention or access to them. The canonical publication journal adopts this same `RP-AUTHORITY-INDEFINITE@1.0.0` assignment and all original pending/result/backup/hold dependencies under `SP-1574`; it is never a disposable index or independently expiring copy. SP-286 receipt custody keeps its own policy.
8. **Redaction/custody.** Use `secret_refs_only` for current events; verify all refs with the original owner’s access and no-secret rules. The sole native adapter must prove actual original issuance, full scope/key/source joins and complete before/after facts, not a copied source view. Storage owns canonical seglog, publication journal, first receipt/full-value proof and a coherent backup/restore closure with pending owner effect/result; restore fences unresolved origin or tombstone state. Reads recheck current permission/deletion while authenticating original admission/recipe/receipt. They may show a valid retained fact after its live object changes or is gone, with unavailable linked body disclosed; they never reconstruct the body or require current state to equal a historical state. Unavailable or invalid source custody returns typed refusal, never fabricated empty success.
9. **Transitions.** cmd.chat.schedule_message.update commits an actual revision of a scheduled or held message before dispatch starts. Edit/send/reschedule and Send now reuse this command. Send now is reschedule_to now for this one user dispatch only; scope pause remains on and every other predicate still applies. No implicit destination or route substitution. Extra family-specific predicates: snapshot_exact: text/attachment/destination/runtime/model/account snapshot is exact, no re-derivation; dispatch_state: original state and expected revision permit updated; dispatch_effect: source receipt proves updated rather than request acceptance; dispatch_precedence: Stop/pause and both eligibility checks govern any send; no bypass from replay; dispatch_missed: server occurrence, IANA/DST and recorded hold/next_available/cancel_after_grace apply with no backlog burst. False/no-op/rejected results emit no successful mutation fact. Compound owner changes preserve all required facts and canonical visibility atomically; no partly admitted subset claims to be complete. Cross-owner original records remain owned by their respective source owners.
10. **Consumers/checkpoints.** The exact read-only operating consumer is `storage.w3h.scheduled_dispatch_updated.recovery_read.v1@1.0.0`, called by `SchedulingService` for existing original-result/restart inspection; it never reconstructs or changes canonical domain state from events. It explicitly adopts SP-278 and `reader.storage.event_record_index@1.0.0`: resolve CURRENT, authentic root/generation/anchor/frontier/dataset and complete source selection in one live transaction, authenticate the complete captured range and every matching source/payload, then filter exact partition+`scheduled_dispatch.updated`. Unsupported/corrupt/missing source is unavailable, never skipped as empty. SP-278 alone owns the generic checkpoint’s whole-value CAS, monotonic frontier and rebuild. This read-only family owns **no projector, projection or independent durable checkpoint** (`checkpoint_disposition=none_required`): zero durable reader effects. Any persisted SP-278 token remains its nine durable fields (DL-076); join the transaction’s live redb_snapshot_id only in memory and revalidate the complete live token after every helper immediately before disclosure. Empty verified range, zero matching events and missing coverage are distinct. Reader withdrawal fences interpretation. No current continuation/dispatch authority comes from this history read.
11. **Compatibility/withdrawal.** No alias, automatic legacy converter or historical emission is asserted for this newly prepared family. Preserve actual old admitted shapes and original recipes only when authenticated original issuance selects them; schema/version/recipe/source substitution or unknown selection refuses. Unsupported future versions never mutate. Writer withdrawal first cuts off this exact family/source edition under append lock, fences new prepares and append drains, and preserves pending accepted effects as unresolved custody. Exact retained-result lookup is read-only and needs authorized retained admission. Reader withdrawal stops interpretation and generic-index filtered reads for this family; it never deletes source or dedupe/receipt custody. Generic-index rebuilding excludes withdrawn interpretation and carries truthful coverage; re-enablement needs explicit reviewed version/source adoption, not a replay alias. Current live guards do not retroactively invalidate otherwise valid retained originals.
12. **Oracles.** `scheduled_dispatch.updated` has its own positive, schema, source, identity, retry, receipt, retention/access, transition, token and withdrawal plan in `reports/event-authority-20261105/W3H-oracle-plan.json`. Every planned negative starts from a valid case and changes one input invariant, with all unrelated derived values recomputed. No oracle implementation or guard-removal proof is claimed in phase 1: criterion 12 **PARTIAL**, native **NOT_RUN**. Phase 2 adopts the reviewed shared numeric/time helper and shared guard-isolation tool before Sol/Astra review.

ContractRef: ContractName:Plans/Contracts_V0.md#EventRecord, ContractName:Plans/Contracts_V0.md#CV-1574, ContractName:Plans/storage-plan.md#SP-1574, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286

## SQR-1565 — `runtime.automation_pause_changed`: newly authored owner contract, prepared without admission

```yaml
plan_unit_id: SQR-1565
unit_type: interface_contract
status: accepted
owner_doc: Plans/Scheduling_and_Quota_Resume.md
canonical_text: 'For exactly runtime.automation_pause_changed@1.0.0, the adjacent twelve-criterion contract binds
  the already specified fact: Only an authorized user’s real absolute-value change of the named Project or app/Server
  pause emits once. Same-value set returns the unchanged original result, no event/revision/epoch change. The original
  source supplies paused, user_stop_epoch, actor and changed time: true advances the selected scope epoch, false
  clears only that scope and preserves per-run Stop. No Settings default, missing-as-off, automatic clear, no-op
  event or backlog dispatch. Project request still has no expected_revision; application uses its existing internal
  whole-value CAS and unavailable/null-pause branch. Newly authored technical bindings follow deck-1 4b A (DL-411)
  and the documented exact-family search. Registry membership stays absent; criterion 12 remains PARTIAL until phase
  2.'
gui_related: false
gui_classification_reason: Persisted semantic facts and source/recovery contracts only; existing presentation owners
  remain authoritative.
depends_on:
- SQR-018
- SQR-020
- CS-114
- CV-368
- SP-323
- SP-352
unblocks: []
acceptance_criteria:
- This exact family stays prepared without admission and retains each original owner boundary.
- Closed payload, authentic original source joins, receipt custody and read-only recovery satisfy the adjacent family-specific
  contract.
- Phase 2 must implement and prove every planned guard before criterion 12 can pass.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- reports/event-authority-20261105/W3H-oracle-plan.json
risk_class: event_source_identity_or_replay_drift
reasoning_tier: high
context_scope: event_authority_w3h_phase1
implementation_surfaces:
- Plans/Scheduling_and_Quota_Resume.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- E-CARDS-1 4b A (DL-411); exact original answer and deck SHA-256 in reports/event-authority-20261105/W3H.md
- reports/event-authority-20261105/W3H-search-evidence.json
preserved_exact_tokens:
- runtime.automation_pause_changed
- prepared_without_admission
negative_constraints:
- No event admission, registry family append, Decision Log mutation, new feature or changed deletion rule.
- No local numeric/timestamp codec or proof machinery; adopt reviewed shared foundations in phase 2.
owner_hints:
- Plans/Scheduling_and_Quota_Resume.md
```

1. **Membership/version.** `runtime.automation_pause_changed@1.0.0` is a candidate only, with no registry append, admission record or native writer. All current paths return `missing_event_registration` until this exact family/source edition is admitted; siblings grant nothing.
2. **Owner.** This unit owns the semantic fact: Only an authorized user’s real absolute-value change of the named Project or app/Server pause emits once. Same-value set returns the unchanged original result, no event/revision/epoch change. The original source supplies paused, user_stop_epoch, actor and changed time: true advances the selected scope epoch, false clears only that scope and preserves per-run Stop. No Settings default, missing-as-off, automatic clear, no-op event or backlog dispatch. Project request still has no expected_revision; application uses its existing internal whole-value CAS and unavailable/null-pause branch. Reuse SQR-018, SQR-020, CS-114, CV-368, SP-323, SP-352; payload binding is CV-1565, persistence is SP-1565.
3. **Producer.** Sole producer `handlers::scheduling::automation_pause_set` calls `storage.w3h.runtime_automation_pause_changed.append.v1@1.0.0`. Source is SQR-018/SP-323 Project pause original command result or SQR-020/CV-368/SP-352 application/Server original whole-value CAS receipt. The source adapter methods `prepare_runtime_automation_pause_changed`, `commit_runtime_automation_pause_changed`, `resolve_runtime_automation_pause_changed_original` are newly authored interfaces of that owner, not installed handlers. Verify actual before/after source identity, genuine original receipt/result and permissions before committing the existing owner effect plus its publication journal atomically; save the exact semantic envelope and payload once. Drain the pending event via ordinary Storage append, explicitly adopting SP-286/CV-339 first-AppendReceipt **full-value v2** custody and SP-336/347 durability classes; then CAS prepared→appended→settled using the exact prior whole journal value. Domain success acknowledgement waits for the original body result and first event receipt; dependent dispatch/terminal publication waits for required receipts. A crash after body commit preserves the body and pending publication, never rolls it back or repeats the domain effect. The missing-registration gate acts before new event preparation and confers no native authority on existing result-only paths.
4. **Payload.** `Plans/event_payloads/w3h/runtime_automation_pause_changed.schema.json#/$defs/payload` is this family’s closed 1.0.0 schema. Every source field is compared to the genuine original owner result, not a caller-supplied matching snapshot. Required source refs resolve to exact original typed records/results at one consistent snapshot; a ref, hash or all-true assertion alone proves no acceptance. Current numeric/format rules come from EventRecord/CV-317, original source owners and the reviewed shared number/time foundation at phase 2; no new numeric limit or timestamp grammar is authored here. No objective/message/To-Do/compose/env-file body or secret is copied.
5. **Scope/identity.** Scope is `application_or_project`. `project_id`, actual Server and thread match the original source and EventRecord; absent Project means explicit application only where an app source is selected, never dangling Project or current focus. For the app pause source thread remains null and no fake thread/Computer/roots request is required. The original owner allocates one lifetime-unique immutable effect ID from its genuine accepted operation, with the declared component `runtime.automation_pause_changed` and exact `pause_record_ref` included before issuance. That frozen ID is `owner_operation_id`; batch/list operations allocate a separate component for each item. It survives retry and is never reminted from a timer or callback. Project key is `w3h@1:{hex(UTF8(owner_operation_id))}`. Application key, only for the explicitly selected app source, is exactly CV-366 `application@1:{hex(server_id)}:{hex(owner_operation_id)}`; no suffix is appended. Event ID is `w3h@1:{hex(UTF8(storage_instance_id))}:{hex(UTF8(owner_operation_id))}:{hex(UTF8(event_type))}`. Hex is lowercase byte-preserving encoding, not hashing or normalization. Storage’s partition is `app` or `project~{base64url_no_pad(UTF8(project_id))}`; the scoped dedupe tuple remains (scope_partition,event_type,idempotency_key). Fields already present in the envelope are adopted by reference to Contracts_V0.md#EventRecord, never replaced by a local envelope.
6. **Replay/idempotency.** Freeze `replay_policy=dedupe_by_idempotency_key` and Contracts’ exact producer-semantic digest over only its named caller fields. Current write/retry refuses `projector_replay_only` as `replay_only_not_appendable` before success. Same identity/same digest resolves the original complete event and first receipt via `storage.first_append_receipt.resolve.v2`, even after current source state advances; changed digest conflicts, unavailable authoritative dedupe returns `dedupe_unavailable` with no new effect. Do not compare Storage sequence/timestamps as caller semantics. Missing delivered work after confirmed older restore stays unavailable; a new event ID never reconstructs a missing original operation. Event replay cannot rerun commands, timers, Compose, turns, effects, Usage charges or notifications.
7. **Retention.** Bind this exact event to `RP-AUTHORITY-INDEFINITE@1.0.0`, approved deck-1 Card 1 `G18` (DL-401). No TTL or count cap. For Project entries only explicit Delete Puppet Master project data removes this audit history under existing holds; Remove project from list, deleting a described object or deleting its chat does not. Application records retain the existing app-root custody/deletion rules, never a fabricated Project. Disk pressure refuses new records. Referenced bodies retain their own policies and access; this content-free event grants no longer retention or access to them. The canonical publication journal adopts this same `RP-AUTHORITY-INDEFINITE@1.0.0` assignment and all original pending/result/backup/hold dependencies under `SP-1565`; it is never a disposable index or independently expiring copy. SP-286 receipt custody keeps its own policy.
8. **Redaction/custody.** Use `secret_refs_only` for current events; verify all refs with the original owner’s access and no-secret rules. The sole native adapter must prove actual original issuance, full scope/key/source joins and complete before/after facts, not a copied source view. Storage owns canonical seglog, publication journal, first receipt/full-value proof and a coherent backup/restore closure with pending owner effect/result; restore fences unresolved origin or tombstone state. Reads recheck current permission/deletion while authenticating original admission/recipe/receipt. They may show a valid retained fact after its live object changes or is gone, with unavailable linked body disclosed; they never reconstruct the body or require current state to equal a historical state. Unavailable or invalid source custody returns typed refusal, never fabricated empty success.
9. **Transitions.** Only an authorized user’s real absolute-value change of the named Project or app/Server pause emits once. Same-value set returns the unchanged original result, no event/revision/epoch change. The original source supplies paused, user_stop_epoch, actor and changed time: true advances the selected scope epoch, false clears only that scope and preserves per-run Stop. No Settings default, missing-as-off, automatic clear, no-op event or backlog dispatch. Project request still has no expected_revision; application uses its existing internal whole-value CAS and unavailable/null-pause branch. Extra family-specific predicates: pause_user: actual original actor is the authorized user; pause_changed: actual previous paused differs; no-op emits nothing; pause_epoch: epoch and revision equal actual selected scope record; pause_scope: Project versus application Server latch is exact and independent; pause_no_dispatch: clearing dispatches nothing and clears no per-run Stop. False/no-op/rejected results emit no successful mutation fact. Compound owner changes preserve all required facts and canonical visibility atomically; no partly admitted subset claims to be complete. Cross-owner original records remain owned by their respective source owners.
10. **Consumers/checkpoints.** The exact read-only operating consumer is `storage.w3h.runtime_automation_pause_changed.recovery_read.v1@1.0.0`, called by `handlers` for existing original-result/restart inspection; it never reconstructs or changes canonical domain state from events. It explicitly adopts SP-278 and `reader.storage.event_record_index@1.0.0`: resolve CURRENT, authentic root/generation/anchor/frontier/dataset and complete source selection in one live transaction, authenticate the complete captured range and every matching source/payload, then filter exact partition+`runtime.automation_pause_changed`. Unsupported/corrupt/missing source is unavailable, never skipped as empty. SP-278 alone owns the generic checkpoint’s whole-value CAS, monotonic frontier and rebuild. This read-only family owns **no projector, projection or independent durable checkpoint** (`checkpoint_disposition=none_required`): zero durable reader effects. Any persisted SP-278 token remains its nine durable fields (DL-076); join the transaction’s live redb_snapshot_id only in memory and revalidate the complete live token after every helper immediately before disclosure. Empty verified range, zero matching events and missing coverage are distinct. Reader withdrawal fences interpretation. No current continuation/dispatch authority comes from this history read.
11. **Compatibility/withdrawal.** No alias, automatic legacy converter or historical emission is asserted for this newly prepared family. Preserve actual old admitted shapes and original recipes only when authenticated original issuance selects them; schema/version/recipe/source substitution or unknown selection refuses. Unsupported future versions never mutate. Writer withdrawal first cuts off this exact family/source edition under append lock, fences new prepares and append drains, and preserves pending accepted effects as unresolved custody. Exact retained-result lookup is read-only and needs authorized retained admission. Reader withdrawal stops interpretation and generic-index filtered reads for this family; it never deletes source or dedupe/receipt custody. Generic-index rebuilding excludes withdrawn interpretation and carries truthful coverage; re-enablement needs explicit reviewed version/source adoption, not a replay alias. Current live guards do not retroactively invalidate otherwise valid retained originals.
12. **Oracles.** `runtime.automation_pause_changed` has its own positive, schema, source, identity, retry, receipt, retention/access, transition, token and withdrawal plan in `reports/event-authority-20261105/W3H-oracle-plan.json`. Every planned negative starts from a valid case and changes one input invariant, with all unrelated derived values recomputed. No oracle implementation or guard-removal proof is claimed in phase 1: criterion 12 **PARTIAL**, native **NOT_RUN**. Phase 2 adopts the reviewed shared numeric/time helper and shared guard-isolation tool before Sol/Astra review.

ContractRef: ContractName:Plans/Contracts_V0.md#EventRecord, ContractName:Plans/Contracts_V0.md#CV-1565, ContractName:Plans/storage-plan.md#SP-1565, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286
