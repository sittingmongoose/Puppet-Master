# Shard 028: Case L Durable Goal Recovery Consumer Addendum - 2026-07-17

Source: `Plans/Goal_Runtime_System.md`

Source lines: L5362-L5505

Source SHA256: `e4026ffeb82d2d1d5da6b5b9416b04752e835346314594a6af6cdc1fb9ac2e9a`

---

## Case L Durable Goal Recovery Consumer Addendum - 2026-07-17

This addendum propagates approved Case L finding `L-003` and the settled cross-owner EventRecord, storage, exact-restore, retention, viewer/root, and permission consequences into Goal Runtime. Authority comes from `PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/CASE_L_APPROVAL_2026-07-17.md`, which approves Bundles A-F without exception. Goal Runtime owns goal lifecycle, recovery posture, and completion truth; it consumes Contracts for EventRecord/restore enums, storage for persistence/recovery/access mode, FileSafe/SCM/Executor for exact-replace and attempt admission, and Permissions for authority. It does not create peer storage algorithms, keys, restore outcomes, permission rules, runtime implementation, WorkNodes, NodeSeeds, executable queues, generated governance artifacts, build tasks, or completeness evidence.

### Canonical goal receipt recovery and false-success prohibition

The materialized `goal_receipt.v1:{project_id}:{receipt_id}` family is canonical non-rebuildable redb authority and uses the approved `restore_from_mandatory_backup` recovery disposition. Append-only goal/goal-run events and disposable `goal_state`, blocked, child, evidence, and run projections remain replay sources for those projections; they are not an alternate completion receipt. Earlier wording that a goal receipt itself is a disposable projection or may be reconstructed from events is superseded for Case L.

Goal Runtime therefore distinguishes these aftermaths without inventing success:

- a validated receipt and continuous canonical event lineage may resume or display its exact recorded lifecycle after normal currentness and authority checks;
- while receipt/canonical-event recovery is in progress or its truth is not yet established, completion and resumability are unknown, no new mutation-capable scheduling begins, and no projection is promoted to receipt authority;
- a projection rebuilt to the current survivor set remains degraded in its completeness/health when canonical history has a proven or possible gap; its receipt/evidence views carry recovery provenance and residual risk. This is derived-view quality, not a fifth GoalRecordV2 state or authority to emit `goal.degraded`; GRS-061 preserves the exact event for historical interpretation only;
- missing, corrupt, quarantined, or unrecoverable canonical goal receipt data remains `goal.blocked` for completion/certification and names the affected receipt/family, storage recovery state, last verified backup boundary, known loss window, last recovery attempt, and next safe action;
- canonical history loss that is unknown or may include mutation-authorizing, approval, safe-point, receipt, verification, or completion events blocks mutation and certification rather than using a degraded receipt as a success substitute.

Restoring a mandatory backup never synthesizes a newer completion. Goal Runtime reloads the restored receipt and event boundary, invalidates projections beyond that boundary, marks post-backup writes as the disclosed loss window, reconciles child/attempt/receipt refs, and reruns revision, authority, evidence, and certification checks before any resume. If the required backup is unavailable, Goal Runtime cannot reconstruct a `GoalCompletionReceipt` from worker claims, UI state, Runtime Artifacts, cached projections, or surviving ordinary goal events.

Goal receipt, completion, degraded, stopped, blocked, recovery, evidence, and certification records retain indefinitely under the storage-owned authority policy. Open blocked/recovery, preserved-run, audit, certification, evidence, legal-hold, and referenced safe-point/restore-transaction anchors compose by union. Goal completion, archive, process exit, model switch, permission refresh, or ordinary age never clears those anchors.

### EventRecord 2.0 scope, idempotency, and replay consumption

New canonical Goal events use the explicitly selected original Project or newly versioned live application contract (GRS-043/086). Project means nonempty actual `project_id`; application means `scope_kind=application`, `project_id=null` and real thread/Goal/run/Computer. No application sentinel, empty Project string or focus fallback is permitted. Preserve global event identity, reversible scope/lifetime idempotency, original semantic/hash/producer/custody editions and complete writer/read/backup joins. Root/lock/recovery events remain application-scoped under their own owners and are referenced as evidence, never republished as fake Project events. Historical-only goal.scheduled/goal.degraded/retired child events stay passive; real Project Workflow certification prerequisites remain intact.

Goal history inspection of an EventRecord `2.0.0` root requires a reader that validates `2.0.0`; an unsupported reader refuses the live Goal view with `unsupported_schema_version` rather than projecting partial or best-effort history. Goal event routing consumes the storage-owned key `event_record_index.v2:{scope_partition}:{sequence_id_20}:{event_id}` with the registered reversible project partition. Goal Runtime does not derive this key from the selected project, omit `event_id`, or treat the index as lifecycle/receipt authority.

Goal producers preserve app-root-global `event_id`, lifetime idempotency within `(scope_partition, event_type, idempotency_key)`, and the selected replay policy. A stale/absent dedupe accelerator catches up through the verified seglog tail or the goal append fails `dedupe_unavailable`. In that state Goal Runtime does not expose the intended transition, schedule dependent work, or certify a completion from in-memory state. A legacy value normalized as `projector_replay_only` may rebuild disposable goal projections and atomically advance their checkpoint only; it cannot schedule a turn, mint/update a goal receipt, approve/deny, dispatch a child/WorkNode, charge usage, emit another event, or create completion.

### Storage access, exact-restore, recovery hold, and permission admission

Goal Runtime consumes storage `storage_access_mode = writer | viewer | blocked`, `storage_mode_reason`, `storage_instance_id`, `root_generation`, and redacted continuity/fallback evidence. A compatible viewer may show frozen historical Goal state at one high-water mark, but starts no scheduler, goal continuation, child work, projector/checkpoint writer, receipt writer, provider call, approval action, or other durable/runtime/external mutation. Viewer promotion is never automatic; after storage full revalidation and writer admission, Goal Runtime still reloads canonical state, compares revisions, reconciles interrupted work, verifies receipts/anchors, and obtains current permission evidence before resume. Newer-store metadata diagnostics do not expose live Goal viewer mode. Root mismatch, root unavailable, fallback divergence, or untrustworthy snapshot produces a visible blocked/recovery posture, never an empty/new Goal history.

Goal recovery surfaces do not invent a generic verify, repair, salvage, force-open, or `try_anyway` command. `Retry storage` is only the storage-owned admission probe; it does not repair bytes, reconstruct a receipt, or auto-resume a blocked goal.

Safe-point restore and Chat-revert consequences are consumed exactly. `restored_clean` or `restore_skipped` may satisfy a baseline only with owner equality proof and a durable baseline receipt. `restore_refused` and `restore_failed` do not satisfy the target. `restore_recovery_required` retains the mutation fence and blocked episode. `restored_with_conflicts` is invalid for exact-replace admission. `recovery_unavailable` preserves local work and recovery anchors and permits only explicit abandon, replan, or owner-verified recovery. No goal retry, timer, model switch, viewer promotion, or child result may silently clear that state.

Permission denial and approval-required outcomes remain `goal.blocked`, not failed or complete, and preserve the permission-owned `blocked_family`, `blocked_reason_code`, `permission_snapshot_id?`, approval scope/target refs, ordered `allowed_action_ids[]`, and `executed: false`. A permission approval cannot widen a storage/FileSafe block. A recovered/resumed mutation-capable attempt receives a fresh permission snapshot when policy, project, target, account, runtime identity, storage mode, or prior snapshot currentness changed; historical snapshots remain immutable evidence.

ContractRef: ContractName:Plans/Contracts_V0.md#EventRecord, ContractName:Plans/storage-plan.md#Case-L-durable-state-owner-canon, ContractName:Plans/FileSafe.md#Case-L-Exact-Restore-Repair-Addendum, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/Permissions_System.md

### GRS-042 - Case L Canonical Goal Receipt Recovery Truth

```yaml
plan_unit_id: GRS-042
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: |-
  goal_receipt is canonical non-rebuildable redb authority recovered from mandatory verified backup, while goal-state and goal-run projections remain disposable. Missing, corrupt, quarantined, continuity-uncertain, or unrecoverable receipt/event authority cannot be reconstructed into success: recovery-in-progress is unknown, survivor projections remain degraded with provenance, and completion or mutation-authorizing uncertainty remains blocked until verified recovery.

  Degraded survivor projection means derived-view quality/provenance, not GoalRecordV2.state or an active goal.degraded producer; GRS-061 governs the exact historical event. Existing canonical-loss mutation/completion fences remain unchanged.
gui_related: true
gui_classification_reason: Recovery availability, derived-view quality, provenance and safe-next-action disclosure are user-visible; degraded is not a fifth GoalRecordV2 state.
depends_on: [GRS-005, GRS-012, GRS-019, SP-235, SP-236, SP-237]
unblocks: []
acceptance_criteria:
  - Per-family corruption/deletion fixtures never reconstruct a GoalCompletionReceipt from events, worker claims, artifacts, or projections.
  - Recovery from a verified backup invalidates post-boundary projections, discloses the loss window, and reruns currentness, authority, evidence, and certification checks.
  - Unknown receipt/event truth schedules no mutation and certifies no completion.
  - A current survivor projection with a canonical gap retains degraded projection quality or owner-blocked recovery, with integrity/recovery provenance; this does not add a GoalRecordV2 state or emit goal.degraded.
  - Unavailable mandatory backup leaves completion blocked and names the exact affected family, recovery state, boundary, and next safe action.
  - Goal/receipt/recovery/evidence/certification anchors survive ordinary completion, archive, exit, age, model switch, and permission refresh.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future Case L per-family goal receipt corruption, backup restore, continuity, and false-success fixtures
risk_class: goal_runtime_false_success_after_canonical_loss
reasoning_tier: high
context_scope: case_l_goal_receipt_recovery
implementation_surfaces:
  - Plans/Goal_Runtime_System.md
  - Plans/storage_value_registry.json
node_compile_hint:
  mode: case_l_goal_receipt_recovery_consumer
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Case-L:L-003
  - Case-L:PD-L-01
  - Case-L:PD-L-02
  - Case-L:PD-L-03
  - PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/planning/CONSUMER_PROPAGATION_MAP.md
negative_constraints:
  - Do not treat a canonical goal receipt as a disposable projection.
  - Do not certify completion from surviving projections or ordinary events when receipt authority is missing or uncertain.
owner_hints:
  - Plans/Goal_Runtime_System.md
```

### GRS-043 - Case L Goal Event And Recovery Admission

```yaml
plan_unit_id: GRS-043
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  Goal Runtime emits only explicitly admitted application-or-project Goal event editions. Application
  scope has null Project and real thread/Goal/run/Computer; exact original Project payload/wrapper/hash
  domains stay valid. Preserve global event identity, reversible scope partition, lifetime idempotency,
  dedupe_unavailable refusal and replay-only disposable projection effects. Admission still requires
  current storage writer/continuity, exact-restore/recovery-hold resolution, permission and Stop truth;
  viewer/root/integrity/recovery/permission blockers cannot become failure or completion. GRS-086 selects
  complete app writer/read/backup graphs and GRS-087 controls immutable conversion. goal.scheduled,
  goal.degraded and retired child-state writers remain historical-only; SP-280 passive reads cannot
  dispatch or mutate.
gui_related: true
gui_classification_reason: Goal blocked, historical viewer, recovery, permission, and resume states are visible control-plane behavior.
depends_on: [GRS-006, GRS-019, GRS-020, CV-317, CV-318, CV-320, SP-239, SP-240, SP-241, SP-242]
unblocks: []
acceptance_criteria:
  - "Each live adopted app family joins explicit outer/inner app scope/null Project and actual owner identity; original Project editions remain exact."
  - "Global event identity and scoped lifetime idempotency survive restart; dedupe_unavailable fences."
  - "No historical-only Goal writer, app sentinel, passive-read dispatch or blocker-as-completion is introduced."
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future EventRecord goal scope/dedupe/replay and Goal Runtime storage/restore/permission admission fixtures
risk_class: goal_runtime_replay_or_recovery_admission_bypass
reasoning_tier: high
context_scope: case_l_goal_runtime_admission
implementation_surfaces:
  - Plans/Goal_Runtime_System.md
node_compile_hint:
  mode: case_l_goal_runtime_admission_consumer
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Case-L:L-006"
  - "Case-L:L-010"
  - "Case-L:L-013"
  - "Case-L:L-014"
  - "Case-L:L-018"
  - "Case-L:L-020"
  - "Case-L:EVT-01..EVT-07"
  - "Case-L:PD-RSP-01..PD-RSP-09"
  - "projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#lane-c"
  - "projects-refresh-20261030/pass2/NOPROJECT-PROPOSAL.md#approved-2026-11-03"
  - "Jared, 2026-11-03: Plan mode and scheduled tasks are also available in no project. It's only planning wizard/prd builder/orchestrator that isn't."
negative_constraints:
  - Do not use application sentinel project identity for goal events.
  - Do not let viewer promotion, retry, timer, model switch, or child completion clear storage, restore, recovery, or permission blockers.
  - Do not infer completion from UI or Runtime Artifacts projections.
owner_hints:
  - Plans/Goal_Runtime_System.md
```
