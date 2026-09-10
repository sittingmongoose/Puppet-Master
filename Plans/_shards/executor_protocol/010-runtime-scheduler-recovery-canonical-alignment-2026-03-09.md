# Shard 010: Runtime Scheduler / Recovery Canonical Alignment (2026-03-09)

Source: `Plans/Executor_Protocol.md`

Source lines: L573-L730

Source SHA256: `83949ad194756c4c2addb257dade79c089dc9f1bb3ce21bd36fced9b192382e5`

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

### Canonical Executor intake/receipt recovery propagation

The materialized `executor_intake_report` and `attempt_receipt` families consume their exact machine-registry recovery dispositions: `authority_class = canonical_non_rebuildable` and `strategy = restore_from_mandatory_backup`. Executor MUST NOT reconstruct either canonical family from EventRecords, runtime or audit projections, UI state, worker/controller prose, receipt summaries, or other derived views. Those surfaces may diagnose the loss but cannot become canonical intake, attempt, completion, or dispatch authority.

If either required family record is corrupt, unavailable, or cannot be verified, Executor keeps the affected intake/completion truth `blocked` or unknown and admits no completion or dispatch. Admission may be reconsidered only after Storage durably completes the verified whole-boundary mandatory-backup recovery, restores the exact canonical family bytes, and Executor reruns ordinary schema, identity, lineage, currentness, and admission checks. Writer availability, a fresh projection, or a UI success state never auto-resumes work or certifies completion.

Positive oracle: verified mandatory-backup recovery restores the exact `executor_intake_report` and `attempt_receipt` records at one durable Storage recovery boundary; only a subsequent successful ordinary Executor revalidation may admit the corresponding completion or dispatch.

Negative oracle: with either canonical family corrupt or unavailable, matching EventRecords, projections, UI state, summaries, or worker/controller claims cannot reconstruct success, mint or reuse an attempt, accept completion, or dispatch work; the posture remains blocked or unknown.

ContractRef: ContractName:Plans/storage-plan.md#canonical-redb-recovery-and-first-run-proof, ContractName:Plans/storage_value_registry.json#/families/executor_intake_report, ContractName:Plans/storage_value_registry.json#/families/attempt_receipt, DecisionID:PD-L-01, DecisionID:PD-L-02, DecisionID:PD-L-03

### Conversation restore-point no-effect boundary

Assistant Chat owns `cmd.chat.create_restore_point`, `cmd.chat.branch_from_restore`, and `cmd.chat.delete_restore_point` under `PD-RSP-08`. Executor consumes those commands as a strict no-execution boundary: create, apply/branch, replay, refusal/failure, and delete create no runtime `attempt_id`, no successor attempt, no runtime `safe_point_id`, no Executor worktree or file/repository/index mutation, and no scheduler or worker dispatch. A successful `branched` result creates only the Assistant Chat-owned new conversation `thread_id` and `branch_id`; it does not become Executor lineage or completion evidence.

Executor owns no conversation restore-point retention timer, clock, janitor cadence, count-pressure selection, hold release, or expiry transition. It consumes Storage and Assistant Chat retention truth and MUST NOT infer `reference_release`, age/count eligibility, or an `expired` transition from UI/projection state.

Positive oracle: each existing restore-point command produces only its Assistant Chat/Storage-owned record, conversation branch, lifecycle, or no-event result while Executor attempt, safe-point, worktree/file, and dispatch state remains byte-for-byte unchanged.

Negative oracle: any restore-point create/apply/delete path that mints or reuses an Executor attempt, creates a successor attempt or runtime safe point, mutates a worktree/file/repository/index, dispatches work, or runs an Executor-owned retention timer violates the contract and must fail closed.

ContractRef: ContractName:Plans/assistant-chat-design.md#branching-conversations, ContractName:Plans/storage-plan.md#Case-L-6, ContractName:Plans/storage_value_registry.json#/families/restore_point_record, DecisionID:PD-RSP-08

### Approved baseline-target retry and restore lifecycle

This section owns Executor admission, blocked-episode continuity, successor-attempt identity, and dispatch ordering for approved decision `PD-RSP-07`. `Plans/WorktreeGitImprovement.md` owns the filesystem/Git effect and postcondition of each `baseline_target`; `Plans/FileSafe.md` owns safe-point capture, exact-replace restore, equality, journal, rollback, and restart reconciliation; `Plans/Contracts_V0.md` owns the closed restore outcomes and reason codes; `Plans/storage-plan.md` owns the safe-point record, restore transaction, snapshot custody, recovery-anchor persistence, and retention. Executor MUST consume those owners by reference and MUST NOT implement a second restore engine, redefine manifest equality, or infer durable state from UI projections.

`baseline_target` is closed to `safe_point | historical_commit | worktree_head`. Runtime rejects an unknown value, a missing conditionally required field, an abbreviated or moving Git ref where an exact commit OID is required, a repo/worktree mismatch, or digest drift. It MUST NOT substitute a base branch, current worktree, latest safe point, or current `HEAD`.

| Target | Executor admission fields | Executor lifecycle effect after Worktree/FileSafe proves the target postcondition |
| --- | --- | --- |
| `safe_point` | `safe_point_id`, `repo_id`, `worktree_id`; the owning command/episode identities remain required | Link the exact restore transaction and baseline receipt, then mint a successor `attempt_id`. The prior attempt remains immutable. |
| `historical_commit` | exact `historical_commit_oid`, `repo_id`, and source `worktree_id` for lineage | Link the new isolated worktree identity and exact resolved commit OID, then mint a successor `attempt_id`; the source attempt/worktree remains preserved. |
| `worktree_head` | `repo_id`, `worktree_id`, `expected_head_oid`, `expected_state_sha256`, and explicit dirty-state confirmation when dirty | Link the verified live-state receipt without restore or checkout, then mint a successor `attempt_id`. |

Command admission is narrower than enum validity:

- `cmd.runtime.restore_safe_point_then_retry` accepts only `baseline_target = safe_point`. It requires the current blocked episode to expose that exact `allowed_action_id`, the same `blocked_sequence`, and the named safe point/repo/worktree identity.
- `cmd.orchestrator.safe_point_retry` and compatibility alias `cmd.orchestrator.restore_safe_point_then_retry` accept the same wrapper input: `{ project_id, run_id, node_id, blocked_sequence, attempt_id, safe_point_id, repo_id, worktree_id, baseline_target: "safe_point", permission_snapshot_id? }`. Admission validates optional `permission_snapshot_id` against current permission state and consumes it. Both apply the identical deterministic transform to the exact canonical payload `{ project_id, run_id, node_id, blocked_sequence, attempt_id, safe_point_id, repo_id, worktree_id, baseline_target: "safe_point" }` before dispatch. The sole domain/handler pair is `cmd.runtime.restore_safe_point_then_retry` / `handlers::runtime::restore_safe_point_then_retry`; wrapper and alias share its result, `safe_point.restored` producer, effects, idempotency identity, and admission decision.
- When `requires_safe_point_restore = true`, `restore_safe_point_then_retry` is the only legal rerun verb. `retry_now`, `start_fresh_attempt`, and resume paths are rejected even if they carry a syntactically valid target.
- `cmd.runtime.retry_now` and `cmd.runtime.start_fresh_attempt` may accept any of the three targets only when the active blocked/retry policy allows that verb and every target-specific field is present. Selecting `safe_point` on either verb still invokes the same FileSafe restore transaction; it is not a weaker restore.
- A retry/fresh-attempt command that carries no SCM target may follow only an owner-defined non-SCM retry path. It MUST NOT infer one of the three values from current UI focus or branch state.

#### Restore-before-rerun sequence

1. Load the canonical blocked episode and verify its `{run_id, node_id, blocked_sequence, prior_attempt_id}` plus ordered `allowed_action_ids[]`. Reject stale command identity without changing the episode.
2. Verify that the storage owner still permits durable mutation, that the safe-point record and snapshot refs are restore-eligible, and that the blocked/recovery hold is durable. If the only legal remedy is not durably anchored, keep the episode blocked and do not start restore or dispatch.
3. Ask the Worktree owner to validate exact repo/worktree/branch identity and acquire the applicable mutation fence. For `safe_point`, invoke the FileSafe transaction and wait for its restart-reconcilable terminal result. For the other targets, invoke the Worktree-owned baseline preparation and exact postcondition check.
4. Persist the baseline-preparation result and all source-control/FileSafe receipt refs before creating runnable successor state. A command retry while an operation is nonterminal resumes or reconciles that operation by identity; it MUST NOT launch a concurrent second restore or worktree preparation.
5. Only a proved-ready baseline may mint the new `attempt_id`, bind worktree ownership, and persist successor lineage to the prior attempt, blocked episode, baseline target, OIDs/digests, and receipts. No worker process or external side effect starts before that durable admission point.
6. The recovery anchor releases only through the storage-owned terminal rule. For `superseded_with_verified_successor`, the successor baseline receipt, new attempt/worktree binding, and admission record MUST all be durable first; process exit, run archival, elapsed time, or an unverified successor does not release it.

#### Result-to-lifecycle mapping

Executor consumes, rather than redefines, the Contracts/FileSafe outcome meanings:

| Owner result | Executor action |
| --- | --- |
| `restored_clean` or `restore_skipped` with the required equality proof | Continue the sequence to durable successor-attempt admission. `restore_skipped` still requires zero path mutation and exact target equality. |
| `restore_refused` | Mint no successor attempt, preserve the current blocked episode and worktree ownership, record the exact reason, and expose only actions valid for that reason. |
| `restore_failed` | Mint no successor attempt. Because FileSafe has proved rollback equality, keep the original blocked episode/anchor and record the failed recovery action without claiming target restoration. |
| `restore_recovery_required` | Mint no successor attempt; retain the mutation fence, safe-point/restore-transaction holds, worktree ownership, and blocked episode until explicit reconciliation proves a terminal state. |
| `restored_with_conflicts` from safe-point or Chat-revert restore | Treat as an owner-contract violation, keep dispatch fenced, and route to recovery diagnostics; exact-replace restore cannot use this compatibility outcome. |

For `historical_commit`, a missing/non-commit OID or any mismatch after isolated-worktree creation refuses admission and leaves the source unchanged. If partial provisioning cannot be proven safely removable, preserve that allocation as blocked recovery rather than deleting it optimistically. For `worktree_head`, either OID or state-digest drift refuses admission without checkout, reset, stash, clean, or byte mutation. Explicit dirty-state confirmation authorizes binding only; it does not waive conflict, active-Git-operation, FileSafe, permission, or write-scope blockers.

If a required safe point is missing or corrupt, the episode becomes or remains `recovery_unavailable`, restore is disabled with the exact owner reason, local work and worktree ownership remain preserved, and no cleanup, timer, or retry converts it to resolved. Only explicit abandon, replan, or owner-verified recovery may change that posture.

If canonical storage degrades during this sequence, storage-owned retry and access-mode rules apply. Executor does not replay the recovery command as an automatic attempt and does not resume blocked work merely because writer access later returns.

#### Acceptance oracles

| Fixture | Required Executor oracle |
| --- | --- |
| `RSP-BASELINE-001` | Exact named safe point/worktree is restored and verified before exactly one new attempt becomes runnable. |
| `RSP-BASELINE-002` | Exact immutable commit OID produces a clean isolated attempt worktree; source dirty bytes, index, branch, and ownership remain unchanged/preserved. |
| `RSP-BASELINE-003` | Exact live `HEAD` plus state digest binds without any SCM mutation; dirty state survives byte-for-byte and is attributed to the successor attempt. |
| `RSP-BASELINE-004` | Unknown target, missing conditional field, moving/abbreviated historical ref, identity mismatch, or digest drift is rejected with no substitution and no successor attempt. |
| `RSP-ATOMIC-001` / `RSP-ATOMIC-003` | Restart or third-party-edit injection never dispatches from an unproved intermediate tree; target/rollback equality may continue, otherwise recovery-required remains fenced. |
| `RSP-RETENTION-001` / `RSP-RETENTION-003` | A long-lived restore-required episode retains its legal remedy; a pre-existing missing/corrupt remedy stays truthfully blocked and never becomes retryable by cleanup. |
| storage-I/O fault during safe-point/baseline receipt persistence | Exact storage-owner retry count is observed; exhausted/non-retryable I/O admits no mutation-capable attempt and recovery does not auto-resume it. |

Negative oracles: no worker dispatch before the baseline receipt is durable; no reused prior `attempt_id`; no generic retry while `requires_safe_point_restore = true`; no anchor release before a verified successor; no exact-OID substitution; no dirty-state discard; and no success inferred from projection/UI state.

ContractRef: ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/FileSafe.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, DecisionID:PD-RSP-07, DecisionID:PD-RSP-04, DecisionID:PD-RSP-06

For MVP cleanup, the executor uses the canonical workspace or `/remote` project binding plus safe points, restore points, and explicit temporary-vs-durable mutation lineage. It must not require sandbox worktree `/jail` semantics for ordinary debug instrumentation cleanup.

### Runtime recovery remediation lineage
Automatic fix cycles attach to a parent attempt using `remediation_root_id`, `remediation_parent_attempt_id`, `remediation_generation`, finding identifiers, and final resolution state. A new canonical graph node is created only when a replan changes canonical graph scope.

### Degradation boundary
Invalid pre-lock draft decomposition may degrade to deterministic flat draft sequencing with warning evidence. Invalid canonical graphs after graph lock are `graph_integrity` failures and MUST NOT silently degrade.
ContractRef: ContractName:Plans/chain-wizard-flexibility.md, ContractName:Plans/interview-subagent-integration.md, ContractName:Plans/Progression_Gates.md
