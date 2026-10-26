# Shard 057: Durable orchestration and sustainable-capacity addendum (2026-08-13)

Source: `Plans/orchestrator-subagent-integration.md`

Source lines: L31643-L31752

Source SHA256: `35d1512263810cd671e3c64529e82dd4eaee8b11fcf78a5b0aace7fc6c7328f4`

---

## Durable orchestration and sustainable-capacity addendum (2026-08-13)

Orchestrator consumes `Plans/Shared_Integration_Runtime.md` for connection/replay, durable thread-operation lifecycle, `RuntimeResourceGovernor`, `LeaseCoordinator`, `OperationalAwarenessService`, and `ObservableWork`. This document retains orchestration policy: child/agent identity, parent lineage, decomposition, capacity-aware waves, synthesis, verification, repair, and completion contribution. Shared runtime services must not become a second Orchestrator or Executor scheduler.

`thread.request`, `thread.spawn`, and `thread.await` semantics are durable and attributable even when final command IDs remain Commands-owner work. Each operation records stable operation identity, source/target thread refs, bounded task and reply contract, parent Goal/Plan/run/agent lineage, permission ceiling, currentness/idempotency, status/timestamps, result/evidence refs, Usage refs, and cancellation/restart disposition. Ordering is serial within a thread and parallel across unrelated threads; await uses shared wait state and never parks a dedicated OS thread. Child authority is equal to or narrower than the parent and cross-project access requires an explicit scoped grant.

Owner adjudication of the packet branch clause (2026-09-26): packet `PM_Full_Thread_Performance_Plans_PMConcept_Implementation_Packet_2026-08-08/02_FINAL_DECISION_REGISTER.md` §12 lists `thread.branch` beside `thread.spawn`, `thread.request`, and `thread.await` as durable logical operations with "copy-on-write branching where applicable". The branch clause is **deferred and unadmitted**. Current canon defines exactly three durable logical thread operations — this paragraph, OSI-433, OSI-435, and the central `cmd.thread.request`, `cmd.thread.spawn`, and `cmd.thread.await` family (`Plans/UI_Command_Catalog.md:11487-11489`, `Plans/Commands_System.md:4067-4069`) — and no owner prose establishes what an Orchestrator-level branch would target, its per-thread ordering/idempotency/restart identity, or its parent-lineage and permission-ceiling inheritance. The packet's own "where applicable" qualifier means the absence of a registered `cmd.thread.branch` proves neither a mechanical drop nor a retirement; neither is recorded, and missing spelling alone is never admission evidence. `cmd.chat.branch_from_restore` is an Assistant Chat restore-point application under `PD-RSP-08` (`Plans/assistant-chat-design.md:1226-1230`, catalog row `Plans/UI_Command_Catalog.md:8584`) that materializes a frozen conversation boundary into a new conversation thread/branch; it is not an Orchestrator copy-on-write thread branch and does not satisfy this clause. Exact future admission gate, all three in order: (1) a recorded owner adjudication here and in `Plans/Shared_Integration_Runtime.md` naming a concrete orchestration need that request/spawn/await cannot express and defining the branch target identity, per-thread ordering/idempotency/restart disposition, lineage, and child-equal-or-narrower permission inheritance; (2) central admission by the Commands owners — typed request/result contract, one `UI_Command_Catalog` row, one `Commands_System` row, one wiring row, one sole handler; (3) restart/replay/duplicate-branch contract fixtures. Until all three exist, no `cmd.thread.branch` command, alias, or handler may be registered by any owner.

Configured fan-out is a ceiling, not an admission target. Orchestrator computes sustainable concurrency from current provider/account/model permits, host/environment CPU/RAM/process capacity, worktree/file/port/browser/test/device leases, dependency readiness, cost/reset limits, and shared pressure policy. Provider permits are held only around provider request or stream production, not during a child's local work or lifetime. Parent synthesis, required testing, verification, repair, and the shared interactive/control reserve are protected before optional fan-out. Required independent specialists that cannot run together remain required and execute in bounded waves; resource pressure may delay or degrade them but never silently drops them.

Orchestrator consumes compact `OperationalAwarenessService` views for threads, Goals, runs, agents/Crews, write scopes, worktrees, processes, ports, services, containers/VMs/WSL, browser/test/debug/device sessions, host resources, provider allowance/reset, and recovery assets. Resource actions use typed signed/epoched leases; host-local enforcement may reject stale or infeasible grants. Windows/WSL and host/container/Kubernetes children consume the same physical-parent budget. Prompts receive only task-relevant projections and on-demand refs, never raw registries.

Every material orchestration phase, queue, wait, retry, degradation, verification, merge/integration, and recovery maps to shared `ObservableWork` with truthful reason and progress source. This projection is not scheduler, event, receipt, or completion authority.

BSD and Time-Travel conditional rules are optional consumers, not subagent authority. A BSD assignment uses the Run Modes effective policy and its own route/cursor/prefix/budget/health/Usage; a conditional rule comes from Prompt Pipeline. Both remain bounded and read-only, cannot widen child authority, cannot access protected `AuthBrowserSession`, and cannot satisfy required specialist, verifier, or certification roles. Failure or silence never blocks the primary orchestration lane.

### OSI-433 - Durable Thread And Agent Lineage Consumer

```yaml
plan_unit_id: OSI-433
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Orchestrator preserves durable source/target thread, Goal, Plan, run, parent/child agent, permission, request/reply, evidence, Usage, and restart lineage for thread request, spawn, and await operations while consuming shared runtime lifecycle and projection services. Await is non-blocking, cross-thread work may proceed concurrently, and child or cross-project authority never exceeds an explicit parent grant. The admitted operations remain thread.request, thread.spawn, and thread.await. The packet thread.branch clause for copy-on-write branching where applicable is deferred and unadmitted until the recorded owner target, lineage, permission ceiling, central contract, and restart/replay fixture gates are satisfied; Chat restore-point branching is distinct.
gui_related: false
gui_classification_reason: Durable orchestration lineage and authority are backend coordination semantics.
depends_on: [OSI-410, OSI-428, GRS-044]
unblocks: []
acceptance_criteria:
  - Restart/reconnect fixtures preserve request/spawn/await identity and do not duplicate child work.
  - Per-thread ordering does not serialize unrelated threads and await consumes no dedicated OS thread.
  - Child and cross-project requests fail closed above their explicit permission ceiling.
validation_surfaces: [python3 scripts/pm-plan-index.py validate, future durable thread-operation fixtures]
risk_class: durable_orchestration_lineage_drift
reasoning_tier: high
context_scope: durable_thread_agent_operations
implementation_surfaces: [Plans/orchestrator-subagent-integration.md, Plans/Shared_Integration_Runtime.md]
node_compile_hint: {mode: durable_orchestration_consumer_policy, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/02_T3_DURABLE_THREADS_NETWORK_AND_OUTBOX.md
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/05_BSD_TIME_TRAVEL_GOAL_AND_OPERATIONAL_AWARENESS.md
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/reference/ASSISTANT_CHAT_SHARED_CONTRACTS.md
  - PM_Full_Thread_Performance_Plans_PMConcept_Implementation_Packet_2026-08-08/02_FINAL_DECISION_REGISTER.md
preserved_exact_tokens: [thread.request, thread.spawn, thread.await, permission ceiling, thread.branch, where applicable, copy-on-write branching]
negative_constraints: [Do not park an OS thread for await., Do not widen child authority., Do not make prompts a hidden cross-thread state bus.]
owner_hints: [Plans/orchestrator-subagent-integration.md, Plans/Shared_Integration_Runtime.md, Plans/Goal_Runtime_System.md]
```

### OSI-434 - Sustainable Waves, Operational Awareness, And Truthful Work

```yaml
plan_unit_id: OSI-434
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Orchestrator admits sustainable capacity below hard concurrency ceilings, holds provider permits only around requests, reserves interactive control plus parent synthesis/testing/verification/repair, and runs required specialists in waves rather than dropping them. It consumes typed leases, compact OperationalAwarenessService projections, and ObservableWork without creating parallel owners or exposing raw registries to prompts.
gui_related: true
gui_classification_reason: Queue, wave, wait, degraded, and progress truth are projected to user-visible orchestration surfaces.
depends_on: [OSI-418, OSI-424, RM-051]
unblocks: []
acceptance_criteria:
  - Parent/child provider-permit deadlock, saturation, and physical-parent budget fixtures preserve reserve capacity.
  - Required specialists delayed by pressure run in later bounded waves and remain visible.
  - Stale leases are rejected locally and every wait has truthful ObservableWork reason/state.
  - BSD/conditional-rule silence or failure cannot satisfy required roles or block primary work.
validation_surfaces: [python3 scripts/pm-plan-index.py validate, future sustainable-wave and lease fixtures]
risk_class: orchestration_capacity_and_projection_drift
reasoning_tier: high
context_scope: sustainable_orchestration_capacity
implementation_surfaces: [Plans/orchestrator-subagent-integration.md, Plans/Run_Modes.md, Plans/Shared_Integration_Runtime.md]
node_compile_hint: {mode: sustainable_orchestration_policy, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/05_BSD_TIME_TRAVEL_GOAL_AND_OPERATIONAL_AWARENESS.md
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/09_TEST_MIGRATION_AND_ACCEPTANCE_MATRIX.md
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/reference/02_FULL_THREAD_CURRENT_DECISION_REGISTER.md
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/reference/T3_OMP_COMPLETE_SOURCE_REVIEW.md
preserved_exact_tokens: [sustainable concurrency, required specialists run in waves, ObservableWork, AuthBrowserSession]
negative_constraints: [Do not treat configured caps as guaranteed capacity., Do not drop required work under pressure., Do not create a second resource governor or progress owner.]
owner_hints: [Plans/orchestrator-subagent-integration.md, Plans/Run_Modes.md, Plans/Shared_Integration_Runtime.md]
```

### OSI-435 - Agent Requested Thread Operations

```yaml
plan_unit_id: OSI-435
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: Any admitted agent may request another thread or bounded child through the same durable thread.request, thread.spawn, and thread.await contracts, subject to its authority ceiling, exact parent lineage, policy, resource admission, and stable idempotency; the request survives restart and client loss, preserves per-thread order, and yields a typed accepted, rejected, cancelled, expired, failed, or reconciled result without granting the requester scheduler or cross-project authority.
gui_related: false
depends_on: [OSI-433, SIR-005, SIR-006]
unblocks: []
acceptance_criteria:
  - AGT-009 allows an agent request but not direct unmanaged process/thread creation.
  - AGT-010 search, read, request, spawn, and await retain distinct operations and permission checks.
  - AGT-011 persists request identity, parent/target refs, payload digest, result/evidence, and recovery disposition without duplicate child work.
validation_surfaces: [thread operation contract fixtures, restart and duplicate-request fixtures]
risk_class: agent_thread_authority_or_durability_drift
reasoning_tier: high
context_scope: agent_requested_thread_operations
implementation_surfaces: [Plans/orchestrator-subagent-integration.md, Plans/Shared_Integration_Runtime.md]
node_compile_hint: {mode: agent_thread_operation_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/ACCOUNTABILITY_MATRIX.json#AGT-009
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/ACCOUNTABILITY_MATRIX.json#AGT-010
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/ACCOUNTABILITY_MATRIX.json#AGT-011
negative_constraints: [Do not let an agent bypass Orchestrator admission., Do not widen cross-project authority., Do not duplicate child effects on retry.]
```
