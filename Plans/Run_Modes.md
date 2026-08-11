# Run Modes (Canonical SSOT)


## Canonical owner-section requirements

These requirements are canonical live specification text for this owner document and preserve the required product, runtime, storage, UI, and governance details in owner-section form.

### Identity and blocked-policy transfer cluster
> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: "Puppet Master" only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.

## 0. Scope and SSOT status

This document is the **single canonical source of truth** for Puppet Master run modes. All other plan documents MUST reference this document by anchor (for example `Plans/Run_Modes.md#MODE-ask`) rather than restating mode definitions, strategy selection rules, budgets, or kill conditions.

ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md

### SSOT references (DRY)
- Locked decisions: `Plans/Spec_Lock.json`
- Canonical contracts (events/tools/auth): `Plans/Contracts_V0.md`
- DRY + ContractRef rule: `Plans/DRY_Rules.md`
- Canonical terms: `Plans/Glossary.md`
- Deterministic ambiguity handling: `Plans/Decision_Policy.md` + `Plans/auto_decisions.jsonl`
- Provider facade + normalized stream: `Plans/CLI_Bridged_Providers.md`
- Tool permissions + tool events: `Plans/Tools.md`
- FileSafe guards and blocking: `Plans/FileSafe.md`
- Context compilation + compaction owner: `Plans/Prompt_Pipeline.md`
- FileSafe safety checks over compiled output: `Plans/FileSafe.md`
- HITL tier-boundary approvals: `Plans/human-in-the-loop.md`
- OpenCode baseline patterns: `Plans/OpenCode_Deep_Extraction.md` (Section 7A)
- Assistant chat modes: `Plans/assistant-chat-design.md` (Section 3)
- Cross-cutting invariants: `Plans/Architecture_Invariants.md`

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/FileSafe.md, ContractName:Plans/Architecture_Invariants.md

---

## 1. Canonical mode definitions
### 1.0 Runtime mode and workflow-overlay separation

Runtime modes and workflow overlays must stay distinct.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Commands_System.md, ContractName:Plans/orchestrator-subagent-integration.md

Rules:
- `ask`, `plan`, `regular`, and `yolo` are the runtime-mode canon.
- The closed runtime-mode enum is `ask|plan|regular|yolo`; the closed workflow-overlay enum is `none|plan|deep_plan|debug|interview|brainstorm|crew`.
- `debug`, `deep_plan`, `interview`, `brainstorm`, and `crew` are overlays or routed workflow identities rather than extra runtime-mode enum values.
- overlay choice must not widen runtime authority.
- children inherit the parent runtime ceiling and may narrow it only.
- External IDE baselines such as JetBrains chat/agent modes and Junie validate that assistant modes may generate code, edits, and terminal commands with visible progress plus review/apply affordances in tool windows; PM still maps those affordances to `/agent`, `/apply`, operation-card/terminal surfaces, and the runtime authority enum here rather than treating the reference product as an owner.
### 1.1 `ask`
`ask` is the read-only inspection and explanation posture.

Rules:
- no project mutation or execution authority is implied
- compact chat display may label this as `Ask`

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FileSafe.md, ContractName:Plans/Prompt_Pipeline.md

### 1.2 `plan`
`plan` is the read-only planning posture.

Rules:
- planning remains read-only with respect to project files
- `plan` posture may be paired with `plan` or `deep_plan` overlay identity
- overlay identity, plan thoroughness, and later execution handoff remain preserved separately from the runtime posture itself

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/storage-plan.md

### 1.3 `regular`
`regular` is the standard execution posture with normal approvals.

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Prompt_Pipeline.md

### 1.4 `yolo`
`yolo` is the full-automation execution posture.

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/FileSafe.md, ContractName:Plans/Prompt_Pipeline.md
## 2. CLI-bridged execution strategies

Two mutually exclusive execution semantics apply when Puppet Master invokes a CLI-bridged provider (see `Plans/CLI_Bridged_Providers.md` for the Provider facade contract).

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Architecture_Invariants.md#INV-009

<a id="STRATEGY-HTE"></a>
### 2.1 HTE — Hosted Tool Execution
- The provider CLI acts as a **plan/reasoner only**. It produces no file edits and executes no shell commands.
- Puppet Master asks for a structured plan or reasoning output, executes **all** actions itself via Puppet Master tools (subject to the permission model in `Plans/Tools.md`), and feeds results back to the provider.
- HTE is a **host-owned action loop**: the provider may request the next hosted action or return a final answer, but Puppet Master executes every real tool call itself under the permission + FileSafe stack and feeds the structured result back into the next provider turn.
- When `execution_strategy = "hte"`, the adapter MUST place the provider in the most restrictive available **no-tools / no-side-effect** posture for that provider, even when the higher-level runtime mode is `regular`.
- The legacy `/plan/regular` shorthand maps to the canonical ask/plan/regular default: HTE is used for `ask`, `plan`, and `regular` unless `regular` explicitly selects DAE and provider policy allows it.
- Any tool-call observation from the provider stream during HTE is a kill condition (see §5.2).

<a id="STRATEGY-DAE"></a>
### 2.2 DAE — Delegated Agent Execution

#### 2.2.1 DAE worktree context

When a DAE executes inside a worktree (orchestrator-owned or assistant-owned), the execution context carries the worktree identity:
- `working_directory` is set to the worktree root path
- `worktree_id`, `worktree_branch`, and `is_worktree` fields are present in the execution context
- File operations, git operations, terminal sessions, and LSP root identity all resolve to the worktree path

This applies regardless of whether the DAE was triggered by Orchestrator or by Assistant Chat.

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/assistant-chat-design.md

- The provider CLI **executes tools itself** (file edits, shell commands, etc.).
- Puppet Master spawns the CLI in a jailed workspace, ingests the `stream-json` normalized event stream, and enforces policy via guards, reconciliation, and kill-switches.
- DAE uses an **ephemeral Puppet Master-managed jail** (prefer a dedicated worktree; otherwise an equivalent isolated workspace) and the provider sees only jail paths.
- The canonical workspace MUST NOT be directly writable during DAE. Host-side reconciliation applies the verified jail diff back only after scans and FileSafe checks succeed.
- Providers that cannot offer deterministic pre-spawn restriction / tool-policy injection MUST advertise `dae_allowed = false` and cannot be selected for DAE.
- The **actual jail diff** is authoritative for mutation accounting; provider-reported tool/file activity is advisory correlation data only.
- Child/subagent runs inherit the parent selected strategy unless a higher-level SSOT explicitly narrows it.
- Workspace isolation is per-subagent: HTE child/subagent turns inherit the parent write-scope because PM executes tools, while DAE child/subagent turns run in their own jail and reconcile back only after scans and FileSafe checks succeed.
- End-of-run scans are mandatory (see §5.2).
- FileSafe guards (`Plans/FileSafe.md`) apply to all DAE-originated mutations.

---

## 3. Deterministic strategy selection

Strategy selection is a pure function of `(requested_runtime_mode, effective_mode_overlay, config, policy)`.

Given the same inputs, the same strategy MUST be selected.

ContractRef: PolicyRule:Decision_Policy.md§2, PolicyRule:Decision_Policy.md§3

Before strategy selection, any surface-specific workflow state MUST normalize to the runtime-mode enum in this document:

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Contracts_V0.md

| Surface state | Effective overlay | Normalized runtime mode | Notes |
|---|---|---|---|
| `Ask` | `ask` | `ask` | Read-only posture. |
| `Plan` | `plan` | `plan` | Read-only planning posture. |
| `Deep Plan` | `deep_plan` | `plan` | Read-only planning posture with deeper overlay identity. |
| `Agent` with standard approvals | `agent` | `regular` | Standard execute posture. |
| `Debug` with standard approvals | `debug` | `regular` | Default Debug posture. |
| `Debug` with explicit YOLO posture | `debug` | `yolo` | Power-user opt-in only. |
| Execute from Interview / BrainStorm / Crew with standard approvals | `interview` / `brainstorm` / `crew` | `regular` | Workflow overlays do not create extra runtime-mode enum values. |
| Explicit YOLO posture outside Debug | `agent` or specialized overlay | `yolo` | Full-automation posture. |

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Contracts_V0.md

| Mode | `writes_allowed` | Strategy | Selection rule |
|---|---|---|---|
| `ask` | `false` | HTE | Always HTE; no opt-out. |
| `plan` | `false` | HTE | Always HTE; no opt-out. |
| `regular` | conditional | HTE (default) | HTE unless `cli_bridged_strategy == "dae"` in run config **and** provider policy allows DAE. |
| `yolo` | `true` | DAE | DAE with mandatory guardrails + scans. |

**Resolution algorithm:**

1. Read normalized runtime `mode` from the run envelope.
2. If `mode ∈ {ask, plan}` -> strategy = HTE. Return.
3. If `mode == yolo` -> strategy = DAE. Return.
4. If `mode == regular`:
   a. If run config contains `cli_bridged_strategy: "dae"` and the active provider policy flag `dae_allowed == true` -> strategy = DAE. Return.
   b. Otherwise -> strategy = HTE. Return.

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/Tools.md

Debug-specific resolution notes:
- `effective_mode_overlay = debug` with `mode ∈ {ask, plan}` is an invalid automated-debug combination and MUST be normalized before run spawn; the runtime must not execute a Debug investigation in read-only posture
- `Debug Mode + regular + HTE` is the recommended default runtime/execution model for Debug investigations
- `Debug Mode + yolo` is an advanced opt-in only and MUST NOT become the default Debug posture
- a visible `Debug` picker is a workflow overlay plus target/evidence package, not a brand-new runtime mode; it must normalize into `ask | plan | regular | yolo` rather than adding another runtime enum
- Debug target binding uses target-discovery heuristics and adapter-selection defaults owned by the relevant GUI, evidence, and tool surfaces; file-by-file canonical doc changes must land in those owner docs instead of creating a generic runtime-mode bucket
- the default Debug posture is `mode = regular` with HTE unless the user explicitly requests a DAE-capable posture and provider policy allows it
- `yolo` still requires DAE; if the provider policy snapshot does not allow DAE, the run MUST fail before provider spawn with `stop_reason = "yolo_requires_dae_provider"`; it MUST NOT silently downgrade to HTE
- `run.started` MUST persist `requested_mode_overlay`, `effective_mode_overlay`, `mode`, `strategy`, `strategy_resolution_reason`, and any active Debug Automation Profile snapshot

### 3.1 P5 run-mode governance recovery requirements

- `Decision_Policy.md`, `Run_Modes.md`, and `Progression_Gates.md` sharpened from vague policy drift into implementation-blocking runtime-governance gaps: - `Decision_Policy.md` still lacks startup-recovery defaults, misstates retry ceilings in terms that collide with policy-prohibited derived fields, and leaves backoff plus manual/prerequisite resume ceilings unowned. - `Run_Modes.md` still does not resolve the Contribute(PR) vs DAE isolation conflict, DAE-jail durability across pause/resume, the `yolo` step-1 vs step-7 guard ambiguity, `external_publish_side_effect` behavior inside DAE, `/event` recovery, `attention_required` persistence, blocked semantics, or mid-run account-switch invalidation of committed strategy. - strategy selection remains blind to per-account DAE eligibility and child-run account re-resolution ordering. - `Progression_Gates.md` contains duplicate addenda, unnumbered runtime/governance gate families, missing GATE-007 / GATE-008 placement.
- Runtime-governance docs continue to sharpen rather than stabilize: - startup recovery remains split across policy, executor, and storage docs with no single owner deciding how interrupted attempts become `stale_historical` vs rehydrated vs `startup_recovered`. - retry/backoff policy is now more clearly blocked on counter-family ownership because `retry_count` is display-only yet policy wording still acts like a generic “attempts” ceiling is enough. - recovery actions still leak unstable UI labels (`deny`, `manual fix`, `abort node`) even though HITL/runtime docs are closer to a canonical `allowed_action_ids[]` family. - Contribute(PR) vs DAE isolation is now a three-way collision between PR branch ownership, worktree/jail isolation, and provider execution context. - `yolo` is still overstated as approval-free even though non-bypassable step-7 guards remain in force.
- ELI5/Expert currently risks becoming a synonym generator. - the safer rule is: simplify explanation depth, not canonical object names - for example, `Feature Seam` should remain the term in both modes even if the ELI5 explanation is plainer
- Define intent-specific orchestration/worktree modes explicitly, including single-branch exceptions and contract-unification conflict policy.
- current work item posture remains `active`, but the center of gravity is shifting from exploration to owner-hardening


ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md

## 4. Budget defaults

### 4.1 Concurrency caps (all strategies)

Three-level concurrency limits apply globally across all run strategies and MUST NOT be overridden by Persona or overlay configuration alone.

ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Executor_Protocol.md

| Cap | Default | Scope | Kill / behavior |
|---|---|---|---|
| `max_concurrent_crews_per_platform` | 4 | Per provider platform | New crew spawn requests queue until a slot is free. |
| `max_concurrent_agents_per_crew` | 8 | Per active crew context | Reviewer or worker spawns queue rather than widening the limit. |
| `max_total_active_agents` | 32 | Entire run | Global cap across all crews and direct child agents. |

Concurrency SSOT defaults are `max_concurrent_crews_per_platform=4`, `max_concurrent_agents_per_crew=8`, and `max_total_active_agents=32`; any 5-crews / 10-agents wording in downstream docs is stale drift and must be retired rather than treated as an alternate cap.

ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/interview-subagent-integration.md

### 4.2 Run-envelope budget fields

Budget limits are enforced by the run supervisor regardless of strategy. They are frozen into the run envelope and survive pause/resume for the same `run_id`.

Legacy A2A/OpenCode gap wording may call these ceilings `max_tokens` and `max_wall_time`; the canonical run-envelope keys are `max_estimated_tokens` and `max_wall_ms`, and both feed the budget and kill-condition enforcement below.

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md

| Budget key | Default | Applies to | Meaning |
|---|---|---|---|
| `max_nesting_depth` | 4 | All modes | Maximum orchestrator -> crew -> agent -> child nesting depth before `kill.recursion_depth`. |
| `max_total_spawned_agents` | 99 | All modes | Hard cap on total spawned agents before `kill.agent_count`. |
| `max_tool_rounds` | 200 | All modes | Same-level tool-call round ceiling per agent before `kill.tool_round_limit`. |
| `max_wall_ms` | 1200000 | All modes | Maximum wall-clock duration for the run. |
| `max_estimated_tokens` | 80000 | All modes | Estimated token ceiling for the run budget. |
| `max_same_shell_failure` | 3 | DAE / host-managed shell surfaces | Consecutive failures of the same canonical shell fingerprint before stop. |
| `max_write_thrashing` | 5 writes / 10 min | DAE / hosted mutation paths | Same normalized file identity rewritten too often in a sliding window. |
| `max_retryable_errors` | 3 | All modes | Ceiling on retryable provider/executor failures before run termination. |
| `task_timeout_ms` | inherit parent remaining budget | Subagent task envelope | Per-task cap; may narrow parent budget but MUST NOT exceed it. |
| `warn_budget_pct` | 80 | Per-run and per-session budgets | Warning threshold for pre-request estimates and post-response actual cost tracking before budget enforcement terminates the run. |

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/orchestrator-subagent-integration.md

Interpretation rules:
- `max_tool_rounds` is distinct from `max_nesting_depth`; one limits same-level iteration, the other limits recursive delegation depth.
- Canonical run-envelope exact defaults are `max_nesting_depth=4`, `max_total_spawned_agents=99`, and `max_tool_rounds=200`; the kill table consumes those fields without inventing alternate caps.
- Budget overrides MAY narrow defaults per run, but MUST NOT widen beyond the hard policy ceiling.
- Queueing at concurrency caps is deterministic; PM MUST NOT silently discard or auto-widen queued work.

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/storage-plan.md

## 5. Kill conditions and enforcement

<a id="KILL-CONDITIONS"></a>

A kill condition triggers immediate run termination with outcome `done.failed` and a machine-readable reason code.

Run outcome naming follows a two-family reason-code contract: `kill.*` names pre-dispatch or `/active-kill` supervisor triggers, while `done.*` names terminal outcomes recorded after shutdown, usage, or recovery finalization.

ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/CLI_Bridged_Providers.md

### 5.1 Universal kill conditions (all strategies)

Universal termination conditions resolve to canonical stop reasons before the run is finalized.

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/Contracts_V0.md

| Condition | Trigger | Default threshold | Configurable | Terminal stop reason |
|---|---|---|---|---|
| `kill.recursion_depth` | Nesting depth exceeds `max_nesting_depth` | 4 | Yes | `kill.recursion_depth` |
| `kill.agent_count` | Total spawned agents exceed `max_total_spawned_agents` | 99 | Yes | `kill.agent_count` |
| `kill.tool_round_limit` | Tool-call rounds exceed `max_tool_rounds` | 200 | Yes | `kill.tool_round_limit` |
| `done.task_timeout` | Individual task exhausts `task_timeout_ms` or inherited remaining budget and the grace-period shutdown path completes | Per envelope | Yes | `done.task_timeout` |
| `kill.budget_exceeded` | Pre-request estimate exceeds the remaining run or session budget before dispatch | Per run/session budget | Yes | `kill.budget_exceeded` |
| `stop.identical_failure` | Same `(tool_name, args_hash, error_message)` triple observed twice consecutively | exact-match | No | `stop.identical_failure` |
| `stop.user_cancel` | User explicitly cancels the run | - | No | `stop.user_cancel` plus `done.cancelled` outcome |
| `kill.hte_tool_observed` | Provider-originated tool call appears during HTE | 0 observed | No | `kill.hte_tool_observed` |

Rules:
- `done.task_timeout` is the canonical terminal stop reason for elapsed-budget exhaustion after graceful teardown. Internal supervisor bookkeeping may classify the pre-terminal trigger as timeout exhaustion, but consumers MUST persist and inspect `done.task_timeout`; `kill.task_timeout` is retired as a consumer-facing terminal alias.
ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md
- `kill.budget_exceeded` remains pre-dispatch only. Post-response budget-overrun cases use terminal `done.budget_exceeded` after usage has been durably recorded and MUST NOT be folded back into the pre-dispatch row above.
ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md

#### Exact-match doom-loop guard

The doom-loop guard is exact-match only. PM MUST compare the same `(tool_name, serialized_args_hash, error_message)` triple at the same nesting level across consecutive attempts. Fuzzy matching, substring matching, and `looks similar` heuristics are prohibited for this terminal stop condition.

Broader retry suppression for substantially equivalent failures is owned by `Plans/Tools.md` and does not rename or replace this exact-match stop condition.

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/Tools.md

#### Signal handling and process lifecycle

PM entrypoints MUST establish the canonical shutdown root with `signal.NotifyContext` or an equivalent once-owned signal fan-out before provider, MCP, terminal, or LSP helpers are started.

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md

`SIGTERM` and `SIGINT` request graceful shutdown. `SIGHUP` triggers config reload, not shutdown. Every managed provider, MCP, terminal, and LSP subprocess MUST run in its own process group (`setsid` on Unix; `CREATE_NEW_PROCESS_GROUP` on Windows) so signal delivery stays scoped to the `/process-group` rather than individual PIDs.

Windows MCP subsystem shutdown uses `CREATE_NEW_PROCESS_GROUP`; graceful cancellation sends `CTRL_BREAK_EVENT`, waits 3 seconds, then uses `TerminateProcess` for the still-live child process group. Windows paths that may exceed ordinary path length limits are normalized with the `\\?\` long-path prefix before process launch or teardown bookkeeping.

This lifecycle section replaces over-summarized process-shutdown wording by naming the entrypoint signal root, process-group rule, platform-specific teardown sequence, and orphaned-process RAM leak prevention rationale.

Grace periods:
- provider processes: 5 seconds, then force terminate
- MCP and LSP subprocesses: 3 seconds, then force terminate
- shutdown entrypoints MUST be guarded by an idempotent `Once`-style primitive; re-entrant shutdown is a safe no-op

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/LSPSupport.md, ContractName:Plans/Executor_Protocol.md

Shutdown durability rules:
- before force termination or final outcome emission, PM flushes buffered normalized events and seglog writers
- if durability flush fails, PM emits a structured diagnostic and the terminal outcome escalates to `done.crashed` rather than claiming a clean shutdown
- user-driven or parent-driven cancellation produces `done.cancelled`, not `done.failed`, even if force termination is needed after the grace window

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/Contracts_V0.md

Startup recovery:
- if PM starts and finds an unfinished run with no canonical terminal `done` event, it performs crash recovery against the last durable seglog state
- recovered crash cases synthesize terminal metadata with `done.crashed` and `stop_reason = crash_recovered`
- PM MUST NOT silently drop an incomplete run or rewrite it as `done.failed` without the crash marker

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Architecture_Invariants.md

##### Resource disposal and health monitoring

Runtime teardown is an owned lifecycle contract, not best-effort cleanup:
- PM closes DB handles, MCP sessions, terminal shells, temporary files, and owned subprocess groups in a deterministic teardown order
- a failed teardown step emits a structured diagnostic; PM MUST NOT silently reuse poisoned process state or abandoned shell/session state
- helper restarts mint new helper/runtime identity for the restarted process instead of pretending continuity through a crashed or leaked subprocess

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Tools.md, ContractName:Plans/orchestrator-subagent-integration.md

Long-lived helper health monitoring is mandatory:
- PM tracks resident-set growth or equivalent memory-pressure signals for provider, MCP, terminal, and LSP helpers
- sustained growth beyond configured restart thresholds emits `diagnostic(category="resource_pressure")` or equivalent structured telemetry
- when a restart is required, PM performs controlled teardown or failover rather than silently leaving the degraded helper attached to future runs

ContractRef: ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Executor_Protocol.md
### 5.2 HTE-specific kill conditions
| Condition | Reason code | Description |
|-----------|-------------|-------------|
| Provider tool-call observed | `kill.hte_tool_observed` | Any `tool_use` event observed in the provider stream. HTE MUST NOT allow delegated tool execution. |

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Architecture_Invariants.md

`kill.hte_tool_observed` contract:
- The **first** provider-originated `tool_use` observed during HTE MUST terminate the run immediately.
- The terminal normalized `done` event MUST set `stop_reason = "kill.hte_tool_observed"`, and persisted `run.completed` MUST carry the same `stop_reason`.

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Tools.md

### 5.3 DAE-specific kill conditions
| Condition | Reason code | Description |
|-----------|-------------|-------------|
| Repeated shell failure | `kill.shell_failure` | Same canonical shell command fails `max_same_shell_failure` consecutive times. |
| Write thrashing | `kill.write_thrash` | Same file written more than `max_write_thrashing` times within 10 minutes. |

`kill.shell_failure` counting contract:
- a shell failure increments the streak only when an actually executed canonical shell tool invocation ends with `tool_result.ok == false`, non-zero exit, timeout, or signal termination
- permission denials, FileSafe blocks, validation failures, missing execution due to policy, and synthesized reconciler closures do **not** count as shell failures
- the canonical shell fingerprint is `(tool_name, normalized_command, normalized_cwd)` after adapter normalization, including removal of provider wrapper boilerplate such as an outer `bash -lc` added by Puppet Master
- user-interface-only terminal actions such as reveal, pin, rename, clear-scrollback, or pane movement do **not** count as executed shell invocations
- explicit terminal restart or explicit session replacement resets shell-failure continuity because a new `terminal_session_id` is created
- success of the same fingerprint resets the streak to zero; a different executed fingerprint also resets the previous fingerprint's streak
- Compatibility labels are canonicalized here: `shell-fingerprint` means the canonical shell fingerprint, `terminal-normalized` means the terminal normalized `done` and `/audit` outcome family, and `/replace/stop` covers explicit session replacement, restart, or user/parent stop paths.

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md, ContractName:Plans/UI_Command_Catalog.md

`kill.write_thrash` counting contract:
- file identity is the normalized project-relative real path of the mutated jail path after symlink / `.` / `..` collapse
- a qualifying write is an actual content-changing create / overwrite / append / rename-destination / delete observed from the authoritative jail diff or equivalent live mutation metadata
- denied, blocked, no-diff, rollback, and Puppet-Master-owned post-processing writes do **not** count
- the window is a **sliding** 10-minute window using the run supervisor's monotonic clock; a kill occurs immediately when a new qualifying write would make the count exceed the configured ceiling for that file

ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/storage-plan.md
### 5.4 DAE end-of-run scans (mandatory)
When a DAE run completes (any terminal outcome), the following scans MUST execute before the outcome is finalized:
1. **FileSafe write-scope audit** — verify all files touched during the run are within the declared write scope.
2. **Security-filter scan** — verify no sensitive-file access violations occurred.
3. **Diff reconciliation** — compare the provider's reported changes against actual workspace diff to detect unreported mutations.

Scan failures escalate the outcome to `done.failed` with reason `kill.post_scan_failure`.
The failing scan name and details MUST be persisted in `done.stop_reason` / `run.completed.stop_reason` metadata (for example `scan_name = "diff_reconciliation"`).

ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/CLI_Bridged_Providers.md

---

## 6. Run outcome taxonomy

Every run terminates with exactly one canonical coarse outcome value.

ContractRef: ContractName:Plans/Contracts_V0.md#EventRecord, PolicyRule:Decision_Policy.md§2

| Outcome | Meaning |
|---------|---------|
| `done.ok` | Run completed successfully; all objectives met. |
| `done.failed` | Run terminated due to a handled error, kill condition, or post-run scan failure. |
| `done.deferred` | Run paused; work remains but requires external input such as HITL approval. |
| `done.rotated` | Run terminated and a follow-up run was spawned for continuation. |
| `done.gutter` | Run terminated without meaningful progress; provider produced no actionable output. |
| `done.cancelled` | Run was explicitly cancelled by the user, parent, or canonical timeout or stop path. |
| `done.crashed` | PM or a managed runtime crashed or lost durability before clean terminal finalization. |

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md

Rules:
- the outcome MUST be recorded in the terminal `done` event of the normalized provider stream and persisted via `EventRecord` to seglog
- normalized `done.payload.status` remains a coarse transport-facing status (`success | cancelled | failed`), while `done.payload.outcome` carries the canonical taxonomy above
- `done.cancelled` is for explicit cancellation semantics; `done.failed` is not a catch-all for stop paths that were intentionally requested
- `done.crashed` is reserved for crash or durability-loss scenarios, including startup crash recovery
- user-driven terminal restart or replacement mints a new runtime identity instead of mutating the prior run outcome in place
- clearing scrollback or revealing an existing terminal session does not mint a new run outcome

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/storage-plan.md

### 6.1 Canonical terminal stop-reason refinements

The coarse outcome taxonomy above is paired with stable terminal stop reasons when the runtime needs more precision:
- `kill.budget_exceeded` = a pre-dispatch estimate prevented the request from starting
ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md
- `done.budget_exceeded` = post-response actual cost crossed the run or session budget after usage was durably recorded
ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md
- `done.task_timeout` = timeout expired, grace-period shutdown ran, and the run or child task terminated for elapsed budget exhaustion
ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md

Rules:
- `done.task_timeout` is the canonical terminal stop reason after timeout exhaustion completes the grace-period shutdown path. `kill.task_timeout` may exist as internal supervisor bookkeeping, but it MUST NOT be emitted as the consumer-facing terminal alias.
ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Contracts_V0.md
- These terminal stop reasons MUST be preserved in the terminal `done` payload and persisted `run.completed` metadata. Consumers MUST NOT collapse post-response budget overruns back into pre-dispatch naming, and `done.timeout` is retired as a synonym.
ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/Architecture_Invariants.md
## 7. Mode effects on context management

Mode influences context compilation, compaction, and rotation behavior. Detailed context-compilation and compaction contracts are owned by `Plans/Prompt_Pipeline.md`; `Plans/FileSafe.md` owns safety checks over compiled output only. This section defines only the mode-specific deltas.

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/FileSafe.md, ContractName:Plans/Run_Modes.md

| Mode | Context compilation | Compaction | Rotation |
|------|---------------------|------------|----------|
| `ask` | Read-only context only (no plan/write-scope metadata injected). | Standard compaction thresholds apply. | No rotation (single-turn expected). |
| `plan` | Read-only context + plan-output scaffold. | Standard compaction thresholds apply. | No rotation (planning is bounded). |
| `regular` | Full execution context assembled per `Plans/Prompt_Pipeline.md`; FileSafe applies compiled-output safety checks before execution. | Standard compaction thresholds apply. | Rotation allowed; triggers `done.rotated` outcome. |
| `yolo` | Full execution context assembled per `Plans/Prompt_Pipeline.md`; FileSafe applies compiled-output safety checks before execution. | Standard compaction thresholds apply. | Rotation allowed; triggers `done.rotated` outcome. |

Canonical context overlays:
- `ask` -> `read_only`
- `plan` -> `read_only + plan_output_scaffold_v1`
- `regular`, `yolo` -> `full_execution`

`read_only` excludes mutation-authority metadata (write scopes, DAE reconciliation metadata, and execution affordances). `plan_output_scaffold_v1` adds a deterministic plan/todo scaffold only. The overlay is applied during prompt/context compilation before attachments and the Injected Context breakdown are emitted. Child/subagent/rotated follow-up runs inherit the parent effective overlay and may narrow but MUST NOT widen a read-only overlay into `full_execution`.

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md

Rotation decision boundary:
- Compaction/pruning is attempted first against the final assembled payload.
- `ask` and `plan` are rotation-ineligible; if the payload still cannot fit after deterministic compaction, the run terminates under the normal failure/budget taxonomy rather than spawning a follow-up run.
- `regular` and `yolo` are rotation-eligible; a rotated follow-up run inherits `thread_id`, `mode`, `strategy`, effective runtime state, and a narrowed-or-equal tool-policy snapshot.

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Permissions_System.md

---

## 8. OpenCode baseline

OpenCode material is reference-only background. Puppet Master run-mode semantics are PM-owned canon.

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/assistant-chat-design.md

Interpretation rules:
- PM is not “based on” OpenCode in a normative sense
- external examples may inform terminology or contrast, but they do not define PM mode behavior
- PM mode, approval, TODO, and web-tool semantics are resolved by PM owner docs when any external baseline conflicts

---

## 9. Puppet Master deltas

Mode selection does not remove read-only repository search: agents and delegated read-only children may use `grep` in every runtime mode subject to the tool registry and permission policy, while mutation remains bounded by the active mode's authority ceiling.

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Tools.md, ContractName:Plans/Permissions_System.md

### 9.1 `ask`

`ask` is read-only. It may launch delegated read-only research children but may not launch execution or mutation children.

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/assistant-chat-design.md

### 9.2 `plan`

`plan` remains a read-first mode with explicit planning artifacts and TODO projection, not a silent auto-deny shell around web tools.

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Permissions_System.md

Rules:
- read-only delegated child runs remain allowed when they stay within the parent mode ceiling
- read-only planning tools such as `todoread`, `todowrite`, limited read-only `task`, read/navigation-only `lsp`, and external-read `/web` family operations go through the normal permission stack in Plan mode rather than being auto-denied as a family
- `websearch`, `webfetch`, `webextract`, `webresearch`, `webcrawl`, and `webmap` remain ask-gated rather than auto-denied
- Ask, Plan, and Deep Plan may self-initiate read-only web, Site Reader, and browser-evidence actions when current, external, URL, visual, dynamic-page, docs/issues/PR, compare, research, or deep-research evidence matters. Strict no-network, admin policy, private-host, robots, or mode-specific denial still blocks execution, but the block is rendered as a visible denied/unavailable card with recovery actions rather than silently hiding the capability.
- Deep Plan's question-driven loop feeds the same normalized TODO projection used by execution
### 9.3 `regular`

`regular` allows full child-run behavior subject to permission, provider, and capability rules.

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Models_System.md, ContractName:Plans/Permissions_System.md

### 9.4 `yolo`

`yolo` may permit broader execution behavior, but it still cannot bypass child capability narrowing, provider restrictions, or the Copilot-native routing exception.

ContractRef: ContractName:Plans/Models_System.md, ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Permissions_System.md

### 9.5 Crew overlay

Crew is an overlay over the current parent mode, not a separate runtime mode. A crew launched from `plan` remains read-only; a crew launched from `regular` or `yolo` inherits that higher parent ceiling while still respecting all other constraints.

ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FinalGUISpec.md
## 10. Acceptance criteria
These criteria are testable assertions that MUST hold for any conforming implementation.

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Progression_Gates.md

<a id="AC-01"></a>
**AC-01:** In HTE strategy, any `tool_use` event observed in the provider stream MUST trigger kill condition `kill.hte_tool_observed` and terminate the run with `done.failed`.
ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Tools.md


<a id="AC-02"></a>
**AC-02:** In DAE strategy, end-of-run scans (§5.4) MUST execute for every terminal outcome. A scan failure MUST escalate the outcome to `done.failed`.
ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Tools.md


<a id="AC-03"></a>
**AC-03:** Mode selection is deterministic: given identical run envelope and config inputs, the resolution algorithm (§3) MUST produce the same `(mode, strategy)` pair.
ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Contracts_V0.md


<a id="AC-04"></a>
**AC-04:** In `ask` and `plan` modes, no project-file mutation may occur. Any write attempt to a project file MUST be blocked by the permission layer (not merely by FileSafe).
ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/FileSafe.md


<a id="AC-05"></a>
**AC-05:** In `yolo` mode, FileSafe guards MUST remain active. Disabling FileSafe while `yolo` is active MUST produce a user-visible warning (per `Plans/FileSafe.md` §10a).
ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/Run_Modes.md


<a id="AC-06"></a>
**AC-06:** Budget limits (§4) MUST be enforced regardless of mode. Exceeding any budget MUST trigger the corresponding kill condition.
ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Progression_Gates.md


<a id="AC-07"></a>
**AC-07:** Every run MUST terminate with exactly one outcome from the taxonomy (§6), recorded in the `done` event and persisted to seglog.
ContractRef: ContractName:Plans/Contracts_V0.md#EventRecord, ContractName:Plans/storage-plan.md


<a id="AC-08"></a>
**AC-08:** UI/workflow state MUST normalize deterministically into the canonical runtime mode enum before strategy selection. `Interview`, `BrainStorm`, and `Crew` MUST NOT create additional runtime mode values.
ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Contracts_V0.md


<a id="AC-09"></a>
**AC-09:** In `regular` mode, `cli_bridged_strategy = "dae"` with `dae_allowed != true` MUST deterministically fall back to HTE and persist `strategy_resolution_reason = "regular_dae_disallowed"`.
ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/CLI_Bridged_Providers.md


<a id="AC-10"></a>
**AC-10:** In `yolo` mode, a provider with `dae_allowed != true` MUST fail before provider spawn with `stop_reason = "yolo_requires_dae_provider"`; it MUST NOT silently downgrade to HTE.
ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/CLI_Bridged_Providers.md


<a id="AC-11"></a>
**AC-11:** `kill.shell_failure` counts only actually executed shell failures for one canonical shell fingerprint. Policy denials, FileSafe blocks, UI-only terminal actions, and different shell fingerprints MUST NOT increment the same streak.
ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md


<a id="AC-12"></a>
**AC-12:** `kill.write_thrash` counts only qualifying content-changing writes to one normalized file identity within a sliding 10-minute window. Writes to different files, aged-out writes, and denied / blocked / no-diff operations MUST NOT trigger the ceiling.
ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/storage-plan.md


<a id="AC-13"></a>
**AC-13:** Child/subagent/rotated follow-up runs MUST inherit the parent effective context overlay. A read-only parent run (`ask` or `plan`) MUST NOT widen into `full_execution` context in any child run.
ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Contracts_V0.md


<a id="AC-14"></a>
**AC-14:** When a shell-backed invocation is bound to a terminal session, later `Open in Terminal` or `Show Terminal` actions MUST reveal that same `terminal_session_id` when it still exists instead of spawning a duplicate shell.
ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/UI_Command_Catalog.md


<a id="AC-15"></a>
**AC-15:** Explicit terminal restart or replacement MUST mint a new `terminal_session_id`, while clear-scrollback and reveal-only actions MUST preserve the current runtime identity.
ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/storage-plan.md


ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/storage-plan.md
## Retry, Blocking, and Safe-Point Clarification Addendum (2026-03-08)

### 1. Mode interaction with runtime failure classes

Run mode does not replace runtime failure classification.

Required rule:
- `ask`, `plan`, `regular`, and `yolo` all use the shared `failure_class` / `blocked_reason_code` taxonomy
- mode may change which classes are likely, but not the meaning of those classes

Failover reason codes are part of the shared runtime classification and remain stable across modes.

Required failover reason codes:
- `hard_exhaustion_failover`
- `auth_failure_failover`
- `workspace_deactivated_failover`
- `model_unsupported_failover`
- `provider_unhealthy_failover`

Rules:
- failover reason codes are recorded in `reason_codes[]` or the owning runtime/audit envelope for the attempt
- changing from `ask` or `plan` to an execution-capable mode does not rewrite the original failover reason
- provider/account routing surfaces may add selection, preemptive-switch, clamp/substitution, or blocked reasons, but those reason families do not replace failover classification

ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/Models_System.md, ContractName:Plans/usage-feature.md

### 2. Ask/plan/headless interaction

Existing headless behavior remains authoritative:
- when tool policy resolves to `ask` and no interactive approval path is available, the outcome becomes `headless_ask_denied` unless the active flow explicitly supports pending HITL at that boundary
- this is a blocked/denied outcome, not an auto-retry class

### 3. Counters and kill-switch interaction

Required clarifications:
- blocked outcomes do not count as qualifying writes
- blocked outcomes do not count as retryable provider errors
- `max_retryable_errors` applies only to retryable classes such as `provider_transient` unless another class is explicitly declared retryable by the shared matrix

### 4. Safe-point applicability

Runtime safe points are required only for mutation-capable attempts.

Rules:
- `ask` and `plan` remain read-only for project files and therefore do not require mutation safe points for ordinary planning/inspection work
- `regular` and `yolo` must create safe points before risky mutation-capable attempts

### 5. Acceptance criteria

- Run modes do not invent alternative retry taxonomies.
- Headless ask denial remains explicit and non-magical.
- Blocked outcomes are excluded from write-thrash and retryable-provider ceilings.
- Safe-point creation follows execution authority, not generic run existence.
## Runtime Mode / Blocked Recovery Addendum (2026-03-09)

Execution mode affects which recovery actions can be taken immediately, but mode does not redefine the underlying classification.

### Mode rules

#### Worktree invariant across modes

All assistant chat modes (Ask, Agent, Plan, Deep Plan, Debug) operate within the active thread's worktree when one is bound:
- Ask mode: reads files from worktree
- Agent mode: edits files in worktree
- Plan/Deep Plan mode: executes plans in worktree context
- Debug mode: debug operations target worktree

Mode transitions do not change worktree binding — binding is a thread-level property, not a mode-level property.

Worktree commands (`cmd.chat.worktree.*`) are available in all modes, subject to their when-clauses. The worktree header button and dropdown menu are always visible regardless of current mode.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/UI_Command_Catalog.md

- interactive modes may present auth, approval, and clarification actions directly
- non-interactive/headless modes that cannot present a required action yield `blocked_reason_code = headless_ask_denied`
- a later mode change may satisfy the prerequisite and allow resume, but it does not rewrite the original blocked classification

### Safe-point rule
If policy requires rollback before rerun, changing mode alone is insufficient; the safe-point restore requirement still applies.
## Runtime Mode / Recovery Canonical Alignment (2026-03-09)

Execution mode affects what can be shown immediately, but does not redefine the runtime taxonomy.

Rules:
- headless or non-interactive inability to present a required approval/auth prompt yields `blocked_reason_code = headless_ask_denied`
- a later mode change may satisfy the prerequisite, but it does not rewrite the original blocked classification
- mode change plus prerequisite resolution creates a new attempt snapshot rather than mutating the blocked attempt
- if policy requires restore-before-rerun, mode change alone is insufficient; the safe-point restore requirement still applies
## Runtime Mode Interaction with Blocked Recovery Consolidation Addendum (2026-03-09)

This section defines deferred / Waiting Run Mode Semantics.

### Run-level state
- A run remains active if any node is runnable.
- If no node is runnable and blocked/backoff/prerequisite-waiting work exists, the run is deferred/waiting rather than terminal.
- Terminal completion requires no runnable, no blocked, no backoff, and no unresolved prerequisite work.

### Headless blocked discovery
When `headless_ask_denied` blocks work in a non-interactive mode:
- emit a blocked notice with `blocked_reason_code: headless_ask_denied`
- surface blocked node count in CLI/log status summaries
- surface a dashboard badge if a UI session is attached
- include the exact permission or approval that could not be presented interactively
- return `status: "unavailable"` with `reason: "headless"` to tool and operation-card consumers when no interactive presenter exists
- do not offer GUI-only recovery actions such as `Open in Terminal` from a headless context; provide resume guidance, permission-preset adjustment, interactive mode change, fallback strategy when policy allows it, or an orchestrator-facing blockage

### Safe-point applicability
Run modes do not redefine `mutation_capable`. They only determine whether mutation-capable attempts may occur and therefore whether safe points are relevant in that mode.
## Headless Blocked Discovery and Mutation Classifier Alignment Addendum

### Headless `headless_ask_denied` discovery

When `headless_ask_denied` blocks a node in a headless or non-interactive run mode:

1. A `blocked_notice` event is emitted to the event bus with `blocked_reason_code: headless_ask_denied`.
2. The run status summary (visible in CLI output, logs, or dashboard if a UI session is connected) shows the blocked node count.
3. If the run has a connected UI session, a dashboard notification badge appears.
4. The blocked notice includes the specific permission or approval that was needed and could not be presented interactively.

Recovery: the user must either (a) change the run mode to interactive and resume, (b) adjust permission presets to pre-approve the needed action, or (c) abort the blocked node.

### Safe-point and mutation_capable alignment

`mutation_capable` classification is performed by the **tool registry** (each tool declares `mutation_capable: bool`, default `false`). The **node planner** propagates this to the node plan record. Run modes do not override `mutation_capable` classification but do control whether safe points are created:

- `regular` and `yolo` modes: safe points are created before mutation-capable attempts as normal.
- `ask` and `plan` modes: no mutation-capable attempts occur by definition, so no safe points are needed.

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Tools.md, ContractName:Plans/Contracts_V0.md
## Runtime identity and blocked-policy continuity

#### Acceptance carry-through
- Transfer execution_role, requested_account_id, operational_identity, account-switch and pressure ownership, blocked_sequence minting, startup recovery handshake, and DAE jail/approval policy into owner and consumer docs
- Carry usage switch-history and usage execution-role follow-through
- In `## Runtime identity and blocked-policy continuity`, require `execution_role`, `requested_account_id`, and `operational_identity` as runtime continuity fields.
- Require blocked-policy continuity to include `blocked_sequence` minting/persistence, startup recovery rehydration, and unchanged DAE jail/approval policy ownership.
- Carry usage switch-history and usage execution-role follow-through across mode changes and blocked recovery.
- cov-159 exact item present: Transfer execution_role, requested_account_id, operational_identity, account-switch and pressure ownership, blocked_sequence minting, startup recovery handshake, and DAE jail/approval policy into owner and consumer docs
- cov-159 exact item present: Carry usage switch-history and usage execution-role follow-through

## Owner / Consumer Map

This source-preserving standardization keeps the owner and consumer boundaries stated in the original document body. During this batch, `Plans/Run_Modes.md` remains the owner doc for the behavior described by its preserved sections, while cross-doc ownership follows the ContractRefs and boundary notes already present in the original text.

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md

## PlanUnits

### RM-002 - Run Modes Document Identity And Compliance

```yaml
{plan_unit_id: "RM-002", unit_type: "requirement", status: "accepted", owner_doc: "Plans/Run_Modes.md", canonical_text: "Run_Modes.md is the canonical Run Modes SSOT and owner-section document; it preserves Puppet Master naming, deterministic defaults, no-open-question posture, and cross-reference compliance with DRY, contracts, glossary, and decision-policy owners.", gui_related: true, gui_classification_reason: "This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.", split_recommended: false, depends_on: ["PDS-003", "PDS-004", "PDS-005", "PNC-001", "CV-002"], unblocks: [], acceptance_criteria: ["RM-002 remains addressable as a fine-grained Run Modes PlanUnit with source-span coverage.", "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.", "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits", "python3 scripts/pm-plan-index.py validate"], risk_class: "owner_identity_drift", reasoning_tier: "standard", context_scope: "run_modes_identity", implementation_surfaces: ["Plans/Run_Modes.md"], node_compile_hint: {mode: "run_modes_document_identity", create_worknodes: false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Modes-S0001", "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Modes-S0002", "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Modes-S0003"], preserved_exact_tokens: ["Run Modes (Canonical SSOT)", "Canonical owner-section requirements", "Identity and blocked-policy transfer cluster", "Puppet Master", "No open questions", "deterministic defaults"], negative_constraints: [], preserved_contractrefs: [], compatibility_only_notes: [], stale_retired_dispositions: [], owner_hints: ["Plans/Run_Modes.md", "Plans/DRY_Rules.md", "Plans/Decision_Policy.md", "Plans/Contracts_V0.md"]}
```

### RM-003 - Run Modes SSOT And DRY Boundary

```yaml
{plan_unit_id: "RM-003", unit_type: "requirement", status: "accepted", owner_doc: "Plans/Run_Modes.md", canonical_text: "Run_Modes.md is the single canonical source of truth for run-mode definitions, strategy selection, budgets, and kill conditions; other docs must reference its anchors rather than restating those contracts.", gui_related: false, gui_classification_reason: "This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.", split_recommended: false, depends_on: ["PDS-003", "PDS-004", "PDS-005", "PNC-001", "BPM-004"], unblocks: [], acceptance_criteria: ["RM-003 remains addressable as a fine-grained Run Modes PlanUnit with source-span coverage.", "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.", "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits", "python3 scripts/pm-plan-index.py validate"], risk_class: "drY_boundary_drift", reasoning_tier: "standard", context_scope: "run_modes_ssot", implementation_surfaces: ["Plans/Run_Modes.md"], node_compile_hint: {mode: "run_modes_ssot_boundary", create_worknodes: false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Modes-S0004", "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Modes-S0005"], preserved_exact_tokens: ["single canonical source of truth", "Plans/Run_Modes.md#MODE-ask", "SSOT references (DRY)", "ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md"], negative_constraints: ["Other plan documents MUST reference Run_Modes.md by anchor rather than restating mode definitions, strategy selection rules, budgets, or kill conditions."], preserved_contractrefs: ["ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md", "ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/FileSafe.md, ContractName:Plans/Architecture_Invariants.md"], compatibility_only_notes: [], stale_retired_dispositions: [], owner_hints: ["Plans/Run_Modes.md", "Plans/DRY_Rules.md", "Plans/Glossary.md", "Plans/Decision_Policy.md"]}
```

### RM-004 - Runtime Mode And Overlay Enum Separation

```yaml
{plan_unit_id: "RM-004", unit_type: "requirement", status: "accepted", owner_doc: "Plans/Run_Modes.md", canonical_text: "Runtime mode and workflow overlay are separate closed enums: runtime mode is ask|plan|regular|yolo, overlay is none|plan|deep_plan|debug|interview|brainstorm|crew, overlays never widen runtime authority, and children inherit or narrow the parent ceiling.", gui_related: false, gui_classification_reason: "This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.", split_recommended: false, depends_on: ["PDS-003", "PDS-004", "PDS-005", "PNC-001", "ACD-006", "UCC-001"], unblocks: [], acceptance_criteria: ["RM-004 remains addressable as a fine-grained Run Modes PlanUnit with source-span coverage.", "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.", "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits", "python3 scripts/pm-plan-index.py validate"], risk_class: "runtime_enum_drift", reasoning_tier: "standard", context_scope: "run_mode_definition", implementation_surfaces: ["Plans/Run_Modes.md"], node_compile_hint: {mode: "runtime_mode_overlay_enum_boundary", create_worknodes: false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Modes-S0006", "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Modes-S0007"], preserved_exact_tokens: ["ask|plan|regular|yolo", "none|plan|deep_plan|debug|interview|brainstorm|crew", "debug", "deep_plan", "interview", "brainstorm", "crew"], negative_constraints: ["overlay choice must not widen runtime authority.", "children inherit the parent runtime ceiling and may narrow it only."], preserved_contractrefs: ["ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Commands_System.md, ContractName:Plans/orchestrator-subagent-integration.md"], compatibility_only_notes: [], stale_retired_dispositions: [], owner_hints: ["Plans/Run_Modes.md", "Plans/assistant-chat-design.md", "Plans/Commands_System.md", "Plans/orchestrator-subagent-integration.md"]}
```

### RM-005 - GUI Workflow Affordance Boundary

```yaml
{plan_unit_id: "RM-005", unit_type: "requirement", status: "accepted", owner_doc: "Plans/Run_Modes.md", canonical_text: "External IDE assistant-mode baselines may validate visible progress and review/apply affordances, but PM maps those affordances to /agent, /apply, operation-card/terminal surfaces, and the runtime authority enum instead of treating external products as owners.", gui_related: true, gui_classification_reason: "This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.", split_recommended: false, depends_on: ["PDS-003", "PDS-004", "PDS-005", "PNC-001", "ACD-008", "UCC-001"], unblocks: [], acceptance_criteria: ["RM-005 remains addressable as a fine-grained Run Modes PlanUnit with source-span coverage.", "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.", "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits", "python3 scripts/pm-plan-index.py validate"], risk_class: "external_baseline_owner_drift", reasoning_tier: "standard", context_scope: "run_mode_gui_boundary", implementation_surfaces: ["Plans/Run_Modes.md"], node_compile_hint: {mode: "workflow_affordance_owner_boundary", create_worknodes: false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Modes-S0007"], preserved_exact_tokens: ["JetBrains chat/agent modes", "Junie", "visible progress", "review/apply affordances", "/agent", "/apply", "operation-card/terminal surfaces", "runtime authority enum"], negative_constraints: ["External IDE baselines validate comparable affordances but do not become Puppet Master owner docs."], preserved_contractrefs: ["ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Commands_System.md, ContractName:Plans/orchestrator-subagent-integration.md"], compatibility_only_notes: [], stale_retired_dispositions: [], owner_hints: ["Plans/Run_Modes.md", "Plans/assistant-chat-design.md", "Plans/UI_Command_Catalog.md"]}
```

### RM-006 - Read-Only Ask And Plan Modes

```yaml
{plan_unit_id: "RM-006", unit_type: "requirement", status: "accepted", owner_doc: "Plans/Run_Modes.md", canonical_text: "ask and plan are read-only postures: ask is inspection/explanation only, plan is planning only, and plan may carry plan or deep_plan overlay identity without granting project mutation authority.", gui_related: false, gui_classification_reason: "This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.", split_recommended: false, depends_on: ["PDS-003", "PDS-004", "PDS-005", "PNC-001", "ACD-006", "SP-001", "F2-086"], unblocks: [], acceptance_criteria: ["RM-006 remains addressable as a fine-grained Run Modes PlanUnit with source-span coverage.", "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.", "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits", "python3 scripts/pm-plan-index.py validate"], risk_class: "read_only_mode_widening", reasoning_tier: "standard", context_scope: "run_mode_definition", implementation_surfaces: ["Plans/Run_Modes.md"], node_compile_hint: {mode: "ask_plan_read_only_modes", create_worknodes: false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Modes-S0008", "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Modes-S0009"], preserved_exact_tokens: ["ask", "plan", "read-only inspection and explanation posture", "read-only planning posture", "plan_output_scaffold_v1"], negative_constraints: ["No project mutation or execution authority is implied by ask or plan."], preserved_contractrefs: ["ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FileSafe.md, ContractName:Plans/Prompt_Pipeline.md", "ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/storage-plan.md"], compatibility_only_notes: [], stale_retired_dispositions: [], owner_hints: ["Plans/Run_Modes.md", "Plans/FileSafe.md", "Plans/Prompt_Pipeline.md", "Plans/storage-plan.md"]}
```

### RM-007 - Execution-Capable Regular And Yolo Modes

```yaml
{plan_unit_id: "RM-007", unit_type: "requirement", status: "accepted", owner_doc: "Plans/Run_Modes.md", canonical_text: "regular is the standard execution posture with normal approvals; yolo is the full-automation execution posture, still bounded by permissions, FileSafe, provider, and prompt-pipeline constraints.", gui_related: false, gui_classification_reason: "This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.", split_recommended: false, depends_on: ["PDS-003", "PDS-004", "PDS-005", "PNC-001", "PS-001", "F2-086", "CBP-003"], unblocks: [], acceptance_criteria: ["RM-007 remains addressable as a fine-grained Run Modes PlanUnit with source-span coverage.", "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.", "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits", "python3 scripts/pm-plan-index.py validate"], risk_class: "execution_mode_authority_drift", reasoning_tier: "standard", context_scope: "run_mode_definition", implementation_surfaces: ["Plans/Run_Modes.md"], node_compile_hint: {mode: "regular_yolo_execution_modes", create_worknodes: false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Modes-S0010", "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Modes-S0011"], preserved_exact_tokens: ["regular", "yolo", "standard execution posture with normal approvals", "full-automation execution posture"], negative_constraints: ["yolo does not bypass child capability narrowing, provider restrictions, or FileSafe guardrails."], preserved_contractrefs: ["ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Prompt_Pipeline.md", "ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/FileSafe.md, ContractName:Plans/Prompt_Pipeline.md"], compatibility_only_notes: [], stale_retired_dispositions: [], owner_hints: ["Plans/Run_Modes.md", "Plans/Permissions_System.md", "Plans/FileSafe.md", "Plans/Prompt_Pipeline.md"]}
```

### RM-008 - HTE Hosted Tool Execution Strategy

```yaml
{plan_unit_id: "RM-008", unit_type: "requirement", status: "accepted", owner_doc: "Plans/Run_Modes.md", canonical_text: "Hosted Tool Execution keeps provider CLIs in plan/reasoner and no-side-effect posture while Puppet Master owns every real action through its tools, permissions, FileSafe stack, and hosted action loop; provider tool_use in HTE is a kill condition.", gui_related: false, gui_classification_reason: "This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.", split_recommended: false, depends_on: ["PDS-003", "PDS-004", "PDS-005", "PNC-001", "CBP-003", "CBP-005", "T-001", "PS-001", "F2-086"], unblocks: [], acceptance_criteria: ["RM-008 remains addressable as a fine-grained Run Modes PlanUnit with source-span coverage.", "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.", "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits", "python3 scripts/pm-plan-index.py validate"], risk_class: "delegated_tool_leakage", reasoning_tier: "standard", context_scope: "execution_strategy", implementation_surfaces: ["Plans/Run_Modes.md"], node_compile_hint: {mode: "hte_execution_strategy", create_worknodes: false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Modes-S0012", "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Modes-S0013"], preserved_exact_tokens: ["STRATEGY-HTE", "HTE — Hosted Tool Execution", "plan/reasoner only", "no-tools / no-side-effect", "/plan/regular", "kill.hte_tool_observed"], negative_constraints: ["HTE MUST NOT allow delegated tool execution.", "Any tool-call observation from the provider stream during HTE is a kill condition."], preserved_contractrefs: ["ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Architecture_Invariants.md#INV-009"], compatibility_only_notes: ["The legacy /plan/regular shorthand maps to ask/plan/regular default HTE unless regular explicitly selects DAE and provider policy allows it."], stale_retired_dispositions: [], owner_hints: ["Plans/Run_Modes.md", "Plans/CLI_Bridged_Providers.md", "Plans/Tools.md", "Plans/FileSafe.md"]}
```

### RM-009 - DAE Jail And Worktree Strategy

```yaml
{plan_unit_id: "RM-009", unit_type: "requirement", status: "accepted", owner_doc: "Plans/Run_Modes.md", canonical_text: "Delegated Agent Execution runs provider tools inside an isolated PM-managed jail or worktree context, records worktree identity in execution context, treats jail diff as authoritative, blocks direct canonical-workspace writes, requires dae_allowed policy, and reconciles only after scans and FileSafe checks.", gui_related: false, gui_classification_reason: "This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.", split_recommended: false, depends_on: ["PDS-003", "PDS-004", "PDS-005", "PNC-001", "CBP-003", "CBP-005", "T-001", "PS-001", "F2-086"], unblocks: [], acceptance_criteria: ["RM-009 remains addressable as a fine-grained Run Modes PlanUnit with source-span coverage.", "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.", "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits", "python3 scripts/pm-plan-index.py validate"], risk_class: "dae_isolation_drift", reasoning_tier: "standard", context_scope: "execution_strategy", implementation_surfaces: ["Plans/Run_Modes.md"], node_compile_hint: {mode: "dae_jail_worktree_strategy", create_worknodes: false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Modes-S0014", "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Modes-S0015"], preserved_exact_tokens: ["STRATEGY-DAE", "DAE — Delegated Agent Execution", "2.2.1 DAE worktree context", "working_directory", "worktree_id", "worktree_branch", "is_worktree", "dae_allowed = false", "actual jail diff"], negative_constraints: ["The canonical workspace MUST NOT be directly writable during DAE.", "Providers that cannot offer deterministic pre-spawn restriction / tool-policy injection MUST advertise dae_allowed = false and cannot be selected for DAE."], preserved_contractrefs: ["ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/assistant-chat-design.md"], compatibility_only_notes: [], stale_retired_dispositions: [], owner_hints: ["Plans/Run_Modes.md", "Plans/Executor_Protocol.md", "Plans/assistant-chat-design.md", "Plans/CLI_Bridged_Providers.md", "Plans/FileSafe.md"]}
```

### RM-010 - Surface State Runtime Normalization Table

```yaml
{plan_unit_id: "RM-010", unit_type: "requirement", status: "accepted", owner_doc: "Plans/Run_Modes.md", canonical_text: "Surface states normalize to runtime mode before strategy selection: Ask to ask, Plan and Deep Plan to plan, Agent/Debug/Interview/BrainStorm/Crew standard approvals to regular, and explicit YOLO posture to yolo.", gui_related: true, gui_classification_reason: "This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.", split_recommended: false, depends_on: ["PDS-003", "PDS-004", "PDS-005", "PNC-001", "ACD-008", "ACD-006", "CV-002", "CV-006", "UCC-001"], unblocks: [], acceptance_criteria: ["RM-010 remains addressable as a fine-grained Run Modes PlanUnit with source-span coverage.", "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.", "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits", "python3 scripts/pm-plan-index.py validate"], risk_class: "surface_runtime_mapping_drift", reasoning_tier: "standard", context_scope: "strategy_selection_gui_normalization", implementation_surfaces: ["Plans/Run_Modes.md"], node_compile_hint: {mode: "surface_state_runtime_normalization", create_worknodes: false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Modes-S0016"], preserved_exact_tokens: ["Ask", "Plan", "Deep Plan", "Agent", "Debug", "Interview", "BrainStorm", "Crew", "Explicit YOLO posture outside Debug", "Normalized runtime mode"], negative_constraints: ["Interview, BrainStorm, and Crew MUST NOT create additional runtime mode values."], preserved_contractrefs: ["ContractRef: PolicyRule:Decision_Policy.md§2, PolicyRule:Decision_Policy.md§3", "ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Contracts_V0.md", "ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/Tools.md"], compatibility_only_notes: [], stale_retired_dispositions: [], owner_hints: ["Plans/Run_Modes.md", "Plans/assistant-chat-design.md", "Plans/Prompt_Pipeline.md", "Plans/Contracts_V0.md"]}
```

### RM-011 - Deterministic Strategy Selection Algorithm

```yaml
{plan_unit_id: "RM-011", unit_type: "requirement", status: "accepted", owner_doc: "Plans/Run_Modes.md", canonical_text: "Strategy selection is a deterministic pure function of requested runtime mode, effective overlay, config, and policy: ask/plan always HTE, regular defaults HTE unless DAE is requested and allowed, and yolo selects DAE.", gui_related: false, gui_classification_reason: "This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.", split_recommended: false, depends_on: ["PDS-003", "PDS-004", "PDS-005", "PNC-001", "CBP-003", "CBP-005", "T-001", "PS-001"], unblocks: [], acceptance_criteria: ["RM-011 remains addressable as a fine-grained Run Modes PlanUnit with source-span coverage.", "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.", "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits", "python3 scripts/pm-plan-index.py validate"], risk_class: "strategy_selection_drift", reasoning_tier: "standard", context_scope: "strategy_selection", implementation_surfaces: ["Plans/Run_Modes.md"], node_compile_hint: {mode: "deterministic_strategy_selection", create_worknodes: false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Modes-S0016"], preserved_exact_tokens: ["Strategy selection is a pure function", "requested_runtime_mode", "effective_mode_overlay", "cli_bridged_strategy: \"dae\"", "dae_allowed == true", "strategy_resolution_reason"], negative_constraints: ["Given the same inputs, the same strategy MUST be selected.", "regular must not select DAE unless config requests it and provider policy allows it."], preserved_contractrefs: ["ContractRef: PolicyRule:Decision_Policy.md§2, PolicyRule:Decision_Policy.md§3", "ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Contracts_V0.md", "ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/Tools.md"], compatibility_only_notes: [], stale_retired_dispositions: [], owner_hints: ["Plans/Run_Modes.md", "Plans/CLI_Bridged_Providers.md", "Plans/Tools.md", "Plans/Decision_Policy.md"]}
```

### RM-012 - Debug Overlay Runtime Resolution

```yaml
{plan_unit_id: "RM-012", unit_type: "requirement", status: "accepted", owner_doc: "Plans/Run_Modes.md", canonical_text: "Debug is a workflow overlay plus target/evidence package, not a new runtime mode; automated Debug cannot execute in read-only mode, defaults to regular+HTE, treats yolo as explicit opt-in, and persists overlay, mode, strategy, reason, and active Debug Automation Profile snapshot in run.started.", gui_related: true, gui_classification_reason: "This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.", split_recommended: false, depends_on: ["PDS-003", "PDS-004", "PDS-005", "PNC-001", "ACD-008", "ACD-006", "CV-002", "CV-006", "CBP-005", "UCC-001"], unblocks: [], acceptance_criteria: ["RM-012 remains addressable as a fine-grained Run Modes PlanUnit with source-span coverage.", "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.", "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits", "python3 scripts/pm-plan-index.py validate"], risk_class: "debug_mode_authority_drift", reasoning_tier: "standard", context_scope: "debug_runtime_overlay", implementation_surfaces: ["Plans/Run_Modes.md"], node_compile_hint: {mode: "debug_overlay_runtime_resolution", create_worknodes: false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Modes-S0016"], preserved_exact_tokens: ["effective_mode_overlay = debug", "Debug Mode + regular + HTE", "Debug Mode + yolo", "run.started", "requested_mode_overlay", "strategy_resolution_reason", "Debug Automation Profile snapshot"], negative_constraints: ["Debug with mode ask or plan is an invalid automated-debug combination.", "Debug Mode + yolo is an advanced opt-in only and MUST NOT become the default Debug posture.", "yolo still requires DAE and MUST NOT silently downgrade to HTE."], preserved_contractrefs: ["ContractRef: PolicyRule:Decision_Policy.md§2, PolicyRule:Decision_Policy.md§3", "ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Contracts_V0.md", "ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/Tools.md"], compatibility_only_notes: [], stale_retired_dispositions: [], owner_hints: ["Plans/Run_Modes.md", "Plans/assistant-chat-design.md", "Plans/Contracts_V0.md", "Plans/CLI_Bridged_Providers.md"]}
```

### RM-013 - Runtime Governance Recovery Gap Register

```yaml
{plan_unit_id: "RM-013", unit_type: "requirement", status: "accepted", owner_doc: "Plans/Run_Modes.md", canonical_text: "The P5 run-mode recovery section preserves implementation-blocking governance gaps around startup recovery, retry/backoff ownership, Contribute(PR) versus DAE isolation, DAE jail durability, external publish side effects, /event recovery, attention_required persistence, blocked semantics, account-switch invalidation, child-run account re-resolution, gate placement, and work-item posture.", gui_related: false, gui_classification_reason: "This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.", split_recommended: false, depends_on: ["PDS-003", "PDS-004", "PDS-005", "PNC-001", "PS-001", "SP-001", "CV-215"], unblocks: [], acceptance_criteria: ["RM-013 remains addressable as a fine-grained Run Modes PlanUnit with source-span coverage.", "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.", "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits", "python3 scripts/pm-plan-index.py validate"], risk_class: "governance_gap_loss", reasoning_tier: "standard", context_scope: "runtime_governance_gaps", implementation_surfaces: ["Plans/Run_Modes.md"], node_compile_hint: {mode: "runtime_governance_recovery_gap_register", create_worknodes: false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Modes-S0017"], preserved_exact_tokens: ["P5 run-mode governance recovery requirements", "startup recovery", "Contribute(PR) vs DAE isolation", "DAE-jail durability", "external_publish_side_effect", "/event recovery", "attention_required", "blocked semantics", "account-switch invalidation", "GATE-007 / GATE-008"], negative_constraints: [], preserved_contractrefs: ["ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md"], compatibility_only_notes: [], stale_retired_dispositions: ["Runtime-governance docs continue to sharpen rather than stabilize."], owner_hints: ["Plans/Run_Modes.md", "Plans/Decision_Policy.md", "Plans/Progression_Gates.md", "Plans/storage-plan.md"]}
```

### RM-014 - Runtime Governance UI And Explanation Terminology

```yaml
{plan_unit_id: "RM-014", unit_type: "requirement", status: "accepted", owner_doc: "Plans/Run_Modes.md", canonical_text: "Runtime recovery and explanation surfaces must converge on canonical allowed_action_ids[] and explanation-depth controls; unstable UI labels are warning examples, and ELI5/Expert changes simplify explanation depth without renaming canonical object names such as Feature Seam.", gui_related: true, gui_classification_reason: "This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.", split_recommended: false, depends_on: ["PDS-003", "PDS-004", "PDS-005", "PNC-001", "UCC-001", "ACD-008", "CV-006"], unblocks: [], acceptance_criteria: ["RM-014 remains addressable as a fine-grained Run Modes PlanUnit with source-span coverage.", "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.", "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits", "python3 scripts/pm-plan-index.py validate"], risk_class: "ui_recovery_label_drift", reasoning_tier: "standard", context_scope: "runtime_governance_gui", implementation_surfaces: ["Plans/Run_Modes.md"], node_compile_hint: {mode: "runtime_governance_ui_explanation_terms", create_worknodes: false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Modes-S0017"], preserved_exact_tokens: ["allowed_action_ids[]", "deny", "manual fix", "abort node", "ELI5/Expert", "Feature Seam"], negative_constraints: ["ELI5/Expert must simplify explanation depth, not canonical object names."], preserved_contractrefs: ["ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md"], compatibility_only_notes: [], stale_retired_dispositions: [], owner_hints: ["Plans/Run_Modes.md", "Plans/human-in-the-loop.md", "Plans/UI_Command_Catalog.md", "Plans/assistant-chat-design.md"]}
```

### RM-015 - Global Concurrency Cap Defaults

```yaml
{plan_unit_id: "RM-015", unit_type: "requirement", status: "accepted", owner_doc: "Plans/Run_Modes.md", canonical_text: "Global run-strategy concurrency defaults are max_concurrent_crews_per_platform=4, max_concurrent_agents_per_crew=8, and max_total_active_agents=32; Persona or overlay configuration alone must not override them, and stale 5-crew/10-agent wording is retired.", gui_related: false, gui_classification_reason: "This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.", split_recommended: false, depends_on: ["PDS-003", "PDS-004", "PDS-005", "PNC-001", "SP-001", "PS-001"], unblocks: [], acceptance_criteria: ["RM-015 remains addressable as a fine-grained Run Modes PlanUnit with source-span coverage.", "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.", "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits", "python3 scripts/pm-plan-index.py validate"], risk_class: "budget_default_drift", reasoning_tier: "standard", context_scope: "runtime_budget_defaults", implementation_surfaces: ["Plans/Run_Modes.md"], node_compile_hint: {mode: "global_concurrency_cap_defaults", create_worknodes: false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Modes-S0018", "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Modes-S0019"], preserved_exact_tokens: ["max_concurrent_crews_per_platform=4", "max_concurrent_agents_per_crew=8", "max_total_active_agents=32", "5-crews / 10-agents", "queue until a slot is free"], negative_constraints: ["Three-level concurrency limits apply globally across all run strategies and MUST NOT be overridden by Persona or overlay configuration alone.", "PM MUST NOT silently discard or auto-widen queued work."], preserved_contractrefs: ["ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Executor_Protocol.md", "ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/interview-subagent-integration.md"], compatibility_only_notes: [], stale_retired_dispositions: ["Any 5-crews / 10-agents wording in downstream docs is stale drift and must be retired rather than treated as an alternate cap."], owner_hints: ["Plans/Run_Modes.md", "Plans/orchestrator-subagent-integration.md", "Plans/interview-subagent-integration.md", "Plans/Executor_Protocol.md"]}
```

### RM-016 - Run Envelope Budget Field Defaults

```yaml
{plan_unit_id: "RM-016", unit_type: "requirement", status: "accepted", owner_doc: "Plans/Run_Modes.md", canonical_text: "Run supervisors enforce canonical run-envelope budget fields across strategies, freezing them into the envelope across pause/resume: max_nesting_depth=4, max_total_spawned_agents=99, max_tool_rounds=200, max_wall_ms=1200000, max_estimated_tokens=80000, max_same_shell_failure=3, max_write_thrashing=5 writes/10 min, max_retryable_errors=3, inherited task_timeout_ms, and warn_budget_pct=80.", gui_related: false, gui_classification_reason: "This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.", split_recommended: false, depends_on: ["PDS-003", "PDS-004", "PDS-005", "PNC-001", "SP-001", "PS-001", "CBP-003"], unblocks: [], acceptance_criteria: ["RM-016 remains addressable as a fine-grained Run Modes PlanUnit with source-span coverage.", "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.", "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits", "python3 scripts/pm-plan-index.py validate"], risk_class: "budget_field_drift", reasoning_tier: "standard", context_scope: "runtime_budget_defaults", implementation_surfaces: ["Plans/Run_Modes.md"], node_compile_hint: {mode: "run_envelope_budget_fields", create_worknodes: false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Modes-S0020"], preserved_exact_tokens: ["max_nesting_depth", "max_total_spawned_agents", "max_tool_rounds", "max_wall_ms", "max_estimated_tokens", "max_same_shell_failure", "max_write_thrashing", "max_retryable_errors", "task_timeout_ms", "warn_budget_pct", "max_tokens", "max_wall_time"], negative_constraints: ["Budget overrides MAY narrow defaults per run, but MUST NOT widen beyond the hard policy ceiling.", "task_timeout_ms may narrow parent budget but MUST NOT exceed it."], preserved_contractrefs: ["ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md", "ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/orchestrator-subagent-integration.md", "ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/storage-plan.md"], compatibility_only_notes: ["Legacy A2A/OpenCode gap wording may call these ceilings max_tokens and max_wall_time; canonical keys are max_estimated_tokens and max_wall_ms."], stale_retired_dispositions: [], owner_hints: ["Plans/Run_Modes.md", "Plans/Executor_Protocol.md", "Plans/Contracts_V0.md", "Plans/CLI_Bridged_Providers.md", "Plans/storage-plan.md"]}
```

### RM-017 - Universal Kill And Terminal Reason Contract

```yaml
{plan_unit_id: "RM-017", unit_type: "requirement", status: "accepted", owner_doc: "Plans/Run_Modes.md", canonical_text: "Run kill enforcement distinguishes pre-dispatch/supervisor kill.* triggers from terminal done.* outcomes, persists canonical stop reasons, retires consumer-facing kill.task_timeout, and keeps post-response budget overrun as done.budget_exceeded after usage is durably recorded.", gui_related: false, gui_classification_reason: "This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.", split_recommended: false, depends_on: ["PDS-003", "PDS-004", "PDS-005", "PNC-001", "F2-086", "CBP-003", "PS-001", "CV-215", "SP-001"], unblocks: [], acceptance_criteria: ["RM-017 remains addressable as a fine-grained Run Modes PlanUnit with source-span coverage.", "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.", "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits", "python3 scripts/pm-plan-index.py validate"], risk_class: "stop_reason_drift", reasoning_tier: "standard", context_scope: "kill_conditions", implementation_surfaces: ["Plans/Run_Modes.md"], node_compile_hint: {mode: "universal_kill_terminal_reason_contract", create_worknodes: false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Modes-S0021", "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Modes-S0022"], preserved_exact_tokens: ["KILL-CONDITIONS", "done.failed", "kill.*", "done.*", "done.task_timeout", "kill.budget_exceeded", "done.budget_exceeded", "kill.task_timeout"], negative_constraints: ["kill.budget_exceeded remains pre-dispatch only.", "Post-response budget-overrun cases MUST NOT be folded back into pre-dispatch kill.budget_exceeded.", "kill.task_timeout is retired as a consumer-facing terminal alias."], preserved_contractrefs: ["ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/CLI_Bridged_Providers.md", "ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/Contracts_V0.md", "ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md", "ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md"], compatibility_only_notes: [], stale_retired_dispositions: ["kill.task_timeout is retired as a consumer-facing terminal alias."], owner_hints: ["Plans/Run_Modes.md", "Plans/FileSafe.md", "Plans/CLI_Bridged_Providers.md", "Plans/Executor_Protocol.md", "Plans/Contracts_V0.md", "Plans/usage-feature.md"]}
```

### RM-018 - Exact-Match Doom Loop Guard

```yaml
{plan_unit_id: "RM-018", unit_type: "requirement", status: "accepted", owner_doc: "Plans/Run_Modes.md", canonical_text: "The doom-loop guard compares only the same tool_name, serialized_args_hash, and error_message triple at the same nesting level across consecutive attempts; fuzzy, substring, or looks-similar matching is prohibited and broader retry suppression belongs to Tools.", gui_related: false, gui_classification_reason: "This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.", split_recommended: false, depends_on: ["PDS-003", "PDS-004", "PDS-005", "PNC-001", "T-001", "CV-215"], unblocks: [], acceptance_criteria: ["RM-018 remains addressable as a fine-grained Run Modes PlanUnit with source-span coverage.", "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.", "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits", "python3 scripts/pm-plan-index.py validate"], risk_class: "retry_guard_overreach", reasoning_tier: "standard", context_scope: "kill_conditions", implementation_surfaces: ["Plans/Run_Modes.md"], node_compile_hint: {mode: "exact_match_doom_loop_guard", create_worknodes: false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Modes-S0023"], preserved_exact_tokens: ["stop.identical_failure", "tool_name", "serialized_args_hash", "error_message", "same nesting level", "looks similar"], negative_constraints: ["Fuzzy matching, substring matching, and looks similar heuristics are prohibited for this terminal stop condition."], preserved_contractrefs: ["ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/Tools.md"], compatibility_only_notes: [], stale_retired_dispositions: [], owner_hints: ["Plans/Run_Modes.md", "Plans/Executor_Protocol.md", "Plans/Architecture_Invariants.md", "Plans/Tools.md"]}
```

### RM-019 - Signal Handling Shutdown And Startup Recovery

```yaml
{plan_unit_id: "RM-019", unit_type: "requirement", status: "accepted", owner_doc: "Plans/Run_Modes.md", canonical_text: "PM entrypoints own shutdown signal fan-out, process group isolation, platform-specific teardown, idempotent shutdown, durability flushing, cancellation outcome mapping, and startup crash recovery that synthesizes done.crashed with crash_recovered metadata instead of silently dropping unfinished runs.", gui_related: false, gui_classification_reason: "This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.", split_recommended: false, depends_on: ["PDS-003", "PDS-004", "PDS-005", "PNC-001", "SP-001", "CV-215"], unblocks: [], acceptance_criteria: ["RM-019 remains addressable as a fine-grained Run Modes PlanUnit with source-span coverage.", "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.", "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits", "python3 scripts/pm-plan-index.py validate"], risk_class: "runtime_lifecycle_drift", reasoning_tier: "standard", context_scope: "runtime_lifecycle", implementation_surfaces: ["Plans/Run_Modes.md"], node_compile_hint: {mode: "signal_shutdown_startup_recovery", create_worknodes: false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Modes-S0024"], preserved_exact_tokens: ["signal.NotifyContext", "SIGTERM", "SIGINT", "SIGHUP", "setsid", "CREATE_NEW_PROCESS_GROUP", "CTRL_BREAK_EVENT", "done.cancelled", "done.crashed", "crash_recovered"], negative_constraints: ["PM MUST NOT silently drop an incomplete run or rewrite it as done.failed without the crash marker."], preserved_contractrefs: ["ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md", "ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/LSPSupport.md, ContractName:Plans/Executor_Protocol.md", "ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/Contracts_V0.md", "ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Architecture_Invariants.md"], compatibility_only_notes: [], stale_retired_dispositions: [], owner_hints: ["Plans/Run_Modes.md", "Plans/Executor_Protocol.md", "Plans/Contracts_V0.md", "Plans/storage-plan.md", "Plans/LSPSupport.md"]}
```

### RM-020 - Resource Disposal And Helper Health Monitoring

```yaml
{plan_unit_id: "RM-020", unit_type: "requirement", status: "accepted", owner_doc: "Plans/Run_Modes.md", canonical_text: "Runtime teardown deterministically closes DB handles, MCP sessions, terminal shells, temporary files, and subprocess groups, emits diagnostics for failed teardown, mints new helper identity after restart, and monitors long-lived helper memory pressure for controlled restart or failover.", gui_related: false, gui_classification_reason: "This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.", split_recommended: false, depends_on: ["PDS-003", "PDS-004", "PDS-005", "PNC-001", "SP-001", "T-001", "CV-215"], unblocks: [], acceptance_criteria: ["RM-020 remains addressable as a fine-grained Run Modes PlanUnit with source-span coverage.", "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.", "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits", "python3 scripts/pm-plan-index.py validate"], risk_class: "helper_lifecycle_drift", reasoning_tier: "standard", context_scope: "runtime_lifecycle", implementation_surfaces: ["Plans/Run_Modes.md"], node_compile_hint: {mode: "resource_disposal_helper_health_monitoring", create_worknodes: false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Modes-S0025"], preserved_exact_tokens: ["Resource disposal and health monitoring", "DB handles", "MCP sessions", "terminal shells", "temporary files", "resident-set growth", "resource_pressure"], negative_constraints: ["PM MUST NOT silently reuse poisoned process state or abandoned shell/session state."], preserved_contractrefs: ["ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Tools.md, ContractName:Plans/orchestrator-subagent-integration.md", "ContractRef: ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Executor_Protocol.md"], compatibility_only_notes: [], stale_retired_dispositions: [], owner_hints: ["Plans/Run_Modes.md", "Plans/storage-plan.md", "Plans/Tools.md", "Plans/orchestrator-subagent-integration.md", "Plans/Architecture_Invariants.md"]}
```

### RM-021 - HTE Tool Observation Kill Contract

```yaml
{plan_unit_id: "RM-021", unit_type: "requirement", status: "accepted", owner_doc: "Plans/Run_Modes.md", canonical_text: "The first provider-originated tool_use observed during HTE terminates the run immediately with stop_reason kill.hte_tool_observed in the terminal normalized done event and persisted run.completed metadata.", gui_related: false, gui_classification_reason: "This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.", split_recommended: false, depends_on: ["PDS-003", "PDS-004", "PDS-005", "PNC-001", "CBP-003", "CBP-005", "T-001", "CV-215"], unblocks: [], acceptance_criteria: ["RM-021 remains addressable as a fine-grained Run Modes PlanUnit with source-span coverage.", "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.", "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits", "python3 scripts/pm-plan-index.py validate"], risk_class: "hte_kill_contract_drift", reasoning_tier: "standard", context_scope: "kill_conditions", implementation_surfaces: ["Plans/Run_Modes.md"], node_compile_hint: {mode: "hte_tool_observation_kill_contract", create_worknodes: false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Modes-S0026"], preserved_exact_tokens: ["kill.hte_tool_observed", "tool_use", "terminal normalized done event", "run.completed"], negative_constraints: ["HTE MUST NOT allow delegated tool execution."], preserved_contractrefs: ["ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Architecture_Invariants.md", "ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Tools.md"], compatibility_only_notes: [], stale_retired_dispositions: [], owner_hints: ["Plans/Run_Modes.md", "Plans/Executor_Protocol.md", "Plans/Architecture_Invariants.md", "Plans/Contracts_V0.md", "Plans/Tools.md"]}
```

### RM-022 - DAE Shell Failure And Write Thrash Counting

```yaml
{plan_unit_id: "RM-022", unit_type: "requirement", status: "accepted", owner_doc: "Plans/Run_Modes.md", canonical_text: "DAE-specific kill counting treats shell_failure as actual executed canonical shell invocation failures for one normalized fingerprint, excludes denials and UI-only terminal actions, resets on success or replacement, and treats write_thrash as qualifying content-changing writes to one normalized jail path in a sliding 10-minute window.", gui_related: false, gui_classification_reason: "This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.", split_recommended: false, depends_on: ["PDS-003", "PDS-004", "PDS-005", "PNC-001", "T-001", "SP-001", "UCC-001", "F2-086", "CBP-003"], unblocks: [], acceptance_criteria: ["RM-022 remains addressable as a fine-grained Run Modes PlanUnit with source-span coverage.", "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.", "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits", "python3 scripts/pm-plan-index.py validate"], risk_class: "dae_kill_counting_drift", reasoning_tier: "standard", context_scope: "kill_conditions", implementation_surfaces: ["Plans/Run_Modes.md"], node_compile_hint: {mode: "dae_shell_write_thrash_counting", create_worknodes: false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Modes-S0027"], preserved_exact_tokens: ["kill.shell_failure", "kill.write_thrash", "canonical shell fingerprint", "terminal_session_id", "shell-fingerprint", "terminal-normalized", "/replace/stop", "sliding 10-minute window"], negative_constraints: ["Policy denials, FileSafe blocks, validation failures, missing execution due to policy, and synthesized reconciler closures do not count as shell failures.", "Denied, blocked, no-diff, rollback, and Puppet-Master-owned post-processing writes do not count."], preserved_contractrefs: ["ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md, ContractName:Plans/UI_Command_Catalog.md", "ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/storage-plan.md"], compatibility_only_notes: ["Compatibility labels are canonicalized here: shell-fingerprint, terminal-normalized, and /replace/stop."], stale_retired_dispositions: [], owner_hints: ["Plans/Run_Modes.md", "Plans/Tools.md", "Plans/storage-plan.md", "Plans/UI_Command_Catalog.md", "Plans/FileSafe.md", "Plans/CLI_Bridged_Providers.md"]}
```

### RM-023 - DAE Mandatory End-Of-Run Scans

```yaml
{plan_unit_id: "RM-023", unit_type: "requirement", status: "accepted", owner_doc: "Plans/Run_Modes.md", canonical_text: "Every DAE terminal outcome runs mandatory FileSafe write-scope audit, security-filter scan, and diff reconciliation before finalization; scan failure escalates to done.failed with kill.post_scan_failure and persists scan name/details in stop-reason metadata.", gui_related: false, gui_classification_reason: "This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.", split_recommended: false, depends_on: ["PDS-003", "PDS-004", "PDS-005", "PNC-001", "F2-086", "CBP-003", "CV-215"], unblocks: [], acceptance_criteria: ["RM-023 remains addressable as a fine-grained Run Modes PlanUnit with source-span coverage.", "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.", "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits", "python3 scripts/pm-plan-index.py validate"], risk_class: "post_scan_gap", reasoning_tier: "standard", context_scope: "kill_conditions", implementation_surfaces: ["Plans/Run_Modes.md"], node_compile_hint: {mode: "dae_mandatory_end_of_run_scans", create_worknodes: false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Modes-S0028"], preserved_exact_tokens: ["FileSafe write-scope audit", "Security-filter scan", "Diff reconciliation", "done.failed", "kill.post_scan_failure", "scan_name = \"diff_reconciliation\""], negative_constraints: ["DAE terminal outcomes must not finalize before mandatory end-of-run scans complete."], preserved_contractrefs: ["ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/CLI_Bridged_Providers.md"], compatibility_only_notes: [], stale_retired_dispositions: [], owner_hints: ["Plans/Run_Modes.md", "Plans/FileSafe.md", "Plans/CLI_Bridged_Providers.md"]}
```

### RM-024 - Run Outcome Taxonomy

```yaml
{plan_unit_id: "RM-024", unit_type: "requirement", status: "accepted", owner_doc: "Plans/Run_Modes.md", canonical_text: "Every run terminates with exactly one canonical outcome from done.ok, done.failed, done.deferred, done.rotated, done.gutter, done.cancelled, or done.crashed, recorded in terminal done event and persisted through EventRecord/seglog without treating user cancellation or reveal-only terminal actions as generic failure or new runtime identity.", gui_related: false, gui_classification_reason: "This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.", split_recommended: false, depends_on: ["PDS-003", "PDS-004", "PDS-005", "PNC-001", "CV-215", "SP-001", "T-001", "UCC-001"], unblocks: [], acceptance_criteria: ["RM-024 remains addressable as a fine-grained Run Modes PlanUnit with source-span coverage.", "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.", "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits", "python3 scripts/pm-plan-index.py validate"], risk_class: "outcome_taxonomy_drift", reasoning_tier: "standard", context_scope: "run_outcomes", implementation_surfaces: ["Plans/Run_Modes.md"], node_compile_hint: {mode: "run_outcome_taxonomy", create_worknodes: false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Modes-S0029"], preserved_exact_tokens: ["done.ok", "done.failed", "done.deferred", "done.rotated", "done.gutter", "done.cancelled", "done.crashed", "done.payload.status", "done.payload.outcome", "terminal_session_id"], negative_constraints: ["done.failed is not a catch-all for intentionally requested stop paths.", "Clearing scrollback or revealing an existing terminal session does not mint a new run outcome."], preserved_contractrefs: ["ContractRef: ContractName:Plans/Contracts_V0.md#EventRecord, PolicyRule:Decision_Policy.md§2", "ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md", "ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/storage-plan.md"], compatibility_only_notes: [], stale_retired_dispositions: [], owner_hints: ["Plans/Run_Modes.md", "Plans/Contracts_V0.md", "Plans/Tools.md", "Plans/storage-plan.md", "Plans/UI_Command_Catalog.md", "Plans/Section15_MVP_Promoted_Features_Spec.md"]}
```

### RM-025 - Terminal Stop-Reason Refinements

```yaml
{plan_unit_id: "RM-025", unit_type: "requirement", status: "accepted", owner_doc: "Plans/Run_Modes.md", canonical_text: "Runtime stop-reason refinements preserve kill.budget_exceeded for pre-dispatch budget prevention, done.budget_exceeded for post-response overrun after durable usage recording, and done.task_timeout for elapsed-budget exhaustion after graceful teardown; kill.task_timeout is internal-only bookkeeping and done.timeout is retired.", gui_related: false, gui_classification_reason: "This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.", split_recommended: false, depends_on: ["PDS-003", "PDS-004", "PDS-005", "PNC-001", "CV-215", "SP-001"], unblocks: [], acceptance_criteria: ["RM-025 remains addressable as a fine-grained Run Modes PlanUnit with source-span coverage.", "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.", "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits", "python3 scripts/pm-plan-index.py validate"], risk_class: "stop_reason_drift", reasoning_tier: "standard", context_scope: "run_outcomes", implementation_surfaces: ["Plans/Run_Modes.md"], node_compile_hint: {mode: "terminal_stop_reason_refinements", create_worknodes: false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Modes-S0030"], preserved_exact_tokens: ["kill.budget_exceeded", "done.budget_exceeded", "done.task_timeout", "kill.task_timeout", "done.timeout", "run.completed"], negative_constraints: ["kill.task_timeout MUST NOT be emitted as the consumer-facing terminal alias.", "Consumers MUST NOT collapse post-response budget overruns back into pre-dispatch naming."], preserved_contractrefs: ["ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md", "ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md", "ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Contracts_V0.md", "ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/Architecture_Invariants.md"], compatibility_only_notes: [], stale_retired_dispositions: ["done.timeout is retired as a synonym."], owner_hints: ["Plans/Run_Modes.md", "Plans/usage-feature.md", "Plans/storage-plan.md", "Plans/Contracts_V0.md", "Plans/orchestrator-subagent-integration.md", "Plans/Executor_Protocol.md"]}
```

### RM-026 - Context Overlay And Rotation Effects

```yaml
{plan_unit_id: "RM-026", unit_type: "requirement", status: "accepted", owner_doc: "Plans/Run_Modes.md", canonical_text: "Run mode controls context overlays and rotation: ask uses read_only, plan uses read_only plus plan_output_scaffold_v1, regular/yolo use full_execution, read-only children and rotated follow-ups may narrow but never widen to full_execution, and ask/plan remain rotation-ineligible after deterministic compaction.", gui_related: false, gui_classification_reason: "This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.", split_recommended: false, depends_on: ["PDS-003", "PDS-004", "PDS-005", "PNC-001", "SP-001", "PS-001"], unblocks: [], acceptance_criteria: ["RM-026 remains addressable as a fine-grained Run Modes PlanUnit with source-span coverage.", "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.", "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits", "python3 scripts/pm-plan-index.py validate"], risk_class: "context_overlay_drift", reasoning_tier: "standard", context_scope: "context_management", implementation_surfaces: ["Plans/Run_Modes.md"], node_compile_hint: {mode: "context_overlay_rotation_effects", create_worknodes: false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Modes-S0031"], preserved_exact_tokens: ["read_only", "read_only + plan_output_scaffold_v1", "full_execution", "done.rotated", "Injected Context", "Rotation decision boundary"], negative_constraints: ["read_only excludes mutation-authority metadata.", "Child/subagent/rotated follow-up runs inherit the parent effective overlay and may narrow but MUST NOT widen a read-only overlay into full_execution.", "ask and plan are rotation-ineligible."], preserved_contractrefs: ["ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/FileSafe.md, ContractName:Plans/Run_Modes.md", "ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md", "ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Permissions_System.md"], compatibility_only_notes: [], stale_retired_dispositions: [], owner_hints: ["Plans/Run_Modes.md", "Plans/Prompt_Pipeline.md", "Plans/FileSafe.md", "Plans/Contracts_V0.md", "Plans/storage-plan.md", "Plans/Permissions_System.md"]}
```

### RM-027 - OpenCode Reference Boundary

```yaml
{plan_unit_id: "RM-027", unit_type: "requirement", status: "accepted", owner_doc: "Plans/Run_Modes.md", canonical_text: "OpenCode material is reference-only background for run modes; PM is not normatively based on OpenCode, and PM owner docs resolve mode, approval, TODO, and web-tool semantics when external baselines conflict.", gui_related: false, gui_classification_reason: "This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.", split_recommended: false, depends_on: ["PDS-003", "PDS-004", "PDS-005", "PNC-001", "PS-001"], unblocks: [], acceptance_criteria: ["RM-027 remains addressable as a fine-grained Run Modes PlanUnit with source-span coverage.", "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.", "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits", "python3 scripts/pm-plan-index.py validate"], risk_class: "external_reference_drift", reasoning_tier: "standard", context_scope: "external_reference_boundary", implementation_surfaces: ["Plans/Run_Modes.md"], node_compile_hint: {mode: "opencode_reference_boundary", create_worknodes: false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Modes-S0032"], preserved_exact_tokens: ["OpenCode baseline", "reference-only background", "PM is not “based on” OpenCode", "mode, approval, TODO, and web-tool semantics"], negative_constraints: [], preserved_contractrefs: ["ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/assistant-chat-design.md"], compatibility_only_notes: ["OpenCode material is reference-only background. Puppet Master run-mode semantics are PM-owned canon."], stale_retired_dispositions: [], owner_hints: ["Plans/Run_Modes.md", "Plans/Permissions_System.md", "Plans/assistant-chat-design.md"]}
```

### RM-028 - Cross-Mode Read-Only Search

```yaml
{plan_unit_id: "RM-028", unit_type: "requirement", status: "accepted", owner_doc: "Plans/Run_Modes.md", canonical_text: "Mode selection does not remove read-only repository search: agents and delegated read-only children may use grep in every runtime mode subject to the tool registry and permission policy while mutation remains bounded by the active mode ceiling.", gui_related: false, gui_classification_reason: "This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.", split_recommended: false, depends_on: ["PDS-003", "PDS-004", "PDS-005", "PNC-001", "T-001", "PS-001"], unblocks: [], acceptance_criteria: ["RM-028 remains addressable as a fine-grained Run Modes PlanUnit with source-span coverage.", "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.", "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits", "python3 scripts/pm-plan-index.py validate"], risk_class: "read_tool_permission_drift", reasoning_tier: "standard", context_scope: "mode_tooling_deltas", implementation_surfaces: ["Plans/Run_Modes.md"], node_compile_hint: {mode: "cross_mode_read_only_search", create_worknodes: false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Modes-S0033"], preserved_exact_tokens: ["grep", "read-only repository search", "tool registry", "permission policy", "authority ceiling"], negative_constraints: [], preserved_contractrefs: ["ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Tools.md, ContractName:Plans/Permissions_System.md"], compatibility_only_notes: [], stale_retired_dispositions: [], owner_hints: ["Plans/Run_Modes.md", "Plans/Tools.md", "Plans/Permissions_System.md"]}
```

### RM-029 - Ask And Plan Mode Tooling Deltas

```yaml
{plan_unit_id: "RM-029", unit_type: "requirement", status: "accepted", owner_doc: "Plans/Run_Modes.md", canonical_text: "ask may launch delegated read-only research children but no execution or mutation children; plan remains read-first with explicit planning artifacts, TODO projection, read/navigation LSP, limited read-only task tooling, and ask-gated websearch/webfetch/webextract/webresearch/webcrawl/webmap rather than a silent auto-deny shell.", gui_related: false, gui_classification_reason: "This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.", split_recommended: false, depends_on: ["PDS-003", "PDS-004", "PDS-005", "PNC-001", "T-001", "PS-001", "ACD-006"], unblocks: [], acceptance_criteria: ["RM-029 remains addressable as a fine-grained Run Modes PlanUnit with source-span coverage.", "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.", "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits", "python3 scripts/pm-plan-index.py validate"], risk_class: "read_only_tooling_drift", reasoning_tier: "standard", context_scope: "mode_tooling_deltas", implementation_surfaces: ["Plans/Run_Modes.md"], node_compile_hint: {mode: "ask_plan_tooling_deltas", create_worknodes: false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Modes-S0034", "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Modes-S0035"], preserved_exact_tokens: ["todoread", "todowrite", "task", "lsp", "/web", "websearch", "webfetch", "webextract", "webresearch", "webcrawl", "webmap", "Deep Plan"], negative_constraints: ["ask may not launch execution or mutation children.", "Plan mode is not a silent auto-deny shell around web tools."], preserved_contractrefs: ["ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/assistant-chat-design.md", "ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Permissions_System.md"], compatibility_only_notes: [], stale_retired_dispositions: [], owner_hints: ["Plans/Run_Modes.md", "Plans/Tools.md", "Plans/Permissions_System.md", "Plans/assistant-chat-design.md"]}
```

### RM-030 - Regular Yolo And Crew Authority Deltas

```yaml
{plan_unit_id: "RM-030", unit_type: "requirement", status: "accepted", owner_doc: "Plans/Run_Modes.md", canonical_text: "regular allows full child-run behavior subject to permission, provider, and capability rules; yolo may broaden execution but cannot bypass child capability narrowing, provider restrictions, or Copilot-native routing; Crew is an overlay over the current parent mode rather than a separate runtime mode.", gui_related: false, gui_classification_reason: "This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.", split_recommended: false, depends_on: ["PDS-003", "PDS-004", "PDS-005", "PNC-001", "T-001", "PS-001", "CBP-003", "ACD-006"], unblocks: [], acceptance_criteria: ["RM-030 remains addressable as a fine-grained Run Modes PlanUnit with source-span coverage.", "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.", "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits", "python3 scripts/pm-plan-index.py validate"], risk_class: "execution_authority_drift", reasoning_tier: "standard", context_scope: "mode_tooling_deltas", implementation_surfaces: ["Plans/Run_Modes.md"], node_compile_hint: {mode: "regular_yolo_crew_authority_deltas", create_worknodes: false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Modes-S0036", "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Modes-S0037", "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Modes-S0038"], preserved_exact_tokens: ["regular", "yolo", "Copilot-native routing exception", "Crew is an overlay", "FinalGUISpec"], negative_constraints: ["yolo still cannot bypass child capability narrowing, provider restrictions, or the Copilot-native routing exception.", "Crew is an overlay over the current parent mode, not a separate runtime mode."], preserved_contractrefs: ["ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Models_System.md, ContractName:Plans/Permissions_System.md", "ContractRef: ContractName:Plans/Models_System.md, ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Permissions_System.md", "ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FinalGUISpec.md"], compatibility_only_notes: [], stale_retired_dispositions: [], owner_hints: ["Plans/Run_Modes.md", "Plans/Tools.md", "Plans/Models_System.md", "Plans/Permissions_System.md", "Plans/CLI_Bridged_Providers.md", "Plans/orchestrator-subagent-integration.md", "Plans/FinalGUISpec.md"]}
```

### RM-031 - Strategy And Determinism Acceptance Criteria

```yaml
{plan_unit_id: "RM-031", unit_type: "requirement", status: "accepted", owner_doc: "Plans/Run_Modes.md", canonical_text: "Acceptance criteria AC-01 through AC-03 require HTE provider tool_use to kill with kill.hte_tool_observed, DAE end-of-run scans to run for every terminal outcome with scan failures escalating to done.failed, and identical inputs to deterministically produce the same mode/strategy pair.", gui_related: false, gui_classification_reason: "This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.", split_recommended: false, depends_on: ["PDS-003", "PDS-004", "PDS-005", "PNC-001", "T-001", "CBP-003", "CV-215"], unblocks: [], acceptance_criteria: ["RM-031 remains addressable as a fine-grained Run Modes PlanUnit with source-span coverage.", "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.", "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits", "python3 scripts/pm-plan-index.py validate"], risk_class: "acceptance_criteria_loss", reasoning_tier: "standard", context_scope: "acceptance_criteria", implementation_surfaces: ["Plans/Run_Modes.md"], node_compile_hint: {mode: "strategy_determinism_acceptance_criteria", create_worknodes: false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Modes-S0039"], preserved_exact_tokens: ["AC-01", "AC-02", "AC-03", "kill.hte_tool_observed", "done.failed", "mode, strategy"], negative_constraints: ["Mode selection is deterministic for identical run envelope and config inputs."], preserved_contractrefs: ["ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Progression_Gates.md", "ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Tools.md", "ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Contracts_V0.md", "ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/FileSafe.md", "ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/Run_Modes.md", "ContractRef: ContractName:Plans/Contracts_V0.md#EventRecord, ContractName:Plans/storage-plan.md", "ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/CLI_Bridged_Providers.md", "ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md", "ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/storage-plan.md", "ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/UI_Command_Catalog.md", "ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/storage-plan.md", "ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/storage-plan.md"], compatibility_only_notes: [], stale_retired_dispositions: [], owner_hints: ["Plans/Run_Modes.md", "Plans/Progression_Gates.md", "Plans/Tools.md", "Plans/Contracts_V0.md"]}
```

### RM-032 - Read-Only FileSafe Budget And Outcome Acceptance Criteria

```yaml
{plan_unit_id: "RM-032", unit_type: "requirement", status: "accepted", owner_doc: "Plans/Run_Modes.md", canonical_text: "Acceptance criteria AC-04 through AC-07 require ask/plan project-file mutations to be blocked by permissions, yolo to keep FileSafe guards active with user-visible warnings if disabled, budgets to be enforced regardless of mode, and exactly one outcome to be recorded in done and persisted to seglog.", gui_related: false, gui_classification_reason: "This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.", split_recommended: false, depends_on: ["PDS-003", "PDS-004", "PDS-005", "PNC-001", "PS-001", "F2-086", "SP-001", "CV-215"], unblocks: [], acceptance_criteria: ["RM-032 remains addressable as a fine-grained Run Modes PlanUnit with source-span coverage.", "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.", "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits", "python3 scripts/pm-plan-index.py validate"], risk_class: "acceptance_criteria_loss", reasoning_tier: "standard", context_scope: "acceptance_criteria", implementation_surfaces: ["Plans/Run_Modes.md"], node_compile_hint: {mode: "read_only_filesafe_budget_outcome_acceptance", create_worknodes: false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Modes-S0039"], preserved_exact_tokens: ["AC-04", "AC-05", "AC-06", "AC-07", "user-visible warning", "seglog"], negative_constraints: ["In ask and plan modes, no project-file mutation may occur.", "FileSafe guards MUST remain active in yolo mode."], preserved_contractrefs: ["ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Progression_Gates.md", "ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Tools.md", "ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Contracts_V0.md", "ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/FileSafe.md", "ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/Run_Modes.md", "ContractRef: ContractName:Plans/Contracts_V0.md#EventRecord, ContractName:Plans/storage-plan.md", "ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/CLI_Bridged_Providers.md", "ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md", "ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/storage-plan.md", "ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/UI_Command_Catalog.md", "ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/storage-plan.md", "ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/storage-plan.md"], compatibility_only_notes: [], stale_retired_dispositions: [], owner_hints: ["Plans/Run_Modes.md", "Plans/Permissions_System.md", "Plans/FileSafe.md", "Plans/Progression_Gates.md", "Plans/Contracts_V0.md", "Plans/storage-plan.md"]}
```

### RM-033 - UI Workflow Runtime Normalization Acceptance Criterion

```yaml
{plan_unit_id: "RM-033", unit_type: "requirement", status: "accepted", owner_doc: "Plans/Run_Modes.md", canonical_text: "Acceptance criterion AC-08 requires UI/workflow state to normalize deterministically into the canonical runtime mode enum before strategy selection, and Interview, BrainStorm, and Crew must not create additional runtime mode values.", gui_related: true, gui_classification_reason: "This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.", split_recommended: false, depends_on: ["PDS-003", "PDS-004", "PDS-005", "PNC-001", "ACD-008", "CV-002", "CV-006", "UCC-001"], unblocks: [], acceptance_criteria: ["RM-033 remains addressable as a fine-grained Run Modes PlanUnit with source-span coverage.", "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.", "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits", "python3 scripts/pm-plan-index.py validate"], risk_class: "ui_runtime_mapping_drift", reasoning_tier: "standard", context_scope: "acceptance_criteria_gui", implementation_surfaces: ["Plans/Run_Modes.md"], node_compile_hint: {mode: "ui_workflow_runtime_normalization_acceptance", create_worknodes: false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Modes-S0039"], preserved_exact_tokens: ["AC-08", "UI/workflow state", "Interview", "BrainStorm", "Crew", "canonical runtime mode enum"], negative_constraints: ["Interview, BrainStorm, and Crew MUST NOT create additional runtime mode values."], preserved_contractrefs: ["ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Progression_Gates.md", "ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Tools.md", "ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Contracts_V0.md", "ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/FileSafe.md", "ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/Run_Modes.md", "ContractRef: ContractName:Plans/Contracts_V0.md#EventRecord, ContractName:Plans/storage-plan.md", "ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/CLI_Bridged_Providers.md", "ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md", "ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/storage-plan.md", "ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/UI_Command_Catalog.md", "ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/storage-plan.md", "ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/storage-plan.md"], compatibility_only_notes: [], stale_retired_dispositions: [], owner_hints: ["Plans/Run_Modes.md", "Plans/Contracts_V0.md", "Plans/assistant-chat-design.md", "Plans/UI_Command_Catalog.md"]}
```

### RM-034 - DAE Provider Policy Acceptance Criteria

```yaml
{plan_unit_id: "RM-034", unit_type: "requirement", status: "accepted", owner_doc: "Plans/Run_Modes.md", canonical_text: "Acceptance criteria AC-09 and AC-10 require regular mode with dae disallowed to fall back to HTE while persisting regular_dae_disallowed, and yolo with dae disallowed to fail before provider spawn with yolo_requires_dae_provider rather than silently downgrading.", gui_related: false, gui_classification_reason: "This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.", split_recommended: false, depends_on: ["PDS-003", "PDS-004", "PDS-005", "PNC-001", "CBP-003", "CBP-005", "CV-215"], unblocks: [], acceptance_criteria: ["RM-034 remains addressable as a fine-grained Run Modes PlanUnit with source-span coverage.", "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.", "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits", "python3 scripts/pm-plan-index.py validate"], risk_class: "dae_policy_drift", reasoning_tier: "standard", context_scope: "acceptance_criteria", implementation_surfaces: ["Plans/Run_Modes.md"], node_compile_hint: {mode: "dae_provider_policy_acceptance", create_worknodes: false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Modes-S0039"], preserved_exact_tokens: ["AC-09", "AC-10", "cli_bridged_strategy = \"dae\"", "regular_dae_disallowed", "yolo_requires_dae_provider"], negative_constraints: ["yolo MUST NOT silently downgrade to HTE when provider dae_allowed is not true."], preserved_contractrefs: ["ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Progression_Gates.md", "ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Tools.md", "ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Contracts_V0.md", "ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/FileSafe.md", "ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/Run_Modes.md", "ContractRef: ContractName:Plans/Contracts_V0.md#EventRecord, ContractName:Plans/storage-plan.md", "ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/CLI_Bridged_Providers.md", "ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md", "ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/storage-plan.md", "ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/UI_Command_Catalog.md", "ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/storage-plan.md", "ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/storage-plan.md"], compatibility_only_notes: [], stale_retired_dispositions: [], owner_hints: ["Plans/Run_Modes.md", "Plans/CLI_Bridged_Providers.md"]}
```

### RM-035 - Kill Counting And Context Inheritance Acceptance Criteria

```yaml
{plan_unit_id: "RM-035", unit_type: "requirement", status: "accepted", owner_doc: "Plans/Run_Modes.md", canonical_text: "Acceptance criteria AC-11 through AC-13 preserve exact shell-failure counting exclusions, write-thrash counting exclusions, and child/subagent/rotated context overlay inheritance without widening read-only parents into full_execution.", gui_related: false, gui_classification_reason: "This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.", split_recommended: false, depends_on: ["PDS-003", "PDS-004", "PDS-005", "PNC-001", "T-001", "SP-001", "F2-086", "CV-215"], unblocks: [], acceptance_criteria: ["RM-035 remains addressable as a fine-grained Run Modes PlanUnit with source-span coverage.", "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.", "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits", "python3 scripts/pm-plan-index.py validate"], risk_class: "acceptance_criteria_loss", reasoning_tier: "standard", context_scope: "acceptance_criteria", implementation_surfaces: ["Plans/Run_Modes.md"], node_compile_hint: {mode: "kill_counting_context_inheritance_acceptance", create_worknodes: false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Modes-S0039"], preserved_exact_tokens: ["AC-11", "AC-12", "AC-13", "canonical shell fingerprint", "sliding 10-minute window", "full_execution"], negative_constraints: ["Policy denials, FileSafe blocks, UI-only terminal actions, and different shell fingerprints MUST NOT increment the same streak.", "Writes to different files, aged-out writes, and denied / blocked / no-diff operations MUST NOT trigger the ceiling.", "A read-only parent run ask or plan MUST NOT widen into full_execution context in any child run."], preserved_contractrefs: ["ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Progression_Gates.md", "ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Tools.md", "ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Contracts_V0.md", "ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/FileSafe.md", "ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/Run_Modes.md", "ContractRef: ContractName:Plans/Contracts_V0.md#EventRecord, ContractName:Plans/storage-plan.md", "ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/CLI_Bridged_Providers.md", "ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md", "ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/storage-plan.md", "ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/UI_Command_Catalog.md", "ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/storage-plan.md", "ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/storage-plan.md"], compatibility_only_notes: [], stale_retired_dispositions: [], owner_hints: ["Plans/Run_Modes.md", "Plans/Tools.md", "Plans/storage-plan.md", "Plans/FileSafe.md", "Plans/Contracts_V0.md"]}
```

### RM-036 - Terminal Session Identity Acceptance Criteria

```yaml
{plan_unit_id: "RM-036", unit_type: "requirement", status: "accepted", owner_doc: "Plans/Run_Modes.md", canonical_text: "Acceptance criteria AC-14 and AC-15 preserve terminal identity behavior: Open in Terminal and Show Terminal reveal the existing terminal_session_id when available, explicit restart or replacement mints a new terminal_session_id, and clear-scrollback/reveal-only actions preserve current runtime identity.", gui_related: true, gui_classification_reason: "This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.", split_recommended: false, depends_on: ["PDS-003", "PDS-004", "PDS-005", "PNC-001", "UCC-001", "SP-001"], unblocks: [], acceptance_criteria: ["RM-036 remains addressable as a fine-grained Run Modes PlanUnit with source-span coverage.", "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.", "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits", "python3 scripts/pm-plan-index.py validate"], risk_class: "terminal_identity_drift", reasoning_tier: "standard", context_scope: "acceptance_criteria_gui", implementation_surfaces: ["Plans/Run_Modes.md"], node_compile_hint: {mode: "terminal_session_identity_acceptance", create_worknodes: false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Modes-S0039"], preserved_exact_tokens: ["AC-14", "AC-15", "Open in Terminal", "Show Terminal", "terminal_session_id", "clear-scrollback"], negative_constraints: ["Open in Terminal or Show Terminal MUST reveal the same terminal_session_id when it still exists instead of spawning a duplicate shell."], preserved_contractrefs: ["ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Progression_Gates.md", "ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Tools.md", "ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Contracts_V0.md", "ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/FileSafe.md", "ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/Run_Modes.md", "ContractRef: ContractName:Plans/Contracts_V0.md#EventRecord, ContractName:Plans/storage-plan.md", "ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/CLI_Bridged_Providers.md", "ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md", "ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/storage-plan.md", "ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/UI_Command_Catalog.md", "ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/storage-plan.md", "ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/storage-plan.md"], compatibility_only_notes: [], stale_retired_dispositions: [], owner_hints: ["Plans/Run_Modes.md", "Plans/Section15_MVP_Promoted_Features_Spec.md", "Plans/UI_Command_Catalog.md", "Plans/storage-plan.md"]}
```

### RM-037 - Failure Classification And Failover Continuity

```yaml
{plan_unit_id: "RM-037", unit_type: "requirement", status: "accepted", owner_doc: "Plans/Run_Modes.md", canonical_text: "Run modes do not replace shared failure_class or blocked_reason_code taxonomy; failover reason codes hard_exhaustion_failover, auth_failure_failover, workspace_deactivated_failover, model_unsupported_failover, and provider_unhealthy_failover remain stable in reason_codes or owning runtime/audit envelopes, and mode changes do not rewrite original failover reasons.", gui_related: false, gui_classification_reason: "This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.", split_recommended: false, depends_on: ["PDS-003", "PDS-004", "PDS-005", "PNC-001", "PS-001", "SP-001"], unblocks: [], acceptance_criteria: ["RM-037 remains addressable as a fine-grained Run Modes PlanUnit with source-span coverage.", "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.", "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits", "python3 scripts/pm-plan-index.py validate"], risk_class: "failure_taxonomy_drift", reasoning_tier: "standard", context_scope: "blocked_recovery", implementation_surfaces: ["Plans/Run_Modes.md"], node_compile_hint: {mode: "failure_classification_failover_continuity", create_worknodes: false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Modes-S0040", "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Modes-S0041"], preserved_exact_tokens: ["failure_class", "blocked_reason_code", "hard_exhaustion_failover", "auth_failure_failover", "workspace_deactivated_failover", "model_unsupported_failover", "provider_unhealthy_failover", "reason_codes[]"], negative_constraints: ["Run mode does not replace runtime failure classification.", "Changing from ask or plan to an execution-capable mode does not rewrite the original failover reason."], preserved_contractrefs: ["ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/Models_System.md, ContractName:Plans/usage-feature.md"], compatibility_only_notes: [], stale_retired_dispositions: [], owner_hints: ["Plans/Run_Modes.md", "Plans/Multi-Account.md", "Plans/Models_System.md", "Plans/usage-feature.md"]}
```

### RM-038 - Headless Ask Denial And Counter Exclusion

```yaml
{plan_unit_id: "RM-038", unit_type: "requirement", status: "accepted", owner_doc: "Plans/Run_Modes.md", canonical_text: "Headless ask denial remains explicit and non-magical: when tool policy resolves to ask and no interactive approval path exists, headless_ask_denied is blocked/denied rather than auto-retry, and blocked outcomes do not count as qualifying writes or retryable provider errors.", gui_related: false, gui_classification_reason: "This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.", split_recommended: false, depends_on: ["PDS-003", "PDS-004", "PDS-005", "PNC-001", "PS-001", "T-001", "F2-086", "CV-215"], unblocks: [], acceptance_criteria: ["RM-038 remains addressable as a fine-grained Run Modes PlanUnit with source-span coverage.", "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.", "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits", "python3 scripts/pm-plan-index.py validate"], risk_class: "blocked_retry_drift", reasoning_tier: "standard", context_scope: "blocked_recovery", implementation_surfaces: ["Plans/Run_Modes.md"], node_compile_hint: {mode: "headless_ask_denial_counter_exclusion", create_worknodes: false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Modes-S0042", "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Modes-S0043"], preserved_exact_tokens: ["headless_ask_denied", "blocked outcomes", "qualifying writes", "retryable provider errors", "max_retryable_errors", "provider_transient"], negative_constraints: ["headless_ask_denied is a blocked/denied outcome, not an auto-retry class.", "Blocked outcomes do not count as qualifying writes.", "Blocked outcomes do not count as retryable provider errors."], preserved_contractrefs: [], compatibility_only_notes: [], stale_retired_dispositions: [], owner_hints: ["Plans/Run_Modes.md", "Plans/Tools.md", "Plans/Permissions_System.md", "Plans/FileSafe.md"]}
```

### RM-039 - Safe-Point Applicability And Addendum Acceptance

```yaml
{plan_unit_id: "RM-039", unit_type: "requirement", status: "accepted", owner_doc: "Plans/Run_Modes.md", canonical_text: "Runtime safe points are required only for mutation-capable attempts: ask/plan remain read-only and need no mutation safe points for ordinary planning or inspection, while regular/yolo create safe points before risky mutation-capable attempts; addendum acceptance preserves retry taxonomy, explicit headless denial, blocked-counter exclusions, and safe-point creation by execution authority.", gui_related: false, gui_classification_reason: "This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.", split_recommended: false, depends_on: ["PDS-003", "PDS-004", "PDS-005", "PNC-001", "F2-086", "T-001", "PS-001"], unblocks: [], acceptance_criteria: ["RM-039 remains addressable as a fine-grained Run Modes PlanUnit with source-span coverage.", "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.", "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits", "python3 scripts/pm-plan-index.py validate"], risk_class: "safe_point_drift", reasoning_tier: "standard", context_scope: "safe_points", implementation_surfaces: ["Plans/Run_Modes.md"], node_compile_hint: {mode: "safe_point_applicability_addendum_acceptance", create_worknodes: false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Modes-S0044", "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Modes-S0045"], preserved_exact_tokens: ["Runtime safe points", "mutation-capable attempts", "Run modes do not invent alternative retry taxonomies", "Safe-point creation follows execution authority"], negative_constraints: ["ask and plan do not require mutation safe points for ordinary planning/inspection work.", "Safe-point creation follows execution authority, not generic run existence."], preserved_contractrefs: [], compatibility_only_notes: [], stale_retired_dispositions: [], owner_hints: ["Plans/Run_Modes.md", "Plans/FileSafe.md", "Plans/Tools.md", "Plans/Permissions_System.md"]}
```

### RM-040 - Worktree Binding Across Modes

```yaml
{plan_unit_id: "RM-040", unit_type: "requirement", status: "accepted", owner_doc: "Plans/Run_Modes.md", canonical_text: "All Assistant Chat modes operate within the active thread worktree when one is bound: Ask reads, Agent edits, Plan/Deep Plan executes plans, and Debug targets the worktree; mode transitions do not change worktree binding because binding is thread-level, not mode-level.", gui_related: false, gui_classification_reason: "This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.", split_recommended: false, depends_on: ["PDS-003", "PDS-004", "PDS-005", "PNC-001", "ACD-006", "UCC-001"], unblocks: [], acceptance_criteria: ["RM-040 remains addressable as a fine-grained Run Modes PlanUnit with source-span coverage.", "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.", "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits", "python3 scripts/pm-plan-index.py validate"], risk_class: "worktree_binding_drift", reasoning_tier: "standard", context_scope: "worktree_runtime_modes", implementation_surfaces: ["Plans/Run_Modes.md"], node_compile_hint: {mode: "worktree_binding_across_modes", create_worknodes: false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Modes-S0046", "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Modes-S0047", "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Modes-S0048"], preserved_exact_tokens: ["Ask, Agent, Plan, Deep Plan, Debug", "thread-level property", "not a mode-level property", "worktree binding"], negative_constraints: ["Mode transitions do not change worktree binding."], preserved_contractrefs: ["ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/UI_Command_Catalog.md"], compatibility_only_notes: [], stale_retired_dispositions: [], owner_hints: ["Plans/Run_Modes.md", "Plans/assistant-chat-design.md", "Plans/Executor_Protocol.md", "Plans/UI_Command_Catalog.md"]}
```

### RM-041 - Worktree GUI Controls Across Modes

```yaml
{plan_unit_id: "RM-041", unit_type: "requirement", status: "accepted", owner_doc: "Plans/Run_Modes.md", canonical_text: "Worktree commands cmd.chat.worktree.* remain available in all modes subject to when-clauses, and the worktree header button and dropdown menu are always visible regardless of current mode.", gui_related: true, gui_classification_reason: "This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.", split_recommended: false, depends_on: ["PDS-003", "PDS-004", "PDS-005", "PNC-001", "ACD-008", "UCC-001"], unblocks: [], acceptance_criteria: ["RM-041 remains addressable as a fine-grained Run Modes PlanUnit with source-span coverage.", "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.", "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits", "python3 scripts/pm-plan-index.py validate"], risk_class: "worktree_gui_affordance_drift", reasoning_tier: "standard", context_scope: "worktree_runtime_gui", implementation_surfaces: ["Plans/Run_Modes.md"], node_compile_hint: {mode: "worktree_gui_controls_across_modes", create_worknodes: false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Modes-S0048"], preserved_exact_tokens: ["cmd.chat.worktree.*", "when-clauses", "worktree header button", "dropdown menu", "always visible"], negative_constraints: [], preserved_contractrefs: ["ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/UI_Command_Catalog.md"], compatibility_only_notes: [], stale_retired_dispositions: [], owner_hints: ["Plans/Run_Modes.md", "Plans/assistant-chat-design.md", "Plans/UI_Command_Catalog.md"]}
```

### RM-042 - Blocked Classification Resume And Restore Rules

```yaml
{plan_unit_id: "RM-042", unit_type: "requirement", status: "accepted", owner_doc: "Plans/Run_Modes.md", canonical_text: "Runtime mode affects immediate recovery affordances but not blocked classification: interactive modes may present auth/approval/clarification, headless modes yield blocked_reason_code=headless_ask_denied, later mode/prerequisite changes may resume by creating a new attempt snapshot without rewriting original blocked classification, and restore-before-rerun safe-point policy still applies.", gui_related: false, gui_classification_reason: "This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.", split_recommended: false, depends_on: ["PDS-003", "PDS-004", "PDS-005", "PNC-001", "PS-001", "F2-086", "SP-001"], unblocks: [], acceptance_criteria: ["RM-042 remains addressable as a fine-grained Run Modes PlanUnit with source-span coverage.", "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.", "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits", "python3 scripts/pm-plan-index.py validate"], risk_class: "blocked_recovery_drift", reasoning_tier: "standard", context_scope: "blocked_recovery", implementation_surfaces: ["Plans/Run_Modes.md"], node_compile_hint: {mode: "blocked_classification_resume_restore_rules", create_worknodes: false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Modes-S0048", "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Modes-S0049", "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Modes-S0050"], preserved_exact_tokens: ["blocked_reason_code = headless_ask_denied", "mode change plus prerequisite resolution", "new attempt snapshot", "restore-before-rerun"], negative_constraints: ["A later mode change does not rewrite the original blocked classification.", "Mode change alone is insufficient when policy requires restore-before-rerun."], preserved_contractrefs: ["ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/UI_Command_Catalog.md"], compatibility_only_notes: [], stale_retired_dispositions: [], owner_hints: ["Plans/Run_Modes.md", "Plans/Permissions_System.md", "Plans/FileSafe.md", "Plans/storage-plan.md"]}
```

### RM-043 - Deferred Waiting Run State

```yaml
{plan_unit_id: "RM-043", unit_type: "requirement", status: "accepted", owner_doc: "Plans/Run_Modes.md", canonical_text: "Deferred/waiting run semantics keep a run active while any node is runnable; if no node is runnable but blocked, backoff, or prerequisite-waiting work remains, the run is deferred/waiting rather than terminal, and terminal completion requires no runnable, blocked, backoff, or unresolved prerequisite work.", gui_related: false, gui_classification_reason: "This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.", split_recommended: false, depends_on: ["PDS-003", "PDS-004", "PDS-005", "PNC-001", "CV-215", "SP-001"], unblocks: [], acceptance_criteria: ["RM-043 remains addressable as a fine-grained Run Modes PlanUnit with source-span coverage.", "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.", "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits", "python3 scripts/pm-plan-index.py validate"], risk_class: "run_state_taxonomy_drift", reasoning_tier: "standard", context_scope: "blocked_recovery", implementation_surfaces: ["Plans/Run_Modes.md"], node_compile_hint: {mode: "deferred_waiting_run_state", create_worknodes: false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Modes-S0051", "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Modes-S0052"], preserved_exact_tokens: ["deferred / Waiting Run Mode Semantics", "runnable", "blocked/backoff/prerequisite-waiting", "Terminal completion"], negative_constraints: ["No-runnable with blocked/backoff/prerequisite-waiting work is deferred/waiting rather than terminal."], preserved_contractrefs: [], compatibility_only_notes: [], stale_retired_dispositions: [], owner_hints: ["Plans/Run_Modes.md", "Plans/Contracts_V0.md", "Plans/storage-plan.md"]}
```

### RM-044 - Headless Blocked Notice And Status Semantics

```yaml
{plan_unit_id: "RM-044", unit_type: "requirement", status: "accepted", owner_doc: "Plans/Run_Modes.md", canonical_text: "Headless blocked discovery emits blocked_notice with blocked_reason_code=headless_ask_denied, surfaces blocked node count in CLI/log or dashboard summaries when available, includes the exact missing permission or approval, and returns status unavailable with reason headless to tool and operation-card consumers when no interactive presenter exists.", gui_related: false, gui_classification_reason: "This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.", split_recommended: false, depends_on: ["PDS-003", "PDS-004", "PDS-005", "PNC-001", "CV-215", "T-001", "UCC-001"], unblocks: [], acceptance_criteria: ["RM-044 remains addressable as a fine-grained Run Modes PlanUnit with source-span coverage.", "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.", "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits", "python3 scripts/pm-plan-index.py validate"], risk_class: "headless_blocked_signal_drift", reasoning_tier: "standard", context_scope: "blocked_recovery", implementation_surfaces: ["Plans/Run_Modes.md"], node_compile_hint: {mode: "headless_blocked_notice_status_semantics", create_worknodes: false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Modes-S0053", "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Modes-S0055", "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Modes-S0056"], preserved_exact_tokens: ["blocked_notice", "blocked_reason_code: headless_ask_denied", "blocked node count", "status: \"unavailable\"", "reason: \"headless\"", "operation-card consumers"], negative_constraints: ["Headless contexts must return unavailable/headless rather than presenting unavailable interactive affordances."], preserved_contractrefs: [], compatibility_only_notes: [], stale_retired_dispositions: [], owner_hints: ["Plans/Run_Modes.md", "Plans/Contracts_V0.md", "Plans/Tools.md", "Plans/UI_Command_Catalog.md"]}
```

### RM-045 - Headless UI Badge And GUI Recovery Exclusions

```yaml
{plan_unit_id: "RM-045", unit_type: "requirement", status: "accepted", owner_doc: "Plans/Run_Modes.md", canonical_text: "If a UI session is attached, headless blocked discovery may surface a dashboard badge or notification; headless contexts must not offer GUI-only recovery actions such as Open in Terminal and must instead provide resume guidance, permission-preset adjustment, interactive mode change, allowed fallback strategy, orchestrator-facing blockage, or abort guidance.", gui_related: true, gui_classification_reason: "This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.", split_recommended: false, depends_on: ["PDS-003", "PDS-004", "PDS-005", "PNC-001", "ACD-008", "UCC-001", "PS-001"], unblocks: [], acceptance_criteria: ["RM-045 remains addressable as a fine-grained Run Modes PlanUnit with source-span coverage.", "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.", "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits", "python3 scripts/pm-plan-index.py validate"], risk_class: "headless_gui_affordance_drift", reasoning_tier: "standard", context_scope: "blocked_recovery_gui", implementation_surfaces: ["Plans/Run_Modes.md"], node_compile_hint: {mode: "headless_ui_badge_recovery_exclusions", create_worknodes: false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Modes-S0053", "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Modes-S0056"], preserved_exact_tokens: ["dashboard badge", "UI session", "Open in Terminal", "resume guidance", "permission-preset adjustment", "interactive mode change", "abort the blocked node"], negative_constraints: ["Do not offer GUI-only recovery actions such as Open in Terminal from a headless context."], preserved_contractrefs: [], compatibility_only_notes: [], stale_retired_dispositions: [], owner_hints: ["Plans/Run_Modes.md", "Plans/UI_Command_Catalog.md", "Plans/assistant-chat-design.md", "Plans/Permissions_System.md"]}
```

### RM-046 - Mutation Classifier And Safe-Point Alignment

```yaml
{plan_unit_id: "RM-046", unit_type: "requirement", status: "accepted", owner_doc: "Plans/Run_Modes.md", canonical_text: "Run modes do not redefine mutation_capable: the tool registry declares mutation_capable bool default false, the node planner propagates it into node plans, and modes only control whether mutation-capable attempts may occur and therefore whether safe points are relevant.", gui_related: false, gui_classification_reason: "This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.", split_recommended: false, depends_on: ["PDS-003", "PDS-004", "PDS-005", "PNC-001", "T-001", "F2-086", "CV-215"], unblocks: [], acceptance_criteria: ["RM-046 remains addressable as a fine-grained Run Modes PlanUnit with source-span coverage.", "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.", "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits", "python3 scripts/pm-plan-index.py validate"], risk_class: "mutation_classifier_drift", reasoning_tier: "standard", context_scope: "safe_points", implementation_surfaces: ["Plans/Run_Modes.md"], node_compile_hint: {mode: "mutation_classifier_safe_point_alignment", create_worknodes: false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Modes-S0054", "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Modes-S0055", "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Modes-S0057"], preserved_exact_tokens: ["mutation_capable", "tool registry", "default false", "node planner", "node plan record", "regular and yolo modes", "ask and plan modes"], negative_constraints: ["Run modes do not override mutation_capable classification."], preserved_contractrefs: ["ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Tools.md, ContractName:Plans/Contracts_V0.md"], compatibility_only_notes: [], stale_retired_dispositions: [], owner_hints: ["Plans/Run_Modes.md", "Plans/Executor_Protocol.md", "Plans/Tools.md", "Plans/Contracts_V0.md", "Plans/FileSafe.md"]}
```

### RM-047 - Runtime Identity And Blocked-Policy Continuity

```yaml
{plan_unit_id: "RM-047", unit_type: "requirement", status: "accepted", owner_doc: "Plans/Run_Modes.md", canonical_text: "Runtime identity and blocked-policy continuity require execution_role, requested_account_id, operational_identity, account-switch and pressure ownership, blocked_sequence minting and persistence, startup recovery rehydration/handshake, unchanged DAE jail/approval policy ownership, usage switch-history, and usage execution-role follow-through across mode changes and blocked recovery; cov-159 exact item markers remain lineage evidence.", gui_related: false, gui_classification_reason: "This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.", split_recommended: false, depends_on: ["PDS-003", "PDS-004", "PDS-005", "PNC-001", "SP-001", "PS-001", "CBP-003", "CV-215"], unblocks: [], acceptance_criteria: ["RM-047 remains addressable as a fine-grained Run Modes PlanUnit with source-span coverage.", "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.", "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits", "python3 scripts/pm-plan-index.py validate"], risk_class: "runtime_identity_drift", reasoning_tier: "standard", context_scope: "runtime_identity", implementation_surfaces: ["Plans/Run_Modes.md"], node_compile_hint: {mode: "runtime_identity_blocked_policy_continuity", create_worknodes: false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Modes-S0058", "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Modes-S0059"], preserved_exact_tokens: ["execution_role", "requested_account_id", "operational_identity", "account-switch", "blocked_sequence", "startup recovery handshake", "DAE jail/approval policy", "usage switch-history", "usage execution-role follow-through", "cov-159 exact item present"], negative_constraints: ["Mode changes and blocked recovery must not drop runtime identity or blocked-policy continuity fields."], preserved_contractrefs: [], compatibility_only_notes: ["cov-159 exact item present markers are preserved as source-lineage evidence, not new product vocabulary."], stale_retired_dispositions: [], owner_hints: ["Plans/Run_Modes.md", "Plans/storage-plan.md", "Plans/Permissions_System.md", "Plans/CLI_Bridged_Providers.md", "Plans/usage-feature.md"]}
```

### RM-001 - Run Modes Retired Source-Preserving Bridge

```yaml
{plan_unit_id: "RM-001", unit_type: "compatibility_disposition", status: "retired", owner_doc: "Plans/Run_Modes.md", canonical_text: "RM-001 is retired to migration-lineage-only compatibility disposition after Phase 2B batch 165. Run_Modes-S0001 through Run_Modes-S0059 are covered by fine-grained PlanUnits RM-002 through RM-047 or explicit split coverage, while Run_Modes-S0060, S0061, and S0063 are generated structural/audit dispositions and Run_Modes-S0062 is retired bridge lineage. RM-001 must not re-own or override implementation-facing PlanUnits and must not use source_preserving_planunit compile mode.", gui_related: false, gui_classification_reason: "The live retired bridge is migration/audit metadata only; historical GUI-related bridge tokens remain preserved by span_map and coverage_map.", split_recommended: false, depends_on: ["RM-002", "RM-003", "RM-004", "RM-005", "RM-006", "RM-007", "RM-008", "RM-009", "RM-010", "RM-011", "RM-012", "RM-013", "RM-014", "RM-015", "RM-016", "RM-017", "RM-018", "RM-019", "RM-020", "RM-021", "RM-022", "RM-023", "RM-024", "RM-025", "RM-026", "RM-027", "RM-028", "RM-029", "RM-030", "RM-031", "RM-032", "RM-033", "RM-034", "RM-035", "RM-036", "RM-037", "RM-038", "RM-039", "RM-040", "RM-041", "RM-042", "RM-043", "RM-044", "RM-045", "RM-046", "RM-047"], unblocks: [], acceptance_criteria: ["Run_Modes-S0001 through Run_Modes-S0059 remain mapped to fine-grained PlanUnits RM-002 through RM-047 or explicit split coverage rather than RM-001.", "Run_Modes-S0060, S0061, and S0063 are structurally dispositioned as generated metadata.", "Run_Modes-S0062 is explicitly dispositioned as retired generated bridge lineage.", "RM-001 no longer uses node_compile_hint.mode=source_preserving_planunit.", "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits", "python3 scripts/pm-plan-index.py validate"], risk_class: "residual_bridge_overreach", reasoning_tier: "standard", context_scope: "run_modes_retired_bridge", implementation_surfaces: ["Plans/Run_Modes.md"], node_compile_hint: {mode: "source_preserving_bridge_retired", create_worknodes: false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Modes-S0060", "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Modes-S0061", "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Modes-S0062", "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Modes-S0063"], preserved_exact_tokens: ["RM-001", "Owner / Consumer Map", "PlanUnits", "Migration Coverage", "source_preserving_planunit", "source_preserving_bridge_retired", "Run_Modes-S0060", "Run_Modes-S0061", "Run_Modes-S0062", "Run_Modes-S0063"], negative_constraints: ["RM-001 must not provide product implementation coverage for Run_Modes-S0001 through Run_Modes-S0059.", "RM-001 must not override RM-002 through RM-047 or structural dispositions.", "RM-001 must not use source_preserving_planunit compile mode after Phase 2B batch 165."], preserved_contractrefs: ["ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md", "ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md'", "ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/FileSafe.md, ContractName:Plans/Architecture_Invariants.md'", "ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Commands_System.md, ContractName:Plans/orchestrator-subagent-integration.md'", "ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FileSafe.md, ContractName:Plans/Prompt_Pipeline.md'", "ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/storage-plan.md'", "ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Prompt_Pipeline.md'", "ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/FileSafe.md, ContractName:Plans/Prompt_Pipeline.md'", "ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Architecture_Invariants.md#INV-009'", "ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/assistant-chat-design.md'"], compatibility_only_notes: ["The retired bridge remains only as migration-lineage compatibility metadata; historical ContractRefs, negative constraints, compatibility notes, stale/retired evidence, and GUI-related bridge markers remain preserved in span_map and coverage_map."], stale_retired_dispositions: ["source_preserving_bridge_retired"], owner_hints: ["Plans/Run_Modes.md"]}
```

## Migration Coverage

Original hash: `a430763e3be8df6d28f0bd8e8563eb2428ce42663485d0412aaacf8a41d3706f`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/anchor_aliases.json`

Phase 2B batch 163 atomized `Run_Modes-S0001` through `Run_Modes-S0029` into fine-grained PlanUnits `RM-002` through `RM-024`. Phase 2B batch 164 atomized `Run_Modes-S0030` through `Run_Modes-S0059` into fine-grained PlanUnits `RM-025` through `RM-047`. Phase 2B batch 165 structurally dispositioned generated tail spans `Run_Modes-S0060`, `Run_Modes-S0061`, and `Run_Modes-S0063`, and retired `Run_Modes-S0062` as the `RM-001` bridge lineage. `RM-001` is migration-lineage compatibility only and no longer uses `source_preserving_planunit` compile mode. These batches did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and they did not create WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code.

## Ledger Compile Addendum - pldg-20260630-001-feature-intake

This addendum compiles containerized-host run-mode authority and blocked-outcome rules. It does not create WorkNodes, NodeSeeds, executable queues, runtime dispatch, implementation files, generated governance artifacts, or production build tasks.

### RM-048 - Containerized Host Run-Mode Authority And Blocked Outcomes

```yaml
plan_unit_id: RM-048
unit_type: requirement
status: accepted
owner_doc: Plans/Run_Modes.md
canonical_text: >-
  Containerized-host availability does not widen run-mode authority. HTE remains the default posture when Puppet Master
  dispatches hosted actions, DAE is allowed only under existing run-mode and provider policy, and yolo remains DAE with
  mandatory guardrails. Apps/services under test, PM work, provider tools, agent harnesses, shells, and integration
  commands may use host capability context only where runtime execution is later enabled and authority allows it.
  Discovery/configuration/GUI availability is not permission to mutate, attach, expose ports, push images, inject
  secrets, use remote hosts, or certify completion. Blocked host outcomes such as permission_denied, filesafe_blocked,
  runtime_disabled, runtime_unavailable, capability_unavailable, host_untrusted, host_unreachable, and test_gap_policy
  remain `blocked != failed`.
gui_related: false
gui_classification_reason: Run-mode authority and blocked semantics are backend runtime policy, not GUI presentation.
depends_on: [RM-003, RM-008, RM-009]
unblocks: [T-166, CBP-023, GRS-032, OSI-431]
acceptance_criteria:
  - Host capability context cannot authorize mutation outside ask/plan/regular/yolo run-mode constraints.
  - HTE remains default for PM-owned dispatch unless DAE is explicitly selected and policy allows it.
  - DAE and yolo host work require existing DAE guardrails, FileSafe scans, permission snapshots, and receipt chains.
  - Blocked host outcomes are counted and surfaced as blocked states, not execution failures.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future run-mode host authority fixtures
  - future blocked != failed host outcome fixtures
risk_class: host_run_mode_authority_drift
reasoning_tier: high
context_scope: containerized_host_run_modes
implementation_surfaces:
  - Plans/Run_Modes.md
  - future run-mode resolver
node_compile_hint:
  mode: containerized_host_run_mode_authority
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0029
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0034
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0037
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0044
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0053
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0060
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0069
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0079
source_atom_ids: [atom-0029, atom-0034, atom-0037, atom-0044, atom-0053, atom-0060, atom-0069, atom-0079]
decision_refs: [dec-0005, dec-0008, dec-0017]
preserved_exact_tokens:
  - "HTE"
  - "DAE"
  - "regular"
  - "yolo"
  - "blocked != failed"
  - "where runtime execution is later enabled and authority allows it"
  - "permission_denied"
  - "filesafe_blocked"
  - "runtime_disabled"
  - "runtime_unavailable"
  - "capability_unavailable"
  - "host_untrusted"
  - "host_unreachable"
  - "test_gap_policy"
negative_constraints:
  - Discovery/configuration/GUI availability is not mutation authority.
  - Do not imply runtime dispatch, WorkNodes, NodeSeeds, executable queues, or PlanCompile runtime are enabled.
  - Do not treat containerization itself as proof of sandbox safety or test success.
  - Do not count blocked permission/FileSafe/policy outcomes as execution failures.
owner_hints:
  - Plans/Run_Modes.md
  - Plans/Executor_Protocol.md
  - Plans/Tools.md
  - Plans/CLI_Bridged_Providers.md
  - Plans/orchestrator-subagent-integration.md
```

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum repairs non-runtime run-mode rows without creating WorkNodes, implementation files, runtime artifacts, or PNC-019 evidence.

- Repairs `sfk-f6bc657026c94cc22b43a8b1`: unresolved P5 run-mode governance recovery requirements are tracked as owner-routed blockers, not live mode behavior. Fields are `blocker_id`, `owner_doc_ref`, `conflict_summary`, `status`, `reopen_condition`, and `created_at_utc`.
- Repairs `sfk-bc255c3a3c2b772302812837`: YOLO is never approval-free for non-bypassable guards. It skips only optional prompts; FileSafe, permissions, policy, secret, protected-branch, and remote-side-effect guards still block or require approval.

## Usage GUI Propagation Addendum - 2026-07-09

This addendum binds run-mode outcomes to UsageRecord settlement projection. It creates no WorkNodes, NodeSeeds, executable queues, implementation files, runtime artifacts, generated wiring rows, production build tasks, final manifests, or PNC-019 receipts.

### RM-049 - Usage Settlement And Background Contribution Run-Mode Projection

```yaml
plan_unit_id: RM-049
unit_type: requirement
status: accepted
owner_doc: Plans/Run_Modes.md
canonical_text: >-
  Run-mode outcomes preserve UsageRecord settlement lifecycle and hidden/background contribution identity across ask, plan, regular, yolo, HTE, and DAE surfaces. Partial streams, aborted streams, retries, escalations, blocked outcomes, permission denials, FileSafe blocks, runtime_disabled, provider failures, and adjusted settlements keep their usage_event_ref, provider_attempt_ref, attempt_id, dedupe_key, parent_usage_record_id, settlement_status, partial_reason, failure_class, and accepted/ignored rollup state. GUI consumers render streaming_partial, failed, adjusted, blocked, unknown, and settled distinctly and do not treat blocked != failed runtime outcomes as zero usage or final settled cost.
gui_related: false
gui_classification_reason: Run-mode outcome semantics feed GUI projections but are backend policy/state contracts.
depends_on: [RM-024, RM-048, UF-087, UF-088]
unblocks: []
acceptance_criteria:
  - Partial/aborted stream fixtures preserve UsageRecord refs and settlement_status without showing settled/final copy.
  - Retry/escalation fixtures count accepted usage once through dedupe_key while preserving failed or superseded attempts for audit.
  - Blocked outcomes such as permission_denied, filesafe_blocked, runtime_disabled, runtime_unavailable, capability_unavailable, host_untrusted, host_unreachable, and test_gap_policy render blocked state rather than execution failure or zero usage.
  - Hidden/background contribution refs remain attributable across run modes and are not folded into parent totals without drill-through.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py run-gates
  - future run-mode Usage settlement fixture suite
risk_class: run_mode_usage_settlement_drift
reasoning_tier: high
context_scope: run_mode_usage_settlement_projection
implementation_surfaces:
  - Plans/Run_Modes.md
  - Plans/usage-feature.md
  - Plans/Runtime_Artifacts_Panel.md
node_compile_hint:
  mode: run_mode_usage_settlement_projection
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Run_Modes.md:843-1030"
  - "Plans/usage-feature.md:5412-5605"
  - "Plans/Runtime_Artifacts_Panel.md:281-290"
preserved_exact_tokens:
  - streaming_partial
  - failed
  - adjusted
  - blocked != failed
  - dedupe_key
  - parent_usage_record_id
  - partial_reason
  - runtime_disabled
negative_constraints:
  - Do not erase failed, aborted, or superseded usage records just because a retry later settles.
  - Do not display blocked run-mode outcomes as zero usage or final settled cost.
  - Do not treat run-mode policy as permission to fabricate missing provider usage.
owner_hints:
  - Plans/Run_Modes.md
  - Plans/usage-feature.md
  - Plans/Runtime_Artifacts_Panel.md
```


## `run.started` requested/effective owner projection

Status: `STATICALLY_MATERIALIZED`; admission/runtime execution is `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION`.

The v2 target paths are `requested_runtime_mode` and effective `runtime_mode`; `requested_mode_overlay` and `effective_mode_overlay`; nullable `requested_strategy` and effective `strategy`; and `strategy_resolution_reason`. Runtime mode is `ask | plan | regular | yolo`; overlay is `none | plan | deep_plan | debug | interview | brainstorm | crew`; strategy is `hte | dae`. Requested/effective runtime mode and overlay must be equal after canonical normalization; rejected combinations never start.

Legal overlays are: ask only `none`; plan `none|plan|deep_plan`; regular and yolo `none|debug|interview|brainstorm|crew`. Strategy resolution is exactly `read_only_mode_forces_hte | regular_hte_default | regular_hte_requested | regular_dae_allowed | regular_dae_disallowed | yolo_requires_dae`. Ask/plan force HTE; regular defaults or requests HTE, admits DAE only with `dae_allowed=true`, otherwise deterministically records `regular_dae_disallowed`; yolo requires DAE and otherwise stops before spawn with `yolo_requires_dae_provider` and no `run.started`.

The event must also resolve one complete immutable `pm.requested_effective_runtime@1.0.0` snapshot. A thin policy snapshot, current settings, inline-only joins, display labels, or reconstructed historical values is invalid.
