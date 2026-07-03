# Shard 024: Runtime Blocked-State Integration Addendum (2026-03-08)

Source: `Plans/FileSafe.md`

Source lines: L2602-L2657

Source SHA256: `a185b2e6e46438574d986a2ac598729ef9751e85d3b0d737daf728434bf3f6f6`

---

## Runtime Blocked-State Integration Addendum (2026-03-08)

### 1. FileSafe outcomes are first-class blocked outcomes


FileSafe decisions must integrate with the shared runtime blocked taxonomy.

Required rule:
- a FileSafe block becomes `blocked_reason_code = filesafe_blocked`
- it is not an execution failure and is not auto-retryable

### 2. Recovery options

When FileSafe allows user recovery, runtime/UI surfaces must expose exact options.
- Align `tool.denied` emission with the normalized `filesafe_blocked` outcome taxonomy so guard events and terminal outcomes tell the same story.
- Blocked-state payloads use `blocked_reason_code`, ordered `allowed_action_ids[]`, `blocked_sequence`, `preserved-local-work`, prerequisite metadata, and `detail_ref?`; deprecated field names such as `allowed_actions[]` and `blocked_reason` must not appear in new canonical schemas.
- Graph-local `Retry/Replan/Reopen/Approve/Deny` and `/Replan/Reopen/Approve/Deny` labels normalize to canonical `cmd.runtime` / `cmd.runtime.*` recovery commands before display or persistence.
- `/interview` and `/remediation` flows use the shared `failure_class`, `blocked_reason_code`, and `allowed_action_ids[]` taxonomy; wizard/interview blocked-state is persistent runtime state, not thread-local conversational metadata.
- Durable FileSafe event families include switch outcomes such as `threshold_preemptive_switch` and `no eligible backup` instead of relying only on notification copy.
- Account-pressure and switching outcomes preserve projected pressure before hard failure, confidence `/source`, soft vs hard switching, `no-backup-account`, `policy-disallowed`, and role/account interactions so FileSafe recovery does not flatten guard-relevant `/account` state into a generic denial.
- non-blocking pressure remains advisory until it changes execution authority: use a warning banner, optional toast, and quiet period first, and escalate further only if the condition becomes execution-blocking.
- Bulk recovery actions require exact target preview: retry-many-node, graph-patch-multiple-scope, approve-many-`HITL` `/runtime` blocked actions, and cleanup `/remove` over live lanes or `/worktrees` must not share one generic confirm.
- `UI_Command_Catalog.md` (`UI_Command_Catalog`) is a projection over canonical FileSafe `/recovery` payloads; catalog copy must not contradict the runtime action IDs or allowed-action ordering.
- Attention routing for blocked state includes Dashboard, Orchestrator, and `chat-thread` surfaces for `live-run` status, Docker `/registry` side effects, FileSafe blocks, and optional `HITL` boundaries.

Allowed examples:
- `Approve once`
- `Approve & add to list`
- `Cancel`

If recovery is not allowed for the specific guard, the runtime must say so explicitly.

### 3. Event and analytics requirements

FileSafe event payloads must remain rich enough for both analytics and runtime recovery surfaces.

Minimum fields:
- `guard_type`
- `pattern_id` or pattern name
- `timestamp`
- `command_or_path_summary`
- `recovery_allowed`
- `allowed_action_ids[]`

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Permissions_System.md
### 4. Safe-point interaction


A FileSafe block that occurs before execution does not consume a mutation safe point and does not require rollback.

### 5. Acceptance criteria

- FileSafe blocks appear as blocked outcomes with explicit reason codes.
- FileSafe blocks are not auto-retried.
- Recovery-capable FileSafe blocks present exact allowed actions.
- FileSafe analytics data remains usable after runtime integration.
