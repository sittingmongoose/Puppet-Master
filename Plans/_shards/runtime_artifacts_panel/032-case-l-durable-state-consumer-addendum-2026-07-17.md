# Shard 032: Case L Durable-State Consumer Addendum - 2026-07-17

Source: `Plans/Runtime_Artifacts_Panel.md`

Source lines: L2025-L2216

Source SHA256: `5dcc95a6d7612a7134741da4fa5e6a32f6c621f3fbb994351902e7460ee7bd51`

---

## Case L Durable-State Consumer Addendum - 2026-07-17

This addendum is the Runtime Artifacts consumer propagation for approved Case L findings `L-013`, `L-022`, and `L-027`. It consumes the owner contracts in `Plans/Contracts_V0.md`, `Plans/storage-plan.md`, `Plans/FileSafe.md`, and `Plans/assistant-chat-design.md`; it does not create a second EventRecord envelope, storage recovery algorithm, restore engine, restore-point lifecycle, retention policy, permission rule, or storage-access state machine. The approved source is `PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/CASE_L_APPROVAL_2026-07-17.md`, including Bundles B, C, D, E, and F. This documentation propagation creates no runtime implementation, WorkNodes, NodeSeeds, executable queues, generated governance artifacts, build tasks, or completeness evidence.

### Canonical-history continuity and projection truth

Every new `runtime_artifact.*` write uses the current EventRecord `2.0.0` envelope. Runtime-artifact events are project-scoped: `scope_kind = project` and `project_id` is the non-empty owning project ID. The panel never invents a default project. Application-scoped `storage.integrity_detected`, `storage.recovery_applied`, and `storage.boot_recovery` records instead carry `scope_kind = application` and `project_id = null`; the panel may show their proven affected project/run/event refs from payload evidence, but must not rewrite their envelope scope.

Read-only artifact/history inspection of an EventRecord `2.0.0` root requires a reader that validates `2.0.0`; an unsupported reader refuses the live panel with `unsupported_schema_version` rather than presenting a partial or best-effort view. Event routing consumes the storage-owned key `event_record_index.v2:{scope_partition}:{sequence_id_20}:{event_id}` where application scope uses `app` and project scope uses the registered reversible project partition. The panel does not reconstruct this key from display project state, omit `event_id`, or treat the lookup index as event authority.

Runtime-artifact producers preserve globally unique `event_id`, the Contracts-owned `(scope_partition, event_type, idempotency_key)` lifetime identity, and the selected `replay_policy`. `dedupe_unavailable` means no persisted artifact append succeeded: the panel may retain explicitly ephemeral view state, but it must not show a durable artifact, receipt, or success row. A compatibility value normalized as `projector_replay_only` may update only the rebuildable artifact projection and its atomic checkpoint; it cannot emit another artifact, execute an open/apply action, dispatch work, create usage, or mutate canonical state.

Canonical-history continuity is separate from projector currentness. The panel consumes owner recovery evidence including `integrity_id`, `recovery_id`, `impact_precision`, proven affected byte/sequence/event ranges, last-good and next-good identities, survivor digest, checkpoint action, projection action, repair provenance, and user-disclosure requirement. The closed panel vocabulary is:

- `projection_freshness = current | refreshing | stale`;
- `projection_health = healthy | degraded | unavailable`.

A projection rebuilt to the current survivor checkpoint may be `projection_freshness = current` while remaining `projection_health = degraded` because canonical history has a proven or possible hole. Unknown, acknowledged, mutation-authorizing, or receipt-authority loss is never rendered `healthy`. `unavailable` applies when the owner cannot establish a trustworthy view. Gap rendering distinguishes unacknowledged tail, exact event, exact byte range, bounded sequence range, and unknown segment remainder, and links the storage recovery/disclosure record. Runtime Artifacts never infers lost identity from timestamps or from its rebuildable index.

### Restore-point projection and exact-restore outcome consumption

`runtime_artifact.restore_point` is a projection of the Assistant Chat-owned immutable conversation restore-point record, not the record itself and not a safe point. Its `type_payload` requires `restore_point_id` as primary identity plus `record_ref`, `record_sha256`, `status`, source `project_id`, `source_thread_id`, `source_branch_id`, `source_message_id`, context/provenance/attachment/citation refs, `retention_policy_ref`, and current hold/reference summaries. `safe_point_id` is optional lineage only and MUST NOT become restore-point identity or silently restore files.

Status is consumed exactly as `available | expired | deleted | corrupt`. An available record may expose the registered branch-from-restore route after permission, current-hash, and storage-writer preflight. Successful application creates a new `thread_id` and `branch_id`, leaves the source thread and source worktree unchanged, does not consume the record, and has no filesystem apply semantics. Expired, deleted, corrupt, stale-hash, permission-denied, viewer, and blocked states remain browsable with their exact unavailable reason and no enabled apply route. Cleanup may expire a regenerable artifact projection, but cannot delete the canonical `rp:{project_id}:{restore_point_id}` record or clear its descendant/application/legal-hold refs.

When Runtime Artifacts displays a FileSafe safe-point or Chat-revert receipt, it consumes the closed owner outcomes without relabeling them: `restored_clean` requires target equality; `restore_skipped` requires pre-existing target equality and no mutation; `restore_refused` is pre-mutation; `restore_failed` requires verified rollback equality; and `restore_recovery_required` retains the mutation fence, worktree/safe-point/transaction holds, and blocked recovery episode. `restored_with_conflicts` is not a valid exact-replace success. A `recovery_unavailable` episode stays blocked and anchored until explicit abandon, replan, or verified recovery.

### Storage root, viewer, and permission-affordance dependency

Artifact browsing consumes storage-owned `storage_instance_id`, `root_generation`, redacted `logical_root_fingerprint`, `storage_access_mode = writer | viewer | blocked`, `storage_mode_reason`, `lock_ownership`, and `snapshot_high_water_ref`. It never uses display path, current project selection, or an index row as root authority.

In compatible lock-conflict viewer mode, Runtime Artifacts is a frozen, manually refreshable read snapshot. It may inspect/copy/export only within FileSafe and permission policy; view-local changes are visibly ephemeral. Apply, restore, retry, delete, retention/hold mutation, settings/history persistence, dispatch, provider calls requiring receipts, and every other durable/runtime/external mutation remain discoverable where useful but disabled with `storage_read_only`. Permission approval cannot widen this storage gate. Promotion is never automatic and the panel only reflects the storage-owned full-revalidation result. A newer-format store exposes metadata-only compatibility diagnostics, not the Runtime Artifacts viewer. `root_mismatch`, `root_unavailable`, `fallback_diverged`, or inability to prove a coherent snapshot yields the owner viewer/blocked posture and never an apparently empty artifact list.

Runtime Artifacts diagnostics do not create a generic verify, repair, salvage, force-open, or `try_anyway` action. `Retry storage` is an owner admission probe only; it neither repairs bytes nor automatically resumes a blocked artifact action.

Permission-denied artifact actions consume the permission-owned blocked payload (`blocked_family`, `blocked_reason_code`, ordered `allowed_action_ids[]`, `permission_snapshot_id?`, `approval_scope_key?`, `executed: false`) and do not collapse denial, approval required, storage read-only, integrity block, or preflight drift into generic failure.

ContractRef: ContractName:Plans/Contracts_V0.md#EventRecord, ContractName:Plans/storage-plan.md#Case-L-durable-state-owner-canon, ContractName:Plans/FileSafe.md#Case-L-Exact-Restore-Repair-Addendum, ContractName:Plans/Permissions_System.md, ContractName:Plans/assistant-chat-design.md

### RAP-045 - Case L Canonical History And Projection Trust Consumer

```yaml
plan_unit_id: RAP-045
unit_type: requirement
status: accepted
owner_doc: Plans/Runtime_Artifacts_Panel.md
canonical_text: >-
  Runtime Artifacts consumes EventRecord 2.0 scope, identity, idempotency, replay,
  and storage recovery evidence while keeping projection_freshness current,
  refreshing, or stale separate from projection_health healthy, degraded, or
  unavailable. Canonical-history holes, affected ranges, survivor/rebuild state,
  and repair provenance remain visible even when a survivor projection is current;
  dedupe-unavailable or replay-only input never fabricates a durable artifact.
gui_related: true
gui_classification_reason: The unit defines visible artifact trust, continuity-gap, and recovery-provenance rendering.
depends_on: [RAP-020, RAP-026, CV-317, CV-318, SP-236]
unblocks: []
acceptance_criteria:
  - Runtime-artifact writes use project-scoped EventRecord 2.0 without fake project identity.
  - Application-scoped storage recovery records remain application scoped while proven affected refs remain inspectable.
  - A reader lacking EventRecord 2.0 validation refuses the panel, and artifact event routing consumes the full storage-owned v2 scope, sequence, and event lookup key.
  - A current survivor projection with a canonical-history hole remains degraded or unavailable, never healthy.
  - dedupe_unavailable creates no persisted artifact success and projector_replay_only creates no canonical or external side effect.
  - Gap fixtures render exact event, exact byte range, bounded sequence range, and unknown remainder distinctly with recovery provenance.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future Case L Runtime Artifacts continuity and EventRecord fixture suite
risk_class: runtime_artifact_false_continuity
reasoning_tier: high
context_scope: case_l_runtime_artifact_continuity
implementation_surfaces:
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/runtime_artifact_envelope.schema.json
node_compile_hint:
  mode: case_l_runtime_artifact_continuity_consumer
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Case-L:L-013
  - Case-L:L-027
  - Case-L:EVT-01..EVT-07
  - Case-L:SEG-D-013..SEG-D-016
  - PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/planning/CONSUMER_PROPAGATION_MAP.md
negative_constraints:
  - Do not collapse projection freshness and health.
  - Do not label rebuilt projections healthy when canonical continuity is missing.
  - Do not infer lost identities from timestamps or artifact-index rows.
owner_hints:
  - Plans/Runtime_Artifacts_Panel.md
```

### RAP-046 - Case L Restore Point And Exact Restore Projection

```yaml
plan_unit_id: RAP-046
unit_type: requirement
status: accepted
owner_doc: Plans/Runtime_Artifacts_Panel.md
canonical_text: >-
  runtime_artifact.restore_point projects the immutable Assistant Chat restore-point
  record by restore_point_id, record hash, source conversation boundary, provenance,
  retention, and available, expired, deleted, or corrupt status. An optional
  safe_point_id is lineage only. Branch-from-restore creates a new thread and branch
  without mutating the source thread/worktree, while FileSafe exact-replace receipts
  preserve their owner-defined equality, refusal, rollback, and recovery-required truth.
gui_related: true
gui_classification_reason: Restore-point browsing, disabled states, branching, and restore receipt truth are visible panel behavior.
depends_on: [RAP-004, CV-320, SP-242]
unblocks: []
acceptance_criteria:
  - Restore-point rows route by restore_point_id and never use safe_point_id as primary identity.
  - Available create-to-branch fixtures produce a new thread and branch while leaving source conversation and worktree unchanged.
  - Expired, deleted, corrupt, stale-hash, permission-denied, viewer, and blocked fixtures expose no enabled apply route.
  - restored_clean and restore_failed render only with target-equality and rollback-equality proof respectively.
  - restore_recovery_required and recovery_unavailable remain visibly fenced and held.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future RSP-RP-001 through RSP-RP-004 artifact projection fixtures
  - future RSP-ATOMIC-001 through RSP-ATOMIC-003 receipt rendering fixtures
risk_class: runtime_artifact_restore_identity_drift
reasoning_tier: high
context_scope: case_l_restore_point_projection
implementation_surfaces:
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/runtime_artifact_restore_point.schema.json
node_compile_hint:
  mode: case_l_restore_point_projection_consumer
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Case-L:L-006
  - Case-L:L-010
  - Case-L:L-021
  - Case-L:L-022
  - Case-L:L-024
  - Case-L:PD-RSP-01..PD-RSP-09
negative_constraints:
  - Do not collapse restore points into safe points or runtime artifacts into lifecycle authority.
  - Do not claim original state preservation without owner equality proof.
owner_hints:
  - Plans/Runtime_Artifacts_Panel.md
```

### RAP-047 - Case L Storage Access And Blocked Action Affordances

```yaml
plan_unit_id: RAP-047
unit_type: requirement
status: accepted
owner_doc: Plans/Runtime_Artifacts_Panel.md
canonical_text: >-
  Runtime Artifacts consumes storage root identity and writer, viewer, or blocked
  access state. Compatible viewer mode is a frozen manually refreshed snapshot;
  durable, runtime, and external mutations are disabled with storage_read_only,
  permission approval cannot widen the gate, newer stores expose diagnostics rather
  than a live panel, and root mismatch or fallback divergence never appears as an
  empty artifact list. Permission denial remains a typed non-executed blocked result.
gui_related: true
gui_classification_reason: Storage viewer banners, refresh, disabled actions, root mismatch, and denial states are user-visible affordances.
depends_on: [RAP-026, SP-239, SP-240]
unblocks: []
acceptance_criteria:
  - Viewer fixtures start no writer-capable component and classify every mutating panel action as storage_read_only.
  - Manual refresh recaptures one owner high-water snapshot without projector or checkpoint writes.
  - Permission approval cannot enable an action prohibited by viewer or blocked storage state.
  - Newer-store and root-continuity fixtures show diagnostics or blocked state rather than live or empty artifact content.
  - Diagnostics expose no generic repair, salvage, force-open, or try-anyway path, and Retry storage cannot auto-resume an artifact action.
  - Permission denial preserves blocked family, reason, ordered action IDs, snapshot ref when present, and executed false.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future Case L storage lock, viewer, root continuity, and direct-handler fixtures
risk_class: runtime_artifact_viewer_mutation_leak
reasoning_tier: high
context_scope: case_l_runtime_artifact_storage_access
implementation_surfaces:
  - Plans/Runtime_Artifacts_Panel.md
node_compile_hint:
  mode: case_l_runtime_artifact_storage_access_consumer
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Case-L:L-011
  - Case-L:L-012
  - Case-L:L-014
  - Case-L:L-018
  - Case-L:L011-C1..L018-C3
negative_constraints:
  - Do not make display path, current project selection, or the rebuildable index storage-root authority.
  - Do not auto-promote a viewer or expose Runtime Artifacts for an unsupported newer store.
owner_hints:
  - Plans/Runtime_Artifacts_Panel.md
```
