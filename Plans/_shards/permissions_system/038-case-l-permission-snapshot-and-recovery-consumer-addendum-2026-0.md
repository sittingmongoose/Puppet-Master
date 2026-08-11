# Shard 038: Case L Permission Snapshot And Recovery Consumer Addendum - 2026-07-17

Source: `Plans/Permissions_System.md`

Source lines: L9013-L9159

Source SHA256: `248ce6522a6c7ce3405184c54b408f4454330ab5c1c078e73e5e09b99320201e`

---

## Case L Permission Snapshot And Recovery Consumer Addendum - 2026-07-17

This addendum is the Permissions consumer propagation for approved Case L finding `L-021` and the permission boundaries exercised by `L-006`, `L-010`, `L-014`, `L-020`, `L-022`, and `L-024`. It follows the all-bundles approval in `PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/CASE_L_APPROVAL_2026-07-17.md`. Permissions remains the owner of permission-snapshot payload semantics and allow/ask/deny decisions. Storage owns materialized row registration, keys, retention, recovery disposition, and root/access mode; FileSafe owns exact-replace mechanics; Contracts owns EventRecord 2.0 and restore outcomes. This section creates no safe-point or restore-point lifecycle, storage algorithm, runtime implementation, WorkNode, NodeSeed, executable queue, generated governance artifact, build task, or completeness evidence.

### Split durable permission-snapshot family

The mixed compatibility inventory `permission_safe_point_restore_families` is not a build-authoritative key or payload owner. The approved split is:

- Permissions payload owner and storage-registry row: `permission_snapshot_record.v1:{project_id}:{snapshot_id}`;
- storage/FileSafe safe-point row: canonical `sp:{run_id}:{node_id}:{attempt_id}:{safe_point_id}`;
- Assistant Chat/storage restore-point row: canonical `rp:{project_id}:{restore_point_id}`.

Permissions MUST NOT write either legacy safe-point spelling, absorb safe-point/restore-point retention or application semantics, or reconstruct a permission snapshot from those records. Safe-point `permission_snapshot_id?` is an immutable reference to the permission evidence that governed the captured attempt; it is not authority to reuse that permission after policy, target, account, project, runtime identity, storage mode, or FileSafe state changes.

The Permissions-owned `pm.storage_value.permission_snapshot_record.v1` payload is closed and requires:

- `schema_id = pm.storage_value.permission_snapshot_record.v1`, `schema_version = 1.0.0`;
- non-empty `project_id`, `snapshot_id`, `attempt_id`, and `node_id`, plus optional `run_id` and `blocked_sequence`;
- `captured_at_utc`, `approval_scope_key?`, `approval_target_ref?`, requested/effective account bindings, and account-switch ref;
- the existing closed `permission_decision_context`, `actor_surface_context`, `runtime_identity_context`, and `resolved_permissions` objects from the canonical snapshot schema above;
- `source_event_ref`, `redaction_profile`, and immutable integrity hash/ref sufficient to prove the historical payload.

The storage registry must materialize this row separately and bind it to the structured owner schema before any mutation-capable dependency treats the family as build-authoritative. The permission snapshot is immutable attempt evidence; it is retained with attempt/receipt lineage and any stronger blocked, safe-point, preserved-run, audit, recovery, or legal hold. It is never reconstructed from current Settings, a safe point, a restore point, a UI projection, or a replay-only compatibility record. Missing/corrupt snapshot evidence cannot authorize retry or restore reuse: permission state becomes stale/unavailable for admission, a fresh snapshot is required, and any independent recovery anchor remains held.

### Application versus project identity and denial replay

All new permission audit and `tool.denied` writes use EventRecord `2.0.0`. A project-bound invocation uses `scope_kind = project` and its non-empty `project_id`. An application-level invocation before project selection uses `scope_kind = application` and `project_id = null`; it emits the denial/audit EventRecord without fabricating a project-scoped permission-snapshot row. If a mutation-capable attempt requires durable permission evidence, it must already be bound to one project and one materialized permission snapshot.

Permission audit inspection of an EventRecord `2.0.0` root requires a reader that validates `2.0.0`; an unsupported reader refuses the view with `unsupported_schema_version` instead of presenting partial permission history. Event routing consumes the storage-owned key `event_record_index.v2:{scope_partition}:{sequence_id_20}:{event_id}` with application `app` or the registered reversible project partition. Permissions does not derive a lookup key from current UI project/account state, omit `event_id`, or treat the index as permission authority.

Permission producers preserve app-root-global `event_id`, Contracts-owned lifetime idempotency within `(scope_partition, event_type, idempotency_key)`, and the selected replay policy. A stale/absent dedupe accelerator must catch up through the verified seglog tail or the denial/audit append returns `dedupe_unavailable`; the runtime remains fail-closed and MUST NOT execute merely because its audit append failed. A legacy denial normalized with `projector_replay_only` is historical projection input only and cannot block/unblock current work, grant approval, mutate a snapshot, execute a tool, or emit another denial.

### Restore, recovery-hold, storage-mode, and denial semantics

Permission and FileSafe/storage gates compose by intersection. Permission `allow` never overrides FileSafe refusal, `storage_access_mode = viewer | blocked`, `storage_read_only`, integrity/recovery block, unsupported newer store, root mismatch, or fallback divergence. Conversely, a storage writer posture does not bypass permission policy. Compatible viewer reads/exports still pass ordinary permission and FileSafe checks, but every durable/runtime/external mutation remains storage-disabled even after approval. Newer-store metadata diagnostics do not create a live permissioned viewer.

Permission surfaces do not convert storage diagnostics into generic verify, repair, salvage, force-open, or `try_anyway` authority. `Retry storage` only re-runs the storage-owned admission probe; approval cannot make it repair bytes or auto-resume the denied operation.

A permission denial before exact-replace mutation yields the Contracts/FileSafe no-mutation path: `restore_refused` with `conflict_reason_code = permission_denied`; it MUST NOT be reported as `restore_failed`, because rollback equality is irrelevant when no target path changed. If mutation already began under a valid prior snapshot, later permission drift cannot abandon or erase the FileSafe journal. Restart reconciliation remains fenced until FileSafe proves target equality, rollback equality, or `restore_recovery_required`; the prior snapshot remains historical evidence and any further recovery action receives a fresh permission decision/snapshot.

Permission deny, user rejection, headless ask-to-deny, and stale snapshot are blocked/non-executed outcomes, not generic execution failure. Their payload preserves `blocked_family`, `blocked_reason_code`, `approval_scope_key?`, `approval_target_ref?`, `permission_snapshot_id?`, ordered `allowed_action_ids[]`, revalidation state, and `executed: false`. Permission denial, snapshot refresh, process exit, goal/run completion, or viewer promotion never releases a storage/FileSafe `recovery_anchor_record`; only the owner terminal transitions `resolved`, `superseded_with_verified_successor`, or explicit `abandoned_by_user` may do so.

ContractRef: ContractName:Plans/Contracts_V0.md#EventRecord, ContractName:Plans/storage-plan.md#Case-L-durable-state-owner-canon, ContractName:Plans/FileSafe.md#Case-L-Exact-Restore-Repair-Addendum, ContractName:Plans/Executor_Protocol.md

### PS-132 - Case L Split Permission Snapshot Identity And Custody

```yaml
plan_unit_id: PS-132
unit_type: schema_contract
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: >-
  Permission snapshots use the separate project-scoped durable family
  permission_snapshot_record.v1:{project_id}:{snapshot_id}; Permissions owns its
  closed immutable payload, while storage owns row registration, retention, and
  recovery. Safe points use canonical sp: identity and restore points use rp:
  identity. Neither can reconstruct or authorize reuse of a permission snapshot,
  and missing or corrupt snapshot evidence requires fresh admission authority.
gui_related: false
gui_classification_reason: The unit defines backend permission evidence identity, schema ownership, retention linkage, and recovery admission.
depends_on: [PS-097, PS-098, SP-242]
unblocks: []
acceptance_criteria:
  - The permission snapshot payload carries schema, project/snapshot/attempt/node identity, immutable permission contexts, event ref, redaction, and integrity evidence.
  - Registry and cross-reference checks find one permission snapshot family distinct from safe-point and restore-point rows.
  - New safe-point writes use only the canonical sp key and may reference but never embed or reconstruct permission snapshot authority.
  - Missing or corrupt permission snapshot evidence cannot authorize restore/retry reuse and creates a fresh-snapshot admission requirement.
  - Blocked, recovery, preserved-run, audit, and legal holds outlive ordinary snapshot age or current Settings changes.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future RSP-REGISTRY-001 and permission-snapshot custody fixtures
risk_class: permission_snapshot_identity_recovery_drift
reasoning_tier: high
context_scope: case_l_permission_snapshot_custody
implementation_surfaces:
  - Plans/Permissions_System.md
  - Plans/storage_value_registry.json
node_compile_hint:
  mode: case_l_permission_snapshot_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Case-L:L-021
  - Case-L:PD-RSP-05
  - Case-L:PD-RSP-06
  - PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/planning/REGISTRY_PROPOSED_ROWS.json
  - PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/planning/RESTORE_SAFEPOINT_REPAIR_PLAN.md
negative_constraints:
  - Do not make Permissions the safe-point or restore-point lifecycle owner.
  - Do not reconstruct historical permission authority from current Settings or replay-only projection state.
owner_hints:
  - Plans/Permissions_System.md
```

### PS-133 - Case L Denial Scope And Recovery Gate Composition

```yaml
plan_unit_id: PS-133
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: >-
  Permission audit and tool.denied records consume EventRecord 2.0 application
  versus project scope, global event identity, scoped lifetime idempotency, and
  replay-only restrictions. Permission, FileSafe, and storage gates compose by
  intersection: approval cannot widen viewer, blocked, integrity, root, or newer-store
  restrictions; pre-mutation permission denial is restore_refused with permission_denied;
  and permission outcomes never clear recovery holds.
gui_related: true
gui_classification_reason: Denial, disabled-action, approval, viewer, and recovery-state explanations are user-visible permission behavior.
depends_on: [PS-093, PS-097, CV-317, CV-320, SP-239, SP-240]
unblocks: []
acceptance_criteria:
  - Project denials use project scope and application-level denials use null-project application scope without a fake snapshot key.
  - A reader lacking EventRecord 2.0 validation refuses permission-history inspection, and routing consumes the full storage-owned v2 scope, sequence, and event lookup key.
  - dedupe_unavailable remains fail-closed for execution and projector_replay_only cannot alter current permission or scheduler state.
  - Approval cannot enable a mutation prohibited by storage viewer/blocked state, root continuity, integrity, or newer-store rules.
  - Permission denial before path mutation returns restore_refused and permission_denied with zero target mutation.
  - Denial and snapshot refresh preserve existing recovery-anchor refs until an owner terminal release transition.
  - Permission UI exposes no generic storage repair, salvage, force-open, or try-anyway path, and Retry storage cannot auto-resume the denied operation.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future EventRecord denial scope, duplicate denial, viewer bypass, and exact-restore permission fixtures
risk_class: permission_restore_storage_gate_bypass
reasoning_tier: high
context_scope: case_l_permission_denial_and_recovery
implementation_surfaces:
  - Plans/Permissions_System.md
node_compile_hint:
  mode: case_l_permission_denial_recovery_consumer
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Case-L:L-006
  - Case-L:L-010
  - Case-L:L-014
  - Case-L:L-020
  - Case-L:L-021
  - Case-L:L-024
  - Case-L:EVT-01..EVT-07
negative_constraints:
  - Do not report a pre-mutation permission refusal as restore_failed.
  - Do not let permission approval override storage or FileSafe safety gates.
  - Do not let a replay-only denial change current authority.
owner_hints:
  - Plans/Permissions_System.md
```
