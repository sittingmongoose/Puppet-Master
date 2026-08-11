# Shard 019: Case L Command Consumer Propagation Addendum - 2026-07-17

Source: `Plans/Commands_System.md`

Source lines: L3778-L4153

Source SHA256: `75c2c8b8c75bf5eecbcc516272f7bdd944f0ff29b3c66b913a1c2f19adc0d3d0`

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

### CS-058 - EventRecord V2 Command Evidence Consumer

```yaml
plan_unit_id: CS-058
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  Command-originated persisted domain evidence consumes EventRecord 2.0 scope, global
  event identity, exact scope-partitioned index identity, scoped lifetime idempotency,
  dedupe catch-up, complete-reader admission, no-secret custody, and synced-receipt truth.
  Project restore, worktree, attempt, receipt, and restore-point events require project
  scope; app-root storage diagnostics use application scope without a fake project;
  StorageCompatibilityStatus is not appended into an incompatible target; and normal
  command dispatch can neither request projector_replay_only nor fabricate local events.
gui_related: false
gui_classification_reason: Defines backend event identity, dedupe, durability, and scope constraints for command handlers.
split_recommended: false
depends_on: [CS-006, CS-007, CV-317, CV-318, CV-320, CV-321, SP-241]
unblocks: []
acceptance_criteria:
  - Every command-originated persisted event uses schema_version 2.0.0, exact scope_kind/project_id pairing, and a registered payload/event owner.
  - EventRecord 2.0 root inspection refuses open unless the reader validates 2.0.0; partial or best-effort projection is impossible.
  - Event index access uses exact app/project scope_partition encoding, zero-padded sequence_id_20, and the canonical event_record_index.v2 key; key/value scope mismatch is corruption.
  - A replayed command identity returns the original only for the same semantic digest; conflict or dedupe_unavailable appends nothing.
  - No command success that requires durability is authorized by persisted_at_utc without the matching synced AppendReceipt or owner receipt.
  - Normal dispatch cannot construct projector_replay_only, and compatibility replay produces zero command/tool/provider/network/notification/usage/safe-point/external side effects.
  - Unsupported/newer-store compatibility status remains diagnostic-only; secrets and local root/worktree/credential paths remain absent or local/redacted.
validation_surfaces:
  - future Case L EventRecord scope, dedupe, replay-only, and command-receipt fixtures
  - python3 -m json.tool Plans/event_record.schema.json
  - python3 scripts/pm-plan-index.py validate
risk_class: command_event_identity_or_durability_drift
reasoning_tier: high
context_scope: case_l_command_eventrecord_v2
implementation_surfaces: [Plans/Commands_System.md, Plans/Contracts_V0.md, Plans/event_record.schema.json, Plans/storage-plan.md]
node_compile_hint:
  mode: case_l_command_eventrecord_consumer
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Case-L:L-007
  - Case-L:L-008
  - Case-L:L-009
  - Case-L:L-023
  - Case-L:EVT-01..EVT-07
preserved_exact_tokens:
  - EventRecord
  - 2.0.0
  - scope_kind
  - scope_partition
  - application
  - project
  - "event_record_index.v2:{scope_partition}:{sequence_id_20}:{event_id}"
  - sequence_id_20
  - projector_replay_only
  - replay_only_not_appendable
  - dedupe_unavailable
  - AppendReceipt
  - synced
negative_constraints:
  - Do not fabricate a project for application scope or emit into an incompatible store.
  - Do not let command handlers create a peer event envelope, dedupe rule, or durability meaning.
  - Do not infer successful persistence from timestamps or projection/UI state.
  - Do not open an EventRecord 2.0 root with a reader that cannot validate 2.0.0 or persist raw secret/credential material in command evidence.
owner_hints: [Plans/Commands_System.md, Plans/Contracts_V0.md, Plans/storage-plan.md]
```

### CS-059 - Storage Compatibility Maintenance Retention And Availability Gate

```yaml
plan_unit_id: CS-059
unit_type: constraint
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  Storage-facing commands consume owner compatibility, migration, maintenance, retention,
  and registry-materialization gates without creating a live unsupported-store viewer,
  generic repair/salvage/Doctor mutation, force-cancel/try-anyway path, retention inference,
  hold/maintenance bypass, or lazy alias rewrite. Retry actions revalidate rather than repair;
  protected hold and manual-compaction requests stay owner-routed; and affected actions remain
  unavailable until their exact machine storage families and value schemas are materialized.
gui_related: true
gui_classification_reason: Compatibility blocks, migration interruption, retention settings, legal holds, compaction, diagnostics, and unavailable actions are visible command states.
split_recommended: false
depends_on: [CS-054, CS-056, CS-057, SP-235, SP-237, SP-243]
unblocks: []
acceptance_criteria:
  - Unsupported/newer-store command inventory exposes only check_for_update, choose_compatible_backup, open_diagnostics, and quit; no live viewer, try_anyway, force-open, downgrade-in-place, or mutation is reachable.
  - Migration cancellation is admitted only in preflight; later phases preserve recovery-on-next-launch disclosure and expose no force-cancel, skip-step, rollback-now, or invented ETA.
  - Retry storage and retry-recovery actions rerun owner admission/verification and never claim byte repair, live salvage, or automatic blocked-work replay.
  - Commands expose no generic verify/repair/salvage, Doctor mutation, in-place editor, or bypass token; backup restore and internal maintenance stay coordinator-owned and offline where required.
  - Unknown retention policy remains indefinite/no-count-eviction and materially_incomplete; no command infers destructive eligibility from prefix, key, path, filename, mtime, ordering, or focus.
  - storage.legal_hold.manage and manual compaction preserve owner permission, actor/reason/receipt, holds/anchors/refs, maintenance lease, and storage access gates.
  - Missing, deferred, ambiguous, or unsupported machine registry family/value schema keeps the affected safe-point, restore-point, migration, retention, quarantine, or deletion action unavailable.
validation_surfaces:
  - future Case L startup command inventory, migration interruption, retention/hold/compaction, and registry-availability fixtures
  - python3 scripts/pm-plan-index.py validate
risk_class: storage_command_maintenance_or_retention_bypass
reasoning_tier: high
context_scope: case_l_storage_compatibility_maintenance_retention_commands
implementation_surfaces: [Plans/Commands_System.md, Plans/storage-plan.md, Plans/storage_value_registry.json, Plans/UI_Command_Catalog.md]
node_compile_hint:
  mode: case_l_storage_compatibility_retention_command_gate
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Case-L:L-005
  - Case-L:L-017
  - Case-L:L-031
  - Case-L:L-032
  - Case-L:PD-L005-01..PD-L005-07
preserved_exact_tokens:
  - blocked_newer_store
  - check_for_update
  - choose_compatible_backup
  - open_diagnostics
  - storage.legal_hold.manage
  - retention_policy_ref
  - materially_incomplete
negative_constraints:
  - Do not turn metadata diagnostics into live unsupported-store inspection or mutation.
  - Do not mint a generic repair/salvage/Doctor mutation command from storage recovery wording.
  - Do not treat command registration, plan validation, or registry-row presence as runtime durability, migration, compaction, or restore proof.
owner_hints: [Plans/Commands_System.md, Plans/storage-plan.md, Plans/UI_Command_Catalog.md]
```
