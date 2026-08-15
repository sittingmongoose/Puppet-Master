# Shard 019: Case L Command Consumer Propagation Addendum - 2026-07-17

Source: `Plans/Commands_System.md`

Source lines: L3778-L4026

Source SHA256: `af17557e7089aa0224394a5d063da4af28bbc3bbba2a703ab91100ff84d78f70`

---

## Case L Command Consumer Propagation Addendum - 2026-07-17

This addendum propagates approved Case L owner contracts into Commands-owned dispatch admission and owner routing. It does not register UI commands, edit the Command Catalog or wiring, create runtime implementation, run durability/restore fixtures, generate governance artifacts, or certify finding/repository completeness.

### CS-054 - Storage Access And Viewer Command Gate

```yaml
plan_unit_id: CS-054
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  Every User Command, UICommand wrapper, and direct handler consumes the storage-owned
  writer/viewer/blocked access result before side-effect admission. Viewer permits only
  frozen-snapshot read, inspect, search, copy, redacted diagnostic, explicitly permitted
  export/navigation, and ephemeral view-local actions; durable, runtime, filesystem/SCM,
  provider/tool, receipt-producing, and external mutation remains discoverable but disabled
  with storage_read_only. Retry storage and Try write mode are owner actions that require
  full revalidation and never auto-replay blocked work.
gui_related: true
gui_classification_reason: Viewer mode changes visible command availability, disabled reasons, refresh, recovery, and ephemeral-state disclosure.
split_recommended: false
depends_on: [CS-004, CS-007, CS-011, SP-238, SP-239]
unblocks: []
acceptance_criteria:
  - Every command and direct handler is classified against writer, viewer, and blocked access before a side effect can start.
  - Viewer inventory proves zero durable, runtime, filesystem/SCM, provider/tool, receipt-producing, or external mutation, including direct-dispatch bypass attempts.
  - User Command preview remains available only when expansion performs no shell injection, provider/tool call, child launch, persistence, or external mutation.
  - storage_read_only is preserved as the shared disabled result; unknown/missing access state fails closed without a second vocabulary.
  - Retry storage and Try write mode rerun owner gates and do not automatically resume or replay a blocked command.
validation_surfaces:
  - future Case L viewer command-inventory and direct-handler fixtures
  - python3 scripts/pm-plan-index.py validate
risk_class: storage_viewer_command_gate_bypass
reasoning_tier: high
context_scope: case_l_storage_access_command_admission
implementation_surfaces: [Plans/Commands_System.md, Plans/storage-plan.md, Plans/UI_Command_Catalog.md, Plans/Wiring_Matrix.md]
node_compile_hint:
  mode: case_l_storage_viewer_command_gate
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Case-L:L-012
  - Case-L:L-014
  - Case-L:L012-C1..L012-C4
  - Case-L:L014-C1..L014-C4
preserved_exact_tokens:
  - storage_access_mode
  - storage_mode_reason
  - storage_io_class
  - storage_read_only
  - Retry storage
  - Try write mode
negative_constraints:
  - Do not use PID, mtime, heartbeat, visible control state, or lock-file existence as writer authority.
  - Do not invent a cmd.storage command ID in Commands_System.
  - Do not auto-resume blocked work when storage returns to writer mode.
owner_hints: [Plans/Commands_System.md, Plans/storage-plan.md, Plans/UI_Command_Catalog.md]
```

### CS-055 - Root Continuity Fallback And Value-Navigation Consumer

```yaml
plan_unit_id: CS-055
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  Storage precedence selects only a logical-root candidate; Commands consumes bootstrap-binding,
  storage_instance_id, root-generation, active-root, and fallback-base continuity before dispatch.
  Storage-value viewers and root-opening actions use stable owner identity plus route_target/OpenSubject,
  while raw paths remain display-local and cannot select authority. Root mismatch, relocation, and
  fallback divergence uses exactly three registered visible disposition commands with no
  command-frontmatter acceptance, initialization, merge, overwrite, or silent empty-root fallback.
gui_related: true
gui_classification_reason: Root and value navigation, mismatch actions, retained recovery copies, and fallback dispositions are user-visible command surfaces.
split_recommended: false
depends_on: [CS-004, CS-006, CS-012, SP-240]
unblocks: []
acceptance_criteria:
  - config, PUPPET_MASTER_DATA_DIR, project-dir, and global-dir precedence never bypasses continuity proof or silently initializes a known-prior empty candidate.
  - Root/value open actions carry stable root/store/family/value identity and shared route targets; raw paths do not become authority.
  - Use previous location, Choose location, Copy and switch to selected location, and Start a new storage instance cannot be invoked from User Command frontmatter.
  - fallback_diverged never dispatches automatic merge/overwrite and preserves both stores through keep_logical_root, fork_new_instance, or export_both until separate cleanup.
  - The three divergence commands require exact component CAS, lowercase 64-hex hashes, independent permission/confirmation, one storage handler each, idempotent owner receipts, and production-wiring reverse coverage.
  - Fork returns a candidate binding without changing active bootstrap selection; export is encrypted exact-byte custody with explicit destination, non-secret manifest, and key refs.
validation_surfaces:
  - future Case L storage-root continuity, relocation, fallback-divergence, and root-navigation fixtures
  - python3 scripts/pm-plan-index.py validate
risk_class: root_continuity_command_authority_drift
reasoning_tier: high
context_scope: case_l_root_and_value_navigation
implementation_surfaces: [Plans/Commands_System.md, Plans/storage-plan.md, Plans/Contracts_V0.md, Plans/UI_Command_Catalog.md]
node_compile_hint:
  mode: case_l_root_continuity_command_consumer
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Case-L:L-011
  - Case-L:L-018
  - Case-L:L011-C1..L011-C3
  - Case-L:L018-C1..L018-C3
preserved_exact_tokens:
  - logical_root
  - active_root
  - storage_instance_id
  - root_generation
  - fallback_branch_id
  - fallback_base
  - fallback_diverged
  - cmd.storage.fallback.keep_logical_root
  - cmd.storage.fallback.fork_new_instance
  - cmd.storage.fallback.export_both
  - route_target
  - OpenSubject
negative_constraints:
  - Root precedence cannot replace continuity proof.
  - A root-opening/navigation command cannot select writer authority or clear a recovery hold.
  - Fallback never automatically merges, overwrites, or claims cross-host writer exclusion.
owner_hints: [Plans/Commands_System.md, Plans/storage-plan.md, Plans/UI_Command_Catalog.md]
```

### CS-056 - Exact Restore Retry Revert And SCM Command Admission

```yaml
plan_unit_id: CS-056
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  Runtime restore/retry and Chat revert commands consume exact blocked, safe-point, repo,
  worktree, baseline, equality, and receipt identity. restore_safe_point_then_retry accepts
  only the named safe_point when restore is required; historical_commit creates a separate
  clean worktree at a full immutable OID; worktree_head performs no mutation and binds only
  to the exact OID/state digest; and cmd.chat.revert exact-replaces one complete immutable
  whole-turn mutation manifest through FileSafe without conversation rewind or partial success.
gui_related: true
gui_classification_reason: Recovery and revert commands expose visible preconditions, confirmation, disabled reasons, outcomes, and worktree navigation consequences.
split_recommended: false
depends_on: [CS-005, CS-018, CS-039, F2-200, F2-201, F2-202, F2-203, F2-204, EP-072]
unblocks: []
acceptance_criteria:
  - requires_safe_point_restore admits only cmd.runtime.restore_safe_point_then_retry with baseline_target safe_point and exact safe-point/repo/worktree/blocked identity.
  - safe_point, historical_commit, and worktree_head enforce their target-specific fields and postconditions without focus/ref/worktree substitution.
  - Safe-point and restore command admission stays unavailable until the required machine registry families and exact value schemas are materialized; compatibility aliases never trigger lazy ordinary-command rewrite.
  - A successor attempt is impossible before a proved target and durable owner receipt; refused, failed, recovery-required, unavailable, or unknown results mint none.
  - cmd.chat.revert uses the recorded whole-turn scope and canonical identities, never current working_directory, merge, partial per-file success, or conversation rewind.
  - Recovery-required and recovery-unavailable retain mutation fence, blocked episode, holds, local work, and worktree ownership.
validation_surfaces:
  - RSP-ATOMIC-001
  - RSP-ATOMIC-002
  - RSP-ATOMIC-003
  - RSP-BASELINE-001
  - RSP-BASELINE-002
  - RSP-BASELINE-003
  - RSP-BASELINE-004
  - RSP-CHAT-001
risk_class: command_restore_or_baseline_substitution
reasoning_tier: high
context_scope: case_l_restore_retry_revert_commands
implementation_surfaces: [Plans/Commands_System.md, Plans/FileSafe.md, Plans/Executor_Protocol.md, Plans/WorktreeGitImprovement.md, Plans/UI_Command_Catalog.md]
node_compile_hint:
  mode: case_l_restore_retry_command_consumer
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Case-L:L-006
  - Case-L:L-010
  - Case-L:L-020
  - Case-L:L-024
  - Case-L:PD-RSP-01..PD-RSP-07
  - Case-L:PD-RSP-09
preserved_exact_tokens:
  - cmd.runtime.restore_safe_point_then_retry
  - cmd.runtime.retry_now
  - cmd.runtime.start_fresh_attempt
  - cmd.chat.revert
  - safe_point
  - historical_commit
  - worktree_head
  - restore_refused
  - restore_failed
  - restore_recovery_required
negative_constraints:
  - Do not emit restored_with_conflicts from safe-point restore or Chat revert.
  - Do not treat cmd.git.worktree.open navigation as baseline preparation or runnable proof.
  - Do not release a recovery hold or clean preserved work because restore material is missing or corrupt.
owner_hints: [Plans/Commands_System.md, Plans/FileSafe.md, Plans/Executor_Protocol.md, Plans/WorktreeGitImprovement.md]
```

### CS-057 - Conversation Restore-Point Registered Command Boundary

```yaml
plan_unit_id: CS-057
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  Conversation restore-point commands create_restore_point, branch_from_restore, and
  delete_restore_point have canonical UI Command Catalog rows and one-handler production-wiring
  reverse coverage. Branch application creates new thread and conversation-branch identity only
  for branched, emits exactly one restore_point.applied, returns the same result and target IDs on
  replay without a duplicate event, and leaves source conversation/worktree/SCM/runtime state unchanged.
gui_related: true
gui_classification_reason: Restore-point create, branch, delete, disclosure, unavailable states, and resulting thread/branch are visible command behavior.
split_recommended: false
depends_on: [CS-005, CS-006, CS-041, CV-320, SP-242]
unblocks: []
acceptance_criteria:
  - cmd.chat.create_restore_point, cmd.chat.branch_from_restore, and cmd.chat.delete_restore_point each have one catalog row, conditional args, and one-handler production-wiring reverse coverage.
  - Catalog registration cannot enable restore-point actions until the restore_point_record family and exact value schema are materialized in the machine storage registry.
  - Registered branch consumes exact project/restore-point/source-thread/expected-hash identity and discloses source boundary plus new target before creation.
  - Only branched creates new thread/conversation-branch identity and exactly one restore_point.applied; refused/failed/expired/deleted/corrupt/stale/permission/storage/hold states return no target IDs and emit no event.
  - Replay returns the recorded result and same target IDs without a duplicate restore_point.applied.
  - Source thread, source conversation branch, source worktree, files, Git/index, queue, and runtime safe points remain unchanged on first execution and replay; successful application does not consume the restore point, and optional safe_point_id is lineage only.
validation_surfaces:
  - RSP-RP-001
  - RSP-RP-002
  - RSP-RP-003
  - RSP-RP-004
  - RSP-CMD-001
risk_class: restore_point_ghost_or_composite_command
reasoning_tier: high
context_scope: case_l_restore_point_command_registration
implementation_surfaces: [Plans/Commands_System.md, Plans/UI_Command_Catalog.md, Plans/Wiring_Matrix.md, Plans/assistant-chat-design.md]
node_compile_hint:
  mode: case_l_restore_point_registration_dependency
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Case-L:L-022
  - Case-L:PD-RSP-08
preserved_exact_tokens:
  - cmd.chat.create_restore_point
  - cmd.chat.branch_from_restore
  - cmd.chat.delete_restore_point
  - available
  - expired
  - deleted
  - corrupt
  - branched
  - refused
  - failed
negative_constraints:
  - Do not replace live-derived fail-closed catalog/wiring validation with a stale hand-maintained ghost-command list.
  - Do not combine conversation branching with FileSafe/workspace restore.
  - Do not let Commands_System own command registration or the conversation lifecycle.
owner_hints: [Plans/Commands_System.md, Plans/UI_Command_Catalog.md, Plans/assistant-chat-design.md]
```
