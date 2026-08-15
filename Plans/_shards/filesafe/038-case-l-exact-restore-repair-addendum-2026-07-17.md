# Shard 038: Case L Exact-Restore Repair Addendum - 2026-07-17

Source: `Plans/FileSafe.md`

Source lines: L14196-L14463

Source SHA256: `6f8c0184cdefccfaa9c955baf7cb1f1bf7b433ccf7cfdcb7f1608d506597d94a`

---

## Case L Exact-Restore Repair Addendum - 2026-07-17

This addendum adopts approved Case L Bundle F decisions `PD-RSP-01` through `PD-RSP-09` only for FileSafe-owned mechanics and its recovery-hold trigger. Storage key/schema/retention/maintenance authority, Contracts enums/events, Worktree baseline effects, Executor attempt admission, Assistant Chat conversation/restore-point lifecycle, and UI command registration remain with their canonical owners. It creates no WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, production build tasks, generated shards/evidence, or governance-seal artifacts.

### F2-200 - Canonical Restore Manifest, Custody, And Alias Consumption

```yaml
plan_unit_id: F2-200
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  FileSafe restore equality is the SHA-256 of a versioned canonical JSON manifest covering the
  declared repository/worktree/SCM/index and tracked, untracked, explicitly mutation-scoped
  ignored, content, symlink, Git-mode, executable, and supported portable metadata boundary.
  Snapshot manifests and blobs are content-addressed below the storage-owner-resolved root outside
  the worktree; remote-project custody stays on the authorized remote host. FileSafe writes only
  the canonical sp:{run_id}:{node_id}:{attempt_id}:{safe_point_id} identity and consumes legacy
  safe_point.sp:{...} and safe_point:<safe_point_id> forms only through deterministic storage-owned
  migration/lookup resolution.
gui_related: false
gui_classification_reason: This unit defines backend snapshot integrity, equality, custody, and compatibility lookup.
depends_on: [F2-074, F2-081, F2-082, F2-189]
unblocks: [F2-201, F2-202, F2-204]
acceptance_criteria:
  - Canonical manifest serialization and SHA-256, not git status or mtime, decides restore equality.
  - Tracked, staged, unstaged, untracked, explicitly scoped ignored, symlink, executable, and submodule fixtures include or exclude exactly the declared boundary.
  - Unsupported entry types fail safe-point creation before mutation, and symlink targets are not followed as content.
  - Snapshot bodies remain off-worktree and out of routine events, redb values, logs, and exports; persisted records carry refs and hashes.
  - Remote restore never falls back to unrelated local snapshot custody.
  - New writes use only the canonical sp: key; zero or ambiguous compatibility lookup fails closed.
validation_surfaces:
  - RSP-SCOPE-001
  - RSP-INTEGRITY-001
  - RSP-INTEGRITY-002
  - RSP-KEY-001
risk_class: restore_manifest_or_custody_drift
reasoning_tier: high
context_scope: filesafe_restore_manifest_custody_and_alias_consumption
implementation_surfaces: [Plans/FileSafe.md, Plans/storage-plan.md, Plans/storage_value_registry.json, Plans/Contracts_V0.md]
node_compile_hint: {mode: filesafe_restore_manifest_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Case L finding L-024
  - Case L approved decisions PD-RSP-02, PD-RSP-03, and PD-RSP-05
preserved_exact_tokens:
  - "sp:{run_id}:{node_id}:{attempt_id}:{safe_point_id}"
  - "safe_point.sp:{run_id}:{node_id}:{attempt_id}:{safe_point_id}"
  - "safe_point:<safe_point_id>"
  - "snapshots/manifests/<sha256>.json"
  - "snapshots/blobs/<sha256>"
  - "SHA-256"
negative_constraints:
  - Do not use git status, mtime, or path count as the equality authority.
  - Do not keep snapshot bodies in the worktree or silently move remote custody local.
  - Do not write a new compatibility alias as a primary safe-point key.
owner_hints: [Plans/FileSafe.md]
```

### F2-201 - Exact-Replace Restore Journal And Verified Rollback

```yaml
plan_unit_id: F2-201
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  Safe-point restore is exact replacement, not merge. FileSafe acquires the named-worktree mutation
  lease, verifies the target before mutation, creates and verifies an off-worktree rollback
  snapshot, durably prepares a deterministic operation journal, applies each path through
  expected-before CAS and same-directory staging/rename/parent durability, verifies full target
  equality, and on failure rolls back through the same discipline. It promises logical transaction
  atomicity while the worktree is fenced, not a portable whole-tree atomic rename.
gui_related: false
gui_classification_reason: This unit defines backend exact-replace application and rollback mechanics.
depends_on: [F2-075, F2-076, F2-077, F2-078, F2-079, F2-200, F2-203]
unblocks: [F2-202, F2-204]
acceptance_criteria:
  - Target manifest/blob/scope/SCM verification completes before target-path mutation.
  - Rollback refs, digests, and every ordered operation are durable in prepared state before the first mutation.
  - Each operation accepts only expected-before or target state; a third state is not overwritten.
  - Deletions use journaled tombstone/rollback custody rather than unjournaled unlink.
  - restored_clean is impossible without full target equality, and restore_failed is impossible without full rollback equality.
validation_surfaces:
  - RSP-ATOMIC-001
  - RSP-ATOMIC-002
  - RSP-ATOMIC-003
  - RSP-EQUAL-001
  - RSP-INTEGRITY-003
risk_class: partial_or_untruthful_restore
reasoning_tier: high
context_scope: filesafe_exact_replace_restore_transaction
implementation_surfaces: [Plans/FileSafe.md, Plans/storage-plan.md, Plans/Contracts_V0.md, Plans/Executor_Protocol.md]
node_compile_hint: {mode: filesafe_exact_replace_restore, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Case L finding L-006
  - Case L approved decision PD-RSP-01
preserved_exact_tokens:
  - "prepared"
  - "applying"
  - "verifying_target"
  - "committed"
  - "rolling_back"
  - "verifying_rollback"
  - "rolled_back"
  - "recovery_required"
  - "logical transaction atomicity"
negative_constraints:
  - Do not implement safe-point restore as merge or best-effort sequential rewrite.
  - Do not claim a portable whole-worktree atomic rename.
  - Do not overwrite a concurrent third state during apply or rollback.
owner_hints: [Plans/FileSafe.md]
```

### F2-202 - Restart Reconciliation And Truthful Restore Outcomes

```yaml
plan_unit_id: F2-202
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  Before ordinary dispatch or janitor cleanup, FileSafe reconciles nonterminal restore journals:
  exact target equality finalizes restored_clean, exact rollback equality finalizes restore_failed,
  expected-before/target-only path state may resume idempotently, and every third, corrupt, missing,
  or unavailable state becomes restore_recovery_required with the mutation fence retained.
  restore_refused is pre-mutation only, restore_skipped requires preflight equality and zero path
  mutations, and exact safe-point or Chat-revert operations never emit restored_with_conflicts.
gui_related: false
gui_classification_reason: This unit defines backend crash convergence and outcome-producer truth.
depends_on: [F2-201]
unblocks: []
acceptance_criteria:
  - Kill after every operation boundary converges to proven target, proven rollback, or fenced recovery-required.
  - restore_refused leaves the admission state unchanged and occurs before target mutation.
  - restore_skipped performs zero target mutations.
  - restore_failed is emitted only when final state equals the recorded admission manifest.
  - Missing and corrupt snapshots remain distinct; neither is flattened into restore_failed.
  - Compatibility filesafe.snapshot_restore remains a wrapper over the Contracts-owned safe_point.restored family.
validation_surfaces:
  - RSP-ATOMIC-001
  - RSP-ATOMIC-002
  - RSP-ATOMIC-003
  - RSP-EQUAL-001
  - RSP-INTEGRITY-001
  - RSP-INTEGRITY-002
  - RSP-INTEGRITY-003
risk_class: restore_outcome_or_restart_drift
reasoning_tier: high
context_scope: filesafe_restore_restart_and_truthful_outcomes
implementation_surfaces: [Plans/FileSafe.md, Plans/Contracts_V0.md, Plans/storage-plan.md]
node_compile_hint: {mode: filesafe_restore_restart_reconciliation, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Case L findings L-006 and L-024
  - Case L approved decision PD-RSP-04
preserved_exact_tokens:
  - "restored_clean"
  - "restored_with_conflicts"
  - "restore_failed"
  - "restore_skipped"
  - "restore_refused"
  - "restore_recovery_required"
  - "snapshot_missing"
  - "snapshot_corrupt"
negative_constraints:
  - Do not report original state preserved unless rollback equality is proven.
  - Do not emit restored_clean without target equality.
  - Do not emit restored_with_conflicts from exact safe-point or Chat-revert restore.
owner_hints: [Plans/FileSafe.md]
```

### F2-203 - Recovery Hold Trigger And Cleanup Exclusion

```yaml
plan_unit_id: F2-203
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  Before restore_safe_point_then_retry becomes the only legal action, FileSafe requires durable
  publication of the blocked episode, canonical safe-point refs, snapshot/blob refs, and blocked
  recovery hold as one storage-defined unit. Active attempts, unresolved restore-required blocks,
  nonterminal restore transactions, preserved runs, and legal holds protect every recovery
  dependency. FileSafe requests release only after resolved, superseded_with_verified_successor,
  or explicit abandoned_by_user and never owns a competing TTL, janitor, compaction, or legal-hold
  policy.
gui_related: false
gui_classification_reason: This unit defines backend recovery-anchor trigger and cleanup exclusion.
depends_on: [F2-077, F2-186, F2-187, F2-189, F2-200]
unblocks: [F2-201]
acceptance_criteria:
  - An unresolved blocked episode cannot be published without durable refs protecting its safe-point record, manifest, blobs, and worktree.
  - A blocked episode older than the storage retention window survives cleanup while any hold remains.
  - Final verified hold release permits only later storage-owned cleanup under the approved retention policy.
  - Missing/corrupt legacy snapshot material produces recovery-unavailable, preserves local work, and does not falsely resolve the episode.
  - Age, process exit, archival, worktree unbinding, and ordinary completion do not release the last legal recovery path.
validation_surfaces:
  - RSP-RETENTION-001
  - RSP-RETENTION-002
  - RSP-RETENTION-003
  - ANCHOR-005-atomic-publish
risk_class: cleanup_deletes_only_legal_recovery_path
reasoning_tier: high
context_scope: filesafe_recovery_hold_trigger
implementation_surfaces: [Plans/FileSafe.md, Plans/storage-plan.md, Plans/Contracts_V0.md]
node_compile_hint: {mode: filesafe_recovery_hold_trigger, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Case L finding L-010
  - Case L approved decision PD-RSP-06
  - Case L approved decisions PD-L010-01 through PD-L010-03
preserved_exact_tokens:
  - "restore_safe_point_then_retry"
  - "resolved"
  - "superseded_with_verified_successor"
  - "abandoned_by_user"
  - "recovery_unavailable"
negative_constraints:
  - Do not let FileSafe invent retention numbers, legal-hold authority, or compaction policy.
  - Do not release the last recovery anchor merely because the run aged, exited, archived, or lost snapshot material.
owner_hints: [Plans/FileSafe.md]
```

### F2-204 - Chat Revert FileSafe Transaction Parity

```yaml
plan_unit_id: F2-204
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  After Assistant Chat resolves cmd.chat.revert to one immutable eligible assistant-turn mutation
  record, FileSafe exact-replaces the complete recorded whole-turn path scope through the same
  manifest verification, rollback snapshot, durable journal, CAS, equality, truthful outcome,
  restart, remote-custody, and recovery-hold rules as safe-point restore. It uses recorded canonical
  absolute identities, never reinterprets paths through the current working_directory, never
  applies a partial multi-file turn, and never rewinds conversation state.
gui_related: false
gui_classification_reason: This unit defines backend FileSafe mechanics consumed by a Chat command.
depends_on: [F2-200, F2-201, F2-202, F2-203]
unblocks: []
acceptance_criteria:
  - A multi-file turn is restored as one complete manifest scope or rolled back/recovery-required as one transaction.
  - Failure or kill after file N of M cannot report partial success.
  - Recorded canonical absolute identities are used; current working_directory cannot retarget the restore.
  - No eligible mutating turn creates no FileSafe transaction and changes no file, worktree, queue, or transcript.
  - Chat revert never emits restored_with_conflicts and never changes conversation history.
validation_surfaces:
  - RSP-CHAT-001
  - RSP-ATOMIC-001
  - RSP-ATOMIC-002
  - RSP-ATOMIC-003
risk_class: chat_revert_partial_or_weaker_restore
reasoning_tier: high
context_scope: filesafe_chat_revert_transaction_parity
implementation_surfaces: [Plans/FileSafe.md, Plans/assistant-chat-design.md, Plans/UI_Command_Catalog.md, Plans/Contracts_V0.md]
node_compile_hint: {mode: filesafe_chat_revert_parity, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Case L finding L-006
  - Case L approved decision PD-RSP-09
preserved_exact_tokens:
  - "cmd.chat.revert"
  - "no_eligible_mutating_turn"
  - "whole-turn mutation manifest"
  - "working_directory"
negative_constraints:
  - Do not make Chat revert a conversation rewind, merge, or partial per-file success path.
  - Do not let FileSafe select the assistant turn or own conversation restore-point lifecycle.
owner_hints: [Plans/FileSafe.md]
```
