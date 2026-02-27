# Run Modes (Canonical SSOT)

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: "Puppet Master" only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.

## 0. Scope and SSOT status

This document is the **single canonical source of truth** for Puppet Master run modes. All other plan documents MUST reference this document by anchor (e.g., `Plans/Run_Modes.md#MODE-ask`) rather than restating mode definitions, strategy selection rules, budgets, or kill conditions.

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
- Context compilation + compaction: `Plans/FileSafe.md` (Part B)
- HITL tier-boundary approvals: `Plans/human-in-the-loop.md`
- OpenCode baseline patterns: `Plans/OpenCode_Deep_Extraction.md` (§7A)
- Assistant chat modes: `Plans/assistant-chat-design.md` (§3)
- Cross-cutting invariants: `Plans/Architecture_Invariants.md`

---

## 1. Canonical mode definitions

A **Mode** determines the permission posture, write policy, CLI-bridged execution strategy, budget envelope, and context-management behavior for a Puppet Master run.

Exactly four modes exist. Each is normative and referenced by its anchor ID.

ContractRef: ContractName:Plans/Run_Modes.md, PolicyRule:Decision_Policy.md§2

<a id="MODE-ask"></a>
### 1.1 `ask`
- **Intent:** Read-only investigation. The provider answers questions, reads files, and searches code but performs no mutations.
- **Writes allowed:** false.
- **Permission posture:** All mutating tools (`edit`, `bash`, `write`, etc.) are set to `deny`. Read-only tools (`read`, `grep`, `glob`, `webfetch`, `websearch`) follow the permission table in `Plans/Tools.md` §10.2.
- **CLI-bridged strategy:** HTE (Hosted Tool Execution).
- **Delegated tool execution:** Prohibited.

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/FileSafe.md

<a id="MODE-plan"></a>
### 1.2 `plan`
- **Intent:** Read-only planning output. The provider produces a structured plan but performs no mutations to project files.
- **Writes allowed:** false (plan output is an artifact returned to the caller, not written to the project workspace).
- **Permission posture:** Identical to `ask` for project files. The provider may write to its own plan-output surface (e.g., plan artifacts under Puppet Master's control) but not to project source.
- **CLI-bridged strategy:** HTE (Hosted Tool Execution).
- **Delegated tool execution:** Prohibited.

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/FileSafe.md

<a id="MODE-regular"></a>
### 1.3 `regular`
- **Intent:** Standard interactive or autonomous execution with controlled write permissions.
- **Writes allowed:** conditional — subject to per-tool permission rules (`allow`/`deny`/`ask`) and FileSafe guards.
- **Permission posture:** Follows the full permission table (`Plans/Tools.md` §10.2). Mutating tools default to `ask` unless the user or run config explicitly sets `allow`.
- **CLI-bridged strategy:** HTE by default. DAE (Delegated Agent Execution) only when **both** conditions hold: (a) explicit opt-in via config key `cli_bridged_strategy: "dae"`, and (b) policy allows DAE for the active provider.
- **Delegated tool execution:** Prohibited unless DAE is opted in per above.

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/FileSafe.md, ContractName:Plans/CLI_Bridged_Providers.md

<a id="MODE-yolo"></a>
### 1.4 `yolo`
- **Intent:** Maximum-automation execution. The provider runs with full write permissions; no per-call approval prompts.
- **Writes allowed:** true.
- **Permission posture:** All tools set to `allow` (no `ask` prompts). FileSafe guards remain mandatory as the primary protection layer (see `Plans/FileSafe.md` §10a).
- **CLI-bridged strategy:** DAE (Delegated Agent Execution) allowed. Guardrails and end-of-run scans are mandatory (see §5).
- **Delegated tool execution:** Allowed under DAE with mandatory reconciliation and policy enforcement.

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/FileSafe.md, ContractName:Plans/assistant-chat-design.md

---

## 2. CLI-bridged execution strategies

Two mutually exclusive execution semantics apply when Puppet Master invokes a CLI-bridged provider (see `Plans/CLI_Bridged_Providers.md` for the Provider facade contract).

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Architecture_Invariants.md#INV-009

<a id="STRATEGY-HTE"></a>
### 2.1 HTE — Hosted Tool Execution
- The provider CLI acts as a **plan/reasoner only**. It produces no file edits and executes no shell commands.
- Puppet Master asks for a structured plan or reasoning output, executes **all** actions itself via Puppet Master tools (subject to the permission model in `Plans/Tools.md`), and feeds results back to the provider.
- Any tool-call observation from the provider stream during HTE is a kill condition (see §5.1).

<a id="STRATEGY-DAE"></a>
### 2.2 DAE — Delegated Agent Execution
- The provider CLI **executes tools itself** (file edits, shell commands, etc.).
- Puppet Master spawns the CLI in a jailed workspace, ingests the `stream-json` normalized event stream, and enforces policy via guards, reconciliation, and kill-switches.
- End-of-run scans are mandatory (see §5.2).
- FileSafe guards (`Plans/FileSafe.md`) apply to all DAE-originated mutations.

---

## 3. Deterministic strategy selection

Strategy selection is a pure function of `(ui_mode, config, policy)`. Given the same inputs, the same strategy MUST be selected.

ContractRef: PolicyRule:Decision_Policy.md§2, PolicyRule:Decision_Policy.md§3

| Mode | `writes_allowed` | Strategy | Selection rule |
|------|-------------------|----------|----------------|
| `ask` | `false` | HTE | Always HTE; no opt-out. |
| `plan` | `false` | HTE | Always HTE; no opt-out. |
| `regular` | conditional | HTE (default) | HTE unless `cli_bridged_strategy == "dae"` in run config **AND** provider policy allows DAE. |
| `yolo` | `true` | DAE | DAE with mandatory guardrails + scans. |

**Resolution algorithm:**

1. Read `ui_mode` from the run envelope (field: `mode`; enum: `ask | plan | regular | yolo`).
2. If `mode ∈ {ask, plan}` → strategy = HTE. Return.
3. If `mode == yolo` → strategy = DAE. Return.
4. If `mode == regular`:
   a. If run config contains `cli_bridged_strategy: "dae"` AND the active provider's policy flag `dae_allowed == true` → strategy = DAE. Return.
   b. Otherwise → strategy = HTE. Return.

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Run_Modes.md

---

## 4. Budget defaults

Budget limits bound resource consumption per run. They are enforced by the run supervisor regardless of strategy.

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, PolicyRule:Decision_Policy.md§4

| Budget key | Default value | Applies to | Description |
|------------|--------------|------------|-------------|
| `max_wall_ms` | 1,200,000 (20 min) | All modes | Maximum wall-clock duration for a single run. |
| `max_tool_calls_observed` | 150 (DAE) / 0 (HTE) | DAE: observed tool calls; HTE: must be 0 | Maximum provider-originated tool calls observed in the stream. |
| `max_estimated_tokens` | 80,000 | All modes | Estimated token ceiling for the run. |
| `max_same_shell_failure` | 3 | DAE | Maximum consecutive failures of the same shell command before kill. |
| `max_write_thrashing` | 5 writes / 10 min | DAE | Maximum writes to the same file within a 10-minute window. |
| `max_retryable_errors` | 3 | All modes | Maximum retryable provider errors before run termination. |

Budget values MAY be overridden per-run via the run envelope's `budget` field. Overrides MUST NOT exceed hard ceilings defined by policy (implementation-defined).

---

## 5. Kill conditions and enforcement

<a id="KILL-CONDITIONS"></a>

A kill condition triggers immediate run termination with outcome `done.failed` and a machine-readable reason code.

ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/CLI_Bridged_Providers.md

### 5.1 Universal kill conditions (all strategies)
| Condition | Reason code | Description |
|-----------|-------------|-------------|
| Write outside FileSafe scope | `kill.filesafe_violation` | Any write attempt to a path not permitted by FileSafe write-scope rules. |
| Forbidden token hit | `kill.forbidden_token` | Provider output contains a token on the FileSafe security-filter blocklist. |
| Token ceiling exceeded | `kill.token_ceiling` | `max_estimated_tokens` budget exceeded. |
| Wall-clock timeout | `kill.wall_timeout` | `max_wall_ms` budget exceeded. |
| Retryable error ceiling | `kill.retryable_errors` | `max_retryable_errors` exceeded. |

### 5.2 HTE-specific kill conditions
| Condition | Reason code | Description |
|-----------|-------------|-------------|
| Provider tool-call observed | `kill.hte_tool_observed` | Any `tool_use` event observed in the provider stream. HTE MUST NOT allow delegated tool execution. |

### 5.3 DAE-specific kill conditions
| Condition | Reason code | Description |
|-----------|-------------|-------------|
| Repeated shell failure | `kill.shell_failure` | Same shell command fails `max_same_shell_failure` consecutive times. |
| Write thrashing | `kill.write_thrash` | Same file written more than `max_write_thrashing` times within 10 minutes. |

### 5.4 DAE end-of-run scans (mandatory)
When a DAE run completes (any terminal outcome), the following scans MUST execute before the outcome is finalized:
1. **FileSafe write-scope audit** — verify all files touched during the run are within the declared write scope.
2. **Security-filter scan** — verify no sensitive-file access violations occurred.
3. **Diff reconciliation** — compare the provider's reported changes against actual workspace diff to detect unreported mutations.

Scan failures escalate the outcome to `done.failed` with reason `kill.post_scan_failure`.

ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/CLI_Bridged_Providers.md

---

## 6. Run outcome taxonomy

<a id="OUTCOME-TAXONOMY"></a>

Every run terminates with exactly one outcome value.

ContractRef: ContractName:Plans/Contracts_V0.md#EventRecord, PolicyRule:Decision_Policy.md§2

| Outcome | Meaning |
|---------|---------|
| `done.ok` | Run completed successfully; all objectives met. |
| `done.failed` | Run terminated due to error, kill condition, or scan failure. |
| `done.deferred` | Run paused; work remains but requires external input (e.g., HITL approval). |
| `done.rotated` | Run terminated and a follow-up run was spawned (context rotation). |
| `done.gutter` | Run terminated without meaningful progress; provider produced no actionable output. |

The outcome MUST be recorded in the terminal `done` event of the normalized provider stream and persisted via `EventRecord` to seglog.

---

## 7. Mode effects on context management

Mode influences context compilation, compaction, and rotation behavior. Detailed context-compilation contracts are in `Plans/FileSafe.md` (Part B); this section defines only the mode-specific deltas.

ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/Run_Modes.md

| Mode | Context compilation | Compaction | Rotation |
|------|---------------------|------------|----------|
| `ask` | Read-only context only (no plan/write-scope metadata injected). | Standard compaction thresholds apply. | No rotation (single-turn expected). |
| `plan` | Read-only context + plan-output scaffold. | Standard compaction thresholds apply. | No rotation (planning is bounded). |
| `regular` | Full role-specific context (`Plans/FileSafe.md` §14). | Standard compaction thresholds apply. | Rotation allowed; triggers `done.rotated` outcome. |
| `yolo` | Full role-specific context. | Standard compaction thresholds apply. | Rotation allowed; triggers `done.rotated` outcome. |

---

## 8. OpenCode baseline

This section documents the OpenCode patterns that Puppet Master's run-mode system is based on, per `Plans/OpenCode_Deep_Extraction.md` §7A.

ContractRef: ContractName:Plans/OpenCode_Deep_Extraction.md

### 8.1 Plan mode enforcement (baseline)
OpenCode enforces plan mode via a `<system-reminder>` injection declaring "STRICTLY FORBIDDEN: ANY file edits, modifications, or system changes." The plan agent's permission ruleset denies all edit tools except plan-file writes. A `PlanExitTool` offers the user a switch to the build agent.
— Source: `Plans/OpenCode_Deep_Extraction.md` §7A.1

### 8.2 Ask/approval semantics (baseline)
OpenCode's `Question.ask()` blocks tool execution until user response. Permission evaluation uses `PermissionNext.evaluate()` with wildcard matching; unmatched permissions default to `ask`. A `reject` reply cascades to all pending permissions in the session.
— Source: `Plans/OpenCode_Deep_Extraction.md` §7A.3, §7C.1

### 8.3 Compaction (baseline)
Overflow detection triggers when total tokens exceed the model's usable context window minus a 20,000-token reserve. Pruning erases old tool-call outputs beyond a 40,000-token protection window. Protected tools (e.g., `skill`) are never pruned.
— Source: `Plans/OpenCode_Deep_Extraction.md` §7B.5

---

## 9. Puppet Master deltas

This section defines where Puppet Master diverges from the OpenCode baseline. Each delta is a normative requirement.

ContractRef: ContractName:Plans/Run_Modes.md, PolicyRule:Decision_Policy.md§2

<a id="DELTA-ask"></a>
### 9.1 `ask` — strictly read-only, HTE, no delegated tool execution
- **Delta from baseline:** OpenCode's `ask` semantics allow the user to approve individual tool calls via the `ask` permission. Puppet Master's `ask` mode is **strictly read-only** — mutating tools are `deny` (not `ask`), and no delegated tool execution occurs.
- **Strategy:** HTE only. No DAE opt-in path.
- **Rationale:** Eliminates ambiguity; `ask` mode guarantees zero mutations.

ContractRef: ContractName:Plans/Run_Modes.md#MODE-ask

<a id="DELTA-plan"></a>
### 9.2 `plan` — read-only planning output, HTE, no delegated tool execution
- **Delta from baseline:** OpenCode allows plan-mode agents to write to `.opencode/plans/*.md`. Puppet Master's `plan` mode produces plan output as a returned artifact; no project-file writes.
- **Strategy:** HTE only. No DAE opt-in path.
- **Rationale:** Clean separation between planning and execution phases.

ContractRef: ContractName:Plans/Run_Modes.md#MODE-plan

<a id="DELTA-regular"></a>
### 9.3 `regular` — HTE default; DAE only via explicit opt-in AND policy allow
- **Delta from baseline:** OpenCode's default `build` agent executes tools directly (analogous to DAE). Puppet Master defaults to HTE — the platform executes all tools itself — to maintain full policy control. DAE requires explicit config (`cli_bridged_strategy: "dae"`) plus provider-level policy approval.
- **Strategy:** HTE default; DAE opt-in per §3.
- **Rationale:** HTE-by-default gives Puppet Master complete tool-call audit, policy enforcement, and rollback capability.

ContractRef: ContractName:Plans/Run_Modes.md#MODE-regular, ContractName:Plans/CLI_Bridged_Providers.md

<a id="DELTA-yolo"></a>
### 9.4 `yolo` — DAE allowed, guardrails + scans mandatory
- **Delta from baseline:** OpenCode has no explicit "yolo" mode; its closest equivalent is running with all permissions set to `allow`. Puppet Master formalizes `yolo` as a named mode with mandatory FileSafe guardrails and end-of-run scans, ensuring safety even when approval prompts are suppressed.
- **Strategy:** DAE with mandatory scans per §5.4.
- **Rationale:** Named mode makes the risk posture explicit and auditable. FileSafe is the primary protection layer (see `Plans/FileSafe.md` §10a).

ContractRef: ContractName:Plans/Run_Modes.md#MODE-yolo, ContractName:Plans/FileSafe.md

---

## 10. Acceptance criteria

These criteria are testable assertions that MUST hold for any conforming implementation.

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Progression_Gates.md

<a id="AC-01"></a>
**AC-01:** In HTE strategy, any `tool_use` event observed in the provider stream MUST trigger kill condition `kill.hte_tool_observed` and terminate the run with `done.failed`.

<a id="AC-02"></a>
**AC-02:** In DAE strategy, end-of-run scans (§5.4) MUST execute for every terminal outcome. A scan failure MUST escalate the outcome to `done.failed`.

<a id="AC-03"></a>
**AC-03:** Mode selection is deterministic: given identical run envelope and config inputs, the resolution algorithm (§3) MUST produce the same `(mode, strategy)` pair.

<a id="AC-04"></a>
**AC-04:** In `ask` and `plan` modes, no project-file mutation may occur. Any write attempt to a project file MUST be blocked by the permission layer (not merely by FileSafe).

<a id="AC-05"></a>
**AC-05:** In `yolo` mode, FileSafe guards MUST remain active. Disabling FileSafe while `yolo` is active MUST produce a user-visible warning (per `Plans/FileSafe.md` §10a).

<a id="AC-06"></a>
**AC-06:** Budget limits (§4) MUST be enforced regardless of mode. Exceeding any budget MUST trigger the corresponding kill condition.

<a id="AC-07"></a>
**AC-07:** Every run MUST terminate with exactly one outcome from the taxonomy (§6), recorded in the `done` event and persisted to seglog.
