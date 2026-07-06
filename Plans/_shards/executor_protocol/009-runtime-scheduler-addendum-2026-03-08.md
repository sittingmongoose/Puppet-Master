# Shard 009: Runtime Scheduler Addendum (2026-03-08)

Source: `Plans/Executor_Protocol.md`

Source lines: L267-L513

Source SHA256: `ad51db15b74f658c5d86f7204d117fc3082758dd357a2080095a1719f6845222`

---

## Runtime Scheduler Addendum (2026-03-08)

Compatibility/source-lineage disposition: this historical scheduler addendum preserves exact runtime tokens and earlier scheduling examples. Where it overlaps later named PlanUnits, Contracts_V0, Run_Modes, Models_System, storage-plan, or Wiring_Matrix ownership, those owner docs govern; do not infer precedence from this addendum's position.

This addendum supersedes any earlier lexical-dispatch wording wherever they conflict.

### 1. Canonical scheduler pass

The executor MUST process scheduling as a deterministic repeated pass:
ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md
1. Rebuild or refresh the candidate node set from canonical run state.
2. Recompute readiness for all candidate nodes.
3. Recompute blocked/backoff/capacity state.
4. Build the ready set.
5. Score ready nodes using the canonical ordered tuple.
6. Select as many nodes as available capacity permits.
7. Emit queue-analysis observability before dispatch.
8. Dispatch selected nodes.

### 2. Readiness rules

A node is ready only if all of the following are true:
- canonical node state is schedulable (`queued`, `reopened`, or equivalent ready-eligible state)
- every blocker in `blockers[]` has completed successfully or reached a state explicitly declared as dependency-satisfying
- no unresolved graph-integrity error exists for the node
- node is not in active backoff
- node is not blocked on HITL, clarification, external side-effect confirmation, permission denial, FileSafe, auth refresh, or replan-required state
- the node's plan/spec generation is still valid for the active `replan_generation`
- runtime capacity allows another dispatch in the applicable lane / pool

Invalid blocker IDs remain invalid graph input and MUST keep the node non-ready.
ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Progression_Gates.md, ContractName:Plans/Contracts_V0.md

### 3. Deterministic score tuple

The canonical ready-node selection tuple is:
- `scheduler_lane`
- `manual_priority`
- `transitive_unblock_count`
- `ready_since_utc`
- `node_id`

Normalization rules:
- `scheduler_lane` order is `remediation > unblocker > normal`
- larger `manual_priority` wins
- larger `transitive_unblock_count` wins
- older `ready_since_utc` wins
- lexicographically smaller `node_id` wins only as the final tiebreak

Required notes:
- no critical-path weighting term is part of MVP selection
- queue analysis MUST expose the tuple breakdown so the user can see why a node was chosen
- `ready_since_utc` is set when the node first enters the ready set after being non-ready; it is retained while the node stays continuously ready
ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Run_Graph_View.md, ContractName:Plans/Orchestrator_Page.md

### 4. Capacity-aware parallel dispatch

The executor MUST select up to `available_slots` nodes per scheduler pass.
ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Run_Graph_View.md

`available_slots` is derived from:
- run-level concurrency limit
- any active phase/task/subtask concurrency constraints
- resource / provider saturation limits
- remediation lane reservations when configured

Selection is global across the ready set, not level-by-level lexical dispatch.

### 5. Wakeup triggers

Canonical wake-trigger values and coalescing behavior are defined in `### Wake reasons and coalescing`.

This section is a forward-reference only so the wake-trigger canon has a single owner section in this file.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/FinalGUISpec.md

### 6. Blocked-to-runnable cascade

When a dependency completes or a blocking condition clears:
- direct dependents are reevaluated immediately
- if now ready, they enter the ready set in the same scheduler wake cycle
- unrelated blocked or waiting nodes MUST NOT stall runnable work elsewhere in the graph

Canonical prerequisite-resolution event:
- `node.prerequisite_resolved` — emitted when a prerequisite node completes successfully, is dependency-satisfying via skip policy, or is force-resolved, potentially unblocking dependent nodes
- payload: `{ source_node_id, resolved_prerequisite_id, target_node_ids[], resolution: "completed" | "skipped" | "force_resolved" }`
- wake behavior: receiving this event triggers prerequisite re-evaluation on all `target_node_ids`; if all prerequisites are now resolved, the runtime blocked projection clears and the node transitions from `blocked` to `pending` / ready-eligible queue state in the same scheduler wake
ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Run_Graph_View.md

### 7. Failure classes and retry entry points


The executor classifies every failed or non-executed attempt into one canonical failure class or blocked-episode cause before deciding the next action.

Rules:
- transient provider faults, auth expiry, quota pressure, verification failure, reviewer findings, storage I/O, and graph-integrity failure remain distinct outcome families.
- permission-denied, user-declined, headless approval denial, FileSafe block, external-side-effect block, and replan-needed outcomes stay blocked until the owning recovery action resolves them.
- retry, backoff, remediation, safe-point restore, and escalation are keyed from the canonical classification owned by `Plans/Contracts_V0.md`.
- no consumer in this document may revive legacy approval arrays, opaque recovery option lists, or tier-era compatibility nouns.
- Search-in-files / Search side panel handoffs consume Search/FileManager route ownership through `cmd.search.find_in_files` and `cmd.search.open_result`; SSH-backed file-operation handoffs consume FileManager/Tools classification so network/trust failures map to `network_blocked_by_policy`, `host_unreachable`, or `host_untrusted`, permission denial maps to `permission_denied`, and not-found paths map to `path_not_found` without inventing executor-only file failure classes.

ContractRef: ContractName:Plans/Decision_Policy.md, ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Contracts_V0.md
### 7.1 Classified outcome matrix
| `classifier_family` | `classifier` | Max retries | Backoff | Auto-retry? | Notes |
|---|---|---|---|---|---|
| `failure_class` | `provider_transient` | 3 | 1s / 2s / 4s | Yes | network errors and transient 5xx only |
| `failure_class` | `rate_limited` | 3 | `Retry-After` or 30s fallback before bounded retry continues | Yes | 429 / provider pressure remains distinct from generic transient failure |
| `failure_class` | `structured_output_invalid` | 2 | none | Yes | malformed provider structured output |
| `failure_class` | `verification_failed` | 0 | — | No | may spawn remediation or review flow; no blind retry |
| `failure_class` | `reviewer_findings` | 0 | — | No | may spawn remediation or remain pending review |
| `failure_class` | `auth_expired` | 1 | immediate after refresh | Yes | refresh once, rebuild client, retry once |
| `blocked_reason_code` | `permission_denied` | 0 | — | No | requires explicit user decision |
| `blocked_reason_code` | `user_declined` | 0 | — | No | terminal unless the user explicitly changes posture |
| `blocked_reason_code` | `headless_ask_denied` | 0 | — | No | blocked or denied outcome; never silently retry |
| `blocked_reason_code` | `filesafe_blocked` | 0 | — | No | never auto-retry; honor FileSafe restore requirements |
| `blocked_reason_code` | `external_side_effect_blocked` | 0 | — | No | preserve local work and wait for approval/decline |
| `failure_class` | `storage_io` | 1 | brief delay | Yes | single retry on I/O failure |
| `failure_class` | `quota_exceeded` | 0 | — | No | user action or later retry window |
| `failure_class` | `graph_integrity` | 0 | — | No | hard fail; replan path only |
| `blocked_reason_code` | `replan_required` | 0 | — | No | remain blocked until patch or replan is applied |

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/GitHub_API_Auth_and_Flows.md, ContractName:Plans/Contracts_V0.md

Per-class (`per-class`) retry rules:
- `provider_transient` uses exponential backoff with base `1s`, factor `2x`, and cap `4s`: `1s -> 2s -> 4s`
- `rate_limited` remains distinct from `provider_transient`; executor policy MUST preserve that distinction when deciding backoff, surfacing state, or opening circuit breakers
- generic retry without prior classification is prohibited

ContractRef: ContractName:Plans/Decision_Policy.md, ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/CLI_Bridged_Providers.md

### 7.2 Doom-loop guard

If the same triple `(tool_name, serialized_args_hash, error_message)` is observed twice consecutively at the same nesting level, the executor MUST emit `stop.identical_failure` and terminate the run immediately.

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Contracts_V0.md

### 7.2A Cross-owner retry, usage, and lifecycle alignment

The executor's retry/classification consumer surface spans `### 7.1 Classified outcome matrix`, `### 7.2 Doom-loop guard`, `### 7.3 Signal handling and process lifecycle`, and `### Blocked and retry behavior`; together those anchors are the executor `/classification/lifecycle` projection and must not redefine the owning Run Modes, Tools, storage, usage, or provider-facade contracts.

Provider-transient retry evidence preserves the explicit `1s -> 2s -> 4s` sequence and the compatibility shorthand `/2s/4s`; retry counters are per-error after classification, not a shared global retry bucket. Doom-loop matching uses `(tool_name, args_hash, error_message)`, where `serialized_args_hash` is the canonical serialized form of `args_hash`; the terminal outcome is `kill.identical_failure`, with `stop.identical_failure` retained only as an older compatibility alias.

The fresh-worker retry value is preserved only with explicit handoff artifacts. Executor does not copy the simplistic single-story loop as-is: retry may dispatch another overseer-spawned node worker, enter remediation, request review or `/corroboration`, open graph patch/replan, or restore through safe-point logic.

MCP tool inventory discovery around `listTools` is degraded, not unavailable: retry three times with 1s backoff, then use the last-known stale tool list until the five-minute periodic refresh succeeds. Failed discovery must never permanent-kill the executor, provider session, or run by itself.

Bridged-provider execution consumes `### Contract shape (facade)` and `### Provider guard rails` from `Plans/CLI_Bridged_Providers.md` (`/CLI_Bridged_Providers.md`), the provider-facade owner-doc for bridge tool-event payloads. Provider adapters must complete `/parsing/sanitization/payload-preflight` before executor classification, and stream disconnects use `/resume` with at most three reconnect attempts, provider-specific constants, and a circuit breaker that moves open to half-open to close or `/reopen`.

Storage and usage alignment consumes `### 2.4 Projector pipeline`, `## 3. Implementation checklist`, and `### 8.3 Startup and shutdown` from `Plans/storage-plan.md`, plus `### Canonical usage pipeline` from `Plans/usage-feature.md` (`/usage-feature.md`). Executor receipts carry `checkpoint-marker`, `run.completed.usage`, the bounded `usage.jsonl` compatibility retirement path, `lock-path` / FileSafe / worktree path alignment, and the split between pre-dispatch `kill.budget_exceeded` and post-response `done.budget_exceeded`.

Regex-index build lifecycle state is executor-observable for scheduling, blocking, and cancellation: each project index transitions `no_index` -> `building_full` -> `ready`, `ready` -> `rebuilding_incremental` -> `ready`, and forced rebuild uses `ready` -> `building_full` -> `ready`; failures and cancellation still use the executor's classified error/cancel paths rather than anonymous indexing work.

Regex-index builds use one build-slot per project. A new full or incremental build request either occupies that build-slot or supersedes the pending build plan before entering `building_full` or `rebuilding_incremental`, so executor scheduling never runs competing builders for the same project index.

The executor-visible regex-index FSM is `no_index → building_full → ready → rebuilding_incremental → ready`; any state may move to `error` on failure. Superseded builds cancel through a `CancellationToken` checked between file-processing iterations, clean partial generation directories, and multi-project builds share a thread pool while per-project build slots enter FIFO order when the pool is saturated. Per-project build slots also prevent concurrent writes to regex-index generation directories.

Helper and background attempts remain first-class usage contributors: `/helper/background` lineage must be represented in the execution receipt and projected usage record instead of disappearing into generic background work. Prompt/context handoff preserves implementation-grade `/context` continuation, giant-instruction-file handling, budget-visibility, and compatibility-shim retirement semantics.

Lifecycle shutdown consumers treat shutdown as `/idempotent`: double shutdown is guarded with a Once/idempotent root and becomes a safe no-op rather than a second destructive lifecycle transition.

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md, ContractName:Plans/usage-feature.md, ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/WorktreeGitImprovement.md

### 7.3 Signal handling and process lifecycle


PM entrypoints establish the canonical shutdown root with `signal.NotifyContext` or an equivalent once-owned signal fan-out before any managed subprocess is started.

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md

Provider processes receive `SIGTERM` / `SIGINT` with a 5-second grace window. MCP and LSP subprocesses receive a 3-second grace window. `SIGHUP` reloads config. All managed subprocesses run in isolated process groups.

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Architecture_Invariants.md

### 8. Safe points

#### 8.1 Worktree snapshot in safe-point payloads


When an execution unit runs inside a worktree (thread-owned or orchestrator-owned), the safe-point event payload MUST include:

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/assistant-chat-design.md

| Field | Type | Description |
|---|---|---|
| `worktree_id` | string? | ID of bound worktree, null if running in main repo |
| `worktree_path` | string? | Absolute path of worktree on disk |
| `worktree_branch` | string? | Branch checked out in worktree |
| `HEAD_sha` | string? | `git rev-parse HEAD` captured from the worktree when the safe point or recovery snapshot is created |
| `worktree_dirty` | bool | Whether worktree has uncommitted changes at snapshot time |

These fields enable remediation/resume to restore the correct execution context. They are advisory for recovery — the canonical binding source is the redb projection from seglog events.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/assistant-chat-design.md


Before any mutation-capable node attempt, the executor MUST create or attach a runtime safe point.
ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/WorktreeGitImprovement.md

Required properties:
- `safe_point_id`
- `run_id`
- `node_id`
- `attempt_id`
- `worktree_path` or equivalent execution root
- `worktree_id`, `branch_name`, and `HEAD_sha` for worktree-bound attempts, with `HEAD_sha` captured from `git rev-parse HEAD` in the worktree
- refs to the relevant pre-attempt artifact/workspace baseline
- active `replan_generation`

Safe points are runtime recovery anchors. They are not user-facing restore points and MUST NOT be conflated with thread rewind/rollback semantics.
ContractRef: ContractName:Plans/Crosswalk.md, ContractName:Plans/storage-plan.md, ContractName:Plans/newfeatures.md

### 9. Remediation child lineage

When verification or review requires an automatic fix cycle:
ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Project_Output_Artifacts.md
- create remediation child lineage attached to the failed node attempt
- record `remediation_root_id`, `remediation_parent_attempt_id`, `generation`, and `origin_failure_event_id`
- preserve finding IDs / issue IDs through the remediation cycle
- retry the parent node only after remediation completes and the retry policy says to continue

A canonical graph node is created only when the remediation requires a replan that changes scope.
ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/chain-wizard-flexibility.md, ContractName:Plans/Decision_Policy.md

### 10. Draft decomposition degradation boundary

The executor MUST distinguish between:
ContractRef: ContractName:Plans/chain-wizard-flexibility.md, ContractName:Plans/interview-subagent-integration.md, ContractName:Plans/Progression_Gates.md
- draft decomposition / pre-canonical planning
- canonical graph execution

Rules:
- draft decomposition may degrade to deterministic flat sequencing with warning evidence when dependency output is invalid or cyclic
- canonical graph execution MUST NOT silently flatten or otherwise degrade invalid canonical graphs
- invalid canonical graphs are `graph_integrity` failures and stop execution until repaired
- A `text-only` projection is not a fallback mode for required rich execution surfaces; the executor MUST NOT silently degrade required artifacts, tool outputs, or browser/web surfaces to text-only output.
- When `auto-use` fires before canonical execution, on-trigger behavior creates or refreshes a plan in `draft` state, surfaces the sticky Plan panel, and keeps it user-dismissible and reviewable before execution observes the revised TODO projection.
ContractRef: ContractName:Plans/Progression_Gates.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/chain-wizard-flexibility.md

### 11. Acceptance criteria

- Ready-node selection is no longer defined as pure lexicographic dispatch.
- Queue analysis explains why selected nodes won and why ready-but-unselected nodes did not.
- Parallel dispatch is capacity-aware and deterministic.
- Blocked-to-runnable cascade is explicit and event-driven.
- Safe points exist before risky execution.
- Retry behavior is class-driven, not generic.
- Canonical graph integrity failures do not silently degrade.
