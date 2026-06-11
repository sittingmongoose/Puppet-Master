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

### RM-001 - Run Modes (Canonical SSOT) Source-Preserving PlanUnit

```yaml
plan_unit_id: RM-001
unit_type: requirement
status: accepted
owner_doc: Plans/Run_Modes.md
canonical_text: Plans/Run_Modes.md keeps its pre-migration canonical source content losslessly in place while exposing a source-preserving PlanUnit for Plan Document System indexing. Fine-grained requirement splitting may occur in a later controlled batch using the recorded span_map and coverage_map.
gui_related: true
gui_classification_reason: The preserved source spans include GUI/UI/user-visible presentation or interactive control requirements.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- Original source spans remain available for exact-text audit.
- Every original span for this doc has one coverage_map disposition.
- ContractRefs, anchors or aliases, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage are preserved by span_map and coverage_map.
- No WorkNodes, NodeSeeds, or executable build tasks are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-001-standardize-plans
- python3 scripts/pm-plans-verify.py run-gates
- python3 scripts/pm-shard-plans.py --check
risk_class: source_preservation
reasoning_tier: standard
context_scope: single_plan_doc
implementation_surfaces:
- Plans/Run_Modes.md
node_compile_hint:
  mode: source_preserving_planunit
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0001
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0002
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0003
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0004
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0005
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0006
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0007
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0008
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0009
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0010
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0011
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0012
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0013
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0014
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0015
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0016
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0017
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0018
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0019
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0020
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0021
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0022
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0023
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0024
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0025
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0026
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0027
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0028
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0029
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0030
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0031
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0032
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0033
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0034
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0035
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0036
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0037
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0038
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0039
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0040
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0041
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0042
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0043
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0044
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0045
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0046
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0047
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0048
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0049
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0050
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0051
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0052
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0053
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0054
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0055
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0056
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0057
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0058
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0059
preserved_exact_tokens:
- Run Modes (Canonical SSOT)
- Canonical owner-section requirements
- Identity and blocked-policy transfer cluster
- 0. Scope and SSOT status
- 'ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md'
- SSOT references (DRY)
- 'ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/FileSafe.md, ContractName:Plans/Architecture_Invariants.md'
- 1. Canonical mode definitions
- 1.0 Runtime mode and workflow-overlay separation
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Commands_System.md, ContractName:Plans/orchestrator-subagent-integration.md'
- 1.1 `ask`
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FileSafe.md, ContractName:Plans/Prompt_Pipeline.md'
- 1.2 `plan`
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/storage-plan.md'
- 1.3 `regular`
- 'ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Prompt_Pipeline.md'
- 1.4 `yolo`
- 'ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/FileSafe.md, ContractName:Plans/Prompt_Pipeline.md'
- 2. CLI-bridged execution strategies
- 'ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Architecture_Invariants.md#INV-009'
- 2.1 HTE — Hosted Tool Execution
- 2.2 DAE — Delegated Agent Execution
- 2.2.1 DAE worktree context
- 'ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/assistant-chat-design.md'
negative_constraints:
- '- overlay choice must not widen runtime authority.'
- '- The canonical workspace MUST NOT be directly writable during DAE. Host-side reconciliation applies the verified jail diff back only after scans and FileSafe checks succeed.'
- '- `effective_mode_overlay = debug` with `mode ∈ {ask, plan}` is an invalid automated-debug combination and MUST be normalized before run spawn; the runtime must not execute a Debug investigation in read-only posture'
- '- `Debug Mode + yolo` is an advanced opt-in only and MUST NOT become the default Debug posture'
- '- `yolo` still requires DAE; if the provider policy snapshot does not allow DAE, the run MUST fail before provider spawn with `stop_reason = "yolo_requires_dae_provider"`; it MUST NOT silently downgrade to HTE'
- Three-level concurrency limits apply globally across all run strategies and MUST NOT be overridden by Persona or overlay configuration alone.
- '| `task_timeout_ms` | inherit parent remaining budget | Subagent task envelope | Per-task cap; may narrow parent budget but MUST NOT exceed it. |'
- '- Budget overrides MAY narrow defaults per run, but MUST NOT widen beyond the hard policy ceiling.'
- '- Queueing at concurrency caps is deterministic; PM MUST NOT silently discard or auto-widen queued work.'
- '- `kill.budget_exceeded` remains pre-dispatch only. Post-response budget-overrun cases use terminal `done.budget_exceeded` after usage has been durably recorded and MUST NOT be folded back into the pre-dispatch row above.'
- '- PM MUST NOT silently drop an incomplete run or rewrite it as `done.failed` without the crash marker'
- '- a failed teardown step emits a structured diagnostic; PM MUST NOT silently reuse poisoned process state or abandoned shell/session state'
- '| Provider tool-call observed | `kill.hte_tool_observed` | Any `tool_use` event observed in the provider stream. HTE MUST NOT allow delegated tool execution. |'
- '- `done.task_timeout` is the canonical terminal stop reason after timeout exhaustion completes the grace-period shutdown path. `kill.task_timeout` may exist as internal supervisor bookkeeping, but it MUST NOT be emitted as the consumer-facing terminal alias.'
- '- These terminal stop reasons MUST be preserved in the terminal `done` payload and persisted `run.completed` metadata. Consumers MUST NOT collapse post-response budget overruns back into pre-dispatch naming, and `done.timeout` is retired as a synonym.'
- '`read_only` excludes mutation-authority metadata (write scopes, DAE reconciliation metadata, and execution affordances). `plan_output_scaffold_v1` adds a deterministic plan/todo scaffold only. The overlay is applied during prompt/context compilation before attachments and the Injected Context breakd'
- '**AC-08:** UI/workflow state MUST normalize deterministically into the canonical runtime mode enum before strategy selection. `Interview`, `BrainStorm`, and `Crew` MUST NOT create additional runtime mode values.'
- '**AC-10:** In `yolo` mode, a provider with `dae_allowed != true` MUST fail before provider spawn with `stop_reason = "yolo_requires_dae_provider"`; it MUST NOT silently downgrade to HTE.'
- '**AC-11:** `kill.shell_failure` counts only actually executed shell failures for one canonical shell fingerprint. Policy denials, FileSafe blocks, UI-only terminal actions, and different shell fingerprints MUST NOT increment the same streak.'
- '**AC-12:** `kill.write_thrash` counts only qualifying content-changing writes to one normalized file identity within a sliding 10-minute window. Writes to different files, aged-out writes, and denied / blocked / no-diff operations MUST NOT trigger the ceiling.'
- '**AC-13:** Child/subagent/rotated follow-up runs MUST inherit the parent effective context overlay. A read-only parent run (`ask` or `plan`) MUST NOT widen into `full_execution` context in any child run.'
compatibility_only_notes:
- '- The legacy `/plan/regular` shorthand maps to the canonical ask/plan/regular default: HTE is used for `ask`, `plan`, and `regular` unless `regular` explicitly selects DAE and provider policy allows it.'
- Legacy A2A/OpenCode gap wording may call these ceilings `max_tokens` and `max_wall_time`; the canonical run-envelope keys are `max_estimated_tokens` and `max_wall_ms`, and both feed the budget and kill-condition enforcement below.
- '- Compatibility labels are canonicalized here: `shell-fingerprint` means the canonical shell fingerprint, `terminal-normalized` means the terminal normalized `done` and `/audit` outcome family, and `/replace/stop` covers explicit session replacement, restart, or user/parent stop paths.'
stale_retired_dispositions:
- '- Runtime-governance docs continue to sharpen rather than stabilize: - startup recovery remains split across policy, executor, and storage docs with no single owner deciding how interrupted attempts become `stale_historical` vs rehydrated vs `startup_recovered`. - retry/backoff policy is now more cl'
- Concurrency SSOT defaults are `max_concurrent_crews_per_platform=4`, `max_concurrent_agents_per_crew=8`, and `max_total_active_agents=32`; any 5-crews / 10-agents wording in downstream docs is stale drift and must be retired rather than treated as an alternate cap.
- '- `done.task_timeout` is the canonical terminal stop reason for elapsed-budget exhaustion after graceful teardown. Internal supervisor bookkeeping may classify the pre-terminal trigger as timeout exhaustion, but consumers MUST persist and inspect `done.task_timeout`; `kill.task_timeout` is retired a'
- '- These terminal stop reasons MUST be preserved in the terminal `done` payload and persisted `run.completed` metadata. Consumers MUST NOT collapse post-response budget overruns back into pre-dispatch naming, and `done.timeout` is retired as a synonym.'
owner_boundary_notes:
- '# Run Modes (Canonical SSOT)'
- '## Canonical owner-section requirements'
- These requirements are canonical live specification text for this owner document and preserve the required product, runtime, storage, UI, and governance details in owner-section form.
- '> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: "Puppet Master" only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.'
- '## 0. Scope and SSOT status'
- This document is the **single canonical source of truth** for Puppet Master run modes. All other plan documents MUST reference this document by anchor (for example `Plans/Run_Modes.md#MODE-ask`) rather than restating mode definitions, strategy selection rules, budgets, or kill conditions.
- '### SSOT references (DRY)'
- '- Canonical contracts (events/tools/auth): `Plans/Contracts_V0.md`'
- '- Canonical terms: `Plans/Glossary.md`'
- '- Context compilation + compaction owner: `Plans/Prompt_Pipeline.md`'
- '- HITL tier-boundary approvals: `Plans/human-in-the-loop.md`'
- '## 1. Canonical mode definitions'
- '- External IDE baselines such as JetBrains chat/agent modes and Junie validate that assistant modes may generate code, edits, and terminal commands with visible progress plus review/apply affordances in tool windows; PM still maps those affordances to `/agent`, `/apply`, operation-card/terminal surf'
- '- The legacy `/plan/regular` shorthand maps to the canonical ask/plan/regular default: HTE is used for `ask`, `plan`, and `regular` unless `regular` explicitly selects DAE and provider policy allows it.'
- '- The canonical workspace MUST NOT be directly writable during DAE. Host-side reconciliation applies the verified jail diff back only after scans and FileSafe checks succeed.'
- '- Child/subagent runs inherit the parent selected strategy unless a higher-level SSOT explicitly narrows it.'
- '- Debug target binding uses target-discovery heuristics and adapter-selection defaults owned by the relevant GUI, evidence, and tool surfaces; file-by-file canonical doc changes must land in those owner docs instead of creating a generic runtime-mode bucket'
- '- Runtime-governance docs continue to sharpen rather than stabilize: - startup recovery remains split across policy, executor, and storage docs with no single owner deciding how interrupted attempts become `stale_historical` vs rehydrated vs `startup_recovered`. - retry/backoff policy is now more cl'
- '- ELI5/Expert currently risks becoming a synonym generator. - the safer rule is: simplify explanation depth, not canonical object names - for example, `Feature Seam` should remain the term in both modes even if the ELI5 explanation is plainer'
- '- current work item posture remains `active`, but the center of gravity is shifting from exploration to owner-hardening'
- Concurrency SSOT defaults are `max_concurrent_crews_per_platform=4`, `max_concurrent_agents_per_crew=8`, and `max_total_active_agents=32`; any 5-crews / 10-agents wording in downstream docs is stale drift and must be retired rather than treated as an alternate cap.
- Legacy A2A/OpenCode gap wording may call these ceilings `max_tokens` and `max_wall_time`; the canonical run-envelope keys are `max_estimated_tokens` and `max_wall_ms`, and both feed the budget and kill-condition enforcement below.
- '| `max_same_shell_failure` | 3 | DAE / host-managed shell surfaces | Consecutive failures of the same canonical shell fingerprint before stop. |'
- '- Canonical run-envelope exact defaults are `max_nesting_depth=4`, `max_total_spawned_agents=99`, and `max_tool_rounds=200`; the kill table consumes those fields without inventing alternate caps.'
owner_hints:
- Plans/Run_Modes.md
split_recommendation_reason: The doc-level source-preserving unit covers both GUI-related and non-GUI spans; future fine-grained PlanUnits should split those surfaces when safe.
```

## Migration Coverage

Original hash: `a430763e3be8df6d28f0bd8e8563eb2428ce42663485d0412aaacf8a41d3706f`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/anchor_aliases.json`

All original spans from `Run_Modes-S0001` through `Run_Modes-S0059` are preserved in place and mapped in `coverage_map.jsonl` to `RM-001`. This batch did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, or executable build tasks.

