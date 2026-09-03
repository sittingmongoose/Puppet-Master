# Shard 021: Case L command registration and storage-gate propagation - 2026-07-17

Source: `Plans/UI_Command_Catalog.md`

Source lines: L8504-L9690

Source SHA256: `e90c2d9e9cd4dd77d91979cf6ed178eb6f9bf117ad4dbda3dbf62a060fe35af9`

---

## Case L command registration and storage-gate propagation - 2026-07-17

This section is the exclusive catalog-owner registration for the approved Case L durable-state controls. The registration is mechanically required by `UIW-002` and `UIW-003`: each approved interactive control emits exactly one typed UICommand and no UI surface calls a storage, FileSafe, Worktree, Executor, or Chat owner directly. It consumes the approved owner contracts and creates no second storage algorithm, restore engine, retention policy, EventRecord envelope, or product choice.

The global storage gate applies before command-local permission or business validation on every dispatch path, including direct handlers. An unknown/missing access result fails closed. A mutation-capable command requires `storage_access_mode = writer` unless its row below is an explicitly admitted recovery-shell control. In `viewer`, only frozen/manual-refresh inspection, read-only search/copy/export/navigation, and visibly ephemeral view-local state are allowed; durable/runtime/external mutation returns `storage_read_only`. A returned writer posture never automatically replays a blocked command. An unsupported/newer store is metadata-diagnostics-only and exposes only the owner intents `check_for_update | choose_compatible_backup | open_diagnostics | quit`, not a live viewer or mutation command.

Case L domain actions carry an idempotency identity in the UICommand envelope even when the row's domain arguments do not repeat it. For the app-root lifetime, a replay with the same `(scope_partition, event_type, idempotency_key)` and semantic digest returns the original owner result; a conflicting digest fails closed and appends nothing. Every persisted event uses Contracts-owned EventRecord `schema_version = 2.0.0`, `scope_kind`, and conditional `project_id`; the catalog never builds a local event envelope.

### Storage access, root recovery, navigation, retention, and project deletion rows

These are the seventeen stable Case L IDs forced by approved controls. `storage.legal_hold.manage` remains the protected owner permission/action token; the UICommand is separately named `cmd.storage.legal_hold.manage`.

| Command ID | Args schema and normalization | Owner precondition / permission | Owner result and EventRecord v2 binding | command_kind |
|---|---|---|---|---|
| `cmd.storage.viewer.refresh` | `{ storage_instance_id, root_generation, captured_manifest_generation }`; direct storage viewer action | `storage_access_mode == viewer && compatible_snapshot_available` | Replaces only the captured frozen read snapshot/high-water mark; no durable mutation and no domain event. | `shell_view` |
| `cmd.storage.try_write_mode` | `{ storage_instance_id, logical_root_fingerprint, root_generation, captured_manifest_generation }`; storage admission action | `storage_access_mode == viewer && storage_mode_reason == lock_held`; ordinary permission checks still apply | Closes readers and reruns continuity, safety, version, integrity, generation, OS-lock, recovery, and migration admission. Returns the owner `storage_access_mode`/`storage_mode_reason`; emits only a Contracts-registered application-scoped recovery event such as `storage.boot_recovery` when that owner operation actually occurs. It never auto-resumes work. | `domain_action` |
| `cmd.storage.retry` | `{ storage_instance_id, logical_root_fingerprint, root_generation, storage_io_class }`; storage admission action | `storage_mode_reason == storage_io_exhausted`; only the explicit user probe is admitted | Revalidates writeability, root identity, versions, integrity, lock, and checkpoints and returns the owner access status. It repairs no bytes and never auto-replays a blocked command; owner recovery evidence, if produced, is application-scoped EventRecord 2.0. | `domain_action` |
| `cmd.storage.root.use_previous` | `{ expected_bootstrap_binding_sha256, previous_storage_instance_id, previous_root_ref }`; root-recovery action | `storage_mode_reason == root_mismatch && previous_root_reachable && permission_allowed` | Revalidates and reuses the previously bound root without deleting/overwriting another root; consumes owner receipt/status. No unregistered event type is invented. | `domain_action` |
| `cmd.storage.root.choose` | `{ expected_bootstrap_binding_sha256, candidate_root_ref }`; root picker plus owner preflight | `storage_mode_reason == root_mismatch && permission_allowed` | Selects one candidate for owner continuity/version/integrity validation; selection alone is not writer authority and never initializes an empty root. | `domain_action` |
| `cmd.storage.root.copy_and_switch` | `{ expected_bootstrap_binding_sha256, source_storage_instance_id, source_root_generation, source_root_ref, destination_root_ref }`; relocation action | `storage_mode_reason == root_mismatch && source_verified && destination_preflight_passed && permission_allowed` | Runs copy-validate-switch with binding update last and retains the verified source as recovery copy. Returns the owner relocation receipt/status; no peer event is minted. | `domain_action` |
| `cmd.storage.root.start_new_instance` | `{ expected_bootstrap_binding_sha256, expected_prior_storage_instance_id?, confirmation_strength: "strong" }`; new-instance recovery action | `storage_mode_reason == root_mismatch && strong_confirmation_complete && permission_allowed` | Mints a new `storage_instance_id`, preserves prior binding history, and never overwrites/deletes the prior root. A stale binding refuses before creation. | `domain_action` |
| `cmd.storage.fallback.return_fast_forward` | `{ storage_instance_id, fallback_branch_id, fallback_base_sha256, logical_root_fingerprint, expected_logical_base_sha256 }`; fallback reconciliation action | `fallback_active && logical_root_matches_fallback_base && permission_allowed` | Runs only the owner fast-forward copy-validate-switch. `fallback_diverged` refuses this command; no automatic merge/overwrite exists and both stores remain recoverable. | `domain_action` |
| `cmd.storage.fallback.keep_logical_root` | Closed `StorageFallbackDispositionRequest` keep variant: common fields only, with `command_id = "cmd.storage.fallback.keep_logical_root"` and `confirmation = "retain_fallback_and_select_logical"`; direct recovery-shell action | `storage_access_mode == viewer && storage_mode_reason == fallback_diverged && permission_allowed && confirmation == "retain_fallback_and_select_logical" && !operation_in_progress` | Dispatches only `handlers::storage::fallback_keep_logical_root`; consumes `StorageFallbackDispositionResult`, retains both roots, and writes `StorageFallbackResolutionReceipt` without an EventRecord. | `domain_action` |
| `cmd.storage.fallback.fork_new_instance` | Closed `StorageFallbackDispositionRequest` fork variant: common fields only, with `command_id = "cmd.storage.fallback.fork_new_instance"` and `confirmation = "create_inactive_candidate_without_switch"`; direct recovery-shell action | `storage_access_mode == viewer && storage_mode_reason == fallback_diverged && permission_allowed && confirmation == "create_inactive_candidate_without_switch" && !operation_in_progress` | Dispatches only `handlers::storage::fallback_fork_new_instance`; consumes `StorageFallbackDispositionResult`, returns only the inactive candidate binding without changing active bootstrap selection, retains both roots, and writes `StorageFallbackResolutionReceipt` without an EventRecord. | `domain_action` |
| `cmd.storage.fallback.export_both` | Closed `StorageFallbackDispositionRequest` export variant: common fields plus only `destination_ref` and `encryption_key_ref`, with `command_id = "cmd.storage.fallback.export_both"` and `confirmation = "encrypt_exact_bytes_and_retain_sources"`; direct recovery-shell export action | `storage_access_mode == viewer && storage_mode_reason == fallback_diverged && permission_allowed && confirmation == "encrypt_exact_bytes_and_retain_sources" && destination_available && encryption_key_available && !operation_in_progress` | Dispatches only `handlers::storage::fallback_export_both`; consumes `StorageFallbackDispositionResult`, returns output `export_custody` for the encrypted exact-byte package, retains both roots until separate cleanup, and writes `StorageFallbackResolutionReceipt` without an EventRecord. | `domain_action` |
| `cmd.storage.open_value` | `{ storage_instance_id, root_generation, store_family_id, value_key_ref, route_target, open_subject }`; normalizes to `route_target`/`OpenSubject` | compatible captured value is readable under ordinary read/export permission | Opens exact redacted owner-resolved identity at the captured high-water mark; raw path is never authority and no state changes. | `navigation_wrapper` |
| `cmd.storage.open_root` | `{ storage_instance_id, root_generation, root_kind, root_ref, route_target, open_subject }`, where `root_kind = logical_root | active_root | relocation_source | fallback_recovery_copy`; normalizes to `route_target`/`OpenSubject` | exact retained root identity is safely revealable under ordinary read/export permission | Reveals/navigates to the exact target only; it cannot select authority, promote writer mode, initialize, relocate, clear a hold, or fall back to an empty surface. | `navigation_wrapper` |
| `cmd.storage.legal_hold.manage` | `{ scope_kind, project_id?, hold_id, action, semantic_scope_ref, reason, expected_hold_sha256? }`, `action = set | clear` | `storage_access_mode == writer && permission(storage.legal_hold.manage) && reason_present && retention_hold_record_available` | Produces the durable `retention_hold_record` receipt plus `storage.retention_hold_changed` EventRecord 2.0 with `scope_kind = application | project` and matching conditional `project_id`. Holds compose by union and never clear automatically. | `domain_action` |
| `cmd.storage.compaction.request` | `{ storage_instance_id, retention_policy_ref, reason? }`; owner-admitted maintenance request only | `storage_access_mode == writer && permission_allowed && storage_maintenance_operation_available && maintenance_lease_available` | Requests owner evaluation; it never directly compacts or bypasses holds/anchors/refs. Accepted lifecycle uses application-scoped `storage.compaction_lifecycle_changed` EventRecord 2.0 and the `storage_maintenance_operation` row. | `domain_action` |
| `cmd.settings.open_storage_retention` | `{ project_id?, route_target, open_subject }`; navigation to `Advanced > Storage & Retention` | settings inventory and route target are available | Opens the owner-backed Settings surface. Individual settings remain registry-owned/non-command values; this command changes no retention value and emits no domain event. | `navigation_wrapper` |
| `cmd.project.delete_data` | `{ project_id, expected_project_data_sha256, confirmation_strength: "strong", reason? }`; destructive project-data intent, distinct from `cmd.project.remove` | `storage_access_mode == writer && project_data_enumerated && strong_confirmation_complete && permission_allowed && storage_deletion_record_available` | Persists the project-scoped `storage_deletion_record` and `storage.deletion_lifecycle_changed` EventRecord 2.0, removes project content only through owner compaction, and blocks on ambiguous/cross-project reachability or holds. It never means Remove project from list. | `domain_action` |

`cmd.chat.delete` remains the sole catalog thread-delete ID; the planning alternate spelling is not a second registration. It requires explicit confirmation of immediate logical removal, purge within 24 hours unless held, indefinite content-free tombstone, and backup-byte retention up to 30 days unless held. It binds to project-scoped `storage_deletion_record` and `storage.deletion_lifecycle_changed`; message-level delete remains unsupported. `cmd.project.remove` remains list-only, while `cmd.project.delete_data` is the separately confirmed data-purge intent.

Both deletion commands consume the Storage-owned lifecycle without directly purging or clearing holds. Owner progress is `requested -> logically_hidden`, then `logically_hidden -> held|purge_pending`, `held -> purge_pending` only after every owner-cleared hold and complete eligibility revalidation, and `purge_pending -> purged` only after verified committed successor-generation authority; `purged` is terminal. `compaction_generation` is absent outside `purge_pending|purged`, optional non-negative integer for `purge_pending`, and required non-negative integer for `purged`. `failed` is admitted only from `requested|logically_hidden|purge_pending`, requires non-empty reason, remains fenced, and retries with the same deletion/idempotency identity only after holds, tombstone, scope, storage-writer posture, and purge/compaction authority are revalidated. Refusal, ambiguity, replay, hold, and unavailable authority append no duplicate success event and perform no purge.

The three divergence dispositions consume the Contracts-owned closed `StorageFallbackDispositionRequest` exactly. Common required fields are `command_id`, `idempotency_key`, `actor_ref`, `confirmation`, `expected_storage_instance_id`, `expected_logical_root_fingerprint`, `expected_root_generation`, `expected_fallback_branch_id`, `expected_fallback_base_ref`, `expected_logical_head_sha256`, `expected_fallback_head_sha256`, and `expected_bootstrap_binding_sha256`. Keep and fork allow only those common fields. Export adds only `destination_ref` and `encryption_key_ref`; additional or wrong-variant fields are invalid. The required `confirmation` constants are respectively `retain_fallback_and_select_logical`, `create_inactive_candidate_without_switch`, and `encrypt_exact_bytes_and_retain_sources`. `expected_root_generation` is a nonnegative integer; instance and branch IDs use their owner UUID identities; `expected_fallback_base_ref` is the immutable owner ref and never a raw path. `expected_logical_root_fingerprint` and every `*_sha256` value are lowercase 64-hex SHA-256. The sole storage handler revalidates every CAS component immediately before any effect; a missing, malformed, or changed component returns `state_changed` and performs no authority change, fork, export, cleanup, or receipt of success.

Every command consumes the same closed `StorageFallbackDispositionResult`. Its required fields are `command_id`, `idempotency_key`, `outcome`, `reason_code`, `storage_access_mode`, `storage_mode_reason`, `active_bootstrap_binding_sha256`, `logical_head_sha256`, `fallback_head_sha256`, `retained_logical_root_ref`, `retained_fallback_root_ref`, `binding_changed`, `cleanup_performed`, `owner_receipt_ref`, `candidate_binding`, and `export_custody`; both variant fields are required-present and nullable. `outcome` is exactly `applied | replayed | refused | failed_recoverable`. Applied/replayed returns use `reason_code = null` and a non-null owner receipt. Refusal reasons are limited to `invalid_request | permission_denied | confirmation_required | state_changed | idempotency_conflict | operation_in_progress | invalid_destination`; recoverable-failure reasons are limited to `integrity_failure | storage_io_exhausted | encryption_unavailable | custody_verification_failed`. Keep success has `binding_changed = true` and both variants null. Fork success has `binding_changed = false`, `export_custody = null`, and only the closed inactive `candidate_binding`; the active bootstrap binding is unchanged. Export success has `binding_changed = false`, `candidate_binding = null`, and only the closed output `export_custody`; its `manifest_ref` is custody evidence produced by the owner, never request input, and the active binding and both source heads remain unchanged. Refused/failed_recoverable results set both variants null, claim no binding change or cleanup, and use only owner reason codes. `cleanup_performed` is always false, and both root refs remain retained.

Each disposition is independently permissioned and requires its command-specific typed `confirmation` value. The UI names the exact two retained roots, the selected disposition, and for export the destination/key refs before dispatch; it presents output manifest custody only after a successful owner result. Disabled reasons are closed to `fallback_not_diverged | state_changed | integrity_failure | permission_denied | confirmation_required | operation_in_progress | required_family_unavailable`, with `destination_unavailable | encryption_key_unavailable` additionally admitted only for export. The command-envelope `(command_id, idempotency_key, semantic_digest)` is the owner receipt identity: replay returns the same `StorageFallbackDispositionResult` and `StorageFallbackResolutionReceipt`, while an identity reused with different CAS or export content refuses. `StorageFallbackResolutionReceipt` is the sole durable audit artifact. All three rows MUST NOT emit or imply `storage.fallback_reconciled`, a generic command-applied event, or any other EventRecord family. `cmd.storage.fallback.return_fast_forward` remains a separate unchanged-base action and is never an alias for a divergence disposition.

The catalog consumes the owner enums without aliases: `storage_access_mode = writer | viewer | blocked`; `storage_mode_reason = normal | lock_held | lock_indeterminate | unsupported_store_version | unsafe_filesystem_no_fallback | storage_io_exhausted | root_mismatch | root_unavailable | fallback_diverged`; and `storage_io_class = interrupted | transient_busy | capacity_exhausted | quota_exhausted | read_only_media | permission_denied | device_unavailable | lock_conflict | integrity_failure | invalid_path`. Only `interrupted` (at most three immediate adapter attempts) and `transient_busy` (exactly once after 250 ms) receive owner automatic retry; command dispatch adds no retry budget and unknown storage I/O maps owner-side to `device_unavailable`.

Closed Case L storage dispatch reasons consumed by these rows are the owner tokens `storage_read_only | storage_io_exhausted | unsupported_store_version | root_mismatch | root_unavailable | fallback_diverged | permission_denied | operation_in_progress | state_changed | integrity_failure | invalid_path`. A missing/deferred/ambiguous/unsupported required machine family returns `required_family_unavailable`. Root-binding/hash or captured-generation change returns `state_changed`. Unknown/malformed command or owner state blocks without mutation. Recovery-shell exceptions admit only the exact state named in their row; they do not weaken the global write gate.

No catalog ID exists for generic verify, repair, salvage, Doctor mutation, force-open, `try_anyway`, force-cancel, rollback-now, skip-step, arbitrary retry, automatic merge/overwrite, in-place downgrade, or live newer-store viewing. `cmd.storage.compaction.request` is not direct compaction, and no retention command infers destructive eligibility from prefix, key, path, filename, mtime, ordering, or focus.

ContractRef: ContractName:Plans/storage-plan.md#Case-L-3, ContractName:Plans/storage-plan.md#Case-L-4, ContractName:Plans/Commands_System.md#0.3, ContractName:Plans/Contracts_V0.md#EventRecord, ContractName:Plans/storage_value_registry.json, ContractName:Plans/UI_Wiring_Rules.md#UIW-002, ContractName:Plans/UI_Wiring_Rules.md#UIW-003

### Exact recovery, Chat revert, and conversation restore-point command contracts

| Command ID | Normalization / exact domain arguments | Required registry families and scope | Result, EventRecord, and idempotency |
|---|---|---|---|
| `cmd.runtime.restore_safe_point_then_retry` | Canonical runtime action; `{ project_id, run_id, node_id, blocked_sequence, attempt_id, safe_point_id, repo_id, worktree_id, baseline_target: "safe_point" }` | `safe_point_record`, `safe_point_restore_transaction`, `recovery_anchor_record`; project scope | FileSafe outcome is exactly `restored_clean | restore_skipped | restore_refused | restore_failed | restore_recovery_required`; only the first two with equality and durable baseline receipt can admit a successor attempt. Producer emits project-scoped `safe_point.restored` EventRecord 2.0 once by command-envelope idempotency identity. |
| `cmd.runtime.retry_now` | Canonical runtime action; common blocked identity plus the conditionally exact `baseline_target` row above | matching target families/receipts; project scope | Same target-specific owner result and durable baseline admission; no target is inferred and no automatic retry occurs. |
| `cmd.runtime.start_fresh_attempt` | Canonical runtime action; common blocked identity plus the conditionally exact `baseline_target` row above | matching target families/receipts; project scope | Same target-specific owner result; a new attempt is minted only after durable postcondition/receipt and never reuses the prior `attempt_id`. |
| `cmd.orchestrator.safe_point_retry` | `normalization.kind = wrapper`, `normalizes_to_contract = cmd.runtime.restore_safe_point_then_retry`, `alias_of_command_id = null`; accepts the canonical domain fields plus optional `permission_snapshot_id` | same safe-point families and project scope | Admission validates the optional permission snapshot against current permission state, consumes it, and dispatches the exact canonical payload to `handlers::runtime::restore_safe_point_then_retry`. Result, effects, `safe_point.restored` producer, idempotency, and admission are identical to the runtime action. |
| `cmd.orchestrator.restore_safe_point_then_retry` | `normalization.kind = compatibility_alias`, `normalizes_to_contract = cmd.runtime.restore_safe_point_then_retry`, `alias_of_command_id = cmd.orchestrator.safe_point_retry`; accepts the same wrapper input and applies the identical deterministic transform | same safe-point families and project scope | Dispatches the exact canonical payload to `handlers::runtime::restore_safe_point_then_retry` and returns the identical runtime result; no second handler, event, effect, admission, or idempotency domain. |
| `cmd.chat.revert` | Canonical Chat action; `{ project_id, thread_id, target_message_id?, repo_id, worktree_id, expected_turn_manifest_sha256 }`; Chat resolves one immutable whole-turn mutation record | FileSafe snapshot/transaction custody plus matching recovery holds; project scope | Same FileSafe outcome/equality/restart truth as safe-point restore. FileSafe maps its snapshot wrapper to the Contracts-owned project-scoped safe-point restore family; no `restore_point.*` event and no transcript rewind. `no_eligible_mutating_turn` creates no transaction. |
| `cmd.chat.create_restore_point` | Canonical Chat lifecycle action; `{ project_id, thread_id, source_message_id, idempotency_key }` | `restore_point_record` at `rp:{project_id}:{restore_point_id}`; project scope | Freezes one inclusive source message boundary and produces `restore_point.created` EventRecord 2.0 with immutable status `available`. Equal identity plus equal semantic content returns the original record; conflicting content is refused without overwrite. It stores conversation/provenance/attachment/citation refs and hashes, never workspace file bodies, secrets, ephemeral stream state, or queued messages. |
| `cmd.chat.branch_from_restore` | Canonical Chat lifecycle action; `{ project_id, restore_point_id, source_thread_id, expected_restore_point_sha256, new_thread_title? }` | `restore_point_record`; project scope | Before creation discloses the exact source thread/branch/message boundary, running/dirty source state, and new target. Result is exactly `branched | refused | failed`; only `branched` creates new `thread_id`/conversation `branch_id` and emits exactly one `restore_point.applied` EventRecord 2.0. Replay returns the recorded result and same target IDs without a duplicate event. `refused`/`failed` return no target IDs and emit no event. Every first execution and replay leaves source thread/branch/worktree/files/Git/index/queue/safe points unchanged. |
| `cmd.chat.delete_restore_point` | Canonical Chat lifecycle action; `{ project_id, restore_point_id, expected_restore_point_sha256 }` | `restore_point_record` plus descendant-branch, application, preserve, legal-hold, in-flight, and source-lineage refs; project scope | May transition only exact-hash `available` to `deleted` and emit `restore_point.deleted` EventRecord 2.0 after permission/writer/hold preflight. A protected record stays available and delete is refused; replay returns the recorded result. It never clears a hold, consumes an application, or deletes source thread/worktree/files. |

Restore-point status is closed to immutable `available -> expired | deleted | corrupt`; successful application is not a lifecycle transition and does not consume the record. Current policy is `RP-RESTOREPOINT-90D-AFTER-RELEASE@1.0.0`: expiry eligibility is inclusive at owner-proven `reference_release + 7,776,000 seconds`, and count pressure at `2,048/project` selects only the oldest eligible record. Descendant branch/application refs, preserve/legal holds, in-flight application, source-lineage, live, recovery, backup, rollback, and maintenance refs override age and count eligibility until their owner-defined release evidence is durable. The catalog exposes no timer, undo, release inference, or hold-clear shortcut. A deleted source stays hidden: branch is permitted only while the exact frozen boundary and every required retained ref still verify, and otherwise returns `refused` with `source_deleted_content_unavailable`, creates no identity, reconstructs nothing from tombstone/backup projection, and leaves record status unchanged. Expired, deleted, corrupt, expected-hash-mismatch, source-content-unavailable, permission, `storage_read_only`, `storage_io_exhausted`, hold, `operation_in_progress`, and missing-family states remain inspectable with the exact unavailable reason but fail without a new thread or invalid mutation. The application result remains `branched | refused | failed`, not a FileSafe restore outcome. Create/branch/delete registrations remove the former `cmd.chat.branch_from_restore` ghost-ID blocker and remain separate from `cmd.chat.revert`.

The safe-point/Chat-revert closed conflict reasons are exactly `worktree_path_mismatch | branch_mismatch | head_mismatch | baseline_stale | snapshot_missing | snapshot_corrupt | snapshot_scope_unsupported | target_path_conflict | restore_conflict | concurrent_edit_conflict | historical_commit_missing | restore_recovery_required | canonicalization_failed | permission_denied`. Orchestrator availability may additionally expose `safe_point_missing | state_changed | operation_in_progress`; Chat may return `no_eligible_mutating_turn` before transaction creation. Unknown outcome/reason fails closed, retains fences/holds, emits no success, and routes to diagnostics.

ContractRef: ContractName:Plans/Commands_System.md#0.3, ContractName:Plans/Executor_Protocol.md#approved-baseline-target-retry-and-restore-lifecycle, ContractName:Plans/WorktreeGitImprovement.md#approved-exact-baseline-target-SCM-contract, ContractName:Plans/FileSafe.md#11.1.2b, ContractName:Plans/Contracts_V0.md#safe_point.restored, ContractName:Plans/storage_value_registry.json, DecisionID:PD-RSP-01, DecisionID:PD-RSP-04, DecisionID:PD-RSP-07, DecisionID:PD-RSP-08, DecisionID:PD-RSP-09

### UCC-110 - Run Graph Canvas Interaction Command Family

```yaml
plan_unit_id: UCC-110
unit_type: command_contract
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  Run Graph canvas interaction commands are `cmd.run_graph.pan`, `cmd.run_graph.zoom`, `cmd.run_graph.drag_node`,
  `cmd.run_graph.open_minimap_target`, `cmd.run_graph.open_context_menu`, `cmd.run_graph.keyboard_navigate`,
  `cmd.run_graph.set_selection`, `cmd.run_graph.set_problems_filter`, and `cmd.run_graph.search`, adopting the ids
  named in Run_Graph_View.md RGV-017 and its repair addendum verbatim. Shared disabled reasons are graph_unloaded,
  modal_capture, read_only_layout, selection_locked, and permission_denied. All rows except drag_node are
  view-projection interactions that never mutate run, node, or projection state; drag_node requires editable layout
  mode. The problems filter is off by default, filters to attention_required, blocked, and degraded elements, resets
  on focused-run change, and is never persisted globally. Graph search highlights matches in place and does not
  rewrite focused-run state except through an explicit route.
gui_related: true
gui_classification_reason: Registers user-visible graph canvas pointer, keyboard, minimap, filter, and search commands.
depends_on: [RGV-017, OP-030, UCC-024]
unblocks: []
acceptance_criteria:
  - Every graph canvas interaction control dispatches one of the nine stable command IDs above.
  - Disabled states render with one of the five shared disabled reasons instead of hiding the control.
  - set_problems_filter is off by default, resets across focused-run changes, and never persists globally.
  - Non-drag rows mutate no run, node, or projection state; drag_node is unavailable outside editable layout mode.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
risk_class: run_graph_command_catalog_gap
reasoning_tier: high
context_scope: run_graph_canvas_commands
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - Plans/Run_Graph_View.md
  - Plans/Wiring_Matrix.md
node_compile_hint:
  mode: run_graph_canvas_command_catalog
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Run_Graph_View.md:1073"
  - "Plans/Run_Graph_View.md:1147-1210"
  - "Plans/Orchestrator_Page.md:2324"
  - "Concepts/pm6-build (PMConcept6 demo; source-lineage-only per Plans/usage-feature.md)"
preserved_exact_tokens:
  - "cmd.run_graph.pan"
  - "cmd.run_graph.zoom"
  - "cmd.run_graph.drag_node"
  - "cmd.run_graph.open_minimap_target"
  - "cmd.run_graph.open_context_menu"
  - "cmd.run_graph.keyboard_navigate"
  - "cmd.run_graph.set_selection"
  - "cmd.run_graph.set_problems_filter"
  - "cmd.run_graph.search"
  - "graph_unloaded"
  - "modal_capture"
  - "read_only_layout"
  - "selection_locked"
  - "permission_denied"
negative_constraints:
  - Do not mutate run, node, or projection state from view-projection interaction commands.
  - Do not persist the problems filter globally or across unrelated projects.
  - Do not mint differently spelled duplicates of the RGV-017 interaction ids.
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/Run_Graph_View.md
  - Plans/Wiring_Matrix.md
```

### UCC-111 - Orchestrator Projection Actions And Safe Point Retry

```yaml
plan_unit_id: UCC-111
unit_type: command_contract
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  Orchestrator projection-action commands are `cmd.orchestrator.safe_point_retry` (the OP-033 UI identity reconciled
  to the later Case L exact-restore contract), `cmd.orchestrator.copy_run_id`, `cmd.orchestrator.export_ledger`
  (OP-031), `cmd.orchestrator.set_seam_expansion`, and `cmd.orchestrator.set_evidence_filter`. Safe-point retry
  carries project/run/node/blocked/attempt, exact safe-point/repo/worktree, baseline_target safe_point,
  optional permission snapshot, and the command-envelope idempotency identity; requires the named confirmation modal before dispatch;
  preserves the four pre-modal disabled reasons safe_point_missing, state_changed, permission_denied, and
  operation_in_progress; and normalizes to cmd.runtime.restore_safe_point_then_retry. The compatibility alias
  cmd.orchestrator.restore_safe_point_then_retry has no second handler or authority. Ledger export serializes only the visible filtered
  projection with usage_event_ref provenance. Seam expansion and evidence filter are shell/view commands following
  the cmd.orchestrator.switch_tab subview convention and mutate no records.
gui_related: true
gui_classification_reason: Registers user-visible Orchestrator retry, export, clipboard, and subview commands.
depends_on: [OP-031, OP-033, UCC-023, UCC-089]
unblocks: []
acceptance_criteria:
  - No cmd.orchestrator.safe_point_retry dispatch occurs without the named confirmation modal.
  - Safe-point retry disabled reasons are exactly safe_point_missing, state_changed, permission_denied, and operation_in_progress.
  - The four availability reasons do not collapse later snapshot_corrupt, snapshot_scope_unsupported, concurrent_edit_conflict, baseline_stale, or restore_recovery_required outcomes.
  - Both Orchestrator spellings normalize to cmd.runtime.restore_safe_point_then_retry with baseline_target safe_point and exact repository/worktree/blocked identity.
  - Both spellings accept the same wrapper input; optional permission_snapshot_id is validated against current permission state and consumed before the exact canonical payload reaches handlers::runtime::restore_safe_point_then_retry.
  - Both spellings share the runtime result, safe_point.restored producer, effects, idempotency identity, and admission decision; no peer handler or receipt-only/no-event execution path exists.
  - Ledger export preserves usage_event_ref and usage_record_id provenance and exports no raw records, evidence payloads, or secrets.
  - Seam expansion and evidence filter commands are view-local and mutate no seam or evidence records.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
risk_class: orchestrator_command_catalog_gap
reasoning_tier: high
context_scope: orchestrator_projection_commands
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - Plans/Orchestrator_Page.md
  - Plans/Wiring_Matrix.md
node_compile_hint:
  mode: orchestrator_projection_command_catalog
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Orchestrator_Page.md:2322"
  - "Plans/Orchestrator_Page.md:2453-2607"
  - "Concepts/pm6-build (PMConcept6 demo; source-lineage-only per Plans/usage-feature.md)"
preserved_exact_tokens:
  - "cmd.orchestrator.safe_point_retry"
  - "cmd.orchestrator.copy_run_id"
  - "cmd.orchestrator.export_ledger"
  - "cmd.orchestrator.set_seam_expansion"
  - "cmd.orchestrator.set_evidence_filter"
  - "safe_point_missing"
  - "state_changed"
  - "permission_denied"
  - "operation_in_progress"
negative_constraints:
  - Do not dispatch cmd.orchestrator.safe_point_retry without the named confirmation.
  - Do not create retry authority outside the runtime recovery family normalization.
  - Do not include raw records, evidence payloads, or secrets in ledger exports.
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/Orchestrator_Page.md
  - Plans/Wiring_Matrix.md
```

### UCC-112 - Wizard And Plan Compile Replay Commands

```yaml
plan_unit_id: UCC-112
unit_type: command_contract
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  Replay projection commands are `cmd.planning_wizard.replay` (PWIZ-020 Replay planning flow) and
  `cmd.plan_compile.replay` (OP-032 Plan Compile replay). Both are view-local shell_view commands: wizard replay
  rewinds the wizard presentation to intake over already-recorded planning state and leaves the live PlanningRun,
  ledger records, approvals, and any PlanCompileRun unchanged; compile replay steps or plays recorded compile waves
  read-only, never re-executes compilation, never creates or rebinds a PlanCompileRun, and labels frames as
  historical replay.
gui_related: true
gui_classification_reason: Registers user-visible wizard and compile replay controls as stable commands.
depends_on: [PWIZ-020, OP-032, UCC-097]
unblocks: []
acceptance_criteria:
  - Wizard replay performs no ledger mutations, requires no re-approval, and creates no new compile.
  - Compile replay mutates no compile records and presents frames labeled as historical replay.
  - Replay position and playback state are view-local and discarded with the view.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
risk_class: replay_command_catalog_gap
reasoning_tier: standard
context_scope: replay_projection_commands
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - Plans/Planning_Wizard.md
  - Plans/Orchestrator_Page.md
node_compile_hint:
  mode: replay_projection_command_catalog
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Planning_Wizard.md:1615-1670"
  - "Plans/Orchestrator_Page.md:2504-2556"
  - "Concepts/pm6-build (PMConcept6 demo; source-lineage-only per Plans/usage-feature.md)"
preserved_exact_tokens:
  - "cmd.planning_wizard.replay"
  - "cmd.plan_compile.replay"
  - "Replay planning flow"
  - "historical replay"
negative_constraints:
  - Do not re-execute compilation, create, rebind, or duplicate PlanCompileRuns from replay controls.
  - Do not mutate ledger state, approvals, or PlanningRun currentness from wizard replay.
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/Planning_Wizard.md
  - Plans/Orchestrator_Page.md
```

### UCC-113 - Permissions Settings Command Family

```yaml
plan_unit_id: UCC-113
unit_type: command_contract
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  The Permissions settings command family adopts the ten ids named in Permissions_System.md verbatim:
  `cmd.permissions.open`, `cmd.permissions.create_project_rule`, `cmd.permissions.create_global_rule`,
  `cmd.permissions.update_rule`, `cmd.permissions.reorder_rule`, `cmd.permissions.delete_rule`,
  `cmd.permissions.revoke`, `cmd.permissions.pick_external_directory`, `cmd.permissions.validate_rule`, and
  `cmd.permissions.review_request`. Settings route is settings.permissions. Durable rule creation persists
  approval records that survive restart and remain revocable. The directory picker dispatch name is
  permissions.external_directory.pick with error codes external_directory_duplicate_path and
  external_directory_invalid_glob; reorder validation errors are rule_not_found, target_index_out_of_range, and
  scope_mismatch; save dirty state values are clean, dirty, saving, saved, save_failed, and
  conflict_refresh_required. review_request opens the canonical approval path with approval_scope_key and
  requesting_context; approve/decline decisions stay on the runtime HITL commands and are not permissions-family
  commands.
gui_related: true
gui_classification_reason: Registers user-visible permissions settings, rule CRUD, picker, review, and revocation commands.
depends_on: [UCC-010, UCC-023]
unblocks: []
acceptance_criteria:
  - Every Permissions settings GUI control routes through one of the ten stable command IDs.
  - Rule mutations persist through the atomic TOML write contract with loaded_config_hash conflict detection.
  - review_request opens the approval path without deciding it; approval decisions remain runtime HITL commands.
  - pick_external_directory surfaces duplicate-path and invalid-glob errors by their canonical codes.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
risk_class: permissions_command_catalog_gap
reasoning_tier: high
context_scope: permissions_settings_commands
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - Plans/Permissions_System.md
  - Plans/Wiring_Matrix.md
node_compile_hint:
  mode: permissions_settings_command_catalog
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Permissions_System.md:8977-8990"
  - "Plans/Permissions_System.md:8723-8724"
  - "Plans/Permissions_System.md:1032"
preserved_exact_tokens:
  - "cmd.permissions.open"
  - "cmd.permissions.create_project_rule"
  - "cmd.permissions.create_global_rule"
  - "cmd.permissions.update_rule"
  - "cmd.permissions.reorder_rule"
  - "cmd.permissions.delete_rule"
  - "cmd.permissions.revoke"
  - "cmd.permissions.pick_external_directory"
  - "cmd.permissions.validate_rule"
  - "cmd.permissions.review_request"
  - "settings.permissions"
  - "permissions.external_directory.pick"
negative_constraints:
  - Do not mint permissions-family approve/decline commands; HITL decisions stay on cmd.runtime.approve and cmd.runtime.decline.
  - Do not bypass the atomic TOML persistence and conflict-detection rules from rule mutation commands.
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/Permissions_System.md
  - Plans/Wiring_Matrix.md
```

### UCC-114 - Testing Panel Command Rows

```yaml
plan_unit_id: UCC-114
unit_type: command_contract
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  Testing panel commands adopt the six ids named in Automated_Testing_System.md verbatim -
  `cmd.testing.open_panel`, `cmd.testing.watch_run`, `cmd.testing.cancel_run`, `cmd.testing.open_receipt`,
  `cmd.testing.open_failure`, and `cmd.testing.export_bundle` - and add `cmd.testing.run` for the Testing side
  panel run entry point (F3-451). Button states derive from TestRunReceipt.status: watch and cancel enable for
  queued or running, open receipt enables for any terminal state, and export bundle enables when
  log_artifact_refs[] or visual_artifact_refs[] is non-empty. cmd.testing.run dispatches through the canonical
  adapter execution path producing a TestAdapterInvocation and TestRunReceipt and stays unavailable until an
  adapter is configured, the capability probe returns available, the permission snapshot is current, and required
  fixtures exist. cmd.testing.open_panel is a navigation_wrapper normalizing to the side-panel switch route with
  panel_id testing.
gui_related: true
gui_classification_reason: Registers user-visible testing panel open, run, watch, cancel, receipt, failure, and export commands.
depends_on: [F3-451, UCC-014]
unblocks: []
acceptance_criteria:
  - Every Testing panel control routes through one of the seven stable command IDs.
  - Watch/cancel/open-receipt/export enablement derives from TestRunReceipt.status and artifact refs as specified.
  - cmd.testing.run produces TestAdapterInvocation and TestRunReceipt evidence and never claims PNC-019 lifecycle certification.
  - cmd.testing.open_panel normalizes to the panel-switch route instead of carrying panel state.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
risk_class: testing_command_catalog_gap
reasoning_tier: high
context_scope: testing_panel_commands
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - Plans/Automated_Testing_System.md
  - Plans/Wiring_Matrix.md
node_compile_hint:
  mode: testing_panel_command_catalog
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Automated_Testing_System.md:1871-1875"
  - "Plans/Automated_Testing_System.md:1877-1881"
  - "Concepts/pm6-build (PMConcept6 demo; source-lineage-only per Plans/usage-feature.md)"
preserved_exact_tokens:
  - "cmd.testing.open_panel"
  - "cmd.testing.run"
  - "cmd.testing.watch_run"
  - "cmd.testing.cancel_run"
  - "cmd.testing.open_receipt"
  - "cmd.testing.open_failure"
  - "cmd.testing.export_bundle"
  - "TestRunReceipt"
negative_constraints:
  - Do not enable run/watch/cancel/export outside their TestRunReceipt.status and artifact-ref conditions.
  - Do not treat cmd.testing.run receipts as PNC-019 lifecycle certification evidence.
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/Automated_Testing_System.md
  - Plans/Wiring_Matrix.md
```

### UCC-115 - Terminal Rule Coverage Completion Rows

```yaml
plan_unit_id: UCC-115
unit_type: command_contract
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  Terminal coverage completion registers `cmd.terminal.reveal`, `cmd.terminal.terminate_session`,
  `cmd.terminal.kill_session`, and `cmd.terminal.reattach_section`, closing the Wiring_Matrix.md section 4.2
  reveal/terminate/kill/reattach coverage hole. terminate_session requests graceful shutdown, kill_session forces
  termination, and reattach_section returns a detached section to docked layout with preserved tab, pane, and
  session identity - all three adopted verbatim from the Wiring_Matrix.md terminal command table and WM-021.
  cmd.terminal.reveal reveals the bottom panel and terminal tab and scrolls the target session into view without
  spawning a duplicate shell. cmd.terminal.restart_replace remains the canonical restart row; the WM-021 token
  cmd.terminal.restart_session is owner-doc lineage for the same replace-with-new-runtime action and is not a
  second command.
gui_related: true
gui_classification_reason: Registers user-visible terminal reveal, terminate, kill, and reattach commands.
depends_on: [UCC-067, UCC-068]
unblocks: []
acceptance_criteria:
  - Rule 4.2 terminal coverage (reveal, show, rerun, split, close, clear, restart, terminate, kill, detach, reattach, focus-session) resolves to cataloged commands with production wiring rows.
  - terminate and kill remain distinct commands with distinct escalation semantics.
  - reattach_section preserves tab, pane, and session identity across the layout change.
  - reveal focuses the existing bound session and never spawns a duplicate shell.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
risk_class: terminal_command_catalog_gap
reasoning_tier: high
context_scope: terminal_coverage_commands
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - Plans/Wiring_Matrix.md
  - Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: terminal_coverage_command_catalog
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Wiring_Matrix.md:216"
  - "Plans/Wiring_Matrix.md:433-436"
  - "Plans/Wiring_Matrix.md:1889-1943"
preserved_exact_tokens:
  - "cmd.terminal.reveal"
  - "cmd.terminal.terminate_session"
  - "cmd.terminal.kill_session"
  - "cmd.terminal.reattach_section"
negative_constraints:
  - Do not mint cmd.terminal.reattach or other differently spelled duplicates of the WM-021 ids.
  - Do not collapse terminate and kill into one command or imply a killed session remains live.
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/Wiring_Matrix.md
  - Plans/Section15_MVP_Promoted_Features_Spec.md
```

### UCC-116 - Account Provider Route And Usage Projection Commands

```yaml
plan_unit_id: UCC-116
unit_type: command_contract
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  Account, provider-route, and usage commands are `cmd.account.select_profile` (adopted verbatim from
  Multi-Account.md; disabled reasons auth_missing, auth_expired, profile_locked, provider_unavailable, and
  policy_denied; empty state copy id accounts.empty.no_profiles; switches land in append-only account_switch_event
  history), `cmd.provider.switch_route` (adopted verbatim from the FinalGUISpec.md CTA rate_limit row with
  provider_id and retry_after_ms), `cmd.usage.export` (scope snapshot or ledger; ledger rows preserve
  usage_event_refs; view export output never becomes canonical record truth), and `cmd.usage.refresh` (on-demand
  provider-route projection re-read; background refresh continues independently).
gui_related: true
gui_classification_reason: Registers user-visible account switching, provider re-route, and usage export/refresh commands.
depends_on: [MA-069, UCC-109]
unblocks: []
acceptance_criteria:
  - Account/profile rows activate cmd.account.select_profile by click and keyboard and surface the five per-action disabled reasons.
  - Provider re-route acceptance carries provider_id and retry_after_ms and changes no account auth silently.
  - Usage export output follows the record/bundle/view taxonomy and preserves usage_event_refs in ledger scope.
  - Usage refresh never blocks the UI and does not replace background refresh.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
risk_class: usage_account_command_catalog_gap
reasoning_tier: high
context_scope: account_provider_usage_commands
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - Plans/Multi-Account.md
  - Plans/usage-feature.md
  - Plans/Wiring_Matrix.md
node_compile_hint:
  mode: account_provider_usage_command_catalog
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Multi-Account.md:5088"
  - "Plans/FinalGUISpec.md:27233"
  - "Plans/usage-feature.md:69-70"
  - "Plans/usage-feature.md:137"
  - "Concepts/pm6-build (PMConcept6 demo; source-lineage-only per Plans/usage-feature.md)"
preserved_exact_tokens:
  - "cmd.account.select_profile"
  - "cmd.provider.switch_route"
  - "cmd.usage.export"
  - "cmd.usage.refresh"
  - "account_switch_event"
  - "accounts.empty.no_profiles"
negative_constraints:
  - Do not treat usage exports as canonical record truth or include unauthorized provider/account details.
  - Do not switch accounts or routes without recording the append-only switch history.
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/Multi-Account.md
  - Plans/usage-feature.md
  - Plans/FinalGUISpec.md
```

### UCC-117 - Browser Pane Navigation Commands

```yaml
plan_unit_id: UCC-117
unit_type: command_contract
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  Browser pane navigation commands are `cmd.browser.navigate` and `cmd.browser.reload`. Both operate on the
  embedded browser pane within the session-class policy from the Wiring_Matrix.md browser invariants
  (workspace_preview, detached_preview, automation_session), require `session_security_class=ordinary`, preserve
  session class and recovery identity (URL, tabs, originating session), and never reclassify a session. Protected
  AuthBrowserSession is not a generic navigation subject. `cmd.gui_dev_preview.reload` remains
  dev/test-build only and is not reused for production reload.
gui_related: true
gui_classification_reason: Registers user-visible browser pane URL navigation and reload commands.
depends_on: [UCC-061, UCC-063]
unblocks: []
acceptance_criteria:
  - Navigate and reload preserve ordinary session class and recovery identity and never auto-resume automation work.
  - Protected AuthBrowserSession returns `protected_session_forbidden` before handler dispatch and exposes no URL or content.
  - Navigation outside the session policy is unavailable with a projected disabled reason.
  - Production reload does not dispatch cmd.gui_dev_preview.reload.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
risk_class: browser_command_catalog_gap
reasoning_tier: standard
context_scope: browser_pane_navigation_commands
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - Plans/Wiring_Matrix.md
node_compile_hint:
  mode: browser_pane_navigation_command_catalog
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Wiring_Matrix.md (Browser session, capture, and recovery wiring invariants)"
  - "Concepts/pm6-build (PMConcept6 demo; source-lineage-only per Plans/usage-feature.md)"
preserved_exact_tokens:
  - "cmd.browser.navigate"
  - "cmd.browser.reload"
negative_constraints:
  - Do not reuse cmd.gui_dev_preview.reload as the production browser reload.
  - Do not reclassify or auto-resume automation sessions from navigation commands.
  - Do not route protected AuthBrowserSession through generic navigate or reload commands.
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/Wiring_Matrix.md
  - Plans/FinalGUISpec.md
```

### UCC-118 - Projects List Lifecycle Commands

```yaml
plan_unit_id: UCC-118
unit_type: command_contract
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  Projects list lifecycle commands are `cmd.project.archive` (reversible, never a disk delete),
  `cmd.project.remove` (removes the list entry without touching the working tree), `cmd.project.refresh`
  (rescans the projects list projection), and `cmd.project.open_settings` (opens the F3-442 Project Settings
  Modal through the route/open contract). Archive and remove carry confirmation_strength in their command
  contracts; their confirmation surfaces remain view state.
gui_related: true
gui_classification_reason: Registers user-visible projects list archive, remove, refresh, and settings commands.
depends_on: [F3-442, UCC-032]
unblocks: []
acceptance_criteria:
  - Archive is reversible and performs no disk deletion; remove never touches the working tree.
  - Refresh re-reads the list projection without mutating project records.
  - open_settings routes through route/open identity to the Project Settings Modal.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
risk_class: project_command_catalog_gap
reasoning_tier: standard
context_scope: projects_list_commands
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - Plans/FinalGUISpec.md
  - Plans/Wiring_Matrix.md
node_compile_hint:
  mode: projects_list_command_catalog
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/FinalGUISpec.md (F3-442)"
  - "Concepts/pm6-build (PMConcept6 demo; source-lineage-only per Plans/usage-feature.md)"
preserved_exact_tokens:
  - "cmd.project.archive"
  - "cmd.project.remove"
  - "cmd.project.refresh"
  - "cmd.project.open_settings"
negative_constraints:
  - Do not delete project data from archive or remove; both are list-scope operations.
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/FinalGUISpec.md
```

### UCC-119 - Chat Composer Selector Queue And Web Operation Commands

```yaml
plan_unit_id: UCC-119
unit_type: command_contract
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  Chat additions are `cmd.chat.web.cancel` and `cmd.chat.web.request_again` (web-operation card lifecycle in the
  cmd.chat.web family; approval decisions stay on cmd.runtime.approve and cmd.runtime.decline),
  `cmd.chat.switch_thread` (thread-list focus by thread_id completing the UCC-056 thread lifecycle family),
  `cmd.chat.queue.remove` (removes a queued, not-yet-dispatched composer message), `cmd.chat.platform` (requested
  platform owned by the assistant chat surface, no status-bar chip; applies next turn over the account-bound
  Provider -> models registry per ACD-437), and
  `cmd.chat.plan_thoroughness` (Light, Balanced, Comprehensive; default Balanced; distinct from effort High,
  Medium, Low per ACD-438; recorded as requested_plan_thoroughness and effective_plan_thoroughness).
gui_related: true
gui_classification_reason: Registers user-visible chat web-op, thread switch, queue, platform, and thoroughness commands.
depends_on: [ACD-035, ACD-437, ACD-438, UCC-056, UCC-082]
unblocks: []
acceptance_criteria:
  - Web-op cancel and request-again preserve web_operation_id provenance and never bypass the approval gate.
  - switch_thread focuses an existing thread without mutating it.
  - queue.remove affects only queued, not-yet-dispatched messages.
  - Platform and Plan Thoroughness selections apply next turn and stay distinct controls with distinct labels.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
risk_class: chat_command_catalog_gap
reasoning_tier: high
context_scope: chat_composer_commands
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - Plans/assistant-chat-design.md
  - Plans/Wiring_Matrix.md
node_compile_hint:
  mode: chat_composer_command_catalog
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/assistant-chat-design.md:23758-23870"
  - "Plans/assistant-chat-design.md:2604-2605"
  - "Plans/assistant-chat-design.md:5108-5147"
  - "Concepts/pm6-build (PMConcept6 demo; source-lineage-only per Plans/usage-feature.md)"
preserved_exact_tokens:
  - "cmd.chat.web.cancel"
  - "cmd.chat.web.request_again"
  - "cmd.chat.switch_thread"
  - "cmd.chat.queue.remove"
  - "cmd.chat.platform"
  - "cmd.chat.plan_thoroughness"
  - "requested_plan_thoroughness"
  - "effective_plan_thoroughness"
negative_constraints:
  - Do not mint web-specific approve/decline commands; decisions stay on cmd.runtime.approve and cmd.runtime.decline.
  - Do not merge Plan Thoroughness with effort or re-introduce a chat-header platform dropdown.
stale_retired_dispositions:
  - "Status-bar platform chip anchoring for cmd.chat.platform retired per PMConcept7 status-bar trim; the assistant chat surface owns requested-platform selection with applies-next-turn semantics (command ID, payload, and events unchanged)."
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/assistant-chat-design.md
  - Plans/Wiring_Matrix.md
```

### UCC-120 - Settings Route And Transaction Composition

```yaml
plan_unit_id: UCC-120
unit_type: command_contract
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  Settings navigation uses cmd.settings.open with the typed pm.settings_route_request.v1 target and
  exact-return contract owned by SSYS-018; the K3 Settings host chooses the current presentation and the
  command encodes no bloom-specific geometry. The historical cmd.settings.open_notifications,
  cmd.settings.category.reset, and cmd.settings.suggestion.dismiss spellings are retained only as retired,
  non-alias local-affordance lineage. Notifications navigation emits cmd.settings.open. Category reset and
  suggestion dismissal each compose cmd.settings.transaction.preview followed by cmd.settings.transaction.apply.
  The historical spellings receive no primary handler, production-wiring row, or alias. SSYS-023's hash-bound
  80-token disposition registry is transitive catalog input: its canonical targets retain their existing rows, its
  seven typed local actions receive no command rows, and retired or rejected packet spellings remain non-actionable.
gui_related: true
gui_classification_reason: Registers user-visible typed Settings routing and the transaction composition used by reset and dismissal affordances.
depends_on: [SSYS-018, SSYS-023, F3-436, F3-437, F3-441]
unblocks: []
acceptance_criteria:
  - cmd.settings.open accepts only the Settings-owned typed setting or manager/detail target and preserves its exact-return contract; presentation and motion remain Final GUI concerns.
  - The local Notifications affordance emits cmd.settings.open with the typed Settings target; cmd.settings.open_notifications is neither registered nor aliased.
  - Category reset never applies without a current preview, the required confirmation, and exact owner readback.
  - Suggestion dismissal previews and then applies a typed Settings transaction with the F3-437 scoping and expiry and makes no network calls.
  - All three retired local-affordance spellings receive no primary handler, wiring row, or alias.
  - "The exact 41 canonical reuses, seven typed local actions, one retired bakeoff token, and 31 rejected tokens remain the complete Settings packet partition."
  - "Every canonical replacement target has one existing catalog identity or remains explicitly blocked; none of the 72 replaced, superseded, retired, or rejected source spellings becomes a command or alias."
  - "`cmd.artifacts.open_panel` remains command_not_registered until Runtime Artifacts and Commands admit an exact typed route, sole handler, and production-intent row."
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
risk_class: settings_command_catalog_gap
reasoning_tier: standard
context_scope: settings_route_and_home_commands
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - Plans/FinalGUISpec.md
  - Plans/Wiring_Matrix.md
node_compile_hint:
  mode: settings_home_command_catalog
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/FinalGUISpec.md:28854-28900 (F3-434)"
  - "Plans/Settings_System.md#SSYS-018 (current typed route owner; supersedes bloom-specific routing)"
  - "Plans/Settings_System.md#SSYS-023 (exact 80-token transitive disposition registry)"
  - "Plans/settings_system_contract_fixtures.json#/packet_command_dispositions"
  - "Plans/FinalGUISpec.md:29031-29080 (F3-437)"
  - "Concepts/pm6-build (PMConcept6 demo; source-lineage-only per Plans/usage-feature.md)"
preserved_exact_tokens:
  - "cmd.settings.open"
  - "cmd.settings.transaction.preview"
  - "cmd.settings.transaction.apply"
  - "cmd.settings.open_notifications"
  - "cmd.settings.category.reset"
  - "cmd.settings.suggestion.dismiss"
  - "settings_suggestions_dismissed:v1"
  - "settings.search.focus"
  - "settings.search.result.activate"
  - "settings.category.select"
  - "settings.subcategory.select"
  - "settings.setting.focus"
  - "settings.scope.details.open"
  - "settings.provider.installation.select"
negative_constraints:
  - Do not mint a second Settings mutation command for reset, dismissal, or presentation behavior.
  - Do not perform a category reset without the completed two-step confirmation.
  - Do not encode a bloom, breadcrumb, Back control, or other presentation geometry into cmd.settings.open.
  - Do not register or alias any of the three retired local-affordance spellings.
  - Do not copy packet replacement spellings into the catalog or promote typed local actions into domain commands.
  - Do not treat a prose mention of cmd.artifacts.open_panel as catalog admission or handler evidence.
compatibility_only_notes:
  - The retired open-notifications, category-reset, and suggestion-dismiss spellings are searchable local-affordance lineage only and never normalize to current commands.
stale_retired_dispositions:
  - "cmd.settings.open_notifications: local affordance emits cmd.settings.open with a typed target; no alias or handler."
  - "cmd.settings.category.reset: local affordance composes transaction preview then apply; no alias or handler."
  - "cmd.settings.suggestion.dismiss: local affordance composes transaction preview then apply; no alias or handler."
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/FinalGUISpec.md
```

### UCC-121 - Docker Container Start And Unraid Template Commands

```yaml
plan_unit_id: UCC-121
unit_type: command_contract
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  Docker Manager additions are `cmd.docker.container.start` (starts a stopped container by container_ref,
  completing the reserved cmd.docker.container lifecycle subfamily beside stop and restart; distinct from
  cmd.docker.run which creates a container from an image), `cmd.docker.template.commit`, and
  `cmd.docker.template.push` (Unraid template commit and publish flows named by the operational coverage text).
  Template publish requires the domain.image_publish permission class, which is never implied by local build
  approval; mutating rows carry capability_snapshot_ref per the UCC-049 row identity.
gui_related: true
gui_classification_reason: Registers user-visible container start and Unraid template commit/push commands.
depends_on: [UCC-040, UCC-049, UCC-051]
unblocks: []
acceptance_criteria:
  - container.start targets container_ref identity and is unavailable for running containers.
  - Template commit and push are separate commands with separate receipts.
  - Template push is blocked without a domain.image_publish approval.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
risk_class: docker_command_catalog_gap
reasoning_tier: standard
context_scope: docker_template_commands
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Wiring_Matrix.md
node_compile_hint:
  mode: docker_template_command_catalog
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/UI_Command_Catalog.md (2.5A operational coverage: /auth/template, /publish/template)"
  - "Plans/Permissions_System.md (Domain-Sensitive Permission Classes)"
  - "Concepts/pm6-build (PMConcept6 demo; source-lineage-only per Plans/usage-feature.md)"
preserved_exact_tokens:
  - "cmd.docker.container.start"
  - "cmd.docker.template.commit"
  - "cmd.docker.template.push"
  - "domain.image_publish"
negative_constraints:
  - Do not reuse cmd.docker.run for starting stopped containers.
  - Do not imply template publish permission from local build approval.
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Permissions_System.md
```

### UCC-122 - Forge Review Commands And Source Control Compatibility

```yaml
plan_unit_id: UCC-122
unit_type: command_contract
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  Panel review actions use the canonical Forge-owned cmd.forge.review.create and cmd.forge.review.merge
  commands with a typed provider discriminator and exact SCM/forge context. The historical
  cmd.source_control.pr.create and cmd.source_control.pr.merge spellings are compatibility inputs that
  normalize to the Forge commands with provider github before availability, permission, telemetry, receipt,
  and dispatch; they receive no primary catalog or production-wiring rows. Thread-bound
  cmd.chat.worktree.pr and cmd.chat.worktree.merge remain assistant-thread wrappers. Protected-branch merge
  retains the applicable destructive-remote permission class.
gui_related: true
gui_classification_reason: Registers user-visible Forge review create/merge commands and the Source Control compatibility normalization.
depends_on: [UCC-044, UCC-058, FGI-004, SCS-004]
unblocks: []
acceptance_criteria:
  - Forge review create and merge carry the exact provider, repository, revision, SCM context, permission, and disabled-state contract.
  - Source Control PR compatibility inputs normalize before dispatch and never receive a second handler or primary wiring row.
  - Panel review commands never impersonate or replace the thread-bound worktree PR commands.
  - Protected-branch merges are blocked without a domain.git_destructive_remote approval.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
risk_class: forge_source_control_command_owner_drift
reasoning_tier: high
context_scope: forge_review_source_control_compatibility
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - Plans/Forge_Integrations.md
  - Plans/Source_Control_System.md
  - Plans/Wiring_Matrix.md
node_compile_hint:
  mode: source_control_pr_command_catalog
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/UI_Command_Catalog.md (2.5A operational wiring requirements)"
  - "Plans/Permissions_System.md (Domain-Sensitive Permission Classes)"
  - "Concepts/pm6-build (PMConcept6 demo; source-lineage-only per Plans/usage-feature.md)"
preserved_exact_tokens:
  - "cmd.source_control.pr.create"
  - "cmd.source_control.pr.merge"
  - "cmd.forge.review.create"
  - "cmd.forge.review.merge"
  - "domain.git_destructive_remote"
negative_constraints:
  - Do not reuse thread-bound cmd.chat.worktree.pr or cmd.chat.worktree.merge for panel-scoped PR actions.
  - Do not register Source Control compatibility inputs as primary commands or route them to Source Control-owned review handlers.
  - Do not merge protected branches without the domain-sensitive approval.
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/Forge_Integrations.md
  - Plans/Source_Control_System.md
  - Plans/Permissions_System.md
```

### UCC-123 - Case L Storage Access Root And Navigation Commands

```yaml
plan_unit_id: UCC-123
unit_type: command_contract
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  Case L registers the storage controls cmd.storage.viewer.refresh, cmd.storage.try_write_mode,
  cmd.storage.retry, cmd.storage.root.use_previous, cmd.storage.root.choose,
  cmd.storage.root.copy_and_switch, cmd.storage.root.start_new_instance,
  cmd.storage.fallback.return_fast_forward, cmd.storage.fallback.keep_logical_root,
  cmd.storage.fallback.fork_new_instance, cmd.storage.fallback.export_both,
  cmd.storage.open_value, and cmd.storage.open_root.
  Every direct handler consumes the owner writer/viewer/blocked gate; recovery controls rerun the
  exact owner preflight without automatic blocked-command replay; navigation carries stable
  storage/root/value refs plus route_target/OpenSubject and never selects authority; and fallback
  return is available only when the logical root still equals the immutable fallback base.
gui_related: true
gui_classification_reason: Registers visible viewer, recovery, root continuity, fallback, and storage navigation controls.
depends_on: [UIW-002, UIW-003, SP-238, SP-239, SP-240]
unblocks: []
acceptance_criteria:
  - Every durable, runtime, or external mutation path, including direct handlers, fails with storage_read_only outside writer mode unless it is the exact owner-admitted recovery control.
  - Viewer refresh changes only the frozen captured read snapshot; Try write mode and Retry storage rerun every owner gate and never replay blocked work.
  - Root mismatch exposes only use-previous, choose, copy-and-switch, and strongly confirmed new-instance actions; no empty-root initialization or prior-root overwrite occurs.
  - Fallback return is fast-forward-only with exact base equality; divergence cannot merge, overwrite, or continue writing.
  - Divergence exposes exactly keep_logical_root, fork_new_instance, and export_both with full component CAS revalidation, lowercase 64-hex hashes, distinct permission/confirmation, typed results, owner receipts, and both roots retained.
  - Fork returns only a candidate binding and never changes active bootstrap selection; export is encrypted exact-byte custody bound to explicit destination, non-secret manifest, and key refs.
  - open_value and open_root use stable identity and route/open contracts and cannot establish writer authority.
validation_surfaces:
  - future Case L viewer and direct-handler inventory
  - future root mismatch, relocation crash-cut, and fallback divergence fixtures
  - python3 scripts/pm-plan-index.py validate
risk_class: case_l_storage_command_gate_or_root_recovery_drift
reasoning_tier: high
context_scope: case_l_storage_access_root_navigation_commands
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - Plans/Commands_System.md
  - Plans/storage-plan.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: case_l_storage_access_root_command_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Case-L:L-011
  - Case-L:L-012
  - Case-L:L-014
  - Case-L:L-018
  - Case-L:L012-C1..L012-C4
  - Case-L:L014-C1..L014-C4
  - Case-L:L018-C1..L018-C3
  - Case-L:L011-C1..L011-C3
  - Plans/UI_Wiring_Rules.md:UIW-002..UIW-003
preserved_exact_tokens:
  - storage_read_only
  - Retry storage
  - Try write mode
  - fallback_diverged
  - storage_access_mode
  - cmd.storage.viewer.refresh
  - cmd.storage.try_write_mode
  - cmd.storage.retry
  - cmd.storage.root.use_previous
  - cmd.storage.root.choose
  - cmd.storage.root.copy_and_switch
  - cmd.storage.root.start_new_instance
  - cmd.storage.fallback.return_fast_forward
  - cmd.storage.fallback.keep_logical_root
  - cmd.storage.fallback.fork_new_instance
  - cmd.storage.fallback.export_both
  - cmd.storage.open_value
  - cmd.storage.open_root
negative_constraints:
  - Do not add generic verify, repair, salvage, force-open, try_anyway, force-cancel, automatic merge, or automatic overwrite commands.
  - Do not infer root, lock, or value authority from a raw path, UI focus, stale projection, or visible enabled control.
  - Do not emit a new EventRecord family for a fallback-divergence disposition; audit is the storage-owner receipt only.
owner_hints:
  - Plans/UI_Command_Catalog.md
```

### UCC-124 - Case L Retention Hold Compaction And Deletion Commands

```yaml
plan_unit_id: UCC-124
unit_type: command_contract
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  Case L registers cmd.storage.legal_hold.manage with the distinct protected authorization
  token storage.legal_hold.manage, cmd.storage.compaction.request as an owner-admitted request,
  cmd.settings.open_storage_retention as navigation, and cmd.project.delete_data as the strongly
  confirmed project-content purge intent distinct from cmd.project.remove. Existing cmd.chat.delete
  immediately performs logical deletion and requests physical content purge within 24 hours unless
  held while preserving a content-free tombstone and owner-governed receipts.
gui_related: true
gui_classification_reason: Registers visible retention, legal-hold, compaction-request, settings, and destructive deletion controls and confirmations.
depends_on: [UIW-002, UIW-003, SP-237, CV-319, UCC-056, UCC-118]
unblocks: []
acceptance_criteria:
  - Hold set and clear require storage.legal_hold.manage, actor identity, reason, expected state when supplied, and a durable retention_hold_record plus EventRecord v2 receipt.
  - Compaction request never directly compacts or bypasses holds, recovery/recent-run/live/backup/rollback/maintenance refs, registry policy, or the maintenance lease.
  - Storage and Retention settings navigation creates no peer setting command; registry-owned values enforce owner minima.
  - cmd.chat.delete discloses immediate logical removal, the 24-hour purge target, legal-hold delay, and content-free tombstone retention.
  - cmd.project.remove remains list-only and cmd.project.delete_data remains a separate strongly confirmed, project-scoped data-purge intent.
validation_surfaces:
  - future RET, CMP, DEL, and legal-hold command fixtures
  - future thread/project deletion confirmation and hold-blocked snapshots
  - python3 scripts/pm-plan-index.py validate
risk_class: case_l_retention_or_deletion_command_bypass
reasoning_tier: high
context_scope: case_l_retention_hold_compaction_deletion_commands
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - Plans/storage-plan.md
  - Plans/Contracts_V0.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: case_l_retention_deletion_command_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Case-L:L-005
  - Case-L:L-010
  - Case-L:L-015
  - Case-L:PD-L005-01..PD-L005-07
  - Case-L:PD-L015-01..PD-L015-05
preserved_exact_tokens:
  - storage.legal_hold.manage
  - cmd.storage.legal_hold.manage
  - cmd.storage.compaction.request
  - cmd.settings.open_storage_retention
  - cmd.chat.delete
  - cmd.project.remove
  - cmd.project.delete_data
  - storage.retention_hold_changed
  - storage.compaction_lifecycle_changed
  - storage.deletion_lifecycle_changed
negative_constraints:
  - Do not make legal hold an ordinary setting toggle or clear it automatically.
  - Do not make request mean direct compaction or infer destructive eligibility from names, paths, times, ordering, or focus.
  - Do not collapse Remove project from list into Delete Puppet Master project data or add message-level delete.
owner_hints:
  - Plans/UI_Command_Catalog.md
```

### UCC-125 - Case L Exact Baseline And Restore Command Contract

```yaml
plan_unit_id: UCC-125
unit_type: command_contract
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  Runtime retry commands use the closed baseline_target values safe_point, historical_commit,
  and worktree_head with conditionally exact immutable inputs and owner effects. Safe-point restore
  exact-replaces the named worktree through FileSafe; historical commit preserves the source and
  creates a clean isolated worktree at the full commit OID; worktree head binds without mutation to
  the exact OID and state digest. cmd.orchestrator.safe_point_retry and its compatibility alias both
  normalize to cmd.runtime.restore_safe_point_then_retry with baseline_target safe_point and no
  independent handler, result, event, or idempotency authority.
gui_related: true
gui_classification_reason: Defines user-dispatched recovery payloads, confirmation, disabled states, and truthful outcomes.
depends_on: [UCC-089, UCC-090, UCC-095, UCC-111, F2-200, F2-201, F2-202, F2-203, CV-320]
unblocks: []
acceptance_criteria:
  - Every baseline value requires exactly its owner-defined immutable fields and rejects unknown/missing/stale/moving identities without substitution.
  - restore_safe_point_then_retry accepts only safe_point and is the only rerun verb when requires_safe_point_restore is true.
  - A successor attempt is admitted only after target postcondition, owner equality where applicable, and durable baseline/restore receipt.
  - restore_refused, restore_failed, and restore_recovery_required mint no successor; restored_with_conflicts is invalid for exact safe-point or Chat-revert operations.
  - Orchestrator wrappers preserve OP-033 confirmation/availability semantics but cannot collapse later corruption, scope, concurrency, baseline, or recovery-required reasons.
  - Wrapper and compatibility alias inputs differ from canonical args only by optional permission_snapshot_id; admission validates and consumes it, and both transforms produce exact canonical args for the sole runtime handler.
  - Runtime, wrapper, and alias share one result, safe_point.restored producer, effect set, idempotency identity, and admission decision; no peer handler or no-event execution path exists.
validation_surfaces:
  - RSP-BASELINE-001
  - RSP-BASELINE-002
  - RSP-BASELINE-003
  - RSP-BASELINE-004
  - RSP-ATOMIC-001
  - RSP-ATOMIC-003
  - python3 scripts/pm-plan-index.py validate
risk_class: case_l_baseline_or_restore_command_drift
reasoning_tier: high
context_scope: case_l_baseline_restore_command_contract
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - Plans/Executor_Protocol.md
  - Plans/WorktreeGitImprovement.md
  - Plans/FileSafe.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: case_l_baseline_restore_command_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Case-L:L-006
  - Case-L:L-020
  - Case-L:L-021
  - Case-L:L-024
  - Case-L:PD-RSP-01..PD-RSP-07
preserved_exact_tokens:
  - safe_point
  - historical_commit
  - worktree_head
  - historical_commit_oid
  - expected_head_oid
  - expected_state_sha256
  - restored_clean
  - restore_skipped
  - restore_refused
  - restore_failed
  - restore_recovery_required
  - cmd.orchestrator.safe_point_retry
  - cmd.orchestrator.restore_safe_point_then_retry
  - cmd.runtime.restore_safe_point_then_retry
negative_constraints:
  - Do not accept current or restore_point as baseline_target values.
  - Do not resolve abbreviated, branch, tag, remote, reflog, symbolic, moving, focused, latest, or substitute refs.
  - Do not expose a worktree as runnable before the durable baseline receipt exists.
owner_hints:
  - Plans/UI_Command_Catalog.md
```

### UCC-126 - Case L Chat Revert And Conversation Restore Point Commands

```yaml
plan_unit_id: UCC-126
unit_type: command_contract
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  cmd.chat.revert resolves one immutable whole-turn mutation manifest and then uses FileSafe exact-
  replace, verified rollback, equality, restart, custody, and hold truth without transcript rewind or
  partial success. Conversation lifecycle separately registers cmd.chat.create_restore_point,
  cmd.chat.branch_from_restore, and cmd.chat.delete_restore_point against restore_point_record;
  branching creates new conversation thread/branch identity from one verified inclusive boundary,
  preserves source thread/branch/worktree/files/Git/index/queue/safe points, and treats optional
  safe_point_id as lineage only without file restore. Current policy is
  RP-RESTOREPOINT-90D-AFTER-RELEASE@1.0.0: expiry eligibility is inclusive at owner-proven
  reference_release + 7,776,000 seconds; the maximum is 2,048 restore points per project; count
  pressure deletes only the oldest eligible restore point; and descendant branch/application refs,
  preserve/legal holds, in-flight application, source-lineage, live, recovery, backup, rollback, and
  maintenance refs override age and count eligibility and block deletion until their owner-defined
  release evidence is durable.
gui_related: true
gui_classification_reason: Registers user-facing Chat revert and restore-point create, branch, and delete controls with disclosures and outcomes.
depends_on: [UCC-075, F2-200, F2-201, F2-202, F2-204, CV-320, SP-242]
unblocks: []
acceptance_criteria:
  - Chat revert restores the complete multi-file turn or proves rollback/recovery-required as one transaction; no eligible turn creates no transaction.
  - Restore-point create persists an immutable available record and project-scoped restore_point.created EventRecord 2.0 with stable idempotency.
  - Create freezes one inclusive message boundary; equal identity/content returns the original and conflicting content is refused without overwrite.
  - Branch consumes the expected record hash and discloses source boundary/state/new target; only branched creates identity and emits exactly one restore_point.applied, while replay returns the same recorded target without a duplicate event.
  - Refused and failed return no target IDs and no restore_point.applied event; first execution and replay preserve source thread/branch/worktree/files/Git/index/queue/safe points.
  - Delete transitions only unprotected exact-hash available state, follows every hold/ref, never clears a hold, and never deletes the source thread, worktree, safe point, or descendant branch.
  - Restore-point status remains available, expired, deleted, or corrupt; successful application does not consume it, and RP-RESTOREPOINT-90D-AFTER-RELEASE@1.0.0 expires only at the inclusive owner-proven release boundary or oldest-eligible count pressure after every overriding ref is released.
  - A deleted source remains hidden; missing retained boundary content returns source_deleted_content_unavailable without new identity or reconstruction.
validation_surfaces:
  - RSP-CHAT-001
  - RSP-RP-001
  - RSP-RP-002
  - RSP-RP-003
  - RSP-RP-004
  - RSP-CMD-001
  - python3 scripts/pm-plan-index.py validate
risk_class: case_l_chat_restore_identity_or_atomicity_drift
reasoning_tier: high
context_scope: case_l_chat_revert_restore_point_commands
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - Plans/assistant-chat-design.md
  - Plans/FileSafe.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: case_l_chat_restore_command_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Case-L:L-006
  - Case-L:L-022
  - Case-L:PD-RSP-08
  - Case-L:PD-RSP-09
preserved_exact_tokens:
  - cmd.chat.revert
  - cmd.chat.create_restore_point
  - cmd.chat.branch_from_restore
  - cmd.chat.delete_restore_point
  - restore_point.created
  - restore_point.applied
  - available
  - expired
  - deleted
  - corrupt
  - branched
  - refused
  - failed
  - no_eligible_mutating_turn
  - source_deleted_content_unavailable
  - RP-RESTOREPOINT-90D-AFTER-RELEASE@1.0.0
negative_constraints:
  - Do not combine conversation branch with FileSafe restore or treat a restore point as a baseline target.
  - Do not rewind transcript state, restore only part of a turn, consume a successful restore-point application, resurrect a deleted source, invent expiry, or mutate source conversation/worktree/file/SCM/queue/runtime-safe-point state.
owner_hints:
  - Plans/UI_Command_Catalog.md
```
