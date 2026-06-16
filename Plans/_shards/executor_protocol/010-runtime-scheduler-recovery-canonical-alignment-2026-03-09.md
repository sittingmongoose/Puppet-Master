# Shard 010: Runtime Scheduler / Recovery Canonical Alignment (2026-03-09)

Source: `Plans/Executor_Protocol.md`

Source lines: L506-L576

Source SHA256: `4124771c03e9431100c999a65c0ae033e0c21b51a5dbb6b3d32352df219fa721`

---

## Runtime Scheduler / Recovery Canonical Alignment (2026-03-09)

Compatibility/source-lineage disposition: this historical recovery addendum preserves exact scheduler/recovery terms. It is subordinate to the consolidated runtime/addenda boundary and named owner sections where overlapping rules appear.

This addendum is normative and supersedes any earlier pure-lexicographic dispatch wording where they conflict.

### Runtime recovery scheduler pass
The executor MUST process scheduling as a deterministic pass with these steps:
ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md
1. refresh candidate runtime state for the active `replan_generation`
2. recompute readiness, blocked state, and backoff state
3. recompute lane and score terms for every ready candidate
4. select up to available capacity
5. emit queue-analysis state before dispatch
6. dispatch selected attempts

### Readiness contract
A node is ready only when all blockers are satisfied, the generation is current, the node is not blocked, the node is not in backoff, and capacity rules permit dispatch in its lane. Nodes blocked by permission denial, FileSafe, auth refresh, user confirmation, or replan-required state are not ready.

### Runtime recovery score tuple
The canonical selection tuple is `(scheduler_lane, manual_priority, transitive_unblock_count, ready_since_utc, node_id)`.
- `scheduler_lane` order: `remediation > unblocker > normal`
- higher `manual_priority` wins
- higher `transitive_unblock_count` wins
- older `ready_since_utc` wins
- `node_id` is the final tiebreak only

No critical-path term is part of MVP selection.

### Runtime recovery wakeup triggers
See `### Wake reasons and coalescing` for the canonical wake-trigger list, `wake_reason` values, and watchdog-only polling rule.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Orchestrator_Page.md

### Blocked and retry behavior

The executor treats rich `/editor-agent` and `/workbench` surfaces as runtime peers of terminal, browser, document, and artifact callers. `/plugin-first` and command-first entry points, `/rules/skills` guided plans, multi-surface review loops, `/persisted` tabs and `/splits/windows`, and `/history/navigation` re-entry all dispatch through the same `execution_unit_context` rather than surface-local state. Auth `/login` friction, remote/reconnect loss, dumb-mode or `/disabled-feature` fallbacks, regex-heavy UI blocking, indexing/startup cost, performance pressure under large projects, and IDE `/workbenches` switching clutter surface as explicit blocked, degraded, backoff, or recovery events and MUST NOT erase attempt identity, safe points, worktree binding, diff/review visibility, or user-visible autonomy defaults.

Browser-driven debug handoff uses explicit pause and `/resume` inside an isolated automation session. Auth and `/manual-repro` boundaries degrade to `attention_required`; the MVP does not support chaotic concurrent mixed steering as the default co-pilot model. Richer co-piloting, collaborative browser steering, and broader remote parity are future expansions after the pause/resume handoff proves stable.

Runtime context summarization should stay PM-native. The executor must not transplant a provider `_context_updates` protocol as-is; PM treats that protocol as a reference for incremental tool-result compression driven on every tool call, then emits its own context-detail and compaction updates so tool-result history remains auditable. Incremental shrinking must preserve stable tool-call handles such as `tcN` labels for safe targeted replacement, and the active model or LLM may replace stale full tool results with short audited summaries as part of the ordinary subsequent model/tool-call flow, without a separate extra LLM call; already-compressed results must not be re-compressed.

UI `/checkpoint`, `/approve/deny`, retry, and `/seam/lane/promotion/resolution-thread` actions are runtime action families keyed by `blocked_sequence` and `allowed_action_ids[]`; they are not graph-local commands, completed-work shortcuts, or single-current-task state.

Projection and setup rules:
- Cursor-native managed instructions target `.cursor/rules/*.mdc` and the `.cursor/rules` tree; `.cursorrules` is legacy compatibility only and must not be the primary managed target. Compatibility outputs such as `AGENTS.md`, `CLAUDE.md`, root-level files, or provider-native projected copies are optional, target-based projections, and readiness must never depend solely on projected copies.
- At launch-time, a `PM Outdated` projection should auto-reproject before run launch when safe.
- GUI auth/setup copy exposes user-visible choices such as `Sign in with ChatGPT` and `Use API Key`; lower-level protocol details remain recovery diagnostics unless needed to resolve failure.
- Direct-Gemini OAuth removal is treated as PM app-policy and /compliance/public-distribution policy, not evidence that Google OAuth disappeared as a protocol.


The executor MUST classify every non-success outcome before applying policy.

- blocked episodes preserve local work, runtime identity, and explicit resume prerequisites.
- FileSafe and external side-effect blocks do not auto-retry; they wait for the owning restore or approval action.
- one decision path must not treat the same situation as both a failure class and a blocked-episode cause.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/Permissions_System.md

### Runtime recovery attempt identity and safe points
Every dispatch creates or reuses a first-class `attempt_id`. Mutation-capable attempts and remediation apply steps MUST create a runtime `safe_point_id` before execution. Safe points are runtime recovery anchors only; they are not restore points.
ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/WorktreeGitImprovement.md

For MVP cleanup, the executor uses the canonical workspace or `/remote` project binding plus safe points, restore points, and explicit temporary-vs-durable mutation lineage. It must not require sandbox worktree `/jail` semantics for ordinary debug instrumentation cleanup.

### Runtime recovery remediation lineage
Automatic fix cycles attach to a parent attempt using `remediation_root_id`, `remediation_parent_attempt_id`, `remediation_generation`, finding identifiers, and final resolution state. A new canonical graph node is created only when a replan changes canonical graph scope.

### Degradation boundary
Invalid pre-lock draft decomposition may degrade to deterministic flat draft sequencing with warning evidence. Invalid canonical graphs after graph lock are `graph_integrity` failures and MUST NOT silently degrade.
ContractRef: ContractName:Plans/chain-wizard-flexibility.md, ContractName:Plans/interview-subagent-integration.md, ContractName:Plans/Progression_Gates.md
