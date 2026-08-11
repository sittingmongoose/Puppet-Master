# Shard 016: Case L Durable Goal Recovery Consumer Addendum - 2026-07-17

Source: `Plans/Goal_Runtime_System.md`

Source lines: L4302-L4448

Source SHA256: `19b669a1c0c1e827d0b2cc40fa4c9c138032a10212259096201ba08d070a74f3`

---

## Case L Durable Goal Recovery Consumer Addendum - 2026-07-17

This addendum propagates approved Case L finding `L-003` and the settled cross-owner EventRecord, storage, exact-restore, retention, viewer/root, and permission consequences into Goal Runtime. Authority comes from `PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/CASE_L_APPROVAL_2026-07-17.md`, which approves Bundles A-F without exception. Goal Runtime owns goal lifecycle, recovery posture, and completion truth; it consumes Contracts for EventRecord/restore enums, storage for persistence/recovery/access mode, FileSafe/SCM/Executor for exact-replace and attempt admission, and Permissions for authority. It does not create peer storage algorithms, keys, restore outcomes, permission rules, runtime implementation, WorkNodes, NodeSeeds, executable queues, generated governance artifacts, build tasks, or completeness evidence.

### Canonical goal receipt recovery and false-success prohibition

The materialized `goal_receipt.v1:{project_id}:{receipt_id}` family is canonical non-rebuildable redb authority and uses the approved `restore_from_mandatory_backup` recovery disposition. Append-only goal/goal-run events and disposable `goal_state`, blocked, child, evidence, and run projections remain replay sources for those projections; they are not an alternate completion receipt. Earlier wording that a goal receipt itself is a disposable projection or may be reconstructed from events is superseded for Case L.

Goal Runtime therefore distinguishes these aftermaths without inventing success:

- a validated receipt and continuous canonical event lineage may resume or display its exact recorded lifecycle after normal currentness and authority checks;
- while receipt/canonical-event recovery is in progress or its truth is not yet established, completion and resumability are unknown, no new mutation-capable scheduling begins, and no projection is promoted to receipt authority;
- a projection rebuilt to the current survivor set remains `goal.degraded` when canonical history has a proven or possible gap; its receipt/evidence views carry recovery provenance and residual risk;
- missing, corrupt, quarantined, or unrecoverable canonical goal receipt data remains `goal.blocked` for completion/certification and names the affected receipt/family, storage recovery state, last verified backup boundary, known loss window, last recovery attempt, and next safe action;
- canonical history loss that is unknown or may include mutation-authorizing, approval, safe-point, receipt, verification, or completion events blocks mutation and certification rather than using a degraded receipt as a success substitute.

Restoring a mandatory backup never synthesizes a newer completion. Goal Runtime reloads the restored receipt and event boundary, invalidates projections beyond that boundary, marks post-backup writes as the disclosed loss window, reconciles child/attempt/receipt refs, and reruns revision, authority, evidence, and certification checks before any resume. If the required backup is unavailable, Goal Runtime cannot reconstruct a `GoalCompletionReceipt` from worker claims, UI state, Runtime Artifacts, cached projections, or surviving ordinary goal events.

Goal receipt, completion, degraded, stopped, blocked, recovery, evidence, and certification records retain indefinitely under the storage-owned authority policy. Open blocked/recovery, preserved-run, audit, certification, evidence, legal-hold, and referenced safe-point/restore-transaction anchors compose by union. Goal completion, archive, process exit, model switch, permission refresh, or ordinary age never clears those anchors.

### EventRecord 2.0 scope, idempotency, and replay consumption

Every new canonical `goal.*` and `goal_run.*` event is project-scoped EventRecord `2.0.0` with `scope_kind = project` and a non-empty `project_id`. Goal Runtime never uses an application sentinel. Application-scoped storage/root/lock/recovery events that affect many goals remain `scope_kind = application`, `project_id = null`; Goal Runtime references their event/recovery IDs and proven affected project/goal refs from payload evidence instead of republishing them as fake project events.

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
canonical_text: >-
  goal_receipt is canonical non-rebuildable redb authority recovered from mandatory
  verified backup, while goal-state and goal-run projections remain disposable.
  Missing, corrupt, quarantined, continuity-uncertain, or unrecoverable receipt/event
  authority cannot be reconstructed into success: recovery-in-progress is unknown,
  survivor projections remain degraded with provenance, and completion or
  mutation-authorizing uncertainty remains blocked until verified recovery.
gui_related: true
gui_classification_reason: Unknown, degraded, blocked, recovery provenance, and safe-next-action goal states are user-visible Goal Runtime truth.
depends_on: [GRS-005, GRS-012, GRS-019, SP-235, SP-236, SP-237]
unblocks: []
acceptance_criteria:
  - Per-family corruption/deletion fixtures never reconstruct a GoalCompletionReceipt from events, worker claims, artifacts, or projections.
  - Recovery from a verified backup invalidates post-boundary projections, discloses the loss window, and reruns currentness, authority, evidence, and certification checks.
  - Unknown receipt/event truth schedules no mutation and certifies no completion.
  - A current survivor projection with a canonical gap remains degraded or blocked with integrity and recovery provenance.
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
  Goal Runtime emits project-scoped EventRecord 2.0 goal and goal-run events,
  preserves global event identity and scoped lifetime idempotency, fails closed on
  dedupe_unavailable, and limits replay-only compatibility input to disposable
  projection effects. Scheduler admission additionally requires storage writer and
  continuity truth, resolved exact-restore or recovery-hold state, and current
  permission evidence; viewer, root, integrity, restore-recovery, and permission
  blockers cannot become failure or completion.
gui_related: true
gui_classification_reason: Goal blocked, historical viewer, recovery, permission, and resume states are visible control-plane behavior.
depends_on: [GRS-006, GRS-019, GRS-020, CV-317, CV-318, CV-320, SP-239, SP-240, SP-241, SP-242]
unblocks: []
acceptance_criteria:
  - Goal and GoalRun events validate only with project scope and non-empty project identity; app storage events remain app scoped.
  - A reader lacking EventRecord 2.0 validation refuses Goal-history inspection, and routing consumes the full storage-owned v2 scope, sequence, and event lookup key.
  - Duplicate/idempotency conflicts or dedupe_unavailable append no transition and enable no dependent scheduling or certification.
  - projector_replay_only input changes no canonical receipt, scheduler, permission, child, usage, or external state.
  - Viewer/root/integrity fixtures expose historical or blocked posture and start no goal continuation or writer-capable subsystem.
  - Exact-replace recovery-required or recovery-unavailable fixtures retain fencing, local work, and anchors until an explicit owner terminal action.
  - Permission denial stays blocked with exact payload and a later resume revalidates current permission evidence.
  - Goal recovery exposes no generic storage repair, salvage, force-open, or try-anyway path, and Retry storage cannot auto-resume a blocked goal.
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
  - Case-L:L-006
  - Case-L:L-010
  - Case-L:L-013
  - Case-L:L-014
  - Case-L:L-018
  - Case-L:L-020
  - Case-L:EVT-01..EVT-07
  - Case-L:PD-RSP-01..PD-RSP-09
negative_constraints:
  - Do not use application sentinel project identity for goal events.
  - Do not let viewer promotion, retry, timer, model switch, or child completion clear storage, restore, recovery, or permission blockers.
  - Do not infer completion from UI or Runtime Artifacts projections.
owner_hints:
  - Plans/Goal_Runtime_System.md
```
