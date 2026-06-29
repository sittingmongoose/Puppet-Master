# Shard 011: Canonical Runtime Scheduler Canonical Alignment (2026-03-09)

Source: `Plans/Executor_Protocol.md`

Source lines: L581-L665

Source SHA256: `6d326cb8cf496185f8105e4d13aff09945cacf1f9e7ff5767a6bb86c6cff62a9`

---

## Canonical Runtime Scheduler Canonical Alignment (2026-03-09)

Compatibility/source-lineage disposition: this historical canonical-alignment addendum preserves scheduler, blocked, score, and graph-lock tokens. Executor implementers must follow named owner sections and PlanUnits rather than treating adjacent addenda order as precedence.

This addendum is normative and supersedes earlier pure-lexicographic readiness and dispatch wording wherever conflicting.

### Runtime scheduler readiness reconciliation
A node is ready only when all of the following are true:
1. lifecycle state is ready-eligible for dispatch
2. every blocker resolves to an existing canonical node in the active graph
3. every resolved blocker is in a dependency-satisfying state
4. the node is not in active backoff
5. the node is not blocked by any active runtime projection
6. the node's `replan_generation` matches the active run generation
7. no worktree/conflict rule forbids dispatch
8. lane/pool capacity permits dispatch

Invalid blocker IDs are `graph_integrity` problems and keep the node non-ready.

### Node lifecycle versus runtime overlays
Node lifecycle remains the graph-progress contract.

Runtime overlays include blocked, backoff, retrying, remediation, and waiting-approval states.

Rules:
- overlays do not replace canonical node lifecycle values
- readiness consults both lifecycle state and active runtime overlays
- `waiting_approval` is represented through blocked/runtime records rather than by mutating node lifecycle taxonomy
- safe-point and remediation state likewise remain runtime overlays attached to attempts or blocked projections

This preserves one stable lifecycle contract for planning/graph semantics while allowing runtime recovery behavior to remain richly observable.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/human-in-the-loop.md

### Runtime scheduler score term definitions
The canonical score tuple is `(scheduler_lane, manual_priority, transitive_unblock_count, ready_since_utc, node_id)`.

Rules:
- `scheduler_lane = remediation` only for remediation lineage work
- `scheduler_lane = unblocker` when successful completion would increase the ready set for other nodes in the active generation
- `scheduler_lane = normal` otherwise
- `manual_priority` is an integer `0..100`; default `50`; higher wins
- `transitive_unblock_count` counts currently blocked descendants in the active generation that would become ready if this node completed successfully now; invalid/cyclic relationships are excluded
- `ready_since_utc` is reset whenever the node leaves the ready set for any reason and is retained only while the node stays continuously ready
- `node_id` is the final tiebreak only

### Capacity-aware dispatch cycle
For each scheduler wake:
1. refresh candidate runtime state
2. recompute readiness and score terms
3. synchronously reevaluate directly affected dependents for the current wake
4. build the global ready set
5. emit queue-analysis observability keyed by `scheduler_pass_id`
6. select up to `available_slots` in canonical score order
7. dispatch selected attempts

### Runtime blocked-to-runnable cascade timing
When a dependency completes or a blocking condition clears:
- direct dependents are reevaluated synchronously in the same wake cycle
- newly ready nodes enter the same ready set before dispatch completes
- no extra scheduler pass is required just to notice a direct unblock

### Class-driven next-step rules
- provider/model selection, worktree availability, and prerequisite readiness are resolved before dispatch begins.
- dirty-baseline, merge-conflict, approval, auth, or validation blockers surface through the canonical blocked-episode contract owned by `Plans/Contracts_V0.md`.
- class-driven follow-up never silently rewrites runtime identity, worktree ownership, or recovery posture.
- HTE and DAE execution paths share graph-lock and write-scope safety: `/generation` staleness, under-owned `/degradation`, cleanup-remediation loops, FileSafe bypass, side-effect and remote side-effect uncertainty, safe-point/restore-point conflicts, and projection trust failures surface as blocked/degraded/remediation classes rather than silent fallback.
- `node-blocked`, `wizard-blocked`, and thread-blocked projections keep family-local fields separate: node-blocked owns `blocked_sequence`, `attempt_id`, and `failure_class`; wizard-blocked may add clarification `/report` fields; `/persisted` thread notices remain rendered consumer state.
- Executor mints `blocked_sequence` when a HITL, auth, `/storage`, or recovery condition creates a blocked-episode; repeated updates keep the same `blocked_sequence`, and `request_id` is lineage or lookup metadata rather than a competing approval target.
- `startup_recovered` and startup-recovery handshakes restore the existing blocked-episode and `blocked_sequence` when one exists; recovery MUST NOT cause silent block-loss or accidental episode reminting.
- Reserved diagnostic schemas for execution, audit, handoff, and HITL events carry `attempt_id` and preserve attempt continuity as an architecture invariant.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/storage-plan.md

### Graph-lock boundary
Draft decomposition fallback is allowed only before `run.graph_canonical_locked`.
After that event:
- invalid canonical graph structure is `graph_integrity`
- execution MUST stop accepting new dispatches
- no silent flattening or degraded canonical execution is allowed
ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Progression_Gates.md, ContractName:Plans/chain-wizard-flexibility.md

### Runtime attempt identity rule
Every retry, resume-after-prerequisite, or safe-point-restored rerun creates a new `attempt_id`. Prior attempts remain immutable historical records.
After graph lock, execution MUST NOT fall back to a planning-artifact-centric, identity-blind, single-branch execution-model; DAE and orchestration paths preserve runtime identity plus `/corroboration/promotion/runtime` context.
