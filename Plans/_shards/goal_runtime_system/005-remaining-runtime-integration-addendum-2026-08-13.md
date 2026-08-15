# Shard 005: Remaining runtime integration addendum (2026-08-13)

Source: `Plans/Goal_Runtime_System.md`

Source lines: L120-L202

Source SHA256: `98f20b0efd0e4aa31dfe1f040025015df74c9bc088f94bf014e9a5615214ae8e`

---

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
