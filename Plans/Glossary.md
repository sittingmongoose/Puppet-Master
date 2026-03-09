# Glossary (Canonical)

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.


<!--
PUPPET MASTER -- CANONICAL TERMINOLOGY

ABSOLUTE NAMING RULE:
- Platform name is "Puppet Master" only.
- If older naming exists, refer to it only as "legacy naming" (do not quote it).
-->

## 0. Scope
This glossary defines canonical terms used across plan documents.
It exists to prevent drift and synonym creep.

ContractRef: Primitive:Glossary

---

## 1. Canonical platform name
- **Puppet Master** -- the only correct platform name.
- **legacy naming** -- the only allowed way to refer to older platform naming.

ContractRef: Invariant:INV-010

---

## 2. Core terms

### Runtime orchestration and recovery terms
- **Scheduler pass** -- one deterministic queue-analysis and dispatch cycle. Each pass refreshes readiness, blocked/backoff state, available capacity, score breakdowns, and selected nodes before dispatching work.
- **Ready set** -- the full set of nodes that are currently dispatch-eligible after dependency checks, blocker checks, backoff checks, generation validity checks, and capacity-lane eligibility checks have been applied.
- **Scheduler lane** -- the canonical dispatch class used as the first scheduler score term. MVP lane order is `remediation > unblocker > normal`.
- **Scheduler score tuple** -- the ordered selection tuple `(scheduler_lane, manual_priority, transitive_unblock_count, ready_since_utc, node_id)` used to choose ready nodes deterministically.
- **Wake reason** -- the canonical reason queue analysis reran. Examples include node completion, approval resolution, clarification resolution, backoff expiry, remediation completion, replan patch application, restore/recovery completion, auth recovery, and capacity changes.
- **Queue analysis** -- the emitted runtime/projection record for one scheduler pass. It includes the ready set, selected nodes, score breakdowns, capacity state, and `non_selected_reason` for ready nodes that were not dispatched.
- **Blocked** -- a canonical runtime, node, or thread state meaning execution cannot continue automatically until an external condition is resolved. `blocked` is not a synonym for `failed`.
- **attention_required** -- a canonical state meaning clarification or user review is required but the current flow is still active. It is distinct from `blocked`; repeated unresolved clarification escalation eventually becomes `blocked`.
- **Blocked reason code** -- the canonical explanation for why a node/thread/run is blocked, such as `permission_denied`, `user_declined`, `headless_ask_denied`, `filesafe_blocked`, `external_side_effect_blocked`, `auth_expired`, or `replan_required`.
- **Failure class** -- the canonical classification of an attempt outcome used to drive retry, backoff, remediation, escalation, and user recovery behavior.
- **Blocked outcome** -- an intentionally non-executed or externally prevented outcome that preserves completed local work and surfaces recovery options instead of being treated as a generic execution failure.
- **Safe point** -- a runtime-internal recovery anchor created before mutation-capable attempts and remediation apply steps. Safe points preserve the pre-attempt baseline needed for deterministic retry/recovery.
- **Restore point** -- a user-facing history or rewind checkpoint. Restore points are distinct from runtime safe points and must not be conflated with scheduler recovery.
- **Remediation lineage** -- the canonical parent/child lineage that connects a failed attempt to automatic fix attempts, findings, superseded attempts, and final resolution.
- **Remediation child** -- a runtime child attempt spawned to fix or verify a specific failed parent attempt. It is not a loose task-board item.
- **Replan generation** -- the monotonic identifier for the active canonical graph/spec generation. Runtime attempts, safe points, and recovery decisions must be checked against the active generation.
- **Graph lock** -- the boundary after which the canonical graph is fixed. Graceful draft-decomposition degradation is allowed only before graph lock; post-lock integrity failures must not silently degrade.
- **Non-selected reason** -- the canonical reason a ready node was not dispatched in a scheduler pass, such as lower score, capacity exhaustion, lane reservation, or equivalent deterministic queue policy.

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/chain-wizard-flexibility.md, ContractName:Plans/Run_Graph_View.md

- **Session** -- user-facing term for one interactive run context.
  - Note: persisted events may contain a field named `thread_id` for correlation, but user-facing text MUST say "Session".
- **Provider** -- an external AI platform integration (Cursor, Claude Code, OpenCode, Codex, GitHub Copilot, Gemini).
- **Tool** -- a host capability invoked by Puppet Master (filesystem, shell, network fetch, etc) under policy.
- **UICommand** -- a stable command ID dispatched by the UI to trigger non-trivial logic.
- **ContractRef** -- a citation that binds an operational requirement to a canonical contract, schema, policy, invariant, or primitive.
- **Overseer** -- the AI foreman role inside the Orchestrator. Responsibilities (docs-only): (1) Determines readiness at tier boundaries (Phase/Task/Subtask/Iteration). (2) Selects the next unit of work (chunk/node) deterministically. (3) Spawns Builder subagents to implement work. (4) Runs deterministic verifier checks (scripts/tests/greps). (5) Performs semantic/subjective audits at the start/end of tiers: start-of-tier scans for gaps/undefined refs/drift (auto-fix if safe, else human-visible alert); end-of-tier convergence scan (if concerns, spawn 2 reviewer subagents; escalate only if reviewers agree). (6) Stops on FAIL and surfaces evidence and next action.

ContractRef: ContractName:Contracts_V0.md#UICommand, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/orchestrator-subagent-integration.md

---

## 3. Anti-drift documents
- **Spec Lock** -- `Plans/Spec_Lock.json`; locked decisions that MUST NOT drift.
- **Crosswalk** -- `Plans/Crosswalk.md`; ownership boundaries for primitives.
- **Progression gates** -- `Plans/Progression_Gates.md`; deterministic verification requirements.

ContractRef: SchemaID:Spec_Lock.json, Gate:GATE-003, Gate:GATE-009, PolicyRule:Decision_Policy.md§1

---

## 4. Evidence
- **Evidence bundle** -- a structured record of commands/checks/artifacts that demonstrates a requirement is met.

ContractRef: SchemaID:evidence.schema.json

---

## 5. Secret handling
- **Secret** -- any credential/token or material that could authenticate/authorize.
- **Credential store** -- OS-backed keychain/credential manager; the only allowed persistence for secrets.

ContractRef: Invariant:INV-002

---

## 6. Primitives

### DRYRules
The reuse-first methodology and tagging system (DRY:WIDGET, DRY:DATA, DRY:FN, DRY:HELPER) used to prevent code duplication. Canonical definition in Plans/DRY_Rules.md. Referenced by ContractRef annotations throughout plan documents.

ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md

### PatchPipeline
The Git + PR workflow pipeline covering worktrees, branches, commits, push, and hosting operations (fork, PR creation). Local git operations are owned by WorktreeGitImprovement.md; hosting operations are owned by GitHub_API_Auth_and_Flows.md per Spec_Lock.json#github_operations.

ContractRef: Primitive:PatchPipeline, ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/GitHub_API_Auth_and_Flows.md

### SessionStore
The persistent storage boundary for sessions, runs, events, and artifacts. Implementation uses seglog (append-only event ledger), redb (durable KV state/projections), and Tantivy (full-text search). Canonical definition in Plans/storage-plan.md. Secrets are forbidden (see PolicyRule:no_secrets_in_storage).

ContractRef: Primitive:SessionStore, ContractName:Plans/storage-plan.md, PolicyRule:no_secrets_in_storage

---

## References
- `Plans/Architecture_Invariants.md`
- `Plans/Contracts_V0.md`
- `Plans/Spec_Lock.json`
## Runtime Scheduler / Recovery Terminology Addendum (2026-03-09)

Confirm or add the following canonical terms:
- **attempt_id** -- the stable identity for one execution attempt of a node or remediation child
- **queue analysis** -- the scheduler-pass record describing ready nodes, selected nodes, score breakdowns, and non-selected reasons
- **wake reason** -- the canonical trigger for rerunning queue analysis
- **blocked outcome** -- a non-executed or externally prevented outcome that preserves work and exposes recovery actions instead of being treated as a generic failure
- **safe point** -- runtime-internal recovery anchor created before mutation-capable execution or remediation apply
- **restore point** -- user-facing history checkpoint distinct from safe points
- **remediation lineage** -- the parent/child chain connecting an originating failed attempt to automatic fix attempts and final resolution
- **graph lock** -- the boundary after which canonical graph integrity failures must not silently degrade to flat execution

Glossary definitions must match the packet's executor, storage, UI, and provider usage exactly.
## Runtime Packet Terminology Reconciliation Addendum (2026-03-09)

Add the following canonical terms:
- **Scheduler pass ID** -- the canonical identity for a queue-analysis pass; legacy `analysis_id` is an alias only
- **Allowed action ID** -- the canonical runtime action family surfaced by blocked or recovery state (`approve`, `decline`, `retry_now`, `resume_after_prerequisite`, `restore_safe_point_then_retry`, `start_fresh_attempt`, `replan`, `skip_node`, `abort_run`, `open_details`)
- **Graph canonical lock** -- the runtime boundary after which degraded draft decomposition fallback is forbidden
- **Stale attempt** -- a historical attempt from an older generation or superseded recovery branch that remains queryable but is not resumable
- **Prerequisite-resolved wake** -- the runtime wake caused by a prerequisite becoming satisfied (approval, clarification, permission, auth, replan, or worktree resolution)
- **Plugin hook blocked** -- a blocked runtime outcome caused by a plugin hook preventing progress; it is not a plugin-private warning path
- **Worktree conflict** -- a blocked runtime condition where worktree overlap, merge risk, or dirty baseline forbids safe dispatch or restore
## Runtime Scheduler Recovery Terminology Consolidation Addendum (2026-03-09)

Canonical terms:
- **Scheduler pass ID** -- canonical identity for one queue-analysis pass; legacy `analysis_id` is an alias only
- **Allowed action ID** -- canonical machine-readable runtime recovery action family exposed by blocked or recovery state
- **Blocked outcome** -- non-executed or externally prevented outcome that preserves work and exposes recovery actions instead of being treated as a generic failure
- **Safe point** -- runtime-internal recovery anchor created before mutation-capable execution or remediation apply
- **Restore point** -- user-facing history checkpoint distinct from runtime safe points
- **Stale attempt** -- historical attempt from an older generation or superseded recovery branch that remains queryable but not resumable
- **Graph canonical lock** -- runtime boundary after which degraded draft decomposition fallback is forbidden
- **attention_required** -- clarification or review is needed but the current flow can still continue inside the current surface
- **blocked** -- execution cannot continue automatically until a prerequisite changes or new explicit user input arrives

## Runtime Scheduler Audit Terminology Addendum

Add or normalize the following canonical terms:
- **Scheduler pass ID** -- canonical identity for queue-analysis passes; legacy `analysis_id` is alias-only
- **blocked_sequence** -- per-node monotonic blocked-episode counter
- **validation_blocked** -- blocked reason for post-execution validation failure
- **remediation_ceiling_exceeded** -- blocked reason indicating remediation ceiling reached
- **provider_attempt_ref** -- upstream provider/session identity distinct from runtime `attempt_id`
- **detail_ref** -- structured `{type}:{id}` reference used by blocked/remediation/safe-point records
- **thread_blocked_notice** -- persisted thread-scoped projection for one blocked episode
- **wizard blocked** -- canonical wizard state where automation cannot continue until prerequisite resolution or new explicit input
## Runtime Scheduler Audit Terminology Addendum

Add or normalize the following canonical terms:
- **Scheduler pass ID** -- canonical identity for queue-analysis passes; legacy `analysis_id` is alias-only
- **blocked_sequence** -- per-node monotonic blocked-episode counter
- **validation_blocked** -- blocked reason for post-execution validation failure
- **remediation_ceiling_exceeded** -- blocked reason indicating remediation ceiling reached
- **provider_attempt_ref** -- upstream provider/session identity distinct from runtime `attempt_id`
- **detail_ref** -- structured `{type}:{id}` reference used by blocked/remediation/safe-point records
- **thread_blocked_notice** -- persisted thread-scoped projection for one blocked episode
- **wizard blocked** -- canonical wizard state where automation cannot continue until prerequisite resolution or new explicit input
